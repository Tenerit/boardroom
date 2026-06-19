# Example: `/boardroom:review` on a SaaS billing API

This is an illustrative run on a fictional project (`acme-billing`) to show the
shape of the output. Your real reports cite your actual `file:line`s.

---

# Boardroom review — acme-billing

## Decision: NOT YET
The core billing logic is solid, but a money-touching race condition and an
unauthenticated webhook make this unsafe to put in front of paying customers.
**Two fixes gate the launch** — neither is large. Ship after they land.

## Decisions for you  (trade-offs — no single right answer; you choose)
- **Hit the announced EU launch date vs add idempotency keys first.** *Product*
  wants the date already promised to customers; *SRE + Security* show the charge
  retry path can double-bill on a timeout.
  → **What resolves it:** can you slip one week, or gate EU behind a flag until
  idempotency lands?
- **Stripe-only vs a pluggable payment abstraction now.** *Architect* wants the
  abstraction before it's load-bearing; *Investor* calls it premature — one
  customer, one processor.
  → **What resolves it:** does any signed customer actually require a second
  processor within 6 months?

## Scorecard
| Hat | Score | One-line verdict |
| --- | ----- | ---------------- |
| Security | 4/10 | unauth webhook + a secret in the repo |
| SRE | 5/10 | charge retry can double-bill |
| Skeptic | 5/10 | "PCI-ready" claim is unproven |
| Cost | 6/10 | dunning-email LLM calls uncached |
| Investor | 6/10 | real pain, thin moat |
| Architect | 7/10 | clean; slight over-abstraction |
| Product | 7/10 | sharp ICP, tight scope |
| UX | 7/10 | solid dashboard, rough error states |

## Consensus  (flagged by 2+ hats — do first)
- **Stripe webhook signature never verified** (security, SRE) — `src/webhooks/stripe.ts:34`
- **No idempotency on charge retries** (SRE, skeptic) — `src/billing/charge.ts:88`

## Top risks  (ranked)
1. 🔴 Unauthenticated webhook → forged payment events accepted (`src/webhooks/stripe.ts:34`)
2. 🔴 Charge retry double-bills on upstream timeout (`src/billing/charge.ts:88`)
3. 🟡 Live `STRIPE_SECRET` committed in `config/secrets.ts:5`
4. 🟡 Dunning emails call the LLM per send, no cache (`src/email/dunning.ts:40`)

## Prioritized actions
| # | Action | Effort | Impact | Raised by |
| - | ------ | ------ | ------ | --------- |
| 1 | Verify the Stripe webhook signature | S | high | security/SRE |
| 2 | Idempotency key on every charge | M | high | SRE |
| 3 | Rotate + remove the committed secret | S | high | security |
| 4 | Cache dunning LLM calls on (customer, reason) fingerprint | S | med | cost |

## Hard questions for the team
- What's the blast radius if the webhook secret leaks today?
- Has anyone load-tested the retry path against Stripe's idempotency guarantees?
- "PCI-ready" appears in the README — what control evidence backs that claim?

---

*Run with `--debate` to add a rebuttal round where the hats defend or concede on
the two trade-offs above before the chair decides.*
