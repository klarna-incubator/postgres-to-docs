import { Database } from './database'
import { Decoder } from 'elm-decoders'

export type Table = {
  name: string
  comment?: string
}

const tableResultDecoder: Decoder<Table[]> = Decoder.array(
  Decoder.object({
    tablename: Decoder.string,
    description: Decoder.optional(Decoder.string)
  }).map((res) => ({
    name: res.tablename,
    comment: res.description
  }))
)

export type Column = {
  table: string
  name: string
  default?: string
  isNullable: boolean
  dataType: string
  comment?: string
}

const columnResultDecoder: Decoder<Column[]> = Decoder.array(
  Decoder.object({
    table_name: Decoder.string,
    column_name: Decoder.string,
    column_default: Decoder.optional(Decoder.string),
    is_nullable: Decoder.string.map((s) => s === 'YES'),
    data_type: Decoder.string,
    udt_name: Decoder.string,
    character_maximum_length: Decoder.optional(Decoder.number),
    column_comment: Decoder.optional(Decoder.string)
  }).map((res) => {
    return {
      table: res.table_name,
      name: res.column_name,
      default: res.column_default,
      isNullable: res.is_nullable,
      dataType: get_datatype(res),
      comment: res.column_comment
    }
  })
)

const get_datatype = (res: { udt_name: string, data_type: string, character_maximum_length: number | undefined }) => {
  if (res.data_type == 'USER-DEFINED') {
    return res.udt_name
  }
  if (res.data_type == 'character' && res.character_maximum_length) {
    return `character (${res.character_maximum_length})`
  }
  return res.data_type
}

export type View = {
  name: string
  comment?: string
}

