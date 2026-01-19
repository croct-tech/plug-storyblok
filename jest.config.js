export default {
    roots: ['<rootDir>'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    transform: {
        '^.+\\.ts$': '@swc/jest',
    },
    restoreMocks: true,
    resetMocks: true,
};
