# Shared: i18n

Arabic and English; Arabic first, right to left.

- `en.ts` and `ar.ts`: one file per language, with the same keys (the Arabic
  file is checked against the English one). Texts with a value in them are
  functions (`readyTitle(name)`)
- `index.ts`: `texts[language]` and `direction(language)` (`rtl` or `ltr`)

Error codes from the backend become words with `messageFor(error, language)`
in `shared/tools-client`. For now the business setup and the Home placeholder
use these files; the other pages are still in English only. The Arabic texts
are a first draft and need an owner (team-handoffs ALL-001).
