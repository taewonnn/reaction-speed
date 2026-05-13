import { createRoute } from '@granite-js/react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

type GameState =
  | 'idle'
  | 'waiting'
  | 'ready'
  | 'result'
  | 'too_early'

type AppsInTossFramework = typeof import('@apps-in-toss/framework')
type InlineAdComponent = AppsInTossFramework['InlineAd']

const FULLSCREEN_AD_GROUP_ID = 'ait.v2.live.a2c2333373d542b2'
const BANNER_AD_GROUP_ID = 'ait.v2.live.14e6d521eb564f44'
const TOTAL_ROUNDS = 3

export const Route = createRoute('/', {
  component: ReactionSpeedPage,
})

async function loadAppsInTossFramework(): Promise<AppsInTossFramework | null> {
  try {
    return await import('@apps-in-toss/framework')
  } catch (error) {
    console.warn('[AIT] framework load failed:', error)
    return null
  }
}

function ReactionSpeedPage(): React.ReactElement {
  const [state, setState] = useState<GameState>('idle')
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [currentRound, setCurrentRound] = useState(1)
  const [isAdLoading, setIsAdLoading] = useState(false)
  const [InlineAd, setInlineAd] = useState<InlineAdComponent | null>(null)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef(0)

  useEffect(() => {
    let mounted = true

    loadAppsInTossFramework().then(framework => {
      if (!mounted || !framework) return
      setInlineAd(() => framework.InlineAd)
    })

    return () => {
      mounted = false
    }
  }, [])

  const startNextRound = useCallback(() => {
    setState('waiting')
    const delay = Math.random() * 3000 + 1000
    timerRef.current = setTimeout(() => {
      setState('ready')
      startTimeRef.current = Date.now()
    }, delay)
  }, [])

  const handleStart = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setReactionTimes([])
    setCurrentRound(1)
    startNextRound()
  }, [startNextRound])

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
      const newTimes = [...reactionTimes, elapsed]
      setReactionTimes(newTimes)

      if (currentRound < TOTAL_ROUNDS) {
        setCurrentRound(prev => prev + 1)
        startNextRound()
      } else {
        setState('result')
      }
    }
  }, [state, reactionTimes, currentRound, startNextRound])

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

    if (!loadFullScreenAd.isSupported() || !showFullScreenAd.isSupported()) {
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
        }

        // if (event.type === 'failedToShow') {
        //   cleanupLoadAd?.()
        //   restartOnce()
        // }
      },
      onError: error => {
        console.error('[FullScreenAd] load error:', error)
        cleanupLoadAd?.()
        restartOnce()
      },
    })
  }, [handleStart, isAdLoading])

  const getRating = (time: number) => {
    if (time < 200) return '번개 같은 반응!'
    if (time < 300) return '매우 빠름'
    if (time < 500) return '보통'
    return '조금 느려요'
  }

  const getRatingColor = (time: number) => {
    if (time < 200) return '#00C851'
    if (time < 300) return '#3182F6'
    if (time < 500) return '#FF8C00'
    return '#E84040'
  }

  const handleShare = async (avgTime: number, rating: string) => {
    try {
      let shareLink = ''
      try {
        const { getTossShareLink } = await import('@apps-in-toss/native-modules')
        shareLink = await getTossShareLink('intoss://reaction-speed-test')
      } catch {
        // 링크 생성 실패 시 텍스트만 공유
      }

      const message = shareLink
        ? `내 반응속도 평균은 ${avgTime}ms ⚡️\n\n${rating}\n\n너도 도전해봐!\n${shareLink}`
        : `내 반응속도 평균은 ${avgTime}ms ⚡️\n\n${rating}\n\n너도 도전해봐!`

      await Share.share({ message })
    } catch (error) {
      console.error('공유 실패:', error)
    }
  }

  if (state === 'idle') {
    return (
      <View style={styles.startContainer}>
        <View style={styles.startContent}>
          <Text style={styles.title}>반응속도 테스트</Text>

          <Text style={styles.description}>
            화면이 초록색으로 바뀌면{'\n'}
            최대한 빨리 탭하세요!{'\n\n'}
            총 3번 측정 후 평균을 알려드려요
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>시작하기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bannerArea}>
          {InlineAd != null && (
            <InlineAd
              adGroupId={BANNER_AD_GROUP_ID}
              impressFallbackOnMount
            />
          )}
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
        <Text style={styles.roundIndicator}>{currentRound} / {TOTAL_ROUNDS}</Text>
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
        <Text style={styles.roundIndicator}>{currentRound} / {TOTAL_ROUNDS}</Text>
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

  const avgTime = Math.round(
    reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
  )
  const currentRating = getRating(avgTime)
  const currentRatingColor = getRatingColor(avgTime)

  return (
    <View style={styles.resultContainer}>
      <View style={styles.resultContent}>
        <Text style={styles.resultLabel}>평균 반응속도</Text>

        <Text style={styles.resultTime}>{avgTime}ms</Text>

        <Text style={[styles.resultRating, { color: currentRatingColor }]}>
          {currentRating}
        </Text>

        <View style={styles.roundResults}>
          {reactionTimes.map((t, i) => (
            <View key={i} style={styles.roundRow}>
              <Text style={styles.roundRowLabel}>{i + 1}회차</Text>
              <Text style={styles.roundRowTime}>{t}ms</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.adButton, isAdLoading && styles.disabledButton]}
          disabled={isAdLoading}
          onPress={handleWatchAdAndRestart}
        >
          <Text style={styles.primaryButtonText}>
            {isAdLoading ? '광고 불러오는 중...' : '광고보고 다시하기'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => handleShare(avgTime, currentRating)}
        >
          <Text style={styles.shareButtonText}>공유하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bannerArea}>
        {InlineAd != null && (
          <InlineAd
            adGroupId={BANNER_AD_GROUP_ID}
            impressFallbackOnMount
          />
        )}
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

  roundIndicator: {
    position: 'absolute',
    top: 48,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
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
    marginBottom: 24,
  },

  roundResults: {
    width: '100%',
    gap: 8,
    marginBottom: 32,
  },

  roundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },

  roundRowLabel: {
    fontSize: 14,
    color: '#6B7684',
    fontWeight: '500',
  },

  roundRowTime: {
    fontSize: 14,
    color: '#191F28',
    fontWeight: '600',
  },

  bannerArea: {
    width: '100%',
    height: 96,
    overflow: 'hidden',
  },
})

export default ReactionSpeedPage
