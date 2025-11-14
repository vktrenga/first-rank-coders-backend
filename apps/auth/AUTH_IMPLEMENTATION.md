# Authentication Service - Implementation Guide

## Introduction

This guide describes implementing a secure authentication service supporting user registration, login, password management, and profile handling, with a focus on security and maintainability.

---

## Features

- User registration with email validation
- Secure login with password verification
- Password hashing using bcryptjs
- Login attempt tracking
- Password update functionality
- User profile management

---

## API Endpoints

### Signup

- **POST** `/auth/signup`
- Registers a new user with validated credentials.

### Login

- **POST** `/auth/login`
- Authenticates a user and returns an authentication token.

---

## Security

- Passwords are hashed using bcryptjs before storage.
- No plain-text passwords are stored or exposed.
- Input validation is enforced for all endpoints.
- Login attempts are tracked to mitigate brute-force attacks.

---

## Database Models

- **Auth Model:** Stores authentication credentials and login attempts.
- **User Model:** Stores user profile information and references the Auth model.

---

## Setup Instructions

1. Install required dependencies.
2. Configure environment variables for database and authentication secrets.
3. Run database migrations.
4. Start the authentication service.

---

## Validation Rules

- **Email:** Must be valid and unique.
- **Password:** Minimum length and complexity requirements.

---

## Error Handling

- Proper exceptions are thrown for duplicate users, invalid credentials, and validation errors.
- Database errors are mapped and handled gracefully.

---

## Testing

- Endpoints can be tested using cURL, Postman, or similar tools.
- Ensure all required fields are provided and valid.

---

## Future Enhancements

- JWT token implementation
- OAuth integration
- Email verification
- Two-factor authentication
- Rate limiting
- Audit logging

---

## Security Recommendations

- Use HTTPS in production.
- Implement rate limiting and CORS.
- Store secrets in environment variables.
- Regularly audit security.
- Enable account lockout after failed attempts.

---

## File Structure

```
apps/auth/src/
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── dto/
│   ├── signup.dto.ts
│   └── login.dto.ts
└── main.ts
```

---

## Troubleshooting

- Duplicate email: Use a unique email or remove existing user.
- Invalid credentials: Verify email and password.
- Database errors: Check configuration.
- Port conflicts: Adjust settings or free the port.

---

## Support

For further assistance, refer to the main project documentation or contact the development team.

---

## About

This authentication service is built with security as a priority, following industry standards to protect user data and credentials throughout the authentication process.

---

## Endpoints

### Signup

**POST** `/auth/signup`

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
}
```

**Response (201):**
```json
{
    "success": true,
    "data": {
        "id": "uuid-string",
        "authUserId": "uuid-string",
        "name": "John Doe",
        "email": "user@example.com",
        "role": "STUDENT",
        "organizationId": null,
        "departmentId": null,
        "classId": null,
        "createdAt": "2024-11-14T10:30:00Z",
        "updatedAt": "2024-11-14T10:30:00Z"
    },
    "message": "User registered successfully"
}
```

**Error Responses:**
- **400 Bad Request:** User already exists, invalid email format, or weak password
- **422 Unprocessable Entity:** Validation errors

---

### Login

**POST** `/auth/login`

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "securePassword123"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": "uuid-string",
            "authUserId": "uuid-string",
            "name": "John Doe",
            "email": "user@example.com",
            "role": "STUDENT",
            "organizationId": null,
            "departmentId": null,
            "classId": null,
            "organization": null,
            "department": null,
            "class": null,
            "createdAt": "2024-11-14T10:30:00Z",
            "updatedAt": "2024-11-14T10:30:00Z"
        },
        "token": "user-auth-id"
    },
    "message": "Login successful"
}
```

**Error Responses:**
- **401 Unauthorized:** Invalid email or password
- **400 Bad Request:** Missing required fields



`
3. **Run Database Migrations**
        ```bash
        npx prisma migrate dev
        ```
4. **Start the Service**
        ```bash
        npm run start:dev
        ```

---

## Key Methods in AppService

- **signup(signupDto):** Validates email, hashes password, creates Auth and User records, returns user data.
- **login(loginDto):** Finds user, compares password, tracks login attempts, resets on success.
- **verifyPassword(userId, password):** Verifies password for user.
- **updatePassword(userId, newPassword):** Updates password in Auth and User models.

---

## Validation Rules

- **Email:** Valid, unique, case-insensitive.
- **Password:** 8-50 characters, recommended complexity.
- **Name:** 2-100 characters, required for signup.

---

## Error Handling

```typescript
throw new BadRequestException('User with this email already exists');
throw new UnauthorizedException('Invalid credentials');
// Database errors mapped through PrismaExceptionMapper
```

---

## Testing the Endpoints

**Signup:**
```bash
curl -X POST http://localhost:3000/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email": "user@example.com", "password": "SecurePass123", "name": "John Doe"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "user@example.com", "password": "SecurePass123"}'
```

**Postman:** Import endpoints, set method to POST, set headers, add request bodies.

---

## Future Enhancements

- JWT token implementation
- OAuth integration
- Email verification
- Two-factor authentication
- Rate limiting
- Audit logging

---

## Security Best Practices

**Implemented:**
- Password hashing with bcryptjs
- Login attempt tracking
- No passwords in API responses
- Unique email validation
- Input validation

**Recommended:**
- Enable HTTPS in production
- Rate limiting
- CORS configuration
- Use environment variables for secrets
- Security audits
- JWT tokens
- Email verification
- Account lockout after failed attempts

---

## File Structure

```
apps/auth/src/
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── dto/
│   ├── signup.dto.ts
│   └── login.dto.ts
└── main.ts
```

---

## Troubleshooting

- "User with this email already exists": Use a different email or remove the existing user.
- "Invalid credentials": Verify email and password.
- Database connection error: Check DATABASE_URL in .env.
- Port already in use: Change PORT or kill process.

---

## Support

Refer to the main README or contact the development team.

---

## About the Auth Service

This authentication service is designed with robust security as a core principle, leveraging industry-standard practices to protect user credentials and sensitive data throughout the authentication lifecycle.

- **Password Security:** All passwords are hashed using bcryptjs with 10 salt rounds before storage.
