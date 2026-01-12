import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface GitServerErrorErrorOptions extends SpruceErrors.RegressionproofClient.GitServerError, ISpruceErrorOptions {
	code: 'GIT_SERVER_ERROR'
}

type ErrorOptions =  | GitServerErrorErrorOptions 

export default ErrorOptions
