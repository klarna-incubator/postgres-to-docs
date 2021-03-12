import { createDatabase } from './database'
import {
  Column,
  createRepository,
  Table,
  ForeignKey,
  PrimaryKey,
  CustomType,
  View,
} from './repository'

const getColumnsForTable = (table: Table, columns: Column[]) =>
  columns.filter((c) => c.table === table.name)

const withPrimaryKey = (
  source: Table | View,
  column: Column,
  primaryKeys: PrimaryKey[]
): Column & { isPrimaryKey: boolean } => {
  const isPrimaryKey = primaryKeys.find(
    (pk) => pk.table === source.name && pk.column === column.name
  )
  return { ...column, isPrimaryKey: !!isPrimaryKey }
}

const withForeignKey = (
  source: Table | View,
  column: Column,
  foreignKeys: ForeignKey[]
): Column & { foreignKey?: string } => {
  const foreignKey = foreignKeys.find(
    (fk) => fk.sourceTable === source.name && fk.sourceColumn === column.name
  )

  if (!foreignKey) {
    return column
  }
  return {
    ...column,
    foreignKey: `${foreignKey.foreignTable}.${foreignKey.foreignColumn}`,
  }
}

const withColumns = (
  source: Table | View,
  columns: Column[],
  foreignKeys: ForeignKey[],
  primaryKeys: PrimaryKey[]
) => {
  const tableColumns = getColumnsForTable(source, columns)
  const withKeys = tableColumns.map((column) =>
    withForeignKey(
      source,
      withPrimaryKey(source, column, primaryKeys),
      foreignKeys
    )
  )
  return {
    name: source.name,
    columns: withKeys,
  }
}

const buildSchema = (
  tables: Table[],
  views: View[],
  columns: Column[],
  foreignKeys: ForeignKey[],
  primaryKeys: PrimaryKey[],
  customTypes: CustomType[]
) => {
  const enrichedTables = tables.map((table) =>
    withColumns(table, columns, foreignKeys, primaryKeys)
  )

  const enrichedViews = views.map((view) =>
    withColumns(view, columns, foreignKeys, primaryKeys)
  )

  return {
    tables: enrichedTables,
    customTypes,
    views: enrichedViews,
  }
}

const main = async () => {
  const DATABASE_URL =
    'postgresql://postgres-to-docs:postgres-to-docs@127.0.0.1/postgres-to-docs'

  const database = await createDatabase({ DATABASE_URL })
  const repository = createRepository(database.query)

  // TODO Maybe run the table + column + fks + pks as a big join instead of multiple queries
  const tables = await repository.selectTables()
  const views = await repository.selectViews()
  const columns = await repository.selectColumns()
  const foreignKeys = await repository.selectForeignKeys()
  const primaryKeys = await repository.selectPrimaryKeys()
  const customTypes = await repository.selectCustomTypes()

  console.log(
    JSON.stringify(
      buildSchema(tables, views, columns, foreignKeys, primaryKeys, customTypes)
    )
  )
}

main()
