import ConfigService from '../../src/services/config.service';

describe('ConfigService', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it('should throw an error if GITHUB_TOKEN is not set', () => {
        process.env.GITHUB_TOKEN = '';
        process.env.FRESHDESK_TOKEN = 'dummy_freshdesk_token';

        expect(() => new ConfigService()).toThrow('GITHUB_TOKEN environment variable is not set');
    });

    it('should throw an error if FRESHDESK_TOKEN is not set', () => {
        process.env.GITHUB_TOKEN = 'dummy_github_token';
        process.env.FRESHDESK_TOKEN = '';

        expect(() => new ConfigService()).toThrow('FRESHDESK_TOKEN environment variable is not set');
    });

    it('should return the GitHub token', () => {
        const githubToken = 'dummy_github_token';
        process.env.GITHUB_TOKEN = githubToken;
        process.env.FRESHDESK_TOKEN = 'dummy_freshdesk_token';

        const configService = new ConfigService();
        expect(configService.getGitHubToken()).toBe(githubToken);
    });

    it('should return the base64 encoded Freshdesk token', () => {
        const freshdeskToken = 'dummy_freshdesk_token';
        process.env.GITHUB_TOKEN = 'dummy_github_token';
        process.env.FRESHDESK_TOKEN = freshdeskToken;

        const configService = new ConfigService();
        const expectedToken = Buffer.from(freshdeskToken).toString('base64');
        expect(configService.getFreshdeskToken()).toBe(expectedToken);
    });
});
