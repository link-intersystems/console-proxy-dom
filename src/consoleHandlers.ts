export type LogLevel = "log" | "info" | "warn" | "debug" | "error";

export type LogEnablementHandler = Pick<
  Console,
  "info" | "warn" | "log" | "debug" | "error"
> & {
  setLevelEnabled(level: LogLevel | "all", enabled: boolean): void;
  setAllLevelsEnabled(enabled: boolean): void;
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

  const setAllLevelsEnabled = (enabled: boolean) => {
    levelEnablement.set("log", enabled);
    levelEnablement.set("info", enabled);
    levelEnablement.set("warn", enabled);
    levelEnablement.set("error", enabled);
    levelEnablement.set("debug", enabled);
  };

  const setLevelEnabled = (level: LogLevel | "all", enabled: boolean) => {
    if (level === "all") {
      setAllLevelsEnabled(enabled);
    } else {
      levelEnablement.set(level, enabled);
    }
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
    info: (...args: any[]) => log("info", args),
    warn: (...args: any[]) => log("warn", args),
    error: (...args: any[]) => log("error", args),
    debug: (...args: any[]) => log("debug", args),
    setLevelEnabled,
    setAllLevelsEnabled,
  };
}
