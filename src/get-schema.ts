import {
  Column,
  Table,
  ForeignKey,
  PrimaryKey,
  CustomType,
  View,
  Repository,
} from './repository'

export type ColumnDescription = Column & {
  isPrimaryKey: boolean
  foreignKey?: string
}

export type TableDescription = {
  name: string
  columns: ColumnDescription[]
}

export type Schema = {
  tables: TableDescription[]
  customTypes: CustomType[]
  views: TableDescription[]
}

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
  column: Column & { isPrimaryKey: boolean },
  foreignKeys: ForeignKey[]
): Column & { foreignKey?: string; isPrimaryKey: boolean } => {
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
  const withKeys = tableColumns.map((column) => {
    const withPks = withPrimaryKey(source, column, primaryKeys)
    const withFks = withForeignKey(source, withPks, foreignKeys)
    return withFks
  })
  return {
    name: source.name,
    columns: withKeys,
  }
}

export const getSchema = async (repository: Repository) => {
  const tables = await repository.selectTables()
  const views = await repository.selectViews()
  const columns = await repository.selectColumns()
  const foreignKeys = await repository.selectForeignKeys()
  const primaryKeys = await repository.selectPrimaryKeys()
  const customTypes = await repository.selectCustomTypes()

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
