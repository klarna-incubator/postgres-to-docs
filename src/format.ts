import { Schema, CompositeType } from './get-schema'
import { Column, CustomType } from './repository'
const json2md = require('json2md')

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
    generateCompositeTypesMarkdown(compositeTypes, customTypeNames.concat(compositeTypeNames))
  ].flat()
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

const generateTablesMarkdown = (tables: TableDescription[]) => {
  const tablesMd = tables.map((x) => generateTableDescription(x))
  let arr: any[] = []
  tablesMd.forEach((element) => {
    element.forEach((e) => {
      arr.push(e)
    })
  })
  return [{ h2: 'Tables' }].concat(arr)
}

const generateTableDescription = (tableDescription: TableDescription) => {
  let nameWithAnchor =
    '<a name="' + tableDescription.name + '" > </a>' + tableDescription.name
  return [
    { h3: nameWithAnchor },
    generateMarkdownTable(tableDescription.columns),
  ]
}

const generateMarkdownTable = (
  columns: (Column & {
    isPrimaryKey: boolean
    foreignKey?: string
  })[]
) => {
  const headers = ['name', 'type', 'nullable ?', 'references']
  let rows = columns.map((column) => {
    let columnName = column.name
    if (column.isPrimaryKey) {
      columnName += '<span style="color: red"> primary key </span> '
    }
    let foreignKey
    if (column.foreignKey) {
      let otherTable = column.foreignKey.split('.')[0]
      foreignKey = '[' + column.foreignKey + '](#' + otherTable + ')'
    } else {
      foreignKey = ''
    }
    return [
      columnName,
      column.dataType,
      column.isNullable.toString(),
      foreignKey,
    ]
  })
  return {
    table: {
      headers: headers,
      rows: rows,
    },
  }
}
