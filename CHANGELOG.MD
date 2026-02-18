# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

- Show listener count and current mix in voice channel names
- Listener rewrite API polling to endpoint listening
- Refactor to native node.js `fetch`
- Add mix covers to `/nowplaying`
- Reformat `log` function to accept more filetypes
- Rewrite `whitelist` and `blacklist` commands
- Truncate messages when logging `announce` & `purge`

## [1.1.0] - 2026-02-18

### Added

- Added a module `log.js` to standardize `EmbedBuilder()` logging
- Added `truncate()` helper function to new module `helpers.js`
- Added [relative time string formatter](https://discordjs.guide/legacy/popular-topics/formatters#timestamps) to embeds

### Changed

- Updated `.gitignore` to include benign `.vs` and `.vscode` directories
- Moved `progressBar()` to new module `helpers.js`
- Changed ephemeral reply on successful announcement post
- Moved logging out of `try/catch` to avoid ambiguous errors
- Moved message content from `description` to `field` for embed uniformity
- Refactored and cleaned up embeds
- Code reformatting

### Fixed

- Fixed a case where deleted long messages would make `EmbedBuilder` throw an uncaught error. Now messages beyond 1024 characters will be truncated
- Fixed incorrect `for...in` loop in whitelist/blacklist check logic
- Made `m.roles.add()` and `m.setNickname()` function calls on `guildMemberAdd` asynchronous
- Tiny `README.MD` adjustment

### Removed

- `.vs` and `.vscode` directories from repo
- Benign imports and redundant code

## [1.0.1] - 2025-12-16

### Added

- Marked down dependencies in `README.MD`
- Added `node src/reg-cmds.js` to deploy procedure

### Changed

- Refactored `package.json`
- Kosmobot now runs on node version 18

### Removed

- Dependency on `ICY`

## [1.0.0] - 2025-12-16

### Added

- Added `CHANGELOG.MD`
- Added `nodemon.json` config
- Added `/nowplaying` - check what mix is currently playing, time elapsed, time left and how many listeners are tuned in
- Added a listener to poll AzuraCast API every 5 seconds - this should be a temporary solution
- Added a graceful shutdown function
- Added a progress bar to `nowPlaying` embed
- Added a state file to keep track of radio states

### Changed

- Now using `Fetch v3`
- Rewritten CommonJS modules to ESM for better native support and clean syntax
- Rewritten deprecated ephemeral interaction responses into `MessageFlags.Ephemeral`
- Rewritten command loader to conform to ESM
- Rewritten deprecated `"ready"` Client call to `"clientReady"`
- Reduced console spam

### Fixed

- `state` now updates correctly on API polling
