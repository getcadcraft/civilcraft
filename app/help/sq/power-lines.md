---
title: Hapësira e linjave elektrike
summary: Linjat ajrore dhe kabllot nëntokësorë në vendin tënd, me bibliotekat e tua, shigjetën dhe tensionin sipas rasteve të tua të ngarkesës, kontrolle distance dhe qëndrueshmërie, tabela shtrirjeje, sasi, fletë dhe eksport GIS.
keywords: linjë elektrike, linjë ajrore, elektrike, shpërndarje, shtyllë, mbajtëse, përçues, shigjetë, tension, shtrirje, distancë, kabllo nëntokësor, hendek, hapësirë pune, shërbim publik
from: 638dd856
---

Hapësira e Linjave elektrike vendos linjat ajrore dhe kabllot nëntokësorë mbi vendin tënd të CivilCraft që ke tashmë: të njëjtat pika rilevimi, i njëjti terren, i njëjti skedar projekti.

:::warning
Mjet projektimi. Hapësira llogarit shigjetën, tensionin, distancat dhe ngarkesat nga **rastet e tua të ngarkesës** dhe kufijtë; asnjë standard i asnjë vendi nuk është i ndërtuar brenda. Një inxhinier kontrollon çdo rezultat me standardin që zbatohet, para se të ndërtohet diçka.
:::

## Hape

Zgjidh {{ui:Sipërfaqe}} › {{ui:Më shumë}} › {{ui:Hapësira e linjave elektrike}}, ose **Linjat elektrike** nën Hapësira pune. Shiriti i veglave shfaq atëherë një grup **Linjat elektrike**; grupet Dizajn dhe GIS largohen. Zgjidh **Civil** nën Hapësira pune për t'u kthyer. CivilCraft kujton hapësirën që përdore së fundmi në këtë kompjuter.

Paneli i majtë fiton dy seksione në krye:

- **Linjat elektrike**: rastet e tua të ngarkesës dhe kufijtë, linjat dhe kabllot në projekt, dhe **Kontrollet**, gjithmonë të përditësuara. Kliko një kontroll për të përzgjedhur atë që ka të bëjë me të.
- **Biblioteka**: përçuesit, kabllot, mbajtëset, pajisjet dhe llojet e hendekut të tu. Shih [Biblioteka juaj e linjave elektrike](topic:power-line-library).

## Çfarë ka në grupin Linjat elektrike

| Vegla | Çfarë bën | Temë |
|---|---|---|
| **Vijë** | Një linjë ajrore: kliko çdo mbajtëse | [Vizato një linjë ajrore](topic:overhead-line) |
| **Mbajtëse** | Shto një mbajtëse mbi një shtrirje | [Vizato një linjë ajrore](topic:overhead-line) |
| **Kabllo** | Një rrugë kabllo nëntokësor në një hendek | [Kabllot nëntokësorë](topic:underground-cables) |
| **Pajisje** | Një kabinet, një transformator, një bashkim, ose burimi nga i cili furnizohet rrjeti | [Kabllot nëntokësorë](topic:underground-cables) |
| **Pengesë** | Diçka që kalon një linjë: një rrugë, një ndërtesë, një linjë tjetër | [Kontrollet](topic:power-line-checks) |
| **Profil gjatësor** | Profili i linjës: terreni, mbajtëset dhe përçuesi te çdo rast ngarkese | [Vizato një linjë ajrore](topic:overhead-line#the-line-profile) |
| **Më shumë** | Rastet e ngarkesës dhe kufijtë, tabelat e shtrirjes, sasitë, fletët dhe raporti, GIS, skedarët e studimit | [Shigjeta dhe tensioni](topic:sag-and-tension), [Daljet](topic:power-line-outputs), [Skedarët e studimit](topic:power-line-study-file) |

Çdo gjë që shton është një hap zhbërjeje, ruhet në skedarin e projektit dhe vizatohet në planimetri në shtresa me emra `C-POWR-…`, kështu që eksportet DXF, DWG dhe PDF e mbajnë edhe ato.
