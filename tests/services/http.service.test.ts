import HttpService from '../../src/services/http.service';
import {
    NotFoundError,
    UnauthorizedError,
    InternalServerError,
    BadRequestError,
    UnknownApiError,
} from '../../src/core/errors';

global.fetch = jest.fn();

describe('HttpService', () => {
    let httpService: HttpService;

    beforeEach(() => {
        httpService = new HttpService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should perform a GET request successfully', async () => {
        const url = 'https://api.example.com/data';
        const token = 'dummy_token';
        const mockResponse = { data: 'test data' };

        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await httpService.get(url, token);

        expect(fetch).toHaveBeenCalledWith(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        expect(result).toEqual(mockResponse);
    });

    it('should throw a BadRequestError on 400 response', async () => {
        const url = 'https://api.example.com/data';
        const token = 'dummy_token';
        const mockErrorResponse = { error: 'Bad Request' };

        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 400,
            json: jest.fn().mockResolvedValue(mockErrorResponse),
        });

        await expect(httpService.get(url, token)).rejects.toThrow(BadRequestError);
    });

    it('should throw an UnauthorizedError on 401 response', async () => {
        const url = 'https://api.example.com/data';
        const token = 'dummy_token';
        const mockErrorResponse = { error: 'Unauthorized' };

        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 401,
            json: jest.fn().mockResolvedValue(mockErrorResponse),
        });

        await expect(httpService.get(url, token)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw a NotFoundError on 404 response', async () => {
        const url = 'https://api.example.com/data';
        const token = 'dummy_token';
        const mockErrorResponse = { error: 'Not Found' };

        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 404,
            json: jest.fn().mockResolvedValue(mockErrorResponse),
        });

        await expect(httpService.get(url, token)).rejects.toThrow(NotFoundError);
    });

    it('should throw an InternalServerError on 500 response', async () => {
        const url = 'https://api.example.com/data';
        const token = 'dummy_token';
        const mockErrorResponse = { error: 'Internal Server Error' };

        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 500,
            json: jest.fn().mockResolvedValue(mockErrorResponse),
        });

        await expect(httpService.get(url, token)).rejects.toThrow(InternalServerError);
    });

    it('should throw an UnknownApiError on unknown error response', async () => {
        const url = 'https://api.example.com/data';
        const token = 'dummy_token';
        const mockErrorResponse = { error: 'Unknown Error' };

        (fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 418, // I'm a teapot
            json: jest.fn().mockResolvedValue(mockErrorResponse),
        });

        await expect(httpService.get(url, token)).rejects.toThrow(UnknownApiError);
    });

    it('should perform a POST request successfully', async () => {
        const url = 'https://api.example.com/data';
        const token = 'dummy_token';
        const body = { key: 'value' };
        const mockResponse = { data: 'test data' };

        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await httpService.post(url, body, token);

        expect(fetch).toHaveBeenCalledWith(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: expect.any(FormData),
        });
        expect(result).toEqual(mockResponse);
    });

    it('should perform a PUT request successfully', async () => {
        const url = 'https://api.example.com/data/1';
        const token = 'dummy_token';
        const body = { key: 'value' };
        const mockResponse = { data: 'test data' };

        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await httpService.put(url, body, token);

        expect(fetch).toHaveBeenCalledWith(url, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: expect.any(FormData),
        });
        expect(result).toEqual(mockResponse);
    });

    it('should perform a GET request for a blob successfully', async () => {
        const url = 'https://api.example.com/image';
        const mockBlob = new Blob(['dummy image content'], { type: 'image/jpeg' });

        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            blob: jest.fn().mockResolvedValue(mockBlob),
        });

        const result = await httpService.getBlob(url);

        expect(fetch).toHaveBeenCalledWith(url);
        expect(result).toEqual(mockBlob);
    });
});
