import type {
    AggregatedResult,
    Reporter,
    ReporterOnStartOptions,
    Test,
    TestContext,
} from '@jest/reporters'

export default class RegressionProofReporter implements Reporter {
    public onRunStart(
        _results: AggregatedResult,
        _options: ReporterOnStartOptions
    ): void {
        // Called when test run starts
    }

    public onTestStart(_test: Test): void {
        // Called when individual test file starts
    }

    public onRunComplete(
        _testContexts: Set<TestContext>,
        results: AggregatedResult
    ): Promise<void> | void {
        // Called when all tests complete - this is where we snapshot
        console.log('[RegressionProof] Test run complete, creating snapshot...')
        console.log(
            `[RegressionProof] ${results.numPassedTests} passed, ${results.numFailedTests} failed`
        )

        // TODO: Transform results to our format
        // TODO: Load config (.regressionproof.json)
        // TODO: Call snapshotter
    }

    public getLastError(): Error | void {
        // Return error if reporter had issues
        return undefined
    }
}
