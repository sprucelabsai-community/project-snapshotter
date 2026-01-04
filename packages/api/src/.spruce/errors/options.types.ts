import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface ProjectNotFoundErrorOptions extends SpruceErrors.RegressionproofApi.ProjectNotFound, ISpruceErrorOptions {
	code: 'PROJECT_NOT_FOUND'
}
export interface ProjectAlreadyExistsErrorOptions extends SpruceErrors.RegressionproofApi.ProjectAlreadyExists, ISpruceErrorOptions {
	code: 'PROJECT_ALREADY_EXISTS'
}
export interface GitServerUnavailableErrorOptions extends SpruceErrors.RegressionproofApi.GitServerUnavailable, ISpruceErrorOptions {
	code: 'GIT_SERVER_UNAVAILABLE'
}
export interface GitServerErrorErrorOptions extends SpruceErrors.RegressionproofApi.GitServerError, ISpruceErrorOptions {
	code: 'GIT_SERVER_ERROR'
}

type ErrorOptions =  | ProjectNotFoundErrorOptions  | ProjectAlreadyExistsErrorOptions  | GitServerUnavailableErrorOptions  | GitServerErrorErrorOptions 

export default ErrorOptions
