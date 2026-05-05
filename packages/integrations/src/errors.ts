import { Schema } from "effect";

export class IntegrationError extends Schema.TaggedErrorClass<IntegrationError>()(
  "integrations/IntegrationError",
  {}
) {}
