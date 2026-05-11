import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export const Route = createRoute('/about', {
  component: AboutPage,
});

function AboutPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>반응속도 테스트란?</Text>
      <Text style={styles.body}>
        화면이 초록색으로 바뀌는 순간을 감지하고 최대한 빠르게 탭하는 게임이에요.
        {'\n\n'}
        일반적인 인간의 반응속도는 200~300ms 사이예요. 200ms 이하라면 번개 같은 반응속도를 가진 거예요!
      </Text>
      <View style={styles.table}>
        {[
          { range: '~200ms', label: '번개 같은 반응!', color: '#00C851' },
          { range: '200~300ms', label: '매우 빠름', color: '#3182F6' },
          { range: '300~500ms', label: '보통', color: '#FF8C00' },
          { range: '500ms~', label: '조금 느려요', color: '#E84040' },
        ].map(({ range, label, color }) => (
          <View key={range} style={styles.row}>
            <Text style={styles.range}>{range}</Text>
            <Text style={[styles.label, { color }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#191F28',
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    color: '#6B7684',
    lineHeight: 24,
    marginBottom: 32,
  },
  table: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  range: {
    fontSize: 15,
    color: '#191F28',
    fontWeight: '500',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
