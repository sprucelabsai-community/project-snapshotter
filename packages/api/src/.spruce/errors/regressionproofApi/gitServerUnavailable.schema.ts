import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const gitServerUnavailableSchema: SpruceErrors.RegressionproofApi.GitServerUnavailableSchema  = {
	id: 'gitServerUnavailable',
	namespace: 'RegressionproofApi',
	name: 'Git server unavailable',
	    fields: {
	            /** Server URL. */
	            'url': {
	                label: 'Server URL',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(gitServerUnavailableSchema)

export default gitServerUnavailableSchema
