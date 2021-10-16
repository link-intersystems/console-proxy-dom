import {
  ConsoleProxyControl,
  createConsoleProxyControl,
} from "../consoleProxyControl";
import { createConsoleMock } from "./consoleProxy.test";

describe("ConsoleProxyControl Tests", () => {
  let proxyTargetMock: Console;
  let consoleProxyControl: ConsoleProxyControl;

  beforeEach(() => {
    proxyTargetMock = createConsoleMock();

    // eslint-disable-next-line no-native-reassign
    consoleProxyControl = createConsoleProxyControl(proxyTargetMock);
  });

  test("setDefaultHandler", () => {
    const defaultHandlerMock = jest.fn();
    consoleProxyControl.proxy.setDefaultHandler(defaultHandlerMock);

    const disableProxy = consoleProxyControl.enableProxy();
    proxyTargetMock.log("enabled");
    disableProxy();

    expect(defaultHandlerMock).toHaveBeenCalledWith({
      target: proxyTargetMock,
      targetFn: proxyTargetMock.log,
      targetFnName: "log",
      args: ["enabled"],
    });
  });

  test("Reset setDefaultHandler", () => {
    const defaultHandlerMock = jest.fn();
    consoleProxyControl.proxy.setDefaultHandler(defaultHandlerMock);
    consoleProxyControl.proxy.setDefaultHandler();

    const disableProxy = consoleProxyControl.enableProxy();
    proxyTargetMock.log("enabled");
    disableProxy();
    expect(proxyTargetMock.log).toHaveBeenCalledWith("enabled");
    proxyTargetMock.log("disabled");
    expect(proxyTargetMock.log).toHaveBeenCalledWith("disabled");
  });


  test("enable/disable proxy", () => {
    const disableProxy = consoleProxyControl.enableProxy();
    proxyTargetMock.log("enabled");
    disableProxy();
    expect(proxyTargetMock.log).toHaveBeenCalledWith("enabled");

    proxyTargetMock.log("disabled");
    expect(proxyTargetMock.log).toHaveBeenCalledWith("disabled");
  });

  test("createConsoleProxyControl with default console", () => {
    const origConsole = { ...console };

    console.log = jest.fn();
    try {
      consoleProxyControl = createConsoleProxyControl();

      const disableProxy = consoleProxyControl.enableProxy();
      console.log("enabled");
      disableProxy();
      expect(console.log).toHaveBeenCalledWith("enabled");
    } finally {
      console.log = origConsole.log;
    }
  });

  test("enable multiple times", () => {
    const disableProxy = consoleProxyControl.enableProxy();
    const disableProxy2 = consoleProxyControl.enableProxy();

    proxyTargetMock.log("enabled");
    disableProxy();

    expect(proxyTargetMock.log).toHaveBeenCalledWith("enabled");

    disableProxy2();
    proxyTargetMock.log("disabled");

    expect(proxyTargetMock.log).toHaveBeenCalledWith("disabled");
  });

  test("getProxy", () => {
    expect(consoleProxyControl.proxy).toBeDefined();

    consoleProxyControl.proxy.log("getProxyTest");

    expect(proxyTargetMock.log).toHaveBeenCalledWith("getProxyTest");
  });

  test("execTemplate", () => {
    function testFn() {
      proxyTargetMock.log("test");
      return "test logged";
    }

    const result = consoleProxyControl.execTemplate(testFn);

    expect(result).toBe("test logged");
    expect(proxyTargetMock.log).toBeCalledWith("test");
  });

  test("redirected Template", () => {
    const logFnMock = jest.fn();
    consoleProxyControl.proxy.setFunctionHandler("log", logFnMock);

    function testFn() {
      proxyTargetMock.log("test");
      return "test logged";
    }
    expect(consoleProxyControl.isProxyEnabled()).toBeFalsy();

    const result = consoleProxyControl.execTemplate(testFn);

    expect(consoleProxyControl.isProxyEnabled()).toBeFalsy();

    expect(result).toBe("test logged");
    expect(logFnMock).toBeCalledWith("test");
    expect(proxyTargetMock.log).not.toBeCalledWith("test");
  });

  test("redirected template - proxy already enabled", () => {
    const logFnMock = jest.fn();
    consoleProxyControl.proxy.setFunctionHandler("log", logFnMock);

    function testFn() {
      proxyTargetMock.log("test");
      return "test logged";
    }

    consoleProxyControl.setProxyEnabled(true);
    expect(consoleProxyControl.isProxyEnabled()).toBeTruthy();

    const result = consoleProxyControl.execTemplate(testFn);

    expect(result).toBe("test logged");
    expect(logFnMock).toBeCalledWith("test");

    // still enabled
    expect(consoleProxyControl.isProxyEnabled()).toBeTruthy();
    consoleProxyControl.setProxyEnabled(false);

    expect(proxyTargetMock.log).not.toBeCalledWith("test");
  });

  test("bindProxy", () => {
    const logFnMock = jest.fn();
    consoleProxyControl.proxy.setFunctionHandler("log", logFnMock);

    function testFn() {
      proxyTargetMock.log("bindProxy");
      return "bindProxy logged";
    }
    expect(consoleProxyControl.isProxyEnabled()).toBeFalsy();

    const boundFn = consoleProxyControl.bindProxy(testFn);

    const result = boundFn();

    expect(consoleProxyControl.isProxyEnabled()).toBeFalsy();

    expect(result).toBe("bindProxy logged");
    expect(logFnMock).toBeCalledWith("bindProxy");
    expect(proxyTargetMock.log).not.toBeCalledWith("bindProxy");
  });
});
