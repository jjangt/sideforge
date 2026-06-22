/**
 * GlobalLoadingBar 컴포넌트
 * 
 * 페이지 이동, API 호출 등 로딩 상태일 때 화면 상단에 프로그레스 바 표시.
 * _layout.tsx에서 한 번만 마운트.
 * 
 * 사용: useGlobalLoading store에서 start/stop 호출
 */

import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useGlobalLoadingStore } from '../../stores/useGlobalLoadingStore';

export function GlobalLoadingBar() {
  const isLoading = useGlobalLoadingStore((s) => s.isLoading);
  const animValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      // 표시 + 애니메이션 시작
      Animated.timing(opacityValue, { toValue: 1, duration: 200, useNativeDriver: false }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, { toValue: 1, duration: 1500, useNativeDriver: false }),
          Animated.timing(animValue, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      ).start();
    } else {
      // 숨기기
      Animated.timing(opacityValue, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
  }, [isLoading]);

  const width = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={{ opacity: opacityValue, height: 3, width: '100%', backgroundColor: '#1A1333' }}>
      <Animated.View style={{ height: 3, width, backgroundColor: '#7C3AED', borderRadius: 2 }} />
    </Animated.View>
  );
}
