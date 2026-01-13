import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const execCommandFailedSchema: SpruceErrors.RegressionproofSnapshotter.ExecCommandFailedSchema  = {
	id: 'execCommandFailed',
	namespace: 'RegressionproofSnapshotter',
	name: 'Exec command failed',
	    fields: {
	            /** . The command that was attempted */
	            'command': {
	                type: 'text',
	                isRequired: true,
	                hint: 'The command that was attempted',
	                options: undefined
	            },
	            /** . */
	            'stdout': {
	                type: 'text',
	                options: undefined
	            },
	            /** . */
	            'stderr': {
	                type: 'text',
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(execCommandFailedSchema)

export default execCommandFailedSchema
