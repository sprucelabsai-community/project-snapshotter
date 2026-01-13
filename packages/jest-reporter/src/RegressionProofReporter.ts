import type {
    AggregatedResult,
    Reporter,
    ReporterOnStartOptions,
    Test,
    TestCaseResult,
    TestContext,
} from '@jest/reporters'
import { snapshot } from '@regressionproof/snapshotter'
import { loadConfig } from './config/loadConfig.js'
import { transformResults } from './transformers/transformResults.js'

export default class RegressionProofReporter implements Reporter {
    private cwd: string
    private isCi: boolean

    public constructor(_globalConfig?: unknown, _reporterConfig?: unknown) {
        this.cwd = process.cwd()
        this.isCi = process.env.CI === 'true' || process.env.IS_CI === 'true'
    }

    public onRunStart(
        _results: AggregatedResult,
        _options: ReporterOnStartOptions
    ): void {}

    public onTestFileStart(_test: Test): void {}

    public onTestCaseResult(
        _test: Test,
        _testCaseResult: TestCaseResult
    ): void {}

    public async onRunComplete(
        _testContexts: Set<TestContext>,
        results: AggregatedResult
    ): Promise<void> {
        const config = loadConfig(this.cwd)

        if (this.isCi) {
            console.log('[RegressionProof] CI detected; skipping snapshot')
            return
        }

        if (!config) {
            console.log(
                '[RegressionProof] No config found. Run `regressionproof init` to set up.'
            )
            return
        }

        const testResults = transformResults(results, this.cwd)

        console.log(
            `[RegressionProof] ${testResults.summary.passedTests}/${testResults.summary.totalTests} tests passed`
        )

        try {
            const committed = await snapshot({
                sourcePath: this.cwd,
                mirrorPath: config.mirrorPath,
                testResults,
                remote: config.remote,
            })

            if (committed) {
                console.log('[RegressionProof] Snapshot captured successfully')
            } else {
                console.log('[RegressionProof] No changes to snapshot')
            }
        } catch (err) {
            console.error(
                '[RegressionProof] Failed to capture snapshot:',
                err instanceof Error ? err.message : err
            )
        }
    }

    public getLastError(): Error | void {
        return undefined
    }
}
