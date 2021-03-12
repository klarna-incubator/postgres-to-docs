import { getSchema } from './get-schema'
import { createDatabase } from './database'
import { format } from './format'
import { createRepository } from './repository'
import { parseConfig } from './config'
import * as File from './file'

export const generateDocumentation = async (
  configPath: string,
  outputPath: string
) => {
  const config = parseConfig(await File.read(configPath))
  const database = await createDatabase(config)
  const repository = createRepository(database.query)
  try {
    const schema = await getSchema(repository)
    await File.write(outputPath, format(schema))
  } catch (e) {
    throw e
  } finally {
    await database.disconnect()
  }
}
