import { NextResponse } from "next/server";
import { calculateSampleSize, generatePowerCurve, type SampleSizeInputs } from "@/lib/sample-size";

export async function POST(request: Request) {
  try {
    const inputs: SampleSizeInputs = await request.json();

    const result = calculateSampleSize(inputs);

    // Also generate power curve data
    const powerCurve = generatePowerCurve(
      {
        experimentType: inputs.experimentType,
        power: inputs.power,
        alpha: inputs.alpha,
        allocationRatio: inputs.allocationRatio,
        icc: inputs.icc,
        clusterSize: inputs.clusterSize,
        attritionRate: inputs.attritionRate,
        numArms: inputs.numArms,
      },
      { min: 0.1, max: 1.0, steps: 18 }
    );

    return NextResponse.json({ ...result, powerCurve });
  } catch (error) {
    console.error("Sample size calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate sample size" },
      { status: 500 }
    );
  }
}
