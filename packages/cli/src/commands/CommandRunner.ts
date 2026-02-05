import { renderBanner } from '../utilities/renderBanner.js'

export async function runCommand(options: RunCommandOptions): Promise<void> {
    renderBanner()

    if (!options.isInk && options.heading) {
        console.log(options.heading)
    }

    try {
        await options.handler()
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(message)
        process.exit(1)
    }
}

interface RunCommandOptions {
    heading?: string
    isInk?: boolean
    handler: () => Promise<void> | void
}
