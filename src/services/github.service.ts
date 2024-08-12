import ConfigService from './config.service';
import HttpService from './http.service';
import {GitHubUser} from "../core/types";

class GitHubService {
    private readonly configService: ConfigService;
    private readonly httpService: HttpService;

    constructor(configService: ConfigService, httpService: HttpService) {
        this.configService = configService;
        this.httpService = httpService;
    }

    /**
     * Get GitHub user information by username
     */
    async getUserInfo(username: string): Promise<GitHubUser> {
        const url = `https://api.github.com/users/${username}`;
        const token = this.configService.getGitHubToken();

        return this.httpService.get(url, token);
    }
}

export default GitHubService;
