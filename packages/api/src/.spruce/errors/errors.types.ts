import { default as SchemaEntity } from '@sprucelabs/schema'
import * as SpruceSchema from '@sprucelabs/schema'








export declare namespace SpruceErrors.RegressionproofApi {

	
	export interface ProjectNotFound {
		
			/** Project name. */
			'name': string
			
			'version': string
	}

	export interface ProjectNotFoundSchema extends SpruceSchema.Schema {
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
		            /** . */
		            'version': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type ProjectNotFoundEntity = SchemaEntity<SpruceErrors.RegressionproofApi.ProjectNotFoundSchema>

}


export declare namespace SpruceErrors.RegressionproofApi {

	
	export interface ProjectAlreadyExists {
		
			/** Project name. */
			'name': string
			
			'version': string
	}

	export interface ProjectAlreadyExistsSchema extends SpruceSchema.Schema {
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

	export type ProjectAlreadyExistsEntity = SchemaEntity<SpruceErrors.RegressionproofApi.ProjectAlreadyExistsSchema>

}


export declare namespace SpruceErrors.RegressionproofApi {

	
	export interface GitServerUnavailable {
		
			/** Server URL. */
			'url': string
			
			'version': string
	}

	export interface GitServerUnavailableSchema extends SpruceSchema.Schema {
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
		            /** . */
		            'version': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type GitServerUnavailableEntity = SchemaEntity<SpruceErrors.RegressionproofApi.GitServerUnavailableSchema>

}


export declare namespace SpruceErrors.RegressionproofApi {

	
	export interface GitServerError {
		
			/** Error message. */
			'message': string
			
			'version': string
	}

	export interface GitServerErrorSchema extends SpruceSchema.Schema {
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
		            /** . */
		            'version': {
		                type: 'text',
		                isRequired: true,
		                options: undefined
		            },
		    }
	}

	export type GitServerErrorEntity = SchemaEntity<SpruceErrors.RegressionproofApi.GitServerErrorSchema>

}




