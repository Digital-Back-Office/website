# Project Instructions

You are working on an Astro-based SaaS website.

Your primary goal is to transform the website into a premium, modern SaaS experience comparable to Linear, Stripe, Vercel, Notion, Arc, Framer premium templates, Dealer Funnel, and Notebooks.

## Core Principles

* Mobile-first design
* Accessibility-first implementation
* Astro-first architecture
* Performance-first decisions
* Component reusability
* Consistent design system
* Clean visual hierarchy
* Premium SaaS aesthetics

## Never Change

* Business logic
* API integrations
* SEO metadata
* Routes
* Analytics
* Existing content unless requested

## Design Goals

### Visual Style

* Modern 2026 SaaS design language
* Large typography
* Strong whitespace usage
* Clean layouts
* Subtle gradients
* Refined shadows
* Minimal visual noise
* High perceived quality
* Dont use translate or scale in hover effect
* dont use over shadows

### Layout Standards

* Max content width: 1280px
* Consistent section spacing
* Responsive grid layouts
* Bento-grid patterns where appropriate
* Alternating feature sections
* Large visual product showcases
* Maintain CSS in css files in styles folder. use relevant css file, if irrelevent create new file
* when adding new icons, create them as svgs in assets folder and use them in code

### Components

All UI must use reusable components.

Examples:

* Button
* Card
* Badge
* Section
* FeatureCard
* TestimonialCard
* FAQAccordion
* PricingCard
* CTASection

Avoid one-off implementations.

## Typography

Establish a consistent typography scale.

Examples:

* Hero
* H1
* H2
* H3
* Body Large
* Body
* Small Text

No arbitrary font sizes.

## Spacing

Use a spacing system.

Example:

8
16
24
32
48
64
96
128

Avoid random spacing values.

## Colors

Create design tokens.

Use:

* Primary
* Secondary
* Surface
* Border
* Accent
* Success
* Warning
* Error

Avoid hardcoded colors.

## Accessibility

Every change must:

* Meet WCAG standards
* Support keyboard navigation
* Maintain contrast ratios
* Use semantic HTML

## Before Any Major Change

1. Analyze existing implementation.
2. Search for reusable components.
3. Propose a plan.
4. Implement incrementally.

## Output Style

For every task:

* Explain reasoning.
* Explain UX improvements.
* List affected files.
* Suggest commit boundaries.

Do not make large uncontrolled changes.
