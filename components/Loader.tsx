import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface LoaderProps {
  message?: string;
}

export default function Loader({ message = 'იტვირთება...' }: LoaderProps) {
  const scaleValue1 = useRef(new Animated.Value(0.6)).current;
  const scaleValue2 = useRef(new Animated.Value(0.6)).current;
  const scaleValue3 = useRef(new Animated.Value(0.6)).current;
  const opacityValue1 = useRef(new Animated.Value(0.4)).current;
  const opacityValue2 = useRef(new Animated.Value(0.4)).current;
  const opacityValue3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const createDotAnimation = (scaleVal: Animated.Value, opacityVal: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleVal, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(opacityVal, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleVal, {
              toValue: 0.6,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(opacityVal, {
              toValue: 0.4,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    const anim1 = createDotAnimation(scaleValue1, opacityValue1, 0);
    const anim2 = createDotAnimation(scaleValue2, opacityValue2, 150);
    const anim3 = createDotAnimation(scaleValue3, opacityValue3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <Animated.View
          style={[
            styles.dot,
            { 
              transform: [{ scale: scaleValue1 }],
              opacity: opacityValue1,
            }
          ]}
        >
          <LinearGradient
            colors={['#7816d6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dotGradient}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.dot,
            { 
              transform: [{ scale: scaleValue2 }],
              opacity: opacityValue2,
            }
          ]}
        >
          <LinearGradient
            colors={['#7816d6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dotGradient}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.dot,
            { 
              transform: [{ scale: scaleValue3 }],
              opacity: opacityValue3,
            }
          ]}
        >
          <LinearGradient
            colors={['#7816d6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dotGradient}
          />
        </Animated.View>
      </View>

      {message && <Text style={styles.loadingText}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  dotGradient: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
});
