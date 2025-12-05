// Multi-language support utilities

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "tl", name: "Tagalog", nativeName: "Tagalog" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"]

export const DEFAULT_LANGUAGE: LanguageCode = "en"

// Currency formatting based on language
export function formatCurrency(amount: number, currency = "USD", language: LanguageCode = "en"): string {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency: currency,
  }).format(amount)
}

// Date formatting based on language
export function formatDate(date: Date, language: LanguageCode = "en"): string {
  return new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

// Number formatting based on language
export function formatNumber(num: number, language: LanguageCode = "en"): string {
  return new Intl.NumberFormat(language).format(num)
}
