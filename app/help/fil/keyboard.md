---
title: Mga key at mouse
summary: Bawat keyboard shortcut at bawat aksyon ng mouse, trackpad at touch sa CivilCraft, pinagpangkat, kasama ang mga pagkakaiba ng browser at platform.
keywords: keyboard, shortcuts, hotkeys, keys, mouse, trackpad, touch, pan, zoom, pinch, wheel, right-click, mac, command key, mga shortcut
from: a9756f46
---

Gumagana ang mga single-letter key kapag hindi ka nagta-type sa kahon. Ang mga shortcut na may {{key:Mod}} ay gumagamit ng Command sa Mac at Ctrl sa iba pa. Tingnan din ang [Mga key sa browser](common:keys).

## Mga file at pag-edit

| Key | Aksyon |
|---|---|
| {{key:Mod+O}} | Buksan ang point file, LandXML o proyekto |
| {{key:Mod+S}} | I-save ang proyekto (nagda-download ng `.civilcraft.json` file) |
| {{key:Mod+P}} | I-plot ang plano sa PDF (binubuksan ang plot dialog, hindi ang print ng browser) |
| {{key:Mod+Z}} | I-undo |
| {{key:Mod+Y}} | I-redo |
| {{key:Delete}} | Burahin ang piniling survey point, alignment, pad, structure, pipe o PVI |
| {{key:Mod+C}} | Kopyahin ang piniling survey point (pati bilang point row para sa spreadsheet) |
| {{key:Mod+X}} | Gupitin ang piniling survey point |
| {{key:Mod+V}} | I-paste ang mga punto: sumusunod ang mga ito sa pointer, i-click kung saan sila pupunta |
| {{key:Mod+Shift+V}} | I-paste sa lugar: sa sarili nilang coordinates ng mga punto |
| {{key:Mod+D}} | I-duplicate ang piniling mga punto: sumusunod ang kopya sa pointer |
| {{key:Mod+A}} | Piliin ang bawat survey point |
| {{key:Esc}} | Walang piliin (at kanselahin ang paste) |

Gumagana ang {{key:Mod+S}}, {{key:Mod+O}} at {{key:Mod+P}} kahit habang nagta-type ka sa kahon. Ang {{key:Mod+Z}} at {{key:Mod+Y}} sa text box ay nag-u-undo ng iyong pagta-type sa halip, gaya ng karaniwan, at gayundin ang {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} at {{key:Mod+A}}: sa loob ng kahon, kinokopya, ginugupit, ipinapaste at pinipili nila ang teksto nito. Kapag may napiling teksto sa pahina (sa isang panel), kinokopya ng {{key:Mod+C}} ang tekstong iyon. Walang ginagawa ang {{key:Mod+Shift+Z}} sa CivilCraft: gamitin ang {{key:Mod+Y}} o ang button na {{ui:Redo}}.

:::mac
Ang Mac key na may label na **delete** ay {{key:Backspace}} para sa browser. Para burahin ang napiling bagay, pindutin ang {{key:Delete}} (Fn at delete), o piliin ang {{ui:Delete}} sa menu na {{ui:Higit pa}} ng toolbar.
:::

## Mga tool

| Key | Tool |
|---|---|
| {{key:V}} | {{ui:Piliin}} |
| {{key:M}} | {{ui:Sukatin}}: distansya, area at slope sa plano ([Sukatin](topic:measure)) |
| {{key:A}} | {{ui:Alignment}} |
| {{key:G}} | {{ui:Pad}} |
| {{key:P}} | {{ui:Pipes}} |
| {{key:B}} | {{ui:Breakline}} |
| {{key:O}} | {{ui:Boundary}} |
| {{key:R}} | Ipakita o itago ang profile view |
| {{key:I}} | I-on o i-off ang {{ui:Magdagdag ng PVI}} (binubuksan ang profile view kung sarado ito) |
| {{key:F}} | {{ui:Fit}}: ipakita ang lahat |
| {{key:D}} | {{ui:3D}}: ipakita ang site sa 3D, o bumalik sa plano |
| {{key:E}} | Ipakita o itago ang grade at elevation sa kahabaan ng bawat feature line (sa screen lamang) |

Ang pagpindot muli sa key ng aktibong tool ay bumabalik sa {{ui:Piliin}}. Walang ginagawa ang mga letra kapag may Shift.

## Habang gumuguhit

| Key | Aksyon |
|---|---|
| {{key:Enter}} | Tapusin ang alignment, pad, pipe run, breakline o boundary |
| {{key:Backspace}} | Alisin ang huling punto na na-click |
| {{key:C}} | Feature line: i-on o i-off ang arko (pagkatapos ng vertex, i-click ang isang punto sa curve, saka ang dulo nito) |
| {{key:Esc}} | Kanselahin ang pagguhit (o ang paste); kapag pinindot muli (o kapag walang iginuhit), bumalik sa {{ui:Piliin}} at i-clear ang seleksyon |

## Plan view

