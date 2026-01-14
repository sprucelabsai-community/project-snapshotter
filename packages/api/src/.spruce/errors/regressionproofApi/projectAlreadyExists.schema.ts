import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const projectAlreadyExistsSchema: SpruceErrors.RegressionproofApi.ProjectAlreadyExistsSchema  = {
	id: 'projectAlreadyExists',
	namespace: 'RegressionproofApi',
	name: 'Project already exists',
	    fields: {
	            /** Project name. */
	            'name': {
	                label: 'Project name',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	            /** . */
	            'version': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(projectAlreadyExistsSchema)

export default projectAlreadyExistsSchema
