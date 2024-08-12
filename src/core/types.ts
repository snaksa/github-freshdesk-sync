export type GitHubUser = {
    id: number;
    login: string;
    name: string;
    email: string;
    avatar_url: string;
    twitter_username?: string;
}

export type FreshdeskContact = {
    id: number;
    name: string;
    email: string;
    avatar?: {
        "id": number;
        "name": string;
        "avatar_url": string;
    };
    twitter_id?: string;
    unique_external_id?: string;
}