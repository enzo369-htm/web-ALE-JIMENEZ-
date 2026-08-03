export function padIndex(n: number, digits = 2) {
  return String(n).padStart(digits, "0");
}

export function projectMetaLine(input: {
  title: string;
  location?: string | null;
  year?: string | null;
}) {
  const bits = [input.title];
  if (input.location) bits.push(input.location);
  const left = bits.join(", ");
  return input.year ? `${left} (${input.year})` : left;
}

export function workCaption(input: {
  title: string;
  year?: string | null;
  medium?: string | null;
}) {
  return [input.title, input.year, input.medium].filter(Boolean).join(", ");
}
