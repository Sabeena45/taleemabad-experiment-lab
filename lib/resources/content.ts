export interface Resource {
  slug: string;
  title: string;
  icon: string;
  category: "statistics" | "design" | "practice" | "policy";
  readTime: string;
  summary: string;
  content: string; // markdown
  keyTakeaway: string;
}

export const RESOURCES: Resource[] = [
  {
    slug: "minimum-detectable-effect",
    title: "What is a Minimum Detectable Effect (MDE)?",
    icon: "📏",
    category: "statistics",
    readTime: "5 min",
    summary: "The smallest effect your experiment can reliably detect. Getting this right determines whether your study will be useful.",
    keyTakeaway: "A smaller MDE requires a larger sample. Choose an MDE that represents a meaningful change for your context.",
    content: `## Why MDE Matters

The Minimum Detectable Effect (MDE) is the smallest improvement your experiment can reliably detect. Think of it as the resolution of your microscope — a powerful microscope can see tiny details, but it costs more.

## How It Works

MDE is measured in **standard deviations** (also called effect sizes or Cohen's d):
- **0.1 SD** = Small effect (like a minor tweak to a curriculum)
- **0.2-0.3 SD** = Medium effect (like adding a tutoring program)
- **0.5+ SD** = Large effect (like a comprehensive intervention)

## The Trade-Off

Smaller MDE = Larger sample needed = More expensive

| MDE | Sample Size (80% power) | What it means |
|-----|------------------------|---------------|
| 0.5 SD | ~128 total | Can only detect large effects |
| 0.3 SD | ~352 total | Detects medium effects |
| 0.2 SD | ~788 total | Detects small effects |
| 0.1 SD | ~3,142 total | Detects very small effects |

## Choosing Your MDE

Ask yourself: **What's the smallest improvement that would make this intervention worth doing?**

For education programs in Pakistan:
- Taleemabad's teacher certification showed **0.46 SD** — a large, meaningful effect
- Most education interventions show **0.1-0.3 SD**
- If your intervention is expensive, you need a larger effect to justify the cost

## Real Example

Youth Impact ran an RCT in Pakistan testing after-school tutoring. They chose an MDE of 0.25 SD because:
1. Previous studies showed similar programs achieved 0.2-0.4 SD
2. The program cost $30/student — only worthwhile if gains exceeded 0.2 SD
3. They had budget for ~400 students, making 0.25 SD detectable

## Common Mistakes

1. **Choosing too small an MDE** → Need impossibly large sample
2. **Choosing too large an MDE** → Miss real but modest effects
3. **Not considering costs** → A $500/student intervention needs larger effects than a $10/student one`,
  },
  {
    slug: "statistical-power",
    title: "Understanding Statistical Power",
    icon: "⚡",
    category: "statistics",
    readTime: "5 min",
    summary: "Power is the probability your experiment will detect a real effect. Low power means you might miss something that's actually working.",
    keyTakeaway: "Aim for 80% power minimum. Higher power costs more sample but reduces the risk of a false negative.",
    content: `## What Is Power?

Statistical power is the probability that your experiment will correctly detect an effect **when one truly exists**. It's like the sensitivity of a test.

- **80% power** = 80% chance of detecting a real effect (standard)
- **90% power** = 90% chance (more conservative)
- **50% power** = Coin flip — you might miss a real effect half the time

## Why 80%?

Convention in social science. It means you accept a 20% risk of a "false negative" — concluding the intervention doesn't work when it actually does.

## The Four Levers

Power depends on four things:

1. **Sample size** (bigger = more power)
2. **Effect size / MDE** (bigger effects are easier to detect)
3. **Significance level (α)** (usually 0.05)
4. **Variance** (less noisy data = more power)

## Power Curve

Imagine a curve: as sample size increases, power rises. At some point, adding more participants gives diminishing returns. The "knee" of the curve is usually your sweet spot.

## Underpowered Studies: The Hidden Problem

Many education studies are **underpowered** — they can't detect realistic effects:
- A study with 50 students per group has ~35% power to detect 0.3 SD
- That means a 65% chance of missing a real effect
- The study might conclude "no impact" when the program actually works

## Practical Guide

| Power | Risk of Missing Real Effect | When to Use |
|-------|---------------------------|-------------|
| 80% | 20% | Standard for most studies |
| 90% | 10% | High-stakes policy decisions |
| 95% | 5% | Critical interventions |

## Real Example

The What Works Hub recommends 80% power for education pilots. For their Balochistan study, they calculated:
- To detect 0.3 SD with 80% power at 5% significance → 176 per group
- With 15% attrition buffer → ~207 per group → ~414 total`,
  },
  {
    slug: "rct-vs-quasi",
    title: "RCT vs Quasi-Experiment: When to Use Which",
    icon: "🎲",
    category: "design",
    readTime: "6 min",
    summary: "RCTs are the gold standard but not always feasible. Quasi-experiments offer a practical alternative when randomization isn't possible.",
    keyTakeaway: "Use an RCT when you can randomize. Use a quasi-experiment when you can't, but know the trade-offs in causal inference.",
    content: `## The Key Difference

**RCT (Randomized Controlled Trial):** Randomly assign who gets the intervention and who doesn't. Like flipping a coin.

**Quasi-Experiment:** Compare groups that weren't randomly assigned. Use statistical methods to account for differences.

## When to Use an RCT

✅ You have control over who receives the intervention
✅ You can ethically withhold it from a control group (temporarily)
✅ Sample is large enough for randomization to balance groups
✅ You want the strongest causal evidence

**Example:** Testing a new AI coaching tool — randomly assign 100 schools to use it and 100 to continue as usual.

## When to Use a Quasi-Experiment

✅ Randomization is impossible (government mandates, ethical constraints)
✅ The intervention is already being rolled out to some groups
✅ You can find a good comparison group
✅ You have baseline data

**Example:** A province adopts a new curriculum. Compare student outcomes with a neighboring province that didn't adopt it.

## Common Quasi-Experimental Methods

### Difference-in-Differences (DiD)
Compare changes over time between treatment and control groups.
- **Strength:** Controls for time-invariant differences
- **Assumption:** "Parallel trends" — groups would have changed similarly without intervention

### Regression Discontinuity (RD)
Use a cutoff score (e.g., poverty index) to assign treatment.
- **Strength:** Near-causal evidence around the cutoff
- **Limitation:** Only applies at the cutoff point

### Propensity Score Matching
Match treated and untreated individuals on observable characteristics.
- **Strength:** Creates comparable groups after the fact
- **Limitation:** Can't account for unobservable differences

## The Agency Fund Approach

The Agency Fund runs A/B tests for social sector programs — essentially digital RCTs. They recommend:
1. Start with an A/B test if your intervention is digital
2. Use quasi-experiments for physical interventions where randomization is hard
3. Always have a clear comparison group

## Decision Tree

\`\`\`
Can you randomize?
├── Yes → RCT
└── No → Do you have baseline data?
    ├── Yes → Is there a natural cutoff?
    │   ├── Yes → Regression Discontinuity
    │   └── No → Difference-in-Differences
    └── No → Propensity Score Matching
\`\`\``,
  },
  {
    slug: "intra-class-correlation",
    title: "Intra-Class Correlation: Why It Matters for School Studies",
    icon: "🏫",
    category: "statistics",
    readTime: "5 min",
    summary: "ICC measures how similar people within groups (like schools) are. Higher ICC means you need more groups, not more people per group.",
    keyTakeaway: "In education, ICC typically ranges from 0.05-0.25. A higher ICC dramatically increases required sample size for cluster designs.",
    content: `## The Problem with Schools

Students in the same school are more similar to each other than students in different schools. They share the same teacher, curriculum, resources, and community. This **within-group similarity** is measured by the Intra-Class Correlation (ICC).

## What ICC Means

- **ICC = 0** → Students within schools are no more similar than random students
- **ICC = 0.10** → 10% of the variation in outcomes is between schools (typical)
- **ICC = 0.25** → 25% of the variation is between schools (high)
- **ICC = 1.0** → All students in a school are identical (never happens)

## Why It Matters

When you randomize **schools** (not individual students), you need to account for ICC through the **design effect**:

**Design Effect = 1 + (m - 1) × ICC**

Where m = average cluster (school) size.

| ICC | Students/School | Design Effect | Sample Multiplier |
|-----|----------------|---------------|-------------------|
| 0.05 | 30 | 2.45 | 2.5× more students |
| 0.10 | 30 | 3.90 | 4× more students |
| 0.20 | 30 | 6.80 | 7× more students |
| 0.05 | 50 | 3.45 | 3.5× more students |
| 0.10 | 50 | 5.90 | 6× more students |

## Practical Implications

With ICC = 0.10 and 30 students per school:
- Individual RCT needs ~350 students
- **Cluster RCT needs ~1,365 students (across ~46 schools)**

That's almost 4× more students just because you're randomizing at the school level.

## Typical ICC Values in Pakistan

- **Math test scores**: 0.15-0.25 (schools vary a lot in math quality)
- **Reading scores**: 0.10-0.20
- **Attendance**: 0.05-0.15
- **Teacher practices**: 0.10-0.20

## How to Reduce ICC Impact

1. **Use more clusters with fewer students per cluster** — 60 schools × 15 students beats 30 schools × 30 students
2. **Use baseline data as a covariate** — reduces residual ICC
3. **Stratify randomization** — ensure balance on key variables`,
  },
  {
    slug: "pre-analysis-plans",
    title: "Pre-Analysis Plans: Why Register Before You Analyze",
    icon: "📋",
    category: "practice",
    readTime: "5 min",
    summary: "A pre-analysis plan locks in your analysis approach before seeing results. It prevents cherry-picking and strengthens credibility.",
    keyTakeaway: "Write your analysis plan before collecting data. Register it publicly (AEA RCT Registry or OSF) for maximum credibility.",
    content: `## The Problem: Researcher Degrees of Freedom

Without a pre-analysis plan, researchers can (often unconsciously):
- Test multiple outcomes and only report significant ones
- Try different statistical models until one "works"
- Decide which subgroups to analyze after seeing data
- Choose different control variables based on results

This is called **p-hacking** or **specification searching**, and it inflates false positive rates from 5% to as high as 60%.

## The Solution: Pre-Registration

A Pre-Analysis Plan (PAP) specifies **before data collection**:

1. **Primary outcome** — The ONE thing you're measuring
2. **Secondary outcomes** — Additional measures (noted as exploratory)
3. **Sample** — Who's included, exclusion criteria
4. **Statistical model** — Exact regression specification
5. **Multiple testing correction** — How you handle testing multiple outcomes
6. **Subgroup analysis** — Which subgroups, and why (pre-specified)
7. **Missing data** — How to handle attrition and non-response

## Where to Register

- **AEA RCT Registry** (social.srp.com) — Standard for economics RCTs
- **Open Science Framework** (osf.io) — Broader, any study design
- **EGAP** — Political science and governance

## What a Good PAP Looks Like

### Section 1: Research Questions
- Primary: Does AI coaching improve teacher classroom practices?
- Secondary: Does it improve student learning outcomes?

### Section 2: Study Design
- Cluster RCT, school-level randomization
- 60 schools (30 treatment, 30 control)
- 1,800 students total

### Section 3: Outcome Measures
- Primary: FICO observation score (continuous, 0-5 scale)
- Secondary: Student test scores (standardized)

### Section 4: Statistical Analysis
- ITT estimate using OLS with school-level clustering
- Model: Y_i = β₀ + β₁Treatment_i + γX_i + ε_i
- Covariates: Baseline score, school size, urban/rural

### Section 5: Multiple Testing
- Bonferroni correction for secondary outcomes
- Primary outcome tested at α = 0.05

## J-PAL Best Practices

J-PAL recommends:
1. Register before baseline data collection (not just before endline)
2. Include power calculations
3. Specify exactly which tables and figures you'll produce
4. Distinguish between confirmatory and exploratory analyses
5. Update the PAP if design changes (with justification)`,
  },
  {
    slug: "common-pitfalls",
    title: "Common Pitfalls in Experiment Design",
    icon: "⚠️",
    category: "practice",
    readTime: "6 min",
    summary: "The most frequent mistakes that invalidate experiments — and how to avoid them. Based on real examples from education research.",
    keyTakeaway: "Most experiments fail not from bad statistics, but from poor planning: contamination, attrition, and underpowered designs.",
    content: `## Pitfall 1: Contamination

**What:** Treatment "leaks" to the control group.
**Example:** Teachers in treatment schools share the AI coaching app with friends in control schools.

**Prevention:**
- Randomize at cluster level (schools, not students)
- Choose geographically separated clusters
- Monitor for spillover

## Pitfall 2: Attrition

**What:** Participants drop out, and dropouts differ between groups.
**Example:** 30% of control schools stop participating because they feel neglected.

**Prevention:**
- Budget for attrition (add 10-20% to sample)
- Keep control group engaged (offer delayed treatment)
- Track all enrolled participants, even dropouts

## Pitfall 3: Underpowered Design

**What:** Sample too small to detect realistic effects.
**Example:** Testing with 20 schools when you need 60.

**Prevention:**
- Do power calculations BEFORE starting
- Be realistic about MDE (use prior literature)
- Consider minimum detectable effect at design stage

## Pitfall 4: Hawthorne Effect

**What:** People change behavior because they know they're being studied, not because of the intervention.
**Example:** Teachers improve because observers are in their classroom, not because of the training.

**Prevention:**
- Observe both treatment and control groups equally
- Use unobtrusive measures when possible
- Use long study periods (Hawthorne effects fade)

## Pitfall 5: Implementation Failure

**What:** The intervention isn't delivered as designed.
**Example:** AI coaching is available but only 20% of teachers actually use it.

**Prevention:**
- Measure implementation fidelity (not just assignment)
- Report both Intent-to-Treat (ITT) and Treatment-on-Treated (TOT)
- Track dosage and compliance

## Pitfall 6: Multiple Testing Without Correction

**What:** Testing 20 outcomes and celebrating the 1 that's significant at p<0.05.
**Example:** Testing reading, math, science, attendance, engagement... one is bound to be "significant" by chance.

**Prevention:**
- Pre-specify ONE primary outcome
- Use Bonferroni or FDR correction for multiple outcomes
- Distinguish confirmatory from exploratory analyses

## Pitfall 7: Wrong Unit of Analysis

**What:** Randomize at school level but analyze at student level, inflating statistical significance.
**Example:** Claim p<0.001 because you have 1,000 students, when you only have 20 independent clusters.

**Prevention:**
- Cluster standard errors at the level of randomization
- Report the number of clusters, not just individuals
- Use appropriate multi-level models

## Real-World Checklist

Before launching your experiment:
- [ ] Power calculation done and realistic?
- [ ] Contamination risk assessed and mitigated?
- [ ] Attrition buffer included in sample?
- [ ] Implementation monitoring planned?
- [ ] Pre-analysis plan registered?
- [ ] Primary outcome clearly defined?
- [ ] Unit of analysis matches unit of randomization?`,
  },
  {
    slug: "sample-size-guide",
    title: "Sample Size: How Big Is Big Enough?",
    icon: "📊",
    category: "statistics",
    readTime: "5 min",
    summary: "A practical guide to determining sample size for education experiments. It's not about being bigger — it's about being big enough.",
    keyTakeaway: "Sample size depends on MDE, power, significance level, and design. Use a calculator, don't guess.",
    content: `## The Short Answer

**It depends.** But here are ballpark numbers for education studies:

| Study Type | Typical Range | Example |
|-----------|---------------|---------|
| Pilot study | 30-100 | Testing a new tutoring approach |
| Small RCT | 200-500 | Comparing two teaching methods |
| Medium RCT | 500-2,000 | Multi-school intervention |
| Large RCT | 2,000-10,000 | National policy evaluation |
| Cluster RCT | 30-100 clusters | School-level randomization |

## The Formula (Simplified)

For a two-arm individual RCT:

**n per arm ≈ (Z_α + Z_β)² × 2 / MDE²**

Where:
- Z_α = 1.96 (for 5% significance)
- Z_β = 0.84 (for 80% power)
- MDE = your minimum detectable effect in standard deviations

## Quick Reference Table

| MDE | 80% Power | 90% Power |
|-----|-----------|-----------|
| 0.1 | 1,571 per arm | 2,103 per arm |
| 0.2 | 394 per arm | 527 per arm |
| 0.3 | 176 per arm | 235 per arm |
| 0.4 | 99 per arm | 133 per arm |
| 0.5 | 64 per arm | 85 per arm |

## Adjustments You Need

### 1. Attrition
Add 10-20% buffer: **n_adjusted = n / (1 - attrition_rate)**

### 2. Clustering (schools)
Multiply by design effect: **n_cluster = n × (1 + (m-1) × ICC)**

### 3. Multiple Arms
More arms = more participants: **n_total = n_per_arm × number_of_arms**

### 4. Baseline Covariates
Good baseline data can reduce required n by 20-40%

## Common Mistakes

1. **"We have 50 students, that should be enough"** → Probably not. Do the math.
2. **"More is always better"** → Diminishing returns. 10,000 vs 5,000 matters less than 200 vs 100.
3. **"We'll just add more later"** → Sequential testing requires special methods.
4. **"Our pilot showed a huge effect"** → Pilot effects are often inflated. Plan conservatively.`,
  },
  {
    slug: "ab-testing-social-sector",
    title: "A/B Testing for Social Sector",
    icon: "📱",
    category: "design",
    readTime: "5 min",
    summary: "How to apply Silicon Valley's A/B testing methodology to education and social programs. Faster, cheaper, and more iterative than traditional RCTs.",
    keyTakeaway: "A/B tests work best for digital interventions where you can randomize at scale and iterate quickly. The Agency Fund pioneered this approach.",
    content: `## What Makes A/B Testing Different

Traditional RCTs in education take 2-3 years. A/B tests can run in weeks. The key differences:

| Feature | Traditional RCT | A/B Test |
|---------|----------------|----------|
| Timeline | 1-3 years | 2-12 weeks |
| Sample | Hundreds to thousands | Thousands to millions |
| Iterations | 1 (pre-registered) | Multiple (sequential) |
| Cost | $50K-$500K | $5K-$50K |
| Best for | Complex interventions | Digital features |

## The Agency Fund Approach

The Agency Fund pioneered A/B testing for social sector organizations. Their philosophy:
1. **Test everything** — Don't assume, measure
2. **Start small** — Test with 5% of users first
3. **Iterate fast** — Run multiple tests per month
4. **Compound gains** — Small improvements add up

## What You Can A/B Test

In education technology:
- **Notification timing** — Morning vs evening reminders
- **Message framing** — "You're falling behind" vs "You're almost there!"
- **Feature design** — One-page vs multi-page lesson plans
- **Content format** — Video vs text instructions for teachers
- **Incentive structures** — Badges vs leaderboards vs certificates

## How to Run an A/B Test

### 1. Define Your Metric
Choose ONE primary metric. For Taleemabad:
- Lesson completion rate
- Return rate (next day)
- Feature engagement time
- Quiz scores

### 2. Calculate Sample Size
Use standard power calculations but often simpler because:
- You have many users (large n)
- Effects are small but detectable (you're testing tweaks)
- Metrics are measured automatically

### 3. Randomize
Split users randomly into groups:
- **50/50 split** for simple A/B
- **33/33/33** for A/B/C tests
- **90/10** for risky changes (keep most users on current version)

### 4. Run and Monitor
- Minimum 1-2 weeks for behavior changes
- Watch for novelty effects (initial excitement fades)
- Check for subgroup differences

### 5. Decide and Ship
- **Significant improvement** → Roll out to 100%
- **No difference** → Keep current version (simpler)
- **Significant harm** → Stop immediately

## Real Example: Taleemabad

Testing push notification messages for teacher engagement:
- **Version A:** "New lesson plan available for tomorrow's class"
- **Version B:** "87% of teachers in your district already completed this week's plan"
- **Result:** Version B (social proof) increased completion by 23%
- **Timeline:** 2 weeks, 500 teachers per group`,
  },
  {
    slug: "cluster-randomization",
    title: "Cluster Randomization: Schools as Units",
    icon: "🎯",
    category: "design",
    readTime: "5 min",
    summary: "When and how to randomize at the school or classroom level instead of individual students. Essential for most education experiments.",
    keyTakeaway: "Cluster randomization is usually necessary in education but dramatically increases required sample size. Plan for 30+ clusters minimum.",
    content: `## Why Cluster Randomize?

In education, you often can't randomize individual students:
- A teacher can't teach differently to randomly selected students in the same classroom
- A school-wide intervention affects all students
- Contamination risk: treated students share with control students in the same school

**Solution:** Randomize entire schools, classrooms, or districts.

## The Cost of Clustering

Clustering reduces your effective sample size. With 30 students per school and ICC = 0.10:
- You'd need **~4× more students** than an individual RCT
- But often **fewer clusters** is the real constraint

## Minimum Number of Clusters

| Clusters per Arm | Quality of Inference |
|-----------------|---------------------|
| 5-10 | Too few — unreliable |
| 15-20 | Minimum acceptable |
| 25-30 | Good |
| 50+ | Excellent |

**Rule of thumb:** Aim for 15+ clusters per arm, ideally 25+.

## Stratified Randomization

With limited clusters, random chance might create imbalanced groups. Fix this by **stratifying**:

1. Group schools by key characteristics (urban/rural, size, baseline scores)
2. Within each stratum, randomly assign to treatment/control
3. This ensures balance on important variables

## Practical Steps

### Step 1: List All Eligible Clusters
Example: 80 schools in Rawalpindi district

### Step 2: Collect Baseline Data
- School size, urban/rural, average test scores
- This helps with stratification and power

### Step 3: Stratify
- Group into strata (e.g., urban-large, urban-small, rural-large, rural-small)
- Within each stratum, randomly assign

### Step 4: Verify Balance
After randomization, check that treatment and control groups are similar on:
- School size, location, baseline outcomes, teacher experience

### Step 5: Document Everything
- Random number seed used
- Stratification variables
- Assignment list with dates

## What Works Hub Recommendations

For education studies in Pakistan:
1. Minimum 30 schools (15 per arm)
2. ICC assumption: 0.10-0.15 for test scores
3. Always include baseline measurement
4. Stratify by district and school type
5. Report both individual and cluster-level N`,
  },
  {
    slug: "results-to-policy",
    title: "From Results to Policy: Making Evidence Count",
    icon: "🏛️",
    category: "policy",
    readTime: "5 min",
    summary: "How to translate experiment results into actionable policy recommendations. Evidence doesn't speak for itself — you need to make it compelling.",
    keyTakeaway: "Policy audiences need 3 things: a clear finding, a cost-effectiveness comparison, and a specific recommendation they can act on.",
    content: `## The Evidence-to-Policy Gap

Most experiments end with a paper. Few change policy. The gap exists because:
1. **Papers are written for academics**, not policymakers
2. **Results are presented in standard deviations**, not intuitive terms
3. **Recommendations are vague** ("more research needed")
4. **Timing is wrong** — results arrive after decisions are made

## Translating Results

### Standard Deviations → Intuitive Terms

Instead of: "0.28 SD improvement in literacy scores"

Say: "Students gained the equivalent of 1.5 additional years of learning" or "Reading proficiency improved from 45% to 62%"

### Effect Size → Cost-Effectiveness

Instead of: "Medium effect size (d = 0.46)"

Say: "For $50-100 per teacher, we achieved results comparable to $2,000-5,000 instructional coaching programs"

### Statistical Significance → Practical Significance

Instead of: "p < 0.001, statistically significant"

Say: "We're highly confident this works, and the improvement is large enough to matter for student learning"

## The Policy Brief Formula

### 1. The Problem (1 paragraph)
State the problem in terms policymakers care about: student outcomes, teacher quality, budget efficiency.

### 2. What We Tested (1 paragraph)
Describe the intervention simply. No jargon.

### 3. What We Found (1-2 paragraphs)
Lead with the headline number. Compare to alternatives. Show cost-effectiveness.

### 4. What This Means (1 paragraph)
Translate to policy implications. Be specific.

### 5. Our Recommendation (1 paragraph)
One clear, actionable recommendation. Include scale, cost, and timeline.

## Making Evidence Stick

### For Ministers and Secretaries
- **One page maximum**
- **Lead with the cost story** (budget-constrained decisions)
- **Compare to what they're already spending**
- **Include a photo or chart** (one, not ten)

### For Technical Officers
- **Include methodology summary** (they'll check rigor)
- **Provide confidence intervals** (not just point estimates)
- **Acknowledge limitations honestly** (builds credibility)
- **Offer implementation details** (they need to operationalize)

### For Funders
- **Lead with impact per dollar** (ROI framing)
- **Show trajectory** (pilots → scale → system change)
- **Include comparison table** (your approach vs alternatives)
- **End with the ask** (specific funding amount and timeline)

## Real Example: Taleemabad's Approach

Taleemabad's policy engagement with Punjab Ministry of Education:

1. **Finding:** Teacher certification improves classroom practices by 10.2% at $50-100/teacher
2. **Comparison:** 20-50× cheaper than instructional coaching with similar effect sizes
3. **Recommendation:** Scale certification program to 6,000 schools as part of existing teacher development budget
4. **Result:** Punjab Ministry committed to 6,000 school partnership

**The key:** They didn't just present data. They showed how it fit into the Ministry's existing budget and priorities.`,
  },
];

export function getResourceBySlug(slug: string): Resource | undefined {
  return RESOURCES.find((r) => r.slug === slug);
}

export function getResourcesByCategory(category: Resource["category"]): Resource[] {
  return RESOURCES.filter((r) => r.category === category);
}
