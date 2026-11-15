import { useEffect, useRef } from 'react';
import { Alert, Linking, Share, StyleSheet, useColorScheme } from 'react-native';
import * as Application from 'expo-application';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import * as SplashScreen from 'expo-splash-screen';
import { WebView } from 'react-native-webview';
import { DOR_HTML } from './src/dorHtml';

// The WebView class types don't line up with this React version's types; use it untyped.
const WV: any = WebView;
const BASE = 'https://dor.circuitmandate.app/';

// Updates come from this GitHub repo's releases (tag build-N, file DOR-latest.apk).
const REPO = 'RunningTarget11/dor';
const APK_URL = `https://github.com/${REPO}/releases/latest/download/DOR-latest.apk`;
/** Build number of the installed app (Android versionCode is 1000 + build). */
const installedBuild = () => {
  const n = Number(Application.nativeBuildVersion);
  return n > 1000 ? n - 1000 : 0;
};
/**
 * Newest build number. Reads where github.com/<repo>/releases/latest redirects to
 * (.../releases/tag/build-N), which works from any phone. GitHub's API is only a
 * fallback, since it allows few requests per hour from shared mobile networks.
 */
async function latestBuild(): Promise<number | null> {
  const tag = (s: string) => {
    const m = String(s || '').match(/build-(\d+)/);
    return m ? Number(m[1]) : null;
  };
  try {
    const r = await fetch(`https://github.com/${REPO}/releases/latest`, { headers: { 'Cache-Control': 'no-cache' } });
    const fromUrl = tag(r.url);
    if (fromUrl) return fromUrl;
    if (r.ok) {
      const html = await r.text();
      const m = html.match(/releases\/tag\/(build-\d+)/);
      if (m) return tag(m[1]);
    }
  } catch {}
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } });
    if (r.ok) return tag((await r.json()).tag_name);
  } catch {}
  return null;
}
async function checkForUpdate(manual: boolean) {
  const mine = installedBuild();
  const latest = await latestBuild();
  if (latest == null) {
    if (manual) Alert.alert('Couldn\'t check for updates', 'GitHub didn\'t answer. Try again in a few minutes, or download the newest version here.', [
      { text: 'OK', style: 'cancel' },
      { text: 'Download', onPress: () => Linking.openURL(APK_URL).catch(() => {}) },
    ]);
    return;
  }
  if (latest > mine) {
    Alert.alert('Update available', `DOR build ${latest} is ready (you have build ${mine || '?'}).\n\nTap Download, then open the file when it finishes to install. Your saved DOR stays.`, [
      { text: 'Later', style: 'cancel' },
      { text: 'Download', onPress: () => Linking.openURL(APK_URL).catch(() => {}) },
    ]);
  } else if (manual) {
    Alert.alert('You\'re up to date', `Build ${mine} is the latest version of DOR.`);
  }
}

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const dark = useColorScheme() === 'dark';
  const web = useRef<any>(null);
  useEffect(() => {
    const t = setTimeout(() => checkForUpdate(false), 3000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, []);

  const onMessage = async (e: { nativeEvent: { data: string } }) => {
    let m: { type?: string; text?: string };
    try { m = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (m.type === 'copy' && m.text) await Clipboard.setStringAsync(m.text);
    if (m.type === 'share' && m.text) Share.share({ message: m.text }).catch(() => {});
    if (m.type === 'update') checkForUpdate(true);
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
            ref={web}
            onLoadEnd={() => {
              SplashScreen.hideAsync().catch(() => {});
              web.current?.injectJavaScript(`setBuild(${installedBuild()});true;`);
            }}
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
