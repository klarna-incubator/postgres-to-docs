#!/usr/bin/env node
import { getSchema } from './get-schema'
import { createDatabase } from './database'
import { format } from './format'
import { createRepository } from './repository'
import fs from 'fs'
import { parseConfig } from './config'

const parseArguments = () => {
  const [_, __, ...args] = process.argv
  return args
    .map((arg) => {
      if (arg.startsWith('--')) {
        const [flag, value] = arg.split('=')
        const withoutDashes = flag.slice(2)
        return { [withoutDashes]: value }
      }
      return {}
    })
    .reduce((acc, next) => ({ ...acc, ...next }), {})
}

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

const main = async () => {
  const rawArguments = parseArguments()
  if (!rawArguments.config || !rawArguments.output) {
    console.log('failed, "--config" and "--output" required')
    return
  }

  try {
    const dbConfig = await getDbConfig(rawArguments.config)
    const database = await createDatabase(dbConfig)
    const repository = createRepository(database.query)
    const schema = await getSchema(repository)
    await writeFile(rawArguments.output, format(schema))
  } catch (e) {
    console.log('postgres doc failed', e)
  }
}

main()
