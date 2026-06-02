import React, { type PropsWithChildren } from 'react';
import { AppsInToss } from '@apps-in-toss/framework';
import { type InitialProps } from '@granite-js/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { context } from '../require.context';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
}

export default AppsInToss.registerApp(AppContainer, { context });
