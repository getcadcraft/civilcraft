---
title: I-grade ang building pad
summary: Gumuhit ng patag na pad, itakda ang elevation nito at cut at fill slope, at hayaang i-daylight ito ng CivilCraft sa umiiral na lupa at idagdag sa proposed surface.
keywords: retaining wall, retaining walls, vertical side, wall instead of slope, side slope per side, embankment, grading, pad, building pad, daylight, feature line, grading group, cut slope, fill slope, finished grade, proposed surface, site grading
from: 482319a6
---

Ang pad ay patag na lugar sa iisang elevation. Mula sa gilid nito, nag-i-grade palabas ang CivilCraft sa cut slope mo kung saan mas mataas ang lupa kaysa sa pad, at sa fill slope mo kung saan mas mababa, hanggang magtagpo ang slope sa umiiral na lupa. Ang linyang nagtatagpo ay ang daylight line. Pinapalitan ng pad at ng mga slope nito ang umiiral na lupa sa loob ng daylight line para bumuo ng proposed surface.

## Gumuhit ng pad

Kailangan mo muna ng umiiral na ground surface.

1. Pindutin ang {{key:G}}, o i-click ang {{ui:Pad}} sa **Design** group.
   Sinasabi ng hint: "Pad: i-click ang mga sulok nito. Enter o double-click ang tatapos, Backspace ang nag-aalis ng huli, Esc ang nagkakansela."
2. I-click ang mga sulok ng pad ayon sa pagkakasunod, alinmang direksyon. Sumusunod ang asul na outline sa pointer.
3. Pindutin ang {{key:Enter}} pagkatapos ng huling sulok (hindi bababa sa tatlo).
   Iginuhit at napili ang pad. Nagsisimula ito sa ground elevation sa gitna nito, binilog sa 0.1, na may 2 : 1 na cut slope at 3 : 1 na fill slope. Sinasabi ng status bar, halimbawa, "Pad 1 sa elevation 254.3 (ang ground sa gitna nito), cut 2:1, fill 3:1. Baguhin ang mga ito sa Properties."

:::warning
Tapusin gamit ang {{key:Enter}}. Natatapos din ng double-click, pero sa build na ito ay inaalis nito ang sulok na dinoble-click mo. I-click nang isang beses ang huling sulok, pagkatapos pindutin ang {{key:Enter}}.
:::

Hindi dapat magtawiran ang outline ng pad ("Nagtatawiran ang outline ng pad.").

## Itakda ang elevation at mga slope

Kapag napili ang pad, ipinapakita ng kanang panel ang **Pad**:

1. **Pangalan**.
2. **Elevation**: ang patag na elevation ng pad.
3. **Cut slope** at **Fill slope**, bilang H:V (ang 2 ay nangangahulugang 2 : 1). Dapat parehong mas malaki sa 0.
4. Ipinapakita para sa sanggunian ang **Pad area** at **Corners**.

Pindutin ang {{key:Enter}} pagkatapos ng bawat value. Agad na nag-a-update ang daylight line, ang proposed surface at ang mga volume.

Sa ilalim ng mga field, may linyang nagsasabi halimbawa ng "Daylight line: 48 slope lines (20 in cut, 28 in fill), farthest 31.20 ft out." Ipinapakita ng plano ang daylight line at ang slope lines sa magenta.

## Paano hinahanap ang daylight

- Lumalabas ang slope lines mula sa bawat gilid nang patayo rito, humigit-kumulang bawat ikadalawampung bahagi ng laki ng pad.
- Sa mga panlabas na sulok, kumakalat ang mga ito bawat 10°, para bumalot ang slope sa sulok.
- Sa mga panloob na sulok, isang linya ang tumatakbo sa bisector, kung saan nagtatagpo ang mga slope mula sa dalawang gilid.
- Bawat linya ay umaakyat sa cut slope o bumababa sa fill slope hanggang maabot ang lupa.

## Mga slope bawat gilid at retaining wall

Sa ilalim ng **Sides and retaining walls** sa Properties ng pad, platform o berm, maaaring i-grade ang bawat gilid sa sarili nitong paraan. Ang Side 1 ay mula sa unang sulok na na-click mo papunta sa ikalawa, ang side 2 mula sa ikalawa papunta sa ikatlo, at ganoon din sa iba.

