import type { Collection } from "@tanstack/react-db";

export type ClientRepositoryCollection<
  Row extends { readonly id: string | number },
> = Collection<Row, string | number, any, any, any>;

export function updateCollectionItem<
  Row extends { readonly id: string | number },
>(
  collection: ClientRepositoryCollection<Row>,
  id: Row["id"],
  update: Partial<Row>
) {
  collection.update(id, (draftValue) => {
    Object.assign(draftValue as object, update);
  });
}

export function deleteCollectionItems<
  Row extends { readonly id: string | number },
>(
  collection: ClientRepositoryCollection<Row>,
  ids: ReadonlyArray<Row["id"]>
) {
  collection.delete([...ids]);
}
