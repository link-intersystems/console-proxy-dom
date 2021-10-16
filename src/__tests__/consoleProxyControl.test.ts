import {
  ConsoleProxyControl,
  createConsoleProxyControl,
} from "../consoleProxyControl";
import { createConsoleMock } from "./consoleProxy.test";

describe("ConsoleProxyControl Tests", () => {
  let origConsole: Console;
  let consoleMock: Console;
  let consoleProxyControl: ConsoleProxyControl;

  beforeEach(() => {
    origConsole = console;
    consoleMock = createConsoleMock();
    // eslint-disable-next-line no-native-reassign
    console = consoleMock;
    consoleProxyControl = createConsoleProxyControl();
  });

  afterEach(() => {
    // eslint-disable-next-line no-native-reassign
    console = origConsole;
  });

  test("enable/disable proxy", () => {
    expect(console).toBe(consoleMock);

    consoleProxyControl.setProxyEnabled(true);

    expect(console).not.toBe(consoleMock);

    consoleProxyControl.setProxyEnabled(false);

    expect(console).toBe(consoleMock);
  });

  test("getProxy", () => {
    expect(console).toBe(consoleMock);

    consoleProxyControl.setProxyEnabled(true);

    expect(console).toBe(consoleProxyControl.getProxy());
  });
});
