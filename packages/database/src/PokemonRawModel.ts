import { Model } from "@effect/sql"
import { Schema } from "effect"
import { UUID } from "effect/Schema"

import { PokemonApiResponse } from "@template/domain"

export const Timestamp = Schema.Date

export class PokemonRawModel extends Model.Class<PokemonRawModel>("PokemonRawModel")({
  id: Model.Generated(UUID),
  content: PokemonApiResponse.PokemonSchema,
  createdAt: Model.Generated(Timestamp),
  updatedAt: Model.Generated(Timestamp)
}) {}
