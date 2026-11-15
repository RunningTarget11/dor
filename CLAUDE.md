# DOR

Android app for writing CHP 115A Daily Observation Report (DOR) narratives. Made by
Circuit Mandate. Expo app whose screen is a WebView showing `src/dor.html` (the offline
DOR builder, with a built-in writer, so no internet or account is needed).

- Edit `src/dor.html`, then run `npm run html` to regenerate `src/dorHtml.ts`, and commit both.
- `App.tsx` bridges Copy and Share to the phone, and opens email links in the mail app.
- Every push to main builds an APK on GitHub Actions and publishes it as release
  `build-N` (`DOR-build-N.apk` and `DOR-latest.apk`).

## Version number
The DOR builder exists in three copies that share one version number, shown at the top of
the page (`<p id="ver">`): the claude.ai artifact "DOR Narrative Builder — CHP 115A",
`dor.html` in RunningTarget11/road-dog-download (offline), and `src/dor.html` here (app).
For every change, bump it in all three (1.1 → 1.2 for changes, 2.0 for big redesigns),
update the date, and keep the "(offline)" / "(app)" label. Also bump `version` in
app.json and package.json to match.

## Updates
The app checks where `https://github.com/RunningTarget11/dor/releases/latest` redirects (tag `build-N`; the API is only a fallback because it is rate-limited on mobile networks) on launch
and from the "Check for updates" button, compares the `build-N` tag with its own build
(versionCode − 1000), and offers to download `DOR-latest.apk`. This only works while the
repo is public.
