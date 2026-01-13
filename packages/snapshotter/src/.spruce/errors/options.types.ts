import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface ExecCommandFailedErrorOptions extends SpruceErrors.RegressionproofSnapshotter.ExecCommandFailed, ISpruceErrorOptions {
	code: 'EXEC_COMMAND_FAILED'
}

type ErrorOptions =  | ExecCommandFailedErrorOptions 

export default ErrorOptions
