import { SnapshotOptions } from '../snapshotter.types'

export default interface SnapshotStrategy {
    execute(options: SnapshotOptions): Promise<void> | void
}
