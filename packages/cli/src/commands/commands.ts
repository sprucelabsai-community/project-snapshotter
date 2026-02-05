import { render } from 'ink'
import React from 'react'
import CommandLayout from '../components/CommandLayout.js'
import Doctor from '../components/Doctor.js'
import Init from '../components/Init.js'
import DoctorOutput from '../doctor/DoctorOutput.js'
import DoctorRunner from '../doctor/DoctorRunner.js'
import acceptInvite from './invite/AcceptInvite.js'
import createInvite from './invite/CreateInvite.js'
import listInvites from './invite/ListInvites.js'
import revokeInvite from './invite/RevokeInvite.js'

const commandHandlers: Record<string, CommandHandler> = {
    init: {
        heading: 'RegressionProof Init',
        isInk: true,
        run: (args) => {
            const projectName = args[0]
            render(
                React.createElement(
                    CommandLayout,
                    { heading: 'RegressionProof Init' },
                    React.createElement(Init, { projectName })
                )
            )
        },
    },
    invite: {
        heading: 'RegressionProof Invite',
        run: async (args) => {
            const subcommand = args[0]
            const arg = args[1]

            if (subcommand === 'create') {
                const noteArg = args.find((value) =>
                    value.startsWith('--note=')
                )
                const note = noteArg
                    ? noteArg.replace('--note=', '')
                    : undefined
                await createInvite(arg, note)
                return
            }

            if (subcommand === 'accept') {
                if (!arg) {
                    throw new Error(
                        'Usage: regressionproof invite accept <token>'
                    )
                }
                await acceptInvite(arg)
                return
            }

            if (subcommand === 'list') {
                await listInvites(arg)
                return
            }

            if (subcommand === 'revoke') {
                if (!arg) {
                    throw new Error(
                        'Usage: regressionproof invite revoke <token>'
                    )
                }
                await revokeInvite(arg)
                return
            }

            throw new Error(
                'Usage: regressionproof invite <create|accept|list|revoke>'
            )
        },
    },
    doctor: {
        heading: 'RegressionProof Doctor',
        isInk: true,
        run: async (args) => {
            const options = parseDoctorArgs(args)
            if (options.help) {
                console.log('RegressionProof Doctor')
                console.log('')
                console.log(
                    'Usage:\n  regressionproof doctor [--fix] [--json] [--cwd <path>]'
                )
                console.log('')
                console.log('Options:')
                console.log(
                    '  --fix     Attempt safe fixes (currently only mirror sync)'
                )
                console.log('  --json    Output machine-readable JSON')
                console.log('  --cwd     Run checks for a specific directory')
                console.log('  --help    Show this help')
                process.exit(0)
            }
            const results = await DoctorRunner.run({
                cwd: options.cwd,
                fix: options.fix,
            })
            if (options.json) {
                console.log(JSON.stringify(results, null, 2))
                process.exit(DoctorOutput.exitCode(results))
                return
            }

            const { waitUntilExit } = render(
                React.createElement(
                    CommandLayout,
                    { heading: 'RegressionProof Doctor' },
                    React.createElement(Doctor, { results })
                )
            )
            await waitUntilExit()
            process.exit(DoctorOutput.exitCode(results))
        },
    },
}

export function getCommandHandler(command?: string): CommandHandler | null {
    if (!command) {
        return null
    }
    return commandHandlers[command] ?? null
}

function parseDoctorArgs(args: string[]): DoctorArgs {
    const options: DoctorArgs = { json: false, fix: false, help: false }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '--json') {
            options.json = true
            continue
        }
        if (arg === '--fix') {
            options.fix = true
            continue
        }
        if (arg === '--help' || arg === '-h') {
            options.help = true
            continue
        }
        if (arg === '--cwd') {
            const value = args[i + 1]
            if (value) {
                options.cwd = value
                i++
            }
        }
    }

    return options
}

interface DoctorArgs {
    json: boolean
    cwd?: string
    fix: boolean
    help: boolean
}

interface CommandHandler {
    heading: string
    isInk?: boolean
    run: (args: string[]) => Promise<void> | void
}
