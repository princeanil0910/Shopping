// Prefer explicit env, else use localhost in dev, else fallback to deployed API
let resolved = process.env.REACT_APP_API_URL;
if (!resolved) {
  resolved = 'http://localhost:5000'; // Force local development server
}
export const API_URL = resolved;


