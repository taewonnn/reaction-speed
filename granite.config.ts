import { router } from '@granite-js/plugin-router';
import { hermes } from '@granite-js/plugin-hermes';
import { appsInToss } from '@apps-in-toss/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  appName: 'tap-speed',
  scheme: 'intoss',
  plugins: [
    router(),
    hermes(),
    ...appsInToss({
      appType: 'general',
      brand: {
        displayName: '반응속도 내기',
        primaryColor: '#3182F6',
        icon: 'https://static.toss.im/appsintoss/33837/9c9e8b00-934b-411b-ba91-fb6c59fb2330.png',
      },
      permissions: [],
    }),
  ],
});
