import { SpruceError } from '@regressionproof/api'

export default class RegressionProofClient {
    private baseUrl: string

    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    public async checkNameAvailability(name: string): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}/check-name/${name}`)
        const { available } = (await response.json()) as { available: boolean }
        return available
    }

    public async registerProject(
        options: RegisterProjectOptions
    ): Promise<ProjectCredentials> {
        const response = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        })

        if (!response.ok) {
            throw await this.parseErrorResponse(response)
        }

        return response.json()
    }

    public async refreshCredentials(
        options: RegisterProjectOptions
    ): Promise<ProjectCredentials> {
        const response = await fetch(`${this.baseUrl}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
        })

        if (!response.ok) {
            throw await this.parseErrorResponse(response)
        }

        return response.json()
    }

    private async parseErrorResponse(response: Response): Promise<SpruceError> {
        try {
            const body = await response.json()
            if (body.error?.code) {
                return new SpruceError(body.error)
            }
            return new SpruceError({
                code: 'GIT_SERVER_ERROR',
                message: `Request failed: ${response.statusText}`,
            })
        } catch {
            return new SpruceError({
                code: 'GIT_SERVER_ERROR',
                message: `Request failed: ${response.statusText}`,
            })
        }
    }
}

export interface RegisterProjectOptions {
    name: string
}

export interface ProjectCredentials {
    url: string
    token: string
}
