// Run on GitHub after `expo prebuild`: sets the version number and, if a
// release keystore is provided in repository secrets, signs with it.
import fs from 'node:fs';

const gradlePath = 'android/app/build.gradle';
let g = fs.readFileSync(gradlePath, 'utf8');

// Android won't install an update with a lower version code than the app on
// the phone, and Expo's builds already counted up. Start well above them.
const run = Number(process.env.GITHUB_RUN_NUMBER || 0);
const versionCode = 1000 + run;
g = g.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
g = g.replace(/versionName\s+"([^"]+)"/, `versionName "$1 (${run})"`);

const ks = process.env.ANDROID_KEYSTORE_BASE64;
if (ks) {
  fs.writeFileSync('android/app/release.keystore', Buffer.from(ks, 'base64'));
  const release = `
        release {
            storeFile file('release.keystore')
            storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('ANDROID_KEY_ALIAS')
            keyPassword System.getenv('ANDROID_KEY_PASSWORD')
        }`;
  g = g.replace(/signingConfigs\s*\{/, (m) => m + release);
  // The release build type points at the debug key by default; point it at ours.
  const rel = g.indexOf('buildTypes');
  const at = g.indexOf('release {', rel);
  const sc = g.indexOf('signingConfig signingConfigs.debug', at);
  if (rel < 0 || at < 0 || sc < 0) throw new Error('Could not find the release signing line in build.gradle');
  g = g.slice(0, sc) + 'signingConfig signingConfigs.release' + g.slice(sc + 'signingConfig signingConfigs.debug'.length);
  console.log('Signing with the release keystore from secrets.');
} else {
  console.log('No ANDROID_KEYSTORE_BASE64 secret: signing with the standard debug key.');
}

fs.writeFileSync(gradlePath, g);
console.log(`versionCode ${versionCode}`);
