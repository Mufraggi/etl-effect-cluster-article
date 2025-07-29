import { FetchHttpClient, HttpClient } from "@effect/platform"
import { Workflow } from "@effect/workflow"
import { PokemonRawRepository } from "@template/database"
import { PokemonApiResponse } from "@template/domain"
import { Effect, pipe, Schema } from "effect"

class CallApiPokemonError extends Schema.TaggedError<CallApiPokemonError>(
  "CallApiPokemonError"
)("CallApiPokemonError", {
  message: Schema.String
}) {}

const CallPokemonApiWorkFlow = Workflow.make({
  name: "CallPokemonApiWorkFlow",
  success: Schema.Void,
  error: CallApiPokemonError,
  payload: {
    id: Schema.String,
    pokemonId: Schema.Int
  },
  idempotencyKey: ({ id }) => id
})

const makeCallPokemonApiWorkflowLogic = ({ id, pokemonId }: { id: string; pokemonId: number }) =>
  Effect.gen(function*() {
    const service = yield* CallPokemonApiService
    yield* service.run({ id, pokemonId })
  })

export class CallPokemonApiService extends Effect.Service<CallPokemonApiService>()(
  "CallPokemonApiService",
  {
    effect: Effect.gen(function*() {
      const repo = yield* PokemonRawRepository.PokemonRawRepository
      const httpClient = yield* HttpClient.HttpClient

      return {
        run: ({ id, pokemonId }: { id: string; pokemonId: number }) =>
          Effect.gen(function*() {
            const response = yield* httpClient.get(`https://tyradex.vercel.app/api/v1/pokemon/${pokemonId}`)
            const jsonData = yield* response.json
            const pokemon = yield* Schema.decodeUnknown(PokemonApiResponse.PokemonSchema)(jsonData)
            yield* Effect.logDebug(pokemon)

            console.log(pokemon)

            const pokeId = yield* pipe(
              repo.insertPokemonRaw(pokemon),
              Effect.orDie,
              Effect.tapError((e) => Effect.logError(`❌ Insert error: ${e}`))
            )
            console.log(pokeId)
            yield* pipe(
              repo.findById(pokeId.id),
              Effect.tap((e) => console.log(e)),
              Effect.tapError((e) => console.log(e))
            )
          }).pipe(
            Effect.catchAll((e) => Effect.fail(new CallApiPokemonError({ message: e.message })))
          )
      }
    }),
    dependencies: [PokemonRawRepository.PokemonRawRepository.Default, FetchHttpClient.layer]
  }
) {}

export { CallPokemonApiWorkFlow, makeCallPokemonApiWorkflowLogic }
