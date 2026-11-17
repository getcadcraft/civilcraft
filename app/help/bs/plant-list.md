---
title: Spisak biljaka
summary: Oko 420 uobičajenih umjerenih i mediteranskih biljaka s njihovim veličinama, otpornošću, svjetlom i vodom, pretraživih na bilo kojem jeziku, te vaš vlastiti spisak sačuvan uz projekat.
keywords: spisak biljaka, baza biljaka, vrste, botaničko ime, uobičajeno ime, paleta biljaka, rasadnički spisak, zona otpornosti, csv, uvoz biljaka, izvoz biljaka, moje biljke, spisak drveća, spisak grmlja, biblioteka biljaka
from: 7ed09e7e
---

Odjeljak **Biljke** lijevog panela prikazuje svaku biljku koju možete postaviti. Kliknite jednu da vidite njene veličine i da je postavite kao biljku koju koriste **Biljka**, **Gredica** i **Živica**.

## Pretraga i filtriranje

Upišite u **Pretraga**: bilo koju riječ iz imena biljke na bilo kojem jeziku (engleskom, španskom, portugalskom), njeno botaničko ime, vrstu ili riječ iz njenih bilješki. Svaka riječ koju upišete mora se podudarati, pa `quercus evergreen` nalazi zimzelene hrastove. Dijakritički znaci se ne uzimaju u obzir.

Suzite listu pomoću **Tip**, **Svjetlost**, **Voda** i **Zona otpornosti** (USDA zona u kojoj je vaša lokacija: biljka je na listi kad je zona unutar njenog raspona).

## Šta biljka nosi

| Polje | Značenje |
|---|---|
| Tip | Drvo, grm, živica, trava (uključujući travnjake), trajnica, pokrivač tla ili penjačica |
| Pri zrelosti | Visina i širina biljke uzgojene u vrtu ili na ulici, u metrima |
| Pri sadnji | Veličina u kojoj se sadi i njen kontejner |
| Razmak | Od centra do centra u gredici ili duž živice |
| Zona otpornosti | USDA zone u kojima obično podnosi |
| Svjetlo, voda, zemljište | Šta joj treba |
| Bilješke | Upotreba i upozorenja, kao što su otrovni dijelovi ili biljka koja se širi |

:::note
Ugrađeni spisak napisan je za CadCraft na osnovu općeg hortikulturnog znanja: tipične veličine, zaokružene. To nije katalog nijednog rasadnika. Provjerite veličine i otpornost kod lokalnog rasadnika. Najpoznatije invazivne biljke Iberije i velikog dijela umjerenog svijeta namjerno su izostavljene, a nekoliko biljaka koje su invazivne negdje nose bilješku.
:::

## Vaše vlastite biljke

- **Dodaj na spisak ovog projekta** kopira biljku u vlastiti spisak projekta, gdje se čuva uz projekat. Biljka na vašem spisku zamjenjuje ugrađenu s istim ključem, pa možete promijeniti njene veličine za svoj region.
- **Uvezi spisak biljaka…** čita CSV (ili datoteku biljaka). CSV treba kolonu s botaničkim imenom i, po mogućnosti, tip, visinu i širinu; nazivi kolona u vašim riječima rade (Latin, Common name, Height, Spread, Width, Zone). Čitaju se zarezi, tačka-zarezi ili tabulatori, te decimalni zarezi. Prazne veličine sadnje, razmaci i kontejneri dobiju razumne zadane vrijednosti za tip.
- **Izvezi kao CSV** sprema vaš spisak (ili, ako ga nema, biljke koje pretraga prikazuje) za otvaranje u tabelarnom programu.

Spisak biljaka se čita kao svaka datoteka izvana: sve što ne može da se upotrijebi se izostavlja i broji.

## Biljke u drugim programima

Spisak biljaka je jedna biblioteka za svaki CadCraft program: BimCraft i ModelCraft nose isti spisak, ali njihova opcija Postavi iz biblioteke još ne nudi biljke. Danas biljke u BIM model dolaze kroz pejzažni IFC iz CivilCraft-a (svaka biljka kao `IfcGeographicElement`). Vidi [Sadnja](topic:planting#ifc).
