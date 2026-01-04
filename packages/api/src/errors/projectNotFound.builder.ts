import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'projectNotFound',
    name: 'project not found',
    fields: {
        name: {
            type: 'text',
            label: 'Project name',
            isRequired: true,
        },
    },
})
