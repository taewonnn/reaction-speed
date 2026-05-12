import { router } from '@granite-js/plugin-router';
import { hermes } from '@granite-js/plugin-hermes';
import { appsInToss } from '@apps-in-toss/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  appName: 'reaction-speed-test',
  scheme: 'intoss',
  plugins: [
    router(),
    hermes(),
    ...appsInToss({
      appType: 'general',
      brand: {
        displayName: '반응속도 테스트',
        primaryColor: '#3182F6',
        icon: 'https://static.toss.im/appsintoss/33837/fd803c7e-1b9c-422d-acc7-e1865ec37234.png',
      },
      permissions: [],
    }),
  ],
});
