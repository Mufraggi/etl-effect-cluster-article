import { SqlSchema } from "@effect/sql"
import { PgClient } from "@effect/sql-pg"
import { PokemonApiResponse } from "@template/domain"
import { Effect, Option, pipe, Schema } from "effect"
import { PgLive } from "./Sql.js"

export class PokemonRawRepository extends Effect.Service<PokemonRawRepository>()("PokemonRawRepository", {
  effect: Effect.gen(function*() {
    const sql = yield* PgClient.PgClient

    const pokemonInsertSchema = SqlSchema.single({
      Request: Schema.Struct({ content: PokemonApiResponse.PokemonSchema }),
      Result: Schema.Struct({ id: Schema.UUID }),
      execute: ({ content: contentInsert }) => {
        // Serialize manually to JSON string
        const serialized = JSON.stringify(contentInsert)

        return sql`INSERT INTO pokemon_raw (content)
                           VALUES (${serialized}::jsonb)
                           RETURNING id`
      }
    })

    const insertPokemonRaw = (content: PokemonApiResponse.PokemonSchema) =>
      pipe(
        pokemonInsertSchema({ content }),
        Effect.orDie,
        Effect.withSpan("pokemonRepo.insertRaw")
      )

    const findByIdSchema = SqlSchema.findOne({
      Request: Schema.UUID,
      Result: Schema.Struct({
        id: Schema.UUID,
        content: Schema.String
      }),
      execute: (id) =>
        sql`select id, content::jsonb as content
                                 from pokemon_raw
                                 where id = ${id}`
    })
    const findByIdPokemonRaw = (id: string) =>
      pipe(
        findByIdSchema(id),
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.succeed(Option.none()),
            onSome: (rawPokemon) =>
              pipe(
                Effect.try({
                  try: () => JSON.parse(rawPokemon.content),
                  catch: (e) => new Error("Failed to parse JSON content: " + String(e))
                }),
                Effect.flatMap((parsedContent) =>
                  Schema.decodeUnknown(PokemonApiResponse.PokemonSchema)(parsedContent)
                ),
                Effect.map((validatedContent) =>
                  Option.some({
                    id: rawPokemon.id,
                    content: validatedContent
                  })
                )
              )
          })
        ),
        Effect.orDie,
        Effect.withSpan("pokemonRepo.findByID")
      )
    return {
      findById: findByIdPokemonRaw,
      insertPokemonRaw
    }
  }),
  dependencies: [PgLive]
}) {
}
