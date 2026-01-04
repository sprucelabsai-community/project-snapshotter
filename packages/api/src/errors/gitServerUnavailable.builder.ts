import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'gitServerUnavailable',
    name: 'Git server unavailable',
    fields: {
        url: {
            type: 'text',
            label: 'Server URL',
            isRequired: true,
        },
    },
})
