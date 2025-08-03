import { Schema } from "effect"

export type PokemonSchema = typeof PokemonSchema.Type
export const PokemonSchema = Schema.Struct({
  pokedex_id: Schema.Number,
  generation: Schema.Number,
  category: Schema.String,
  name: Schema.Struct({
    fr: Schema.String,

    en: Schema.String,
    jp: Schema.String
  }),
  sprites: Schema.Struct({
    regular: Schema.String,
    shiny: Schema.String,
    gmax: Schema.NullOr(Schema.String)
  }),
  types: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      image: Schema.String
    })
  ),
  talents: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      tc: Schema.Boolean
    })
  ),
  stats: Schema.Struct({
    hp: Schema.Number,
    atk: Schema.Number,
    def: Schema.Number,
    spe_atk: Schema.Number,
    spe_def: Schema.Number,
    vit: Schema.Number
  }),
  resistances: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      multiplier: Schema.Number
    })
  ),
  evolution: Schema.Struct({
    pre: Schema.NullOr(Schema.Unknown), // null ou autre objet inconnu
    next: Schema.Array(
      Schema.Struct({
        pokedex_id: Schema.Number,
        name: Schema.String,
        condition: Schema.String
      })
    ),
    mega: Schema.NullOr(Schema.Unknown)
  }),
  height: Schema.String,
  weight: Schema.String,
  egg_groups: Schema.Array(Schema.String),
  sexe: Schema.Struct({
    male: Schema.Number,
    female: Schema.Number
  }),
  catch_rate: Schema.Number,
  level_100: Schema.Number,
  formes: Schema.NullOr(Schema.Unknown)
})
