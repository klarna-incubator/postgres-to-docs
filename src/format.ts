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

type TableDescription = {
  name: String
  columns: (Column & {
    isPrimaryKey: boolean
    foreignKey?: string
  })[]
}

export const format = (schema: Schema) => {
  const tablesDocs: any = generateTablesMarkdown(schema.tables)
  const typesDocs: any = generateTypesMarkdown(schema.customTypes, schema.compositeTypes)
  let documentation = [
    tablesDocs,
    typesDocs
  ].flat()
  return json2md(documentation)
}

const generateTypesMarkdown = (customTypes: CustomType[], compositeTypes: CompositeType[]) => {
  let customTypeNames = customTypes.map(t => t.name);
  let compositeTypeNames = compositeTypes.map(t => t.name)
  return [
    {h2: "Types"},
    generateCustomTypesMarkdown(customTypes, customTypeNames.concat(compositeTypeNames)),
    generateCompositeTypesMarkdown(compositeTypes, customTypeNames.concat(compositeTypeNames))
  ].flat()
}

const generateCustomTypesMarkdown = (customTypes: CustomType[], customTypeNames: String[]) => {
  return customTypes.map(custom => generateCustomTypeMarkdown(custom, customTypeNames)).flat();
}

const generateCustomTypeMarkdown = (custom: CustomType, customTypeNames: String[]) => {
  let nameWithAnchor =
    '<a name="' + custom.name + '" > </a>' + custom.name
  return [
    {h3: nameWithAnchor},
    {ul: custom.elements.map(elem => elem.trim())}
  ]
}

const generateCompositeTypesMarkdown = (compositeTypes: CompositeType[], customTypeNames: String[]) => {
  return compositeTypes.map(composite => generateCompositeTypeMarkdown(composite, customTypeNames)).flat();
}

const generateCompositeTypeMarkdown = (composite: CompositeType, customTypeNames: String[]) => {
  const headers = ["column name", "type", "position", "required?"]
  let nameWithAnchor =
    '<a name="' + composite.name + '" > </a>' + composite.name
  let rows = composite.fields.map(field => {
    const typeWithLink = maybeCreateTypeLink(field.dataType, customTypeNames)
    return [
      field.name,
      typeWithLink,
      field.position,
      field.isRequired.toString()
    ]
  })
  return [
    { h3: nameWithAnchor },
    { table: {
      headers: headers,
      rows: rows,
    }}
  ]
}

const maybeCreateTypeLink = (type: String, customTypeNames: String[]) => {
  if (customTypeNames.includes(type)) {
    return '[' + type + '](#' + type + ')'
  }
  return type
}

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
      aligns: 'left',
      headers: headers,
      rows: rows,
    },
  }
}

const formatColumnName = (name: string, isPrimaryKey: boolean) =>
  isPrimaryKey
    ? `${name} <span style="background: #ddd; padding: 2px; font-size: 0.75rem">PK</span>`
    : name

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
