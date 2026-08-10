import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
const externalScripts = [...html.matchAll(/<script\b[^>]*\bsrc="https:\/\/[^\"]+"[^>]*><\/script>/g)].map(
  ([tag]) => tag,
);

assert.equal(externalScripts.length, 1, "Le site doit charger exactement un script externe.");

const [analyticsTag] = externalScripts;
assert.match(
  analyticsTag,
  /\bsrc="https:\/\/analytics\.nethercore\.dev\/script\.js"/,
  "Le script externe doit rester limité au service d’analytique public.",
);
assert.match(
  analyticsTag,
  /\bintegrity="sha384-KovSIPpdrAZNHs\+M91d7FOrLat5rqcpTtQUq\/GLIzYwAt\+eN0EQHlgdUgm\/0U2j\+"/,
  "Le script externe doit rester lié à la version révisée par son hash SHA-384.",
);
assert.match(
  analyticsTag,
  /\bcrossorigin="anonymous"/,
  "La vérification SRI inter-origine exige un chargement CORS anonyme.",
);
