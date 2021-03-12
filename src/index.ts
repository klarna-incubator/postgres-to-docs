import { build } from './build'
import { createDatabase } from './database'
import { createRepository } from './repository'

const main = async () => {
  const database = await createDatabase({
    user: 'postgres-to-docs',
    password: 'postgres-to-docs',
    database: 'postgres-to-docs',
    host: 'localhost',
    port: 5432,
  })
  const repository = createRepository(database.query)
  const schema = await build(repository)
  console.log(schema)
}

main()
