export type UnregisterHandler = () => void;

export type ConsoleProxy = Console & {
  defaultHandler: (fn: any, args: any[]) => any;
  setHandler(fnName: string, handler: () => any): UnregisterHandler;
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

export function createConsoleProxy(console: Console): ConsoleProxy {
  const defaultHandler = (target: Console, fn: any, args: any[]) => {
    return fn.apply(target, args);
  };

  const fnHandlers = new Map();

  function getHandler(fnName: string): any {
    return fnHandlers.get(fnName);
  }

  function createProxyFn(proxy: ConsoleProxy, fnName: string): any {
    if (!(console as any)[fnName]) {
      return undefined;
    }

    return function () {
      const handler = getHandler(fnName);

      if (handler) {
        return handler.apply(proxy, arguments);
      }

      defaultHandler(console, (console as any)[fnName], Array.from(arguments));
    };
  }

  function setHandler(fnName: string, handler: () => any) {
    if (!(fnName in console)) {
      const msg = `Console doesn't have a function named ${fnName}`;
      throw new Error(msg);
    }

    fnHandlers.set(fnName, handler);
    return () => {
      fnHandlers.delete(fnName);
    };
  }
  const proxy = consoleFnNames.reduce((proxy, fn) => {
    const proxyFn = createProxyFn(proxy, fn);
    if (proxyFn) {
      (proxy as any)[fn] = proxyFn.bind(proxy);
    }
    return proxy;
  }, {} as ConsoleProxy);

  proxy.setHandler = setHandler;

  return proxy;
}
