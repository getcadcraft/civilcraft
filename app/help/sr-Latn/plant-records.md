---
title: Zapisi biljaka, sorte i navedene veličine
summary: Spisak biljaka vašeg projekta kao tabela: sorte, navedene veličine (kontejner, korenov balon, obim, čisto stablo), gustina, napomene o specifikaciji, CSV ulaz i izlaz; svaka postavljena biljka navodi veličinu; simboli biljaka po razmeri i vaši sopstveni simboli i 3D modeli.
keywords: tabela biljaka, baza biljaka, sorta, varijetet, navedena veličina, kontejner, korenov balon, koren bez zemlje, obim, čisto stablo, gustina, biljke po kvadratnom metru, specifikacija, napomene specifikacije, simbol biljke, blok, sopstveni simbol, 3D biljka, nivo detalja, razmera
from: 12251beb
---

Otvorite {{ui:Tabela biljaka}} iz menija {{ui:Više}} grupe Uređenje ili iz odeljka Biljke. Svaki red je zapis biljke u sopstvenom spisku ovog projekta (zapis iz spiska biljaka se kopira kada ga dodate). Svaka izmena se proverava kao uvezena datoteka i jedan je korak {{ui:Opozovi}}.

## Kolone

- **Botanički naziv**, **Uobičajen naziv**, **Tip**, **Visina** i **Širina** pri zrelosti (metri).
- **Razmak** (od centra do centra) ili **Gustina** (biljaka po m²). Gredica zapisa sa gustinom, a bez razmaka, popunjava se tom gustinom po svom obrascu (trougaono ili kvadratno).
- **Navedene veličine**: jedan unos po veličini, odvojen sa `;`. Svaki unos je identifikator, vrsta (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) i zatim bilo koje od: zapremina `10L`, visina `h0.6`, širina `s0.4`, obim `g14-16` (cm), čisto stablo `st1.8`. Primer: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Sorte**: nazivi odvojeni sa `;`. Sorta zadržava svoje veličine i napomene kada ih je uvezena datoteka imala.
- **Napomene o specifikaciji**.

{{ui:Dupliraj}} kopira red pod novim ključem; {{ui:Sačuvaj kao CSV}} i {{ui:Sačuvaj kao fajl biljaka}} zapisuju spisak (redovi CSV za sorte stoje ispod svoje vrste, sa `cultivar_of`). Uvoz CSV ili datoteke biljaka spaja ih u spisak.

## Vaš sopstveni spisak iz Biblioteke

Prijavite se na svoj CadCraft nalog (Podešavanja, Vaši dodaci, Prijavi se) i tabela biljaka može da koristi spisak koji čuvate u Biblioteci:

- {{ui:Iz moje liste biblioteke}} uvodi vaše sopstvene stavke biljaka (uključujući i one koje još čekaju pregled). Biljka koju već imate ovde ažurira se iz Biblioteke; sorte, navedene veličine, gustina i specifikacija koje ste dodali ovde se zadržavaju.
- {{ui:Sačuvaj kao spisak biljaka}} čuva svaki red kao vašu sopstvenu stavku Biblioteke biljaka, jednu stavku po vrsti: nova biljka je nova stavka, izmenjena biljka je nova verzija, nepromenjena se ne dira. Prvo označite polje za potvrdu: čuvanjem se biljke daju javnosti pod licencom CC0. Prvi javni upload od osobe kojoj još nije poverenje proverava čovek pre nego što se pojavi, kao i svaki upload.

Biblioteka čuva osnovni zapis biljke. Sorte, navedene veličine, gustina i napomene o specifikaciji ostaju u projektu i u datoteci biljaka ({{ui:Sačuvaj kao fajl biljaka}}); dijalog kaže koliko redova to utiče pri svakom čuvanju.

## Postavljena biljka navodi veličinu

Izaberite biljku, živicu ili red mešavine gredice ili ozelenjene površine: kada zapis ima sorte ili navedene veličine, {{ui:Sorta i veličina}} bira jednu. Spisak biljaka tada broji po vrsti, sorti i veličini, a oznaka može da ih prikaže: `{botanical} '{cultivar}' {size}` ili `{full}`.

## Simboli biljaka po razmeri

{{ui:Grafika biljaka}} (Uređenje › {{ui:Više}}) određuje kako se biljke crtaju u planu: **automatski** (grublje od 1:500 krug po širini, između 1:200 i 1:500 obris sa centrom, finije detaljni simbol; obe razmere se mogu promeniti) ili jedan nivo za svaku razmeru. Dijalog Listovi ima sopstveni **Detalj biljaka u planu** za taj set.

Na zapisu u odeljku Biljke, {{ui:Sopstveni simbol…}} čita SVG ili blok DXF/DWG crteža i crta ga po širini biljke na detaljnom nivou. {{ui:Sopstveni 3D model…}} čita OBJ, STL ili GLB; u odeljku „Grafika biljaka“ izaberite **Sopstveni model svakog zapisa** da ga vidite u 3D. Datoteke su ograničene (512 KB SVG-a, 2000 oblika, 50 000 trouglova) i čuvaju se u projektu. SVG transformacije se ne primenjuju (bićete obavešteni kada datoteka ih ima). Pogledajte [Grafika biljaka, sopstveni simboli i 3D biljke](topic:plant-graphics) za nivoe, ograničenja i šta GLB sme da sadrži.
