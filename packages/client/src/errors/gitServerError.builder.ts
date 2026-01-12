import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'gitServerError',
    name: 'git server error',
    fields: {
        statusText: {
            type: 'text',
            isRequired: true,
        },
    },
})
