/** Text helpers shared by the forms and the profile menu. */

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/**
 * Ingredients are typed as a comma separated line, but people also paste
 * newlines or semicolons. Normalise all three, trim, drop duplicates and
 * respect the backend limit.
 */
export function parseIngredientInput(value: string, max = 20): string[] {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const raw of value.split(/[,;\n]+/)) {
    const item = raw.trim().slice(0, 40);
    if (!item) continue;
    const key = item.toLocaleLowerCase("es");
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
    if (items.length >= max) break;
  }

  return items;
}

/** A light normalisation used only for client-side comparisons. */
export function normalise(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
