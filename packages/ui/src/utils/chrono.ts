import * as chrono from "chrono-node";

const locales = {
  de: chrono.de,
  en: chrono.en,
  "en-GB": chrono.en.GB,
  fr: chrono.fr,
  ja: chrono.ja,
  nl: chrono.nl,
  pt: chrono.pt,
  ru: chrono.ru,
  uk: chrono.uk,
  zh: chrono.zh,
  "zh-Hans": chrono.zh.hans,
  "zh-Hant": chrono.zh.hant,
} as const;

export type ChronoLocale = keyof typeof locales;

export function chronoParse({
  text,
  ref,
  option,
  locale,
}: {
  text: string;
  ref?: chrono.en.ParsingReference | Date;
  option?: chrono.en.ParsingOption;
  locale: ChronoLocale;
}) {
  return locales[locale].parseDate(text, ref, option);
}
