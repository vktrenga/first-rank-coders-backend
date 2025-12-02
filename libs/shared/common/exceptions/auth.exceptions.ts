import { UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';

export class EmailNotVerifiedException extends ForbiddenException {
  constructor(message = 'Email not verified') {
    super(message);
  }
}

export class UserAlreadyExistsException extends BadRequestException {
  constructor(message = 'User with this email already exists') {
    super(message);
  }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor(message = 'Invalid credentials') {
    super(message);
  }
}

export class LoginAttemptsExceededException extends ForbiddenException {
  constructor(message = 'Too many failed login attempts') {
    super(message);
  }
}
