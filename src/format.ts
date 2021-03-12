import { ColumnDescription, Schema, TableDescription, CompositeType } from './get-schema'
import { CustomType } from './repository'
import json2md from 'json2md'

export const format = (schema: Schema) => {
  const customTypeNames = schema.customTypes.map(t => t.name);
  const compositeTypeNames = schema.compositeTypes.map(t => t.name)
  const typeNames = customTypeNames.concat(compositeTypeNames)
  return json2md([
    { h1: 'Tables' },
    descriptionToMarkdownJson(schema.tables, typeNames),
    { h1: 'Views' },
    descriptionToMarkdownJson(schema.views, typeNames),
    { h1: 'Types' },
    generateTypesMarkdown(schema.customTypes, schema.compositeTypes, typeNames)
  ].flat())
}

const descriptionToMarkdownJson = (tables: TableDescription[], typeNames: String[]) => {
  const tablesMd = tables.map((t) => generateTableDescription(t, typeNames))
  return json2md(tablesMd)
}

const generateTypesMarkdown = (customTypes: CustomType[], compositeTypes: CompositeType[], typeNames: String[]) => {
  return [
    generateCustomTypesMarkdown(customTypes, typeNames),
    generateCompositeTypesMarkdown(compositeTypes, typeNames)
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
    return `[${type}](#${type})`
  }
  return type
}

const generateTableDescription = (tableDescription: TableDescription, typeNames: String[]) => {
  const nameWithAnchor = `<a name="${tableDescription.name}"></a>${tableDescription.name}`
  return [
    { h3: nameWithAnchor },
    generateMarkdownTable(tableDescription.columns, typeNames),
  ]
}

const generateMarkdownTable = (columns: ColumnDescription[], typeNames: String[]) => {
  const headers = ['Name', 'Type', 'Nullable', 'References']
  const rows = columns.map((column) => [
    formatColumnName(column.name, column.isPrimaryKey),
    formatDataType(column.dataType, typeNames),
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

const formatDataType = (type: string, typeNames: String[]) =>
  maybeCreateTypeLink(type, typeNames)

const formatIsNullable = (isNullable: boolean) =>
  isNullable ? 'True' : 'False'

const formatForeignKey = (foreignKey?: string) =>
  foreignKey ? formatForeignKeyLink(foreignKey) : ''

const formatForeignKeyLink = (foreignKey: string) => {
  const otherTable = foreignKey.split('.')[0]
  return `[${foreignKey}](#${otherTable})`
}
