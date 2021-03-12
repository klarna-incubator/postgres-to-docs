import { getSchema } from './get-schema'
import { createDatabase } from './database'
import { format } from './format'
import { createRepository } from './repository'
import fs from 'fs'
import { parseConfig } from './config'

const readFile = (path: string) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, (err, res) => {
      if (err) {
        reject(err)
        return
      }
      resolve(JSON.parse(res.toString()))
    })
  })

const writeFile = (path: string, content: string) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve(null)
    })
  })

const getDbConfig = async (configPath: string) => {
  const rawConfig = await readFile(configPath)
  return parseConfig(rawConfig)
}

export const generateDocumentation = async (
  configPath: string,
  outputPath: string
) => {
  const config = await getDbConfig(configPath)
  const database = await createDatabase(config)
  const repository = createRepository(database.query)
  try {
    const schema = await getSchema(repository)
    await database.disconnect()
    await writeFile(outputPath, format(schema))
  } catch (e) {
    await database.disconnect()
    throw e
  }
}
