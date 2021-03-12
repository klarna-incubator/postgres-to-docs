import { Schema } from './get-schema'
import { Column } from './repository'
const json2md = require('json2md')

type TableDescription = {
  name: String
  columns: (Column & {
    isPrimaryKey: boolean
    foreignKey?: string
  })[]
}

export const format = (schema: Schema) => {
  return descriptionToMarkdownJson(schema.tables)
}

const descriptionToMarkdownJson = (tables: TableDescription[]) => {
  const tablesMd = tables.map((x) => generateTableDescription(x))
  let arr: any[] = []
  tablesMd.forEach((element) => {
    element.forEach((e) => {
      arr.push(e)
    })
  })
  return json2md([{ h2: 'Tables' }].concat(arr))
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
