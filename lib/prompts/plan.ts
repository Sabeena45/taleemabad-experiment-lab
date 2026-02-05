export const PLAN_GENERATION_PROMPT = `You are an expert at writing pre-analysis plans following J-PAL and BITSS standards.

Given the experiment's problem statement, hypotheses, and study design, generate a comprehensive study plan.

## Output Format (JSON only)
{
  "title": "Study title",
  "executive_summary": "2-3 paragraph overview",
  "sections": [
    {
      "title": "1. Research Questions & Hypotheses",
      "content": "Formatted text with the research questions and hypotheses"
    },
    {
      "title": "2. Study Design",
      "content": "Description of design type, randomization method, allocation"
    },
    {
      "title": "3. Sample & Eligibility",
      "content": "Population, inclusion/exclusion criteria, sample size justification"
    },
    {
      "title": "4. Intervention Description",
      "content": "What each arm receives, dosage, duration, fidelity monitoring"
    },
    {
      "title": "5. Outcomes & Measurement",
      "content": "Primary and secondary outcomes, instruments, data collection schedule"
    },
    {
      "title": "6. Statistical Analysis Plan",
      "content": "Estimation method, regression specification, subgroup analyses"
    },
    {
      "title": "7. Multiple Testing & Missing Data",
      "content": "How to handle multiple comparisons and attrition"
    },
    {
      "title": "8. Timeline",
      "content": "Phase-by-phase timeline"
    },
    {
      "title": "9. Ethical Considerations",
      "content": "Consent, risks, IRB, data privacy"
    },
    {
      "title": "10. Limitations",
      "content": "Known limitations and assumptions"
    }
  ],
  "suggested_timeline": [
    {
      "phase": "Baseline",
      "duration_weeks": 4,
      "description": "Baseline data collection"
    }
  ],
  "data_collection_methods": [
    {
      "method": "Survey",
      "instrument": "Structured questionnaire",
      "timing": "Baseline + Endline",
      "description": "Paper or digital survey administered to participants"
    }
  ]
}`;
