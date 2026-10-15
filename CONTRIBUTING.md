# Contributing to CivilCraft

Thanks for helping. CivilCraft is the civil & site design app in the [CadCraft](https://getcadcraft.com) family: eight
open-source apps for CAD and BIM work, each in its own repository. It is early: expect rough edges.

## Good first contributions

- **Bug reports** with the steps that show the problem and, when you can share it, a small file. Use the issue
  templates.
- **Test files you have the right to share** that break or stress the app. Strip anything confidential first. Never
  send a client's drawing.
- **Translations** of the app's words (`app/lang/<locale>.json`) and help (`app/help/<locale>/`) — see "Languages".
- **Fixes** with a test. For anything larger, open an issue first so we can agree on the approach.

## Before you open a pull request

1. Run the app: `node devshell/serve.mjs` (see `BUILDING.md`).
2. Run the tests: `npm test`. Add a test for what you changed; tests use only the files in `fixtures/`.
3. Words people read go through the language files: `t('key')` in JavaScript, `Lang::e('key')` in `ui.inc`, the text in
   `app/lang/en.json`. Plain text only, sentence case.
4. Help changes go in `app/help/*.md`; compile with `php devshell/build-help.php`.
5. Keep the build self-contained: the app's modules import each other relatively (`./x.js`), and libraries come only
   from the versioned folders listed in `THIRD_PARTY.md`. No CDN, no tracking, no network calls the user did not ask for.

## How a change gets in

1. Fork the repository, make a branch, and open a pull request against `main`. The pull request template has a short
   checklist.
2. **Tests** run on every pull request (`npm test -- --oracles`, the same as on your machine). A red check means something to fix;
   the log shows which test failed.
3. A maintainer reviews it. Once it is approved and the tests pass, it is merged.
4. `main` is the code in development: a merged change goes into the next build in the lab at getcadcraft.com, then into
   the next release. Releases are the tags (`civilcraft-v0.4.0`, …) and their files are on the Releases page.

## Rules that are not negotiable

- **License.** CivilCraft is licensed under the Apache License 2.0 (`LICENSE`). By contributing you agree that your
  contribution is licensed under it too, and that you have the right to give it.
- **Clean room.** Do not submit code, data or assets copied from proprietary CAD software, its SDKs or its file-format
  libraries, and do not port code from copyleft (GPL, LGPL, MPL) projects. Our file readers are written from published
  specifications; other implementations may only be used as black boxes to compare output.
- **No new copyleft dependencies.** Anything the app loads must be under a permissive license (MIT, BSD, ISC,
  Apache-2.0 and similar). Name new libraries in your pull request.
- **Names.** Other products' names appear only to say what a format or workflow is compatible with, in plain text —
  never in a title, heading or product name.

## Languages

`app/lang/en.json` is the source; a translation is `app/lang/<locale>.json` with the same keys and the same `{fills}`
(plural forms by CLDR: `{"one": …, "other": …}` and whatever your language needs). Help topics translate one file at a
time into `app/help/<locale>/<topic>.md`, with `from: <8 hex>` naming the English text they translate (the help build
prints it). Try your work with `?lang=<locale>`; `?lang=en-XA` shows text that skipped the language files.

## Questions

Open a discussion or an issue, or write through https://getcadcraft.com/support.
