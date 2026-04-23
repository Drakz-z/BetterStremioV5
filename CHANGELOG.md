# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.7] - 2026-04-23

### Changed

- Reworked Windows shortcut repair to run from a temp PowerShell script with explicit verification instead of a fragile inline command.
- Added dedicated `BetterStremio.lnk` launchers on Windows so there is always a working shortcut even if Stremio's own shortcut is regenerated without the BetterStremio arguments.

## [1.0.6] - 2026-04-23

### Added

- Improved Windows shortcut repair so the installer also fixes or recreates the standard `Stremio.lnk` entries used by Stremio v5.
- Bundled a forked WatchParty plugin path so the optional installer download can pull from this repository directly.

### Changed

- Updated BetterStremio self-update and documentation links to point to `Drakz-z/BetterStremioV5`.

## [1.0.5] - 2024-01-05

### Added

- Fixed cached responses.
- Fixed notification icon.

## [1.0.4] - 2024-01-05

### Added

- New notification icon couting plugins/themes available to update.

## [1.0.3] - 2024-01-03

### Added

- Autoupdate: automatically check for updates on plugins & themes.
- Improved plugins error handling.
- Reduced final binary size (moved assets to the web).
- Fixed BetterStremio UI / reloading for plugins and themes (`BetterStremio.Internal.reloadUI`).
- Fixed installer compatibility with Windows systems of users suffering from [USERPROFILE abbreviation](https://superuser.com/questions/892228/user1-in-user-folder).
- Added new status messages to installer (to monitor the patching/unpatching process).


## [1.0.2] - 2024-12-29

### Added

- Windows / Linux compatibility (requires repatching).
- New open changelog route.

### Removed

-  Windows batch installer: replaced by a universal WebUI installer.


## [1.0.1] - 2024-06-05

### Added

- BetterStremio.Modules.
- BetterStremio.Scopes.


## [1.0.0] - 2024-06-02

### Added

- Patching script (Windows).
- BetterStremio Loader (plugins & themes).
- Documentation: CHANGELOG and README.
- Autoupdate for BetterStremio Loader.

[1.0.0]: https://github.com/Drakz-z/BetterStremioV5/releases/tag/v1.0.0
[1.0.1]: https://github.com/Drakz-z/BetterStremioV5/releases/tag/v1.0.1
[1.0.2]: https://github.com/Drakz-z/BetterStremioV5/releases/tag/v1.0.2
