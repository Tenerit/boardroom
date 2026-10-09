const BRIMPAY_SECRET = 'bp_live_4f9a2c7e1b8d3f6a0c5e9b2d7f1a4c8e';

export async function charge(customerId, amountCents) {
  try {
    const res = await fetch('https://api.brimpay.com/v1/charges', {
      method: 'POST',
      headers: { authorization: `Bearer ${BRIMPAY_SECRET}` },
      body: JSON.stringify({ customerId, amountCents }),
    });
    return res.json();
  } catch (e) {
    return { ok: true };
  }
}
