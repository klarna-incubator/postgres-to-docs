import { Config } from './config'
import { createDatabase, Database } from './database'

describe('database', () => {
  const config: Config = {
    host: 'localhost',
    port: 5432,
    user: 'postgres-to-docs',
    password: 'postgres-to-docs',
    database: 'postgres-to-docs',
  }

  let database: Database
  beforeAll(async () => {
    database = await createDatabase(config)
  })

  afterAll(async () => {
    await database.disconnect()
  })

  it('can connect', async () => {
    const isAlive = await database.isAlive()
    expect(isAlive).toBe(true)
  })

  it('can query', async () => {
    const res = await database.query('SELECT 1')
    expect(res).toBeDefined()
  })
})
