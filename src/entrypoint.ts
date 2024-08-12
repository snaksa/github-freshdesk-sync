import ConfigService from './services/config.service';
import HttpService from './services/http.service';
import GitHubService from './services/github.service';
import FreshdeskService from './services/freshdesk.service';
import {ApiError} from './core/errors';
import {FreshdeskContact} from "./core/types";

/**
 * Entrypoint of the script
 */
export default async function entrypoint(username: string, subdomain: string) {
    if (!username || !subdomain) {
        console.error('Usage: ts-node githubFreshdeskIntegration.ts <github_username> <freshdesk_subdomain>');
        return;
    }

    try {
        const configService = new ConfigService();
        const httpService = new HttpService();
        const githubService = new GitHubService(configService, httpService);
        const freshdeskService = new FreshdeskService(configService, httpService, subdomain);

        const githubUser = await githubService.getUserInfo(username);
        if (!githubUser.email) {
            throw new Error('GitHub user does not have a public email address');
        }

        const requestPayload = await freshdeskService.buildPayloadFromGitHubUser(githubUser);

        const existingContact = await freshdeskService.findContactByEmail(githubUser.email);

        let freshdeskContact: FreshdeskContact;
        if (existingContact) {
            // Update existing contact
            freshdeskContact = await freshdeskService.updateContact(existingContact.id, requestPayload);
        } else {
            // Create new contact
            freshdeskContact = await freshdeskService.createContact(requestPayload);
        }

        console.log(`Freshdesk contact synced successfully: https://${subdomain}.freshdesk.com/a/contacts/${freshdeskContact.id}`);
    } catch (error) {
        if (error instanceof ApiError) {
            console.error(`API Error (${error.statusCode}):`, error.response);
        } else {
            console.error('Error:', error.message);
        }
    }
}
