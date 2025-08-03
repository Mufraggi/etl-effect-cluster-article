import { Workflow } from "@effect/workflow"
import { PokemonRawRepository, PokemonRepository } from "@template/database"
import { Effect, Option, pipe, Schema } from "effect"

export class TransformPokemonRawError extends Schema.TaggedError<TransformPokemonRawError>(
  "TransformPokemonRawError"
)("TransformPokemonRawError", {
  message: Schema.String
}) {}

const TransformPokemonRawWorkFlow = Workflow.make({
  name: "TransformPokemonRawWorkFlow",
  success: Schema.Void,
  error: TransformPokemonRawError,
  payload: {
    idRaw: Schema.String
  },
  idempotencyKey: ({ idRaw }) => idRaw
})

const makeTransformPokemonRawWorkflowLogic = ({ idRaw }: { idRaw: string }) =>
  Effect.gen(function*() {
    const service = yield* TransformPokemonRawService
    yield* service.run({ idRaw })
  })

export class TransformPokemonRawService extends Effect.Service<TransformPokemonRawService>()(
  "TransformPokemonRawService",
  {
    effect: Effect.gen(function*() {
      const repo = yield* PokemonRawRepository.PokemonRawRepository
      const pokemonRepo = yield* PokemonRepository.PokemonRepository

      return {
        run: ({ idRaw }: { idRaw: string }) =>
          Effect.gen(function*() {
            yield* pipe(
              repo.findById(idRaw),
              Effect.flatMap(Option.match({
                onNone: () => Effect.fail(new TransformPokemonRawError({ message: "poke id not found" })),
                onSome: (p) => Effect.succeed(p)
              })),
              Effect.flatMap(({ content }) =>
                pokemonRepo.insert({
                  idApiStep: idRaw,
                  pokedexId: content.pokedex_id,
                  generation: content.generation,
                  category: content.category,
                  nameFr: content.name.fr,
                  spriteRegular: content.sprites.regular,
                  spriteShiny: content.sprites.shiny,
                  hp: content.stats.hp,
                  atk: content.stats.atk,
                  def: content.stats.def,
                  spe_atk: content.stats.spe_atk,
                  spe_def: content.stats.spe_def,
                  vit: content.stats.vit
                })
              ),
              Effect.flatMap((res) => Effect.logInfo(`pokemon ${res.pokedexId} inserted`)),
              Effect.map(() => Effect.void)
            )
          }).pipe(
            Effect.catchAll((e) => Effect.fail(new TransformPokemonRawError({ message: e.message })))
          )
      }
    }),
    dependencies: [
      PokemonRawRepository.PokemonRawRepository.Default,
      PokemonRepository.PokemonRepository.Default
    ]
  }
) {}

export { makeTransformPokemonRawWorkflowLogic, TransformPokemonRawWorkFlow }
