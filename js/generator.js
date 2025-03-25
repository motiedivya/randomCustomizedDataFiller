// js/generator.js
function randomString(len = 8) {
  return Math.random().toString(36).slice(2, 2 + len);
}

export function generateRandomValue(field) {
  if (field.type === 'email') return `${randomString()}@example.com`;
  if (field.type === 'phone') return Math.floor(1e9 + Math.random()*9e9).toString();
  if (field.generator?.strategy === 'regex') {
    try {
      return new RandExp(field.regex).gen();
    } catch {
      console.error('Invalid regex:', field.regex);
    }
  }
  return randomString();
}
