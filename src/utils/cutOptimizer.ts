/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CutRequest, ProfileOptimizationResult, OptimizedBar } from "../types";

/**
 * Optimizes the cuts of a single profile across multiple standard-size bars.
 * Uses the First-Fit Decreasing (FFD) bin packing algorithm.
 * 
 * @param cuts List of requested cuts
 * @param barLengthCm Standard raw material bar length in cm (e.g., 610cm or 420cm)
 * @param kerfCm Blade cut width (saw kerf) in cm, e.g., 0.4 cm (4 mm)
 * @param profileName Label of the profile being optimized
 */
export function optimizeCuts(
  cuts: CutRequest[],
  barLengthCm: number,
  kerfCm: number = 0.4,
  profileName: string = "Perfil"
): ProfileOptimizationResult {
  // 1. Flatten the cuts list based on quantity
  interface FlattenedCut {
    id: string;
    originalIndex: number;
    name: string;
    lengthCm: number;
    angle: string;
  }

  const flatCuts: FlattenedCut[] = [];
  cuts.forEach((item, index) => {
    for (let i = 0; i < item.quantity; i++) {
      flatCuts.push({
        id: `${item.id || "cut"}-${index}-${i}`,
        originalIndex: index,
        name: item.name,
        lengthCm: item.lengthCm,
        angle: item.angle
      });
    }
  });

  // 2. Sort descending from largest to smallest
  flatCuts.sort((a, b) => b.lengthCm - a.lengthCm);

  // 3. First-Fit Decreasing logic
  const bars: OptimizedBar[] = [];

  flatCuts.forEach((cut) => {
    // Check if cut fits standard bar length by itself
    if (cut.lengthCm > barLengthCm) {
      // It's impossible to cut physically, but pack it anyway in its own "fail" bar or clip it
      // Let's create an oversized bar, but technically, in practice it cannot be done.
      const newBarIndex = bars.length;
      bars.push({
        barIndex: newBarIndex + 1,
        originalLengthCm: barLengthCm,
        cuts: [{ ...cut, lengthCm: barLengthCm }], // clip it for safety
        usedLengthCm: barLengthCm,
        wasteCm: 0,
        wastePercent: 0
      });
      return;
    }

    let packed = false;

    // Try to find a bar that already exists with enough remaining space
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      // A saw kerf (blade cut width) is added between cuts.
      // If there are N cuts, there are N-1 or N kerfs.
      // Usually, each cut takes cut.lengthCm + kerf units.
      // Let's calculate total space needed if we add this cut:
      // if it is the first cut, no kerf is added, or we can just say each cut absorbs 'kerf'.
      // To be safe: space already used: bar.usedLengthCm.
      // Additional space: cut.lengthCm + (bar.cuts.length > 0 ? kerfCm : 0).
      const kerfToAdd = bar.cuts.length > 0 ? kerfCm : 0;
      if (bar.usedLengthCm + cut.lengthCm + kerfToAdd <= barLengthCm) {
        bar.cuts.push(cut);
        bar.usedLengthCm += cut.lengthCm + kerfToAdd;
        packed = true;
        break;
      }
    }

    if (!packed) {
      // Start a new bar
      const newBarIndex = bars.length;
      bars.push({
        barIndex: newBarIndex + 1,
        originalLengthCm: barLengthCm,
        cuts: [cut],
        usedLengthCm: cut.lengthCm,
        wasteCm: 0, // dynamic calculation below
        wastePercent: 0
      });
    }
  });

  // 4. Calculate final waste details for each bar
  let totalRequiredCm = 0;
  let totalWasteCm = 0;

  bars.forEach((bar) => {
    bar.wasteCm = barLengthCm - bar.usedLengthCm;
    if (bar.wasteCm < 0) bar.wasteCm = 0;
    bar.wastePercent = Number(((bar.wasteCm / barLengthCm) * 100).toFixed(1));
    totalRequiredCm += bar.usedLengthCm;
    totalWasteCm += bar.wasteCm;
  });

  const totalBars = bars.length;
  const totalLengthCapacity = totalBars * barLengthCm;
  const averageWastePercent = totalLengthCapacity > 0 
    ? Number(((totalWasteCm / totalLengthCapacity) * 100).toFixed(1))
    : 0;

  return {
    profileName,
    standardBarLengthCm: barLengthCm,
    totalBarsNeeded: totalBars,
    bars,
    totalRequiredCm: Number(totalRequiredCm.toFixed(1)),
    totalWasteCm: Number(totalWasteCm.toFixed(1)),
    averageWastePercent
  };
}

/**
 * Parses expression string safely to calculate measurements
 * e.g., "Ancho * 2" => substitutes Ancho for its variable value
 */
export function evaluateEquation(equation: string, variables: { [key: string]: number }): number {
  try {
    let sanitized = equation;
    // Substitute keys descending to avoid partial replacements (e.g. "Ancho" vs "AnchoTotal")
    const keys = Object.keys(variables).sort((a, b) => b.length - a.length);
    keys.forEach((key) => {
      const val = variables[key];
      // Use regex to replace exact variable name ignoring case
      const selectRegex = new RegExp(`\\b${key}\\b`, "gi");
      sanitized = sanitized.replace(selectRegex, val.toString());
    });

    // Clean up equation: only allow numbers, operators, brackets, decimals
    sanitized = sanitized.replace(/[^0-9+\-*/().\s]/g, "");

    // Evaluate safely via standard operation parsing since it's only basic arithmetic
    // A simple math evaluator function
    const result = new Function(`return (${sanitized})`)();
    return typeof result === "number" && !isNaN(result) ? result : 0;
  } catch (err) {
    console.error("Error evaluating equation:", equation, err);
    return 0;
  }
}
