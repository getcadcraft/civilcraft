---
title: Çelësat e përshkrimit dhe kodet e vijave
summary: Kthe kodet e fushës në grupe pikash me përshkrime, dhe bashko pikat e kodifikuara në vija (fillimi, fundi, mbyllja) që bëhen vija të thyerjes.
keywords: çelësat e përshkrimit, kodet e fushës, kodet e vijave, figurat, vizatimi linear, fillimi, fundi, mbyllja, grupet e pikave, kodet, kodet e rilevimit, regjistruesi i të dhënave, vijat e thyerjes, bordurë, kufiri i rrugëzimit
from: b3d1af8d
---

Ekipet e rilevimit kodojnë çdo matje në terren: `EP` për kufirin e rrugëzimit, `TC` për majën e bordurës, `BLDG` për një qoshe ndërtese. Kodi është fjala e parë e përshkrimit të pikës. CivilCraft i grupon pikat sipas tij, dhe kthen kodet e vijave që vijnë pas tij në vija.

## Kodet e vijave

Një kod vije është fjala që vjen menjëherë pas kodit të fushës:

| Përshkrimi | Kuptimi |
|---|---|
| `EP B` | Fillon një vijë të re të kufirit të rrugëzimit në këtë pikë |
| `EP` | Vazhdon vijën EP aktuale |
| `EP E` | Mbyll vijën EP aktuale në këtë pikë |
| `BLDG C` | Mbyll ndërtesën: lidh këtë pikë me pikën e parë të vijës |

Pikat me të njëjtin kod lidhen sipas numrit të pikës. Kodet e ndryshme janë vija të ndryshme edhe kur ndajnë një grup, kështu që `EP1` dhe `EP2` japin dy skaje njëkohësisht. Një kod që nuk përdor kod vije lidhet përmes të gjitha pikave të tij, si në versionet e mëparshme.

Vijat në një grup të përdorur si **Vijë e thyerjes** bëhen vija të thyerjes, një për çdo vijë, kështu që një bordurë me hendek nuk shtrihet përtej hendekut. Vijat në grupe të tjera vizatohen në plan (shtresa V-NODE-LINE) dhe dalin në DXF, DWG dhe PDF.

Fjalët për fillimin, fundin dhe mbylljen janë `B`, `BEG`, `START`; `E`, `END`; dhe `C`, `CLO`, `CLOSE`. Ndryshojini, ose fikni kodet e vijave, në dialogun më poshtë.

## Çelësat e përshkrimit

Një çelës përshkrimi e kthen një kod në grup pikash, një përdorim dhe një përshkrim të gjatë.

1. Nën **Pikat**, kliko {{ui:Çelësat e përshkrimit dhe kodet e vijave}}.
2. Kliko {{ui:Shto një çelës}} dhe plotëso rreshtin:
   - **Kodi**: kodi i fushës për t'u përputhur. `*` do të thotë çdo karakter dhe `?` një karakter, kështu që `EP*` kap EP, EP1 dhe EP12.
   - **Grupi**: grupi i pikave që bashkohen (bosh = vetë kodi). `EP*` me grupin `EP` vendos EP1 dhe EP2 në një grup ndërkohë që mbeten vija të veçanta.
   - **Përdorimi**: Pikat, Vijë e thyerjes ose Lëre jashtë, për kur shfaqet për herë të parë grupi (ose lëreni për tabelën **Pikat**).
   - **Përshkrimi**: emri i gjatë, që shfaqet te **Vetitë** e një pike.
3. Kolona **Pikat** numëron pikat që kap çdo çelës ndërsa shkruani. Çelësi i parë që përputhet me një kod fiton.
4. Kliko {{ui:Apliko}}. Grupet, sipërfaqja dhe plani ndjekin në një hap: {{key:Mod+Z}} e zhbën.

Një grup e mban përdorimin që i dhatë në tabelën **Pikat**; përdorimi i një çelësi e vendos vetëm për një grup të ri. Çelësat dhe kodet e vijave ruhen në skedarin e projektit.
