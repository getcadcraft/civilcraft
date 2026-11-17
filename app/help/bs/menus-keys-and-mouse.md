---
title: Meniji, tipke i miš
summary: Odaberite stil menija koji odgovara načinu na koji već radite, dodijelite bilo kojoj naredbi svoju tipku, premještajte naredbe između kartica trake i podesite šta točkić i tipke miša rade u planu i u 3D.
keywords: stil menija, meniji, traka, građevinska traka, traka s alatima, komandna linija, klasični nacrt, prečice, tipkovne prečice, tipke, prilagodi, ponovno dodijeli, miš, točkić, obrnuto, smjer zumiranja, srednja tipka, desna tipka, pomjeranje pogleda, orbita, izvoz, uvoz, prebacivanje, poznato
from: 07ac73a0
---

Naredbe CivilCraft-a su iste bez obzira na to kako do njih dođete. **Stil menija** samo određuje gdje se nalaze na ekranu, kako se zovu i kojim tipkama se pokreću, pa možete zadržati navike koje imate. Odaberite ga u {{ui:Postavke}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Meniji, tipke i miš}}; promjena je odmah vidljiva, a ovaj preglednik je pamti.

## Tri stila

| Stil | Šta dobijate |
|---|---|
| {{ui:CivilCraft}} | CivilCraft-ova vlastita traka s alatima (Datoteka, Izvoz, Površina, Dizajn, Uredi, GIS, Pogled) i pojedinačne tipke: {{key:A}} poravnanje, {{key:G}} plato, {{key:P}} cijevi, {{key:B}} linija loma, {{key:O}} granica, {{key:L}} karakteristična linija, {{key:R}} profil, {{key:X}} presjeci, {{key:E}} nagibi, {{key:D}} 3D, {{key:F}} uklapanje, {{key:V}} odabir. Polazna tačka. |
| {{ui:Klasični nacrt}} | Mala traka ({{ui:Početna}}, {{ui:Umetni}}, {{ui:Izlaz}}) i komandna linija, za one koji kucaju naredbe: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (poništi), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Počnite kucati bilo gdje i slova idu u komandnu liniju; {{key:Enter}} pokreće, {{key:Enter}} na praznom ponavlja posljednju naredbu, {{key:Esc}} briše. Srednja tipka pomjera pogled. |
| {{ui:Građevinska traka}} | Kartice velikih dugmadi, kako civilni projektantski programi grupišu svoje alate: {{ui:Početna}} (podaci o terenu, kreiranje dizajna, prikazi profila i presjeka), {{ui:Površi}}, {{ui:Izmjena}}, {{ui:Geolokacija}}, {{ui:Pogled}} i {{ui:Izlaz}}, s menijem {{ui:Datoteka}} i brzim dugmadima desno. Pojedinačne tipke ostaju. Srednja tipka pomjera plan; u 3D srednja tipka pomjera pogled, a {{key:Shift}} sa srednjom tipkom rotira oko objekta. |

Svaki stil zadržava {{key:Mod}} tipke: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Tipka koja pripada CivilCraft-ovom vlastitom rasporedu, ali ju je vaš stil dodijelio drugoj naredbi, ne radi ništa, a statusna linija kaže gdje je njena naredba završila ("U Mojim tipkama, Plato je Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} i strelice uvijek zadržavaju svoje značenje, a dok crtate liniju, njene tačke zadržavaju svoje tipke ({{key:Backspace}}, {{key:Enter}}).
:::

## Napravite po svom

1. Odaberite stil koji je najbliži onome što želite, zatim kliknite {{ui:Prilagodi…}}.
2. Na {{ui:Tipke i meniji}} pronađite naredbu (polje za pretragu pomaže). Kliknite {{ui:Dodaj tipku}} i pritisnite tipku, ili dvije tipke za dvoslovnu tipku. Kliknite tipku da je uklonite.
3. Uz traku, {{ui:Gdje stoji}} premješta naredbu na drugu karticu i panel, u meni {{ui:Datoteka}}, ili na {{ui:Samo tipke}}.
4. Na {{ui:Miš}} podesite točkić, tipke koje pomjeraju plan i šta svaka tipka radi u 3D prikazu.
5. Dajte mu ime i kliknite {{ui:Spasi}}.

Spremanje ugrađenog stila pravi vašu kopiju ("Moja građevinska traka"); ugrađeni se nikad ne mijenja. Tipka dodijeljena dvjema naredbama, ili ona koja bi se pokrenula prije nego što se dvoslovna tipka može ukucati, prikazana je crveno i mora se ispraviti prije spremanja.

## Miš

- **Točkić miša**: {{ui:Skrolanje prema gore zumira unutra}} (polazno) ili {{ui:Skrolanje prema gore zumira van}}, i koliko brzo, u planu i u 3D. Štipanje na touchpadu uvijek zumira u smjeru kretanja prstiju.
- **Pomjeranje plana pomoću**: srednje tipke, desne tipke, ili obje. {{key:Space}} i prevlačenje također pomjeraju. Lijeva tipka uvijek bira i crta.
- **Prevlačenje u 3D prikazu**: {{ui:Vlastito za svaki prikaz}} zadržava CivilCraft-ova dugmad (lijeva rotira, desna pomjera). Ili postavite svako dugme na rotiranje, pomjeranje, zumiranje ili ništa; {{key:Shift}} uz dugme zamjenjuje rotiranje i pomjeranje. Klik bez prevlačenja i dalje bira.

## Ponesite ga sa sobom

{{ui:Izvoz}} sprema stil u upotrebi kao malu datoteku `.ccinput.json`; {{ui:Uvezi…}} dodaje jednu, s drugog računara ili od kolege. Uvezena datoteka može pokazivati samo na CivilCraft-ove vlastite naredbe: sve ostalo se izostavlja i broji u statusnoj liniji. {{ui:Izbriši ovaj stil}} uklanja jedan od vaših.

:::note
Ove postavke ostaju u ovom pregledniku. {{ui:Koristi ovaj stil u svakoj aplikaciji}} ispod kartica stilova čini da se svaka aplikacija otvara u odgovarajućem stilu (vlastita traka s alatima, traka ili Klasični nacrt), sa promjenama koje ste napravili u svakoj aplikaciji. CivilCraft nema stil s trakom menija: kad se za svaku aplikaciju izabere traka menija druge aplikacije, CivilCraft zadržava svoju traku s alatima.
:::

Srodno: [Tastatura i miš](topic:keyboard) · [Postavke CivilCraft-a](topic:settings) · [Dolazak iz drugog građevinskog softvera](topic:coming-from)
