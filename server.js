require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');
const { GeneratedVideos } = require('./models');
const logger = require('./utils/logger');
const validateEnv = require('./utils/validateEnv');

// Validate environment variables
validateEnv();

// environment variables
const SECRET_SESSION = process.env.SECRET_SESSION;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:", "https://bootdey.com"],
      mediaSrc: ["'self'", "https://storage.googleapis.com"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting for API endpoint
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many video generation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.set('view engine', 'ejs');
app.use(require('express-ejs-layouts'));

if (process.env.NODE_ENV !== 'production') {
  app.use(require('morgan')('dev'));
}
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);

app.use(flash());            // flash middleware
app.use(express.json())

app.use(session({
  secret: SECRET_SESSION,    // What we actually will be giving the user on our site as a session cookie
  resave: false,             // Save the session even if it's modified, make this false
  saveUninitialized: true    // If we have a new session, we save it, therefore making that true
}));

// add passport
app.use(passport.initialize());

app.use(passport.session());

app.use((req, res, next) => {
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

app.use('/auth', require('./controllers/auth'));
// Add this below /auth controllers

app.get('/', (req, res) => {
  res.render('index.ejs', { name: 'Animation_Cloud' });
})

app.get('/auth/login', (req, res) => {
  res.render('login.ejs');
})

app.get('/auth/signup', (req, res) => {
  res.render('signup.ejs');
})

app.get('/profile', isLoggedIn, async (req, res) => {
  try {
    const { id, name, email } = req.user.get();

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    const { count, rows: dbVideos } = await GeneratedVideos.findAndCountAll({
      where: {
        userId: id,
      },
      order: [['id', 'DESC']],
      limit,
      offset
    });

    const videoArray = dbVideos.map((dbVideo) => {
      return {
        id: dbVideo.dataValues.id,
        videoName: dbVideo.dataValues.videoName,
        videoUrl: dbVideo.dataValues.videoUrl,
        createdAt: dbVideo.dataValues.createdAt,
        status: dbVideo.dataValues.status
      }
    });

    const totalPages = Math.ceil(count / limit);

    res.render('profile', {
      id,
      name,
      email,
      videoArray,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    logger.error('Error loading profile:', error);
    req.flash('error', 'Error loading your profile');
    res.redirect('/');
  }
});




// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Video generation API with rate limiting and validation
app.post('/api', apiLimiter, isLoggedIn, async (req, res) => {
  try {
    const { userPrompt } = req.body;
    const { id } = req.user.get();

    // Input validation
    if (!userPrompt || typeof userPrompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid text prompt'
      });
    }

    if (userPrompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt cannot be empty'
      });
    }

    if (userPrompt.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Prompt must be less than 500 characters'
      });
    }

    // Sanitize input (basic)
    const sanitizedPrompt = userPrompt.trim();

    logger.info(`Generating video for user ${id} with prompt: ${sanitizedPrompt}`);

    // Use service layer
    const gooeyService = require('./services/gooeyService');
    const result = await gooeyService.generateVideo(sanitizedPrompt);

    // Create database record with metadata
    const generatedVideo = await GeneratedVideos.create({
      userId: id,
      videoUrl: result.videoUrl,
      videoName: sanitizedPrompt,
      status: 'completed',
      createdAt: new Date()
    });

    logger.info(`Video generated successfully: ${generatedVideo.id}`);

    res.status(200).json({
      success: true,
      message: 'Video generated successfully!',
      video: {
        id: generatedVideo.id,
        url: result.videoUrl,
        prompt: sanitizedPrompt
      }
    });
  } catch (error) {
    logger.error('Video generation error:', error);

    let errorMessage = 'Failed to generate video. Please try again.';
    let statusCode = 500;

    if (error.message.includes('Gooey API error')) {
      errorMessage = 'External API error. Please try again later.';
      statusCode = 502;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

// Delete video endpoint
app.delete('/api/videos/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.get().id;

    const video = await GeneratedVideos.findOne({
      where: { id, userId }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    await video.destroy();
    logger.info(`Video ${id} deleted by user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete video'
    });
  }
});

const PORT = process.env.PORT || 13000;
const server = app.listen(PORT, () => {
  logger.info(`🎧 Server listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = server;