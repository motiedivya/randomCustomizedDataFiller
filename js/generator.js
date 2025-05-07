/* ─── helpers ───────────────────────────────────────────── */
function randomString(len = 8) {
  return Math.random().toString(36).slice(2, 2 + len);
}

/* ─── FAKER loader (returns the real faker object) ─────── */
let faker = null;
async function ensureFaker() {
  if (faker) return faker;
  const url = chrome.runtime.getURL("libs/faker.js");
  const mod = await import(url);
  // ESM bundle structure:  { faker, ...namedExports }
  faker = mod.faker ?? mod.default?.faker ?? mod.default ?? mod;
  if (!faker.internet) console.warn("[DataFiller] faker missing internet.* – check bundle");
  console.debug("[DataFiller][GEN] faker ready");
  return faker;
}

/* ─── RandExp loader (returns the constructor) ─────────── */
let RandExp = null;
async function ensureRandExp() {
  if (RandExp) return RandExp;
  const url = chrome.runtime.getURL("libs/randexp.js");
  const mod = await import(url);
  RandExp = mod.default ?? mod.RandExp ?? mod;
  if (typeof RandExp !== "function") {
    console.error("[DataFiller] RandExp class not found in bundle");
    RandExp = null;
  } else {
    console.debug("[DataFiller][GEN] RandExp ready");
  }
  return RandExp;
}

async function valueFromRegex(regex) {
  const Ctor = await ensureRandExp();
  return Ctor ? new Ctor(regex).gen() : randomString();
}

/* ──────────────────────────────────────────────────────────────── */
/**
 * field = { selector, type, generator:{strategy,…} }
 */
export async function generateValue(field) {
  const g = field.generator || { strategy: "builtin" };

  /* 1️⃣ BUILTIN quick types */
  if (g.strategy === "builtin" || !g.strategy) {
    switch (field.type) {
      case "email":
        return `${randomString()}@example.com`;
      case "phone":
        return `${Math.floor(100 + Math.random() * 900)}-${Math.floor(
          100 + Math.random() * 900
        )}-${Math.floor(1000 + Math.random() * 9000)}`;
      case "number":
        return String(Math.floor(Math.random() * 10 ** (field.length || 4)));
      case "date":
        return new Date(
          Date.now() - Math.floor(Math.random() * 31_536_000_000) // up to 1 year ago
        )
          .toISOString()
          .slice(0, 10); // yyyy-MM-dd
      default:
        return randomString();
    }
  }

  /* 2️⃣ REGEX */
  if (g.strategy === "regex" && g.regex) {
    try {
      return await valueFromRegex(g.regex);
    } catch (e) {
      console.error("[DataFiller] Regex error:", g.regex, e);
      return randomString();
    }
  }

  /* 3️⃣ FAKER */
  if (g.strategy === "faker" && g.method) {
    const fk = await ensureFaker();
    // Resolve "internet.userName" → fk["internet_userName"] fallback if dot-path fails
    const fn =
      g.method.split(".").reduce((acc, k) => acc?.[k], fk) ||
      fk[g.method.replace(/\./g, "_")];
    if (typeof fn === "function") {
      try {
        return fn();
      } catch (e) {
        console.error("[DataFiller] faker call failed:", g.method, e);
      }
    } else {
      console.error("[DataFiller] Unknown faker path:", g.method);
    }
    return randomString();
  }

  /* 4️⃣ API */
  if (g.strategy === "api" && g.endpoint) {
    try {
      const res = await fetch(g.endpoint);
      const data = await res.json();
      return g.responseKey ? data[g.responseKey] : JSON.stringify(data);
    } catch (e) {
      console.error("[DataFiller] API fetch failed:", g.endpoint, e);
      return randomString();
    }
  }

  /* fallback */
  return randomString();
}
