---
title: Transporto priemonių važiavimo trajektorijos
summary: Vairuoti transporto priemonę su iki trijų priekabų išilgai charakteristinės linijos ar trasos, pirmyn arba atbulomis, ir matyti plotą, kurį ji nubraukia, jos ratų kelius, vairo kampą ir vietas, kur ji išsilanksto.
keywords: važiavimo trajektorija, posūkio trajektorija, transporto priemonės sekimas, posūkio šablonas, projektinė transporto priemonė, sunkvežimis, autobusas, priekaba, puspriekabė, atbulinis važiavimas, atbulinis manevravimas, išsilankstymas, lankstumas, vairo užraktas, nuokrypis, ratų kelias, pakrovimo rampa, posūkio spindulys
from: 8caafb8a
---

Važiavimo trajektorija vairuoja transporto priemonę išilgai linijos ir rodo žemės plotą, per kurį praeina jos kėbulas. Naudokite ją patikrinti, ar sunkvežimis gali įsukti į posūkį, pasiekti pakrovimo rampą ar atbulomis įvažiuoti priekaba į vietą nepalikdamas dangos.

## Vairuoti transporto priemonę išilgai linijos

1. Nubrėžkite liniją, kuria važiuoja transporto priemonė, važiavimo kryptimi: charakteristinę liniją (lankai tinka: piešdami paspauskite {{key:C}}, žr. [Charakteristinės linijos](topic:feature-lines)) arba trasą.
2. Pasirinkite ją ir spustelėkite {{ui:Swept path…}} jos **Savybėse**.
3. Pagal **Pradėti nuo** pasirinkite transporto priemonę, tada nustatykite jos matmenis iš savo projektinės transporto priemonės: plotį, priekinį išsikišimą, bazę, galinį išsikišimą, vagą ir **Vairo užraktą**. Pridėkite iki trijų priekabų, kiekvienai nurodydami, kur ji prikabinta, jos ilgį nuo sankabos iki ašies, jos išsikišimus ir **Didžiausią lankstumą**.
4. Pasirinkite **Važiavimas**: pirmyn arba atbulomis. Spustelėkite {{ui:Drive it}}.

:::warning
Transporto priemonės, iš kurių pradedama, yra laikinos reikšmės, o ne standartas. Nustatykite matmenis pagal projektinę transporto priemonę, kurią naudoja jūsų projektas.
:::

## Pirmyn ir atbulomis

| Važiavimas | Ką seka linija | Ką apskaičiuoja CivilCraft |
|---|---|---|
| **Pirmyn** | Priekinės ašies centras | Kur eina galinė ašis ir kiekviena priekaba, vairo kampas ir lankstumas |
| **Atbulomis** | Paskutinės ašies centras (priekabos galas) | Kur eina kiekvienas priekinis vienetas ir vairas, kurio kabinai reikia, kad priekaba atsidurtų ten |

Atbulinis manevras tikrinamas taip: nurodykite, kur turi atsidurti priekaba, o CivilCraft pasako, ar kabina tai gali padaryti.

## Skaityti rezultatą

Važiavimo trajektorija brėžiama plane oranžine spalva: jos kontūras ir brūkšniuota – giausiausių ratų keliai. Pasirinkite ją (spustelėkite jos viduje), kad **Savybėse** pamatytumėte:

- **Nuvažiuotą ilgį**, didžiausią **Vairo** kampą ir **Lankstumą**, palyginti su jų ribomis, ir **Nubrauktą plotą**.
- Bet kokią problemą palei liniją su jos atstumu: vairas viršija užraktą arba priekaba viršija lankstumo ribą (ji išsilanksto).
- **Transporto priemonė palei liniją**: perkelkite slankiklį, kad pamatytumėte transporto priemonę bet kuriame taške, su jos vairu ir lankstumu ten.

Pakeitus liniją, važiavimo trajektorija seka ją. {{ui:Edit the vehicle…}} keičia matmenis; **Važiavimas** perjungia tarp pirmyn ir atbulomis. Kiekvienas pakeitimas yra vienas žingsnis: {{key:Mod+Z}} jį anuliuoja. {{key:Delete}} ištrina pasirinktą važiavimo trajektoriją (linija lieka).

Kontūras ir ratų keliai eina į PDF, DXF ir DWG sluoksnyje C-ROAD-SWPT.

## Kaip tai apskaičiuojama

Kiekvienas vienetas pasisuka apie savo galinės ašies liniją ir yra vilkiamas taško, esančio priekyje (priekinės ašies arba sankabos), – mažo greičio modelis be slydimo, kurį naudoja važiavimo trajektorijų patikros. Nubrauktas plotas yra visų padėčių kėbulo kontūrai, sudėti kartu. Modelis neapima greičio, padangos slydimo, laiko, kurį vairas reikalauja apsisukti, vairuojamų priekabų ar kėbulo laisvo tarpo po juo.
