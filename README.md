# ExperimentLab - A/B Testing Platform

A comprehensive, statistically rigorous A/B testing platform built with Next.js, TypeScript, and modern web technologies. ExperimentLab provides enterprise-grade experimentation capabilities with real-time monitoring, Bayesian analysis, and advanced statistical methods.

## 🚀 Overview

ExperimentLab is a full-featured experimentation platform designed for data-driven teams who need to run reliable A/B tests with proper statistical rigor. It combines modern web technologies with advanced statistical methods to help you make confident, data-backed decisions.

## ✨ Key Features

### Experiment Management
- **Create and manage experiments** with a clean, intuitive interface
- **Multiple experiment states**: Draft, Running, Paused, Completed, Archived
- **Flexible variant configuration** with custom traffic splits
- **Hypothesis tracking** and experiment documentation
- **Target sample size** planning with power analysis

### Statistical Analysis
- **Frequentist Statistics**
  - Two-sample t-tests with Welch's approximation
  - Confidence intervals (95% by default)
  - P-value calculations
  - Statistical significance detection
  
- **Bayesian Analysis**
  - Posterior probability distributions using Beta-Bernoulli models
  - Probability to be best calculations
  - Expected loss estimation
  - Credible intervals (Bayesian confidence intervals)
  - Decision rules for early stopping

- **Sequential Testing**
  - O'Brien-Fleming alpha spending function
  - Early stopping detection
  - Optimal stopping time estimation
  - Information fraction tracking

### Advanced Features
- **Sample Ratio Mismatch (SRM) Detection**
  - Chi-square tests for traffic allocation validation
  - Automatic alerts for data quality issues
  
- **Guardrail Metrics**
  - Monitor critical business metrics
  - Automatic violation detection
  - Configurable thresholds and severity levels
  - Recommended actions based on violations

- **Power Analysis Calculator**
  - Calculate required sample sizes
  - Estimate experiment duration
  - Configure significance level (α) and statistical power (β)
  - Support for different effect sizes

- **Real-time Monitoring**
  - Experiment health scores
  - Active alerts and warnings
  - Traffic monitoring
  - Metric anomaly detection
  - Experiment velocity tracking

### Visualization
- **Interactive charts** using Recharts
  - Metric performance over time
  - Uplift visualization with confidence intervals
  - Sample size progress tracking
  - Bayesian probability distributions

- **Results Dashboard**
  - Primary and secondary metrics
  - Variant comparisons
  - Statistical significance indicators
  - Confidence interval displays

## 🛠 Technology Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **Lucide React** - Icon library

### UI Components
- Custom component library built on Radix UI primitives
- Shadcn/ui inspired design system
- Dark mode support with next-themes
- Responsive design for mobile and desktop

### Storage
- **Browser localStorage** - Client-side data persistence
- Mock data generation for development and testing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/johaankjis/AB-Testing-Platform.git
cd AB-Testing-Platform
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📖 Usage Guide

### Creating an Experiment

1. **Navigate to the home page** and click "New Experiment"

2. **Fill in basic information**:
   - Experiment Name (e.g., "Checkout Button Color Test")
   - Description
   - Hypothesis
   - Owner
   - Target Sample Size
   - Randomization Unit (user_id, session_id, device_id)
   - Traffic Allocation (percentage of total traffic)

3. **Define variants**:
   - Control variant (baseline)
   - One or more treatment variants
   - Set traffic splits between variants

4. **Configure metrics**:
   - Primary metric (main success metric)
   - Secondary metrics (supporting metrics)
   - Guardrail metrics (metrics that should not degrade)

5. **Save as draft** and review before starting

### Running an Experiment

1. **Start the experiment** from the experiment detail page
2. **Monitor in real-time**:
   - Check experiment health score
   - Review sample size progress
   - Monitor for SRM issues
   - Check guardrail violations

3. **Analyze results**:
   - View frequentist statistics (p-values, confidence intervals)
   - Check Bayesian analysis (probability to be best)
   - Review sequential testing recommendations
   - Examine uplift charts

4. **Make decisions**:
   - Wait for statistical significance
   - Consider Bayesian decision rules
   - Check for early stopping opportunities
   - Review guardrail metrics

5. **Complete the experiment**:
   - Mark as completed when done
   - Archive for historical reference

### Using the Power Analysis Calculator

1. Navigate to the experiment detail page
2. Open the Power Analysis Calculator card
3. Enter parameters:
   - **Baseline Conversion Rate**: Current metric value (e.g., 0.12 for 12%)
   - **Minimum Detectable Effect (MDE)**: Smallest change you want to detect (e.g., 5%)
   - **Significance Level (α)**: Usually 0.05 (5%)
   - **Statistical Power**: Usually 0.8 (80%)
