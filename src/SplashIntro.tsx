import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, useWindowDimensions } from 'react-native';

const SCENE = require('../assets/splash-scene.jpg');
const ASPECT = 630 / 864;

/** Startup screen: the cartoon full width with the DOR title, then fades into the app. Tap to skip. */
export default function SplashIntro({ onDone }: { onDone: () => void }) {
  const { width } = useWindowDimensions();
  const fade = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(1)).current;
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(out, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => onDone());
  };

  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const t = setTimeout(finish, 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: out }]}>
      <Pressable style={styles.fill} onPress={finish}>
        <Animated.View style={{ opacity: fade, transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [1.06, 1] }) }] }}>
          <Image source={SCENE} style={{ width, height: width * ASPECT }} resizeMode="cover" />
        </Animated.View>
        <Animated.View style={[styles.text, { opacity: fade }]}>
          <Text style={styles.title}>DOR</Text>
          <Text style={styles.sub}>CHP 115A Daily Observation Report</Text>
          <Text style={styles.by}>Made by Circuit Mandate</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#1f3a5f', zIndex: 10 },
  fill: { flex: 1, justifyContent: 'center' },
  text: { alignItems: 'center', marginTop: 28 },
  title: { color: '#fff', fontSize: 52, fontWeight: '800', letterSpacing: 2 },
  sub: { color: '#e0b24a', fontSize: 15, fontWeight: '600', marginTop: 4 },
  by: { color: 'rgba(255,255,255,.7)', fontSize: 13, marginTop: 18 },
});
