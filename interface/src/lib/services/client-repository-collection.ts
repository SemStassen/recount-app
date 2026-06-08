import type { Collection } from "@tanstack/react-db";

export type ClientRepositoryCollection<
  Row extends { readonly id: string | number },
  InsertInput extends object = Row,
> = Pick<
  Collection<any, string | number, Record<string, any>, any, any>,
  "delete" | "get" | "update" | "values"
> & {
  readonly __insertInput?: InsertInput;
  readonly __row?: Row;
  readonly insert: (data: InsertInput | Array<InsertInput>) => unknown;
};

export type ClientRepositoryPatch<
  Row extends { readonly id: string | number },
> = Partial<Omit<Row, "$collectionId" | "$key" | "$origin" | "$synced">>;

export function toQueryableCollection<
  Row extends { readonly id: string | number },
  InsertInput extends object = Row,
>(collection: ClientRepositoryCollection<Row, InsertInput>) {
  return collection as Collection<
    Row,
    string | number,
    Record<string, any>,
    any,
    InsertInput
  >;
}

export function updateCollectionItem<
  Row extends { readonly id: string | number },
  InsertInput extends object = Row,
>(
  collection: ClientRepositoryCollection<Row, InsertInput>,
  id: Row["id"],
  update: ClientRepositoryPatch<Row>
) {
  collection.update(id, (draftValue) => {
    Object.assign(draftValue as object, update);
  });
}

export function deleteCollectionItems<
  Row extends { readonly id: string | number },
  InsertInput extends object = Row,
>(
  collection: ClientRepositoryCollection<Row, InsertInput>,
  ids: ReadonlyArray<Row["id"]>
) {
  collection.delete([...ids]);
}
