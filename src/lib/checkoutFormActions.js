/**
 * UI side-effects when checkout validation fails (keeps submit handlers thin).
 *
 * @param {{ valid: boolean; message: string }} validation
 * @param {{ setError: (msg: string) => void; setCellNumberBlurred: (v: boolean) => void }} actions
 */
export function applyCheckoutValidationFailure(validation, { setError, setCellNumberBlurred }) {
  setError(validation.message);
  if (/phone|mobile|digit/i.test(validation.message)) {
    setCellNumberBlurred(true);
  }
}
