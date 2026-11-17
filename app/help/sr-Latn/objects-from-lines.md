---
title: Objekti iz linija, povezani
summary: Napravi popločavanje, zasađenu površinu, gredicu, živicu, stazu, zid, ivičnjak, stepenice, rampu, platformu, jarak ili karakterističnu liniju iz linije; prati je kada se linija pomeri, dok ne prekineš vezu.
keywords: iz linije, linije, DWG, DXF, veza, povezano, prati, ponovo generiši, prekini vezu, karakteristična linija, linija karakteristike iz crteža, uvezeni sloj, obris, SuperCad Studio, linija crteža
from: eb67a0c6
---

{{ui:Iz linije}} (Pejzaž › {{ui:Više}}): klikni karakterističnu liniju, ili liniju ili obris uvezenog sloja DWG/DXF. Zatvorena linija može napraviti popločavanje, travnjak, zasađenu gredicu, livadu, pokrovnu biljku, gredicu ili platformu; otvorena linija stazu, zid, ivičnjak, stepenice (prva i poslednja tačka), rampu, živicu ili jarak. Svaka vrsta može napraviti **karakterističnu liniju**, osim same karakteristične linije.

## Karakteristična linija iz linije

Karakteristična linija napravljena iz linije preuzima njene tačke, zatvorena ako je linija bila zatvorena. Njene kote se postavljaju na postojeći teren (0 ako ga još nema), a njena upotreba je **Isključeno**: ne oblikuje teren dok ne izabereš upotrebu i ne postaviš njene kote u svojstvima. Kada se linija pomeri, karakteristična linija sa istim brojem tačaka zadržava svaku kotu koju si postavio; kada linija dobije ili izgubi tačke, kote se ponovo postavljaju na teren. Vidi [Karakteristične linije](topic:feature-lines).

Novi objekat čuva **vezu** sa svojom linijom. Kada se linija pomeri (prevučeš njene tačke, ili se crtež pomeri ili ponovo pročita), objekat preuzima novi oblik u istom koraku poništavanja, a kroz modifikatore terena predloženi teren prati. Svojstva kažu za šta je vezan; {{ui:Prekini vezu}} ga čini slobodnim.

Linije se prvo proveravaju: linija mora imati najmanje 2 tačke (3 za obris), najviše 5000, realne brojeve; obris mora biti zatvoren i ne sme se seći sam sa sobom. Linija koja ne prođe se ne koristi: objekat ostaje kakav je, a panel Problemi kaže zašto. Ako se linija obriše, objekat ostaje i panel Problemi to beleži.

## U SuperCad Studio

Otvori lokaciju i 2D crtež u istom projektu. Izaberi jednu liniju ili poliliniju u 2D crtežu, pritisni Ctrl+K i pokreni {{ui:Pejzažni objekat iz izabrane linije crteža}}: CivilCraft pita šta da napravi, kao gore, a objekat ostaje povezan sa tom linijom crteža. Posle promene linija u crtežu, Ctrl+K {{ui:Ažuriraj pejzaž iz crteža}} čini da objekti prate, jedan korak poništavanja za svaku liniju. Datoteka veza projekta beleži koji objekat prati koju liniju. Pomoć programa SuperCad Studio ima temu o pejzažu.
