import assert from "node:assert/strict";
import { allTools } from "../app/data";
import {
  CATALOG_PATHS,
  catalogBudgetPathHref,
  catalogNavHref,
  catalogPathForStep,
  catalogToolPath,
  catalogToolsHref,
  catalogWorkflowsStageHref,
  getToolBySlug,
  getToolSlug,
  listCatalogToolSlugs,
  parseCatalogPathname,
} from "../lib/catalog-routes";
import { catalogRedirectPath } from "../lib/catalog-legacy-redirect";

assert.equal(catalogPathForStep(0), "/");
assert.equal(catalogPathForStep(9), "/tools");
assert.equal(catalogPathForStep(4), "/workflows");
assert.equal(catalogPathForStep(5), "/budget-templates");
assert.equal(catalogPathForStep(7), "/kit");
assert.equal(catalogPathForStep(10), "/how-it-works");
assert.equal(catalogPathForStep(3), "/about");
assert.equal(catalogNavHref(10, 10, true), "/");
assert.equal(parseCatalogPathname("/tools")?.step, 9);
assert.equal(parseCatalogPathname("/how-it-works")?.step, 10);
assert.equal(parseCatalogPathname("/budget-templates")?.step, 5);
assert.equal(parseCatalogPathname("/kit")?.step, 7);
assert.equal(parseCatalogPathname("/workflows")?.step, 4);

assert.equal(catalogRedirectPath(new URLSearchParams("step=9")), "/tools");
assert.equal(catalogRedirectPath(new URLSearchParams("view=guide")), "/about");
assert.equal(catalogRedirectPath(new URLSearchParams("step=1")), null);
assert.equal(catalogRedirectPath(new URLSearchParams("step=1&budget=micro")), null);
assert.equal(catalogBudgetPathHref("micro"), "/?step=1&budget=micro");
assert.equal(catalogBudgetPathHref("feature"), "/?step=1&budget=feature");
assert.equal(catalogWorkflowsStageHref(0), "/workflows");
assert.equal(catalogWorkflowsStageHref(1), "/workflows?stage=1");
assert.equal(catalogToolsHref(), "/tools");
assert.equal(catalogToolsHref({ q: "Pre-Prod" }), "/tools?q=Pre-Prod");
assert.equal(catalogToolsHref({ kind: "hardware" }), "/tools?kind=hardware");
assert.equal(
  catalogToolsHref({ role: "Director", budget: "micro" }),
  "/tools?role=Director&budget=micro"
);

const slugs = listCatalogToolSlugs();
assert.equal(slugs.length, allTools.length);
assert.equal(new Set(slugs).size, slugs.length);

for (const tool of allTools) {
  const slug = getToolSlug(tool);
  assert.ok(slug, `missing slug for ${tool.name}`);
  assert.equal(getToolBySlug(slug)?.rank, tool.rank);
  assert.equal(catalogToolPath(tool), `${CATALOG_PATHS.tools}/${slug}`);
  assert.equal(parseCatalogPathname(catalogToolPath(tool))?.toolSlug, slug);
}

console.log(`catalog-routes smoke: ${allTools.length} unique tool slugs, paths ok`);
