// Turn an arbitrary string into a URL-safe slug. No dependencies.
export function slugify(input) {
  return String(input)
    .normalize('NFKD') // split accents from their base letters
    .replace(/[̀-ͯ]/g, '') // drop the accent marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // any run of non-alphanumerics -> a single hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
