import { Decoder } from 'elm-decoders'
import * as path from 'path'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

// Load .env files in order of precedence
const loadEnvFiles = () => {
  const envFiles = [
    '.env.local',
    '.env'
  ]

  for (const file of envFiles) {
    const envPath = path.join(process.cwd(), file)
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath })
    }
  }
}

// Load environment files
loadEnvFiles()

export type Config = {
  connectionString?: string
  host?: string
  user?: string
  password?: string
  database?: string
  port?: number
  schema?: string
  includeTables?: string[]
  excludeTables?: string[]
  includeTypes: boolean
  pureMarkdown: boolean
  folder?: string
  fileName?: string
  includeRLS?: boolean
  includeToc?: boolean
  includeFunctions?: boolean
  includeDiagram?: boolean
  llmFormat?: boolean
}

const configDecoder = Decoder.object({
  connectionString: Decoder.optional(Decoder.string),
  host: Decoder.optional(Decoder.string),
  user: Decoder.optional(Decoder.string),
  password: Decoder.optional(Decoder.string),
  database: Decoder.optional(Decoder.string),
  port: Decoder.optional(Decoder.number),
  schema: Decoder.optional(Decoder.string),
  includeTables: Decoder.optional(Decoder.array(Decoder.string)),
  excludeTables: Decoder.optional(Decoder.array(Decoder.string)),
  includeTypes: Decoder.optional(Decoder.boolean).map(x => x ?? true),
  pureMarkdown: Decoder.optional(Decoder.boolean).map(x => x ?? false),
  folder: Decoder.optional(Decoder.string),
  fileName: Decoder.optional(Decoder.string),
  includeRLS: Decoder.optional(Decoder.boolean).map(x => x ?? true),
  includeToc: Decoder.optional(Decoder.boolean).map(x => x ?? false),
  includeFunctions: Decoder.optional(Decoder.boolean).map(x => x ?? true),
  includeDiagram: Decoder.optional(Decoder.boolean).map(x => x ?? false),
  llmFormat: Decoder.optional(Decoder.boolean).map(x => x ?? false)
})

export const parseConfig = (environment: any): Config => {
  const config = configDecoder.guard(environment)
  
  // Check for DB_STRING in .env
  if (process.env.DB_STRING) {
    config.connectionString = process.env.DB_STRING
  }

  // Set default folder and fileName if not provided
  if (!config.folder) {
    config.folder = 'docs'
  }
  if (!config.fileName && config.database) {
    config.fileName = `schema-${config.database}`
  } else if (!config.fileName) {
    config.fileName = 'schema'
  }

  return config
}

export const getDefaultConfigPath = () => path.join(process.cwd(), 'postgrestodocs.json')