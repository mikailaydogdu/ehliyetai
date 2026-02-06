// Expo config: Yerelde .env'deki GROQ_API_KEY; production'da EAS environment "production" ile enjekte edilir.
const path = require('path');
try {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
} catch (_) {}

const base = {
  name: 'EhliyetAI',
  slug: 'ehliyetai',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/ehliyetai.png',
  scheme: 'ehliyetai',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/ehliyetai.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.ehliyetai.app',
  },
  android: {
    package: 'com.ehliyetai.app',
    enableProguardInReleaseBuilds: true,
    adaptiveIcon: {
      backgroundColor: '#ffffff',
      foregroundImage: './assets/images/ehliyetai.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/ehliyetai.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  updates: {
    url: 'https://u.expo.dev/48fdc43d-28b8-494d-a1ab-1ca08e028781',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
};

module.exports = {
  ...base,
  owner: 'mikailaydogdu',
  extra: {
    ...(base.extra || {}),
    groqApiKey: process.env.GROQ_API_KEY || '',
    eas: {
      projectId: '48fdc43d-28b8-494d-a1ab-1ca08e028781',
    },
  },
};
