import { existsSync, unlinkSync } from 'fs'
import path from 'path'
import { Log } from '@sprucelabs/spruce-skill-utils'
import GitCommandRunner from './GitCommandRunner'
import MirrorSyncer from './MirrorSyncer'
import { RemoteOptions } from './snapshotter.types'

const mirrorSyncer = new MirrorSyncer()
const commandRunner = new GitCommandRunner()

export async function gitCommit(
    mirrorPath: string,
    log?: Log
): Promise<boolean> {
    const gitDir = path.join(mirrorPath, '.git')

    if (!existsSync(gitDir)) {
        await execOrThrow(`git -C "${mirrorPath}" init`, log)
    }

    cleanupGitLockFiles(mirrorPath, log)

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
    cleanupGitLockFiles(mirrorPath, log)

    const authedUrl = remote.url.replace('://', `://${remote.token}@`)

    const currentUrl = await getRemoteUrl(mirrorPath, 'origin')
    if (currentUrl === null) {
        await execOrThrow(
            `git -C "${mirrorPath}" remote add origin "${authedUrl}"`
        )
    } else if (currentUrl !== authedUrl) {
        await execOrThrow(
            `git -C "${mirrorPath}" remote set-url origin "${authedUrl}"`
        )
    }

    await pullFromRemote(mirrorPath, log)
    await execOrThrow(`git -C "${mirrorPath}" push -u origin HEAD`, log)
}

async function pullFromRemote(mirrorPath: string, log?: Log): Promise<void> {
    try {
        await mirrorSyncer.syncBlocking(mirrorPath)
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        log?.error('Mirror sync failed', message)
        throw err
    }
}

async function getRemoteUrl(
    mirrorPath: string,
    remoteName: string
): Promise<string | null> {
    try {
        const { stdout } = await commandRunner.exec(
            `git -C "${mirrorPath}" remote get-url ${remoteName}`
        )
        return stdout.trim()
    } catch {
        return null
    }
}

function cleanupGitLockFiles(mirrorPath: string, log?: Log): void {
    const lockFiles = ['config.lock', 'index.lock', 'HEAD.lock']

    for (const lockFile of lockFiles) {
        const lockPath = path.join(mirrorPath, '.git', lockFile)
        if (existsSync(lockPath)) {
            try {
                unlinkSync(lockPath)
                log?.info(`Removed stale lock file: ${lockFile}`)
            } catch {
                log?.warn?.(`Failed to remove lock file: ${lockFile}`)
            }
        }
    }
}

async function execOrThrow(
    command: string,
    log?: Log
): Promise<{ stdout: string; stderr: string }> {
    try {
        return await commandRunner.execOrThrow(command)
    } catch (err) {
        const error = err as Error & { stderr?: string }
        log?.error('Command failed', command, error.stderr ?? error.message)
        throw err
    }
}