4. Click "Calculate"
5. Review required sample size and estimated duration

## 🏗 Architecture

### Directory Structure

```
AB-Testing-Platform/
├── app/                          # Next.js App Router pages
│   ├── experiments/
│   │   ├── [id]/                # Experiment detail page
│   │   │   └── page.tsx
│   │   └── new/                 # Create experiment page
│   │       └── page.tsx
│   ├── analytics/               # Analytics dashboard
│   ├── settings/                # Settings page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (experiments list)
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # Base UI components (buttons, cards, etc.)
│   ├── bayesian-results-card.tsx
│   ├── experiment-card.tsx
│   ├── experiment-health-card.tsx
│   ├── guardrails-monitor.tsx
│   ├── metric-chart.tsx
│   ├── monitoring-dashboard.tsx
│   ├── navigation.tsx
│   ├── power-analysis-card.tsx
│   ├── results-table.tsx
│   ├── sample-size-progress.tsx
│   ├── sequential-testing-card.tsx
│   └── uplift-chart.tsx
├── lib/                         # Core business logic
│   ├── analysis.ts              # Statistical analysis engine
│   ├── bayesian.ts              # Bayesian methods
│   ├── guardrails.ts            # Guardrail monitoring
│   ├── monitoring.ts            # Real-time monitoring
│   ├── randomization.ts         # Randomization logic
│   ├── sequential-testing.ts    # Sequential testing methods
│   ├── statistics.ts            # Core statistical functions
│   ├── storage.ts               # Data persistence
│   ├── tracking.ts              # Event tracking
│   ├── types.ts                 # TypeScript type definitions
│   └── mock-data.ts             # Mock data generation
├── styles/                      # Additional styles
├── public/                      # Static assets
└── package.json                 # Project dependencies
```

### Core Components

#### Analysis Engine (`lib/analysis.ts`)
- Aggregates metric values by variant
- Calculates experiment results with statistical tests
- Computes confidence intervals and p-values
- Generates experiment health scores
- Creates comprehensive experiment summaries

#### Bayesian Analysis (`lib/bayesian.ts`)
- Beta-Bernoulli conjugate prior models
- Posterior distribution calculations
- Monte Carlo sampling for probability estimates
- Expected loss calculations
- Decision rules for experiment stopping

#### Sequential Testing (`lib/sequential-testing.ts`)
- O'Brien-Fleming alpha spending function
- Sequential test statistics
- Early stopping boundaries
- Optimal stopping time estimation

