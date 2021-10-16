export type UnregisterHandler = () => void;

export type ConsoleFunctionName = keyof Console;

export type Invocation = {
  target: Console;
  targetFn: () => any;
  targetFnName: ConsoleFunctionName;
  args: [];
};
export type Handler = (invocation: Invocation) => any;

export type ConsoleProxy = Console & {
  setDefaultHandler: (handler?: Handler) => void;
  setFunctionHandler(
    fnName: ConsoleFunctionName,
    handler: () => any
  ): UnregisterHandler;
};

export const consoleFnNames = Object.freeze([
  "assert",
  "clear",
  "count",
  "countReset",
  "debug",
  "dir",
  "dirxml",
  "error",
  "exception",
  "group",
  "groupCollapsed",
  "groupEnd",
  "info",
  "log",
  "profile",
  "profileEnd",
  "table",
  "time",
  "timeEnd",
  "timeLog",
  "timeStamp",
  "trace",
  "warn",
]);

const passthroughHandler = (invocation: Invocation) => {
  return invocation.targetFn.apply(invocation.target, invocation.args);
};

export function createConsoleProxy(console: Console): ConsoleProxy {
  const consoleCopy = { ...console };

  let defaultHandler = passthroughHandler;

  const fnHandlers = new Map<string, Handler>();

  function getHandler(fnName: string): Handler {
    return fnHandlers.get(fnName) ?? defaultHandler;
  }

  function createProxyFn(fnName: ConsoleFunctionName): any {
    const targetFn = (console as any)[fnName];
    if (targetFn === undefined || typeof targetFn !== "function") {
      return undefined;
    }

    return function () {
      const handler = getHandler(fnName);

      return handler({
        target: consoleCopy,
        targetFn,
        targetFnName: fnName,
        args: Array.from(arguments) as [],
      });
    };
  }

  function setDefaultHandler(handler: Handler = passthroughHandler) {
    defaultHandler = handler;
  }

  function setFunctionHandler(fnName: string, handler: () => any) {
    if (!(fnName in console)) {
      const msg = `Console doesn't have a function named ${fnName}`;
      throw new Error(msg);
    }

    const handlerFunction = function (invocation: Invocation) {
      return handler.apply(proxy, invocation.args);
    };

    fnHandlers.set(fnName, handlerFunction);
    return () => {
      fnHandlers.delete(fnName);
    };
  }

  const proxy = consoleFnNames.reduce((proxy, fn) => {
    const proxyFn = createProxyFn(fn as ConsoleFunctionName);
    if (proxyFn) {
      (proxy as any)[fn] = proxyFn.bind(proxy);
    }
    return proxy;
  }, {} as ConsoleProxy);

  proxy.setFunctionHandler = setFunctionHandler;
  proxy.setDefaultHandler = setDefaultHandler;

  return proxy;
}
