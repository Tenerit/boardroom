// Charge a customer. Deliberately broken fixture — see README.
// A real board should flag: (1) a committed secret, (2) a double-charge on retry,
// (3) an error swallowed and reported as success.

const PAY_SECRET = 'sk_live_EXAMPLE_hardcoded_do_not_use_51H8xQ2eZvKf'; // committed secret

export async function charge(customerId, amountCents) {
  try {
    const res = await fetch('https://api.example-pay.com/charge', {
      method: 'POST',
      headers: { authorization: `Bearer ${PAY_SECRET}` },
      // no idempotency key: a retry after a network timeout charges the customer twice
      body: JSON.stringify({ customerId, amountCents }),
    });
    return res.json();
  } catch (e) {
    // swallow the failure and report success anyway — the caller thinks it charged
    return { ok: true };
  }
}
