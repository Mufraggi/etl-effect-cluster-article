import { Model } from "@effect/sql"

import { Schema } from "effect"

import { UUID } from "effect/Schema"
import { Timestamp } from "./PokemonRawModel.js"

export class PokemonModel extends Model.Class<PokemonModel>("PokemonModel")({
  id: Model.Generated(UUID),
  idApiStep: Schema.UUID,
  pokedexId: Schema.Number,
  generation: Schema.Number,
  category: Schema.String,
  nameFr: Schema.String,
  spriteRegular: Schema.String,
  spriteShiny: Schema.String,
  hp: Schema.Number,
  atk: Schema.Number,
  def: Schema.Number,
  spe_atk: Schema.Number,
  spe_def: Schema.Number,
  vit: Schema.Number,
  createdAt: Model.Generated(Timestamp),
  updatedAt: Model.Generated(Timestamp)
}) {}
