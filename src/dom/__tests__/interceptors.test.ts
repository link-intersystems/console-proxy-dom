import { screen } from "@testing-library/dom";
import redirect_textarea from "./redirect_textarea.html";
import {
  createDOMConsoleLogHandler,
  DomConsoleLogInterceptor,
} from "../interceptors";
import { createConsoleMock } from "@link-intersystems/console-redirection/src/__tests__";
import { createConsoleProxy } from "@link-intersystems/console-redirection/src/proxy/consoleProxy";
import { ConsoleProxy } from "@link-intersystems/console-redirection";

describe("DomHandlers Tests", () => {
  let proxy: ConsoleProxy;
  let domConsoleLogInterceptor: DomConsoleLogInterceptor;

  beforeEach(() => {
    proxy = createConsoleProxy();
    domConsoleLogInterceptor = createDOMConsoleLogHandler();
    proxy.setInterceptor(domConsoleLogInterceptor);
  });

  function testAllLevels() {
    proxy.log("Log");
    proxy.info("Info");
    proxy.warn("Warn");
    proxy.debug("Debug");
    proxy.error("Error");

    const consoleOutput = screen.queryByTestId("consoleOutput");
    expect(consoleOutput).toBeInTheDocument();
    expect((consoleOutput as any)?.value).toEqual(
      "LOG: Log\nINFO: Info\nWARN: Warn\nDEBUG: Debug\nERROR: Error"
    );
  }
  test("Redirect all log levels to textarea", async () => {
    document.body.innerHTML = redirect_textarea;

    testAllLevels();
  });

  test("Redirect useing base element", async () => {
    document.body.innerHTML = redirect_textarea;

    const container = document.body.querySelector(".container");
    expect(container).toBeInTheDocument();

    container && domConsoleLogInterceptor.setBaseDomElement(container);

    testAllLevels();
  });

  test("Redirect useing custom selector", async () => {
    document.body.innerHTML = redirect_textarea;

    domConsoleLogInterceptor.setLogTargetSelector("textarea");

    testAllLevels();
  });

  test("default console", async () => {
    domConsoleLogInterceptor = createDOMConsoleLogHandler();
    proxy.setInterceptor(domConsoleLogInterceptor);

    document.body.innerHTML = redirect_textarea;

    domConsoleLogInterceptor.setLogTargetSelector("textarea");

    testAllLevels();
  });

  test("log error if target html element does not exist", async () => {
    const consoleMock = createConsoleMock();
    proxy = createConsoleProxy(consoleMock);
    domConsoleLogInterceptor = createDOMConsoleLogHandler(consoleMock);
    proxy.setInterceptor(domConsoleLogInterceptor);

    domConsoleLogInterceptor.setLogTargetSelector("foo");
    document.body.innerHTML = redirect_textarea;

    proxy.log("Log");

    expect(consoleMock.error).toHaveBeenCalledTimes(1);
  });

  test("Non log function is dispatched to target console", async () => {
    const consoleMock = createConsoleMock();
    proxy = createConsoleProxy(consoleMock);
    domConsoleLogInterceptor = createDOMConsoleLogHandler(consoleMock);
    proxy.setInterceptor(domConsoleLogInterceptor);

    proxy.count("label");

    expect(consoleMock.count).toHaveBeenCalledWith("label");
  });
});
