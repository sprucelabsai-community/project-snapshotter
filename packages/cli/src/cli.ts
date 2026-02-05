#!/usr/bin/env node
import 'dotenv/config'
import { runCommand } from './commands/CommandRunner.js'
import { getCommandHandler } from './commands/commands.js'

const command = process.argv[2]
const commandArgs = process.argv.slice(3)

const handler = getCommandHandler(command)
if (!handler) {
    void runCommand({
        heading: 'RegressionProof CLI',
        handler: () => {
            console.log('Usage: regressionproof <command>')
            console.log('')
            console.log('Commands:')
            console.log('  init [projectName]    Initialize a new project')
            console.log('  invite ...            Manage project invites')
            console.log('  doctor                Check project configuration')
            process.exit(1)
        },
    })
} else {
    void runCommand({
        heading: handler.heading,
        isInk: handler.isInk,
        handler: () => handler.run(commandArgs),
    })
}
