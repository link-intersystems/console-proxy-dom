import { screen } from "@testing-library/dom";
import redirect_textarea from "./redirect_textarea.html";
import redirect_div from "./redirect_div.html";
import {
  createDOMConsoleLogInterceptor,
  DomConsoleLogInterceptor,
} from "../interceptors";
import {
  consoleFnNames,
  ConsoleProxy,
  createConsoleProxy,
} from "@link-intersystems/console-proxy";
import { defaultLogConfig } from "index";

function createConsoleMock() {
  return consoleFnNames.reduce((proxy, fn) => {
    (proxy as any)[fn] = jest.fn();
    return proxy;
  }, {} as Console);
}

describe("interceptors Tests", () => {
  let proxy: ConsoleProxy;
  let domConsoleLogInterceptor: DomConsoleLogInterceptor;

  beforeEach(() => {
    proxy = createConsoleProxy();
    domConsoleLogInterceptor = createDOMConsoleLogInterceptor();
    proxy.setInterceptor(domConsoleLogInterceptor);
  });

  function getInputValue(element: Element) {
    if (element) return (element as any).value;
  }

  function getInnerHtml(element: Element) {
    if (element) return (element as any).innerHTML;
  }

  function logAllLevels() {
    const consoleOutput = screen.queryByTestId("consoleOutput") as HTMLElement;
    expect(consoleOutput).toBeInTheDocument();

    proxy.log("Log");
    proxy.info("Info");
    proxy.warn("Warn");
    proxy.debug("Debug");
    proxy.error("Error");
  }

  function expectOutputToBe(
    expected: string,
    getConsoleElementContent: (elemen: Element) => string = getInputValue
  ) {
    const consoleOutput = screen.queryByTestId("consoleOutput") as HTMLElement;
    const consoleElementContent = getConsoleElementContent(consoleOutput);
    expect(consoleElementContent).toEqual(expected);
  }

  test("Redirect all log levels to textarea", async () => {
    document.body.innerHTML = redirect_textarea;

    logAllLevels();

    expectOutputToBe(`LOG: Log
INFO: Info
WARN: Warn
DEBUG: Debug
ERROR: Error`);
  });

  test("Console clear textarea", async () => {
    document.body.innerHTML = redirect_textarea;

    logAllLevels();
    proxy.clear();

    expectOutputToBe("");
  });

  test("Console clear div", async () => {
    document.body.innerHTML = redirect_div;
    domConsoleLogInterceptor.setLogConfig(defaultLogConfig);

    logAllLevels();
    proxy.clear();

    expectOutputToBe("", getInnerHtml);
  });

  test("Redirect using base element", async () => {
    document.body.innerHTML = redirect_textarea;

    const container = document.body.querySelector(".container");
    expect(container).toBeInTheDocument();

    container && domConsoleLogInterceptor.setBaseDomElement(container);

    logAllLevels();
    expectOutputToBe(`LOG: Log
INFO: Info
WARN: Warn
DEBUG: Debug
ERROR: Error`);
  });

  test("Redirect using custom selector", async () => {
    document.body.innerHTML = redirect_textarea;

    domConsoleLogInterceptor.setLogTargetSelector("textarea");

    logAllLevels();
    expectOutputToBe(`LOG: Log
INFO: Info
WARN: Warn
DEBUG: Debug
ERROR: Error`);
  });

  test("default console", async () => {
    domConsoleLogInterceptor = createDOMConsoleLogInterceptor();
    proxy.setInterceptor(domConsoleLogInterceptor);

    document.body.innerHTML = redirect_textarea;

    domConsoleLogInterceptor.setLogTargetSelector("textarea");

    logAllLevels();
    expectOutputToBe(`LOG: Log
INFO: Info
WARN: Warn
DEBUG: Debug
ERROR: Error`);
  });

  test("log error if target html element does not exist", async () => {
    const consoleMock = createConsoleMock();
    proxy = createConsoleProxy(consoleMock);
    domConsoleLogInterceptor = createDOMConsoleLogInterceptor(consoleMock);
    proxy.setInterceptor(domConsoleLogInterceptor);

    domConsoleLogInterceptor.setLogTargetSelector("foo");
    document.body.innerHTML = redirect_textarea;

    proxy.log("Log");

    expect(consoleMock.error).toHaveBeenCalledTimes(1);
  });

  test("Non log function is dispatched to target console", async () => {
    const consoleMock = createConsoleMock();
    proxy = createConsoleProxy(consoleMock);
    domConsoleLogInterceptor = createDOMConsoleLogInterceptor(consoleMock);
    proxy.setInterceptor(domConsoleLogInterceptor);

    proxy.count("label");

    expect(consoleMock.count).toHaveBeenCalledWith("label");
  });
});
