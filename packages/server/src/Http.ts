import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from "@effect/platform"
import { NodeHttpServer } from "@effect/platform-node"
import { ClusterLayer } from "@template/workflow/WorkerClient"
import { Layer } from "effect"
import { createServer } from "http"
import { Api } from "./Api.js"
import { HttpApiGroupPokemonLive } from "./pokemon/HttpGroup.js"

const api = Api

const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
  HttpApiGroupPokemonLive(api)
])

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareOpenApi()),
  Layer.provide(ApiLive),
  Layer.provide(
    HttpApiBuilder.middlewareCors({
      allowedOrigins: ["http://localhost:3000", "https://preprod.sprint-project.invyo.io"],
      allowedMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    })
  ),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 8000 })),
  Layer.provide(ClusterLayer)
)
