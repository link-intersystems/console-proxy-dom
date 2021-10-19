import {
  ConsoleInvocation,
  consoleLogFnNames,
} from "@link-intersystems/console-redirection";

export type LogLevel = "log" | "info" | "warn" | "debug" | "error";

export type DomConsoleLogInterceptor = {
  invoke(invocation: ConsoleInvocation): any;
  setBaseDomElement(baseElement: Element): void;
  setLogTargetSelector(cssSelector: string): void;
  setHtmlElementAppender(appender: HtmlElementAppender): void;
  setLogFormat(format: LogFormat): void;
};

export type HtmlElementAppender = {
  append: (element: Element, text: string) => void;
};

export type LogEntry = {
  level: LogLevel;
  args: any[];
};

export type LogFormat = {
  format: (logEntry: LogEntry) => string;
};

const inputElementAppender: HtmlElementAppender = {
  append: function (element, text) {
    const actualValue = (element as HTMLInputElement).value;
    const newValue = actualValue + text;
    (element as HTMLInputElement).value = newValue;
  },
};

const simpleLogFormat: LogFormat = {
  format: function (logEntry: LogEntry) {
    const text = logEntry.args.join(" ");
    return `${logEntry.level.toUpperCase()}: ${text}`;
  },
};

const defaultLogTargetSelector = "#console";
const defaultLogEntrySeparator = "\n";

export function createDOMConsoleLogHandler(
  targetConsole: Console = console
): DomConsoleLogInterceptor {
  const targetConsoleFunctions = { ...targetConsole };

  let logEntrySeparator = defaultLogEntrySeparator;

  let baseDomElement: Element = document.body;
  let logTargetSelector: string;
  let domElementAppender: HtmlElementAppender;
  let logFormat: LogFormat;
  let actLogEntrySeparator = "";

  function setBaseDomElement(baseElement: Element) {
    baseDomElement = baseElement;
  }

  function setLogTargetSelector(
    cssSelector: string = defaultLogTargetSelector
  ) {
    logTargetSelector = cssSelector;
  }

  function setHtmlElementAppender(
    appender: HtmlElementAppender = inputElementAppender
  ) {
    domElementAppender = appender;
  }

  function setLogFormat(format: LogFormat = simpleLogFormat) {
    logFormat = format;
  }

  function log(level: LogLevel, args: any[]) {
    const targetElement = baseDomElement.querySelector(logTargetSelector);

    if (targetElement == null) {
      const msg = `Target element can not be selected using ${logTargetSelector} on ${baseDomElement}`;
      targetConsoleFunctions.error(msg);
      return;
    }

    const formattedLogEntry = logFormat.format({ level, args });

    domElementAppender.append(targetElement, actLogEntrySeparator);
    domElementAppender.append(targetElement, formattedLogEntry);

    actLogEntrySeparator = logEntrySeparator;
  }

  setLogTargetSelector();
  setHtmlElementAppender();
  setLogFormat();

  return {
    invoke(invocation) {
      if (consoleLogFnNames.includes(invocation.fnName)) {
        return log(invocation.fnName as LogLevel, invocation.args);
      }
      return invocation.proceed();
    },
    setBaseDomElement,
    setLogTargetSelector,
    setLogFormat,
    setHtmlElementAppender,
  };
}
