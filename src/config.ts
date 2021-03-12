import { Decoder } from 'elm-decoders'

export type Config = {
  host: string
  user: string
  password: string
  database: string
  port: number
}

const configDecoder = Decoder.object({
  host: Decoder.string,
  user: Decoder.string,
  password: Decoder.string,
  database: Decoder.string,
  port: Decoder.number
})

export const parseConfig = (environment: any): Config =>
  configDecoder.guard(environment)
