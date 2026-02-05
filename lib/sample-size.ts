// Pure math — no external dependencies
// Reference: J-PAL Power Calculations, DIME Wiki

// Standard normal inverse CDF (approximation using rational Chebyshev)
function normalInverseCDF(p: number): number {
  if (p <= 0 || p >= 1) throw new Error("p must be between 0 and 1");
  if (p < 0.5) return -normalInverseCDF(1 - p);

  const t = Math.sqrt(-2 * Math.log(1 - p));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;

  return t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
}

export interface SampleSizeInputs {
  experimentType: "rct" | "cluster_rct" | "quasi" | "ab_test" | "did" | "pilot";
  mde: number; // minimum detectable effect in standard deviations
  power: number; // statistical power (default 0.80)
  alpha: number; // significance level (default 0.05)
  allocationRatio: number; // proportion in treatment (default 0.5)
  icc?: number; // intra-class correlation (for cluster designs)
  clusterSize?: number; // average units per cluster
  attritionRate?: number; // expected attrition (default 0.10)
  numArms?: number; // number of treatment arms (default 2)
}

export interface SampleSizeResult {
  totalSampleSize: number;
  perArmSize: number;
  designEffect: number | null;
  adjustedForAttrition: number;
  numClusters: number | null;
  explanation: string;
  breakdown: {
    label: string;
    value: string;
  }[];
}

export function calculateSampleSize(inputs: SampleSizeInputs): SampleSizeResult {
  const {
    experimentType,
    mde,
    power,
    alpha,
    allocationRatio,
    icc,
    clusterSize,
    attritionRate = 0.1,
    numArms = 2,
  } = inputs;

  // Z-scores
  const zAlpha = normalInverseCDF(1 - alpha / 2);
  const zBeta = normalInverseCDF(power);

  // Base sample size for two-arm comparison (per arm)
  // Formula: n = (z_α/2 + z_β)² × (1/(P(1-P))) / δ²
  // where P is allocation ratio and δ is MDE in SDs
  const p = allocationRatio;
  const baseSizePerArm = Math.ceil(
    (Math.pow(zAlpha + zBeta, 2) * (1 / (p * (1 - p)))) / Math.pow(mde, 2)
  );

  let designEffect: number | null = null;
  let adjustedPerArm = baseSizePerArm;
  let numClustersNeeded: number | null = null;

  // Apply design effect for cluster designs
  if (
    (experimentType === "cluster_rct" || experimentType === "quasi") &&
    icc != null &&
    clusterSize != null
  ) {
    designEffect = 1 + (clusterSize - 1) * icc;
    adjustedPerArm = Math.ceil(baseSizePerArm * designEffect);
    numClustersNeeded = Math.ceil(adjustedPerArm / clusterSize) * numArms;
  }

  // Total across all arms
  const totalBeforeAttrition = adjustedPerArm * numArms;
  const totalWithAttrition = Math.ceil(totalBeforeAttrition / (1 - attritionRate));

  // Build explanation
  const breakdown: { label: string; value: string }[] = [
    { label: "Significance level (α)", value: `${(alpha * 100).toFixed(1)}%` },
    { label: "Power (1-β)", value: `${(power * 100).toFixed(0)}%` },
    { label: "Minimum Detectable Effect", value: `${mde} SD` },
    { label: "Treatment allocation", value: `${(allocationRatio * 100).toFixed(0)}%` },
    { label: "Number of arms", value: `${numArms}` },
    { label: "Base sample (per arm)", value: baseSizePerArm.toLocaleString() },
  ];

  if (designEffect != null) {
    breakdown.push(
      { label: "ICC", value: `${icc}` },
      { label: "Cluster size", value: `${clusterSize}` },
      { label: "Design effect", value: designEffect.toFixed(2) },
      { label: "Adjusted per arm", value: adjustedPerArm.toLocaleString() }
    );
  }

  breakdown.push(
    { label: "Total (before attrition)", value: totalBeforeAttrition.toLocaleString() },
    { label: `Attrition adjustment (${(attritionRate * 100).toFixed(0)}%)`, value: `+${(totalWithAttrition - totalBeforeAttrition).toLocaleString()}` },
    { label: "Final sample size", value: totalWithAttrition.toLocaleString() }
  );

  if (numClustersNeeded != null) {
    breakdown.push({ label: "Clusters needed", value: numClustersNeeded.toLocaleString() });
  }

  const explanation = designEffect
    ? `You need ${totalWithAttrition.toLocaleString()} participants across ${numClustersNeeded} clusters (${numArms} arms) to detect an effect of ${mde} SD with ${(power * 100).toFixed(0)}% power. Design effect of ${designEffect.toFixed(2)} accounts for within-cluster correlation (ICC=${icc}).`
    : `You need ${totalWithAttrition.toLocaleString()} participants (${numArms} arms, ${Math.ceil(totalWithAttrition / numArms).toLocaleString()} per arm) to detect an effect of ${mde} SD with ${(power * 100).toFixed(0)}% power at the ${(alpha * 100).toFixed(1)}% significance level.`;

  return {
    totalSampleSize: totalBeforeAttrition,
    perArmSize: adjustedPerArm,
    designEffect,
    adjustedForAttrition: totalWithAttrition,
    numClusters: numClustersNeeded,
    explanation,
    breakdown,
  };
}

// Generate power curve data for visualization
export function generatePowerCurve(
  inputs: Omit<SampleSizeInputs, "mde">,
  mdeRange: { min: number; max: number; steps: number }
): { mde: number; sampleSize: number }[] {
  const points: { mde: number; sampleSize: number }[] = [];
  const step = (mdeRange.max - mdeRange.min) / mdeRange.steps;

  for (let i = 0; i <= mdeRange.steps; i++) {
    const mde = mdeRange.min + step * i;
    if (mde <= 0) continue;
    const result = calculateSampleSize({ ...inputs, mde });
    points.push({ mde: Math.round(mde * 100) / 100, sampleSize: result.adjustedForAttrition });
  }

  return points;
}
