module.exports = {
    roots: ['<rootDir>/lib'],
    transform: {
      '^.+\\.ts?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
    moduleFileExtensions: ['ts', 'js', 'jsx', 'json', 'node'],
    collectCoverage: true,
    coverageDirectory: "./coverage",
    coverageThreshold: {
      global: {
          functions: 70,
          lines: 80,
          statements: 80,
      },
    },
  }