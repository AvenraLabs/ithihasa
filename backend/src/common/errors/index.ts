export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'PERMISSION_DENIED');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION') {
    super(message, 422, code);
  }
}

export class InventoryError extends AppError {
  constructor(message = 'Insufficient inventory available') {
    super(message, 409, 'INSUFFICIENT_INVENTORY');
  }
}

export class PaymentError extends AppError {
  constructor(message = 'Payment processing failed', details?: unknown) {
    super(message, 402, 'PAYMENT_FAILED', details);
  }
}
