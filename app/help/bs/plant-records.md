---
title: Zapisi biljaka, kultivari i navedene veličine
summary: Vaš vlastiti spisak biljaka projekta kao tabela: kultivari, navedene veličine (kontejner, korijenski balon, zapremina, obim debla, čisto deblo), gustina, bilješke o specifikaciji, CSV na ulazu i izlazu; svaka postavljena biljka navodi veličinu; simboli biljaka po razmjeri te vlastiti simboli i 3D modeli.
keywords: tabela biljaka, baza biljaka, kultivar, sorta, navedena veličina, kontejner, korijenski balon, golo korijenje, obim debla, čisto deblo, gustina, biljke po kvadratnom metru, specifikacija, bilješke specifikacije, simbol biljke, blok, vlastiti simbol, 3D biljka, stupanj detalja, razmjera
from: 12251beb
---

Otvorite {{ui:Plant table}} iz menija {{ui:More}} grupe Pejzaž ili iz odjeljka Biljke. Svaki red je zapis biljke na vlastitom spisku ovog projekta (zapis sa spiska biljaka se kopira kad ga dodate). Svaka izmjena se provjerava kao uvezena datoteka i jedan je korak poništavanja.

## Kolone

- **Botaničko ime**, **Uobičajeno ime**, **Tip**, **Visina** i **Širina** pri zrelosti (metri).
- **Razmak** (od centra do centra) ili **Gustina** (biljaka po m²). Gredica zapisa s gustinom i bez razmaka popunjava se tom gustinom, prema vlastitom obrascu (trouglasti ili kvadratni).
- **Navedene veličine**: jedna stavka po veličini, odvojene s `;`. Svaka stavka je ID, vrsta (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) i zatim bilo koje od: zapremina `10L`, visina `h0.6`, širina `s0.4`, obim debla `g14-16` (cm), čisto deblo `st1.8`. Primjer: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Kultivari**: imena odvojena s `;`. Kultivar zadržava svoje veličine i bilješke kad ih je imala datoteka koju ste uvezli.
- **Bilješke o specifikaciji**.

{{ui:Duplicate}} kopira red pod novim ključem; {{ui:Save as CSV}} i {{ui:Save as a plants file}} zapisuju spisak (redovi CSV-a za kultivare stoje ispod njihove vrste, uz `cultivar_of`). Uvoz CSV-a ili datoteke biljaka spaja se s postojećim.

## Vaš vlastiti spisak u Biblioteci

Prijavite se na svoj CadCraft račun (Postavke, Vaši dodaci, Prijavi se) i tabela biljaka može koristiti spisak koji čuvate u Biblioteci:

- {{ui:From my Library list}} uvodi vaše stavke biljaka (uključujući one koje još čekaju pregled). Biljka koju već imate ovdje ažurira se iz Biblioteke; kultivari, navedene veličine, gustina i specifikacija koje ste dodali ovdje se zadržavaju.
- {{ui:Save as a plant list}} sprema svaki red kao vašu stavku biljke u Biblioteci, jednu stavku po vrsti: nova biljka je nova stavka, izmijenjena biljka je nova verzija, a nepromijenjena se ne dira. Prvo označite okvir: spremanje daje biljke javno pod licencom CC0. Prvo javno otpremanje od osobe kojoj još nije odobreno povjerenje provjerava čovjek prije nego što se pojavi, kao i svako otpremanje.

Biblioteka čuva osnovni zapis biljke. Kultivari, navedene veličine, gustina i bilješke o specifikaciji ostaju u projektu i u datoteci biljaka ({{ui:Save as a plants file}}); dijalog kaže koliko redova to zahvata svaki put kad spremate.

## Postavljena biljka navodi veličinu

Odaberite biljku, živicu ili red mješavine gredice ili uređene površine: kad zapis ima kultivare ili navedene veličine, {{ui:Cultivar and size}} bira jednu. Spisak biljaka tada broji po vrsti, kultivaru i veličini, a oznaka ih može prikazati: `{botanical} '{cultivar}' {size}` ili `{full}`.

## Simboli biljaka po razmjeri

{{ui:Plant graphics}} (Pejzaž › More) postavlja kako se biljke crtaju u planu: **automatski** (grublje od 1:500 krug po širini, između 1:200 i 1:500 obris sa središtem, finije detaljni simbol; obje razmjere se mogu promijeniti) ili jedan nivo za svaku razmjeru. Dijalog Listovi ima svoj **Detalj biljaka u planu** za taj set.

Na zapisu u odjeljku Biljke, {{ui:Own symbol…}} čita SVG ili blok crteža DXF/DWG i crta ga po širini biljke na detaljnom nivou. {{ui:Own 3D model…}} čita OBJ, STL ili GLB; u Grafika biljaka odaberite **Vlastiti model svakog zapisa** da ga vidite u 3D. Datoteke su ograničene (512 KB SVG-a, 2000 oblika, 50 000 trouglova) i čuvaju se u projektu. SVG transformacije se ne primjenjuju (bićete obaviješteni kad datoteka ima). Vidi [Grafika biljaka, vlastiti simboli i 3D biljke](topic:plant-graphics) za nivoe, ograničenja i šta GLB smije sadržavati.
