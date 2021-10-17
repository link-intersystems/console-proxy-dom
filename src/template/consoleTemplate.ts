import { consoleFnNames, ConsoleProxy } from "../proxy/consoleProxy";

export type DisableProxy = () => void;

type ProxyFunction = {
  name: string;
  fn: any;
};

type ANY_FN<A = any, R = any> = (
  fn: (...args: A[]) => R
) => (...args: A[]) => R;

export type ConsoleTemplate = {
  execFn: ANY_FN;
  wrapFn: ANY_FN;
};

function createProxyFunctions(target: any): ProxyFunction[] {
  const proxyFunctions: ProxyFunction[] = [];

  consoleFnNames.forEach((fnName) => {
    if (typeof target[fnName] === "function") {
      const proxyFn = function () {
        return (target as any)[fnName].apply(target, arguments);
      };
      proxyFunctions.push({
        name: fnName,
        fn: proxyFn,
      });
    }
  });

  return proxyFunctions;
}

export function createConsoleTemplate(
  consoleProxy: ConsoleProxy
): ConsoleTemplate {
  const targetConsole = consoleProxy.getTargetConsole();
  const origTargetConsole = { ...targetConsole };

  const proxyFunctions = createProxyFunctions(consoleProxy);

  function isProxyEnabled() {
    return proxyFunctions
      .map((pf) => (targetConsole as any)[pf.name] === pf.fn)
      .every((e) => e === true);
  }

  function enableProxy(): DisableProxy {
    const disableProxy = () => {
      proxyFunctions.forEach(
        (pf) =>
          // eslint-disable-next-line no-native-reassign
          ((targetConsole as any)[pf.name] = (origTargetConsole as any)[
            pf.name
          ])
      );
    };

    proxyFunctions.forEach((pf) => ((targetConsole as any)[pf.name] = pf.fn));
    return disableProxy;
  }

  const execFn = <R = any>(fn: () => R): R => {
    const disableProxy = isProxyEnabled() ? () => null : enableProxy();
    try {
      return fn();
    } finally {
      disableProxy();
    }
  };

  const wrapFn = <R = any>(fn: () => R): (() => R) => {
    return function () {
      return execFn(() =>
        (fn as any).apply((fn as any).this, Array.from(arguments))
      );
    };
  };

  return {
    execFn,
    wrapFn,
  };
}
