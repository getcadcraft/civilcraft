---
title: Izbornici, tipke i miš
summary: Odaberite stil izbornika koji odgovara načinu na koji već radite, dodijelite bilo kojoj naredbi vlastitu tipku, premjestite naredbe između kartica vrpce te postavite što kotačić i tipke miša rade u tlocrtu i u 3D prikazu.
keywords: stil izbornika, izbornici, vrpca, civilna vrpca, alatna traka, naredbeni redak, klasično crtanje, tipkovni prečaci, prečaci, tipke, prilagodi, preslikaj tipke, ponovno dodijeli, miš, kotačić, obrni, smjer zumiranja, srednja tipka, desna tipka, pomicanje prikaza, orbita, izvoz, uvoz, prebacivanje, poznato
from: 07ac73a0
---

CivilCraftove naredbe su iste bez obzira kojim putem do njih dolazite. **Stil izbornika** određuje samo gdje se naredbe nalaze na zaslonu, kako se zovu i kojim tipkama se pokreću, pa možete zadržati navike koje već imate. Odaberite ga u {{ui:Postavke}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Izbornici, tipke i miš}}; promjena je odmah vidljiva, a ovaj preglednik je pamti.

## Tri stila

| Stil | Što dobivate |
|---|---|
| {{ui:CivilCraft}} | CivilCraftova vlastita alatna traka ({{ui:Datoteka}}, {{ui:Izvoz}}, {{ui:Teren}}, Projektiranje, Uređivanje, GIS, {{ui:Prikaz}}) i pojedinačne tipke: {{key:A}} os trase, {{key:G}} plato, {{key:P}} cijevi, {{key:B}} prijelomnica, {{key:O}} granica, {{key:L}} značajna linija, {{key:R}} profil, {{key:X}} presjeci, {{key:E}} nagibi, {{key:D}} 3D, {{key:F}} prilagodi, {{key:V}} odaberi. Polazna točka. |
| {{ui:Klasično crtanje}} | Mala vrpca ({{ui:Početak}}, {{ui:Umetanje}}, {{ui:Ispis}}) i naredbeni redak, za korisnike koji upisuju naredbe: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (poništi), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Počnite upisivati bilo gdje i slova idu u naredbeni redak; {{key:Enter}} pokreće naredbu, {{key:Enter}} na praznom ponavlja zadnju naredbu, {{key:Esc}} je briše. Srednja tipka pomiče prikaz. |
| {{ui:Civilna vrpca}} | Kartice velikih gumba, onako kako civilni projektantski programi grupiraju svoje alate: {{ui:Početak}} (podaci o terenu, izrada projekta, prikazi profila i presjeka), {{ui:Tereni}}, {{ui:Izmjena}}, {{ui:Geolokacija}}, {{ui:Prikaz}} i {{ui:Ispis}}, s izbornikom {{ui:Datoteka}} i brzim gumbima s desne strane. Jednoslovne tipke ostaju. Srednja tipka pomiče tlocrt; u 3D prikazu srednja tipka pomiče, a {{key:Shift}} uz srednju tipku okreće. |

Svi stilovi zadržavaju tipke {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Tipka koja pripada CivilCraftovu vlastitom rasporedu, ali ju je vaš stil dodijelio drugoj naredbi, ne radi ništa, a statusna traka kaže gdje je otišla njezina naredba („U Mojim tipkama, Plato je Ctrl+Alt+G“). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} i strelice uvijek zadržavaju svoje značenje, a dok crtate liniju njezine točke zadržavaju svoje tipke ({{key:Backspace}}, {{key:Enter}}).
:::

## Prilagodite po svojoj mjeri

1. Odaberite stil koji je najbliži onome što želite, zatim kliknite {{ui:Prilagodi…}}.
2. Na {{ui:Tipke i izbornici}} pronađite naredbu (pomaže okvir za pretraživanje). Kliknite {{ui:Dodaj ključ}} i pritisnite tipku, ili dvije tipke za dvoslovnu tipku. Kliknite tipku da je uklonite.
3. S vrpcom, {{ui:Gdje se nalazi}} premješta naredbu na drugu karticu i grupu, u izbornik {{ui:Datoteka}} ili na {{ui:Samo tipke}}.
4. Na {{ui:Miš}} postavite kotačić, tipke koje pomiču tlocrt i što svaka tipka radi u 3D prikazu.
5. Dajte mu naziv i kliknite {{ui:Spremi}}.

Spremanje ugrađenog stila stvara vašu kopiju („Moja civilna vrpca“); ugrađeni se nikad ne mijenja. Tipka dodijeljena dvjema naredbama ili ona koja bi se pokrenula prije nego što se može upisati dvoslovna tipka prikazuje se crveno i mora se popraviti prije spremanja.

## Miš

- **Kotačić miša**: {{ui:Pomicanje prema gore približava}} (početak) ili {{ui:Pomicanje prema gore udaljava}}, i koliko brzo, u tlocrtu i u 3D prikazu. Štipanje dodirne plohe uvijek zumira onako kako se pomiču vaši prsti.
- **Pomicanje tlocrta tipkom**: srednja tipka, desna tipka ili obje. {{key:Space}} i povlačenje također pomiču. Lijeva tipka uvijek odabire i crta.
- **Povlačenje u 3D prikazu**: {{ui:Zasebno za svaki prikaz}} zadržava CivilCraftove gumbe (lijeva tipka okreće, desna pomiče). Ili postavite svaki gumb na okretanje, pomicanje, zumiranje ili ništa; {{key:Shift}} uz gumb mijenja okretanje i pomicanje. Klik bez povlačenja i dalje odabire.

## Ponesite stil sa sobom

{{ui:Izvoz}} sprema stil u uporabi kao malu datoteku `.ccinput.json`; {{ui:Uvezi…}} dodaje jednu, s drugog računala ili od kolege. Uvezena datoteka može upućivati samo na CivilCraftove vlastite naredbe: sve drugo se izostavlja i broji u statusnoj traci. {{ui:Izbriši ovaj stil}} uklanja jedan vaš.

:::note
Ove postavke ostaju u ovom pregledniku. {{ui:Koristi ovaj stil u svakoj aplikaciji}} ispod kartica stilova čini da se svaka aplikacija otvara u odgovarajućem stilu (vlastita alatna traka, vrpca ili Klasično crtanje), uz promjene koje ste napravili u svakoj aplikaciji. CivilCraft nema stil trake izbornika: kad se za svaku aplikaciju odabere traka izbornika neke druge aplikacije, CivilCraft zadržava vlastitu alatnu traku.
:::

Srodno: [Tipkovnica i miš](topic:keyboard) · [Postavke CivilCrafta](topic:settings) · [Dolazak iz drugog građevinskog softvera](topic:coming-from)
