import { Pool } from 'pg'

export type Database = {
  isAlive: () => Promise<boolean>
  disconnect: () => Promise<void>
  query: (queryString: string, args?: any[]) => Promise<any>
}

export const createDatabase = async ({
  DATABASE_URL,
}: {
  DATABASE_URL: string
}): Promise<Database> => {
  const pool = new Pool({
    connectionString: DATABASE_URL,
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
      console.log(e)
      client.release()
      throw new Error('Query failed')
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
