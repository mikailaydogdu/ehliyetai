// Expo config: .env'deki GROQ_API_KEY'i uygulamada Constants.expoConfig.extra.groqApiKey ile kullanılır
const path = require('path');
try {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
} catch (_) {}
const base = require('./app.json').expo;
module.exports = {
  ...base,
  extra: {
    ...(base.extra || {}),
    groqApiKey: process.env.GROQ_API_KEY || '',
  },
};
