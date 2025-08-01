import type { Runners, Sharding } from "@effect/cluster"
import { ClusterWorkflowEngine, RunnerAddress } from "@effect/cluster"
import { NodeClusterRunnerSocket } from "@effect/platform-node"
import type { WorkflowEngine } from "@effect/workflow"
import { Sql } from "@template/database"
import { Config, Effect, Layer } from "effect"

const ShardingLayer = Layer.unwrapEffect(
  Effect.gen(function*() {
    const shardManagerHost = yield* Config.string("SHARD_MANAGER_HOST").pipe(
      Config.withDefault("localhost")
    )

    return NodeClusterRunnerSocket.layer({
      clientOnly: true,
      storage: "sql",
      shardingConfig: {
        shardManagerAddress: RunnerAddress.make(shardManagerHost, 8081)
      }
    })
  })
).pipe(
  Layer.provide(Sql.PgLive),
  Layer.orDie
)

export const ClusterLayer: Layer.Layer<
  Sharding.Sharding | Runners.Runners | WorkflowEngine.WorkflowEngine
> = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(ShardingLayer)
)
