import { ColumnDescription, Schema, TableDescription } from './get-schema'
import { Column } from './repository'
import json2md from 'json2md'

export const format = (schema: Schema) =>
  json2md([
    { h1: 'Tables' },
    descriptionToMarkdownJson(schema.tables),
    { h1: 'Views' },
    descriptionToMarkdownJson(schema.views),
  ])

const descriptionToMarkdownJson = (tables: TableDescription[]) => {
  const tablesMd = tables.map((t) => generateTableDescription(t))
  return json2md(tablesMd)
}

const generateTableDescription = (tableDescription: TableDescription) => {
  const nameWithAnchor = `<a name="${tableDescription.name}"></a>${tableDescription.name}`
  return [
    { h3: nameWithAnchor },
    generateMarkdownTable(tableDescription.columns),
  ]
}

const generateMarkdownTable = (columns: ColumnDescription[]) => {
  const headers = ['Name', 'Type', 'Nullable', 'References']
  const rows = columns.map((column) => [
    formatColumnName(column.name, column.isPrimaryKey),
    formatDataType(column.dataType),
    formatIsNullable(column.isNullable),
    formatForeignKey(column.foreignKey),
  ])

  return {
    table: {
      headers: headers,
      rows: rows,
    },
  }
}

const formatColumnName = (name: string, isPrimaryKey: boolean) =>
  isPrimaryKey ? `<a name="${name}" ></a> ${name}` : name

const formatDataType = (type: string) =>
  type === 'USER-DEFINED' ? 'user defined' : type

const formatIsNullable = (isNullable: boolean) =>
  isNullable ? 'True' : 'False'

const formatForeignKey = (foreignKey?: string) =>
  foreignKey ? formatForeignKeyLink(foreignKey) : ''

const formatForeignKeyLink = (foreignKey: string) => {
  const otherTable = foreignKey.split('.')[0]
  return `[${foreignKey}](#${otherTable})`
}
