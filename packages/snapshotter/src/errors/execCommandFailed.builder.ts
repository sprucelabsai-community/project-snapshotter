import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'execCommandFailed',
    name: 'Exec command failed',
    fields: {
        command: {
            type: 'text',
            isRequired: true,
            hint: 'The command that was attempted',
        },
        stdout: {
            type: 'text',
        },
        stderr: {
            type: 'text',
        },
    },
})
