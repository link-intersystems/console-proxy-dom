import { screen } from "@testing-library/dom";
import redirect_textarea from "./redirect_textarea.html";
import { createDOMConsoleLogHandler } from "../domHandlers";
import { createConsoleMock } from "@link-intersystems/console-redirection/src/__tests__";

describe("DomHandlers Tests", () => {
  test("test", async () => {
    document.body.innerHTML = redirect_textarea;

    const consoleMock = createConsoleMock();

    const domConsoleHandler = createDOMConsoleLogHandler(consoleMock);

    domConsoleHandler.log("Log");
    domConsoleHandler.info("Info");
    domConsoleHandler.warn("Warn");
    domConsoleHandler.debug("Debug");
    domConsoleHandler.error("Error");

    const consoleOutput = screen.queryByTestId("consoleOutput");
    expect(consoleOutput).toBeInTheDocument();
    expect((consoleOutput as any)?.value).toEqual("LOG: Log\nINFO: Info\nWARN: Warn\nDEBUG: Debug\nERROR: Error")
  });
});
