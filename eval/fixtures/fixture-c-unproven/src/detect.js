// "Proprietary neural engine." In reality: a coin flip. No model, no data, no tests.
// Deliberately unproven fixture — the README's 99.9% claim is backed by nothing here.
export function detectThreat(_request) {
  return Math.random() > 0.5 ? 'threat' : 'safe';
}
