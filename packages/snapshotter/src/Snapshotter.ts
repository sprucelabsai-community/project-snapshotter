import ErrorHandler from './components/ErrorHandler'
import { SnapshotOptions } from './snapshotter.types'
import AsyncStrategy from './strategies/AsyncStrategy'
import SnapshotStrategy from './strategies/SnapshotStrategy'
import SyncStrategy from './strategies/SyncStrategy'

export default class Snapshotter {
    private strategy: SnapshotStrategy

    private constructor(strategy: SnapshotStrategy) {
        this.strategy = strategy
    }

    public static Snapshotter(options?: SnapshotterOptions): Snapshotter {
        const mode = options?.mode ?? 'async'
        const strategy =
            mode === 'sync' ? SyncStrategy.Strategy() : AsyncStrategy.Strategy()

        return new this(strategy)
    }

    public snapshot(options: SnapshotOptions): void | Promise<void> {
        return this.strategy.execute(options)
    }

    public checkForPreviousFailure(mirrorPath: string): void {
        ErrorHandler.Handler().checkForPreviousFailure(mirrorPath)
    }
}

export interface SnapshotterOptions {
    mode?: 'sync' | 'async'
}
