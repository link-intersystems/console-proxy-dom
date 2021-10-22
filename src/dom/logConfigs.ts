import { LogLevel } from "@link-intersystems/console-proxy";

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

export type HtmlElementLogConfig = {
  appender: HtmlElementAppender;
  logFormat: LogFormat;
  logEntrySeparator: string;
};

export const defaultLogEntrySeparator = "\n";

export const inputElementAppender: HtmlElementAppender = {
  append: function (element, text) {
    const actualValue = (element as HTMLInputElement).value;
    const newValue = actualValue + text;
    (element as HTMLInputElement).value = newValue;
  },
};

export const innerHtmlElementAppender: HtmlElementAppender = {
  append: function (element, text) {
    const actualValue = (element as HTMLElement).innerHTML || "";
    const newValue = actualValue + text;
    (element as HTMLElement).innerHTML = newValue;
  },
};

export const simpleLogFormat: LogFormat = {
  format: function (logEntry: LogEntry) {
    const text = logEntry.args.join(" ");
    return `${logEntry.level.toUpperCase()}: ${text}`;
  },
};

export const defaultHtmlLogConfig: HtmlElementLogConfig = Object.freeze({
  appender: innerHtmlElementAppender,
  logFormat: simpleLogFormat,
  logEntrySeparator: "<br/>",
});

export const inputHtmlLogConfig: HtmlElementLogConfig = Object.freeze({
  appender: inputElementAppender,
  logFormat: simpleLogFormat,
  logEntrySeparator: "\n",
});

const liLogFormat: LogFormat = Object.freeze({
  format: function (logEntry: LogEntry) {
    const text = logEntry.args.join(" ");
    return `<li>${logEntry.level.toUpperCase()}: ${text}</li>`;
  },
});

export const listHtmlLogConfig: HtmlElementLogConfig = Object.freeze({
  appender: innerHtmlElementAppender,
  logFormat: liLogFormat,
  logEntrySeparator: "\n",
});

export function interpolateTemplate(
  template: string,
  context: Record<string, any>
) {
  return template.replace(/\${(.*?)}/g, (x, g) => context[g]);
}

export type LogMessageFactory = (logEntry: LogEntry) => string;

function escapeHtml(html: string) {
  var text = document.createTextNode(html);
  var p = document.createElement("p");
  p.appendChild(text);
  return p.innerHTML;
}

export const defaultLogMessageFactory = (logEntry: LogEntry) => {
  const joinedArgs = logEntry.args.join(" ");
  return escapeHtml(joinedArgs);
};

export type TemplateLogFormatFactory = (
  templateSelector?: string,
  logMessageFactory?: LogMessageFactory
) => LogFormat;

const templateNotFoundTemplate =
  '<!-- Missing template "${templateSelector}": ${level}: ${message} -->';

export const templateLogFormatFactory: TemplateLogFormatFactory = (
  templateSelector: string = "#logEntry",
  logMessageFactory: LogMessageFactory = defaultLogMessageFactory
) => {
  return {
    format: (logEntry: LogEntry) => {
      const templateElement = document.querySelector(templateSelector);
      const template =
        templateElement != null
          ? templateElement.innerHTML
          : templateNotFoundTemplate;
      const message = logMessageFactory(logEntry);
      const level = logEntry.level;
      const levelUpperCase = logEntry.level.toUpperCase();
      const templateContext: Record<string, any> = {
        level,
        "level.upperCase": levelUpperCase,
        message,
        templateSelector: escapeHtml(templateSelector),
      };
      return interpolateTemplate(template, templateContext);
    },
  };
};

export const defaultTemplateLogFormat = templateLogFormatFactory();

export const templateLogConfig: HtmlElementLogConfig = Object.freeze({
  appender: innerHtmlElementAppender,
  logFormat: defaultTemplateLogFormat,
  logEntrySeparator: "\n",
});
