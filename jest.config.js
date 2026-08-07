/**
 * @format
 * @type {import('ts-jest').JestConfigWithTsJest}
 * */

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    reporters: [
        "default",
        [
            "./node_modules/jest-html-reporters",
            {
                //输出页面标题
                pageTitle: "Tianyu Store Unit Test",
                //插件将会输出的HTML报告的路径。
                publicPath: "test/__report__/unit",
                //为每个失败的测试输出详细的失败消息。
                includeFailureMsg: true,
                expand: true,
                filename: "test-report.html",
            },
        ],
    ],
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    coverageDirectory: "test/__report__/coverage",
    coveragePathIgnorePatterns: ["<rootDir>/test/unit/content"],
    moduleNameMapper: {
        "^src/(.*)$": "<rootDir>/src/$1",
        "^test/(.*)$": "<rootDir>/test/$1",
    },
    setupFiles: ["./test/env/init-env.js"],
    // modulePathIgnorePatterns: ["<rootDir>/src/index.ts"],
};
