---
title: Sākuma vērtības un vietturi
summary: Katra vērtība, ar ko CivilCraft sākas jauniem projektiem, attēlojumam, trasēm, platformām, koridoriem, cauruļu tīkliem, tilpumiem un plotiem, un kuras no tām ir vietturi, kas jāaizstāj.
keywords: noklusējumi, iestatījumi, sākuma vērtības, vietturi, projektēšanas kritēriji, standarti, noteikumi, pieņēmumi
from: fbfc7432
---

CivilCraft nav iestatījumu dialoglodziņa vai veidnes. Šīs ir vērtības, ar kurām lietas sākas. Vērtības, kas atzīmētas kā **vietturis**, nav ņemtas no kāda standarta: pirms paļaujaties uz pārbaudi vai daudzumu, aizstājiet tās ar sava projekta kritērijiem.

## Jauns projekts

| Iestatījums | Vērtība |
|---|---|
| Nosaukums | Nenosaukta teritorija (pirmā punktu faila nosaukums to aizstāj) |
| Mērvienības | ASV pēdas |
| Virsmas nosaukums | Esošais reljefs |
| Punktu grupas | Katra grupa sākas kā {{ui:Punkti}} |
| Garākā ārējā mala | 0 (paturēt katru trijstūri) |
| Saglabātie atsaukšanas soļi | 200 |

## Attēlojums

| Iestatījums | Vērtība |
|---|---|
| Virsma | {{ui:Esošais reljefs}} |
| Horizontāles ik pēc | 1 (ft vai m) |
| Galvenās ik pēc | 5. horizontāle |
| Joslas | 8 |
| Ieslēgts | Horizontāles, horizontāļu uzraksti, punkti, lūzumlīnijas, virsmas mala, caurules |
| Izslēgts | Trijstūri, augstuma joslas, nogāžu bultiņas, punktu uzraksti |

## Trases un profili

| Iestatījums | Vērtība |
|---|---|
| Nosaukums | Trase 1, Trase 2 … |
| Sākuma pikets | 0+00 |
| Līknes rādiuss katrā iekšējā PI | 100 ft vai 30 m, mazāks, ja tas neietilpst pusē no katras tangentes |
| Projektētais profils | Nav, līdz to sākat; {{ui:Sākt no terēna}} novieto PVI uz terēna katrā galā |
| Vertikālās līknes garums | 0 (bez līknes), līdz to ierakstāt |

## Platformas

| Iestatījums | Vērtība |
|---|---|
| Nosaukums | Platforma 1, Platforma 2 … |
| Augstums | Terēns platformas vidū, noapaļots līdz 0.1 (0, ja vidus ir ārpus virsmas) |
| Griezuma nogāze | 2 : 1 (vietturis) |
| Uzbēruma nogāze | 3 : 1 (vietturis) |

## Koridora sastāvs (vietturi)

| Iestatījums | ASV pēdas | Metri |
|---|---|---|
| Joslas platums | 12 ft | 3.6 m |
| Joslas slīpums | 2% | 2% |
| Uzbrauktuves platums | 4 ft | 1.2 m |
| Uzbrauktuves slīpums | 4% | 4% |
| Griezuma nogāze | 2 : 1 | 2 : 1 |
| Uzbēruma nogāze | 3 : 1 | 3 : 1 |
| Šķērsgriezums ik pēc | 10 ft | 5 m |

## Cauruļu tīkls

| Iestatījums | ASV pēdas | Metri |
|---|---|---|
| Nosaukums un veids | Lietus, lietus | Lietus, lietus |
| Mazākais slīpums (vietturis) | 0.50% | 0.50% |
| Mazākais segums (vietturis) | 2 ft | 0.6 m |
| Kritums konstrukcijās (vietturis) | 0.10 ft | 0.03 m |
| Jaunas konstrukcijas diametrs | 48 in | 1200 mm |
| Jaunas caurules diametrs | 12 in | 300 mm |
| Dūņu kameras dziļums | 0 | 0 |
| Vāks | No virsmas | No virsmas |

Cauruļu tīkls, kas atvērts no LandXML, izmanto arī šos noteikumus, jo LandXML tos nesatur.

## Tilpumi

| Iestatījums | Vērtība |
|---|---|
| Metode | Režģis, paraugi ņemti šūnu centros iekš nogāzes robežlīnijām |
| Šūnas izmērs | Izvēlēts tā, lai izlīdzinātās zonas ierobežojošais taisnstūris ietvertu aptuveni 250,000 šūnu (1, 2 vai 5 reizes desmit pakāpe) |
| Sabiezēšana un saraušanās | Nav |

## Plots

| Iestatījums | Vērtība |
|---|---|
| Zona | {{ui:Viss}} |
| Papīrs | Tabloid 11 × 17 in (pēdu projektiem), ISO A3 (metru projektiem); vienmēr ainava |
| Mērogs | Lielākais uzskaitītais mērogs, kas ietilpst |
| Tinte | {{ui:Slāņu krāsas}} |

DXF uzraksti ir izmēroti mērogam, kurā viss ietilpst uz Tabloid (pēdas) vai A3 (metri).
