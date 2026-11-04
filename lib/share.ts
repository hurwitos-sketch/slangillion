export type ShareOutcome = "shared" | "copied" | "cancelled" | "manual";

// Keep native sharing in the click handler so browsers retain user activation.
export async function shareResults(text: string): Promise<ShareOutcome> {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError")
        return "cancelled";
      // Unsupported share targets and policy denials can still permit copying.
    }
  }
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch {
    // Restricted browsers still allow selecting and copying the text manually.
  }
  return "manual";
}
