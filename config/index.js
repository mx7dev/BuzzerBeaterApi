require('dotenv').config();

const config = {
  dev: process.env.NODE_ENV !== 'production',
  port: process.env.PORT || 4000,
  apiKey: '1LOVFRAWkC3f8U9qz4JicjQpS0K7ne5u',
};

module.exports = { config };
