---
title: Mag-lay out ng gravity pipe network
summary: Iguhit ang mga storm o sanitary pipe run, structure bawat structure, itakda ang iyong slope, cover at drop na patakaran, hayaang itakda ng CivilCraft ang mga invert, at ayusin ang mga problemang nililista nito.
keywords: structure builder, structure type, rectangular structure, catch basin, frame, cover, kapal ng pader, library item, pipe network, storm, sanitary, sewer, structures, manholes, inlets, inverts, cover, slope, drop, rim, sump, gravity pipes
from: 10a3c14d
---

Isang gravity pipe network lang ang hawak ng project, storm o sanitary. Binubuo ito ng mga structure (manhole, inlet) at tuwid na pipe sa pagitan ng mga ito. Tumatakbo ang daloy sa direksyong iginuhit mo. Sinusuri ng CivilCraft ang bawat pipe at structure laban sa tatlong patakarang itinakda mo, at maaaring itakda ang lahat ng invert mula sa mga patakarang iyon.

## Gumuhit ng run

Maaari kang gumuhit ng pipe nang walang surface, pero kailangan ng rim, cover at awtomatikong invert ng isa.

1. Pindutin ang {{key:P}}, o i-click ang {{ui:Pipes}} sa grupong **Design**.
   Ang hint ay nagsasabing "Pipes: i-click ang mga structure mula sa itaas ng run pababa (i-click ang umiiral na structure para sumali). Tinatapos ng Enter."
2. I-click kung saan pupunta ang upstream structure. Inilalagay ang isang structure.
3. I-click ang bawat susunod na structure sa downstream. Para kumonekta sa structure na umiiral na, i-click ito: sinasabi ng status bar na "Joined S3."
4. Pindutin ang {{key:Enter}}. Iginuhit ang mga pipe, itinatakda ang kanilang invert mula sa mga patakaran, at sinasabi ng status bar, halimbawa, "3 pipe ang naiguhit, 12 invert ang naitakda mula sa mga patakaran; pumasa ang bawat check."

Ang mga bagong structure ay pinangalanang S1, S2 … na may diameter na 48 in (1200 mm). Ang mga bagong pipe ay pinangalanang P1, P2 … na may diameter na 12 in (300 mm). Nasa inch ang mga diameter sa feet project at nasa millimeter sa meter project.

Tapusin gamit ang {{key:Enter}}. Gumagana rin ang double-click, pero kapag nag-double-click ka sa umiiral na structure para tapusin doon ang run, nawawala ang pagsali: i-click ito nang isang beses, saka pindutin ang {{key:Enter}}.

## Itakda ang iyong mga patakaran

Kapag walang napili, may bloke na **Pipe network** ang kanang panel (**Project**):

| Setting | Panimulang halaga | Ibig sabihin |
|---|---|---|
| Uri | Storm | {{ui:Storm}} o {{ui:Sanitary}}; isinusulat sa LandXML |
| Pinakamababang slope | 0.50% | Bawat pipe ay dapat bumaba nang kahit ganito kalaki |
| Pinakamababang cover | 2 ft (0.6 m) | Mula lupa hanggang crown ng pipe, sa buong haba ng pipe |
| Drop sa mga structure | 0.10 ft (0.03 m) | Ang invert ng outlet ay dapat hindi bababa sa ganitong layo sa ibaba ng bawat inlet invert |

**Placeholder lang ang mga panimulang halagang ito, hindi pamantayan.** Itakda ang mga halagang hinihingi ng ahensya o project mo. Sinusukat ang cover mula sa lupa hanggang sa crown (invert plus panloob na diameter); hindi binibilang ang kapal ng pader. Kung saan ginrado ang pad o corridor, ang ginradong surface ang lupa.

## Hayaang itakda ng CivilCraft ang mga invert

- {{ui:Itakda ang lahat ng invert ayon sa mga patakaran}} (sa bloke na **Pipe network**) ang nagtatakda ng lahat ng pipe.
- {{ui:Itakda ang invert nito ayon sa mga patakaran}} (kapag may isang pipe na napili) ang nagtatakda ng pipe na iyon lang.

Habang nagtatrabaho pababa sa downstream, ang bawat run ay nagsisimula sa pinakamababang cover sa itaas nitong structure, bumababa nang kahit pinakamababang slope, bumababa nang kahit ang drop sa bawat structure, at lumalalim kung saan ang lupa sa kahabaan ng pipe ay mag-iiwan ng mas mababa sa pinakamababang cover. Ibinababa sa 0.01 ang mga invert, hindi kailanman pataas. Sinasabi ng status bar na "Inverts set: least cover at the top of each run, at least the least slope, at least the drop in each structure." o pinangalanan kung ano ang hindi nito nagawa.

## I-edit ang mga structure at pipe

I-click ang structure o pipe gamit ang {{ui:Piliin}} para makita ito sa kanang panel.

**Structure**: **Name**, **Rim**, **Sump depth**, **Diameter**, saka **Rim used**, **Sump**, **Easting** at **Northing**, at ang mga pipe papasok at palabas kasama ang kanilang invert.

- Iwanang walang laman ang **Rim** para kunin ito sa surface; ipinapakita noon ng kahon ang halaga ng surface sa kulay abo. I-type ang halaga para i-fix ang rim.
- I-drag ang grip ng structure sa plan para ilipat ito. Sumusunod ang mga pipe nito; nananatili ang kanilang invert gaya ng dati, kaya suriin ang mga problema pagkatapos.

