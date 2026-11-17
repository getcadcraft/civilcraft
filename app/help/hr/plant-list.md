---
title: Popis biljaka
summary: Oko 420 uobičajenih biljaka umjerenog i mediteranskog pojasa s veličinama, otpornošću, svjetlošću i vodom, pretraživih na bilo kojem jeziku, uz vlastiti popis spremljen s projektom.
keywords: popis biljaka, baza biljaka, vrsta, botanički naziv, uobičajeni naziv, paleta biljaka, popis rasadnika, zona otpornosti, csv, uvoz biljaka, izvoz biljaka, moje biljke, popis stabala, popis grmova, knjižnica biljaka
from: 7ed09e7e
---

Odjeljak **Biljke** na lijevoj ploči prikazuje svaku biljku koju možete postaviti. Kliknite biljku da vidite njezine veličine i da je postavite kao biljku koju koriste **Biljka**, **Gredica** i **Živica**.

## Pretraga i filtriranje

Upišite u **Traži**: bilo koju riječ iz naziva biljke na bilo kojem jeziku (engleskom, španjolskom, portugalskom), njezin botanički naziv, vrstu ili riječ iz njezinih bilješki. Mora se podudarati svaka riječ koju upišete, pa `quercus evergreen` pronalazi zimzelene hrastove. Dijakritički znakovi ne igraju ulogu.

Suzite popis pomoću **Vrste**, **Svjetlosti**, **Vode** i **Zone otpornosti** (USDA zona u kojoj je vaša lokacija: biljka je navedena kad je zona unutar njezina raspona).

## Što biljka sadrži

| Polje | Značenje |
|---|---|
| Vrsta | Stablo, grm, živica, trava (uključujući travnjake), trajnica, pokrovnica ili penjačica |
| U zrelosti | Visina i širina biljke uzgojene u vrtu ili na ulici, u metrima |
| Pri sadnji | Veličina u kojoj se sadi i njezina posuda |
| Razmak | Od središta do središta u gredici ili duž živice |
| Zona otpornosti | USDA zone u kojima je obično otporna |
| Svjetlost, voda, tlo | Što joj treba |
| Bilješke | Namjena i upozorenja, npr. otrovni dijelovi ili biljka koja se širi |

:::note
Ugrađeni popis za CadCraft sastavljen je iz općeg hortikulturnog znanja: tipične veličine, zaokružene. Nije katalog nijednog rasadnika. Veličine i otpornost provjerite u lokalnom rasadniku. Najpoznatije invazivne biljke Iberskog poluotoka i velikog dijela umjerenog pojasa namjerno su izostavljene, a nekoliko koje su invazivne negdje imaju bilješku.
:::

## Vlastite biljke

- **Dodaj na popis ovog projekta** kopira biljku na vlastiti popis projekta, gdje se sprema uz projekt. Biljka na vašem popisu zamjenjuje ugrađenu s istim ključem, pa njezine veličine možete promijeniti za svoju regiju.
- **Uvezi popis biljaka…** čita CSV (ili datoteku biljaka). CSV treba stupac s botaničkim nazivom i, po mogućnosti, vrstu, visinu i širinu; nazivi stupaca mogu biti vaši (Latin, Common name, Height, Spread, Width, Zone). Čitaju se zarezi, točka-zarezi ili tabulatori te decimalni zarezi. Prazne veličine pri sadnji, razmak i posude dobivaju razumne zadane vrijednosti za vrstu.
- **Izvezi kao CSV** sprema vaš popis (ili, ako ga nema, biljke koje prikazuje pretraga) za otvaranje u proračunskoj tablici.

Popis biljaka čita se kao svaka datoteka izvana: sve što ne može upotrijebiti izostavlja se i broji.

## Biljke u drugim aplikacijama

Popis biljaka je jedna knjižnica za sve CadCraft aplikacije: BimCraft i ModelCraft imaju isti popis, ali njihova vlastita funkcija Postavi iz knjižnice još ne nudi biljke. Danas biljke u BIM model dolaze preko krajobraznog IFC-a programa CivilCraft (svaka biljka kao `IfcGeographicElement`). Vidi [Sadnja](topic:planting#ifc).
