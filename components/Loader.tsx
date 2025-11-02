import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export default function Loader() {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue1 = useRef(new Animated.Value(1)).current;
  const scaleValue2 = useRef(new Animated.Value(1)).current;
  const scaleValue3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    const scaleAnimation = Animated.loop(
      Animated.stagger(150, [
        Animated.sequence([
          Animated.timing(scaleValue1, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleValue2, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleValue3, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    spinAnimation.start();
    scaleAnimation.start();

    return () => {
      spinAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]}>
        <View style={styles.ringInner} />
      </Animated.View>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { transform: [{ scale: scaleValue1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ scale: scaleValue2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ scale: scaleValue3 }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  ring: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#8b5cf6',
    borderTopColor: 'transparent',
    marginBottom: 16,
  },
  ringInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomColor: '#a78bfa',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8b5cf6',
  },
});
