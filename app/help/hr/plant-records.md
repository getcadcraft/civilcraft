---
title: Zapisi biljaka, kultivari i isporučene veličine
summary: Vlastiti popis biljaka projekta kao tablica: kultivari, isporučene veličine (posuda, korijenska bala, opseg, slobodno deblo), gustoća, bilješke o specifikaciji, CSV ulaz i izlaz; svaka postavljena biljka navodi veličinu; simboli biljaka prema mjerilu te vlastiti simboli i 3D modeli.
keywords: tablica biljaka, baza biljaka, kultivar, sorta, isporučena veličina, posuda, korijenska bala, golo korijenje, opseg, slobodno deblo, gustoća, biljke po kvadratnom metru, specifikacija, bilješke specifikacije, simbol biljke, blok, vlastiti simbol, 3D biljka, razina detalja, mjerilo
from: 12251beb
---

Otvorite {{ui:Tablica biljaka}} iz izbornika {{ui:Više}} grupe Krajobraz ili iz odjeljka Biljke. Svaki redak je zapis biljke na vlastitom popisu ovog projekta (zapis s popisa biljaka kopira se kad ga dodate). Svaka izmjena provjerava se kao uvezena datoteka i jedan je korak poništavanja.

## Stupci

- **Botanički naziv**, **Uobičajeni naziv**, **Vrsta**, **Visina** i **Širina** u zrelosti (metri).
- **Razmak** (od središta do središta) ili **Gustoća** (biljaka po m²). Gredica zapisa s gustoćom i bez razmaka puni se tom gustoćom, prema svom uzorku (trokutastom ili kvadratnom).
- **Isporučene veličine**: jedan unos po veličini, odvojen s `;`. Svaki unos je oznaka, vrsta (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) i zatim bilo što od: volumen `10L`, visina `h0.6`, širina `s0.4`, opseg `g14-16` (cm), slobodno deblo `st1.8`. Primjer: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Kultivari**: nazivi odvojeni s `;`. Kultivar zadržava vlastite veličine i bilješke kad ih je imala uvezena datoteka.
- **Bilješke o specifikaciji**.

{{ui:Dupliciraj}} kopira redak pod novim ključem; {{ui:Spremi kao CSV}} i {{ui:Spremi kao datoteku biljaka}} zapisuju popis (CSV reci za kultivare nalaze se ispod svoje vrste, s `cultivar_of`). Uvoz CSV-a ili datoteke biljaka spaja ih u popis.

## Vlastiti popis biljaka iz knjižnice

Prijavite se na svoj CadCraft račun (Postavke, Vaši dodaci, Prijava) pa tablica biljaka može koristiti popis koji čuvate u knjižnici:

- {{ui:Iz mog popisa knjižnice}} unosi vaše vlastite stavke biljaka (uključujući one koje još čekaju pregled). Biljka koju već imate ovdje ažurira se iz knjižnice; kultivari, isporučene veličine, gustoća i specifikacija koje ste ovdje dodali se zadržavaju.
- {{ui:Spremi kao popis biljaka}} sprema svaki redak kao vašu vlastitu stavku biljke u knjižnici, jednu stavku po vrsti: nova biljka je nova stavka, promijenjena biljka je nova verzija, nepromijenjena ostaje netaknuta. Prvo označite okvir: spremanjem biljke dajete javnosti pod CC0. Prvi javni prijenos osobe kojoj se još ne vjeruje provjerava čovjek prije nego što se pojavi, kao i svaki prijenos.

Knjižnica čuva osnovni zapis biljke. Kultivari, isporučene veličine, gustoća i bilješke o specifikaciji ostaju u projektu i u datoteci biljaka ({{ui:Spremi kao datoteku biljaka}}); dijaloški okvir pri svakom spremanju kaže koliko redaka to utječe.

## Postavljena biljka navodi veličinu

Odaberite biljku, živicu ili redak mješavine gredice ili zasađene površine: kad zapis ima kultivare ili isporučene veličine, {{ui:Sorta i veličina}} bira jedno. Popis biljaka tada broji po vrsti, kultivaru i veličini, a oznaka ih može prikazati: `{botanical} '{cultivar}' {size}` ili `{full}`.

## Simboli biljaka prema mjerilu

{{ui:Grafika biljaka}} (Krajobraz › Više) određuje kako se biljke crtaju u tlocrtu: **automatski** (grublje od 1:500 kružnica prema širini, između 1:200 i 1:500 obris sa središtem, sitnije detaljan simbol; oba mjerila mogu se promijeniti) ili jedna razina za svako mjerilo. Dijaloški okvir Listovi ima vlastitu **Detaljnost biljke u tlocrtu** za taj skup.

Na zapisu u odjeljku Biljke, {{ui:Vlastiti simbol…}} čita SVG ili blok DXF/DWG crteža i crta ga prema širini biljke na detaljnoj razini. {{ui:Vlastiti 3D model…}} čita OBJ, STL ili GLB; u Grafici biljaka odaberite **Vlastiti model svakog zapisa** da ga vidite u 3D-u. Datoteke su ograničene (512 KB SVG-a, 2000 oblika, 50 000 trokuta) i čuvaju se u projektu. SVG transformacije se ne primjenjuju (bit ćete obaviješteni kad datoteka ima). Razine, ograničenja i što GLB smije sadržavati vidi u [Grafika biljaka, vlastiti simboli i 3D biljke](topic:plant-graphics).
