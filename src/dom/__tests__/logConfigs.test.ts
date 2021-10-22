import { screen } from "@testing-library/dom";
import redirect_textarea from "./redirect_textarea.html";
import redirect_div from "./redirect_div.html";
import redirect_template from "./redirect_template.html";
import {
  createDOMConsoleLogHandler,
  DomConsoleLogInterceptor,
} from "../interceptors";
import { createConsoleProxy } from "@link-intersystems/console-redirection/src/proxy/consoleProxy";
import { ConsoleProxy } from "@link-intersystems/console-redirection";
import {
  defaultHtmlLogConfig,
  inputHtmlLogConfig,
  listHtmlLogConfig,
  templateLogConfig,
  templateLogFormatFactory,
} from "../logConfigs";

describe("logConfigs Tests", () => {
  let proxy: ConsoleProxy;
  let domConsoleLogInterceptor: DomConsoleLogInterceptor;

  beforeEach(() => {
    proxy = createConsoleProxy();
    domConsoleLogInterceptor = createDOMConsoleLogHandler();
    proxy.setInterceptor(domConsoleLogInterceptor);
  });

  function getInputValue(element: Element) {
    return (element as any)?.value;
  }

  function getInnerHtml(element: Element) {
    return (element as any)?.innerHTML;
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

  test("defaultHtmlLogConfig", () => {
    document.body.innerHTML = redirect_div;

    domConsoleLogInterceptor.setLogConfig(defaultHtmlLogConfig);

    logAllLevels();
    expectOutputToBe(
      `LOG: Log<br>INFO: Info<br>WARN: Warn<br>DEBUG: Debug<br>ERROR: Error`,
      getInnerHtml
    );
  });

  test("inputHtmlLogConfig", () => {
    document.body.innerHTML = redirect_textarea;

    domConsoleLogInterceptor.setLogConfig(inputHtmlLogConfig);

    logAllLevels();

    expectOutputToBe(`LOG: Log
INFO: Info
WARN: Warn
DEBUG: Debug
ERROR: Error`);
  });

  test("listHtmlLogConfig", () => {
    document.body.innerHTML = redirect_textarea;

    domConsoleLogInterceptor.setLogConfig(listHtmlLogConfig);

    logAllLevels();

    expectOutputToBe(`<li>LOG: Log</li>
<li>INFO: Info</li>
<li>WARN: Warn</li>
<li>DEBUG: Debug</li>
<li>ERROR: Error</li>`);
  });

  test("templateLogConfig", () => {
    document.body.innerHTML = redirect_template;

    domConsoleLogInterceptor.setLogConfig(templateLogConfig);

    logAllLevels();

    expectOutputToBe(
      `
  <tr>
    <td>LOG</td>
    <td>Log</td>
  </tr>

  <tr>
    <td>INFO</td>
    <td>Info</td>
  </tr>

  <tr>
    <td>WARN</td>
    <td>Warn</td>
  </tr>

  <tr>
    <td>DEBUG</td>
    <td>Debug</td>
  </tr>

  <tr>
    <td>ERROR</td>
    <td>Error</td>
  </tr>`,
      getInnerHtml
    );
  });

  test("templateLogConfig - template not found", () => {
    document.body.innerHTML = redirect_template;

    const unknownTemplateLogConfig = {
      ...templateLogConfig,
      logFormat: templateLogFormatFactory("#unknownTemplate"),
    };

    domConsoleLogInterceptor.setLogConfig(unknownTemplateLogConfig);

    logAllLevels();

    proxy.log("<!-- a comment -->")

    expectOutputToBe(
      `<!-- Missing template "#unknownTemplate": log: Log -->
<!-- Missing template "#unknownTemplate": info: Info -->
<!-- Missing template "#unknownTemplate": warn: Warn -->
<!-- Missing template "#unknownTemplate": debug: Debug -->
<!-- Missing template "#unknownTemplate": error: Error -->
<!-- Missing template "#unknownTemplate": log: &lt;!-- a comment --&gt; -->`,
      getInnerHtml
    );
  });
});
