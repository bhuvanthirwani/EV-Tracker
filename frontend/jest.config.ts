import type { Config } from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
	return {
		verbose: true,
		collectCoverage: true,
		clearMocks: true,
		rootDir: './',
		moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
		transform: {
			'^.+\\.tsx?$': 'babel-jest',
		  },
		testMatch: ['**/*.test.ts?(x)'],
		testPathIgnorePatterns: ['node_modules', 'dist', '.github'],

	};
};
