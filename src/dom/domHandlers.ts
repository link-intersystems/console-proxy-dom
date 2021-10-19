export type LogLevel = "log" | "info" | "warn" | "debug" | "error";

export type DomConsoleLogHandler = Pick<
  Console,
  "info" | "warn" | "log" | "debug" | "error"
> & {
  setBaseDomElement(baseElement?: HTMLElement): void;
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

const propertyAccessorFactory = (propName: string) => ({
  get: (e: any) => e[propName],
  set: (e: any, v: any) => (e[propName] = v),
});

const valueAccessor = propertyAccessorFactory("value");
const innerTextAccessor = propertyAccessorFactory("innerText");

const valueAccessorMap = new Map();
valueAccessorMap.set("textarea", valueAccessor);
valueAccessorMap.set("input", valueAccessor);

const resolveValueAccessor = (e: any) => {
  const elementName = e.nodeName.toLowerCase();
  const valueAccessor = valueAccessorMap.get(elementName) || innerTextAccessor;
  return valueAccessor;
};

const resolvingTextAccessor = {
  get: (e: any) => {
    return resolveValueAccessor(e).get(e);
  },
  set: (e: any, v: any) => {
    return resolveValueAccessor(e).set(e, v);
  },
};

const defaultLogTargetSelector = "#console";
const defaultLogEntrySeparator = "\n";

export function createDOMConsoleLogHandler(
  targetConsole: Console = console
): DomConsoleLogHandler {
  const targetConsoleFunctions = { ...targetConsole };

  let logEntrySeparator = defaultLogEntrySeparator;

  let baseDomElement: HTMLElement;
  let logTargetSelector: string;
  let domElementAppender: HtmlElementAppender;
  let logFormat: LogFormat;
  let actLogEntrySeparator = "";

  function setBaseDomElement(baseElement: HTMLElement = document.body) {
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

  setBaseDomElement();
  setLogTargetSelector();
  setHtmlElementAppender();
  setLogFormat();

  return {
    log: function () {
      log.apply(this, ["log", Array.from(arguments)]);
    },
    info: (...args: any[]) => log("info", args),
    warn: (...args: any[]) => log("warn", args),
    error: (...args: any[]) => log("error", args),
    debug: (...args: any[]) => log("debug", args),
    setBaseDomElement,
    setLogTargetSelector,
    setLogFormat,
    setHtmlElementAppender,
  };
}
