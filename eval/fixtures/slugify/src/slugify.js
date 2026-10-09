// Latin letters that Unicode normalization doesn't split into base letter + accent.
const SPECIAL = { ß: 'ss', æ: 'ae', ø: 'o', œ: 'oe', ł: 'l', đ: 'd', þ: 'th', ð: 'd' };

/**
 * Turn Latin-script text into a URL-safe slug.
 * Accents are removed and a few special letters transliterated (ß → ss, ø → o …).
 * Characters outside the Latin script are dropped, so a string with no Latin
 * letters or digits returns "". Throws a TypeError for anything but a string.
 */
export function slugify(input) {
  if (typeof input !== 'string') {
    throw new TypeError(`slugify expects a string, got ${input === null ? 'null' : typeof input}`);
  }
  return input
    .toLowerCase()
    .replace(/[ßæøœłđþð]/g, (ch) => SPECIAL[ch])
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
