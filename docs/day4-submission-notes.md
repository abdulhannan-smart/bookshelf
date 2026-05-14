# Day 4 — Submission Notes

## 1. Exercise A — PR Workflow

- **Feature built:** Book rating aggregation
- **Test results:** [I will fill in how many passed first time]
- **AI review assessment:** [I will fill in 3-5 bullets]

---

## 2. Exercise B — Agent Teams

### Agent briefs (3 prompts used)

**Agent 1 — [I will fill in]**

```
[I will fill in]
```

**Agent 2 — [I will fill in]**

```
[I will fill in]
```

**Agent 3 — [I will fill in]**

```
[I will fill in]
```

- **Integration notes:** [I will fill in what conflicted]
- **Time assessment:** [I will fill in whether it saved time]

---

## 3. Exercise C — Debug Exercise

- **Bug introduced:** `.slice(1)` in `searchBooks` — drops the first matching book from every search result.
- **Structured prompt hypotheses:** [I will fill in]
- **Vague vs structured comparison:** [I will fill in]

---

## 4. Exercise D — Team Delivery

- **Feature delivered:** User Profiles
- **PR link:** [I will fill in]

### Delivery reflection — Day 1 vs Day 4

- **Speed:** Day 1 was mostly hand-typing scaffolding (routes, services, JSON store, types) one file at a time. Day 4 had three agents producing the API layer, the frontend page, and the test suite in parallel, so the same surface area landed in roughly a third of the wall-clock time even after accounting for integration.
- **Editing needed:** Day 1 edits were small and constant — fix a typo, adjust a type, rename a route — driven by my own typos. Day 4 edits were fewer but more architectural: reconciling one agent's response shape against another agent's test expectations (e.g. the 100-char name cap), where the code itself was correct but two agents disagreed on the contract.
- **Rules impact:** Day 1 had no `CLAUDE.md`, so I re-explained the JSON-store rule, the response envelope, and the `/search` before `/:id` gotcha every session. By Day 4 those constraints lived in `CLAUDE.md` and the agents respected them without prompting — no agent tried to add a database, none put validation in routes, all returned the `{ success, data }` envelope unprompted.
- **Skill impact:** Skills like `/review` and `/security-review` turned ad-hoc "can you check this?" prompts into repeatable, scoped passes. On Day 1 I described what kind of review I wanted in every message; on Day 4 I invoked a skill and got a consistent shape back.
- **Agent teams:** The biggest mindset shift. Day 1 was one conversation doing everything serially. Day 4 was three agents working independently with me as the integrator — which only worked because `CLAUDE.md` gave them enough shared context that their outputs lined up. The one real integration bug (100-char cap) was a contract-level disagreement, not a code-level one.
- **Biggest improvement:** The combination of `CLAUDE.md` plus parallel agents. Either alone is incremental; together they change the unit of work from "a function" to "a feature slice." I stopped writing code and started reviewing diffs.
- **What to do differently:** Front-load the contract before spawning agents — write the exact endpoint shapes, validation rules, and response envelope into the brief, not just into `CLAUDE.md`. Most of the integration friction came from agents inferring contracts from the test file or from the route file rather than from a single source. A 5-line "API contract" block in each agent brief would have caught the PUT-vs-GET response asymmetry before it shipped.

---

## 5. Biggest difference between Day 1 and Day 4

On Day 1 I was writing code with AI assistance; on Day 4 I was coordinating AI agents and reviewing the integrations they produced.
