import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const gitServerErrorSchema: SpruceErrors.RegressionproofApi.GitServerErrorSchema  = {
	id: 'gitServerError',
	namespace: 'RegressionproofApi',
	name: 'git server error',
	    fields: {
	            /** Error message. */
	            'message': {
	                label: 'Error message',
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(gitServerErrorSchema)

export default gitServerErrorSchema
