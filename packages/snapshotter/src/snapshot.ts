import { mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { gitCommit, gitPush } from './git.js'
import { SnapshotOptions } from './snapshotter.types.js'
import { syncFiles } from './sync.js'

export async function snapshot(options: SnapshotOptions): Promise<boolean> {
    const sourcePath = options.sourcePath ?? process.cwd()
    const { mirrorPath, testResults, remote } = options

    await syncFiles(sourcePath, mirrorPath)

    const snapshotterDir = path.join(mirrorPath, '.snapshotter')
    mkdirSync(snapshotterDir, { recursive: true })
    writeFileSync(
        path.join(snapshotterDir, 'testResults.json'),
        JSON.stringify(testResults, null, 2)
    )

    const committed = await gitCommit(mirrorPath)

    if (committed) {
        await gitPush(mirrorPath, remote)
    }

    return committed
}
