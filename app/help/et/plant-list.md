---
title: Taimenimekiri
summary: Umbes 420 tavalist parasvöötme ja Vahemere piirkonna taime koos suuruste, külmakindluse, valguse ja veevajadusega, otsitavad igas keeles, ning sinu projektiga salvestatud oma nimekiri.
keywords: taimenimekiri, taimede andmebaas, liik, botaaniline nimi, tavanimi, taimepalett, istikute nimekiri, külmakindluse tsoon, csv, taimede import, taimede eksport, minu taimed, puude nimekiri, põõsaste nimekiri, taimeloend, taimeteek
from: 7ed09e7e
---

Vasakpoolse paneeli jaotis **Taimed** loetleb kõik taimed, mida saad paigutada. Klõpsa ühele, et näha selle suurusi ja määrata see taimeks, mida kasutavad **Taim**, **Istutusala** ja **Hekk**.

## Otsing ja filtrid

Kirjuta väljale **Otsi** mis tahes sõna taime nimest mis tahes keeles (inglise, hispaania, portugali), botaanilist nime, tüüpi või sõna märkmetes. Iga sõna, mille kirjutad, peab sobima, nii et `quercus evergreen` leiab igihaljad tammed. Rõhumärkidel ei ole tähtsust.

Kitsenda nimekirja väljadega **Tüüp**, **Valgus**, **Vesi** ja **Külmakindluse tsoon** (USDA-tsoon, kus sinu ala asub: taim on nimekirjas, kui tsoon jääb tema vahemikku).

## Mida taim sisaldab

| Väli | Tähendus |
|---|---|
| Tüüp | Puu, põõsas, hekk, rohttaim (sh murud), mitmeaastane, maakate või ronitaim |
| Täiskasvanuna | Taime kõrgus ja laius aias või tänaval kasvanuna, meetrites |
| Istutamisel | Suurus, millega see istutatakse, ja selle konteiner |
| Vahekaugus | Keskpunktist keskpunktini istutusalas või heki real |
| Külmakindluse tsoon | USDA-tsoonid, kus see on tavaliselt talvekindel |
| Valgus, vesi, muld | Mida ta vajab |
| Märkused | Kasutusotstarve ja ettevaatusabinõud, nt mürgised osad või levimisaldis taim |

:::note
Sisseehitatud nimekiri koostati CadCrafti jaoks üldiste aiandusteadmiste põhjal: tüüpilised suurused, ümardatud. See ei ole ühegi taimla kataloog. Kontrolli suurusi ja külmakindlust kohaliku taimla käest. Iberia ja suure osa parasvöötme piirkonna kõige tuntumad invasiivsed taimed on tahtlikult välja jäetud ning mõni taim, mis on invasiivne mõnes piirkonnas, on märkusega tähistatud.
:::

## Sinu oma taimed

- **Lisa projekti nimekirja** kopeerib taime projekti enda nimekirja, kus see salvestatakse projektiga. Sinu nimekirjas olev taim asendab sama võtmega sisseehitatud taime, nii et saad muuta selle suurusi oma piirkonna jaoks.
- **Impordi taimenimekiri…** loeb CSV-faili (või taimefaili). CSV vajab veergu botaanilise nimega ja soovitavalt tüübi, kõrguse ja laiusega; veergude nimed omaenda sõnadega töötavad (näiteks Latin, Common name, Height, Spread, Width, Zone). Loetakse komasid, semikooloneid või tabuleid ning komadega kümnendmurde. Tühjad istutussuurused, vahekaugused ja konteinerid saavad tüübi järgi mõistlikud vaikeväärtused.
- **Ekspordi CSV-na** salvestab sinu nimekirja (või kui seda pole, siis otsingus näidatud taimed), et avada see tabelarvutuses.

Taimenimekirja loetakse nagu iga väljastpoolt tulevat faili: kõik, mida ei saa kasutada, jäetakse välja ja loetakse kokku.

## Taimed teistes rakendustes

Taimenimekiri on üks teek kõigile CadCrafti rakendustele: BimCraft ja ModelCraft kannavad sama nimekirja, kuid nende oma {{ui:Place from library}} ei paku veel taimi. Praegu jõuavad taimed BIM-mudelisse CivilCrafti haljastuse IFC kaudu (iga taim `IfcGeographicElement`). Vt [Istutamine](topic:planting#ifc).
