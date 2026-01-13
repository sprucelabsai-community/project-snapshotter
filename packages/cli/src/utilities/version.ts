import { readFileSync } from 'node:fs'

export function getCliVersion(): string {
    const packageUrl = new URL('../../package.json', import.meta.url)
    const packageJson = JSON.parse(readFileSync(packageUrl, 'utf-8')) as {
        version?: string
    }

    if (!packageJson.version) {
        throw new Error('Unable to determine CLI version from package.json')
    }

    return packageJson.version
}
