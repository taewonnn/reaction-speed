import { createRoute } from '@granite-js/react-native'
import React, { useState, useRef, useCallback } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Share,
} from 'react-native'

type GameState =
  | 'idle'
  | 'waiting'
  | 'ready'
  | 'result'
  | 'too_early'

type AppsInTossFramework = typeof import('@apps-in-toss/framework')

export const Route = createRoute('/', {
  component: ReactionSpeedPage,
})

/**
 * 여기에 앱인토스 콘솔에서 발급받은 전면형 광고 ID를 넣으면 됩니다.
 */
const FULLSCREEN_AD_GROUP_ID = 'YOUR_FULLSCREEN_AD_GROUP_ID'

/**
 * 로컬 개발 환경에서는 @apps-in-toss/framework import 자체가 에러날 수 있어서
 * 실제 광고 버튼을 눌렀을 때만 동적으로 불러옵니다.
 */
async function loadAppsInTossFramework(): Promise<AppsInTossFramework | null> {
  try {
    return await import('@apps-in-toss/framework')
  } catch (error) {
    console.warn('[AIT] framework load failed:', error)
    return null
  }
}

function ReactionSpeedPage() {
  const [state, setState] = useState<GameState>('idle')
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [isAdLoading, setIsAdLoading] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number>(0)

  const handleStart = useCallback(() => {
    setState('waiting')
    setReactionTime(null)

    const delay = Math.random() * 3000 + 1000

    timerRef.current = setTimeout(() => {
      setState('ready')
      startTimeRef.current = Date.now()
    }, delay)
  }, [])

  const handleTap = useCallback(() => {
    if (state === 'waiting') {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      setState('too_early')
      return
    }

    if (state === 'ready') {
      const elapsed = Date.now() - startTimeRef.current

      setReactionTime(elapsed)
      setState('result')
    }
  }, [state])

  /**
   * 광고보고 다시하기
   *
   * 동작 흐름:
   * 1. @apps-in-toss/framework 동적 로드
   * 2. loadFullScreenAd 로 전면형 광고 로드
   * 3. loaded 이벤트 수신 시 showFullScreenAd 로 광고 노출
   * 4. dismissed 또는 failedToShow 시 게임 재시작
   * 5. 로컬/미지원/에러 상황에서는 바로 게임 재시작
   */
  const handleWatchAdAndRestart = useCallback(async () => {
    if (isAdLoading) return

    setIsAdLoading(true)

    const framework = await loadAppsInTossFramework()

    if (!framework) {
      setIsAdLoading(false)
      handleStart()
      return
    }

    const { loadFullScreenAd, showFullScreenAd } = framework

    if (
      !loadFullScreenAd.isSupported() ||
      !showFullScreenAd.isSupported()
    ) {
      setIsAdLoading(false)
      handleStart()
      return
    }

    let hasStarted = false

    const restartOnce = () => {
      if (hasStarted) return

      hasStarted = true
      setIsAdLoading(false)
      handleStart()
    }

    const cleanupLoadAd = loadFullScreenAd({
      options: {
        adGroupId: FULLSCREEN_AD_GROUP_ID,
      },
      onEvent: event => {
        console.log('[FullScreenAd] load event:', event)

        if (event.type === 'loaded') {
          cleanupLoadAd?.()

          const cleanupShowAd = showFullScreenAd({
            options: {
              adGroupId: FULLSCREEN_AD_GROUP_ID,
            },
            onEvent: showEvent => {
              console.log('[FullScreenAd] show event:', showEvent)

              if (
                showEvent.type === 'dismissed' ||
                showEvent.type === 'failedToShow'
              ) {
                cleanupShowAd?.()
                restartOnce()
              }
            },
            onError: error => {
              console.error('[FullScreenAd] show error:', error)
              cleanupShowAd?.()
              restartOnce()
            },
          })

          return
        }

        if (event.type === 'failedToShow') {
          cleanupLoadAd?.()
          restartOnce()
        }
      },
      onError: error => {
        console.error('[FullScreenAd] load error:', error)
        cleanupLoadAd?.()
        restartOnce()
      },
    })
  }, [handleStart, isAdLoading])

  if (state === 'idle') {
    return (
      <View style={styles.startContainer}>
        <View style={styles.startContent}>
          <Text style={styles.title}>반응속도 테스트</Text>

          <Text style={styles.description}>
            화면이 초록색으로 바뀌면{'\n'}
            최대한 빨리 탭하세요!
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStart}
          >
            <Text style={styles.primaryButtonText}>시작하기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bannerArea}>
          <Text style={styles.bannerDebugText}>배너 광고 영역</Text>
        </View>
      </View>
    )
  }

  if (state === 'waiting') {
    return (
      <TouchableOpacity
        style={[styles.fullScreen, styles.waitingScreen]}
        onPress={handleTap}
        activeOpacity={1}
      >
        <Text style={styles.waitingTitle}>잠깐만요...</Text>
        <Text style={styles.waitingSubText}>초록색으로 바뀌면 탭하세요</Text>
      </TouchableOpacity>
    )
  }

  if (state === 'ready') {
    return (
      <TouchableOpacity
        style={[styles.fullScreen, styles.readyScreen]}
        onPress={handleTap}
        activeOpacity={1}
      >
        <Text style={styles.readyText}>지금!</Text>
      </TouchableOpacity>
    )
  }

  if (state === 'too_early') {
    return (
      <View style={[styles.fullScreen, styles.earlyScreen]}>
        <Text style={styles.earlyTitle}>너무 빨라요!</Text>

        <Text style={styles.earlyDescription}>
          초록색이 될 때까지 기다리세요
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
          <Text style={styles.primaryButtonText}>다시하기</Text>
        </TouchableOpacity>
      </View>
    )
  }

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

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `내 반응속도는 ${time}ms ⚡️\n\n` +
          `${rating}\n\n` +
          `너도 도전해봐!`,
      })
    } catch (error) {
      console.error('공유 실패:', error)
    }
  }

  return (
    <View style={styles.resultContainer}>
      <View style={styles.resultContent}>
        <Text style={styles.resultLabel}>반응속도</Text>

        <Text style={styles.resultTime}>{time}ms</Text>

        <Text style={[styles.resultRating, { color: ratingColor }]}>
          {rating}
        </Text>

        <TouchableOpacity
          style={[
            styles.adButton,
            isAdLoading && styles.disabledButton,
          ]}
          disabled={isAdLoading}
          onPress={handleWatchAdAndRestart}
        >
          <Text style={styles.primaryButtonText}>
            {isAdLoading ? '광고 불러오는 중...' : '광고보고 다시하기'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>공유하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bannerArea}>
        <Text style={styles.bannerDebugText}>배너 광고 영역</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  startContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    paddingBottom: 34,
  },

  startContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

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

  disabledButton: {
    opacity: 0.55,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  shareButton: {
    backgroundColor: '#F2F4F6',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },

  shareButtonText: {
    color: '#191F28',
    fontSize: 17,
    fontWeight: '600',
  },

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

  readyScreen: {
    backgroundColor: '#00C851',
  },

  readyText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

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

  bannerArea: {
    width: '100%',
    height: 96,
    backgroundColor: 'rgba(255, 107, 0, 0.18)',
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