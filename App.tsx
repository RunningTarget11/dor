import { useEffect } from 'react';
import { Linking, Share, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import * as SplashScreen from 'expo-splash-screen';
import { WebView } from 'react-native-webview';
import { DOR_HTML } from './src/dorHtml';

// The WebView class types don't line up with this React version's types; use it untyped.
const WV: any = WebView;
const BASE = 'https://dor.circuitmandate.app/';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const dark = useColorScheme() === 'dark';
  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, []);

  const onMessage = async (e: { nativeEvent: { data: string } }) => {
    let m: { type?: string; text?: string };
    try { m = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (m.type === 'copy' && m.text) await Clipboard.setStringAsync(m.text);
    if (m.type === 'share' && m.text) Share.share({ message: m.text }).catch(() => {});
  };

  // Email (mailto:) and outside links open in the phone's own apps.
  const onNav = (req: { url: string }) => {
    if (req.url.startsWith(BASE) || req.url === 'about:blank' || req.url.startsWith('data:')) return true;
    Linking.openURL(req.url).catch(() => {});
    return false;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.root, { backgroundColor: dark ? '#16263d' : '#1f3a5f' }]} edges={['top']}>
        <StatusBar style="light" />
        <SafeAreaView style={[styles.root, { backgroundColor: dark ? '#12161d' : '#f4f2ed' }]} edges={['bottom']}>
          <WV
            source={{ html: DOR_HTML, baseUrl: BASE }}
            originWhitelist={['*']}
            domStorageEnabled
            javaScriptEnabled
            onMessage={onMessage}
            onShouldStartLoadWithRequest={onNav}
            onLoadEnd={() => SplashScreen.hideAsync().catch(() => {})}
            setSupportMultipleWindows={false}
            overScrollMode="never"
            textZoom={100}
            style={{ backgroundColor: 'transparent' }}
          />
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
