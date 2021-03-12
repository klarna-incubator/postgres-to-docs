import { Pool } from 'pg'
import { Config } from './config'

export type Database = {
  isAlive: () => Promise<boolean>
  disconnect: () => Promise<void>
  query: (queryString: string, args?: any[]) => Promise<any>
}

export const createDatabase = async (config: Config): Promise<Database> => {
  const pool = new Pool({
    user: config.user,
    host: config.host,
    database: config.database,
    password: config.password,
    port: config.port,
  })

  try {
    await pool.query('SELECT 1')
  } catch (e) {
    throw new Error(`Failed to connect to DB ${e}`)
  }

  const isAlive = async () => {
    try {
      await pool.query('SELECT 1')
      return true
    } catch (e) {
      return false
    }
  }

  const query = async (queryString: string, args?: any[]): Promise<unknown> => {
    const client = await pool.connect()
    try {
      const result = await client.query(queryString, args)
      client.release()
      return result
    } catch (e) {
      client.release()
      throw e
    }
  }

  const disconnect = async () => {
    await pool.end()
  }

  return {
    isAlive,
    disconnect,
    query,
  }
}
