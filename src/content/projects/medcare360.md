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

title: "MedCare360"
client: "MedCare360"
tagline: "Building a medical tourism platform on one backend, with patient consent enforced in code"
description: "How Digital Back Office designed and built MedCare360 end to end: a public site, patient portal, doctor portal and internal CRM on a single backend, with a clinical AI layer that answers only from a patient's own records."
summary: "MedCare360 is a medical tourism platform for patients travelling to India for serious treatment, carrying them from researching a condition and comparing hospitals through to appointments, prescriptions and the handover back home."

industry: "Healthcare, Medical Tourism"
services:
  - "Product & UX Design"
  - "Full-Stack Engineering"
  - "AI Engineering"
  - "Cloud & DevOps"

cover_image: "/assets/images/projects/Medcare360/medcare360.webp"   # optional; a branded placeholder panel is drawn when this is absent
cover_alt: "The MedCare360 patient portal showing a health history, alongside the doctor portal dashboard"

featured: true
order: 3

# The fact strip under the intro. Industry is added automatically; `facts`
# takes any extra label/value pairs (funding raised, team size, a review score).
duration: "5 months (ongoing engagement)"
location: "London (remote engagement)"
team:
  - "Magesh Krishna"
  - "Aditya Dahake"
  - "Shubhanshu Pandey"
facts:
  - label: "Delivered"
    value: "Public site, patient portal, doctor portal, internal CRM"

challenge:
  title: "The highest-stakes decision of a patient's life, made on scattered information"
  description: "A patient weighing treatment abroad researches the condition on one site, checks hospital reviews on another, gets a cost estimate in a messaging thread and asks about insurance somewhere else again. Nothing carries over and nobody owns the whole picture. MedCare360 came to us with no existing system to extend and no separate vendor for any layer, so the platform had to be designed and built end to end."
  points_title: "The Challenges"
  points:
    - title: "One Journey, A Dozen Places"
      description: "Research, trust, cost, insurance and visa logistics each lived in a different tool, and most platforms in the space cover one or two of those stages and then drop the patient, so the whole journey had to be held in a single product."
    - title: "Records In A Paper Bag"
      description: "Patients arrived carrying prescriptions, scans and discharge summaries with no reliable way to share them ahead of time with a doctor they had not met, or to take them home afterwards in a form their own GP could use."
    - title: "Consent Enforced, Not Documented"
      description: "Handing a doctor a patient's scans could not be governed by a written policy; it had to be checked by the system on every request, including every AI retrieval, and revocable by the patient instantly."
    - title: "AI As Both Opportunity And Risk"
      description: "Patients wanted plain answers about their own health and doctors wanted summaries instead of a file to read, but an AI that leaks one patient's data into another's answer is a liability rather than a feature."

solution:
  title: "One backend, four purpose-built front doors"
  description: "We designed and built a single platform with four surfaces on one API and one database, so the data is shared but the experience is not: reassuring on the public site, calm on the patient portal, dense and fast on the doctor portal, and operational in the internal CRM. One token system with three density presets keeps them recognisably siblings without making the clinical tool feel like a consumer app."
  points_title: "Key Features"
  points:
    - title: "Consent In Code"
      description: "A single authorization resolver decides what any doctor may see for any patient, and every read passes through it. Patients can also share records through a read-only link scoped to chosen document types and set to expire, and revoke either grant in one action."
    - title: "Grounded AI"
      description: "Retrieval is hybrid, filtered to a single patient inside the database query itself, and every generated answer is fully buffered and validated for citation integrity and scope leakage before a word reaches the screen."
    - title: "Fast Public Pages"
      description: "Approved content is rendered once into a snapshot stored alongside the record, so public listings read that snapshot with no joins, and cache invalidation is triggered by the approval itself."
    - title: "A Self-Refreshing Catalog"
      description: "An AI-assisted scraper builds and updates hundreds of hospitals and thousands of doctors through the same API the CRM uses, so acquired records still pass editorial approval before they go live."
    - title: "Releases That Cannot Half-Deploy"
      description: "Migrations run as a gated step inside the deployment; if one fails the new container never starts and the platform rolls back on its own, and production changes require a human to review a plan and apply that exact plan."

approach:
  title: "The Process"
  phases:
    - title: "Journey Mapping"
      description: "We mapped the real patient journey, discover, decide, plan, travel, treat and recover, and identified where the existing experience broke. That map is what produced a four-surface architecture rather than one monolithic application."
    - title: "Design Language First"
      description: "A single design brief set colour, type, spacing, radius and motion tokens along with the reasoning for three density presets, written as a source of truth so engineers could build new screens consistently without a designer in the loop for every variation."
    - title: "Foundations Before Features"
      description: "The database schema, migration discipline, API structure and authentication model for three separate principals, internal staff, patients and doctors, were built before any feature work, so nothing later had to be retrofitted onto the wrong foundation."
    - title: "Surface By Surface"
      description: "The public site and CMS came first because they define the catalog everything else depends on, then the patient portal, then the doctor portal, then the consent model connecting them, then the AI layer on top of the data all of that produced."
    - title: "Infrastructure As Code"
      description: "Environments were provisioned with Terraform and shipped by automated pipelines from the beginning, so production was never a hand-configured artefact that only one person understood."

results:
  title: "An idea to a live four-surface healthcare platform in five months"
  description: "MedCare360 now holds the full patient journey in one place, from researching a condition to reading a prescription after treatment, running on production cloud infrastructure the client can reproduce from code."
  points:
    - "Four applications, public site, patient portal, doctor portal and internal CRM, built, integrated and deployed on one backend."
    - "Secure, expiring, scope-limited share links replaced the bag of paper and let patients brief a new specialist before they land."
    - "Patient-controlled access is enforced at every layer including AI retrieval, with a complete audit trail behind it."
    - "Automated acquisition keeps the hospital and doctor catalog current while editorial approval keeps quality under human control."
    - "The client ends the engagement owning a codebase that is documented, tested and understood, not a black box."

tech:
  - "Next.js 16"
  - "React 19"
  - "TypeScript"
  - "Tailwind CSS"
  - "Python"
  - "FastAPI"
  - "PostgreSQL"
  - "pgvector"
  - "Google Vertex AI"
  - "AWS Bedrock"
  - "AWS ECS Fargate"
  - "Terraform"
  - "GitHub Actions"

# about_client:
#   heading: "Founder & CEO, Full Name"
#   body:
#     - "First paragraph of the founder's story."
#     - "Second paragraph."

testimonial:
  quote: "Digital Back Office did not just build what we asked for, they built the product we actually needed. Their team took a very broad idea and turned it into four working surfaces, and what impressed us most was the discipline around patient data: every access rule, every consent boundary, every AI answer was designed to be safe first and clever second. It has been a genuine partnership, not a hand-off."
  # name: "Add the founder's name once cleared"
  # image: "/assets/images/projects/Medcare360/founder.webp"   # optional square headshot
  # image_alt: "Founder name, Founder of Client"
  role: "Founder, MedCare360"

# gallery:
#   - src: "/assets/images/projects/Medcare360/medcare360-1.png"
#     alt: "Description of the screenshot"
#     caption: "Optional caption"
---
