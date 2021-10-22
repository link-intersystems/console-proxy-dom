import {
  ConsoleInvocation,
  consoleLogFnNames,
  LogLevel,
} from "@link-intersystems/console-proxy";

import { HtmlElementLogConfig, valueLogConfig } from "./logConfigs";

export type DomConsoleLogInterceptor = {
  invoke(invocation: ConsoleInvocation): any;
  setBaseDomElement(baseElement: Element): void;
  setLogTargetSelector(cssSelector: string): void;
  setLogConfig(htmlElementLogConfig: HtmlElementLogConfig): void;
};

export const defaultLogTargetSelector = "#console";

export function createDOMConsoleLogInterceptor(
  targetConsole: Console = console
): DomConsoleLogInterceptor {
  const targetConsoleFunctions = { ...targetConsole };

  let baseDomElement: Element = document.body;
  let logTargetSelector: string;
  let logConfig: HtmlElementLogConfig;
  let actLogEntrySeparator = "";

  function setBaseDomElement(baseElement: Element) {
    baseDomElement = baseElement;
  }

  function setLogTargetSelector(
    cssSelector: string = defaultLogTargetSelector
  ) {
    logTargetSelector = cssSelector;
  }

  function setLogConfig(
    htmlElementLogConfig: HtmlElementLogConfig = valueLogConfig
  ) {
    logConfig = htmlElementLogConfig;
  }

  function log(level: LogLevel, args: any[]) {
    const targetElement = baseDomElement.querySelector(logTargetSelector);
    const { logFormat, appender, logEntrySeparator } = logConfig;

    if (targetElement == null) {
      const msg = `Target element can not be selected using ${logTargetSelector} on ${baseDomElement}`;
      targetConsoleFunctions.error(msg);
      return;
    }

    const formattedLogEntry = logFormat.format({ level, args });

    appender.append(targetElement, actLogEntrySeparator);
    appender.append(targetElement, formattedLogEntry);

    actLogEntrySeparator = logEntrySeparator;
  }

  setLogTargetSelector();
  setLogConfig();

  return {
    invoke(invocation) {
      if (consoleLogFnNames.includes(invocation.fnName)) {
        return log(invocation.fnName as LogLevel, invocation.args);
      }
      return invocation.proceed();
    },
    setBaseDomElement,
    setLogTargetSelector,
    setLogConfig,
  };
}
