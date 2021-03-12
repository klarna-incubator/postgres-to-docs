import { Database } from './database'
import { Decoder } from 'elm-decoders'

export type Table = {
  name: string
}

const tableResultDecoder: Decoder<Table[]> = Decoder.array(
  Decoder.object({
    tablename: Decoder.string,
  }).map((res) => ({
    name: res.tablename,
  }))
)

export type Column = {
  table: string
  name: string
  default?: string
  isNullable: boolean
  dataType: string
}

const columnResultDecoder: Decoder<Column[]> = Decoder.array(
  Decoder.object({
    table_name: Decoder.string,
    column_name: Decoder.string,
    column_default: Decoder.optional(Decoder.string),
    is_nullable: Decoder.string.map((s) => s === 'YES'),
    data_type: Decoder.string,
  }).map((res) => ({
    table: res.table_name,
    name: res.column_name,
    default: res.column_default,
    isNullable: res.is_nullable,
    dataType: res.data_type,
  }))
)

export type View = {
  name: string
}

const viewResultDecoder: Decoder<View[]> = Decoder.array(
  Decoder.object({
    table_name: Decoder.string,
  }).map((res) => ({
    name: res.table_name,
  }))
)

export type ForeignKey = {
  constraintName: string
  sourceTable: string
  sourceColumn: string
  foreignTable: string
  foreignColumn: string
}

const foreignKeyResultDecoder: Decoder<ForeignKey[]> = Decoder.array(
  Decoder.object({
    constraint_name: Decoder.string,
    source_table: Decoder.string,
    source_column: Decoder.string,
    foreign_table: Decoder.string,
    foreign_column: Decoder.string,
  }).map((res) => ({
    constraintName: res.constraint_name,
    sourceTable: res.source_table,
    sourceColumn: res.source_column,
    foreignTable: res.foreign_table,
    foreignColumn: res.foreign_column,
  }))
)

export type PrimaryKey = {
  constraintName: string
  table: string
  column: string
}

const primaryKeyResultDecoder: Decoder<PrimaryKey[]> = Decoder.array(
  Decoder.object({
    constraint_name: Decoder.string,
    table_name: Decoder.string,
    column_name: Decoder.string,
  }).map((res) => ({
    constraintName: res.constraint_name,
    table: res.table_name,
    column: res.column_name,
  }))
)

export type CustomType = {
  name: string
  internalName: string
  size: number
  elements: string[]
}

const customTypeResultDecoder: Decoder<CustomType[]> = Decoder.array(
  Decoder.object({
    name: Decoder.string,
    internal_name: Decoder.string,
    size: Decoder.number,
    elements: Decoder.string.map((str) => str.split(',')),
  }).map((res) => ({
    name: res.name,
    internalName: res.internal_name,
    size: res.size,
    elements: res.elements,
  }))
)

export const createRepository = (query: Database['query']) => {
  const selectTables = async () => {
    const queryString = `SELECT * FROM pg_catalog.pg_tables WHERE tablename NOT LIKE 'sql_%' AND tablename NOT LIKE 'pg_%'`
    const result = await query(queryString)
    const decoded = tableResultDecoder.guard(result.rows)
    return decoded
  }
  const selectColumns = async () => {
    const queryString = `SELECT * FROM information_schema."columns"`
    const result = await query(queryString)
    const decoded = columnResultDecoder.guard(result.rows)
    return decoded
  }

  const selectViews = async () => {
    const queryString = `SELECT table_name FROM INFORMATION_SCHEMA.views WHERE table_schema = ANY (current_schemas(false))`
    const result = await query(queryString)
    const decoded = viewResultDecoder.guard(result.rows)
    return decoded
  }

  const selectForeignKeys = async () => {
    const queryString = `
      SELECT
        tc.table_schema,
        tc.constraint_name,
        tc.table_name as source_table,
        kcu.column_name as source_column,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM  information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
    `
    const result = await query(queryString)
    const decoded = foreignKeyResultDecoder.guard(result.rows)
    return decoded
  }
  const selectPrimaryKeys = async () => {
    const queryString = `
      SELECT kcu.table_schema,
        kcu.table_name,
        tco.constraint_name,
        kcu.column_name AS column_name
      FROM information_schema.table_constraints tco
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tco.constraint_name
        AND kcu.constraint_schema = tco.constraint_schema
        AND kcu.constraint_name = tco.constraint_name
      WHERE tco.constraint_type = 'PRIMARY KEY'
    `
    const result = await query(queryString)
    const decoded = primaryKeyResultDecoder.guard(result.rows)
    return decoded
  }
  const selectCustomTypes = async () => {
    const queryString = `
      SELECT n.nspname AS schema,
          pg_catalog.format_type ( t.oid, NULL ) AS name,
          t.typname AS internal_name,
          CASE
              WHEN t.typrelid != 0
              THEN CAST ( 'tuple' AS pg_catalog.text )
              WHEN t.typlen < 0
              THEN CAST ( 'var' AS pg_catalog.text )
              ELSE CAST ( t.typlen AS pg_catalog.text )
          END AS size,
          pg_catalog.array_to_string (
              ARRAY( SELECT e.enumlabel
                      FROM pg_catalog.pg_enum e
                      WHERE e.enumtypid = t.oid
                      ORDER BY e.oid ), E', '
              ) AS elements,
          pg_catalog.obj_description ( t.oid, 'pg_type' ) AS description
      FROM pg_catalog.pg_type t
      LEFT JOIN pg_catalog.pg_namespace n
          ON n.oid = t.typnamespace
      WHERE ( t.typrelid = 0
              OR ( SELECT c.relkind = 'c'
                      FROM pg_catalog.pg_class c
                      WHERE c.oid = t.typrelid
                  )
          )
          AND NOT EXISTS
              ( SELECT 1
                  FROM pg_catalog.pg_type el
                  WHERE el.oid = t.typelem
                      AND el.typarray = t.oid
              )
          AND n.nspname <> 'pg_catalog'
          AND n.nspname <> 'information_schema'
          AND pg_catalog.pg_type_is_visible ( t.oid )
      ORDER BY 1, 2;
    `

    const result = await query(queryString)
    const decoded = customTypeResultDecoder.guard(result.rows)
    return decoded
  }

  return {
    selectTables,
    selectColumns,
    selectViews,
    selectForeignKeys,
    selectPrimaryKeys,
    selectCustomTypes,
  }
}

export type Repository = ReturnType<typeof createRepository>
