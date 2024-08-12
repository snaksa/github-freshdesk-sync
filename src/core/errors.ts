export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly response: any;

    constructor(statusCode: number, response: any) {
        super(`API Error: ${statusCode}`);
        this.statusCode = statusCode;
        this.response = response;
    }
}

export class NotFoundError extends ApiError {
    constructor(response: any) {
        super(404, response);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(response: any) {
        super(401, response);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class InternalServerError extends ApiError {
    constructor(response: any) {
        super(500, response);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}

export class BadRequestError extends ApiError {
    constructor(response: any) {
        super(400, response);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

export class UnknownApiError extends ApiError {
    constructor(statusCode: number, response: any) {
        super(statusCode, response);
        Object.setPrototypeOf(this, UnknownApiError.prototype);
    }
}
