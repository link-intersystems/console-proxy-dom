import {
  consoleFnNames,
  ConsoleProxy,
  createConsoleProxy,
} from "../consoleProxy";

export function createConsoleMock() {
  return consoleFnNames.reduce((proxy, fn) => {
    (proxy as any)[fn] = jest.fn();
    return proxy;
  }, {} as Console);
}

describe("ConsoleProxy Tests", () => {
  let consoleMock: Console;
  let consoleProxy: ConsoleProxy;

  beforeAll(() => {});

  beforeEach(() => {
    consoleMock = createConsoleMock();
    consoleProxy = createConsoleProxy(consoleMock);
  });

  afterEach(() => {});

  test("consoleFnNames are froozen", () => {
    const fnName = consoleFnNames[0];
    expect(() => ((consoleFnNames as any)[0] = "test")).toThrowError();
    expect(consoleFnNames[0]).toEqual(fnName);
  });

  test("setHandler unknown function", () => {
    expect(() => consoleProxy.setHandler("foobar", () => {})).toThrowError();
  });

  test("do not create function proxies for undefined target functions", () => {
    delete (consoleMock as any).clear;

    consoleProxy = createConsoleProxy(consoleMock);

    expect(consoleProxy.clear).toBeUndefined();
  });

  test("assert", () => {
    testConsoleMethod("assert", true, {
      msg: "assertCalled",
    });
  });

  test("clear", () => {
    testConsoleMethod("clear");
  });

  test("count", () => {
    testConsoleMethod("count", "label");
  });

  test("countReset", () => {
    testConsoleMethod("countReset", "label");
  });

  test("debug", () => {
    testConsoleMethod("debug", { name: "someObject" }, "arg1", "arg2");
  });

  test("dir", () => {
    testConsoleMethod("dir", { name: "someObject" });
  });

  test("dirxml", () => {
    testConsoleMethod("dirxml", { name: "someObject" });
  });

  test("error", () => {
    testConsoleMethod("error", { name: "someObject" }, "arg1", "arg2");
  });

  test("exception", () => {
    testConsoleMethod("exception", { name: "someObject" }, "arg1", "arg2");
  });

  test("group", () => {
    testConsoleMethod("group", "label");
  });

  test("groupCollapsed", () => {
    testConsoleMethod("groupCollapsed", "label");
  });

  test("groupEnd", () => {
    testConsoleMethod("groupEnd");
  });

  test("info", () => {
    testConsoleMethod("info");
  });

  test("log", () => {
    testConsoleMethod("log", { name: "someObject" }, "arg1", "arg2");
  });

  test("profile", () => {
    testConsoleMethod("profile", "profileName");
  });

  test("profileEnd", () => {
    testConsoleMethod("profileEnd", "profileName");
  });

  test("table", () => {
    testConsoleMethod("table", ["apples", "oranges", "bananas"]);
  });

  test("time", () => {
    testConsoleMethod("time", "label");
  });

  test("timeEnd", () => {
    testConsoleMethod("timeEnd", "label");
  });

  test("timeLog", () => {
    testConsoleMethod("timeLog", "label");
  });

  test("timeStamp", () => {
    testConsoleMethod("timeStamp", "label");
  });

  test("trace", () => {
    testConsoleMethod("trace", { name: "someObject" }, "arg1", "arg2");
  });

  test("warn", () => {
    testConsoleMethod("warn", { name: "someObject" }, "arg1", "arg2");
  });

  function testIntercepted(fnName: string, ...args: any[]) {
    (consoleMock as any)[fnName] = jest.fn();

    (consoleProxy as any)[fnName].apply(consoleProxy, args);

    expect((consoleMock as any)[fnName]).toHaveBeenCalledTimes(1);
    expect((consoleMock as any)[fnName]).toHaveBeenCalledWith(...args);
  }

  function testNotIntercepted(fnName: string, ...args: any[]) {
    (consoleMock as any)[fnName] = jest.fn();

    const unset = consoleProxy.setHandler(fnName, () => {});
    try {
      (consoleProxy as any)[fnName].apply(consoleProxy, args);
    } finally {
      unset();
    }

    expect((consoleMock as any)[fnName]).not.toHaveBeenCalledWith(...args);
  }

  function testConsoleMethod(fnName: string, ...args: any[]) {
    testIntercepted(fnName, args);
    testNotIntercepted(fnName, args);
  }
});
