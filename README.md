# Otter Companion (Calm Together)

<!-- LIVE_URL_START -->
**Live app:** https://dewwy21.github.io/Calm-Together/
<!-- LIVE_URL_END -->

An ADHD-caregiver support app built with Expo (React Native + web), using Expo Router for navigation and on-device AsyncStorage for all local data.

The live link above is kept up to date automatically — see [Deployment](#deployment) below.

## Local development

```bash
npm install
npm run web      # start the Expo dev server for web
npm start        # start the Expo dev server (choose a platform)
```

AI-powered features read API keys from a local `.env` file (git-ignored) and fall back to a "not connected" state when none is present — this is expected for the public deployment, which intentionally ships without any AI credentials (see below).

## Deployment

Every push to `main` triggers [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which:

1. Exports the Expo web build (`npx expo export --platform web`).
2. Publishes it to the `gh-pages` branch via GitHub Pages.
3. Recomputes the live URL from the repository's own owner/name and updates the link above if it changed, committing only when there's an actual change (no duplicate or no-op commits).

The deployed build intentionally excludes any API keys — `EXPO_PUBLIC_*` environment variables get inlined into the shipped JS bundle, so secrets are never passed to this workflow. AI features work normally when running locally against your own `.env`.

To deploy manually instead, from a machine with `git` available:

```bash
npm run deploy
```
