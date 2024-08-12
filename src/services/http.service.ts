import {
    NotFoundError,
    UnauthorizedError,
    InternalServerError,
    BadRequestError,
    UnknownApiError
} from '../core/errors';

class HttpService {
    /**
     * Get the headers object with the Authorization header if the token is provided
     */
    private getHeaders(token: string): HeadersInit {
        const headers: HeadersInit = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Handle the response from the API
     */
    private async handleResponse(response: Response): Promise<any> {
        const data = await response.json();
        if (!response.ok) {
            switch (response.status) {
                case 400:
                    throw new BadRequestError(data);
                case 401:
                    throw new UnauthorizedError(data);
                case 404:
                    throw new NotFoundError(data);
                case 500:
                    throw new InternalServerError(data);
                default:
                    throw new UnknownApiError(response.status, data);
            }
        }

        return data;
    }

    /**
     * Perform a GET request
     */
    async get(url: string, token: string): Promise<any> {
        const response = await fetch(url, {
            headers: this.getHeaders(token),
        });

        return this.handleResponse(response);
    }

    /**
     * Perform a POST request
     */
    async post(url: string, body: any, token: string): Promise<any> {
        // Convert the body object to a FormData object to be able to send files
        const formData = new FormData();
        for (const key in body) {
            formData.append(key, body[key]);
        }

        const headers = this.getHeaders(token);
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        return this.handleResponse(response);
    }

    /**
     * Perform a PUT request
     */
    async put(url: string, body: any, token: string): Promise<any> {
        // Convert the body object to a FormData object to be able to send files
        const formData = new FormData();
        for (const key in body) {
            formData.append(key, body[key]);
        }

        const headers = this.getHeaders(token);
        const response = await fetch(url, {
            method: 'PUT',
            headers: headers,
            body: formData,
        });

        return this.handleResponse(response);
    }

    /**
     * Perform a GET request and return the response as a Blob
     */
    async getBlob(url: string): Promise<any> {
        const response = await fetch(url);
        return await response.blob();
    }
}

export default HttpService;
