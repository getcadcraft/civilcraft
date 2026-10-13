# Building CivilCraft from source

There is nothing to compile: CivilCraft is plain ES modules, CSS and one page of markup that run in the browser. "Building"
means running it locally, testing it, and compiling its help.

## Requirements

- **Node.js 20.19 or newer** (22 recommended) — the local server and the tests. No npm packages for the app itself.
- **PHP 8.1 or newer** (optional) — re-renders the page when you change `app/ui.inc` or `app/settings.inc`, and compiles
  the help. Without it the server uses the pre-rendered `devshell/index.html`.
- **Python 3** (optional) — some tests compare against independent readers; the test runner sets them up from
  `tests/tools/*/requirements.txt`, and skips them without Python.
- A current Chrome, Edge, Firefox or Safari.

## Run

```sh
node devshell/serve.mjs                   # http://127.0.0.1:8000/   (npm start does the same)
```

The first time a library is needed (pdf.js, three.js, …) it is downloaded once, by exact version, into
`devshell/vendor/` and checked against `devshell/vendor.json`. `npm run fetch-vendor` downloads them all up front;
`--offline` never downloads.

## Test

```sh
npm test                                  # every test in tests/bin; npm test -- --only test-civilcraft.mjs
```

## Help and languages

```sh
php devshell/build-help.php               # compiles app/help/*.md into app/help/help.js (+ help.<locale>.js); --check lints only
```

Words: `app/lang/en.json` and translations beside it. See `CONTRIBUTING.md`.

## Layout

| Path | What |
|---|---|
| `app/` | the app — `ui.inc`, `settings.inc`, `manifest.json` (stylesheets, entry module, import map), modules, `help/`, `lang/` |
| `devshell/` | the local server, the page renderer, the shared shell files from getcadcraft.com, library versions |
| `tests/`, `fixtures/` | the tests and the drawings they use (made for testing) |
| `LICENSE`, `THIRD_PARTY.md` | Apache-2.0; the libraries the app loads and their licenses |

More: `devshell/README.md`.
