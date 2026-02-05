import DoctorContext from '../DoctorContext.js'
import type { DoctorResult } from '../DoctorResult.js'

export default class ApiReachabilityCheck {
    public async run(context: DoctorContext): Promise<DoctorResult> {
        const checkName = `rp-doctor-${Date.now()}`
        const url = `${context.apiUrl}/check-name/${checkName}`

        try {
            const response = await fetch(url, { method: 'GET' })
            if (response.ok) {
                return {
                    status: 'ok',
                    name: 'API reachability',
                    details: [`API responded at ${context.apiUrl}.`],
                }
            }

            if (response.status === 502) {
                return {
                    status: 'warn',
                    name: 'API reachability',
                    details: [
                        'API is reachable, but Git server communication failed (502).',
                    ],
                    fix: 'Check the Git server connectivity or API configuration.',
                }
            }

            return {
                status: 'warn',
                name: 'API reachability',
                details: [`API responded with status ${response.status}.`],
                fix: 'Verify REGRESSIONPROOF_API_URL or check API logs.',
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            return {
                status: 'fail',
                name: 'API reachability',
                details: [`API request failed: ${message}`],
                fix: 'Check your network or verify REGRESSIONPROOF_API_URL.',
            }
        }
    }
}
