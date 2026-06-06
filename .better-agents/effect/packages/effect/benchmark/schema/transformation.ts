import { Schema, SchemaTransformation } from "effect";
import { Bench } from "tinybench";
import { z } from "zod";

/*
┌─────────┬─────────────────┬──────────────────┬───────────────────┬────────────────────────┬────────────────────────┬─────────┐
│ (index) │ Task name       │ Latency avg (ns) │ Latency med (ns)  │ Throughput avg (ops/s) │ Throughput med (ops/s) │ Samples │
├─────────┼─────────────────┼──────────────────┼───────────────────┼────────────────────────┼────────────────────────┼─────────┤
│ 0       │ 'Schema (good)' │ '1097.8 ± 1.12%' │ '1042.0 ± 1.00'   │ '949296 ± 0.01%'       │ '959693 ± 922'         │ 910953  │
│ 1       │ 'Zod (good)'    │ '267.92 ± 4.46%' │ '208.00 ± 0.00'   │ '4505289 ± 0.02%'      │ '4807692 ± 0'          │ 3732515 │
│ 2       │ 'Schema (bad)'  │ '683.49 ± 1.54%' │ '625.00 ± 0.00'   │ '1593775 ± 0.01%'      │ '1600000 ± 0'          │ 1463090 │
│ 3       │ 'Zod (bad)'     │ '8172.9 ± 4.43%' │ '6417.0 ± 125.00' │ '152563 ± 0.07%'       │ '155836 ± 3096'        │ 122357  │
└─────────┴─────────────────┴──────────────────┴───────────────────┴────────────────────────┴────────────────────────┴─────────┘
*/

const bench = new Bench();

const schema = Schema.Struct({
  a: Schema.String,
  id: Schema.String,
  c: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
  d: Schema.String,
}).pipe(
  Schema.decodeTo(
    Schema.Struct({
      a: Schema.String,
      b: Schema.Struct({ id: Schema.String }),
      c: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0)),
      d: Schema.String,
    }),
    SchemaTransformation.transform({
      decode: ({ id, ...v }) => ({ ...v, b: { id } }),
      encode: ({ b: { id }, ...v }) => ({ ...v, id }),
    })
  )
);

const zod = z.codec(
  z.object({
    a: z.string(),
    id: z.string(),
    c: z.number().check(z.nonnegative()),
    d: z.string(),
  }),
  z.object({
    a: z.string(),
    b: z.object({ id: z.string() }),
    c: z.number().check(z.nonnegative()),
    d: z.string(),
  }),
  {
    decode: ({ id, ...v }) => ({ ...v, b: { id } }),
    encode: ({ b: { id }, ...v }) => ({ ...v, id }),
  }
);

const good = {
  a: "a",
  id: "id",
  c: 1,
  d: "d",
};
const bad = {
  a: "a",
  id: "id",
  c: -1,
  d: "d",
};

const decodeUnknownExit = Schema.decodeUnknownExit(schema);

// console.log(decodeUnknownExit(good))
// console.log(String(decodeUnknownExit(bad)))
// console.log(zod.safeDecode(good))
// console.log(zod.safeDecode(bad))

bench
  .add("Schema (good)", function () {
    decodeUnknownExit(good);
  })
  .add("Zod (good)", function () {
    zod.safeDecode(good);
  })
  .add("Schema (bad)", function () {
    decodeUnknownExit(bad);
  })
  .add("Zod (bad)", function () {
    zod.safeDecode(bad);
  });

await bench.run();

console.table(bench.table());
