import { RunnerAddress } from "@effect/cluster"
import { NodeClusterShardManagerSocket, NodeRuntime } from "@effect/platform-node"
import { Sql } from "@template/database"
import { Config, Effect, Layer } from "effect"

Layer.unwrapEffect(Effect.gen(function*() {
  const env = yield* Config.string("NODE_ENV").pipe(
    Config.withDefault("development")
  )
  const isProduction = env === "production"
  const host = isProduction ? "fly-local-6pn" : "localhost"

  return NodeClusterShardManagerSocket.layer({
    storage: "sql",
    shardingConfig: {
      shardManagerAddress: RunnerAddress.make(host, 8080)
    }
  })
})).pipe(
  Layer.provide(Sql.PgLive),
  Layer.launch,
  NodeRuntime.runMain
)
