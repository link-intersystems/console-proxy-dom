# Console Proxy Dom Library

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/link-intersystems/console-proxy-dom/Node.js%20CI)
![Coveralls](https://img.shields.io/coveralls/github/link-intersystems/console-proxy-dom)
![GitHub issues](https://img.shields.io/github/issues-raw/link-intersystems/console-proxy-dom)
[![GitHub](https://img.shields.io/github/license/link-intersystems/console-proxy-dom?label=license)](LICENSE.md)

An extension library for [@link-intersystems/console-proxy](https://github.com/link-intersystems/console-proxy) that contains utilities to redirect console logs to dom elements, e.g. a textarea.

## Install

     npm i "@link-intersystems/console-proxy-dom"

## Use

    import {
        createConsoleProxy,
        createConsoleTemplate,
    } from "@link-intersystems/console-proxy";
    import {
        valueLogConfig,
        defaultLogConfig
    } from "@link-intersystems/console-proxy-dom";

    const consoleProxy = createConsoleProxy();

    const domConsoleLogInterceptor = createDOMConsoleLogInterceptor();
    domConsoleLogInterceptor.setLogTargetSelector("#console"); // the default

    // The defaultLogConfig redirects logs by appending them to the target's innerHtml.
    domConsoleLogInterceptor.setLogConfig(defaultLogConfig); // the default
    
    // The valueLogConfig redirects logs by appending them to the target's value property.
    // E.g. can be used for textareas.
    // domConsoleLogInterceptor.setLogConfig(valueLogConfig);

    consoleProxy.setInterceptor(domConsoleLogInterceptor);

    // will be redirected to the dom element selected by the target css selector.
    consoleProxy.info("INFO", "Hello", "World");
    consoleProxy.debug("DEBUG", "Hellow", "World");     

E.g. a div target

    <div class="container">
        <div class="mb-3">
            <label for="console" class="form-label">Console div</label>
            <div data-testid="consoleOutput" class="form-control" id="console" style="height:8em; overflow: scroll;"></div>
        </div>
    </div>

## Live Demo at codepen.io

See [@link-intersystems/console-proxy-dom](https://codepen.io/rene-link/pen/gOxLvgO)