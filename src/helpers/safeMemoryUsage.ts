export function safeMemoryUsage() {
  try {
    return process.memoryUsage();
  } catch {
    // Nothing to do here
  }
}
