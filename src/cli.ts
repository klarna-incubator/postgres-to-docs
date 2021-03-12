#!/usr/bin/env node

import { generateDocumentation } from '.'

const parseArguments = () => {
  const [_, __, ...args] = process.argv
  return args
    .map((arg) => {
      if (!arg.startsWith('--')) return {}
      const [flag, value] = arg.split('=')
      const withoutDashes = flag.slice(2)
      return { [withoutDashes]: value }
    })
    .reduce((acc, next) => ({ ...acc, ...next }), {})
}

const run = async () => {
  const rawArguments = parseArguments()
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
