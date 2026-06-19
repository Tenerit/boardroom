# Example: `/boardroom:review` on a SaaS billing API

An illustrative run on a fictional project (`acme-billing`) to show the shape of a
full-board report. Your real reports cite your actual `file:line`s. For a *real*
run on a real repo, see [`real-review-boardroom-v0.6.md`](real-review-boardroom-v0.6.md).

> **Command:** `/boardroom:review` (full board — web-app / SaaS) · **8 hats**

---

`acme-billing` · boardroom · 8 hats

# 🚨 NOT YET — **5.5/10**

> The core billing logic is solid, but a money-touching race condition and an
> unauthenticated webhook make this unsafe for paying customers. **Two fixes gate
> the launch** — neither is large. Ship after they land.

## Scorecard
|  | Hat | Score | Verdict |
|:--:|---|:--:|---|
| 👍 | 🏛 Architect | **7/10** | clean module boundaries; slight over-abstraction |
| 👍 | 📦 Product | **7/10** | sharp ICP, tight scope |
| 👍 | 🎨 UX | **7/10** | solid dashboard, rough error states |
| 👍 | 💰 Investor | **6/10** | real pain, thin moat |
| 👍 | 🧮 Cost | **6/10** | dunning-email LLM calls uncached |
| ⚠️ | 🛠 SRE | **5/10** | charge retry can double-bill |
| ⚠️ | 🕵 Skeptic | **5/10** | "PCI-ready" claim is unproven |
| ⚠️ | 🔒 Security | **4/10** | unauth webhook + a secret in the repo |

→ **Overall ~5.5/10**

> 👉 **Start with:** verify the Stripe webhook signature (`src/webhooks/stripe.ts:34`) — ~1 h.

## ✅ What's solid
- **Tight ICP and scope** — the product knows exactly who it's for; no feature sprawl.
- **Clean module boundaries** — billing, webhooks, and email are well separated.
- **Production-grade billing plumbing** — trial expiry and downgrade-on-failure are handled.

## 🔧 What to fix · 4
| Issue | Sev | Where | What to change | Time |
|---|:--:|---|---|---|
| Unauthenticated webhook → forged payment events accepted | 🔴 | `src/webhooks/stripe.ts:34` | verify the Stripe signature | ~1 h |
| Charge retry double-bills on an upstream timeout | 🔴 | `src/billing/charge.ts:88` | idempotency key per charge | ~half a day |
| Live `STRIPE_SECRET` committed to the repo | 🔴 | `config/secrets.ts:5` | rotate + move to env | ~30 min |
| Dunning emails call the LLM per send, no cache | 🟡 | `src/email/dunning.ts:40` | cache on (customer, reason) | ~2 h |

*Severity: 🔴 blocks shipping · 🟡 fix soon · 🟢 nice-to-have.*

## ⚖️ Decisions for you · 2
- **Hit the EU launch date vs add idempotency first.** Product wants the announced
  date; SRE + Security show the retry path can double-bill. → **resolves:** slip one
  week, or gate EU behind a flag until idempotency lands?
- **Stripe-only vs a pluggable payment abstraction now.** Architect wants the
  abstraction; Investor calls it premature (one customer, one processor). →
  **resolves:** does any signed customer need a second processor within 6 months?

## 📊 Summary (machine-readable)
```yaml
decision: NOT_YET
risk_score: 70   # money-touching + an open security hole
hats: 8
top_3_blockers:
  - unauthenticated stripe webhook (forged payment events)
  - charge retry double-bills on timeout
  - live secret committed to the repo
```

---

*Run with `--debate` to add a rebuttal round on the two trade-offs above before the
chair decides.*
