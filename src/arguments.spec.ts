import { parseArguments } from './arguments'

describe('arguments', () => {
  it('can parse CLI arguments to an object', () => {
    const args = ['', '', '--config=something']
    expect(parseArguments(args)).toEqual({ config: 'something' })
  })

  it('gracefully handles no arguments', () => {
    const args = ['', '']
    expect(parseArguments(args)).toEqual({})
  })
})