- **All sides**: ginagamit ng **Sloped** ang cut at fill slope sa itaas sa bawat gilid; ang **Vertical: retaining walls** ay naglalagay ng pader sa bawat gilid.
- Bawat gilid: **Slopes above**, **Its own slopes** (mag-type ng cut at fill slope para sa gilid na iyon) o **Vertical (retaining wall)**.
- Mag-type ng slope bilang `3` o `3:1` (horizontal sa 1 vertical), `33%` o `18.4°`; ipinapakita ito bilang H:1. Ganoon din ang tinatanggap ng sariling **Cut slope** at **Fill slope** ng pad.
- Ang vertikal na gilid ay walang embankment: tumatakbo ang retaining wall sa kahabaan ng gilid, mula sa pad pababa sa umiiral na lupa (sa fill) o mula sa lupa pababa sa pad (sa cut). Ang **Wall thickness** (0.3 m o 1 ft sa simula) ay ang layo ng hakbang ng lupa mula sa gilid ng pad papunta sa umiiral na lupa. Hindi isinasama sa cut at fill volume ang embankment na wala na sa gilid na iyon.
- Kapag nagtagpo ang pader at ang may slope na gilid, bumabalot ang slope sa dulo ng pader; nagtatagpo ang dalawang pader sa mitre.
- Sa ilalim ng mga field: ang haba ng mga pader, exposed face (taas × haba), pinakamataas at average na taas.

Iginuguhit ng plano ang panlabas na mukha ng bawat pader na may maiikling tick sa ibabaw nito at ang taas nito sa magkabilang dulo at sa pinakamataas na bahagi (sa retaining walls layer, na napupunta rin sa DXF at DWG). Ipinapakita ng 3D view ang mga pader bilang solid (Show › Retaining walls), at kasama sila sa GLB, OBJ at USD export. Ipinapakita ng mga section sa kabila ng gilid ang hakbang.

**Mga babala** (sa Properties, at sa Problems panel): ang pader na mas mataas sa **Warn above a wall height of** (1.0 m o 3.3 ft sa simula) "maaaring kailanganin ng engineered wall o permit; suriin ang lokal na patakaran", at, kapag nag-type ka ng **Steepest slope the soil stands**, anumang gilid na ang cut o fill slope ay mas matarik doon. Babala lang ang mga ito: itinatayo pa rin ang grading. Bawat pagbabago ay isang hakbang para sa {{key:Mod+Z}}.

## Ilipat ang mga sulok

Piliin ang pad, pagkatapos i-drag ang parisukat na grip sa isang sulok. Bawat drag ay isang undo step. Hindi pa available ang pagdaragdag o pag-alis ng sulok: burahin ang pad at iguhit muli.

## Kapag hindi ito nagri-grade

Isang pulang kahon sa ilalim ng **Earthwork** ang nagpapangalan sa pad at sa problema:

| Mensahe | Ano ang gagawin |
|---|---|
| "Tatlong slope line ang lumalampas sa surface bago ito maabot: masyadong malapit ang pad sa gilid ng surface o masyadong mataas/mababa." | Ilipat ang pad papasok mula sa gilid ng surface, o ilapit ang elevation nito sa lupa. |
| "Nagtatawiran ang daylight line (nagbabanggaan ang mga slope mula sa magkaibang gilid ng pad). Baguhin ang hugis ng pad o palitan ang mga slope." | Karaniwan para sa makikitid o L-shaped na pad sa malalim na cut o mataas na fill. Palakihin ang pad, patagin ang pagkakaiba, o patarikin ang mga slope. |
| "Nagtatawiran ang outline ng pad." | Iguhit muli ang mga sulok ayon sa pagkakasunod sa paligid ng pad. |

Hindi isinasama sa proposed surface at mga volume ang pad na may problema hangga't hindi ito naaayos.

## Tingnan ang resulta

1. Sa ilalim ng **Display**, itakda ang **Surface** sa {{ui:Proposed (graded)}}.
   Ngayon, patag na dumadaan ang mga contour sa pad at sumusunod sa mga slope palabas hanggang daylight line.
2. Ilagay ang pointer sa ibabaw ng pad: ipinapakita ng status bar ang elevation ng **Ground** at **Graded**.
3. Basahin ang cut at fill sa ilalim ng **Earthwork**; tingnan ang [Mga volume ng Earthwork](topic:volumes).

Ginagrade ang mga pad pagkatapos ng corridor, ayon sa pagkakaguhit. Ang susunod na pad ay pumapalit sa anumang nauna sa loob ng sarili nitong daylight line.

## Burahin ang pad

Piliin ito at pindutin ang {{key:Delete}} (sa Mac, Fn at delete), o i-click ang {{ui:Delete}}.

## Hindi pa nagagawa

Patag ang mga pad: hindi pa available ang sloped pad, feature line na may nag-iibang grade, bench, at grading sa isang distansya o target na elevation. Tingnan ang [Hindi pa nagagawa](topic:not-built-yet).
