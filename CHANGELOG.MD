# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

- Show listener count and current mix in voice channel names
- Listener rewrite API polling to endpoint listening
- Refactor to native node.js fetch

## [1.0.1] - 2025-12-16

### Added

- Marked down dependencies in README.MD

### Changed

- Refactored `package.json`
- Kosmobot now runs on node version 18

### Removed

- Dependency on ICY

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