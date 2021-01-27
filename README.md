# Auth0 VSCode Extension

A Visial Studio Code extension that provides a rich IDE experience for setting up your Auth0 integration, and deploying changes to your Auth0 account.

## Instalation

This Visual Studio Code extension is not yet published to the Extensions Marketplace. In order to install this extension, you must run `code --install-extension auth0-vsce-0.0.1.vsix` and close/open Visual Studio Code.

Complete commands:

```
git clone https://github.com/auth0/vscode-extension.git
cd vscode-extension
code --install-extension auth0-vsce-0.0.1.vsix
```

To remove the extension, run `code --uninstall-extension auth0-vsce-0.0.1.vsix`

## Requirements

You'll need an Auth0 account. If you do not already have one, you can create a free one [here](https://auth0.com/signup)

## Quick Start

### Authenticating

The first thing to do is connect to your Auth0 account.

```
// screen capture here
```

You can also log out, or switch your selected tenant

```
// screen capture here
```

### Managing Auth0 Resources

From within VSCode, you can now:

View your Applications and APIs, and also see or copy their pertinent details into your code

```
// screen capture here
```

Create or Update Applications, including setting up your applications to use a local callback URL for development purposes

```
// screen capture here
```

### Advanced Auth0 Resource Updates

You can also take advantage of our `yaml` configuration integration to make more complex changes to your Auth0 resources, then deply them right from within VSCode.

```
// screen capture here
```

### Integrate With Auth0 Extensibility Points via Actions

The Auth0 VSCode extension has full support [Actions](https://auth0.com/docs/actions). Actions enables you to integrate your application with Auth0 events or Extensibility points. For example, you could create an Action to store some metadata everytime a user enters the wrong password.

You can create and deploy an Action

```
// screen capture here
```

You can add dependencies and secrets to your Action

```
// screen capture here
```

And much more!

## License

MIT

## Release Notes

---
