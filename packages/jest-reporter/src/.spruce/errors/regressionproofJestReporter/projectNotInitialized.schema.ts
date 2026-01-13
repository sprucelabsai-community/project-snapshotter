import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const projectNotInitializedSchema: SpruceErrors.RegressionproofJestReporter.ProjectNotInitializedSchema  = {
	id: 'projectNotInitialized',
	namespace: 'RegressionproofJestReporter',
	name: 'Project not initialized',
	    fields: {
	            /** . */
	            'projectName': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(projectNotInitializedSchema)

export default projectNotInitializedSchema
