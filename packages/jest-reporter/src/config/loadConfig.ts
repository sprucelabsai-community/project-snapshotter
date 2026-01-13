import { execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

export function loadConfig(cwd: string): ReporterConfig | null {
    const projectName = detectProjectName(cwd)
    if (!projectName) {
        return null
    }

    const baseDir = path.join(os.homedir(), '.regressionproof')
    const configPath = path.join(baseDir, projectName, 'config.json')

    if (!fs.existsSync(configPath)) {
        return null
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

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
    const localConfigPath = path.join(cwd, '.regressionproof.json')
    if (fs.existsSync(localConfigPath)) {
        const localConfig = JSON.parse(
            fs.readFileSync(localConfigPath, 'utf-8')
        )
        if (localConfig.projectName) {
            return localConfig.projectName
        }
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

export interface ReporterConfig {
    projectName: string
    mirrorPath: string
    remote: {
        url: string
        token: string
    }
}
