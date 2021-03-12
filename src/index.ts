// import { KlarnaLogger } from '@klarna/kns'
// import { Decoder } from 'elm-decoders'
// import { makeQuery, RunQuery, sql } from './lib/query'

// const getTablesQuery = makeQuery(sql`SELECT * FROM pg_catalog.pg_tables`, Decoder.any)
// const getColumnsQuery = makeQuery(sql`select * from information_schema."columns"`, Decoder.any)
// const getForeignKeys = makeQuery(
//   sql`SELECT
//         tc.table_schema,
//         tc.constraint_name,
//         tc.table_name,
//         kcu.column_name,
//         ccu.table_schema AS foreign_table_schema,
//         ccu.table_name AS foreign_table_name,
//         ccu.column_name AS foreign_column_name
//       FROM  information_schema.table_constraints AS tc
//       JOIN information_schema.key_column_usage AS kcu
//         ON tc.constraint_name = kcu.constraint_name
//         AND tc.table_schema = kcu.table_schema
//       JOIN information_schema.constraint_column_usage AS ccu
//         ON ccu.constraint_name = tc.constraint_name
//         AND ccu.table_schema = tc.table_schema
//       WHERE tc.constraint_type = 'FOREIGN KEY'
//   `,
//   Decoder.any
// )

// export const runAutoDoc = async (logger: KlarnaLogger, runQuery: RunQuery) => {
//   const tempTables = await runQuery(getTablesQuery)
//   const allTables = tempTables as any
//   const tables = allTables.filter(
//     (t: any) => !(t.tablename.startsWith('sql_') || t.tablename.startsWith('pg_'))
//   )

//   const tempCols = await runQuery(getColumnsQuery)
//   const columns = tempCols as any

//   const tempFks = await runQuery(getForeignKeys)
//   const fks = tempFks as any

//   const findFk = (t: any, c: any, fks: any) =>
//     fks.find((fk: any) => fk.table_name === t.tablename && fk.column_name === c.column_name)

//   const grouped = tables.map((t: any) => ({
//     table: t.tablename,
//     columns: columns
//       .filter((c: any) => c.table_name === t.tablename)
//       .map((c: any) => {
//         const hasFk = findFk(t, c, fks)
//         const foreignKey = hasFk ? `${hasFk.foreign_table_name}.${hasFk.foreign_column_name}` : null
//         return {
//           foreignKey,
//           name: c.column_name,
//           nullable: c.is_nullable,
//           type: c.data_type,
//           default: c.column_default,
//         }
//       }),
//   }))

//   logger.info(':::::::: Grouped :::::', { grouped })
// }
