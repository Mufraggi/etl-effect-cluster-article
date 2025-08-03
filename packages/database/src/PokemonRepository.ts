import { Model } from "@effect/sql"

import { Effect } from "effect"
import { PokemonModel } from "./pokemonModel.js"
import { PgLive } from "./Sql.js"

export class PokemonRepository extends Effect.Service<PokemonRepository>()("PokemonRepository", {
  effect: Effect.gen(function*() {
    const repoPokemon = yield* Model.makeRepository(PokemonModel, {
      tableName: "pokemon",
      spanPrefix: "pokemonRepo",
      idColumn: "id"
    })

    return {
      ...repoPokemon
    }
  }),
  dependencies: [PgLive]
}) {
}
