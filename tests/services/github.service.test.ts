import GitHubService from '../../src/services/github.service';
import ConfigService from '../../src/services/config.service';
import HttpService from '../../src/services/http.service';
import {GitHubUser} from '../../src/core/types';
import {NotFoundError} from "../../src/core/errors";

jest.mock('../../src/services/config.service');
jest.mock('../../src/services/http.service');

describe('GitHubService', () => {
    let configService: jest.Mocked<ConfigService>;
    let httpService: jest.Mocked<HttpService>;
    let gitHubService: GitHubService;

    beforeEach(() => {
        configService = new ConfigService() as jest.Mocked<ConfigService>;
        httpService = new HttpService() as jest.Mocked<HttpService>;
        gitHubService = new GitHubService(configService, httpService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should retrieve GitHub user info', async () => {
        const username = 'johndoe';
        const url = `https://api.github.com/users/${username}`;
        const token = 'dummy_github_token';
        const mockGitHubUser: GitHubUser = {
            id: 12345,
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            twitter_username: 'johndoe',
            login: 'johndoe',
            avatar_url: 'https://avatars.githubusercontent.com/u/1',
        };

        configService.getGitHubToken.mockReturnValue(token);
        httpService.get.mockResolvedValue(mockGitHubUser);

        const result = await gitHubService.getUserInfo(username);

        expect(configService.getGitHubToken).toHaveBeenCalledTimes(1);
        expect(httpService.get).toHaveBeenCalledWith(url, token);
        expect(result).toEqual(mockGitHubUser);
    });

    it('should handle errors when retrieving GitHub user info', async () => {
        const username = 'johndoe';
        const url = `https://api.github.com/users/${username}`;
        const token = 'dummy_github_token';
        const errorMessage = 'Not Found';

        configService.getGitHubToken.mockReturnValue(token);
        httpService.get.mockRejectedValue(new NotFoundError(errorMessage));

        await expect(gitHubService.getUserInfo(username)).rejects.toThrow('API Error: 404');

        expect(configService.getGitHubToken).toHaveBeenCalledTimes(1);
        expect(httpService.get).toHaveBeenCalledWith(url, token);
    });
});
