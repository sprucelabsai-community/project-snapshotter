import { exec } from 'child_process'
import { promisify } from 'util'
import SpruceError from './errors/SpruceError'
import { getPackageVersion } from './utilities/version'

const execAsync = promisify(exec)

export default class GitCommandRunner {
    public async exec(
        command: string
    ): Promise<{ stdout: string; stderr: string }> {
        return await execAsync(command)
    }

    public async execOrThrow(
        command: string
    ): Promise<{ stdout: string; stderr: string }> {
        try {
            return await execAsync(command)
        } catch (err) {
            const error = err as Error & { stdout?: string; stderr?: string }
            const stdout = error.stdout ?? ''
            const stderr = error.stderr ?? ''
            throw new SpruceError({
                code: 'EXEC_COMMAND_FAILED',
                command,
                stdout,
                stderr,
                version: getPackageVersion(),
            })
        }
    }
}
