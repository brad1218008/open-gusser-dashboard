/**
 * Calculates the game score based on previous total and current input.
 * 
 * @param currentInputTotal - The total score entered right now.
 * @param previousInputTotal - The total score from the LAST entry for this player (in previous round or same round previous step).
 * @param isRejoin - Flag indicating if this is a rejoin/rescore event.
 */
export function calculateScore(currentInputTotal: number, previousInputTotal: number | null, isRejoin: boolean): number {
  // 1. If it's a rejoin, we reset the calculated delta to 0 (or null logic handled by caller if needed, but 0 is safe for "no points gained this step").
  //    The currentInputTotal becomes the new "anchor" for the NEXT calculation.
  if (isRejoin) {
    return 0; 
  }

  // 2. If there is no previous history (first round), the game score is just the total score.
  if (previousInputTotal === null) {
    return currentInputTotal;
  }

  // 3. Standard calculation: Delta = Current Total - Previous Total
  return currentInputTotal - previousInputTotal;
}
