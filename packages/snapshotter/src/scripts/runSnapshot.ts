import {
    existsSync,
    mkdirSync,
    readFileSync,
    unlinkSync,
    writeFileSync,
} from 'fs'
import path from 'path'
import { buildLog } from '@sprucelabs/spruce-skill-utils'
import { gitCommit, gitPush } from '../git.js'
import { SnapshotOptions } from '../snapshotter.types.js'
import { syncFiles } from '../sync.js'

const ERROR_FILE_NAME = 'lastError.json'
const LOCK_FILE_NAME = 'snapshot.lock'
const PENDING_FILE_NAME = 'pending.json'
const log = buildLog('Snapshotter')

async function main() {
    const snapshotterDir = process.argv[2]

    if (!snapshotterDir) {
        console.error('Usage: runSnapshot <snapshotter-dir>')
        process.exit(1)
    }

    const lockPath = path.join(snapshotterDir, LOCK_FILE_NAME)

    if (existsSync(lockPath)) {
        log.info('Another snapshot is running, exiting')
        process.exit(0)
    }

    try {
        writeFileSync(lockPath, process.pid.toString())
        await processLoop(snapshotterDir)
    } finally {
        if (existsSync(lockPath)) {
            unlinkSync(lockPath)
        }
    }
}

async function processLoop(snapshotterDir: string): Promise<void> {
    const pendingPath = path.join(snapshotterDir, PENDING_FILE_NAME)

    while (existsSync(pendingPath)) {
        const options: SnapshotOptions = JSON.parse(
            readFileSync(pendingPath, 'utf-8')
        )

        unlinkSync(pendingPath)

        await executeSnapshot(options)
    }
}

async function executeSnapshot(options: SnapshotOptions): Promise<void> {
    const sourcePath = options.sourcePath ?? process.cwd()
    const { mirrorPath, testResults, remote } = options

    log.info('Starting snapshot', sourcePath, mirrorPath)

    try {
        await syncFiles(sourcePath, mirrorPath)
        log.info('Files synced', mirrorPath)

        const snapshotterDir = path.join(mirrorPath, '.snapshotter')
        mkdirSync(snapshotterDir, { recursive: true })
        writeFileSync(
            path.join(snapshotterDir, 'testResults.json'),
            JSON.stringify(sortTestResults(testResults), null, 2)
        )
        log.info('Test results saved', snapshotterDir)

        const committed = await gitCommit(mirrorPath, log)

        if (!committed) {
            log.info('No changes to commit', mirrorPath)
            clearError(mirrorPath)
            return
        }

        log.info('Commit created, pushing', remote.url)
        await gitPush(mirrorPath, remote, log)
        log.info('Push completed', remote.url)

        clearError(mirrorPath)
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        log.error('Snapshot failed (will surface on next test run)', message)
        persistError(mirrorPath, err)
    }
}

function persistError(mirrorPath: string, err: unknown): void {
    const snapshotterDir = path.join(mirrorPath, '.snapshotter')
    mkdirSync(snapshotterDir, { recursive: true })

    const errorPath = getErrorFilePath(mirrorPath)
    const errorData = {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
    }

    writeFileSync(errorPath, JSON.stringify(errorData, null, 2))
}

function clearError(mirrorPath: string): void {
    const errorPath = getErrorFilePath(mirrorPath)

    if (existsSync(errorPath)) {
        unlinkSync(errorPath)
    }
}

function getErrorFilePath(mirrorPath: string): string {
    return path.join(mirrorPath, '.snapshotter', ERROR_FILE_NAME)
}

function sortTestResults(
    testResults: SnapshotOptions['testResults']
): SnapshotOptions['testResults'] {
    const suites = [...testResults.suites].map((suite) => ({
        ...suite,
        tests: [...suite.tests].sort((left, right) =>
            left.name.localeCompare(right.name)
        ),
    }))
    suites.sort((left, right) => left.path.localeCompare(right.path))

    const typeErrors = testResults.typeErrors
        ? [...testResults.typeErrors].sort((left, right) => {
              const fileCompare = left.file.localeCompare(right.file)
              if (fileCompare !== 0) {
                  return fileCompare
              }
              const lineCompare = left.line - right.line
              if (lineCompare !== 0) {
                  return lineCompare
              }
              return left.column - right.column
          })
        : undefined

    return {
        ...testResults,
        suites,
        typeErrors,
    }
}

main().catch((err) => {
    console.error('Snapshot script failed:', err)
    process.exit(1)
})
