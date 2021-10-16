import { consoleFnNames, ConsoleProxy, createConsoleProxy } from "consoleProxy";

export type DisableProxy = () => void;

type ProxyFunction = {
  name: string;
  fn: any;
};

export type ConsoleProxyControl = {
  isProxyEnabled: () => boolean;
  getProxy: () => ConsoleProxy;
  execTemplate<R = any>(fn: () => R): R;
  bindProxy<R = any>(fn: () => R): () => R;
};

function createProxyFunctions(target: any): ProxyFunction[] {
  return consoleFnNames.map((fnName) => {
    const proxyFn = function () {
      return (target as any)[fnName].apply(target, arguments);
    };
    return {
      name: fnName,
      fn: proxyFn,
    };
  }, []);
}

export function createConsoleProxyControl(
  consoleProxy: ConsoleProxy = createConsoleProxy()
): ConsoleProxyControl {
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

  const execTemplate = <R = any>(fn: () => R): R => {
    const disableProxy = isProxyEnabled() ? () => null : enableProxy();
    try {
      return fn();
    } finally {
      disableProxy();
    }
  };

  const bindProxy = <R = any>(fn: () => R): (() => R) => {
    return function () {
      return execTemplate(() =>
        (fn as any).apply((fn as any).this, Array.from(arguments))
      );
    };
  };

  return {
    isProxyEnabled,
    getProxy: () => consoleProxy,
    execTemplate,
    bindProxy,
  };
}
