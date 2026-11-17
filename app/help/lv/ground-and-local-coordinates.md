---
title: Zemes un lokālās koordinātes
summary: Strādāt zemes (virsmas) koordinātēs, kas mērogotas no režģa ar apvienoto mēroga koeficientu, ko ievadāt vai aprēķināt punktā, vai pieņemtā objekta režģī, kas piesaistīts sistēmai ar diviem kontroles punktiem.
keywords: zemes koordinātes, virsmas koordinātes, režģis uz zemi, apvienotais mēroga koeficients, csf, apvienotais koeficients, režģa koeficients, augstuma koeficients, jūras līmeņa koeficients, konverģence, kartes leņķis, mēroga koeficients, pieņemtās koordinātes, lokālās koordinātes, objekta režģis, 5000 5000, kontroles punkti, lokalizācija, kalibrēšana, divu punktu, neatbilstība
from: 3d7453de
---

Valsts plaknes un UTM koordinātes ir **režģa** koordinātes: kartes projekcija nedaudz izstiepj vai saspiež attālumus (desmitiem miljondaļu), un jo augstāka vieta, jo vairāk izmērītais zemes attālums atšķiras no režģa attāluma. Tāpēc daudzas uzmērīšanas nodod **zemes** koordinātes, mērogotas tā, lai plāna attālumi būtu vienādi ar uz zemes izmērītajiem attālumiem, vai **pieņemtu** objekta režģi (5000, 5000 kontroles punktā). CivilCraft saglabā jūsu skaitļus kā tie ir un ieraksta, kā tie saistīti ar režģi, tāpēc platuma un garuma koordinātes, GIS faili un kartes slāņi joprojām nonāk pareizā vietā.

Atveriet {{ui:Koordinātes}} grupā {{ui:GIS}}, izvēlieties (vai paturiet) sistēmu, pēc tam zem **Režģa, zemes vai lokālās koordinātes** izvēlieties:

| Izvēle | Jūsu koordinātes ir | Kā tās saistītas ar režģi |
|---|---|---|
| {{ui:Režģis}} | Sistēmas paša (sākums) | Tie paši skaitļi |
| {{ui:Zeme}} | Mērogotas līdz zemes attālumiem | režģis = bāze + apvienotais koeficients × (zeme − bāze) |
| {{ui:Lokālā}} | Pieņemts objekta režģis | Pārvietots, pagriezts un mērogots uz režģi ar diviem kontroles punktiem |

Jebkura izvēle tiek saglabāta ar projektu un ir viens atsaucams solis; nekas nepārvietojas.

## Zemes koordinātes

1. Izvēlieties {{ui:Zeme}}.
2. Ierakstiet **Apvienoto mēroga koeficientu** no uzmērīšanas (piemēram, `0.99987`) vai aprēķiniet to:
   1. Sadaļā **Aprēķināt koeficientu punktā** punkts sākas projekta vidū. Izvēlieties {{ui:Izvēlēties punktu plānā}} un noklikšķiniet vietu (klikšķis tuvu uzmērīšanas punktam ņem šo punktu) vai ierakstiet E un N.
   2. Augstums nāk no virsmas tajā vietā; ierakstiet citu, ja vajag.
   3. Izvēlieties {{ui:Aprēķināt}}. CivilCraft rāda:
      - **Režģa mēroga koeficientu k**: cik daudz kartes projekcija tur izstiepj attālumus.
      - **Augstuma koeficientu**: cik īsāki ir attālumi elipsoīdā nekā tajā augstumā.
      - **Apvienoto koeficientu** = k × augstuma koeficients: režģa attālums = zemes attālums × šis.
      - **Konverģenci**: leņķis no režģa ziemeļiem līdz patiesajiem ziemeļiem tur (ģeodēziskais azimuts = režģa azimuts + konverģence).
   4. Izvēlieties pogu {{ui:Izmantot}} zem skaitļiem, lai ievietotu apvienoto koeficientu lodziņā.
3. Iestatiet **Bāzes punktu**, kurā zemes un režģa koordinātes ir vienādas. Tas sākas ar 0, 0: lielākā daļa jurisdikciju, kas publicē zemes koordinātes, mērogo ap sākumpunktu, tāpēc zemes koordinātes paliek atpazīstami tuvu režģa koordinātēm. Dažas uzmērīšanas mērogo ap projekta kontroles punktu: izmantojiet to, ko saka uzmērīšana.
4. Izvēlieties {{ui:Lietot}}.

:::warning
Augstums tiek ņemts kā augstums virs elipsoīda. CivilCraft nav geoīda modeļa, tāpēc vietās, kur geoīds ir 30 m (100 ft) zemāk vai augstāk par elipsoīdu, augstuma koeficients ir novirzīts par aptuveni 5 ppm. Kad uzmērīšana norāda savu apvienoto koeficientu, ierakstiet to.
:::

## Lokālās (pieņemtās) koordinātes

1. Izvēlieties {{ui:Lokālā}}.
2. Sadaļā **Kontroles punkts 1** ierakstiet uzmērīšanas punkta numuru (vai izvēlieties {{ui:Izvēlēties}} un noklikšķiniet to plānā). Tā lokālās koordinātes parādās blakus.
3. Ierakstiet tā **režģa** E un N vai tā platumu un garumu trešajā lodziņā (piemēram, `30.2672, -97.7431`).
4. Tāpat darīt ar **Kontroles punktu 2**, cik tālu no pirmā iespējams.
5. CivilCraft rāda atrasto **Mērogu** un **Pagriezienu** un atgādina: **Divi punkti vienmēr sakrīt precīzi — pārbaudiet trešo.**
6. Norādiet **Pārbaudes punktu** tāpat. CivilCraft rāda, cik tālu piemērojums to novieto no režģa koordinātēm, ko ierakstījāt (tā neatbilstību projekta vienībās un miljondaļās). Liela neatbilstība nozīmē nepareizu punktu, ierakstīšanas kļūdu vai koordinātes citās vienībās.
7. Izvēlieties {{ui:Lietot}}.

Mērogs tālu no 1 (ārpus 0.5 līdz 2) tiek noraidīts: pārbaudiet punktus un to vienības.

## Ko pārbaudīts

- Mēroga koeficients un konverģence sakrīt ar PROJ (pyproj 3.7.1 ar PROJ 9.5.1), koordinātu bibliotēku, ko izmanto lielākā daļa GIS programmu, līdz 1 daļai miljardā, pārbaudot vairāk nekā 300 sistēmām ar konformām projekcijām (valsts plakne, UTM, šķērsvirziena Merkatora, Lamberta konusveida konforma) un pārlūkā punktā, kas izvēlēts plānā.
- Zemes un lokālie soļi pārvēršas uz priekšu un atpakaļ līdz 1 daļai miljardā; divi kontroles punkti atdod mērogu un pagriezienu, ar kādiem tie tika izveidoti; pārbaudes punkts 0.05 ft attālumā parāda neatbilstību 0.05 ft.
