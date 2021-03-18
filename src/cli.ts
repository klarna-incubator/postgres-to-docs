#!/usr/bin/env node

import { generateDocumentation } from '.'
import { parseArguments } from './arguments'

const run = async () => {
  const rawArguments = parseArguments(process.argv)
  if (!rawArguments.config || !rawArguments.output) {
    console.log('failed, "--config" and "--output" required')
    process.exit(1)
  }

  try {
    await generateDocumentation(rawArguments.config, rawArguments.output)
  } catch (e) {
    console.log('Failed', e)
    process.exit(1)
  }
}

run()
