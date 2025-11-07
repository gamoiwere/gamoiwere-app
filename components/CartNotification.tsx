import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { ShoppingCart, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CartNotificationProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  onViewCart?: () => void;
}

export default function CartNotification({ visible, message, onHide, onViewCart }: CartNotificationProps) {
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 6,
        }),
      ]).start();

      const timeout = setTimeout(() => {
        hideNotification();
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <LinearGradient
        colors={['#6e39ea', '#8b5cf6', '#a78bfa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <ShoppingCart size={24} color="#6e39ea" strokeWidth={2.5} />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>წარმატება!</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideNotification}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color="rgba(255, 255, 255, 0.8)" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {onViewCart && (
          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => {
              hideNotification();
              onViewCart();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.viewCartText}>კალათის ნახვა</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 20,
  },
  gradient: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6e39ea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.3,
    fontFamily: 'MarkGEO-Regular',
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'MarkGEO-Regular',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewCartButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  viewCartText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
    fontFamily: 'MarkGEO-Regular',
  },
});
