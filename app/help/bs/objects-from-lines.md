---
title: Objekti iz linija, ostaju povezani
summary: Napravite popločanje, zasađenu površinu, gredicu, živicu, stazu, zid, ivičnjak, stepenice, rampu, platformu, jarak ili karakterističnu liniju iz linije; prati je kad se linija pomjeri, dok ne prekinete vezu.
keywords: iz linije, linije, DWG, DXF, veza, povezano, prati, ponovo generiši, prekini vezu, karakteristična linija, linija crteža, uvezeni sloj, obris, supercad studio
from: eb67a0c6
---

{{ui:Iz linije}} (Pejzaž › {{ui:Više}}): kliknite karakterističnu liniju, ili liniju ili obris uvezenog DWG/DXF sloja. Zatvorena linija može napraviti popločanje, travnjak, zasađenu gredicu, livadu, zemljni pokrivač, gredicu ili platformu; otvorena linija stazu, zid, ivičnjak, stepenice (njena prva i posljednja tačka), rampu, živicu ili jarak. Svaka vrsta može napraviti **karakterističnu liniju**, osim same karakteristične linije.

## Karakteristična linija iz linije

Karakteristična linija napravljena iz linije preuzima njene tačke, zatvorena ako je linija bila zatvorena. Njene kote se postavljaju na postojeći teren (0 gdje ga još nema), a njena upotreba je **Isključeno**: ne oblikuje teren dok ne izaberete upotrebu i postavite njene kote u njenim Svojstvima. Kad se linija pomjeri, karakteristična linija s istim brojem tačaka zadržava svaku kotu koju ste postavili; kad linija dobije ili izgubi tačke, kote se ponovo postavljaju na teren. Pogledajte [Karakteristične linije](topic:feature-lines).

Novi objekat zadržava **vezu** sa svojom linijom. Kad se linija pomjeri (povučete njene tačke, ili se crtež pomjeri ili ponovo očita), objekat preuzima novi oblik u istom koraku poništavanja, a kroz modifikatore terena predloženi teren ga prati. Svojstva kažu za šta je povezan; {{ui:Prekini vezu}} ga čini slobodnim.

Linije se prvo provjeravaju: linija mora imati najmanje 2 tačke (3 za obris), najviše 5000, realne brojeve; obris mora biti zatvoren i ne smije se sijeći sam sa sobom. Linija koja ne prođe se ne koristi: objekat ostaje kakav je bio, a panel Problemi kaže zašto. Ako se linija obriše, objekat ostaje, a panel Problemi to bilježi.

## U SuperCad Studio

Otvorite gradilište i 2D crtež u istom projektu. Izaberite jednu liniju ili polilinija u 2D crtežu, pritisnite Ctrl+K i pokrenite {{ui:Objekat pejzaža iz odabrane linije crteža}}: CivilCraft pita šta da napravi, kao gore, i objekat ostaje povezan s tom linijom crteža. Nakon što promijenite linije u crtežu, Ctrl+K {{ui:Ažuriraj pejzaž iz crteža}} čini da objekti prate, jedan korak poništavanja za svaku liniju. Datoteka veza projekta bilježi koji objekat prati koju liniju. Sopstvena pomoć SuperCad Studio ima temu o pejzažu.
