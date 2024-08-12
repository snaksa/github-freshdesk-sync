import ConfigService from './config.service';
import HttpService from './http.service';
import {FreshdeskContact, GitHubUser} from "../core/types";

class FreshdeskService {
    private readonly configService: ConfigService;
    private readonly httpService: HttpService;
    private readonly subdomain: string;

    constructor(configService: ConfigService, httpService: HttpService, subdomain: string) {
        this.configService = configService;
        this.httpService = httpService;
        this.subdomain = subdomain;
    }

    /**
     * Build the Freshdesk contact payload from the GitHub user
     */
    async buildPayloadFromGitHubUser(githubUser: GitHubUser): Promise<Object> {
        const result: any = {
            name: githubUser.name ?? githubUser.login, // if the name is not provided, use the login (username) as the name
            email: githubUser.email,
            unique_external_id: githubUser.id.toString(),
        };

        if (githubUser.avatar_url) {
            // fetch the avatar and create a File object to be uploaded to Freshdesk
            let avatar = await this.httpService.getBlob(githubUser.avatar_url);
            avatar = new File([avatar], 'avatar.jpg', {type: 'image/jpeg'});
            result.avatar = avatar;
        }

        if (githubUser.twitter_username) {
            // if the GitHub user has a Twitter username, add it to the Freshdesk contact
            result.twitter_id = githubUser.twitter_username;
        }

        return result;
    }

    /**
     * Find a Freshdesk contact by email
     */
    async findContactByEmail(email: string): Promise<FreshdeskContact | null> {
        const contacts = await this.filterContactsByEmail(email);
        if (contacts.length === 0) {
            return null;
        }

        return contacts[0];
    }

    /**
     * Filter contacts by email
     */
    async filterContactsByEmail(email: string): Promise<FreshdeskContact[]> {
        const url = `https://${this.subdomain}.freshdesk.com/api/v2/contacts?email=${email}`;
        const token = this.configService.getFreshdeskToken();
        return this.httpService.get(url, token);
    }

    /**
     * Create a new Freshdesk contact
     */
    async createContact(contactData: Object): Promise<FreshdeskContact> {
        const url = `https://${this.subdomain}.freshdesk.com/api/v2/contacts`;
        const token = this.configService.getFreshdeskToken();
        return this.httpService.post(url, contactData, token);
    }

    /**
     * Update an existing Freshdesk contact
     */
    async updateContact(contactId: number, contactData: Object): Promise<FreshdeskContact> {
        const url = `https://${this.subdomain}.freshdesk.com/api/v2/contacts/${contactId}`;
        const token = this.configService.getFreshdeskToken();
        return this.httpService.put(url, contactData, token);
    }
}

export default FreshdeskService;
