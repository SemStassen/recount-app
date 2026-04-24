import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { DataResidencyRegion } from "@recount/core/shared/data-residency";
import { Config, Duration, Effect, Layer } from "effect";

import { ObjectStorage, ObjectStorageError } from "./object-storage.service";

interface RegionalStorageLocation {
  readonly client: S3Client;
  readonly uploadsBucket: string;
  readonly assetBaseUrl: string;
}

type RegionalStorageMap = Record<
  typeof DataResidencyRegion.schema.Type,
  RegionalStorageLocation
>;

const objectStorageConfig = Config.all({
  accessKeyId: Config.string("R2_ACCESS_KEY_ID"),
  secretAccessKey: Config.string("R2_SECRET_ACCESS_KEY"),
  globalApiEndpoint: Config.string("R2_GLOBAL_API_ENDPOINT"),
  euApiEndpoint: Config.string("R2_EU_API_ENDPOINT"),
  globalUploadsBucket: Config.string("R2_GLOBAL_UPLOADS_BUCKET"),
  euUploadsBucket: Config.string("R2_EU_UPLOADS_BUCKET"),
  globalAssetBaseUrl: Config.string("R2_GLOBAL_ASSET_BASE_URL"),
  euAssetBaseUrl: Config.string("R2_EU_ASSET_BASE_URL"),
});

const createS3Client = (params: {
  readonly endpoint: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
}): S3Client =>
  new S3Client({
    region: "auto", // R2 is a global service, so we can use "auto" region
    endpoint: params.endpoint,
    credentials: {
      accessKeyId: params.accessKeyId,
      secretAccessKey: params.secretAccessKey,
    },
  });

export const ObjectStorageR2Layer = Layer.effect(
  ObjectStorage,
  Effect.gen(function* () {
    const config = yield* objectStorageConfig;

    const regionalStorageLocations: RegionalStorageMap = {
      global: {
        client: createS3Client({
          endpoint: config.globalApiEndpoint,
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        }),
        uploadsBucket: config.globalUploadsBucket,
        assetBaseUrl: config.globalAssetBaseUrl,
      },
      eu: {
        client: createS3Client({
          endpoint: config.euApiEndpoint,
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        }),
        uploadsBucket: config.euUploadsBucket,
        assetBaseUrl: config.euAssetBaseUrl,
      },
    };

    const resolveRegionalStorageLocation = (region: DataResidencyRegion) =>
      Effect.gen(function* () {
        switch (region) {
          case "eu":
            return regionalStorageLocations.eu;
          case "global":
            return regionalStorageLocations.global;
          default:
            return yield* new ObjectStorageError({
              cause: `Invalid region: ${region}`,
            });
        }
      });

    return {
      createPresignedUpload: Effect.fn("object-storage.createPresignedUpload")(
        function* (params) {
          const storageLocation = yield* resolveRegionalStorageLocation(
            params.region
          );

          const putUrl = yield* Effect.tryPromise({
            try: () =>
              getSignedUrl(
                storageLocation.client,
                new PutObjectCommand({
                  Bucket: storageLocation.uploadsBucket,
                  Key: params.key,
                  ContentType: params.contentType,
                }),
                {
                  expiresIn: Duration.toSeconds(Duration.minutes(15)),
                }
              ),
            catch: (error) =>
              new ObjectStorageError({
                cause: error,
              }),
          });

          const assetUrl = new URL(
            params.key,
            storageLocation.assetBaseUrl
          ).toString();

          return {
            uploadUrl: putUrl,
            assetUrl: assetUrl,
          };
        }
      ),
      deleteObject: Effect.fn("object-storage.deleteObject")(
        function* (params) {
          const storageLocation = yield* resolveRegionalStorageLocation(
            params.region
          );

          yield* Effect.tryPromise({
            try: () =>
              storageLocation.client.send(
                new DeleteObjectCommand({
                  Bucket: storageLocation.uploadsBucket,
                  Key: params.key,
                })
              ),
            catch: (error) =>
              new ObjectStorageError({
                cause: error,
              }),
          });
        }
      ),
    };
  })
);
