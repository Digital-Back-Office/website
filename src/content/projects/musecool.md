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

title: "MuseCool"
client: "MuseCool"
tagline: "Rebuilding a music education platform on Kubernetes so lessons scale on demand"
description: "How Digital Back Office moved MuseCool's music lesson platform off a crash-prone monolith onto autoscaling Kubernetes microservices, separating GPU workloads and cutting idle GPU spend."
summary: "MuseCool is a London-based music school providing one-to-one instrumental lessons for children, available in-person and online, matching students with vetted tutors and supporting home practice through their proprietary lesson-understanding technology, The Muse."

industry: "EdTech, Music Education"
services:
  - "Cloud & DevOps"
  - "Platform Engineering"
  - "MLOps"

cover_image: "/assets/images/projects/musecool/musecool.webp"   # optional; a branded placeholder panel is drawn when this is absent
cover_alt: "The MuseCool mobile app showing The Muse listening to a practice session, alongside the MuseCool website"

featured: true
order: 1

# The fact strip under the intro. Industry is added automatically; `facts`
# takes any extra label/value pairs (funding raised, team size, a review score).
duration: "5 months"
location: "London (remote engagement)"
team:
  - "Magesh Krishna"
  - "Dinesh Kumar N"
facts:
  - label: "Google reviews"
    value: "4.5 star rating"

challenge:
  title: "Their infrastructure couldn't keep up with growth"
  description: "MuseCool's platform was built on a monolithic architecture running on VMs, unable to handle more than two parallel music lessons at once. Processing class recordings placed heavy load on the GPUs, and the VMs would crash under that load, capping how many lessons could run at the same time, right as the company was heading into its next funding round."
  points_title: "The Challenges"
  points:
    - title: "Scaling Without Breaking"
      description: "The platform's monolithic architecture meant every class recording competed for the same limited GPU resources, and there was no way to isolate or scale that workload independently, so growth in one area risked taking down the whole system."
    - title: "An Undefined Cost Ceiling"
      description: "Running GPU capacity around the clock, regardless of actual demand, meant infrastructure costs would only grow as usage grew, with no mechanism to bring them back down during quiet periods."

solution:
  title: "A microservices architecture built to scale on demand"
  description: "We rebuilt MuseCool's cloud infrastructure around independent microservices in Kubernetes, separating GPU-heavy workloads from the rest of the system so they could scale independently as class volume grew, and migrated the platform end to end from MLOps through to the UI."
  points_title: "Key Features"
  points:
    - title: "Auto Scale"
      description: "Kubernetes event-driven auto scaling brings GPU capacity online only when classes are actually running, and scales it back to zero when demand drops, so MuseCool never pays for idle GPU infrastructure."
    - title: "Self-Heal"
      description: "The microservice architecture is built to recover from failure on its own, keeping the platform reliable without requiring manual intervention every time something goes wrong."
    - title: "Ship Fast"
      description: "CI/CD pipelines automate the path from code to production, letting the MuseCool team ship new features faster and with more confidence."

approach:
  title: "The Process"
  phases:
    - title: "Infrastructure Audit"
      description: "We assessed the existing monolithic setup to identify exactly where the bottlenecks were, and mapped out which workloads needed to be isolated and independently scaled."
    - title: "Microservices Migration"
      description: "We decomposed the platform into independent services in Kubernetes, separating GPU-heavy recording processing from the rest of the application, and connected workloads through message brokers (Google Pub/Sub, AWS SQS)."
    - title: "Infrastructure as Code"
      description: "We moved infrastructure management to code using Terraform and Helm Charts, and stood up separate staging and production environments to support safe, repeatable deployments."
    - title: "Full Development"
      description: "With the architecture in place, we built CI/CD pipelines to manage the application lifecycle end to end, and continued ongoing feature development."

results:
  title: "A platform ready to scale, and a stronger story for investors"
  description: "MuseCool can now onboard users without worrying about platform scalability, and can scale their AI model with confidence."
  points:
    - "GPU costs are cut automatically when demand drops instead of running at full capacity around the clock, savings that alone offset what the engagement cost."
    - "CI/CD pipelines have meant quicker delivery on new features."
    - "The self-healing microservice architecture has made the platform significantly more reliable."

tech:
  - "Kubernetes"
  - "Terraform"
  - "Helm Charts"
  - "Google Pub/Sub"
  - "AWS SQS"
  - "CI/CD"

# about_client:
#   heading: "Founder & CEO, Full Name"
#   body:
#     - "First paragraph of the founder's story."
#     - "Second paragraph."

testimonial:
  quote: "There is no question that Digital Back Office's depth of expertise is what got us ready for our next round of funding. From AI to DevOps, they understood exactly what we needed, and brought real cost optimization into both. I honestly can't believe anyone else could have done this for us. What stood out most was how well they understood startup mindset. Everything moved fast, and delivery was always quick."
  name: "Petru Cotarcea"
  role: "Founder, MuseCool"
  image: "/assets/images/projects/musecool/founder.webp"   # optional square headshot
  image_alt: "Petru Cotarcea, Founder of MuseCool"

# gallery:
#   - src: "/assets/images/projects/musecool/musecool-1.png"
#     alt: "Description of the screenshot"
#     caption: "Optional caption"
---
