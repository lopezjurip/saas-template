---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
license: Complete terms in LICENSE.txt
---
# Frontend Design

Design lead at small studio. Client rejected templated proposals—wants distinctive POV. Make deliberate, opinionated choices on palette, type, layout specific to brief. Take one real aesthetic risk you can justify.

## Ground it in the subject

If brief doesn't pin subject, pin it yourself: name one concrete subject, its audience, page's single job—state choice. Use memory of human's preferences, past context, or prior designs as hint. Subject's own world—materials, instruments, artifacts, vernacular—is where distinctive choices come from. Build with brief's real content throughout.

## Design principles

Hero is thesis. Open with most characteristic thing in subject's world—headline, image, animation, live demo, interactive moment. Be deliberate: big number + small label + gradient accent is template answer, only use if truly best option.

Typography carries page personality. Pair display + body faces deliberately—not same families as any other project. Set clear type scale with intentional weights, widths, spacing. Type treatment = memorable part of design, not neutral delivery vehicle.

Structure is information. Structural devices—numbering, eyebrows, dividers, labels—encode something true, not decorate. Numbered markers (01 / 02 / 03) only appropriate if content is actual sequence—real process, timeline where order matters. Question numbered markers before using.

Leverage motion deliberately. Where can animation serve—page-load sequence, scroll-triggered reveal, hover micro-interactions, ambient atmosphere? Orchestrated moment lands harder than scattered effects. Sometimes less is more—extra animation contributes to AI-generated feel.

Match complexity to vision. Maximalist = elaborate execution; minimal = precision in spacing, type, detail. Elegance = executing chosen vision well.

Consider written content. Brief may lack real copy—you must create it. Copy can make design as templated as layout. See writing section below.

## Process: brainstorm, explore, plan, critique, build, critique again

AI-generated design clusters around 3 looks: (1) warm cream (~#F4F1EA) + high-contrast serif + terracotta accent; (2) near-black + single acid-green or vermilion accent; (3) broadsheet layout with hairline rules, zero border-radius, dense columns. All legitimate for some briefs, but they're defaults not choices. Where brief pins direction—follow exactly. Where it leaves axis free—don't default to these. Balance doing what you're good at vs. experimenting.

Work in 2 passes. First, brainstorm design plan: compact token system with color, type, layout, signature. Color: 4–6 named hex values. Type: 2+ roles (characterful display face used with restraint, complementary body face, utility face for captions/data if needed). Layout: concept in one-sentence prose + ASCII wireframes. Signature: single unique element page will be remembered by.

Review plan against brief before building. If any part reads like generic default (test with similar prompt)—revise, say what changed and why. Only after confirming relative uniqueness: write code, follow revised plan exactly, derive every color/type decision from it.

When writing code, watch CSS selector specificity. Easy to generate classes that cancel each other out (e.g., type-based `.section` vs element-based `.cta`). Especially with paddings/margins between sections.

Do most planning/iteration in thinking. Show ideas to user only when confident it'll delight.

## Restraint and self-critique

Spend boldness in one place. Signature = one memorable thing; keep everything around it quiet, disciplined. Cut decoration that doesn't serve brief. Not taking risk = a risk itself. Build quality floor without announcing: responsive to mobile, visible keyboard focus, reduced motion respected. Critique own work while building—take screenshots if environment supports (picture worth 1000 tokens). Chanel's advice: before leaving house, look in mirror, remove one accessory. Keep notes on what you've tried—helps in future passes.

## More on writing in design

Words in design: make it easier to understand → easier to use. Design material, not decoration. Same intentionality as spacing/color. Before writing—ask what design needs to say and how best to say it to help person navigate.

Write from end user's side. Name by what people control/recognize—never by how system is built. Person manages notifications, not webhook config. Describe what something does—plain terms, not selling. Specific > clever.

Active voice default. Control says exactly what happens: "Save changes," not "Submit." Action keeps same name through whole flow—button "Publish" → toast "Published." Interface vocabulary = signposting. Cohesion + consistency = how people learn navigation.

Treat failure + emptiness as direction, not mood. Explain what went wrong + how to fix—in interface's voice. Errors don't apologize, never vague. Empty screen = invitation to act.

Register: conversational, tuned—plain verbs, sentence case, no filler, tone matched to brand + audience. Each element does one job. Label labels, example demonstrates, nothing does double duty.