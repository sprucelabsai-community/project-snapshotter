import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'projectAlreadyExists',
    name: 'Project already exists',
    fields: {
        name: {
            type: 'text',
            label: 'Project name',
            isRequired: true,
        },
    },
})
