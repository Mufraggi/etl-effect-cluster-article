import { HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform"
import { PokemonModel } from "@template/database/pokemonModel"
import { PokemonRepository } from "@template/database/PokemonRepository"
import { CallApiPokemon } from "@template/workflow"
import { Effect, Layer, Option, pipe, Schema } from "effect"
import type { ApiType } from "../Api.js"

export class PokemonNotFound extends Schema.TaggedError<PokemonNotFound>()(
  "PokemonNotFound",
  { id: Schema.String },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class HttpApiGroupPokemon extends HttpApiGroup.make("@Group/Pokemon")
  .add(
    HttpApiEndpoint.post("syncPokemonById", "/:id")
      .setPath(Schema.Struct({
        id: pipe(
          Schema.NumberFromString, // parse string → number
          Schema.int()
        )
      }))
      .addSuccess(Schema.Struct({
        id: pipe(
          Schema.NumberFromString,
          Schema.int()
        )
      }))
  )
  .add(
    HttpApiEndpoint.get("getPokemonById", "/:id")
      .setPath(Schema.Struct({
        id: Schema.UUID
      }))
      .addSuccess(PokemonModel)
      .addError(PokemonNotFound)
  )
  .prefix("/pokemon")
{
}

export const HttpApiGroupPokemonLive = (api: ApiType) =>
  HttpApiBuilder.group(
    api,
    "@Group/Pokemon",
    (handlers) =>
      Effect.gen(function*() {
        yield* Effect.log("aa")
        const repo = yield* PokemonRepository

        return handlers
          .handle("syncPokemonById", ({ path }) =>
            pipe(
              CallApiPokemon.CallPokemonApiWorkFlow.execute(
                { id: new Date().toString(), pokemonId: path.id },
                {
                  discard: true
                }
              ),
              Effect.flatMap(() => Effect.succeed({ id: path.id }))
            ))
          .handle("getPokemonById", ({ path }) =>
            repo.findById(path.id)
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () => Effect.fail(new PokemonNotFound({ id: path.id })),
                    onSome: (p) => Effect.succeed(p)
                  })
                )
              ))
      })
  ).pipe(Layer.provide(PokemonRepository.Default))
