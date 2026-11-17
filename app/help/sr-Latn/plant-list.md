---
title: Spisak biljaka
summary: Oko 420 uobičajenih umerenih i mediteranskih biljaka sa njihovim veličinama, otpornošću, svetlom i vodom, pretraživih na bilo kom jeziku, plus vaš sopstveni spisak sačuvan uz projekat.
keywords: spisak biljaka, baza biljaka, vrste, botanički naziv, uobičajen naziv, paleta biljaka, rasadnički spisak, zona otpornosti, csv, uvoz biljaka, izvoz biljaka, moje biljke, spisak drveća, spisak žbunja, biblioteka biljaka
from: 7ed09e7e
---

Odeljak **Biljke** u levom panelu navodi svaku biljku koju možete postaviti. Kliknite na jednu da vidite njene veličine i da je učinite biljkom koju koriste **Biljka**, **Gredica** i **Živica**.

## Pretraga i filter

Ukucajte u **Pretraga**: bilo koju reč naziva biljke na bilo kom jeziku (engleskom, španskom, portugalskom), njen botanički naziv, njen tip ili reč iz njenih napomena. Svaka reč koju ukucate mora da se podudara, pa `quercus evergreen` nalazi zimzelene hrastove. Dijakritički znaci se ne uzimaju u obzir.

Suzite listu pomoću **Tip**, **Svetlo**, **Voda** i **Zona otpornosti** (USDA zona u kojoj je vaša lokacija: biljka je na spisku kada je zona u njenom opsegu).

## Šta nosi biljka

| Polje | Značenje |
|---|---|
| Tip | Drvo, žbun, živica, trava (uključujući travnjake), trajnica, pokrivač tla ili penjačica |
| Pri zrelosti | Visina i širina biljke odrasle u bašti ili na ulici, u metrima |
| Pri sadnji | Veličina u kojoj se sadi i njen kontejner |
| Razmak | Od centra do centra u gredici ili duž živice |
| Zona otpornosti | USDA zone u kojima obično izdržava |
| Svetlo, voda, zemljište | Šta joj treba |
| Napomene | Upotreba i upozorenja, na primer otrovni delovi ili biljka koja se širi |

:::note
Ugrađeni spisak je za CadCraft napisan iz opšteg hortikulturnog znanja: tipične veličine, zaokružene. To nije katalog nijednog rasadnika. Proverite veličine i otpornost kod lokalnog rasadnika. Najpoznatije invazivne biljke Iberijskog poluostrva i većeg dela umerenog sveta namerno su izostavljene, a nekoliko koje su invazivne negde nose napomenu.
:::

## Vaše sopstvene biljke

- **Dodaj na spisak ovog projekta** kopira biljku u sopstveni spisak projekta, gde se čuva uz projekat. Biljka na vašem spisku zamenjuje ugrađenu sa istim ključem, pa možete promeniti njene veličine za svoj region.
- **Uvezi spisak biljaka…** čita CSV (ili datoteku biljaka). CSV treba da ima kolonu sa botaničkim nazivom i, po mogućnosti, tip, visinu i širinu; nazivi kolona u vašim rečima takođe rade (Latin, Common name, Height, Spread, Width, Zone, na primer kao latinski naziv, uobičajeni naziv, visina, širina, zona). Čitaju se zarezi, tačka-zarezi ili tabulatori, kao i decimalni zarezi. Prazne veličine sadnje, razmaci i kontejneri dobijaju razumne podrazumevane vrednosti za tip.
- **Izvezi kao CSV** čuva vaš spisak (ili, ako ga nemate, biljke koje pretraga prikazuje) da ga otvorite u tabelarnom programu.

Spisak biljaka se čita kao svaka spoljna datoteka: sve što ne može da se koristi se izostavlja i broji.

## Biljke u drugim programima

Spisak biljaka je jedna biblioteka za svaki CadCraft program: BimCraft i ModelCraft nose isti spisak, ali njihovo sopstveno Postavi iz biblioteke još ne nudi biljke. Danas biljke stižu do BIM modela preko IFC datoteke uređenja iz CivilCraft-a (svaka biljka je `IfcGeographicElement`). Pogledajte [Sadnja](topic:planting#ifc).
