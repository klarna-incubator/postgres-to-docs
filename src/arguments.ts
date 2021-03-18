export const parseArguments = (argv: string[]) => {
  const [_, __, ...args] = argv
  return args
    .map((arg) => {
      if (!arg.startsWith('--')) return {}
      const [flag, value] = arg.split('=')
      const withoutDashes = flag.slice(2)
      return { [withoutDashes]: value }
    })
    .reduce((acc, next) => ({ ...acc, ...next }), {})
}
