export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class AuthError extends AppError {
    constructor(message: string = 'Authentication failed', statusCode: number = 401) {
        super(message, statusCode);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation failed') {
        super(message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(entity: string = 'Entity') {
        super(`${entity} not found`, 404);
    }
}
