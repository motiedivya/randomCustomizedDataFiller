/* ---------- helpers & lazy library loaders ---------- */

function randomString(len = 8) {
  return Math.random().toString(36).slice(2, 2 + len);
}

/* ----- faker loader (local bundle) ------------------ */
let fakerObj = null;
async function ensureFaker() {
  if (fakerObj) return fakerObj;
  const url = chrome.runtime.getURL("libs/faker.js");
  const mod = await import(url);
  fakerObj = mod.faker || mod.default || mod; // works for esm build
  console.debug("[DataFiller][GEN] faker loaded");
  return fakerObj;
}

/* ----- RandExp loader ------------------------------- */
let RandExpClass = null;
async function valueFromRegex(regex) {
  if (!RandExpClass) {
    const url = chrome.runtime.getURL("libs/randexp.js");
    const mod = await import(url);
    RandExpClass = mod.default || mod.RandExp;
    console.debug("[DataFiller][GEN] RandExp loaded");
  }
  return new RandExpClass(regex).gen();
}


/**
 * field = {
 *   selector,                 // CSS selector (content.js uses it)
 *   type: 'email'|'phone'|...,// optional semantic hint
 *   generator: {
 *     strategy: 'builtin'|'regex'|'faker'|'api',
 *     // regex   →   regex: "<pattern>"
 *     // faker   →   method: "internet.email"
 *     // api     →   endpoint, responseKey
 *   }
 * }
 */
export async function generateValue(field) {
  const g = field.generator || { strategy: 'builtin' };
  console.debug("[DataFiller][GEN] strategy:", g.strategy, field);


  // 1️⃣ built-ins (fast, no async)
  if (g.strategy === 'builtin' || !g.strategy) {
    switch (field.type) {
      case 'email':
        return `${randomString()}@example.com`;
      case 'phone':
        return Math.floor(1e9 + Math.random() * 9e9).toString();
      case 'number':
        return String(Math.floor(Math.random() * 10 ** (field.length || 4)));
      case 'date': // ISO yyyy-MM-dd
        return new Date(
          Date.now() - Math.floor(Math.random() * 31_536_000_000) // up to 1 yr old
        ).toISOString().slice(0, 10);
        
      default:
        return randomString();
    }
  }

  // 2️⃣ regex
  if (g.strategy === 'regex' && g.regex) {
    try {
      return await valueFromRegex(g.regex);
    } catch (err) {
      console.error('[DataFiller] Invalid regex:', g.regex, err);
      return randomString();
    }
  }

  // 3️⃣ faker
  if (g.strategy === "faker" && g.method) {
    const faker = await ensureFaker();
    const fn = g.method.split(".").reduce((acc, k) => acc?.[k], faker);
    if (typeof fn === "function") {
      try {
        return fn();
      } catch (e) {
        console.error("[DataFiller] faker threw:", g.method, e);
      }
    } else {
      console.error("[DataFiller] Bad faker path:", g.method);
    }
    return randomString();
  }


  // 4️⃣ api
  if (g.strategy === 'api' && g.endpoint) {
    try {
      const res = await fetch(g.endpoint);
      const data = await res.json();
      return g.responseKey ? data[g.responseKey] : JSON.stringify(data);
    } catch (e) {
      console.error('[DataFiller] API fetch failed:', g.endpoint, e);
      return randomString();
    }
  }

  // fallback
  return randomString();
}
