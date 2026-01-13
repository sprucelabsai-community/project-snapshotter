import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import LocalConfigUpgrader, { LocalConfig } from './LocalConfigUpgrader.js'

export function loadConfig(cwd: string): ReporterConfig | null {
    const localConfig = readLocalConfig(cwd)
    const projectName = localConfig?.projectName ?? getProjectNameFromGit(cwd)
    if (!projectName) {
        return null
    }

    const baseDir = path.join(os.homedir(), '.regressionproof')
    const configPath = path.join(baseDir, projectName, 'config.json')

    if (!fs.existsSync(configPath)) {
        return null
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    const reporterVersion = getReporterVersion()
    const expectedLocalConfig: LocalConfig = {
        version: reporterVersion,
        projectName,
        remote: {
            url: config.remote.url,
        },
    }
    const upgrader = new LocalConfigUpgrader(reporterVersion)
    const upgradeResult = upgrader.upgrade(localConfig, expectedLocalConfig)
    if (upgradeResult.shouldWrite) {
        writeLocalConfig(cwd, upgradeResult.config)
    }

    return {
        projectName,
        mirrorPath: path.join(baseDir, projectName, 'mirror'),
        remote: {
            url: config.remote.url,
            token: config.remote.token,
        },
    }
}

export function detectProjectName(cwd: string): string | null {
    const localConfig = readLocalConfig(cwd)
    if (localConfig?.projectName) {
        return localConfig.projectName
    }

    return getProjectNameFromGit(cwd)
}

function getProjectNameFromGit(cwd: string): string | null {
    try {
        const remoteUrl = execSync('git remote get-url origin', {
            cwd,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).trim()

        const match = remoteUrl.match(/[/:]([^/:]+?)(\.git)?$/)
        return toSlug(match?.[1] ?? '') || null
    } catch {
        return null
    }
}

function toSlug(input: string): string {
    return input
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

function readLocalConfig(cwd: string): LocalConfig | null {
    const localConfigPath = path.join(cwd, '.regressionproof.json')
    if (!fs.existsSync(localConfigPath)) {
        return null
    }

    try {
        return JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'))
    } catch {
        return null
    }
}

function writeLocalConfig(cwd: string, config: LocalConfig): void {
    const localConfigPath = path.join(cwd, '.regressionproof.json')
    fs.writeFileSync(localConfigPath, JSON.stringify(config, null, 2))
}

function getReporterVersion(): string {
    const packagePath = path.join(__dirname, '../../package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8')) as {
        version?: string
    }

    if (!packageJson.version) {
        throw new Error(
            'Unable to determine reporter version from package.json'
        )
    }

    return packageJson.version
}

export interface ReporterConfig {
    projectName: string
    mirrorPath: string
    remote: {
        url: string
        token: string
    }
}
