import FreshdeskService from '../../src/services/freshdesk.service';
import ConfigService from '../../src/services/config.service';
import HttpService from '../../src/services/http.service';
import { FreshdeskContact, GitHubUser } from '../../src/core/types';

jest.mock('../../src/services/config.service');
jest.mock('../../src/services/http.service');

describe('FreshdeskService', () => {
    let configService: jest.Mocked<ConfigService>;
    let httpService: jest.Mocked<HttpService>;
    let freshdeskService: FreshdeskService;
    const subdomain = 'dummy_subdomain';

    beforeEach(() => {
        configService = new ConfigService() as jest.Mocked<ConfigService>;
        httpService = new HttpService() as jest.Mocked<HttpService>;
        freshdeskService = new FreshdeskService(configService, httpService, subdomain);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should build payload from GitHub user', async () => {
        const githubUser: GitHubUser = {
            id: 12345,
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            twitter_username: 'johndoe',
            login: 'johndoe',
            avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4'
        };

        const mockBlob = new Blob(['dummy image content'], { type: 'image/jpeg' });
        httpService.getBlob.mockResolvedValue(mockBlob);

        const payload = await freshdeskService.buildPayloadFromGitHubUser(githubUser);

        expect(httpService.getBlob).toHaveBeenCalledWith(githubUser.avatar_url);
        expect(payload).toEqual({
            name: githubUser.name,
            email: githubUser.email,
            unique_external_id: githubUser.id.toString(),
            avatar: expect.any(File),
            twitter_id: githubUser.twitter_username,
        });
    });

    it('should build payload without avatar and twitter username from GitHub user', async () => {
        const githubUser: GitHubUser = {
            id: 12345,
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            login: 'johndoe',
            twitter_username: null,
            avatar_url: null
        };

        const payload = await freshdeskService.buildPayloadFromGitHubUser(githubUser);

        expect(httpService.getBlob).not.toHaveBeenCalled();
        expect(payload).toEqual({
            name: githubUser.name,
            email: githubUser.email,
            unique_external_id: githubUser.id.toString(),
        });
    });

    it('should build payload with username instead of name if not provided in the GitHub user', async () => {
        const githubUser: GitHubUser = {
            id: 12345,
            name: null,
            email: 'johndoe@gmail.com',
            login: 'johndoe',
            twitter_username: null,
            avatar_url: null
        };

        const payload = await freshdeskService.buildPayloadFromGitHubUser(githubUser);

        expect(httpService.getBlob).not.toHaveBeenCalled();
        expect(payload).toEqual({
            name: githubUser.login,
            email: githubUser.email,
            unique_external_id: githubUser.id.toString(),
        });
    });

    it('should find contact by email', async () => {
        const email = 'johndoe@gmail.com';
        const mockContact: FreshdeskContact = {
            id: 1,
            name: 'John Doe',
            email: email,
            unique_external_id: '12345',
            twitter_id: 'johndoe',
            avatar: {
                id: 1,
                name: 'avatar.jpg',
                avatar_url: 'https://example.com/avatar.jpg',
            }
        };

        freshdeskService.filterContactsByEmail = jest.fn().mockResolvedValue([mockContact]);

        const contact = await freshdeskService.findContactByEmail(email);

        expect(freshdeskService.filterContactsByEmail).toHaveBeenCalledWith(email);
        expect(contact).toEqual(mockContact);
    });

    it('should return null if contact is not found by email', async () => {
        const email = 'johndoe@gmail.com';

        freshdeskService.filterContactsByEmail = jest.fn().mockResolvedValue([]);

        const contact = await freshdeskService.findContactByEmail(email);

        expect(freshdeskService.filterContactsByEmail).toHaveBeenCalledWith(email);
        expect(contact).toBeNull();
    });

    it('should filter contacts by email', async () => {
        const email = 'johndoe@gmail.com';
        const url = `https://${subdomain}.freshdesk.com/api/v2/contacts?email=${email}`;
        const token = 'dummy_freshdesk_token';
        const mockContacts: FreshdeskContact[] = [
            {
                id: 1,
                name: 'John Doe',
                email: email,
                unique_external_id: '12345',
                twitter_id: 'johndoe',
                avatar: {
                    id: 1,
                    name: 'avatar.jpg',
                    avatar_url: 'https://example.com/avatar.jpg',
                }
            }
        ];

        configService.getFreshdeskToken.mockReturnValue(token);
        httpService.get.mockResolvedValue(mockContacts);

        const contacts = await freshdeskService.filterContactsByEmail(email);

        expect(configService.getFreshdeskToken).toHaveBeenCalledTimes(1);
        expect(httpService.get).toHaveBeenCalledWith(url, token);
        expect(contacts).toEqual(mockContacts);
    });

    it('should create a contact', async () => {
        const contactData = {
            name: 'John Doe',
            email: 'johndoe@gmail.com',
        };
        const url = `https://${subdomain}.freshdesk.com/api/v2/contacts`;
        const token = 'dummy_freshdesk_token';
        const mockContact: FreshdeskContact = {
            id: 1,
            name: 'John Doe',
            email: 'johndoe@gmail.com',
            unique_external_id: '12345',
            twitter_id: 'johndoe',
            avatar: {
                id: 1,
                name: 'avatar.jpg',
                avatar_url: 'https://example.com/avatar.jpg',
            }
        };

        configService.getFreshdeskToken.mockReturnValue(token);
        httpService.post.mockResolvedValue(mockContact);

        const createdContact = await freshdeskService.createContact(contactData);

        expect(configService.getFreshdeskToken).toHaveBeenCalledTimes(1);
        expect(httpService.post).toHaveBeenCalledWith(url, contactData, token);
        expect(createdContact).toEqual(mockContact);
    });

    it('should update a contact', async () => {
        const contactId = 1;
        const contactData = {
            name: 'John Doe Updated',
        };
        const url = `https://${subdomain}.freshdesk.com/api/v2/contacts/${contactId}`;
        const token = 'dummy_freshdesk_token';
        const mockContact: FreshdeskContact = {
            id: contactId,
            name: 'John Doe Updated',
            email: 'johndoe@gmail.com',
            unique_external_id: '12345',
            twitter_id: 'johndoe',
            avatar: {
                id: 1,
                name: 'avatar.jpg',
                avatar_url: 'https://example.com/avatar.jpg',
            }
        };

        configService.getFreshdeskToken.mockReturnValue(token);
        httpService.put.mockResolvedValue(mockContact);

        const updatedContact = await freshdeskService.updateContact(contactId, contactData);

        expect(configService.getFreshdeskToken).toHaveBeenCalledTimes(1);
        expect(httpService.put).toHaveBeenCalledWith(url, contactData, token);
        expect(updatedContact).toEqual(mockContact);
    });
});
