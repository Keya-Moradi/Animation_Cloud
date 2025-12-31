# Animation Cloud

**AI-Powered Animation Generator** - Transform your ideas into stunning animations using cutting-edge AI technology.

## Overview

Animation Cloud is a full-stack web application that allows users to generate professional AI animations from simple text prompts. Built with Node.js, Express, and PostgreSQL, it integrates with the Gooey.AI DeforumSD API to create unique animated videos based on user descriptions.

## Features

- **AI Animation Generation**: Create unique animations from text prompts
- **User Authentication**: Secure signup/login with bcrypt password hashing
- **Video Gallery**: View and manage all your generated animations
- **Pagination**: Browse through your video library efficiently
- **Delete Functionality**: Remove unwanted videos
- **Profile Management**: Edit your account details
- **Rate Limiting**: Prevents API abuse
- **Security Headers**: Protected with Helmet.js
- **Responsive Design**: Works on desktop and mobile
- **Real-time Feedback**: Loading indicators and error messages

## Technology Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **PostgreSQL** - Database
- **Sequelize** - ORM for database operations
- **Passport.js** - Authentication middleware
- **bcryptjs** - Password hashing
- **Winston** - Logging
- **Helmet** - Security headers
- **express-rate-limit** - API rate limiting

### Frontend
- **EJS** - Templating engine
- **Bootstrap 5** - CSS framework
- **Vanilla JavaScript** - Client-side interactivity

### External APIs
- **Gooey.AI DeforumSD** - AI animation generation

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Instructions

