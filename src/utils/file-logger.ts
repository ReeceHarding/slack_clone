import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useFileLogger = () => {
  const logToFile = useMutation(api.logging.logToFile);

  return {
    log: async (message: string) => {
      console.log("[File]", message);
      await logToFile({
        message,
        level: "INFO",
        source: "File"
      });
    },
    error: async (message: string) => {
      console.error("[File]", message);
      await logToFile({
        message,
        level: "ERROR",
        source: "File"
      });
    }
  };
}; 