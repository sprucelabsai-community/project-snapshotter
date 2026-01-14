import { exec } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'
import { promisify } from 'util'
import { Log } from '@sprucelabs/spruce-skill-utils'
import SpruceError from './errors/SpruceError.js'
import { RemoteOptions } from './snapshotter.types.js'
import { getPackageVersion } from './utilities/version.js'

const execAsync = promisify(exec)

export async function gitCommit(
    mirrorPath: string,
    log?: Log
): Promise<boolean> {
    const gitDir = path.join(mirrorPath, '.git')

    if (!existsSync(gitDir)) {
        await execOrThrow(`git -C "${mirrorPath}" init`, log)
    }

    await execOrThrow(`git -C "${mirrorPath}" add -A`, log)

    const { stdout } = await execOrThrow(
        `git -C "${mirrorPath}" status --porcelain`
    )
    if (!stdout.trim()) {
        log?.info('No changes detected for commit', mirrorPath)
        return false
    }

    const message = `Snapshot ${new Date().toISOString()}`
    await execOrThrow(`git -C "${mirrorPath}" commit -m "${message}"`, log)
    return true
}

export async function gitPush(
    mirrorPath: string,
    remote: RemoteOptions,
    log?: Log
): Promise<void> {
    const authedUrl = remote.url.replace('://', `://${remote.token}@`)

    const originExists = await remoteExists(mirrorPath, 'origin')
    if (originExists) {
        await execOrThrow(
            `git -C "${mirrorPath}" remote set-url origin "${authedUrl}"`
        )
    } else {
        await execOrThrow(
            `git -C "${mirrorPath}" remote add origin "${authedUrl}"`
        )
    }

    await pullFromRemote(mirrorPath, log)
    await execOrThrow(`git -C "${mirrorPath}" push -u origin HEAD`, log)
}

async function pullFromRemote(mirrorPath: string, log?: Log): Promise<void> {
    await execOrThrow(`git -C "${mirrorPath}" fetch origin`, log)

    const branch = await getCurrentBranch(mirrorPath)
    const remoteBranchExists = await checkRemoteBranchExists(mirrorPath, branch)

    if (remoteBranchExists) {
        await execOrThrow(`git -C "${mirrorPath}" rebase origin/${branch}`, log)
    }
}

async function getCurrentBranch(mirrorPath: string): Promise<string> {
    const { stdout } = await execAsync(
        `git -C "${mirrorPath}" rev-parse --abbrev-ref HEAD`
    )
    return stdout.trim()
}

async function checkRemoteBranchExists(
    mirrorPath: string,
    branch: string
): Promise<boolean> {
    try {
        const { stdout } = await execAsync(
            `git -C "${mirrorPath}" ls-remote --heads origin ${branch}`
        )
        return stdout.trim().length > 0
    } catch {
        return false
    }
}

async function remoteExists(
    mirrorPath: string,
    remoteName: string
): Promise<boolean> {
    try {
        const { stdout } = await execAsync(`git -C "${mirrorPath}" remote`)
        const remotes = stdout.trim().split('\n')
        return remotes.includes(remoteName)
    } catch {
        return false
    }
}

async function execOrThrow(
    command: string,
    log?: Log
): Promise<{ stdout: string; stderr: string }> {
    try {
        return await execAsync(command)
    } catch (err) {
        const error = err as Error & { stdout?: string; stderr?: string }
        const stdout = error.stdout ?? ''
        const stderr = error.stderr ?? ''
        log?.error('Command failed', command, stderr)
        throw new SpruceError({
            code: 'EXEC_COMMAND_FAILED',
            command,
            stdout,
            stderr,
            version: getPackageVersion(),
        })
    }
}
