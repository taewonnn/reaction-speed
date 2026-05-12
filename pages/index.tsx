import { createRoute } from '@granite-js/react-native'
import React, { useState, useRef, useCallback } from 'react'
import {
  StyleSheet,
  View,
 Text,
  TouchableOpacity,
} from 'react-native'

type GameState =
  | 'idle'
  | 'waiting'
  | 'ready'
  | 'result'
  | 'too_early'

export const Route = createRoute('/', {
  component: ReactionSpeedPage,
})

function ReactionSpeedPage() {
  const [state, setState] = useState<GameState>('idle')

  const [reactionTime, setReactionTime] =
    useState<number | null>(null)

  const timerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  const startTimeRef = useRef<number>(0)

  /**
   * 게임 시작
   */
  const handleStart = useCallback(() => {
    setState('waiting')
    setReactionTime(null)

    /**
     * 1~4초 랜덤 대기
     */
    const delay = Math.random() * 3000 + 1000

    timerRef.current = setTimeout(() => {
      setState('ready')
      startTimeRef.current = Date.now()
    }, delay)
  }, [])

  /**
   * 화면 탭 처리
   */
  const handleTap = useCallback(() => {
    /**
     * 너무 빨리 눌렀을 때
     */
    if (state === 'waiting') {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      setState('too_early')
      return
    }

    /**
     * 반응속도 측정
     */
    if (state === 'ready') {
      const elapsed = Date.now() - startTimeRef.current

      setReactionTime(elapsed)
      setState('result')
    }
  }, [state])

  /**
   * 처음으로
   */
  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setState('idle')
    setReactionTime(null)
  }, [])

  /**
   * 광고보고 다시하기
   *
   * 현재는 로컬 테스트용
   * 실제 AIT 환경에서는 여기서
   * 전면형 광고 호출하면 됨
   */
  const handleWatchAdAndRestart =
    useCallback(() => {
      handleStart()
    }, [handleStart])

  /**
   * =========================
   * 시작 화면
   * =========================
   */
  if (state === 'idle') {
    return (
      <View style={styles.startContainer}>
        {/* 중앙 컨텐츠 */}
        <View style={styles.startContent}>
          <Text style={styles.title}>
            반응속도 테스트
          </Text>

          <Text style={styles.description}>
            화면이 초록색으로 바뀌면{'\n'}
            최대한 빨리 탭하세요!
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStart}
          >
            <Text style={styles.primaryButtonText}>
              시작하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 하단 배너 광고 영역 */}
        <View style={styles.bannerArea}>
          <Text style={styles.bannerDebugText}>
            배너 광고 영역
          </Text>
        </View>
      </View>
    )
  }

  /**
   * =========================
   * 대기 화면
   * =========================
   */
  if (state === 'waiting') {
    return (
      <TouchableOpacity
        style={[
          styles.fullScreen,
          styles.waitingScreen,
        ]}
        onPress={handleTap}
        activeOpacity={1}
      >
        <Text style={styles.waitingTitle}>
          잠깐만요...
        </Text>

        <Text style={styles.waitingSubText}>
          초록색으로 바뀌면 탭하세요
        </Text>
      </TouchableOpacity>
    )
  }

  /**
   * =========================
   * READY 상태
   * =========================
   */
  if (state === 'ready') {
    return (
      <TouchableOpacity
        style={[
          styles.fullScreen,
          styles.readyScreen,
        ]}
        onPress={handleTap}
        activeOpacity={1}
      >
        <Text style={styles.readyText}>
          지금!
        </Text>
      </TouchableOpacity>
    )
  }

  /**
   * =========================
   * 너무 빨리 눌렀을 때
   * =========================
   */
  if (state === 'too_early') {
    return (
      <View
        style={[
          styles.fullScreen,
          styles.earlyScreen,
        ]}
      >
        <Text style={styles.earlyTitle}>
          너무 빨라요!
        </Text>

        <Text style={styles.earlyDescription}>
          초록색이 될 때까지 기다리세요
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleStart}
        >
          <Text style={styles.primaryButtonText}>
            다시하기
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  /**
   * =========================
   * 결과 계산
   * =========================
   */
  const time = reactionTime!

  const rating =
    time < 200
      ? '번개 같은 반응!'
      : time < 300
        ? '매우 빠름'
        : time < 500
          ? '보통'
          : '조금 느려요'

  const ratingColor =
    time < 200
      ? '#00C851'
      : time < 300
        ? '#3182F6'
        : time < 500
          ? '#FF8C00'
          : '#E84040'

  /**
   * =========================
   * 결과 화면
   * =========================
   */
  return (
    <View style={styles.resultContainer}>
      {/* 결과 컨텐츠 */}
      <View style={styles.resultContent}>
        <Text style={styles.resultLabel}>
          반응속도
        </Text>

        <Text style={styles.resultTime}>
          {time}ms
        </Text>

        <Text
          style={[
            styles.resultRating,
            { color: ratingColor },
          ]}
        >
          {rating}
        </Text>

        {/* 광고보고 다시하기 */}
        <TouchableOpacity
          style={styles.adButton}
          onPress={handleWatchAdAndRestart}
        >
          <Text style={styles.primaryButtonText}>
            광고보고 다시하기
          </Text>
        </TouchableOpacity>
      </View>

      {/* 하단 배너 광고 영역 */}
      <View style={styles.bannerArea}>
        <Text style={styles.bannerDebugText}>
          배너 광고 영역
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  /**
   * =========================
   * 시작 화면
   * =========================
   */
  startContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',

    /**
     * 배너를 맨 아래로 밀기
     */
    justifyContent: 'space-between',

    /**
     * iOS 하단 safe area 느낌
     */
    paddingBottom: 34,
  },

  startContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  /**
   * =========================
   * 결과 화면
   * =========================
   */
  resultContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',

    justifyContent: 'space-between',

    paddingBottom: 34,
  },

  resultContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 20,
  },

  /**
   * =========================
   * 공통
   * =========================
   */
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#191F28',
    marginBottom: 12,
  },

  description: {
    fontSize: 16,
    color: '#6B7684',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },

  primaryButton: {
    backgroundColor: '#3182F6',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },

  adButton: {
    backgroundColor: '#00C851',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  outlineButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E8EB',
    width: '100%',
    alignItems: 'center',
  },

  outlineButtonText: {
    color: '#6B7684',
    fontSize: 17,
    fontWeight: '600',
  },

  /**
   * =========================
   * waiting
   * =========================
   */
  waitingScreen: {
    backgroundColor: '#4E5968',
  },

  waitingTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  waitingSubText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },

  /**
   * =========================
   * ready
   * =========================
   */
  readyScreen: {
    backgroundColor: '#00C851',
  },

  readyText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  /**
   * =========================
   * early
   * =========================
   */
  earlyScreen: {
    backgroundColor: '#FFFFFF',
    padding: 24,
  },

  earlyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E84040',
    marginBottom: 12,
    textAlign: 'center',
  },

  earlyDescription: {
    fontSize: 16,
    color: '#6B7684',
    textAlign: 'center',
    marginBottom: 40,
  },

  /**
   * =========================
   * 결과
   * =========================
   */
  resultLabel: {
    fontSize: 16,
    color: '#6B7684',
    marginBottom: 8,
  },

  resultTime: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#191F28',
    marginBottom: 8,
  },

  resultRating: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 48,
  },

  /**
   * =========================
   * 배너 광고 위치 확인용
   * =========================
   */
  bannerArea: {
    width: '100%',
    height: 96,

    backgroundColor:
      'rgba(255, 107, 0, 0.18)',

    borderTopWidth: 2,
    borderTopColor: '#FF6B00',

    alignItems: 'center',
    justifyContent: 'center',
  },

  bannerDebugText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '700',
  },
})

export default ReactionSpeedPage