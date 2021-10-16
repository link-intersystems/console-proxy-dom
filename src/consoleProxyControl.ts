import { ConsoleProxy, createConsoleProxy } from "consoleProxy";

export type ConsoleProxyControl = {
  setProxyEnabled: (enable: boolean) => void;
  getProxy(): ConsoleProxy;
};

export function createConsoleProxyControl(
  targetConsole = console
): ConsoleProxyControl {
  const targetConsoleProxy = createConsoleProxy(targetConsole);

  function setEnabled(enable: boolean): void {
    if (enable) {
      // eslint-disable-next-line no-native-reassign
      console = targetConsoleProxy;
    } else {
      // eslint-disable-next-line no-native-reassign
      console = targetConsole;
    }
  }

  return {
    setProxyEnabled: setEnabled,
    getProxy: () => targetConsoleProxy,
  };
}
