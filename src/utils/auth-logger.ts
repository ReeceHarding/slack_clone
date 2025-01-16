import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useAuthLogger = () => {
  const logToFile = useMutation(api.logging.logToFile);

  return {
    log: async (message: string) => {
      console.log("[Auth]", message);
      await logToFile({
        message,
        level: "INFO",
        source: "Auth"
      });
    },
    error: async (message: string) => {
      console.error("[Auth]", message);
      await logToFile({
        message,
        level: "ERROR",
        source: "Auth"
      });
    }
  };
}; 