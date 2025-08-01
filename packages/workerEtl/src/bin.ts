import { ClusterWorkflowEngine } from "@effect/cluster"
import { NodeClusterRunnerSocket, NodeRuntime } from "@effect/platform-node"
import { Sql } from "@template/database"

import {
  CallPokemonApiService,
  CallPokemonApiWorkFlow,
  makeCallPokemonApiWorkflowLogic
} from "@template/workflow/CallApiPokemon"
import { Effect, Layer, Logger, LogLevel } from "effect"

console.log("🚀 Démarrage du runner...")

const RunnerLayer = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(NodeClusterRunnerSocket.layer({
    storage: "sql"
  })),
  Layer.provideMerge(Sql.PgLive)
)
/*
const CallPokemonApiWorkflowLayer = CallApiPokemon.CallPokemonApiWorkFlow.toLayer(
  Layer.provideMerge(CallPokemonApiService.Default),
  CallApiPokemon.makeCallPokemonApiWorkflowLogic
).pipe(
  Layer.provide(RunnerLayer)
)*/
const CallPokemonApiWorkflowLayer = CallPokemonApiWorkFlow.toLayer(makeCallPokemonApiWorkflowLogic).pipe(
  Layer.provideMerge(CallPokemonApiService.Default),
  Layer.provideMerge(RunnerLayer)
)

const program = Effect.gen(function*() {
  console.log("📝 Enregistrement du workflow EmailWorkflow...")

  // Attendre que tout soit prêt
  yield* Effect.sleep("2 seconds")
  console.log("✅ Runner prêt à recevoir des workflows")

  // Garder le runner en vie
  yield* Effect.never
})

const FullLayer = Layer.mergeAll(
  RunnerLayer,
  CallPokemonApiWorkflowLayer,
  Logger.minimumLogLevel(LogLevel.Debug) // Plus de logs
)

NodeRuntime.runMain(program.pipe(Effect.provide(FullLayer)))
