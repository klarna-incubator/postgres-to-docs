import fs from 'fs'
import { promisify } from 'util'
import * as path from 'path'

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const mkdirAsync = promisify(fs.mkdir)

export const read = async (path: string) => {
  const content = await readFileAsync(path, 'utf8')
  return JSON.parse(content)
}

export const write = (path: string, content: string) => writeFileAsync(path, content)

export const ensureDirectoryExists = async (dirPath: string) => {
  try {
    await mkdirAsync(dirPath, { recursive: true })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err
  }
}