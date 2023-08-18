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

## [1.3.5] - 2022-08-11

### Changed
- Updated dependencies

## [1.3.6] - 2022-09-19

### Added
- Ability to provide alternative root tenant authority via envvars

## [1.3.7] - 2023-02-17

### Added
- Ability to export tenant settings via deploy cli to a directory
  named **tenant**

### Changed
- updated dependencies
- updated auth0 deploy cli to 7.16.1
- updated tenant export and import code to latest version
  - removed dependency on js-yaml delpoy cli handles directly
- updated auth to remove dependency on abort-controller
  - openid-client now handles this directly
- updated required vscode version to 1.75.1
- updated test runner to use vscode version 1.75.1

## [1.3.8] - 2023-02-18

### Removed
- Removed marketplace badge from readme

## [1.3.9] - 2023-03-02

### Removed
- Reverted deploy cli back to previous version

## [1.4.0] - 2023-03-28

### Changed
- updated dependencies
- updated auth0 deploy cli to 7.17.0
- updated tenant export and import code to latest version
  - removed dependency on js-yaml delpoy cli handles directly
- updated required vscode version to 1.76.2
- updated test runner to use vscode version 1.76.2

## [1.4.1] - 2023-03-29

### Added
- deploy cli config.json placed next to tenant.yml will be merged into deploy configuration.

### Changed
- reverted to auth0 v2.42.0

## [1.4.2] - 2023-04-19
### Added
- Support for Codespaces added so that when the registered command `openEndpointByName` is used, it resolves the correct URL for apps launched in the Codespaces environment.

## [1.4.3] - 2023-05-01
### Added
- Implemented `auth0.lab.postConfigureCommand` command
- Support for writing more than one app config to a single `.env` without overwriting values
- Added environment-specific replacement values for tenant configuration from yaml: `CODESPACE_NAME` (same as defined [here]( https://docs.github.com/en/codespaces/developing-in-codespaces/default-environment-variables-for-your-codespace)) and `AUTH0_DOMAIN` (your tenant domain). 

## [1.4.4] - 2023-05-31
### Changed
- Auth0 Training logo (branding)

- ## [1.4.5] - 2023-08-18
### Added
- Added environment-specific replacement value for tenant configuration from yaml: `GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN` (same as defined [here]( https://docs.github.com/en/codespaces/developing-in-codespaces/default-environment-variables-for-your-codespace)
