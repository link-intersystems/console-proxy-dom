import {
  createLogEnablementHandler,
  LogEnablementHandler,
} from "../consoleHandlers";
import { createConsoleMock } from "./consoleProxy.test";

describe("ConsoleHandler Tests", () => {
  let consoleMock: Console;
  let logEnablementHandler: LogEnablementHandler;

  beforeEach(() => {
    consoleMock = createConsoleMock();
    logEnablementHandler = createLogEnablementHandler(consoleMock);
  });

  test("logEnablementHandler - all levels enabled per default", () => {
    logEnablementHandler.log("log1", "log2");
    expect(consoleMock.log).toHaveBeenCalledWith("log1", "log2");

    logEnablementHandler.info("info1", "info2");
    expect(consoleMock.info).toHaveBeenCalledWith("info1", "info2");

    logEnablementHandler.warn("warn1", "warn2");
    expect(consoleMock.warn).toHaveBeenCalledWith("warn1", "warn2");

    logEnablementHandler.debug("debug1", "debug2");
    expect(consoleMock.debug).toHaveBeenCalledWith("debug1", "debug2");

    logEnablementHandler.error("error1", "error2");
    expect(consoleMock.error).toHaveBeenCalledWith("error1", "error2");
  });

  test("logEnablementHandler - disable log", () => {
    logEnablementHandler.setLevelEnabled("log", false);

    logEnablementHandler.log("log");

    expect(consoleMock.log).toHaveBeenCalledTimes(0);
  });

  test("logEnablementHandler - disable info", () => {
    logEnablementHandler.setLevelEnabled("info", false);

    logEnablementHandler.info("info");

    expect(consoleMock.info).toHaveBeenCalledTimes(0);
  });

  test("logEnablementHandler - disable warn", () => {
    logEnablementHandler.setLevelEnabled("warn", false);

    logEnablementHandler.warn("warn");

    expect(consoleMock.warn).toHaveBeenCalledTimes(0);
  });

  test("logEnablementHandler - disable debug", () => {
    logEnablementHandler.setLevelEnabled("debug", false);

    logEnablementHandler.debug("debug");

    expect(consoleMock.debug).toHaveBeenCalledTimes(0);
  });

  test("logEnablementHandler - disable error", () => {
    logEnablementHandler.setLevelEnabled("error", false);

    logEnablementHandler.error("error");

    expect(consoleMock.error).toHaveBeenCalledTimes(0);
  });

  test("logEnablementHandler default console", () => {
    const origConsole = console;
    const logFnMock = jest.fn();
    console.log = logFnMock;

    logEnablementHandler = createLogEnablementHandler();

    try {
      logEnablementHandler.log("log");
    } finally {
      console.log = origConsole.log;
    }

    expect(logFnMock).toHaveBeenCalledWith("log");
  });
});
