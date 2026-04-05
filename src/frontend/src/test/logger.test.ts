/**
 * Unit tests for logger service
 */
import { logger } from "../services/logger";

describe("Logger Service", () => {
  it("should log error messages", () => {
    const spyError = vi.spyOn(console, "error");
    const testError = new Error("Test error");

    logger.error("Test message", testError);

    expect(spyError).toHaveBeenCalled();
    spyError.mockRestore();
  });

  it("should log warning messages", () => {
    const spyWarn = vi.spyOn(console, "warn");

    logger.warn("Test warning", { contextData: true });

    expect(spyWarn).toHaveBeenCalled();
    spyWarn.mockRestore();
  });

  it("should log info messages", () => {
    const spyLog = vi.spyOn(console, "log");

    logger.info("Test info", { key: "value" });

    expect(spyLog).toHaveBeenCalled();
    spyLog.mockRestore();
  });

  it("should log performance metrics", () => {
    const spyLog = vi.spyOn(console, "log");

    logger.performance("page-load", 1234, "ms");

    expect(spyLog).toHaveBeenCalled();
    expect(spyLog.mock.calls[0][0]).toContain("page-load");
    spyLog.mockRestore();
  });
});
