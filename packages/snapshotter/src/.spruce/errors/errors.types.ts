import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'





export declare namespace SpruceErrors.RegressionproofSnapshotter {

	
	export interface ExecCommandFailed {
		
			/** . The command that was attempted */
			'command': string
			
			'stdout'?: string | undefined | null
			
			'stderr'?: string | undefined | null
	}

	export interface ExecCommandFailedSchema extends SpruceSchema.Schema {
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

	export type ExecCommandFailedEntity = SchemaEntity<SpruceErrors.RegressionproofSnapshotter.ExecCommandFailedSchema>

}




