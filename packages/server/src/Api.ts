import { HttpApi, OpenApi } from "@effect/platform"
import { HttpApiGroupPokemon } from "./pokemon/HttpGroup.js"

export class Api extends HttpApi.make("api")
  .add(HttpApiGroupPokemon)
  .annotate(OpenApi.Title, "Groups API")
{
}

export type ApiType = typeof Api
