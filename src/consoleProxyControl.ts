import { consoleFnNames, ConsoleProxy, createConsoleProxy } from "consoleProxy";

export type DisableProxy = () => void;

export type ConsoleProxyControl = {
  setProxyEnabled: (enabled: boolean) => void;
  enableProxy: () => DisableProxy;
  proxy: ConsoleProxy;
  execTemplate<R = any>(fn: () => R): R;
};

export function createConsoleProxyControl(
  targetConsole = console
): ConsoleProxyControl {
  const targetConsoleProxy = createConsoleProxy(targetConsole);
  const targetConsoleCopy = { ...console };

  function isProxyEnabled() {
    return console === targetConsoleProxy;
  }

  function setProxyEnabled(enabled: boolean): void {
    if (enabled) {
      consoleFnNames.forEach((fnName) => {
        // eslint-disable-next-line no-native-reassign
        (console as any)[fnName] = function () {
          return (targetConsoleProxy as any)[fnName].apply(
            targetConsoleProxy,
            arguments
          );
        };
      });
    } else {
      consoleFnNames.forEach((fnName) => {
        // eslint-disable-next-line no-native-reassign
        (console as any)[fnName] = (targetConsoleCopy as any)[fnName];
      });
    }
  }

  function enableProxy(): DisableProxy {
    const disableProxy = () => {
      setProxyEnabled(false);
    };

    if (isProxyEnabled()) {
      return disableProxy;
    }

    setProxyEnabled(true);
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

  return {
    setProxyEnabled,
    enableProxy: enableProxy,
    proxy: targetConsoleProxy,
    execTemplate,
  };
}
