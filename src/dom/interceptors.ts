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
    actLogEntrySeparator = "";
  }

  function setLogConfig(
    htmlElementLogConfig: HtmlElementLogConfig = valueLogConfig
  ) {
    logConfig = htmlElementLogConfig;
    if (actLogEntrySeparator !== "")
      actLogEntrySeparator = logConfig.logEntrySeparator;
  }

  function getTargetElement() {
    const targetElement = baseDomElement.querySelector(logTargetSelector);
    if (targetElement == null) {
      const msg = `Target element can not be selected using ${logTargetSelector} on ${baseDomElement}`;
      targetConsoleFunctions.error(msg);
      return;
    }
    return targetElement;
  }

  function invokeWithTarget(fn: (targetElement: Element) => any) {
    const targetElement = getTargetElement();
    if (targetElement == null) return;
    return fn(targetElement);
  }

  function log(targetElement: Element, level: LogLevel, args: any[]) {
    const { logFormat, appender, logEntrySeparator } = logConfig;

    const formattedLogEntry = logFormat.format({ level, args });

    appender.append(targetElement, actLogEntrySeparator);
    appender.append(targetElement, formattedLogEntry);

    actLogEntrySeparator = logEntrySeparator;
  }

  function clear(targetElement: Element) {
    const { appender } = logConfig;
    appender.clear(targetElement);
  }

  setLogTargetSelector();
  setLogConfig();

  return {
    invoke(invocation) {
      if (consoleLogFnNames.includes(invocation.fnName)) {
        return invokeWithTarget((target) =>
          log(target, invocation.fnName as LogLevel, invocation.args)
        );
      } else if (invocation.fnName === "clear") {
        return invokeWithTarget(clear);
      }
      return invocation.proceed();
    },
    setBaseDomElement,
    setLogTargetSelector,
    setLogConfig,
  };
}
