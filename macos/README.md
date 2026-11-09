# CivilCraft for macOS

CivilCraft comes inside [CadCraft Studio](https://github.com/getcadcraft/studio): get Studio 0.9 for macOS (one universal disk image, macOS 13 or later) from the [download page](https://getcadcraft.com/download#studio) or the [GitHub release](https://github.com/getcadcraft/studio/releases/tag/studio-v0.9.0). It is not code-signed or notarized yet: the first time, right-click CadCraft Studio in Applications and choose **Open** (macOS 15 and later: System Settings › Privacy & Security › **Open Anyway**). Every app also runs in the browser: https://getcadcraft.com/use/civilcraft.

Or install it with [Homebrew](https://github.com/getcadcraft/homebrew-tap):

```sh
brew tap getcadcraft/tap
brew install --cask cadcraft-studio
```

It is the same disk image as the download page. If Homebrew refuses the tap as untrusted, run `brew trust getcadcraft/tap` once and try again.
