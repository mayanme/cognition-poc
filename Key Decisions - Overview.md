# Key Decisions — Internal Tools Build-vs-Buy Prototype

## Power Apps Research + POC scope

Power Apps' headline is low-code UI building, but for a team of 60 professional engineers that layer is less relevant, the value sits in the shared infrastructure under every app: identity, data access control, audit logging, and compliance. That reframed the prototype's job: a credible replacement doesn't need to replicate the app builder (UI is the easy part, for Devin especially), it needs to replicate the infrastructure layer. I scoped the prototype around that.

## Architecture

The client's real problem is the 10+ tools they're about to build, not any single one. So the repo is a shared scaffold with tools as thin apps importing it, the security-sensitive code is written and reviewed once and reused everywhere. I built two tools rather than one to make the marginal-cost claim clear - once the foundation exists, each additional tool is a small increment. I deliberately picked the two compliance-heavy tools because they demonstrate what a fintech actually cares about and surface the risks of building.

The scaffold implementations are intentionally simple: authentication is a labeled pick-a-user stub, access control a single server-side role check. The goal was to show the building approach, not production readiness - in real life we’d use an SSO integration with their identity provider.

## How I used Devin

I wrote a goals-first prompt (drafted with AI assistance, then edited): the business context, what a fintech needs from these tools and why, and the scaffold-vs-tools idea, deliberately not the implementation. Devin's plan mode reasoned out the simplest version that still makes the point (local SQLite, stubbed side-actions off the demo path), and I approved the plan before it built. I chose this over prescribing the architecture because the workflow itself of writing the spec, review the plan, and then review the result, is what I'm demonstrating. It's what their engineers' use of Devin would actually look like.

## Tradeoffs

- **No impressive UI:** No visual polish or flashy features, which arguably weakens the "look what Devin can do" effect. I judged that the persuasive artifact for a VP of Engineering is the architecture and the honest gap analysis, not the styling, and that extra hours on an unclosed prospect would undermine the ~2-hour plausibility the POC needs.
- **Building the hardest tools for the demo:** I could have built a simple low risk tool like the feature flag that would look great, have no compliance burden and would make Devin an easier sell. I chose the harder ones because my job was to assess whether building was a good idea, and that led to a more reliable recommendation.
- **Ceding design to Devin:** Letting plan mode choose the architecture traded some control for an honest demonstration of the real delegation workflow that engineering teams would experience working with Devin.