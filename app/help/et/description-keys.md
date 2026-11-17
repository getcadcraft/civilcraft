---
title: Kirjelduse võtmed ja joonekoodid
summary: Muuda väljakoodid kirjeldustega punktigruppideks ja ühenda koodiga punktid joonteks (algus, lõpp, sulgemine), mis muutuvad murdejoonteks.
keywords: kirjelduse võtmed, väljakoodid, joonekoodid, joonised, joonestik, algus, lõpp, sulgemine, punktigrupid, koodid, mõõdistuskoodid, andmekogur, murdejooned, sõiduteeserv
from: b3d1af8d
---

Mõõdistusmeeskonnad kodeerivad iga mõõdu väljal: `EP` sõiduteeserv, `TC` bordüüri ülaserv, `BLDG` hoone nurk. Kood on punkti kirjelduse esimene sõna. CivilCraft rühmitab punktid selle järgi ja muudab sellele järgnevad joonekoodid joonteks.

## Joonekoodid

Joonekood on sõna vahetult väljakoodi järel:

| Kirjeldus | Tähendus |
|---|---|
| `EP B` | Alusta uut sõiduteeserva joont selles punktis |
| `EP` | Jätka praegust EP-joont |
| `EP E` | Lõpeta praegune EP-joon selles punktis |
| `BLDG C` | Sulge hoone: ühenda see punkt joone esimese punktiga |

Sama koodiga punktid ühendatakse punktinumbrite järjekorras. Erinevad koodid on erinevad jooned isegi siis, kui nad jagavad sama gruppi, nii et `EP1` ja `EP2` annavad korraga kaks serva. Kood, mis ei kasuta ühtegi joonekoodi, ühendatakse läbi kõigi oma punktide, nagu varasemates versioonides.

Rühma joontest, mida kasutatakse **Murdejoonena**, saavad murdejooned, üks iga joone kohta, nii et lõhega bordüüri ei venitata üle lõhe. Teiste rühmade jooned joonistatakse plaanile (kiht V-NODE-LINE) ja lähevad DXF-i, DWG-sse ja PDF-i.

Alguse, lõpu ja sulgemise sõnad on `B`, `BEG`, `START`; `E`, `END`; ja `C`, `CLO`, `CLOSE`. Muuda neid või lülita joonekoodid välja allpool olevas dialoogis.

## Kirjelduse võtmed

Kirjelduse võti muudab koodi punktigrupiks, kasutuseks ja pikaks kirjelduseks.

1. Jaotises **Punktid** klõpsa {{ui:Kirjelduse võtmed ja joonekoodid}}.
2. Klõpsa {{ui:Lisa võti}} ja täida rida:
   - **Kood**: väljakood, mida sobitada. `*` tähistab mis tahes märke ja `?` ühte märki, nii et `EP*` haarab EP, EP1 ja EP12.
   - **Rühm**: punktigrupp, kuhu need punktid kuuluvad (tühi = kood ise). `EP*` rühmaga `EP` paneb EP1 ja EP2 ühte gruppi, kuigi need jäävad eraldi joonteks.
   - **Kasutus**: Punktid, Murdejoon või Jäetakse välja, kui rühm esimest korda ilmub (või jäta see tabelile **Punktid**).
   - **Kirjeldus**: pikk nimi, mida näidatakse punkti **Omadustes**.
3. Veerg **Punktid** loeb iga võtme haaratud punkte, kui sa kirjutad. Esimene sobiv võti võidab koodi.
4. Klõpsa {{ui:Rakenda}}. Rühmad, pind ja plaan järgivad ühe sammuga: {{key:Mod+Z}} võtab selle tagasi.

Rühm säilitab kasutuse, mille andsid sellele tabelis **Punktid**; võtme kasutus seab selle ainult uuele rühmale. Võtmed ja joonekoodid salvestatakse projektifaili.
