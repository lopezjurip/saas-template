import React from "react";
import { type DebugInstance, LOGGER_CONSOLE } from "./index";

export const LoggerContext = /*#__PURE__*/ React.createContext<DebugInstance>(LOGGER_CONSOLE);

export type LoggerProviderProps = {
  logger: DebugInstance;
  children: React.ReactNode;
};

export function LoggerProvider({ logger, children }: LoggerProviderProps) {
  return <LoggerContext.Provider value={logger}>{children}</LoggerContext.Provider>;
}

export function useLogger(): DebugInstance {
  return React.useContext(LoggerContext);
}
