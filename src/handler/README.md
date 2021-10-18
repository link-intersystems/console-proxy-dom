# Console Proxy Handlers

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/link-intersystems/console-redirection/Node.js%20CI)
![Coveralls](https://img.shields.io/coveralls/github/link-intersystems/console-redirection)
![GitHub issues](https://img.shields.io/github/issues-raw/link-intersystems/console-redirection)
[![GitHub](https://img.shields.io/github/license/link-intersystems/console-redirection?label=license)](LICENSE.md)

This module contains useful proxy handlers for the ConsoleProxy.

## createLogEnablementHandler(targetConsole: Console = console): LogEnablementHandler

Creates an object that can be used as a handler for a [ConsoleProxy](../proxy/README.md) and that let you enable and disable log levels.

Create a logEnablementHandler with the defaul console.

    const logEnablementHandler = createLogEnablementHandler();

Create a logEnablementHandler with a specific console.

    const targetConsole = ... // object that fulfills the console API
    const logEnablementHandler = createLogEnablementHandler(targetConsole);

### setLevelEnabled(level: LogLevel | "all", enabled: boolean): void

    logEnablementHandler.setLevelEnabled("log", false);

Valid log levels are

    type LogLevel = "log" | "info" | "warn" | "debug" | "error";