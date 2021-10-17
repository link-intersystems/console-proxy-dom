export type UnregisterHandler = () => void;

export type ConsoleFunctionName = keyof Console;

export type HandlerInvocation = {
  target: Console;
  targetFn: () => any;
  targetFnName: ConsoleFunctionName;
  args: [];
};
export type Handler = (invocation: HandlerInvocation) => any;

export type DefaultHandler = Handler | Partial<Console>;

export type ConsoleProxy = Console & {
  setDefaultHandler: (handler?: Handler | Partial<Console>) => void;
  setFunctionHandler(
    fnName: ConsoleFunctionName,
    handler: () => any
  ): UnregisterHandler;
  getTargetConsole: () => Console;
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

const passthroughHandler = (invocation: HandlerInvocation) => {
  return invocation.targetFn.apply(invocation.target, invocation.args);
};

export function createConsoleProxy(
  targetConsole: Console = console,
  defaultHandlerArg: DefaultHandler = passthroughHandler
): ConsoleProxy {
  const origTargetConsoleFunctions = { ...targetConsole };

  const getTargetConsole = () => targetConsole;

  let defaultHandler: Handler;

  const fnHandlers = new Map<string, Handler>();

  function getHandler(fnName: string): Handler {
    const fnHandler = fnHandlers.get(fnName);
    return fnHandler ? fnHandler : defaultHandler;
  }

  function createProxyFn(fnName: ConsoleFunctionName): any {
    const targetFn = (origTargetConsoleFunctions as any)[fnName];

    return function () {
      const handler = getHandler(fnName);

      return handler({
        target: origTargetConsoleFunctions,
        targetFn,
        targetFnName: fnName,
        args: Array.from(arguments) as [],
      });
    };
  }

  function setDefaultHandler(
    handler: Handler | Partial<Console> = passthroughHandler
  ) {
    if (typeof handler === "function") {
      defaultHandler = handler;
    } else {
      defaultHandler = function (invocation: HandlerInvocation) {
        const handlerFn = handler[invocation.targetFnName] as <R>() => R;
        return handlerFn.apply(handler, invocation.args);
      };
    }
  }

  function setFunctionHandler(fnName: string, handler: () => any) {
    if (!(fnName in targetConsole)) {
      const msg = `Console doesn't have a function named ${fnName}`;
      throw new Error(msg);
    }

    const handlerFunction = function (invocation: HandlerInvocation) {
      return handler.apply(proxy, invocation.args);
    };

    fnHandlers.set(fnName, handlerFunction);
    return () => {
      fnHandlers.delete(fnName);
    };
  }

  const proxy = consoleFnNames.reduce((proxy, fn) => {
    if (origTargetConsoleFunctions[fn as ConsoleFunctionName]) {
      const proxyFn = createProxyFn(fn as ConsoleFunctionName);
      (proxy as any)[fn] = proxyFn.bind(proxy);
    }
    return proxy;
  }, {} as ConsoleProxy);

  setDefaultHandler(defaultHandlerArg);

  proxy.setFunctionHandler = setFunctionHandler;
  proxy.setDefaultHandler = setDefaultHandler;
  proxy.getTargetConsole = getTargetConsole;

  return proxy;
}