1. **Fork and Clone the Repository**
```bash
git clone https://github.com/Keya-Moradi/Animation_Cloud.git
cd Animation_Cloud
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Up Environment Variables**

Create a `.env` file in the root directory:
```env
SECRET_SESSION=your_super_secret_session_key_here
GOOEY_API_KEY=your_gooey_api_key_here
DATABASE_URL=postgres://username:password@localhost:5432/animationcloud
NODE_ENV=development
PORT=13000
```

4. **Configure Database**

Update `config/config.json` with your database credentials:
```json
{
  "development": {
    "database": "animationcloud",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
```

5. **Create Database**
```bash
sequelize db:create
```

6. **Run Migrations**
```bash
sequelize db:migrate
```

7. **Start the Server**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

8. **Visit the Application**
```
http://localhost:13000
```

## Database Models

### User Model
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | Primary Key, Auto-generated |
| name | String | 1-99 characters |
| email | String | Unique, used for login |
| password | String | Bcrypt hashed (8-99 chars) |
| createdAt | Date | Auto-generated |
| updatedAt | Date | Auto-generated |

### GeneratedVideos Model
| Column | Type | Notes |
|--------|------|-------|
| id | Integer | Primary Key, Auto-generated |
| userId | Integer | Foreign Key to User |
| videoUrl | String | URL to generated video |
| videoName | String | User's prompt text |
| status | String | Default: 'completed' |
| createdAt | Date | Auto-generated |

## Routes

### Web Routes
| Method | Path | Purpose | Auth Required |
|--------|------|---------|---------------|
| GET | `/` | Landing page | No |
| GET | `/auth/signup` | Signup form | No |
| POST | `/auth/signup` | Create account | No |
| GET | `/auth/login` | Login form | No |
| POST | `/auth/login` | Authenticate user | No |
| GET | `/auth/logout` | Logout user | Yes |
| GET | `/profile` | User dashboard | Yes |
| GET | `/auth/:id/edit` | Edit profile form | Yes |
| POST | `/auth/:id/edit` | Update profile | Yes |

### API Routes
| Method | Path | Purpose | Auth Required | Rate Limited |
|--------|------|---------|---------------|--------------|
| GET | `/health` | Health check | No | No |
| POST | `/api` | Generate video | Yes | Yes (10/15min) |
| DELETE | `/api/videos/:id` | Delete video | Yes | No |

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API specifications, request/response formats, and error codes.

## Security Features

1. **Password Hashing**: bcrypt with 12 rounds
2. **Session Security**: HTTP-only cookies with secure session management
3. **Rate Limiting**: 10 video generation requests per 15 minutes per IP
4. **Security Headers**: Helmet.js protection
5. **Input Validation**: All user inputs validated and sanitized
6. **Content Security Policy**: Restricts resource loading
7. **Environment Variable Validation**: Validates required env vars on startup
8. **SQL Injection Protection**: Sequelize ORM parameterized queries

## Project Structure

```
Animation_Cloud/
├── config/
│   ├── config.json          # Database configuration
│   └── ppConfig.js          # Passport authentication setup
├── controllers/
│   └── auth.js              # Authentication routes
├── middleware/
│   └── isLoggedIn.js        # Auth middleware
├── migrations/              # Database migrations
├── models/
│   ├── index.js            # Sequelize setup
│   ├── user.js             # User model
│   └── generatedVideos.js  # Video model
├── public/
│   └── css/
│       └── style.css       # Custom styles
├── services/
│   └── gooeyService.js     # External API service
├── test/                    # Test files
├── utils/
│   ├── logger.js           # Winston logger setup
│   └── validateEnv.js      # Environment validation
├── views/
│   ├── auth/               # Login/signup templates
│   ├── partials/           # Reusable components
│   ├── index.ejs           # Landing page
│   ├── layout.ejs          # Main layout
│   └── profile.ejs         # User dashboard
├── logs/                    # Log files (gitignored)
├── .env                     # Environment variables (gitignored)
├── .gitignore
├── Procfile                 # Heroku deployment
├── package.json
├── server.js               # Main application file
├── API_DOCUMENTATION.md    # API documentation
└── README.md
```

## Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- User authentication flows
- User model validation
- Profile routes
- Index routes

## Deployment

### Heroku Deployment

1. **Create Heroku App**
```bash
heroku create your-app-name
```

2. **Add PostgreSQL Addon**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. **Set Environment Variables**
```bash
heroku config:set SECRET_SESSION=your_secret
heroku config:set GOOEY_API_KEY=your_api_key
heroku config:set NODE_ENV=production
```

4. **Deploy**
```bash
git push heroku main
```

5. **Run Migrations**
```bash
heroku run sequelize db:migrate
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_SESSION` | Yes | Session secret key |
| `GOOEY_API_KEY` | Yes | Gooey.AI API key |
| `DATABASE_URL` | Production | PostgreSQL connection URL |
| `NODE_ENV` | No | Environment (development/production) |
| `PORT` | No | Server port (default: 13000) |

## Features Roadmap

- [ ] Video sharing functionality
- [ ] Video categories and tags
- [ ] Advanced AI parameters (style, duration, etc.)
- [ ] User roles and permissions
- [ ] Admin dashboard
- [ ] Usage analytics
- [ ] Social authentication (Google, GitHub)
- [ ] Video favorites/bookmarks

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
brew services list  # macOS
sudo service postgresql status  # Linux

# Recreate database
sequelize db:drop
sequelize db:create
sequelize db:migrate
```

### Missing Environment Variables
The app will fail to start if required env vars are missing. Check the error message and ensure all required variables are set in your `.env` file.

### Port Already in Use
```bash
# Find and kill process using port 13000
lsof -ti:13000 | xargs kill -9
```

## License

ISC

## Author

Keya Moradi

## Links

- **GitHub**: [https://github.com/Keya-Moradi/Animation_Cloud](https://github.com/Keya-Moradi/Animation_Cloud)
- **Issues**: [https://github.com/Keya-Moradi/Animation_Cloud/issues](https://github.com/Keya-Moradi/Animation_Cloud/issues)

## Acknowledgments

- Gooey.AI for the DeforumSD animation API
- Bootstrap for the UI framework
- Express.js and Sequelize communities
