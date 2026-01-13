import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'





export declare namespace SpruceErrors.RegressionproofJestReporter {

	
	export interface ProjectNotInitialized {
		
			
			'projectName': string
	}

	export interface ProjectNotInitializedSchema extends SpruceSchema.Schema {
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

	export type ProjectNotInitializedEntity = SchemaEntity<SpruceErrors.RegressionproofJestReporter.ProjectNotInitializedSchema>

}




