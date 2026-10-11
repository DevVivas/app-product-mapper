export class HttpError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string,
        public readonly details?: unknown
    ) {
        super(message);
    }

    static badRequest(message: string, details?: unknown) {
        return new HttpError(400, message, details);
    }

    static notFound(message: string) {
        return new HttpError(404, message);
    }

    static conflict(message: string) {
        return new HttpError(409, message);
    }
}