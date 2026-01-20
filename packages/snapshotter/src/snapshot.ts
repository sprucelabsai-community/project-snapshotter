import { spawn } from 'child_process'
import {
    existsSync,
    mkdirSync,
    readFileSync,
    unlinkSync,
    writeFileSync,
} from 'fs'
import path from 'path'
import { buildLog } from '@sprucelabs/spruce-skill-utils'
import { SnapshotOptions } from './snapshotter.types.js'

const ERROR_FILE_NAME = 'lastError.json'
const log = buildLog('Snapshotter')
const scriptPath = path.join(__dirname, 'scripts', 'runSnapshot.js')

export function snapshot(options: SnapshotOptions): void {
    const snapshotterDir = writeOptionsFile(options)
    spawnSnapshotProcess(snapshotterDir)

    log.info('Snapshot queued (running in background)', options.mirrorPath)
}

export function checkForPreviousSnapshotFailure(mirrorPath: string): void {
    const errorPath = getErrorFilePath(mirrorPath)

    if (existsSync(errorPath)) {
        const errorData = JSON.parse(readFileSync(errorPath, 'utf-8'))
        unlinkSync(errorPath)

        throw new Error(
            `Previous snapshot failed: ${errorData.message}\n` +
                `Timestamp: ${errorData.timestamp}\n` +
                `This error was from a background snapshot that failed. ` +
                `The snapshot has been retried - if this error persists, check your configuration.`
        )
    }
}

function writeOptionsFile(options: SnapshotOptions): string {
    const snapshotterDir = path.join(options.mirrorPath, '.snapshotter')
    mkdirSync(snapshotterDir, { recursive: true })

    const optionsPath = path.join(snapshotterDir, 'pending.json')
    writeFileSync(optionsPath, JSON.stringify(options, null, 2))

    return snapshotterDir
}

function spawnSnapshotProcess(snapshotterDir: string): void {
    const child = spawn('node', [scriptPath, snapshotterDir], {
        detached: true,
        stdio: 'ignore',
    })

    child.unref()
}

function getErrorFilePath(mirrorPath: string): string {
    return path.join(mirrorPath, '.snapshotter', ERROR_FILE_NAME)
}
