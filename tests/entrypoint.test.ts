import ConfigService from '../src/services/config.service';
import HttpService from '../src/services/http.service';
import GitHubService from '../src/services/github.service';
import FreshdeskService from '../src/services/freshdesk.service';
import entrypoint from '../src/entrypoint';
import {BadRequestError} from "../src/core/errors";

// Mock the services
jest.mock('../src/services/config.service');
jest.mock('../src/services/http.service');
jest.mock('../src/services/github.service');
jest.mock('../src/services/freshdesk.service');

describe('Entrypoint', () => {
    let configServiceMock: jest.Mocked<ConfigService>;
    let httpServiceMock: jest.Mocked<HttpService>;
    let githubServiceMock: jest.Mocked<GitHubService>;
    let freshdeskServiceMock: jest.Mocked<FreshdeskService>;

    beforeEach(() => {
        configServiceMock = new ConfigService() as jest.Mocked<ConfigService>;
        httpServiceMock = new HttpService() as jest.Mocked<HttpService>;
        githubServiceMock = new GitHubService(configServiceMock, httpServiceMock) as jest.Mocked<GitHubService>;
        freshdeskServiceMock = new FreshdeskService(configServiceMock, httpServiceMock, 'subdomain') as jest.Mocked<FreshdeskService>;

        (ConfigService as jest.Mock).mockImplementation(() => configServiceMock);
        (HttpService as jest.Mock).mockImplementation(() => httpServiceMock);
        (GitHubService as jest.Mock).mockImplementation(() => githubServiceMock);
        (FreshdeskService as jest.Mock).mockImplementation(() => freshdeskServiceMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should sync GitHub user to Freshdesk successfully', async () => {
        const username = 'testuser';
        const subdomain = 'testdomain';
        const mockGitHubUser = {
            name: 'Test User',
            email: 'testuser@example.com',
            id: 12345,
            login: 'testuser',
            avatar_url: 'https://avatars.githubusercontent.com/u/12345',
            twitter_username: 'testuser'
        };

        const mockFreshdeskContact = {
            name: 'Test User',
            email: 'testuser@example.com',
            unique_external_id: '12345',
            twitter_id: 'testuser',
            avatar: new File([''], 'avatar.jpg', {type: 'image/jpeg'})
        };

        const mockFreshdeskResponse = {
            id: 67890,
            name: 'Test User',
            email: 'testuser@example.com',
            unique_external_id: '12345',
            twitter_id: 'testuser',
            avatar: {
                id: 1,
                name: 'avatar.jpg',
                avatar_url: 'https://example.com/avatar.jpg',
            }
        };

        githubServiceMock.getUserInfo.mockResolvedValue(mockGitHubUser);
        freshdeskServiceMock.buildPayloadFromGitHubUser.mockResolvedValue(mockFreshdeskContact);
        freshdeskServiceMock.findContactByEmail.mockResolvedValue(null);
        freshdeskServiceMock.createContact.mockResolvedValue(mockFreshdeskResponse);

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await entrypoint(username, subdomain);

        expect(githubServiceMock.getUserInfo).toHaveBeenCalledWith(username);
        expect(freshdeskServiceMock.buildPayloadFromGitHubUser).toHaveBeenCalledWith(mockGitHubUser);
        expect(freshdeskServiceMock.findContactByEmail).toHaveBeenCalledWith(mockGitHubUser.email);
        expect(freshdeskServiceMock.createContact).toHaveBeenCalledWith(mockFreshdeskContact);
        expect(logSpy).toHaveBeenCalledWith(`Freshdesk contact synced successfully: https://${subdomain}.freshdesk.com/a/contacts/${mockFreshdeskResponse.id}`);

        logSpy.mockRestore();
    });

    it('should update existing Freshdesk contact', async () => {
        const username = 'testuser';
        const subdomain = 'testdomain';

        const mockGitHubUser = {
            id: 12345,
            name: 'Test User 2',
            email: 'testuser2@example.com',
            login: 'testuser2',
            avatar_url: 'https://avatars.githubusercontent.com/u/1',
            twitter_username: 'testuser2'
        };

        const mockUpdatePayload = {
            id: 67890,
            name: 'Test User 2',
            email: 'testuser2@example.com',
            unique_external_id: '12345',
            avatar: new File([''], 'avatar.jpg', {type: 'image/jpeg'}),
        };

        const mockExistingContact = {
            id: 67890,
            name: 'Test User',
            email: 'testuser@example.com',
            unique_external_id: '12345'
        };

        const mockUpdatedContact = {
            id: 67890,
            name: 'Test User 2',
            email: 'testuser2@example.com',
            login: 'testuser2',
            unique_external_id: '12345',
            twitter_id: 'testuser2',
            avatar: {
                id: 1,
                name: 'avatar.jpg',
                avatar_url: 'https://example.com/avatar.jpg',
            }
        };

        githubServiceMock.getUserInfo.mockResolvedValue(mockGitHubUser);
        freshdeskServiceMock.buildPayloadFromGitHubUser.mockResolvedValue(mockUpdatePayload);
        freshdeskServiceMock.findContactByEmail.mockResolvedValue(mockExistingContact);
        freshdeskServiceMock.updateContact.mockResolvedValue(mockUpdatedContact);

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await entrypoint(username, subdomain);

        expect(githubServiceMock.getUserInfo).toHaveBeenCalledWith(username);
        expect(freshdeskServiceMock.buildPayloadFromGitHubUser).toHaveBeenCalledWith(mockGitHubUser);
        expect(freshdeskServiceMock.findContactByEmail).toHaveBeenCalledWith(mockGitHubUser.email);
        expect(freshdeskServiceMock.updateContact).toHaveBeenCalledWith(mockExistingContact.id, mockUpdatePayload);
        expect(logSpy).toHaveBeenCalledWith(`Freshdesk contact synced successfully: https://${subdomain}.freshdesk.com/a/contacts/${mockUpdatedContact.id}`);

        logSpy.mockRestore();
    });

    it('should handle errors and log them', async () => {
        const username = 'testuser';
        const subdomain = 'testdomain';

        const mockGitHubUser = {
            name: 'Test User',
            email: 'testuser@example.com',
            id: 12345,
            login: 'testuser',
            avatar_url: 'https://avatars.githubusercontent.com/u/12345',
            twitter_username: 'testuser'
        };

        githubServiceMock.getUserInfo.mockResolvedValue(mockGitHubUser);
        freshdeskServiceMock.buildPayloadFromGitHubUser.mockResolvedValue({});
        freshdeskServiceMock.findContactByEmail.mockResolvedValue(null);
        freshdeskServiceMock.createContact.mockRejectedValue(new BadRequestError('Bad Request'));

        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await entrypoint(username, subdomain);

        expect(errorSpy).toHaveBeenCalledWith('API Error (400):', 'Bad Request');

        errorSpy.mockRestore();
    });

    it('should handle missing username or subdomain', async () => {
        process.argv = ['node', 'script.js'];

        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await entrypoint('', '');

        expect(errorSpy).toHaveBeenCalledWith('Usage: ts-node githubFreshdeskIntegration.ts <github_username> <freshdesk_subdomain>');

        errorSpy.mockRestore();
    });

    it('should handle missing HitHub user email', async () => {
        const username = 'testuser';
        const subdomain = 'testdomain';

        const mockGitHubUser = {
            name: 'Test User',
            email: null,
            id: 12345,
            login: 'testuser',
            avatar_url: 'https://avatars.githubusercontent.com/u/12345',
            twitter_username: 'testuser'
        };

        githubServiceMock.getUserInfo.mockResolvedValue(mockGitHubUser);

        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await entrypoint(username, subdomain);

        expect(errorSpy).toHaveBeenCalledWith('Error:', 'GitHub user does not have a public email address');

        errorSpy.mockRestore();
    });
});
