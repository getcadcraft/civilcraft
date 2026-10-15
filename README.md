<img src="screenshots/icon.svg" alt="" width="64" height="64">

# CivilCraft

From survey points to finished grade.

**[Website](https://getcadcraft.com/apps/civilcraft) | [Try it in your browser](https://getcadcraft.com/try/civilcraft) | [Download](https://getcadcraft.com/download/civilcraft) | [Help and tutorials](https://getcadcraft.com/tutorials/civilcraft) | [News](https://getcadcraft.com/news) | [Suggest a feature](https://getcadcraft.com/suggest)**

[![CivilCraft 0.4](screenshots/paper.png)](https://getcadcraft.com/try/civilcraft)

<sub>Paper space above; [the same in model space](screenshots/model.png). Both are the 0.4 browser edition.</sub>

CivilCraft is the civil & site design app in the [CadCraft](https://getcadcraft.com) family: Surfaces from points and breaklines, alignments, profiles, corridors, grading and pipe networks. LandXML in and out.

## Use it

Try it now at https://getcadcraft.com/try/civilcraft, or get it for your platform. Your files stay on your computer either way.

| Platform | Status |
|---|---|
| [Browser](web/) | 0.4: `civilcraft-browser-edition-v0.4.0.zip` in [Releases](https://github.com/getcadcraft/civilcraft/releases), or [`web/v0.4/`](web/v0.4/) from a clone |
| [Windows](windows/) | 0.4: installer in [Releases](https://github.com/getcadcraft/civilcraft/releases) (not code-signed yet) |
| [Linux](linux/) | 0.4: `.deb` and AppImage in [Releases](https://github.com/getcadcraft/civilcraft/releases); Flathub manifest in [`linux/flathub/`](linux/flathub/) |
| [macOS](macos/) | Coming in 0.5 |
| [iPad](ios/) | Planned |
| [Android](android/) | Planned |

## Work on it

```sh
node devshell/serve.mjs     # Node 20.19 or newer, no packages; then open http://127.0.0.1:8000/
npm test                    # the app's tests; libraries are fetched by exact version
```

`app/` is the code in development (the same code on every platform; each release is a tag), `web/` `windows/` `linux/` `macos/` `ios/` `android/` hold what ships or builds it on each, `devshell/` runs it without the website (`devshell/README.md`), `tests/` and `fixtures/` are its tests and public sample files. How to contribute: [CONTRIBUTING.md](CONTRIBUTING.md); building from source: [BUILDING.md](BUILDING.md).

## License

Apache License 2.0 ([LICENSE](LICENSE), [NOTICE](NOTICE)). Libraries and their licenses: [THIRD_PARTY.md](THIRD_PARTY.md). Where the code comes from: [PROVENANCE.md](PROVENANCE.md). The names are trademarks; a fork must rename: [TRADEMARKS.md](TRADEMARKS.md).
