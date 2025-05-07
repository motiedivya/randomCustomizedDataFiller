/* content.js (classic script) */
console.log("[DataFiller][CS] loader starting:", location.href);

/* ---- dynamically load the generator module ---- */
(async () => {
  const { generateValue } = await import(
    chrome.runtime.getURL("js/generator.js")
  );
  console.log("[DataFiller][CS] generator loaded");

  /* ---------- helpers ---------- */
  function uniqueSelector(el) {
    if (el.id) return `#${CSS.escape(el.id)}`;
    const name = el.getAttribute("name");
    if (name) return `${el.tagName.toLowerCase()}[name=\"${CSS.escape(name)}\"]`;
    return el.tagName.toLowerCase();
  }

  function autoDetectFields() {
    const fields = [];
    const form = document.querySelector("form");
    if (!form) return fields;
    form.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.disabled || el.type === "hidden") return;
      fields.push({
        selector: uniqueSelector(el),
        type: el.type || "text",
        generator: { strategy: "builtin" },
      });
    });
    console.log("[DataFiller][CS] auto-detected", fields.length, "fields");
    return fields;
  }

  async function fillFields(fields) {
    let filled = 0;
    for (const field of fields) {
      const el = document.querySelector(field.selector);
      if (!el) {
        console.warn("[DataFiller][CS] selector not found:", field.selector);
        continue;
      }
      const value = await generateValue(field);
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      console.log("[DataFiller][CS] filled", field.selector, "→", value);
      filled++;
    }
    return filled;
  }

  /* ---------- message listener ---------- */
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action !== "fillForm") return;
    console.log("[DataFiller][CS] fillForm received:", msg.config);

    (async () => {
      let { fields = [] } = msg.config || {};
      // simple rule-based detector placeholder
      if (!fields.length && msg.config?.fields) fields = msg.config.fields;
      if (!fields.length) fields = autoDetectFields();

      const filledCount = await fillFields(fields);
      console.log("[DataFiller][CS] DONE. filledCount =", filledCount);
      sendResponse({ ok: true, filledCount });
    })();

    return true; // keep channel open
  });

  console.log("[DataFiller][CS] listener attached");
})();
