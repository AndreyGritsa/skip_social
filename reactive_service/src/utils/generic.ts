import type { Mapper, NonEmptyIterator, Json } from "skip-wasm";

export type CustomJson = Json & { created_at: string };

export class GenericSortedMapper<K extends Json, V extends CustomJson>
  implements Mapper<K, V, K, V>
{
  mapEntry(key: K, values: NonEmptyIterator<V>): Iterable<[K, V]> {
    const sorted = values.toArray().sort((a, b) => {
      if (!a.created_at || !b.created_at) new Error("created_at is missing");

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
    return sorted.map((elem) => [key, elem]);
  }
}
