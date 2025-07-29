import { Model, SqlSchema } from "@effect/sql"
import { PgClient } from "@effect/sql-pg"
import { PokemonApiResponse } from "@template/domain"
import { Effect, pipe, Schema } from "effect"
import { PokemonRawModel } from "./PokemonRawModel.js"
import { PgLive } from "./Sql.js"

export class PokemonRawRepository extends Effect.Service<PokemonRawRepository>()("PokemonRawRepository", {
  effect: Effect.gen(function*() {
    const sql = yield* PgClient.PgClient

    const repo = yield* Model.makeRepository(PokemonRawModel, {
      tableName: "pokemon_raw",
      spanPrefix: "pokemon_rawRepo",
      idColumn: "id"
    })
    const pokemonInsertSchema = SqlSchema.single({
      Request: Schema.Struct({ content: PokemonApiResponse.PokemonSchema }),
      Result: Schema.Struct({ id: Schema.UUID }),
      execute: ({ content: contentInsert }) => {
        // Serialize manually to JSON string
        const serialized = JSON.stringify(contentInsert)

        return sql`INSERT INTO pokemon_raw (content) VALUES (${serialized}::jsonb) RETURNING id`
      }
    })

    const insertPokemonRaw = (content: PokemonApiResponse.PokemonSchema) =>
      pipe(
        pokemonInsertSchema({ content }),
        Effect.tapError((e) => console.log(e)),
        Effect.withSpan("pokemonRepo.insertRaw")
      )
    return {
      findById: repo.findById,
      insertPokemonRaw
    }
  }),
  dependencies: [PgLive]
}) {
}
