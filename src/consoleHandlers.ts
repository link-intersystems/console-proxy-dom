export type LogLevel = "log" | "info" | "warn" | "debug" | "error";

export type LogEnablementHandler = Pick<
  Console,
  "info" | "warn" | "log" | "debug" | "error"
> & {
  setLevelEnabled(level: LogLevel, enabled: boolean): void;
};

export function createLogEnablementHandler(
  targetConsole: Console = console
): LogEnablementHandler {
  const targetConsoleFunctions = { ...targetConsole };

  const levelEnablement = new Map<LogLevel, boolean>();
  levelEnablement.set("log", true);
  levelEnablement.set("info", true);
  levelEnablement.set("warn", true);
  levelEnablement.set("error", true);
  levelEnablement.set("debug", true);

  const setLevelEnabled = (level: LogLevel, enabled: boolean) => {
    levelEnablement.set(level, enabled);
  };

  function log(level: LogLevel, args: any[]) {
    if (levelEnablement.get(level)) {
      const targetFn = targetConsoleFunctions[level];
      return targetFn.apply(targetConsole, args);
    }
  }

  return {
    log: function () {
      log.apply(this, ["log", Array.from(arguments)]);
    },
    info: (...args) => log("info", args),
    warn: (...args) => log("warn", args),
    error: (...args) => log("error", args),
    debug: (...args) => log("debug", args),
    setLevelEnabled,
  };
}
