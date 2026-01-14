import { readFileSync } from 'node:fs'
import path from 'path'

export function getPackageVersion(): string {
    try {
        const packagePath = path.join(__dirname, '../../package.json')
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8')) as {
            version?: string
        }

        return packageJson.version ?? '*** unable to resolve version ***'
    } catch {
        return '*** unable to resolve version ***'
    }
}
