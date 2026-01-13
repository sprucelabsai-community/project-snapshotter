import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'projectNotInitialized',
    name: 'Project not initialized',
    fields: {
        projectName: {
            type: 'text',
            isRequired: true,
        },
    },
})
