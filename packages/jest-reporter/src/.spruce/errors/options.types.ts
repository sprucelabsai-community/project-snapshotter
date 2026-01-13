import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface ProjectNotInitializedErrorOptions extends SpruceErrors.RegressionproofJestReporter.ProjectNotInitialized, ISpruceErrorOptions {
	code: 'PROJECT_NOT_INITIALIZED'
}

type ErrorOptions =  | ProjectNotInitializedErrorOptions 

export default ErrorOptions
