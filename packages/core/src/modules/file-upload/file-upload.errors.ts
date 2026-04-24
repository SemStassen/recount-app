import { Schema } from "effect";

export class UnsupportedFileUploadContentTypeError extends Schema.TaggedErrorClass<UnsupportedFileUploadContentTypeError>()(
  "file-upload/UnsupportedFileUploadContentTypeError",
  {
    contentType: Schema.String,
    allowedContentTypes: Schema.Array(Schema.String),
  }
) {}

export class FileUploadTooLargeError extends Schema.TaggedErrorClass<FileUploadTooLargeError>()(
  "file-upload/FileUploadTooLargeError",
  {
    size: Schema.Number,
    maxSize: Schema.Number,
  }
) {}
