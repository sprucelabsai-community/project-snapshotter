import GitCommandRunner from './GitCommandRunner'

export default class MirrorSyncer {
    private commandRunner = new GitCommandRunner()

    public async syncBlocking(mirrorPath: string): Promise<void> {
        await this.commandRunner.execOrThrow(
            `git -C "${mirrorPath}" fetch origin`
        )

        const branch = await this.getCurrentBranch(mirrorPath)
        const remoteBranchExists = await this.checkRemoteBranchExists(
            mirrorPath,
            branch
        )

        if (remoteBranchExists) {
            await this.commandRunner.execOrThrow(
                `git -C "${mirrorPath}" rebase -X theirs origin/${branch}`
            )
        }
    }

    /**
     * Fire-and-forget sync to avoid slowing down callers like doctor --fix.
     */
    public syncInBackground(mirrorPath: string): void {
        void this.syncBlocking(mirrorPath)
    }

    private async getCurrentBranch(mirrorPath: string): Promise<string> {
        const { stdout } = await this.commandRunner.exec(
            `git -C "${mirrorPath}" rev-parse --abbrev-ref HEAD`
        )
        return stdout.trim()
    }

    private async checkRemoteBranchExists(
        mirrorPath: string,
        branch: string
    ): Promise<boolean> {
        try {
            const { stdout } = await this.commandRunner.exec(
                `git -C "${mirrorPath}" ls-remote --heads origin ${branch}`
            )
            return stdout.trim().length > 0
        } catch {
            return false
        }
    }
}
