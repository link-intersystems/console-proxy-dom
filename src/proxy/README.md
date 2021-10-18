# Console Proxy

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/link-intersystems/console-redirection/Node.js%20CI)
![Coveralls](https://img.shields.io/coveralls/github/link-intersystems/console-redirection)
![GitHub issues](https://img.shields.io/github/issues-raw/link-intersystems/console-redirection)
[![GitHub](https://img.shields.io/github/license/link-intersystems/console-redirection?label=license)](LICENSE.md)

The consoleProxy module provides support for intercepting a console, usually the default console.

## ConsoleProxy.setDefaultHandler(handler?: Handler | Partial<Console>) => void;

The default handler will handle all invocations if no specific handler is registered. To register a specific handler see `ConsoleProxy.setFunctionHandler` and `ConsoleProxy.setDirectFunctionHandler`

## ConsoleProxy.setFunctionHandler(fnName: ConsoleFunctionName, handler: Handler): UnregisterHandler;

Register a function handler for a specific function. A function handler has access to the invocation context and therefore can be used to implement more complex logic in contrast to a `ConsoleProxy.setDirectFunctionHandler`.

    // Prefix all info logs with >>
    consoleProxy.setFunctionHandler("info", (invocation) => {
        const argMsg = invocation.args.join(" ");
        const msg = `>> ${argMsg}`;
        return invocation.targetFn.apply(invocation.target, [msg]);
    });

    consoleProxy.log("Hello World");
    consoleProxy.info("Hello World");

    // Output:
    // Hello World
    // >> Hello World

## ConsoleProxy.setDirectFunctionHandler(fnName: ConsoleFunctionName,  handler: (...args: any[]) => any): UnregisterHandler;

A direct function handler is a more simple API of the function handler. You only have to provide a function with target function's signature.

    let lastInfoLog: string = ""

    consoleProxy.setDirectFunctionHandler("info", (...args) => {
        lastInfoLog = args.join(" ");
    });

    consoleProxy.info("Hello", "World");

    // value of lastInfoLog is "Hello World". Nothing is logged.