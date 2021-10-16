import { ConsoleProxy, createConsoleProxy } from "consoleProxy";
import {
  ConsoleProxyControl,
  createConsoleProxyControl,
} from "../consoleProxyControl";
import { createConsoleMock } from "./consoleProxy.test";

describe("ConsoleProxyControl Tests", () => {
  let proxyTargetMock: Console;
  let proxy: ConsoleProxy;
  let consoleProxyControl: ConsoleProxyControl;

  beforeEach(() => {
    proxyTargetMock = createConsoleMock();

    proxy = createConsoleProxy(proxyTargetMock);
    consoleProxyControl = createConsoleProxyControl(proxy);
  });

  test("createConsoleProxyControl with default console", () => {
    const origConsole = { ...console };

    console.log = jest.fn();
    try {
      consoleProxyControl = createConsoleProxyControl();

      consoleProxyControl.execTemplate(() => console.log("enabled"));

      expect(console.log).toHaveBeenCalledWith("enabled");
    } finally {
      console.log = origConsole.log;
    }
  });

  test("getProxy", () => {
    expect(consoleProxyControl.getProxy()).toBe(proxy);
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
    proxy.setFunctionHandler("log", logFnMock);

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
    proxy.setFunctionHandler("log", logFnMock);

    function testFn2() {
      proxyTargetMock.log("test2");
      return "test2 logged";
    }

    function testFn() {
      const result2 = consoleProxyControl.execTemplate(testFn2);
      proxyTargetMock.log("test");
      return "test logged " + result2;
    }


    const result = consoleProxyControl.execTemplate(testFn);

    expect(result).toBe("test logged test2 logged");
    expect(logFnMock).toBeCalledWith("test");
    expect(logFnMock).toBeCalledWith("test2");

  });

  test("bindProxy", () => {
    const logFnMock = jest.fn();
    proxy.setFunctionHandler("log", logFnMock);

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
