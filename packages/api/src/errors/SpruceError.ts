import BaseSpruceError from '@sprucelabs/error'
import ErrorOptions from '#spruce/errors/options.types'

export default class SpruceError extends BaseSpruceError<ErrorOptions> {
    /** an easy to understand version of the errors */
    public friendlyMessage(): string {
        const { options } = this
        let message
        switch (options?.code) {
            case 'PROJECT_ALREADY_EXISTS':
                message = `Project '${options.name}' already exists!`
                break

            case 'PROJECT_NOT_FOUND':
                message = `Project '${options.name}' was not found!`
                break

            case 'GIT_SERVER_UNAVAILABLE':
                message = `Could not connect to git server at ${options.url}`
                break

            case 'GIT_SERVER_ERROR':
                message = `Git server error: ${options.message}`
                break

            default:
                message = super.friendlyMessage()
        }

        const fullMessage = options.friendlyMessage
            ? options.friendlyMessage
            : message

        return fullMessage
    }
}
