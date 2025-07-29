import { HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { CallApiPokemon } from "@template/workflow"
import { Effect, pipe, Schema } from "effect"
import type { ApiType } from "../Api.js"

export class HttpApiGroupPokemon extends HttpApiGroup.make("@Group/Pokemon")
  .add(
    HttpApiEndpoint.get("syncPokemonById", "/:id")
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
              // Effect.catchTag("CallApiPokemonError", () => Effect.die({}))
            ))
      })
  )
