class ConfigService {
    private readonly githubToken: string;
    private readonly freshdeskToken: string;

    constructor() {
        this.githubToken = process.env.GITHUB_TOKEN;
        if (!this.githubToken) {
            throw new Error('GITHUB_TOKEN environment variable is not set');
        }

        this.freshdeskToken = process.env.FRESHDESK_TOKEN;
        if (!this.freshdeskToken) {
            throw new Error('FRESHDESK_TOKEN environment variable is not set');
        }
    }

    /**
     * Get the GitHub token from the environment variables
     */
    getGitHubToken(): string {
        return this.githubToken;
    }

    /**
     * Get the Freshdesk token from the environment variables
     */
    getFreshdeskToken(): string {
        return Buffer.from(this.freshdeskToken).toString('base64');
    }
}

export default ConfigService;
