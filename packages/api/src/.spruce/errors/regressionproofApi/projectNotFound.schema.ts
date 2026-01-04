import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const projectNotFoundSchema: SpruceErrors.RegressionproofApi.ProjectNotFoundSchema  = {
	id: 'projectNotFound',
	namespace: 'RegressionproofApi',
	name: 'project not found',
	    fields: {
	            /** Project name. */
	            'name': {
	                label: 'Project name',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(projectNotFoundSchema)

export default projectNotFoundSchema
