import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wonderland.admin',
  appName: 'Wonderland Admin',
  webDir: 'out',
  server: {
    url: 'https://wonderland-f0vb.onrender.com/admin-app',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '1021477358452-rl84k4sosoogajgttclflj15lltf5is5.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    }
  }
};

export default config;
