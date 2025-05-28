module.exports = {
  // preset: 'ts-jest', // Removing the preset again
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Handle CSS imports (if any in components, though current ones use inline styles)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    // Handle module aliases
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      // Override tsconfig.json's "jsx": "preserve" for Jest
      // "react-jsx" is common for React 17+
      // "react" for older versions or if "react-jsx" causes issues
      compilerOptions: {
        jsx: 'react-jsx',
      },
    }],
  },
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts', // No need to test declaration files
    '!src/**/layout.tsx', // Typically, layout files are simple and don't need extensive testing
    '!src/**/not-found.tsx', // Or other special Next.js files if not relevant
  ],
};
