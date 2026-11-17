---
title: Pārbaudīt uzmērījuma zīmējumu importēšanas laikā
summary: Nolasīt augstumus, kas rakstīti kā teksts vai bloku atribūti, kā uzmērīšanas punktus, un pārbaudīt DWG vai DXF nepareizas mērvienības, trūkstošu koordinātu sistēmu, tālu sākumpunktu, plakanas horizontāles, dīvainus augstumus un dubultotus punktus, pirms no tā veidojat zemi.
keywords: uzmērījuma pārbaude, importa pārbaude, uzmērījuma augstumi, atzīmju augstumi, teksta augstumi, augstumi kā teksts, atribūti, mērvienības, koordinātu sistēma, tālu no sākumpunkta, horizontāles nulles augstumā, izlecošas vērtības, dublēti punkti, problēmas, ainavu arhitekts, uzmērījuma zīmējums
from: d46acd24
---

Uzmērījuma zīmējums var izskatīties pareizs un tomēr būt nepareizs zemei: tā mērvienības var būt tikai pieņemtas, tā horizontāles var atrasties plakanas 0 augstumā, vai tā augstumi var būt rakstīti kā teksts, kas nemaz nav ģeometrija. Sadaļa **Uzmērījuma augstumi un pārbaude** dialogā {{ui:Līnijzīmējums}} (skatiet [Atvērt DWG vai DXF kā līnijzīmējumu](topic:open-dwg-dxf)) nolasa šos augstumus un pasaka, kas izskatās nepareizi, pirms kaut kas tiek pievienots.

## Augstumi, kas rakstīti kā teksts vai atribūtos

Daudzi uzmērījuma zīmējumi dod punktveida augstumu kā mazu tekstu blakus krustiņam, piemēram, `104.37` vai `EL 104.37`, vai kā punkta bloka atribūtu. Tās nav līnijas, tāpēc līnijzīmējumu nolasītājs tās atstāj ārpusē. Sadaļā ir uzskaitīts, cik to atrasts, un varat tās paņemt kā **uzmērīšanas punktus**:

1. Atzīmējiet **Ņemt … augstumus kā uzmērīšanas punktus**. Sākumā tie nav atzīmēti, jo ne katrs skaitlis zīmējumā ir augstums.
2. Teksts tiek nolasīts, ja tas ir augstums pats par sevi: skaitlis ar decimāldaļu (`104.37`, `+104,37`, `-3.50`) vai skaitlis aiz `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` vai `LEVEL`, ar izvēles `m`, `ft` vai `'` aiz tā. Vesels skaitlis viens pats (`12`) tiek nolasīts kā gabala vai lapas numurs, nevis augstums; teksts, piemēram, `GATE 3` vai datums, nekad netiek nolasīts. Teksta formatēšanas kodi tiek ignorēti.
3. Bloku atribūtiem izvēlieties **Bloka atribūts, kurā ir augstums**. CivilCraft pats atrod tagu ELEV, Z, LEVEL, RL vai līdzīgu; izvēlieties citu no saraksta, ja zīmējums izmanto savu. Izvēle tiek atcerēta šim failu nosaukumam šajā datorā, tāpēc to atverot atkal, sākas ar to pašu tagu. Tags, kuru izvēlaties, arī veselus skaitļus ņem kā augstumus.
4. Noklikšķiniet uz {{ui:Pievienot}}. Punkti tiek numurēti aiz augstākā projekta numura, katrs punkts tiek aprakstīts ar savu slāni (vai bloku), un augstumi tiek pārvērsti projekta mērvienībās kā pārējais zīmējums. Viss tas ir viens solis: {{key:Mod+Z}} noņem punktus.

Teksts atrodas savā ievietošanas punktā (vai izlīdzināšanas punktā, ja tāds ir). Teksts blokos netiek nolasīts, un zīmējums nekad netiek mainīts.

## Pārbaude

Pārbaude attiecas uz to, ko gatavojaties ievest, un uzskaita atrasto, pa vienai rindai katram problēmas veidam:

| Tas saka | Ko tas nozīmē |
|---|---|
| **Mērvienības nav norādītas** | Zīmējumā nav teikts, kādas ir tā mērvienības, tāpēc tā skaitļi tiek nolasīti kā projekta mērvienības. Pārbaudiet vienu jums zināmu attālumu. |
| **Mērvienības pārvērstas** | Zīmējuma mērvienības atšķiras no projekta, un tās ir mērogotas (piezīme, nevis kļūda). |
| **Dati aptver … km** vai **… m** | Apjoms ir lielāks par 200 km vai mazāks par pusi metra, kas parasti nozīmē nepareizu mērvienību (milimetri nolasīti kā metri vai otrādi). |
| **Nav koordinātu sistēmas** | Projektam tādas nav. Tas ir brīdinājums, kad dati atrodas tālu no nulles, kā valsts plaknes vai nacionālā režģa koordinātes. Skatiet [Koordinātu sistēmas](topic:coordinate-systems). |
| **Tālu no sākumpunkta** | Dati atrodas vairāk nekā 100 km no nulles. Tālu no nulles 3D skati un eksporti zaudē precizitāti un trīc. |
| **Horizontāļu slānim … nav augstuma** | Slānis, kas nosaukts kā horizontāles (TOPO, CONT, CNTR, CONTOUR), satur līnijas 0 augstumā, tāpēc zeme, kas no tām veidota, būtu plakana. |
| **Augstumi tieši 0** | Daži augstumi ir 0, kamēr tipiskais augstums ir tālu no tā: iespējams, trūkst augstumu. |
| **Augstumi tālu no pārējiem** | Daži augstumi atrodas tālu ārpus pārējiem (atrasti attiecībā pret visu augstumu vidu, tāpēc stāva vieta ar plašu diapazonu netiek atzīmēta), vai virs 9,000 m vai zem -11,000 m. |
| **Punkti viens virs otra** | Divi punkti vienā vietā ar vienādu augstumu vai ar dažādiem augstumiem. |

Pēc {{ui:Pievienot}} klikšķa tās pašas rindas nonāk **Problēmās**, pa vienai katram veidam, ar faila nosaukumu, lai varētu atgriezties pie tām. Pārbaude vērtē zīmējumu; tā neko tajā nemaina un neliedz to izmantot.

:::tip
Kad pārbaude saka, ka horizontāles ir plakanas 0 augstumā un ir augstumi, kas rakstīti kā teksts, ņemiet augstumus kā uzmērīšanas punktus: tie bieži satur īstos augstumus, kādu horizontālēm trūkst.
:::

## Ko pārbaude neskata

Pārbaude nesalīdzina zīmējumu ar otru uzmērījumu, un tā nevar pateikt, kādā koordinātu sistēmā atrodas zīmējums: tā tikai pasaka, ka neviena nav iestatīta.
