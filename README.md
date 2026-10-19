<img src="screenshots/icon.svg" alt="" width="64" height="64">

# CivilCraft

From survey points to finished grade.

**[Website](https://getcadcraft.com/apps/civilcraft) | [Use it in your browser](https://getcadcraft.com/use/civilcraft) | [Download CadCraft Studio](https://getcadcraft.com/download#studio) | [Help and tutorials](https://getcadcraft.com/tutorials/civilcraft) | [News](https://getcadcraft.com/news) | [Suggest a feature](https://getcadcraft.com/suggest)**

[![CivilCraft](screenshots/paper.png)](https://getcadcraft.com/use/civilcraft)

<sub>Paper space above; [the same in model space](screenshots/model.png). Both are from the browser edition.</sub>

CivilCraft is the civil & site design app in the [CadCraft](https://getcadcraft.com) family: Surfaces from points and breaklines, alignments, profiles, corridors, grading and pipe networks. LandXML in and out.

## Use it

Use it now at https://getcadcraft.com/use/civilcraft, or install CadCraft Studio, which carries all eight apps. Your files stay on your computer either way.

| Platform | Status |
|---|---|
| [Browser](web/) | 0.6: `civilcraft-browser-edition-v0.6.0.zip` in [Releases](https://github.com/getcadcraft/civilcraft/releases), or [`web/v0.4/`](web/v0.4/) (older) from a clone |
| Desktop: [Windows](windows/), [Linux](linux/) | In [CadCraft Studio 0.6](https://github.com/getcadcraft/studio/releases/tag/studio-v0.6.0) (installer, `.deb`, AppImage); not code-signed yet |
| [macOS](macos/) | Studio 0.6 for macOS follows; Studio 0.5 for Mac is on the [download page](https://getcadcraft.com/download#studio) |
| [Android](android/) | The Studio APK, on the [download page](https://getcadcraft.com/download#studio) |
| [iPad](ios/) | Planned, in 0.7 at the earliest |

## Work on it

```sh
node devshell/serve.mjs     # Node 20.19 or newer, no packages; then open http://127.0.0.1:8000/
npm test                    # the app's tests; libraries are fetched by exact version
```

`app/` is the code in development (the same code on every platform; each release is a tag), `web/` `windows/` `linux/` `macos/` `ios/` `android/` hold what ships or builds it on each, `devshell/` runs it without the website (`devshell/README.md`), `tests/` and `fixtures/` are its tests and public sample files. How to contribute: [CONTRIBUTING.md](CONTRIBUTING.md); building from source: [BUILDING.md](BUILDING.md).

## License

Apache License 2.0 ([LICENSE](LICENSE), [NOTICE](NOTICE)). Libraries and their licenses: [THIRD_PARTY.md](THIRD_PARTY.md). Where the code comes from: [PROVENANCE.md](PROVENANCE.md). The names are trademarks; a fork must rename: [TRADEMARKS.md](TRADEMARKS.md).
