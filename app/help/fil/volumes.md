---
title: Mga volume ng earthwork
summary: Basahin ang cut, fill, at net volumes sa pagitan ng umiiral na ground at ng proposed surface, bawat pad at corridor at sa kabuuan, at unawain ang grid method sa likod ng mga ito.
keywords: volumes, earthwork, cut, fill, net, cut at fill, quantities, grid method, paghahambing ng surface, volume surface, cubic yards, cubic meters
from: 299d7bc7
---

Sa sandaling mag-grade nang walang problema ang pad o corridor, ikinukumpara ng CivilCraft ang proposed surface sa umiiral na ground at iniuulat ang cut at fill. Nag-u-update ang mga numero sa bawat pagbabago.

## Saan ito makikita

- **Earthwork** sa right panel kapag walang napili (ang **Project** view), kapag may kahit isang pad o isang corridor.
- **Earthwork** sa right panel kapag napili ang isang pad (parehong kabuuan para sa buong project).
- Ang linya sa ilalim ng settings ng corridor, na may sariling cut at fill ng corridor na iyon.

Ipinapakita ng **Earthwork** block ang:

- **Cut**, **Fill**, at **Net** (may "fill" o "cut" pagkatapos, alin ang mas malaki)
- isang linya bawat item kapag higit sa isa, halimbawa "Pad 1: cut 120.4 cu yd, fill 310.2 cu yd"
- ang method line: "Grid method: umiiral na ground at ang na-grade na surface, sinampol bawat 0.5 ft sa loob ng daylight lines (92,891 cells). Walang swell o shrink na inilapat."

Nasa cubic yards ang mga volume sa feet project at nasa cubic metro sa metro project.

## Ipadala sa TakeoffCraft

Para mapresyuhan ang earthwork, piliin ang {{ui:Ipadala sa TakeoffCraft}} sa ilalim ng **Earthwork** block. Nagse-save ang CivilCraft ng quantities file (`<site>.quantities.json`) na may dalawang quantity: cut at fill, sa cubic yards (feet project) o cubic metro (metro project), kapareho ng mga numero sa block, hanggang sa dalawang decimal. Buksan ito sa TakeoffCraft gamit ang **Buksan ang takeoff**, o i-drop doon: magiging dalawang item ang mga ito na maaari mong presyuhan ([Cut at fill mula sa CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Ipadala ulit pagkatapos ng pagbabago at buksan ang bagong file: ang parehong item ay kukuha ng bagong numero.

Kabuuan lang ang ipinapadala, kaya walang nabibilang nang dalawang beses; nakalista sa note ng file ang sariling cut at fill ng bawat pad at corridor.

## Paano ito kinakalkula

Gumagamit ang CivilCraft ng **grid method**:

1. Naglalagay ng grid ng mga parisukat na cell sa ibabaw ng lugar sa loob ng bawat daylight line.
2. Sa gitna ng bawat cell, sinasampol ang dalawang surface.
3. Ang bawat cell ay binibilang bilang prism: ang pagkakaiba sa elevation na pinarami ng lawak ng cell. Kung mas mababa ang proposed surface, cut; kung mas mataas, fill.
4. Idinaragdag ang mga cell.

Pinipili ang laki ng cell para sa iyo upang ang rectangle sa paligid ng mga na-grade na lugar ay may humigit-kumulang 250,000 cells, na binilog sa maayos na halaga (1, 2, o 5 beses ng power of ten). Hindi mo pa ito maitatakda sa ngayon. Ipinapakita ng method line ang laki at bilang ng mga cell. Mas tumpak ang mas maliliit na cell sa mga gilid; sa buong cell sa pagitan ng mga patag na eroplano, eksakto ang resulta.

## Mga dapat malaman

- Tanging ang lugar sa loob ng daylight lines ang binibilang. Hindi nagbabago ang ground sa labas ng mga ito.
- Ang pad o corridor na may problema ay hindi naisasama sa grading at hindi nagdaragdag ng anuman. Kung sinasabi ng block na "No volumes yet: a pad needs to grade without problems.", hanapin ang pulang box sa itaas nito.
- Kapag nagka-overlap ang mga item, pinapalitan ng mas huli ang mas maaga sa loob ng daylight line nito, at binibilang nang isang beses ang overlap.
- Walang swell o shrink factor na inilalapat. I-multiply ang mga resulta nang sarili mo kung kailangan mo ang bank, loose, o compacted na volume.
- Hindi pa available ang topsoil stripping, lalim ng pavement at subgrade, at TIN-to-TIN prism volumes.

## Pagsusuri ng resulta

- I-on ang {{ui:Proposed (graded)}} sa ilalim ng **Display** at tingnan ang contours sa loob ng daylight lines.
- Ilipat ang pointer sa na-grade na lugar: ipinapakita ng status bar ang **Ground** at **Graded**. Ang pagkakaiba ay ang lalim ng cut o fill sa puntong iyon.
- Para sa corridor, ipinapakita ng readout ng profile view ang cut o fill sa centerline sa bawat station.
