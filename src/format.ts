import {
  ColumnDescription,
  Schema,
  TableDescription,
  CompositeType,
} from './get-schema'
import { CustomType } from './repository'
import json2md from 'json2md'
import typeDocumentation from '../postgre-data-types.json'

const TYPES = typeDocumentation as any

export const format = (schema: Schema) => {
  const customTypeNames = schema.customTypes.map((t) => t.name)
  const compositeTypeNames = schema.compositeTypes.map((t) => t.name)
  const typeNames = customTypeNames.concat(compositeTypeNames)
  return json2md(
    [
      generateTableSection(schema.tables, typeNames),
      generateViewsSection(schema.views, typeNames),
      generateTypesSection(
        schema.customTypes,
        schema.compositeTypes,
        typeNames
      ),
    ].flat()
  )
}

const generateTableSection = (
  tables: TableDescription[],
  typeNames: string[]
) => {
  if (tables.length === 0) {
    return []
  }

  return [{ h1: 'Tables' }, generateTablesMarkdown(tables, typeNames)]
}

const generateViewsSection = (
  views: TableDescription[],
  typeNames: string[]
) => {
  if (views.length === 0) {
    return []
  }

  return [{ h1: 'Views' }, generateTablesMarkdown(views, typeNames)]
}

const generateTypesSection = (
  customTypes: CustomType[],
  compositeTypes: CompositeType[],
  typeNames: string[]
) => {
  if (customTypes.length === 0 && compositeTypes.length === 0) {
    return []
  }

  return [
    { h1: 'Types' },
    generateTypesMarkdown(customTypes, compositeTypes, typeNames),
  ]
}

const generateTablesMarkdown = (
  tables: TableDescription[],
  typeNames: string[]
) => tables.map((t) => generateTableDescription(t, typeNames))

const generateTypesMarkdown = (
  customTypes: CustomType[],
  compositeTypes: CompositeType[],
  typeNames: string[]
) =>
  [
    generateCustomTypesMarkdown(customTypes, typeNames),
    generateCompositeTypesMarkdown(compositeTypes, typeNames),
  ].flat()

const generateCustomTypesMarkdown = (
  customTypes: CustomType[],
  customTypeNames: string[]
) => {
  return customTypes
    .map((custom) => generateCustomTypeMarkdown(custom, customTypeNames))
    .flat()
}

const generateCustomTypeMarkdown = (
  custom: CustomType,
  customTypeNames: string[]
) => {
  let nameWithAnchor = '<a name="' + custom.name + '" > </a>' + custom.name
  return [
    { h3: nameWithAnchor },
    { ul: custom.elements.map((elem) => elem.trim()) },
  ]
}

const generateCompositeTypesMarkdown = (
  compositeTypes: CompositeType[],
  customTypeNames: string[]
) => {
  return compositeTypes
    .map((composite) =>
      generateCompositeTypeMarkdown(composite, customTypeNames)
    )
    .flat()
}

const generateCompositeTypeMarkdown = (
  composite: CompositeType,
  customTypeNames: string[]
) => {
  const headers = ['column name', 'type', 'position', 'required?']
  let nameWithAnchor =
    '<a name="' + composite.name + '" > </a>' + composite.name
  let rows = composite.fields.map((field) => {
    const typeWithLink = maybeCreateTypeLink(field.dataType, customTypeNames)
    return [
      field.name,
      typeWithLink,
      field.position,
      field.isRequired.toString(),
    ]
  })
  return [
    { h3: nameWithAnchor },
    {
      table: {
        headers: headers,
        rows: rows,
      },
    },
  ]
}

const maybeCreateTypeLink = (type: string, customTypeNames: string[]) => {
  if (customTypeNames.includes(type)) return `[${type}](#${type})`
  const docsUrl = TYPES[type]
  if (docsUrl) return `<a href="${docsUrl}">${type}</a>`
  return type
}

const generateTableDescription = (
  tableDescription: TableDescription,
  typeNames: string[]
) => {
  const nameWithAnchor = `<a name="${tableDescription.name}"></a>${tableDescription.name}`
  return [
    { h3: nameWithAnchor },
    generateMarkdownTable(tableDescription.columns, typeNames),
  ]
}

const generateMarkdownTable = (
  columns: ColumnDescription[],
  typeNames: string[]
) => {
  const headers = ['Name', 'Type', 'Default', 'Nullable', 'References']
  const rows = columns.map((column) => [
    formatColumnName(column.name, column.isPrimaryKey),
    formatDataType(column.dataType, typeNames),
    formatDefault(column.default),
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
    ? `${name} <span style="background: #ddd; padding: 2px; font-size: 0.75rem; color: black">PK</span>`
    : name

const formatDataType = (type: string, typeNames: string[]) =>
  maybeCreateTypeLink(type, typeNames)

const formatDefault = (def?: string) => def || ''

const formatIsNullable = (isNullable: boolean) =>
  isNullable ? 'True' : 'False'

const formatForeignKey = (foreignKey?: string) =>
  foreignKey ? formatForeignKeyLink(foreignKey) : ''

const formatForeignKeyLink = (foreignKey: string) => {
  const otherTable = foreignKey.split('.')[0]
  return `[${foreignKey}](#${otherTable})`
}
