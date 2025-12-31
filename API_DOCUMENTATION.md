# Animation Cloud API Documentation

## Base URL
```
Development: http://localhost:13000
Production: https://your-app-name.herokuapp.com
```

## Authentication
All API endpoints (except `/health`) require authentication via session cookies. Users must be logged in to access these endpoints.

---

## Endpoints

### Health Check

#### `GET /health`
Check if the server is running and healthy.

**Authentication Required:** No

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

### Video Generation

#### `POST /api`
Generate a new AI animation from a text prompt.

**Authentication Required:** Yes

**Rate Limit:** 10 requests per 15 minutes per IP

**Request Body:**
```json
{
  "userPrompt": "White tiger walking in New York City"
}
```

**Request Validation:**
- `userPrompt` must be a non-empty string
- Maximum length: 500 characters
- Minimum length: 1 character (after trimming)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Video generated successfully!",
  "video": {
    "id": 42,
    "url": "https://storage.googleapis.com/.../video.mp4",
    "prompt": "White tiger walking in New York City"
  }
}
```

**Error Responses:**

**400 Bad Request** - Invalid input:
```json
{
  "success": false,
  "error": "Please provide a valid text prompt"
}
```

**429 Too Many Requests** - Rate limit exceeded:
```json
{
  "success": false,
  "error": "Too many video generation requests, please try again later."
}
```

**502 Bad Gateway** - External API error:
```json
{
  "success": false,
  "error": "External API error. Please try again later."
}
```

**500 Internal Server Error** - Server error:
```json
{
  "success": false,
  "error": "Failed to generate video. Please try again."
}
```

---

### Delete Video

#### `DELETE /api/videos/:id`
Delete a video from the user's gallery.

**Authentication Required:** Yes

**URL Parameters:**
- `id` (integer) - The ID of the video to delete

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

**Error Responses:**

**404 Not Found** - Video not found or doesn't belong to user:
```json
{
  "success": false,
  "error": "Video not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Failed to delete video"
}
```

---

### Get User Profile

#### `GET /profile`
View user profile with paginated video gallery.

**Authentication Required:** Yes

**Query Parameters:**
- `page` (integer, optional) - Page number for pagination (default: 1)

**Response:**
Renders the profile.ejs template with user data and video gallery.

**Variables passed to template:**
- `id` - User ID
- `name` - User name
- `email` - User email
- `videoArray` - Array of user's videos
- `currentPage` - Current page number
- `totalPages` - Total number of pages
- `hasNextPage` - Boolean, true if more pages exist
- `hasPrevPage` - Boolean, true if previous pages exist

**Pagination:**
- 12 videos per page
- Videos ordered by creation date (newest first)

---

## Web Routes (Non-API)

### `GET /`
Landing page with hero section and features.

### `GET /auth/signup`
User registration page.

### `POST /auth/signup`
Create new user account.

### `GET /auth/login`
User login page.

### `POST /auth/login`
Authenticate user.

### `GET /auth/logout`
Log out current user.

### `GET /auth/:id/edit`
Edit profile page for user.

### `POST /auth/:id/edit`
Update user profile information.

---

## Data Models

### GeneratedVideos
```javascript
{
  id: Integer (Primary Key),
  userId: Integer (Foreign Key),
  videoUrl: String,
  videoName: String,
  status: String (default: 'completed'),
  createdAt: Date
}
```

### User
```javascript
{
  id: Integer (Primary Key),
  name: String (1-99 characters),
  email: String (unique, valid email),
  password: String (8-99 characters, bcrypt hashed),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

All API endpoints return JSON error responses with appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `502` - Bad Gateway (external API issues)

---

## Security Features

1. **Helmet.js** - Security headers
2. **Rate Limiting** - 10 requests per 15 minutes for video generation
3. **Input Validation** - All user inputs are validated and sanitized
4. **Session-based Authentication** - Secure cookie sessions
5. **Password Hashing** - bcrypt with 12 rounds
6. **Content Security Policy** - Restricts resource loading

---

## Environment Variables

Required environment variables:
```
SECRET_SESSION=your_session_secret_here
GOOEY_API_KEY=your_gooey_api_key_here
DATABASE_URL=postgres://... (production only)
NODE_ENV=development|production
PORT=13000 (optional, defaults to 13000)
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api` | 10 requests | 15 minutes |

---

## External API Integration

**Gooey.AI DeforumSD API**
- Base URL: `https://api.gooey.ai/v2/DeforumSD/`
- Authentication: Bearer token
- Used for AI animation generation

---

## Logging

Application uses Winston logger with the following transports:
- **Development**: Console output with colors
- **Production**: File logging to `logs/` directory
  - `error.log` - Error level logs
  - `combined.log` - All logs

---

## Testing

Run tests with:
```bash
npm test
```

Tests cover:
- Authentication flows
- User model validation
- Profile routes
- Video generation (with mocked API)
