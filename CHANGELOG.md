# Change Log

All notable changes to the "testextension" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Initial release

## [1.1.0] - 2021-09-01
### Added
- Implemented `auth0.lab.openEndpointByName` command
- Implemented `auth0.lab.localConfigure` command
- Implemented `auth0.lab.tenantCofigure` command

### Changed
- Updated dependencies
### Removed
- - Removed direct dependency on CodeTour and RestClient
  - These dependecies should now be defined in the devcontainer.json file
