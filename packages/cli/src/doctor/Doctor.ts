import ApiReachabilityCheck from './checks/ApiReachabilityCheck.js'
import CredentialsCheck from './checks/CredentialsCheck.js'
import JestReporterCheck from './checks/JestReporterCheck.js'
import LocalConfigCheck from './checks/LocalConfigCheck.js'
import MirrorAccessCheck from './checks/MirrorAccessCheck.js'
import DoctorContext from './DoctorContext.js'
import type { DoctorResult } from './DoctorResult.js'

export default class Doctor {
    public constructor(private context: DoctorContext) {}

    public async run(): Promise<DoctorResult[]> {
        const checks = [
            new LocalConfigCheck(),
            new JestReporterCheck(),
            new CredentialsCheck(),
            new MirrorAccessCheck(),
            new ApiReachabilityCheck(),
        ]

        const results: DoctorResult[] = []
        if (this.context.fix) {
            return this.runFixOnly(checks, results)
        }

        for (const check of checks) {
            results.push(await check.run(this.context))
        }

        return results
    }

    private async runFixOnly(
        checks: FixableCheck[],
        results: DoctorResult[]
    ): Promise<DoctorResult[]> {
        let mirrorResult: DoctorResult | undefined
        for (const check of checks) {
            if (check instanceof MirrorAccessCheck) {
                mirrorResult = await check.run(this.context)
                results.push(mirrorResult)
                break
            }
        }

        if (!mirrorResult) {
            throw new Error(
                'Doctor --fix not implemented (missing mirror check).'
            )
        }

        if (mirrorResult.status === 'fail') {
            throw new Error(
                'Doctor --fix not implemented for this mirror issue.'
            )
        }

        for (const check of checks) {
            if (check instanceof MirrorAccessCheck) {
                continue
            }
            const result = await check.run(this.context)
            results.push(result)
            if (result.status !== 'ok') {
                throw new Error(
                    `Doctor --fix not implemented for ${result.name}.`
                )
            }
        }

        return results
    }
}

interface FixableCheck {
    run: (context: DoctorContext) => Promise<DoctorResult>
}
