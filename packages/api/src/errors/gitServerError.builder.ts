import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'gitServerError',
    name: 'git server error',
    fields: {
        message: {
            type: 'text',
            label: 'Error message',
            isRequired: true,
        },
    },
})
