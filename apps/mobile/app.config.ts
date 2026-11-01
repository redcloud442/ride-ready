import type { ConfigContext, ExpoConfig } from 'expo/config';

// Release Android blocks plain http. A test build against the API on this PC (http://<LAN IP>:3000) needs it;
// a build pointed at an https API keeps it blocked.
const httpApi = process.env.EXPO_PUBLIC_API_URL?.startsWith('http://') ?? false;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  plugins: [...(config.plugins ?? []), ['expo-build-properties', { android: { usesCleartextTraffic: httpApi } }]],
});