| Key o aksyon | Resulta |
|---|---|
| Wheel | Mag-zoom in o out sa pointer |
| I-drag sa walang laman na espasyo | Pan (sa anumang tool; nagki-click pa rin ang maikling click; kapag hawak ang {{key:Shift}}, gumuguhit ito ng selection box sa halip) |
| I-drag gamit ang gitnang button | Pan |
| I-drag gamit ang kanang button | Pan (walang bumubukas na menu) |
| {{key:Space}} at i-drag | Pan |
| I-click | Piliin (gamit ang {{ui:Piliin}}), o maglagay ng punto (gamit ang drawing tool) |
| {{key:Shift}} at i-click | Idagdag ang survey point sa seleksyon, o alisin ito |
| {{key:Shift}} at i-drag | Gumuhit ng box: idinadagdag sa seleksyon ang mga survey point sa loob nito. I-drag sa paligid nila para sa [lasso](topic:lasso-selection) |
| {{key:Space}} habang gumuguhit ng lasso | Window, then crossing, then fence |
| I-click habang nagpe-paste | Ilagay doon ang mga na-paste na punto ({{key:Enter}} ang naglalagay sa mga ito sa sarili nilang coordinates) |
| I-drag ang grip | Ilipat ang PI, sulok ng pad o structure (isang undo step) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Pan, kapag may focus ang plano (i-click muna ito) |
| {{key:Plus}} at {{key:Minus}} | Mag-zoom in at out sa gitna, kapag may focus ang plano |

Nagzu-zoom in ang = key gaya ng {{key:Plus}}, kaya hindi mo kailangan ng Shift.

## Profile view

| Aksyon | Resulta |
|---|---|
| I-click habang naka-on ang {{ui:Magdagdag ng PVI}} | Magdagdag ng PVI doon |
| I-click ang PVI | Piliin ito |
| I-drag ang PVI | Ilipat ito (isang undo step) |
| {{key:Delete}} o {{key:Backspace}} | Alisin ang piniling PVI (Backspace lamang kapag may focus ang profile view) |

Hindi nagzu-zoom o nagpa-pan ang profile view.

## Screen at help

| Key | Aksyon |
|---|---|
| {{key:F1}} | Buksan o isara ang help na ito (ang side panel); ang {{ui:Tulong}} sa app bar ay gumagawa ng pareho |
| {{key:Esc}} | Isara ang help panel kapag bukas ito |
| {{key:Ctrl+Shift+F}} | Ikutin ang mga screen mode: full screen, full screen na nakatago ang mga bar, normal |
| {{key:Esc}} | Lumabas sa full screen (key ng browser mismo) |

Naaabot ng {{key:F1}} ang help bago ito makita ng CivilCraft, kaya gumagana ito sa anumang tool. Sa karamihan ng Mac keyboard, pindutin ang fn kasama ang F1, o i-click ang {{ui:Tulong}}. Ginagamit ng {{key:Ctrl+Shift+F}} ang Control key sa bawat platform, kasama ang Mac. Tingnan ang [Paggamit ng help](common:help) para malaman kung paano hanapin sa help na ito.

## Mouse, trackpad at touch

:::mouse
- Nagzu-zoom ang wheel sa pointer. Mabilis mag-zoom ang mouse na may malayang umiikot na wheel: magbigay ng maikling ikot.
- Mag-pan sa pamamagitan ng anumang drag sa walang laman na espasyo, ang gitnang button, ang kanang button, o {{key:Space}} at drag.
:::

:::mac
Sa Mac trackpad:

- Ang two-finger scrolling ay **nagzu-zoom** (hindi nagpa-pan), at nagzu-zoom din ang pinch.
- Para mag-pan, pindutin at i-drag sa walang laman na espasyo gamit ang isang daliri, o hawakan ang {{key:Space}} at i-drag.
- Ang two-finger click (right-click) ay walang binubuksang menu at wala itong ginagawa nang mag-isa.
:::

:::touch
Sa touch screen:

- Ginagawang sukat ng daliri ang mga button at hilera ng menu ng unang touch.
- I-tap para pumili o maglagay ng punto; ang isang daliring na nai-drag sa walang laman na espasyo ay nagpa-pan. Maaaring kumibot nang kaunti ang tap: nagpa-pan lamang ito kapag gumalaw na ang daliri nang mga 10 pixel.
- Ang dalawang daliri ay pinch para mag-zoom at sabay na gumagalaw para mag-pan.
- I-drag ang grip o PVI gamit ang isang daliri. May espasyo sa paligid ng grip na kasing-lapad ng daliri.
- Habang gumuguhit ka ng alignment, pad, breakline, boundary, pipe run, feature line o parcel, may bar sa ibabaw ng plano na nag-aalok ng {{ui:Tapusin}} ({{key:Enter}}), {{ui:Bawiin ang punto}} ({{key:Backspace}}) at {{ui:Kanselahin}} ({{key:Esc}}). Tinatapos din ng mahabang press (kalahating segundo nang walang galaw) ang pagguhit.
- Sa {{ui:Piliin}}, ang mahabang press sa survey point ay idinadagdag ito sa seleksyon, o inaalis ito, gaya ng ginagawa ng {{key:Shift}}+click.
- Sa 3D view, umiikot ang isang daliri, nagpi-pinch at nagpa-pan ang dalawa, at pumipili ang tap.
- Walang hover sa touch, kaya ina-update lamang ang mga readout ng status bar habang nakadikit ang daliri.
:::

## Mga key ng browser na nananaig

Ang ilang key ay sa browser at hindi kailanman umaabot sa CivilCraft, halimbawa {{key:Mod+W}} (close tab), {{key:Mod+T}} (new tab), {{key:Mod+N}} (new window) at {{key:F11}} (full screen sa mga browser ng Windows at Linux). Hindi ginagamit ng CivilCraft ang mga ito. Kung may binubuksan ang shortcut sa browser sa halip, i-click nang isang beses ang plano para magkaroon ng focus ang pahina, at subukan muli.

## Nasaan ang Move

Walang Move command: piliin ang {{ui:Piliin}} at i-drag ang punto o vertex, o i-edit ang coordinates nito sa {{ui:Properties}}. Tingnan ang [I-edit ang mga punto](topic:edit-points).
