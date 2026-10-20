# Install {{name}} {{version}} (browser edition)

{{name}} runs in your web browser. This folder is the whole app: plain files, nothing to build and nothing to install
on the computer that serves it. You need a web server, any web server, because browsers only run apps like this
one when it comes from `http://` or `https://`.

{{privacy}} The app opens and saves files on the machine running the browser.

## 1. Get it

Pick one:

- **Download the zip** `{{zip}}` from the releases page: {{releases}}
  Check it if you like: the SHA-256 checksum is listed next to the download.
- **Or build it from the source** (Node.js 20.19 or newer and PHP 8.1 or newer; the libraries are downloaded by exact
  version and checked):

  ```sh
  git clone --branch v{{semver}} {{repo}}.git
  cd {{slug}}
  node devshell/edition.mjs --version {{version}}     # → dist/{{folder}}/
  ```

## 2. Put it on a web server

Unzip it, then copy the folder `{{folder}}` anywhere your web server serves files from. Its own folder, a subfolder, or
the top of a site: all work, for example `https://example.com/tools/{{slug}}/`.

No web server yet? Any of these serves the folder you are in on your own computer. Run one inside the unzipped folder:

| You have | Run this, then open the address it prints |
|---|---|
| Python 3 | `python3 -m http.server 8000` → http://localhost:8000/ |
| PHP | `php -S localhost:8000` → http://localhost:8000/ |
| Node.js | `npx serve .` → http://localhost:3000/ |

For a server that stays up, use the one you already run:

**Apache.** Copy the folder into the document root. The `.htaccess` file in the folder sets the file types; if your
server ignores `.htaccess` files, add the same lines to the site's configuration:

```apache
AddType application/wasm .wasm
AddType text/javascript .js
AddType font/woff2 .woff2
```

**nginx.**

```nginx
location /{{slug}}/ {
    alias /var/www/{{slug}}/;          # the unzipped folder
    types { application/wasm wasm; text/javascript js; application/json json; font/woff2 woff2; text/css css; text/html html; image/svg+xml svg; image/png png; image/x-icon ico; }
}
```

**Caddy.**

```caddy
example.com {
    handle_path /{{slug}}/* {
        root * /var/www/{{slug}}
        file_server
    }
}
```

**IIS.** Copy the folder into the site. The `web.config` file in the folder adds the file types IIS does not know
(`.wasm`, `.woff2`, `.json`).

## 3. Open it

Open the folder's address in Chrome, Edge, Firefox or Safari, for example `http://localhost:8000/` or
`https://example.com/tools/{{slug}}/`. That's it. Press F1 in the app for help.

To use it with no connection, click **Save for offline** in the app's top bar once. The browser keeps a copy and opens
it from that copy when the network is gone.

{{threads}}

## Why double-clicking index.html does not work

Opening `index.html` from your file manager loads it from a `file://` address. Browsers refuse to run JavaScript
modules, workers and WebAssembly from `file://` addresses, for your safety, so the page stays empty. Serve the folder
with any web server from step 2 instead; the one-line Python, PHP or Node commands are enough.

## Troubleshooting

- **The page is blank or the app never appears.** Open the browser's developer console (F12). If it says a module was
  blocked because of its MIME type, your server sends `.js` files with the wrong type: add the lines from step 2.
- **"Incorrect response MIME type. Expected 'application/wasm'".** Harmless: the app falls back to a slower way of
  loading WebAssembly. Add the `.wasm` line from step 2 to make it quiet and quicker.
- **Some files are missing (404 in the console).** Copy the whole folder, including `assets/`, and keep its layout.
- **Save for offline is not offered.** Browsers allow it only on `https://` addresses and on `localhost`.
- **It worked, then shows an old version.** Your browser kept a saved copy: click **Offline ready** in the top bar and
  choose to save again, or remove the copy.

## Updating to a new version

Each version is its own folder (`v0.4`, `v0.5`, …). Download the new one, put it beside the old one or in its place,
and open its address. Settings and your saved-for-offline copy belong to the folder's address: if the address stays
the same, the app keeps your settings; click **Save for offline** again to refresh the offline copy. Your drawings
are your own files and are never touched by an update.

## Removing it

Delete the folder from the web server. To remove the browser's offline copy and settings too, open the app once more
and remove the offline copy from the top bar, or clear the site's data in your browser's settings.

## License

{{name}} is licensed under the Apache License 2.0 (`LICENSE`). The libraries it includes and their licenses are listed in
`THIRD_PARTY.md`; each one's own license sits beside it under `assets/vendor/`. "{{name}}" and "CadCraft" are trademarks:
a fork must use another name (`TRADEMARKS.md`).
