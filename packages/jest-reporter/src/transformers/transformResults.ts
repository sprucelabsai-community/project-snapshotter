import path from 'path'
import type { AggregatedResult } from '@jest/reporters'
import type {
    TestResults,
    SuiteResult,
    TestResult,
} from '@regressionproof/snapshotter'

export function transformResults(
    jestResults: AggregatedResult,
    cwd: string
): TestResults {
    const suites: SuiteResult[] = jestResults.testResults.map((suiteResult) => {
        const tests: TestResult[] = suiteResult.testResults.map((test) => ({
            name: test.fullName || test.title,
            passed: test.status === 'passed',
            error:
                test.status === 'failed' && test.failureMessages.length > 0
                    ? test.failureMessages.join('\n\n')
                    : undefined,
        }))

        const suitePassed = tests.every((t) => t.passed)

        return {
            path: path.relative(cwd, suiteResult.testFilePath),
            passed: suitePassed,
            tests,
        }
    })

    return {
        timestamp: new Date().toISOString(),
        summary: {
            totalSuites: jestResults.numTotalTestSuites,
            passedSuites: jestResults.numPassedTestSuites,
            failedSuites: jestResults.numFailedTestSuites,
            totalTests: jestResults.numTotalTests,
            passedTests: jestResults.numPassedTests,
            failedTests: jestResults.numFailedTests,
        },
        suites,
    }
}
