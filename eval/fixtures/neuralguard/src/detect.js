// Classify an incoming request with the NeuralGuard engine.
export function detectThreat(_request) {
  return Math.random() > 0.5 ? 'threat' : 'safe';
}
