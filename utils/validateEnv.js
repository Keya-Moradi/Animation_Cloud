const logger = require('./logger');

function validateEnv() {
  const required = [
    'SECRET_SESSION',
    'GOOEY_API_KEY'
  ];

  const missing = required.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    logger.error('Missing DATABASE_URL in production');
    throw new Error('DATABASE_URL is required in production');
  }

  logger.info('Environment variables validated successfully');
}

module.exports = validateEnv;
