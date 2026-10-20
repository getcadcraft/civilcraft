# Dev shell

Run this app from a clone, without getcadcraft.com.

```sh
node devshell/serve.mjs            # Node 20.19 or newer; no packages to install
# open http://127.0.0.1:8000/
```

- `?space=model` / `?space=paper` — dark or light theme.
- `?lang=es-MX` — another language (when the app has `app/lang/es-MX.json`); `?lang=en-XA` shows every translated
  string accented and 40% longer, so text that skipped the language files stands out.
- `--port 8080`, `--host 0.0.0.0`, `--offline` (never download libraries).

## Tests

```sh
npm test                 # downloads the libraries by version (checked), installs test packages, runs every test
npm test -- --only test-<app>.mjs
npm run fetch-vendor     # just the libraries
```

The tests use the drawings in `fixtures/` (made for testing; no customer files). Some checks use extra readers
(Python packages, LibreOffice); without them those checks say they were skipped.

## What is where

| Path | What |
|---|---|
| `app/` | the app: `ui.inc` (markup), `manifest.json` (stylesheets, entry module, import map), ES modules, `help/`, `lang/` |
| `devshell/serve.mjs` | the local server |
| `devshell/render.php` | builds the page from `app/ui.inc` (`--edition` for the browser edition's page) |
| `devshell/edition.mjs` | packs the browser edition into `dist/` (BUILDING.md § The browser edition) |
| `devshell/edition/` | what edition.mjs needs from getcadcraft.com: service worker, INSTALL.md template, `kit.json` (written by the sync; do not edit) |
| `devshell/index.html` | the page, pre-rendered — used when PHP is not installed |
| `devshell/app.json` | the app's name and colour, and the exact library versions it runs on |
| `devshell/site/` | the shared shell from getcadcraft.com (app bar styles, settings dialog, help panel, fonts) |
| `devshell/vendor/` | libraries (pdf.js, three.js, …), downloaded once by version (`devshell/vendor.json` lists every file and its checksum) |
| `tests/`, `fixtures/` | the app's tests and the drawings they use; `.cc-test/` is where `npm test` runs them |

## Editing

- JavaScript and CSS in `app/`: reload the page.
- `app/ui.inc` or `app/settings.inc`: reload too, if PHP 8.1+ is installed (the page is rendered on every load).
  Without PHP, the page comes from `devshell/index.html`; re-render it on a machine with PHP:
  `php devshell/render.php --out devshell/index.html`.
- Help (`app/help/*.md`): `php devshell/build-help.php` compiles `app/help/help.js` (`--check` only lints).
- Words people read go in `app/lang/en.json` and are used with `t('key')` in JavaScript or `Lang::e('key')` in
  `ui.inc` — see the language-files guide in the main repository.

## The browser edition

```sh
node devshell/edition.mjs [--version x.y] [--zip] [--out dir] [--offline]
```

The whole app as static files for any web server, as on the Releases page; needs PHP 8.1+ besides Node. See BUILDING.md.

## What the dev shell does not do

It has no accounts and no cloud: saving goes to your computer, as in the browser apps. The library panel, "Save for
offline" and links to the other apps need getcadcraft.com and are hidden or will say they cannot connect.
