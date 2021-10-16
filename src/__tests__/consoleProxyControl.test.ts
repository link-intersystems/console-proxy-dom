import {
  ConsoleProxyControl,
  createConsoleProxyControl,
} from "../consoleProxyControl";
import { createConsoleMock } from "./consoleProxy.test";

describe("ConsoleProxyControl Tests", () => {
  let origConsole: Console;
  let proxyTargetMock: Console;
  let consoleProxyControl: ConsoleProxyControl;

  beforeAll(() => {
    origConsole = console;
    // eslint-disable-next-line no-native-reassign
    console = createConsoleMock();
  });

  afterAll(() => {
    // eslint-disable-next-line no-native-reassign
    console = origConsole;
  });

  beforeEach(() => {
    proxyTargetMock = createConsoleMock();
    // eslint-disable-next-line no-native-reassign
    consoleProxyControl = createConsoleProxyControl(proxyTargetMock);
  });

  test("enable/disable proxy", () => {
    const disableProxy = consoleProxyControl.enableProxy();

    console.log("enabled");
    expect(proxyTargetMock.log).toHaveBeenCalledWith("enabled");

    disableProxy();
    console.log("disabled");

    expect(proxyTargetMock.log).not.toHaveBeenCalledWith("disabled");
    expect(console.log).toHaveBeenCalledWith("disabled");
  });

  test("getProxy", () => {
    expect(consoleProxyControl.proxy).toBeDefined();

    consoleProxyControl.proxy.log("getProxyTest");
    
    expect(proxyTargetMock.log).toHaveBeenCalledWith("getProxyTest");
    expect(console.log).not.toHaveBeenCalledWith("getProxyTest");
  });

  test("consoleTemplate", () => {
    function testFn() {
      console.log("test");
      return "test logged";
    }

    const result = consoleProxyControl.execTemplate(testFn);

    expect(result).toBe("test logged");
    expect(proxyTargetMock.log).toBeCalledWith("test");
  });
});
