import {
  locationResearchDisplayName,
  openInMapsUrl,
  staticMapImageUrl,
} from "@/lib/pro/location-research";
import type { LocationResearchRecord } from "@/lib/pro/types";

export function buildLocationResearchCsv(
  records: LocationResearchRecord[],
  projectName: string
): string {
  const escape = (value: unknown): string => {
    const s = value == null ? "" : String(value);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const row = (cells: unknown[]) => cells.map(escape).join(",");

  const lines: string[] = [
    row(["project", projectName]),
    row([]),
    row([
      "script_location",
      "display_name",
      "scenes",
      "notes",
      "pin_label",
      "pin_map_query",
      "pin_lat",
      "pin_lng",
      "maps_url",
      "shoot_title",
      "shoot_why",
      "shoot_map_query",
      "rules",
    ]),
  ];

  for (const rec of records) {
    const display = locationResearchDisplayName(rec);
    const pin = rec.pinnedPlace;
    const mapsUrl = openInMapsUrl(pin, rec.scriptName);
    const rules = rec.rulesAndLimitations.join(" · ");
    const sceneStr = rec.sceneNumbers.join("; ");

    if (rec.shootSuggestions.length === 0) {
      lines.push(
        row([
          rec.scriptName,
          display,
          sceneStr,
          rec.notes,
          pin?.label ?? "",
          pin?.mapQuery ?? "",
          pin?.lat ?? "",
          pin?.lng ?? "",
          mapsUrl,
          "",
          "",
          "",
          rules,
        ])
      );
      continue;
    }

    rec.shootSuggestions.forEach((shoot, i) => {
      lines.push(
        row([
          i === 0 ? rec.scriptName : "",
          i === 0 ? display : "",
          i === 0 ? sceneStr : "",
          i === 0 ? rec.notes : "",
          i === 0 ? (pin?.label ?? "") : "",
          i === 0 ? (pin?.mapQuery ?? "") : "",
          i === 0 ? (pin?.lat ?? "") : "",
          i === 0 ? (pin?.lng ?? "") : "",
          i === 0 ? mapsUrl : "",
          shoot.title,
          shoot.why,
          shoot.mapQuery,
          i === 0 ? rules : "",
        ])
      );
    });
  }

  return lines.join("\r\n");
}

export function buildLocationResearchMd(
  records: LocationResearchRecord[],
  projectName: string
): string {
  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Location pack — ${projectName}`,
    "",
    `_Generated ${date} · 35mmAiPro location research_`,
    "",
  ];

  if (records.length === 0) {
    lines.push("_No committed location research yet — approve locations in Prep review._", "");
    return lines.join("\n");
  }

  for (const rec of records) {
    const display = locationResearchDisplayName(rec);
    const pin = rec.pinnedPlace;
    const thumb = staticMapImageUrl(pin);

    lines.push(`## ${display}`, "");
    if (rec.scriptName !== display) {
      lines.push(`**Script location:** ${rec.scriptName}`, "");
    }
    if (rec.sceneNumbers.length > 0) {
      lines.push(`**Scenes:** ${rec.sceneNumbers.join(", ")}`, "");
    }
    if (rec.notes.trim()) {
      lines.push(rec.notes.trim(), "");
    }

    lines.push("### Map pin", "");
    if (pin) {
      lines.push(`- **Label:** ${pin.label}`);
      lines.push(`- **Search:** ${pin.mapQuery}`);
      if (pin.lat != null && pin.lng != null) {
        lines.push(`- **Coordinates:** ${pin.lat}, ${pin.lng}`);
      }
      lines.push(`- [Open in Maps](${openInMapsUrl(pin)})`);
      if (thumb) lines.push("", `![Map preview](${thumb})`);
    } else {
      lines.push("_No pin geocoded yet._");
    }
    lines.push("");

    if (rec.shootSuggestions.length > 0) {
      lines.push("### Shoot suggestions (kept)", "");
      for (const shoot of rec.shootSuggestions) {
        lines.push(`#### ${shoot.title}`, "");
        if (shoot.why.trim()) lines.push(shoot.why.trim(), "");
        lines.push(`- **Map search:** ${shoot.mapQuery}`);
        lines.push(`- [Open in Maps](${openInMapsUrl(null, shoot.mapQuery)})`, "");
      }
    }

    if (rec.rulesAndLimitations.length > 0) {
      lines.push("### Rules & limitations", "");
      lines.push(...rec.rulesAndLimitations.map((r) => `- ${r}`), "");
    }
  }

  return lines.join("\n");
}
