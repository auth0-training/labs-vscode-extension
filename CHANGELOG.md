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

## [1.1.1] - 2021-09-08
### Added
- Implemented `auth0.exportTenant` command


### Changed
- Updated dependencies

## [1.1.2] - 2021-09-09
### Changed
- fixed bug that caused incorrect tokenset to be used when switching tenants.

## [1.1.3] - 2021-09-10
### Changed
- fixed bug that caused incorrect management client to be used when switching tenants.

## [1.1.4] - 2021-09-10
### Changed
- updated deploy context menu to work for variations of `tenant.yaml` and `auth0.yml`.

## [1.2.0] - 2021-09-14
### Added
- Implemented the `auth0.lab.promptForAuthentication` command.
- Added `unauthenticatedTour` to the local environment model.

### Changed
- Renamed `auth0.lab.notification` to `auth0.lab.promptForConfiguration`
- Updated dependencies

## [1.2.1] - 2021-09-27

### Changed
- Fixed issue with local configure when no `resourceServers` or `clients` are defined in `environment.json`
- Added temporary webpack fix for node-auth0 build errors
- Added temporary webpack fix for auth0-deploy-cli build warnings
- Updated dependencies

## [1.2.2] - 2021-09-28

### Removed
- Removed temporary webpack fix for auth0-deploy-cli build warnings

## [1.3.0] - 2021-10-20

### Changed
- Updated dependencies

## [1.3.1] - 2021-11-15

### Changed
- Ensured data is fresh before attempting to write .env files on local configure command.

## [1.3.2] - 2021-11-16

### Changed
- Pushed refresh functionality into the LabResourceResolverBuilder to avoid executeCommand

## [1.3.3] - 2021-11-16

### Changed
- Gave resolver direct access to data providers

## [1.3.4] - 2022-03-30

### Changed
- Updated dependencies