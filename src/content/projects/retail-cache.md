---
# ---------------------------------------------------------------------------
# Add a project by copying this file: src/content/projects/<slug>.md
# The file name becomes the URL -> /work/<slug>/
#
# Page order: hero -> image -> intro + facts -> Problem -> Solution ->
# Results -> Tech used -> About the client -> 01/02/03 numbered blocks ->
# quote. Everything from `challenge` down is optional; leave a block out and
# the page skips that section.
# ---------------------------------------------------------------------------

title: "Retail Cache"
client: "Retail Cache"
tagline: "Taking a real-time fraud intelligence platform from mock data to production with one embedded engineer"
description: "How Digital Back Office took Retail Cache from a mock-driven prototype to a production-ready MVP: real GraphQL APIs, fraud detection across 10+ scenarios, graph-based network analysis and cloud infrastructure as code."
summary: "Retail Cache is a London-based fraud intelligence platform that helps retailers and carriers detect, prevent and stop return and refund fraud across every order, claim and return in real time, cross-referencing data between participating retailers to catch repeat patterns no single retailer could see alone."

industry: "RetailTech, Fraud Prevention"
services:
  - "Full-Stack Engineering"
  - "Data Engineering"
  - "Cloud & DevOps"

cover_image: "/assets/images/projects/Retailcache/retail-cache.webp"   # optional; a branded placeholder panel is drawn when this is absent
cover_alt: "The Retail Cache website, headlined Protecting Global Commerce from Fraud"

featured: true
order: 2

# The fact strip under the intro. Industry is added automatically; `facts`
# takes any extra label/value pairs (funding raised, team size, a review score).
duration: "3 months"
location: "London (remote engagement)"
team:
  - "Hari"
facts:
  - label: "Scope"
    value: "Prototype to production, taking an early-stage platform to MVP-ready"

challenge:
  title: "An early-stage codebase running entirely on mock data"
  description: "Retail Cache had a basic data pipeline handling claims and orders, and a web app running entirely on mock data. The foundations were there, but turning it into a platform that could onboard real retail partners meant rebuilding it layer by layer, with real production work needed across every layer of the stack."
  points_title: "The Challenges"
  points:
    - title: "Real Technical Breadth"
      description: "Completing the data pipeline, building real APIs, integrating external services like CIFAS, standing up graph-based fraud detection, deploying cloud infrastructure and shipping a working frontend spans backend, data, infrastructure and UI, which is normally a job for a full team."
    - title: "Startup Speed, No Slack"
      description: "Retail Cache could not afford long timelines or heavy processes. They needed someone who could move fast, make sound calls independently and think about the product rather than execute tickets."

solution:
  title: "One dedicated engineer took it from prototype to a live, working platform"
  description: "We extended the data pipeline, built the real GraphQL APIs, implemented fraud signal detection and graph-based network analysis, deployed the cloud infrastructure and delivered a fully functional analyst dashboard connected to live data, all through a single embedded engineer."
  points_title: "Key Features"
  points:
    - title: "Detect"
      description: "10+ configurable fraud scenarios run across every order, claim and return, in real time."
    - title: "Connect"
      description: "Pseudonymised data matching across retailers surfaces repeat offenders no single retailer could catch alone."
    - title: "Act"
      description: "A full analyst dashboard to screen, investigate and act on cases, and to generate dispute packs, connected to live data."

approach:
  title: "The Process"
  phases:
    - title: "Assessment & Direction"
      description: "We mapped the gap between the existing mock-driven prototype and a production-ready platform, then planned a build that shipped working features incrementally rather than all at once."
    - title: "Completing the Platform"
      description: "We built the fraud detection engine across 10+ scenarios, integrated CIFAS, added graph-based network analysis for fraud ring detection, and replaced every mock endpoint with real GraphQL APIs."
    - title: "Making the Web App Real"
      description: "Screening pages for orders, claims and returns, a live fraud dashboard, case detail views, bulk actions, dispute pack exports, audit logs and end-to-end tests, all wired to live data with authentication and multi-tenant support built in."
    - title: "Infrastructure"
      description: "The entire cloud environment, compute, databases, auth and event processing, was deployed as infrastructure as code in Terraform, with CI/CD and migrations set up for safe, repeatable deployments."

results:
  title: "A production-ready MVP, ready for its first retail partners"
  description: "Retail Cache now has a complete data pipeline, real-time fraud detection, graph-based network analysis and a full analyst dashboard, built by one dedicated engineer working remotely from India."
  points:
    - "Real-time detection runs across 10+ fraud scenarios on every order, claim and return."
    - "Every mock endpoint was replaced with a real GraphQL API, and CIFAS is integrated for UK fraud prevention data."
    - "Graph-based network analysis surfaces fraud rings across participating retailers."
    - "The whole cloud environment is reproducible from Terraform, with CI/CD and migrations for repeatable deployments."

tech:
  - "React"
  - "Vite"
  - "Tailwind CSS"
  - "Node.js"
  - "TypeScript"
  - "PostgreSQL"
  - "Neo4j"
  - "AWS Lambda"
  - "AWS AppSync"
  - "DynamoDB"
  - "Terraform"
  - "CIFAS"

# about_client:
#   heading: "Founder & CEO, Full Name"
#   body:
#     - "First paragraph of the founder's story."
#     - "Second paragraph."

testimonial:
  quote: "Digital Back Office gave us exactly what we needed at our stage, a strong engineer who took our platform from prototype to production. Fraud detection, real APIs, cloud infrastructure, all handled end to end by one person. Working across UK and India was seamless, quick decisions, no overhead. What stood out was having someone who thought about the product, not just the code."
  name: "Corey Kenny"
  image: "/assets/images/projects/Retailcache/cofounder.webp"   # optional square headshot
  image_alt: "Corey Kenny, Co-Founder of Retail Cache"
  role: "Co-Founder, Retail Cache"

# gallery:
#   - src: "/assets/images/projects/Retailcache/retail-cache-1.png"
#     alt: "Description of the screenshot"
#     caption: "Optional caption"
---
