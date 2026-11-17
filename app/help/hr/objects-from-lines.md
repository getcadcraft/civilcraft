---
title: Objekti iz linija, zadržani povezani
summary: Napravite popločenje, zasađenu površinu, gredicu, živicu, stazu, zid, rubnjak, stube, rampu, platformu, travnati jarak ili značajnu liniju iz linije; prati se kad se linija pomakne, dok ne prekinete vezu.
keywords: iz linije, linije, DWG, DXF, veza, povezano, prati, ponovno izradi, prekini vezu, značajna linija, značajna linija iz linija, uvezeni sloj, obris, supercad studio, crtna linija
from: eb67a0c6
---

{{ui:S linije}} (Krajobraz › {{ui:Više}}): kliknite značajnu liniju ili liniju ili obris uvezenog sloja DWG/DXF-a. Zatvorena linija može napraviti popločenje, travnjak, zasađenu gredicu, livadu, pokrovnicu, gredicu ili platformu; otvorena linija stazu, zid, rubnjak, stube (njihova prva i zadnja točka), rampu, živicu ili travnati jarak. Oba tipa mogu napraviti **značajnu liniju**, osim same značajne linije.

## Značajna linija iz linije

Značajna linija napravljena iz linije preuzima njezine točke, zatvorena ako je linija bila zatvorena. Njezine kote se postavljaju na postojeći teren (0 gdje ga još nema), a njezina namjena je **Isključeno**: ne oblikuje teren dok ne odaberete namjenu i ne postavite kote u njezinim **Svojstvima**. Kad se linija pomakne, značajna linija s istim brojem točaka zadržava svaku kotu koju ste postavili; kad linija dobije ili izgubi točke, kote se ponovno postavljaju na teren. Vidi [Značajne linije](topic:feature-lines).

Novi objekt zadržava **vezu** sa svojom linijom. Kad se linija pomakne (povučete njezine točke ili se crtež pomakne ili ponovno pročita), objekt poprima novi oblik u istom koraku poništavanja, a projektirani teren ga prati kroz modifikatore terena. U **Svojstvima** piše s čim je povezan; {{ui:Prekini vezu}} ga oslobađa.

Linije se provjeravaju prve: linija mora imati najmanje 2 točke (3 za obris), najviše 5000, realne brojeve, obris mora biti zatvoren i ne smije se sjeći sam sa sobom. Linija koja ne prođe se ne koristi: objekt ostaje kakav je, a ploča Problemi kaže zašto. Ako se linija izbriše, objekt ostaje, a ploča Problemi to bilježi.

## U programu SuperCad Studio

Otvorite lokaciju i 2D crtež u istom projektu. Odaberite jednu liniju ili polilinijski objekt u 2D crtežu, pritisnite Ctrl+K i pokrenite {{ui:Krajobrazni objekt iz odabrane linije crteža}}: CivilCraft pita što napraviti, kao gore, a objekt ostaje povezan s tom linijom crteža. Nakon što promijenite linije u crtežu, Ctrl+K {{ui:Ažuriraj krajobraz iz crteža}} čini da objekti slijede, jedan korak poništavanja za svaku liniju. Datoteka veza projekta bilježi koji objekt prati koju liniju. Pomoć programa SuperCad Studio ima temu o krajobrazu.