const viewResultDecoder: Decoder<View[]> = Decoder.array(
  Decoder.object({
    table_name: Decoder.string,
    description: Decoder.optional(Decoder.string)
  }).map((res) => ({
    name: res.table_name,
    comment: res.description
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
  elements: string[]
}

const customTypeResultDecoder: Decoder<CustomType[]> = Decoder.array(
  Decoder.object({
    name: Decoder.string,
    internal_name: Decoder.string,
    elements: Decoder.string.map((str) => str.split(',')),
  }).map((res) => ({
    name: res.name,
    internalName: res.internal_name,
    elements: res.elements,
  }))
)

export type CompositeType = {
  name: string,
  columnName: string,
  dataType: string,
  position: number,
  isRequired: boolean
}

const compositeTypeResultDecoder: Decoder<CompositeType[]> = Decoder.array(
  Decoder.object({
    obj_name: Decoder.string,
    column_name: Decoder.string,
    data_type: Decoder.string,
    ordinal_position: Decoder.number,
    is_required: Decoder.boolean
  }).map((res) => ({
    name: res.obj_name,
    columnName: res.column_name,
    dataType: res.data_type,
    position: res.ordinal_position,
    isRequired: res.is_required
  }))
)

export type RLSPolicy = {
  table: string
  name: string
  definition: string
  command: string
  roles: string[]
  using: string
  withCheck: string
}

const rlsPolicyDecoder: Decoder<RLSPolicy[]> = Decoder.array(
  Decoder.object({
    table_name: Decoder.string,
    policy_name: Decoder.string,
    policy_definition: Decoder.string,
    command: Decoder.string,
    roles: Decoder.string.map(s => s.split(',')),
    using: Decoder.optional(Decoder.string),
    with_check: Decoder.optional(Decoder.string)
  }).map(res => ({
    table: res.table_name,
    name: res.policy_name,
    definition: res.policy_definition,
    command: res.command,
    roles: res.roles,
    using: res.using || '',
    withCheck: res.with_check || ''
  }))
)

export type DatabaseFunction = {
  name: string
  returnType: string
  arguments: string
  definition: string
  language: string
  volatility: string
}

const functionResultDecoder: Decoder<DatabaseFunction[]> = Decoder.array(
  Decoder.object({
    routine_name: Decoder.string,
    data_type: Decoder.string,
    arguments: Decoder.string,
    definition: Decoder.string,
    language: Decoder.string,
    volatility: Decoder.string
  }).map((res) => ({
    name: res.routine_name,
    returnType: res.data_type,
    arguments: res.arguments,
    definition: res.definition,
    language: res.language,
    volatility: res.volatility
  }))
)

export const createRepository = (
  query: Database['query'],
  schema?: string,
  includeTables?: string[],
  excludeTables?: string[]
) => {
  const schemaFilter = schema ? `AND schemaname = '${schema}'` : ''

  const createTableFilter = () => {
    if (includeTables && includeTables.length > 0) {
      return `AND (${includeTables.map(pattern => `tablename ~ '${pattern}'`).join(' OR ')})`
    }
    if (excludeTables && excludeTables.length > 0) {
      return `AND NOT (${excludeTables.map(pattern => `tablename ~ '${pattern}'`).join(' OR ')})`
    }
    return ''
  }

  const tableFilter = createTableFilter()

  const selectTables = async () => {
    const queryString = `
      SELECT 
        t.tablename,
        pg_catalog.obj_description(c.oid, 'pg_class') as description
      FROM pg_catalog.pg_tables t
      JOIN pg_catalog.pg_class c ON c.relname = t.tablename
      WHERE tablename NOT LIKE 'sql_%' 
        AND tablename NOT LIKE 'pg_%' 
        ${schemaFilter}
        ${tableFilter}
    `
    const result = await query(queryString)
    const decoded = tableResultDecoder.guard(result.rows)
    return decoded
  }

  const selectColumns = async () => {
    const queryString = `
      SELECT 
        c.table_name,
        c.column_name,
        c.column_default,
        c.is_nullable,
        c.data_type,
        c.udt_name,
        c.character_maximum_length,
        pgd.description as column_comment
      FROM information_schema.columns c
      LEFT JOIN pg_catalog.pg_statio_all_tables st ON (c.table_schema = st.schemaname AND c.table_name = st.relname)
      LEFT JOIN pg_catalog.pg_description pgd ON (pgd.objoid = st.relid AND pgd.objsubid = c.ordinal_position)
      WHERE c.table_schema = $1
        ${tableFilter ? `AND (${tableFilter.replace(/tablename/g, 'c.table_name').slice(4)})` : ''}
      ORDER BY c.ordinal_position
    `
    const result = await query(queryString, [schema || 'public'])
    const decoded = columnResultDecoder.guard(result.rows)
    return decoded
  }

  const selectViews = async () => {
    const queryString = `
      SELECT 
        v.table_name,
        pg_catalog.obj_description(c.oid, 'pg_class') as description
      FROM INFORMATION_SCHEMA.views v
      JOIN pg_catalog.pg_class c ON c.relname = v.table_name
      WHERE v.table_schema = ANY (current_schemas(false)) 
        ${schemaFilter ? schemaFilter.replace('schemaname', 'v.table_schema') : ''}
        ${tableFilter ? tableFilter.replace('tablename', 'v.table_name') : ''}
    `
    const result = await query(queryString)
    const decoded = viewResultDecoder.guard(result.rows)
    return decoded
  }

  const selectRLSPolicies = async () => {
    const queryString = `
      SELECT
        schemaname,
        tablename AS table_name,
        policyname AS policy_name,
        format('%I ON %I.%I TO %s', policyname, schemaname, tablename, roles) AS policy_definition,
        cmd AS command,
        roles::text,
        qual AS using,
        with_check
      FROM
        pg_policies
      WHERE
        schemaname = $1
    `
    const result = await query(queryString, [schema || 'public'])
    const decoded = rlsPolicyDecoder.guard(result.rows)
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

  const selectCompositeTypes = async () => {
    const queryString = `
      WITH types AS (
        SELECT n.nspname,
            pg_catalog.format_type ( t.oid, NULL ) AS obj_name,
            CASE
                WHEN t.typrelid != 0 THEN CAST ( 'tuple' AS pg_catalog.text )
                WHEN t.typlen < 0 THEN CAST ( 'var' AS pg_catalog.text )
                ELSE CAST ( t.typlen AS pg_catalog.text )
                END AS obj_type,
            coalesce ( pg_catalog.obj_description ( t.oid, 'pg_type' ), '' ) AS description
        FROM pg_catalog.pg_type t
        JOIN pg_catalog.pg_namespace n
            ON n.oid = t.typnamespace
        WHERE ( t.typrelid = 0
                OR ( SELECT c.relkind = 'c'
                        FROM pg_catalog.pg_class c
                        WHERE c.oid = t.typrelid ) )
            AND NOT EXISTS (
                    SELECT 1
                        FROM pg_catalog.pg_type el
                        WHERE el.oid = t.typelem
                        AND el.typarray = t.oid )
            AND n.nspname <> 'pg_catalog'
            AND n.nspname <> 'information_schema'
            AND n.nspname !~ '^pg_toast'
      ),
      cols AS (
          SELECT n.nspname::text AS schema_name,
                  pg_catalog.format_type ( t.oid, NULL ) AS obj_name,
                  a.attname::text AS column_name,
                  pg_catalog.format_type ( a.atttypid, a.atttypmod ) AS data_type,
                  a.attnotnull AS is_required,
                  a.attnum AS ordinal_position,
                  pg_catalog.col_description ( a.attrelid, a.attnum ) AS description
              FROM pg_catalog.pg_attribute a
              JOIN pg_catalog.pg_type t
                  ON a.attrelid = t.typrelid
              JOIN pg_catalog.pg_namespace n
                  ON ( n.oid = t.typnamespace )
              JOIN types
                  ON ( types.nspname = n.nspname
                      AND types.obj_name = pg_catalog.format_type ( t.oid, NULL ) )
              WHERE a.attnum > 0
                  AND NOT a.attisdropped
      )
      SELECT  cols.obj_name,
              cols.column_name,
              cols.data_type,
              cols.ordinal_position,
              cols.is_required,
              coalesce ( cols.description, '' ) AS description
          FROM cols
          ORDER BY cols.obj_name,
                  cols.ordinal_position ;
          `
    const result = await query(queryString)
    const decoded = compositeTypeResultDecoder.guard(result.rows)
    return decoded
  }

  const selectFunctions = async () => {
    const queryString = `
      SELECT 
        p.proname AS routine_name,
        pg_get_function_result(p.oid) AS data_type,
        pg_get_function_arguments(p.oid) AS arguments,
        pg_get_functiondef(p.oid) AS definition,
        l.lanname AS language,
        CASE p.provolatile
          WHEN 'i' THEN 'IMMUTABLE'
          WHEN 's' THEN 'STABLE'
          WHEN 'v' THEN 'VOLATILE'
        END AS volatility
      FROM pg_proc p
      LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
      LEFT JOIN pg_language l ON p.prolang = l.oid
      WHERE n.nspname = $1
        AND p.prokind = 'f'
      ORDER BY p.proname;
    `
    const result = await query(queryString, [schema || 'public'])
    const decoded = functionResultDecoder.guard(result.rows)
    return decoded
  }

  return {
    selectTables,
    selectColumns,
    selectViews,
    selectForeignKeys,
    selectPrimaryKeys,
    selectCustomTypes,
    selectCompositeTypes,
    selectRLSPolicies,
    selectFunctions
  }
}

export type Repository = ReturnType<typeof createRepository>