#### Statistics (`lib/statistics.ts`)
- Two-sample t-tests (Welch's method)
- Power analysis for sample size calculation
- SRM detection using chi-square tests
- Normal and Student's t distributions (approximations)
- Confidence interval calculations

#### Guardrails (`lib/guardrails.ts`)
- Metric threshold monitoring
- Violation detection and alerts
- Severity classification (warning/critical)
- Action recommendations (continue/pause/stop)

#### Monitoring (`lib/monitoring.ts`)
- Real-time experiment health checks
- Traffic anomaly detection
- Metric anomaly detection
- Alert generation and management
- Experiment velocity tracking

## 🔬 Core Concepts

### A/B Testing Fundamentals

**A/B testing** (also called split testing) is a method of comparing two or more variants to determine which performs better. Users are randomly assigned to different variants, and metrics are measured to detect statistically significant differences.

### Randomization

The platform supports three randomization units:
- **user_id**: Consistent experience per user across sessions
- **session_id**: Different variants per session
- **device_id**: Device-based assignment

### Statistical Significance

Statistical significance indicates whether observed differences are likely due to the treatment or random chance. The platform uses:
- **P-value**: Probability of observing results at least as extreme if there's no real effect
- **Alpha (α)**: Significance level, typically 0.05 (5%)
- **Confidence Intervals**: Range of plausible values for the true effect

### Sample Size and Power

- **Sample Size**: Number of users needed to detect an effect
- **Statistical Power**: Probability of detecting a real effect (typically 80%)
- **Minimum Detectable Effect (MDE)**: Smallest effect size you want to detect
- **Effect Size**: Magnitude of difference between variants

### Bayesian vs Frequentist

**Frequentist Approach** (Traditional):
- Uses p-values and confidence intervals
- Binary decision: significant or not
- Fixed sample size typically required

**Bayesian Approach**:
- Calculates probability that each variant is best
- Provides probability distributions
- More intuitive interpretation
- Better for early stopping decisions

### Sample Ratio Mismatch (SRM)

SRM occurs when the observed traffic split differs from the expected split, indicating:
- Randomization bugs
- Data collection issues
- Implementation problems

The platform automatically detects SRM using chi-square tests.

### Guardrail Metrics

Guardrail metrics are critical business metrics that should not degrade during experiments:
- Revenue per user
- Error rates
- Page load time
- Customer satisfaction scores

## 🎨 Component Library

### Key Components

#### `<ExperimentCard />`
Displays experiment summary with status, owner, dates, and target sample size.

#### `<BayesianResultsCard />`
Shows Bayesian analysis results including probability to be best, expected loss, and credible intervals.

#### `<ExperimentHealthCard />`
Displays experiment health score, active issues, and sample size progress.

#### `<PowerAnalysisCard />`
Interactive calculator for determining required sample sizes.

#### `<SequentialTestingCard />`
Shows sequential testing results and early stopping recommendations.

#### `<SampleSizeProgress />`
Tracks progress toward target sample size with variant breakdowns.

#### `<GuardrailsMonitor />`
Monitors guardrail metrics and displays violations.

#### `<MetricChart />`
Visualizes metric performance over time for all variants.

#### `<UpliftChart />`
Shows relative uplift with confidence intervals.

#### `<ResultsTable />`
Tabular display of experiment results with statistical details.

## 🔄 Development Workflow

### Project Structure

The project follows Next.js 15 App Router conventions:
- **Server Components** by default for better performance
- **Client Components** (`"use client"`) for interactive elements
- **File-based routing** in the `app/` directory

### State Management

- **Local state** with React hooks (`useState`, `useEffect`)
- **localStorage** for data persistence
- **URL state** with Next.js routing

### Styling

- **Tailwind CSS** for utility-first styling
- **CSS variables** for theming
- **Dark mode** support with `next-themes`
- **Responsive design** with Tailwind breakpoints

### Type Safety

- **TypeScript** throughout the codebase
- **Type definitions** in `lib/types.ts`
- **Strict mode** enabled

## 🧪 Statistical Methods Reference

### Confidence Intervals

```typescript
// 95% confidence interval for a mean
const ci = calculateConfidenceInterval(mean, standardError, alpha = 0.05)
// Returns: [lowerBound, upperBound]
```

### T-Test

```typescript
// Two-sample t-test (Welch's method)
const result = twoSampleTTest(
  controlMean, controlVariance, controlSize,
  treatmentMean, treatmentVariance, treatmentSize,
  alpha = 0.05
)
// Returns: { tStatistic, pValue, degreesOfFreedom, isSignificant, confidenceInterval }
```

### Power Analysis

```typescript
const analysis = calculatePowerAnalysis({
  baselineRate: 0.12,           // 12% baseline conversion
  minimumDetectableEffect: 5,   // 5% relative change
  alpha: 0.05,                  // 5% significance level
  power: 0.8                    // 80% power
})
// Returns: { requiredSampleSizePerVariant, totalSampleSize, estimatedDuration }
```

### Bayesian Analysis

```typescript
const results = performBayesianAnalysis(
  experimentId,
  metricId,
  variants,
  conversionData
)
// Returns array of BayesianResult with probabilityToBeBest, expectedLoss, etc.
```

### SRM Check

```typescript
const srmResult = checkSRM(
  { variantA: 0.5, variantB: 0.5 },  // Expected ratios
  { variantA: 5234, variantB: 4876 } // Observed counts
)
// Returns: { chiSquare, pValue, hasSRM }
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Issues

- Use GitHub Issues to report bugs
- Include clear reproduction steps
- Provide browser/environment details
- Share relevant screenshots

### Suggesting Features

- Open a GitHub Issue with the "enhancement" label
- Describe the use case and expected behavior
- Explain why this feature would be valuable

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure code follows TypeScript and ESLint standards
5. Test your changes thoroughly
6. Commit with clear messages (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Write clear, descriptive variable names
- Add comments for complex logic
- Update documentation for API changes
- Ensure TypeScript types are accurate
- Test on multiple browsers if UI changes

## 📝 License

This project is available for personal and educational use. For commercial use, please contact the repository owner.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)

## 📚 Further Reading

### A/B Testing Resources
- [Trustworthy Online Controlled Experiments](https://experimentguide.com/) by Kohavi, Tang, and Xu
- [Statistical Methods in Online A/B Testing](https://www.exp-platform.com/) by Optimizely
- [Evan Miller's A/B Testing Resources](https://www.evanmiller.org/ab-testing/)

### Statistical Concepts
- [Understanding P-values](https://www.statisticshowto.com/probability-and-statistics/statistics-definitions/p-value/)
- [Bayesian vs Frequentist Statistics](https://www.probabilisticworld.com/frequentist-bayesian-approaches-inferential-statistics/)
- [Sequential Testing](https://www.microsoft.com/en-us/research/group/experimentation-platform-exp/)

### Next.js and React
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📧 Contact

For questions, suggestions, or support, please open an issue on GitHub.

---

**ExperimentLab** - Making experimentation accessible and statistically rigorous for everyone.