**Type**: pumili ng isa sa mga uri ng structure ng network (sa ibaba), o none para sa bilog na structure ng sarili nitong diameter.

**Pipe**: **Name**, ang mga structure na pinagdaraanan nito, **Diameter**, **Upper invert**, **Lower invert**, saka **Length**, **Slope** at **Least cover**.

Pindutin ang {{key:Enter}} pagkatapos ng bawat halaga.

## Basahin at ayusin ang mga problema

Inililista ng bloke na **Pipe network** ang bawat problema (hanggang 40); i-click ang isa para piliin ang pipe o structure. Inililista ng napiling pipe o structure ang sarili nitong problema. Kapag wala, sinasabi nito ang "Pumasa sa mga patakaran ang bawat pipe at structure."

| Mensahe (mga halimbawa) | Ano ang gagawin |
|---|---|
| "Umaakyat ang P2 (-0.40%)." o "… patag ang takbo …" | Palitan ang invert, o itakda ang mga ito ayon sa mga patakaran. |
| "Ang P2 sa 0.30% ay mas patag sa minimum na 0.50%." | Ibaba ang downstream invert o itaas ang upstream invert. |
| "Ang P3 ay may cover na 1.40 sa 35 sa kahabaan nito, mas mababa sa minimum na 2." | Ibaba ang pipe; itakda ang mga invert nito ayon sa mga patakaran. |
| "Sa S3, ang P4 ay lumalabas sa 245.20, mas mababa ng 0.1 sa ibaba ng P3 na pumapasok sa 245.25." | Ibaba ang upper invert ng outlet pipe. |
| "Mas mataas ang crown ng P1 kaysa rim ng S1." | Masyadong mataas ang pipe para sa structure. |
| "May 2 pipe na lumalabas sa S2; dapat isang labasan lang ang bawat structure sa gravity network." | Alisin ang isang papalabas na pipe, o iguhit itong muli sa tamang direksyon. |
| "Bumubuo ng loop ang mga pipe; dapat magtapos ang daloy sa outlet." | May run na iginuhit pabalik sa sarili nito; burahin ang isang pipe. |
| "Wala sa surface ang S5 at walang rim elevation." | I-type ang rim, o ilipat ang structure sa ibabaw ng surface. |
| "Bahagyang wala sa surface ang P6; hindi alam ang cover doon." | Palawakin ang surface, o tanggapin na hindi sinusuri doon ang cover. |
| "Wala pang invert ang P7." | I-type ang mga ito, o itakda ayon sa mga patakaran. |

Minamarkahan din ng pula sa plan ang mga problemang pipe at structure.

## Mga uri ng structure

Ang uri ng structure ay structure na binuo mula sa mga parameter nito: manhole, inlet, junction box o outlet, **round** (panloob na diameter) o **rectangular** (panloob na lapad at haba), kasama ang **wall thickness** nito, **floor slab**, isang **sump** sa ibaba ng pinakamababang pipe at isang **frame and cover** (bilog o parihabang bukana, taas ng frame). Kabilang ang mga uri sa network, sa ilalim ng **Structure types** sa Properties ng project.

1. I-click ang {{ui:Bagong uri ng structure}}. Iginuguhit ng dialog ang structure sa plan at sa section habang nagta-type ka.
2. I-click ang {{ui:Idagdag ang uri}}.
3. Pumili ng structure at piliin ang uri sa ilalim ng **Type**. Kinukuha nito ang laki at sump ng uri; maaari pa ring baguhin ang sariling sump nito.

I-edit ang isang uri at susundin ng bawat structure ng uring iyon ang laki nito. Kapag inalis ang uri, mananatiling bilog na structure ang mga structure nito na may parehong lapad. Isang hakbang ang bawat pagbabago: binabawi ito ng {{key:Mod+Z}}.

Iginuguhit ang parihabang structure sa plan, sa DXF, DWG at PDF, at sa 3D bilang parihaba na ang haba nito ay kasabay ng outlet pipe nito; nagsisimula ang mga pipe sa pader nito. Isinusulat ito ng LandXML bilang parihabang structure (`RectStruct`) kasama ang kapal ng pader nito, at binabasa ang ganitong mga structure pabalik bilang mga uri.

### Ibahagi ang uri sa pamamagitan ng library

Isinusulat ng {{ui:I-save bilang library item}} ang uri bilang CadCraft library item (isang `.json` file): ang simbolo nito sa plan, 3D body hanggang sa karaniwang lalim, at bawat laki. I-upload ito sa library para maibahagi. Binabasa ng {{ui:Buksan ang library item}} pabalik sa network ang structure na na-save sa ganitong paraan, na nakonberte sa unit ng project. Tinatanggihan ang mga library item na hindi structure na ginawa sa CivilCraft, kasama ang dahilan.

## Burahin

Piliin ang pipe at pindutin ang {{key:Delete}} para alisin ito. Kapag binura ang structure, kasama ring aalisin ang mga pipe na nakakonekta dito. Sa Mac, pindutin ang Fn at delete, o i-click ang {{ui:Burahin}}.

## Hindi pa ginagawa

Nasa [Storm drainage](topic:storm-drainage) ang mga daloy, laki ng pipe at hydraulic grade line. Hindi pa available ang pipe catalog, hindi bilog na pipe, mga pipe sa profile view, mga kurbadong pipe, at higit sa isang network bawat project. Tingnan ang [Hindi pa ginagawa](topic:not-built-yet).
