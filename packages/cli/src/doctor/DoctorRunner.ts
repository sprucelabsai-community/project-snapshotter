import Doctor from './Doctor.js'
import DoctorContext from './DoctorContext.js'
import type { DoctorResult } from './DoctorResult.js'

export default class DoctorRunner {
    public static async run(
        options?: DoctorRunOptions
    ): Promise<DoctorResult[]> {
        const cwd = options?.cwd ?? process.cwd()
        const apiUrl =
            options?.apiUrl ??
            process.env.REGRESSIONPROOF_API_URL ??
            'https://api.regressionproof.ai'
        const fix = options?.fix ?? false
        const context = DoctorContext.fromCwd(cwd, apiUrl, fix)
        return new Doctor(context).run()
    }
}

export interface DoctorRunOptions {
    cwd?: string
    apiUrl?: string
    fix?: boolean
}
