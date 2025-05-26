import { getSchema, TableDescription } from './get-schema'
import { createDatabase } from './database'
import { format } from './format'
import { createRepository } from './repository'
import { parseConfig } from './config'
import * as File from './file'
import * as path from 'path'

export const generateDocumentation = async (
  configPath: string,
  outputFolder?: string,
  outputFileName?: string,
  schema?: string,
  includeTables?: string[],
  excludeTables?: string[],
  includeTypes?: boolean,
  pureMarkdown?: boolean,
  includeRLS?: boolean,
  includeToc?: boolean,
  includeFunctions?: boolean,
  includeDiagram?: boolean,
  llmFormat?: boolean
) => {
  const config = parseConfig(await File.read(configPath))
  const database = await createDatabase(config)
  const repository = createRepository(
    database.query, 
    schema || config.schema,
    includeTables || config.includeTables,
    excludeTables || config.excludeTables
  )
  try {
    let schemaData = await getSchema(repository)
    
    // Print list of tables
    console.log('Tables included in documentation:')
    if (schemaData.tables.length === 0) {
      console.log('None')
    } else {
      schemaData.tables.forEach(table => {
        console.log(`- ${table.name}`)
      })
    }
    
    // Print list of views
    console.log('\nViews found:')
    if (schemaData.views.length === 0) {
      console.log('None')
    } else {
      schemaData.views.forEach(view => {
        console.log(`- ${view.name}`)
      })
    }

    // Print list of functions
    const includeFunctionsFlag = includeFunctions !== undefined ? includeFunctions : config.includeFunctions
    if (includeFunctionsFlag) {
      console.log('\nFunctions found:')
      if (schemaData.functions.length === 0) {
        console.log('None')
      } else {
        schemaData.functions.forEach(func => {
          console.log(`- ${func.name}(${func.arguments}) -> ${func.returnType}`)
        })
      }
    }

    // Print list of RLS policies
    console.log('\nRow Level Security policies found:')
    if (schemaData.rlsPolicies.length === 0) {
      console.log('None')
    } else {
      schemaData.rlsPolicies.forEach(policy => {
        console.log(`- ${policy.table}: ${policy.name} (${policy.command})`)
      })
    }

    const includeTypesFlag = includeTypes !== undefined ? includeTypes : config.includeTypes
    const pureMarkdownFlag = pureMarkdown !== undefined ? pureMarkdown : config.pureMarkdown
    const includeRLSFlag = includeRLS !== undefined ? includeRLS : config.includeRLS
    const includeTocFlag = includeToc !== undefined ? includeToc : config.includeToc
    const includeDiagramFlag = includeDiagram !== undefined ? includeDiagram : config.includeDiagram
    const llmFormatFlag = llmFormat !== undefined ? llmFormat : config.llmFormat
    const folder = outputFolder || config.folder || 'docs'
    const fileName = outputFileName || config.fileName || `schema-${config.database}`
    
    // Ensure the output directory exists
    await File.ensureDirectoryExists(folder)
    
    // Always write the markdown file
    const mdPath = path.join(folder, `${fileName}.md`)
    await File.write(
      mdPath,
      format(
        schemaData, 
        includeTypesFlag, 
        pureMarkdownFlag, 
        includeRLSFlag, 
        includeTocFlag, 
        includeFunctionsFlag, 
        includeDiagramFlag,
        false // Force markdown format
      )
    )
    console.log(`\nMarkdown documentation written to ${mdPath}`)

    // If llmFormat is true, also write the JSON file
    if (llmFormatFlag) {
      const jsonPath = path.join(folder, `${fileName}.json`)
      await File.write(
        jsonPath,
        format(
          schemaData, 
          includeTypesFlag, 
          pureMarkdownFlag, 
          includeRLSFlag, 
          includeTocFlag, 
          includeFunctionsFlag, 
          includeDiagramFlag,
          true // Force LLM format
        )
      )
      console.log(`JSON documentation written to ${jsonPath}`)
    }
  } catch (e) {
    throw e
  } finally {
    await database.disconnect()
  }
}