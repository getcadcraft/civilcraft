---
title: Pogled lokaliteta u 3D-u
summary: Otvorite 3D prikaz, okrećite, pomičite i zumirajte, postavite vertikalno pretjerivanje i bojanje, odaberite što se prikazuje te kliknite osi trase, platoe, linije značajki, prijelomnice, cijevi, građevine i točke za odabir.
keywords: oznake, 3d oznake, bilborad, oznake okrenute prema kameri, oznake stacionaža, oznake izohipsi, oznake točaka, spuštanje, zračni snimak, karte na površini, 3d, tri d, 3d prikaz, ViewCube, kompas, orbita, perspektiva, paralelna, izometrijska, iso, vertikalno pretjerivanje, teren, model, model lokaliteta, obilazak, vizualizacija, render, cijevi u 3D-u, građevine, reviziona okna, koridor u 3D-u, cesta u 3D-u, površina ceste, trake, rubnjaci, pločnici, biljke u 3D-u, drveće u 3D-u, grmlje, živice, krajobraz 3D, rampe u 3D-u, stepenice, zidovi, popločenje 3D
from: a16bafe1
---

3D prikaz prikazuje lokalitet kao jedan model: postojeći teren i planirana površina, izohipse položene na njih, prijelomnice i rub površine, svaka os trase na svom projektiranom profilu s oznakama stacionaža, linije značajki koridora i sama cesta (trake, bankine, žlijebovi, rubnjaci, trake i pločnici, svaki u vlastitoj boji), platoi s nožičnim linijama, mreža cijevi s cijevima i građevinama na njihovim stvarnim kotama te iz radnog prostora Krajobraz biljke, popločenja, staze, zidovi, rubnjaci, rampe i stepenice. Čita isti projekt kao tlocrt, pa se svaka izmjena prikazuje u oba.

## Otvorite 3D prikaz

1. Otvorite točke snimanja (ili LandXML ili datoteku projekta) da postoji površina. Sami biljke, popločenje ili rampe dovoljni su da se i to otvori.
2. Pritisnite {{key:D}} ili kliknite {{ui:3D}} u grupi {{ui:Prikaz}} na alatnoj traci.
   3D prikaz otvara se preko tlocrta, gledajući cijeli lokalitet s jugoistoka. Prvi put učitavanje traje trenutak.
3. Ponovno pritisnite {{key:D}} ili ponovno kliknite {{ui:3D}} da se vratite na tlocrt. Odabir alata za crtanje, poput {{ui:Os trase}} ili {{ui:Plato}}, također vraća na tlocrt, jer se crtanje odvija tamo.

## Kretanje

| Za | Učinite ovo |
|---|---|
| Okretanje | Povucite lijevom ili srednjom tipkom |
| Pomicanje | Povucite desnom tipkom, ili {{key:Shift}} i povucite |
| Zumiranje | Okrenite kotačić; zumira prema pokazivaču |
| Okretanje na dodirnoj podlozi | Prevucite dvama prstima ({{key:Shift}} i prevlačenje pomiče) |
| Zumiranje na dodirnoj podlozi | Stisnite prstima |
| Dodir | Jedan prst okreće; dva prsta stišću za zumiranje i pomiču za pomicanje |
| Tipke (prikaz je u fokusu) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} okreću, s {{key:Shift}} pomiču; {{key:Plus}} i {{key:Minus}} zumiraju |

Traka iznad prikaza sadrži ostalo:

- Popis prikaza: **Iso**, **Gore**, **Dolje**, **Naprijed** (gledajući na sjever), **Natrag**, **Lijevo**, **Desno**.
- {{ui:Perspektiva}}: pritisnuto je perspektivni prikaz; kliknite za paralelnu projekciju (bez skraćivanja).
- {{ui:Opseg}}: ponovno prikazuje sve. {{key:F}} čini isto dok je 3D prikaz otvoren.

## ViewCube

ViewCube u gornjem desnom kutu okreće se s pogledom. Kliknite stranu, rub ili kut da gledate lokalitet odatle (kamera se glatko okreće osim ako vaš sustav traži smanjeno kretanje). Povucite kocku za kruženje. Prsten kompasa ispod nje prikazuje sjever (sjever mreže, +Y): povucite prsten za okretanje lokaliteta oko okomice ili kliknite N, E, S ili W da gledate s te strane. {{ui:Početak}}, mala kućica u njegovom gornjem lijevom kutu, vraća na iso prikaz cijelog lokaliteta. Tipkovnicom: {{key:Tab}} do kocke, strelice biraju stranu, rub ili kut, {{key:Enter}} gleda odatle.

Na tlocrtu ista kocka prikazuje gornju stranu. Kliknite bilo koju drugu stranu, rub ili kut (ili je povucite) da otvorite 3D prikaz koji gleda odatle: to je najbrži ulaz u 3D iz zadanog smjera. Da zamijenite kocku malom ikonom osi ili je sakrijete, vidi **Indikator kuta** u [Postavkama CivilCrafta](topic:settings).

## Pretjerivanje kota

Lokaliteti su obično mnogo širi nego viši, pa se kote na početku rastežu za **2×**. Odaberite **1×**, **2×**, **3×**, **5×** ili **10×** na popisu na traci ili pod **Vertikalno pretjerivanje u 3D-u** u [Postavkama CivilCrafta](topic:settings) (to su jedna postavka). Mijenja se samo prikaz: volumeni, profili i izvozi ostaju u stvarnom mjerilu.

## Bojanje površina

- **Pojasevi kota**: isti pojasevi i boje kao pojasevi kota na tlocrtu (broj pojaseva postavlja se pod **Prikaz** u lijevoj ploči). Svaki rub pojasa presijeca se točno na svojoj koti.
- **Jedna boja**: postojeći teren i planirana površina, svaki u jednoličnoj boji.
- **Slojevi karte**: slojevi karte prikazani ispod tlocrta (georeferencirana slika, pločice karte ili kartografska usluga; vidi [Slojevi karte](topic:map-layers)) položeni preko površina poput lista, pa se zračna snimka prikazuje na brdima. Slike koje još stižu popunjavaju se kako dolaze. Bez prikazanog sloja karte, površine zadržavaju svoje pojaseve kota, a prikaz to navodi. Slika je za zaslon: GLB i OBJ izvozi je ne sadrže.

Kad su prikazane obje površine, postojeći teren je proziran preko planirane površine, pa vidite iskop (teren iznad projekta) i nasip.

## Odaberite što se prikazuje

Kliknite {{ui:Prikaži}} na traci i označite ili poništite:

| Stavka | Što je |
|---|---|
| Postojeći teren | Površina izrađena iz točaka snimanja (ili učitana iz LandXML-a) |
| Planirana površina | Postojeći teren s koridorima i platoima planiranim u njega (samo kad ih ima) |
| Rubovi trokuta | Svaki rub TIN-a, kao linije |
| Izohipse | Sporedne i glavne izohipse svake prikazane površine, u intervalu tlocrta |
| Rub površine | Vanjski rub svake prikazane površine, na njezinim kotama |
| Prijelomnice | Svaka prijelomnica, na svojim kotama |
| Osi trase i stacionaže | Svaka os trase na svom projektiranom profilu (na terenu gdje profila nema), s oznakama svakih 50 ft ili 20 m |
| Linije značajki koridora | Rub kolnika, bankina i nožica pokosa s obje strane |
| Površine ceste | Cesta koju svaki koridor izrađuje iz svog sklopa: trake, bankine, žlijebovi, rubnjaci, trake i pločnici, svaki u vlastitoj boji, na planiranoj površini |
| Biljke | Svaka biljka, i biljke u gredicama i živicama, kao jednostavni oblici prema popisu biljaka: stablo je deblo i okrugla krošnja (stožac za četinjaču, čuperak na visokom deblu za palmu), grmlje, biljke za živicu, trajnice i pokrivači tla su kupole, trave čuperci, penjačice tanki stupovi. Stoje na planiranoj površini (ili postojećem terenu) u veličini koju tlocrt prikazuje: odrasle ili pri sadnji |
| Tvrdi pokrovi | Popločenja i staze s njihovim padovima, zidovi, rubnjaci, stepenice i rampe koje se penju u nizovima s ravnim podestima između njih |
| Platoi i nožice | Obris svakog platoa na njegovoj koti i njegova nožična linija |
| Cijevi i građevine | Cijevi kao okrugle cijevi između njihovih dna, građevine od ruba do taložnika |
| Točke snimanja | Točka na svakoj točki s kotom (na početku isključeno) |
| GIS slojevi | GIS slojevi prikazani na tlocrtu, u svojim bojama: linije i obrisi na vlastitim kotama, ostali položeni na postojeći teren (prate ga točno); točke kao mali križići. Oblici bez kota izvan površine izostavljaju se, a prikaz navodi koliko ih je |
| Oznake | Nazivi i vrijednosti koje su uvijek okrenute prema vama: naziv svake osi trase na njezinu početku i njezine stacionaže svakih 100 ft (ili 100 m), kota svake glavne izohipse, platoi, linije značajki i građevine po nazivu te, s označenim **Točkama snimanja**, broj i kota svake točke |

Oznake ostaju iste veličine i uspravne koliko god okrećete ili zumirate, a brdo ispred oznake je skriva. Gdje bi se gužvale, najvažnije se prikazuju, a ostale čekaju dok ne zumirate: prvo osi trase, zatim građevine, platoi, linije značajki, stacionaže, izohipse i točke, bliže prvo. Samo su na zaslonu; izvozi i ispisi ih izostavljaju.

Vaši izbori, pretjerivanje i bojanje pamte se u ovom pregledniku.

Cesta se izrađuje na postojećem terenu. S osi trase i koridorom, ali bez točaka snimanja ili površine, cesta se za sada crta na ravnom zamjenskom terenu: na prosječnoj koti svog projektiranog profila, ili vodoravno na koti 0 kad profila nema. Upozorenje na dnu 3D prikaza i u svojstvima koridora to navodi. To je samo slika: iz nje ne dolaze volumeni ni presjeci. Otvorite točke snimanja ili površinu i cesta se sama premješta na pravi teren.

Vertikalno pretjerivanje rasteže teren, a ne biljke: stoje na pretjeranom terenu pri svojoj stvarnoj visini i širenju, pa stablo izgleda kao stablo pri bilo kojoj postavci. Biljke su jednostavni oblici, a ne detaljni modeli: tisuće njih ostaju brzo za okretanje i zumiranje.

## Cijevi i građevine

- Cijev se crta s dnom unutar na dnu cijevi koje postavite i vrhom unutar (tjemenom) jedan unutarnji promjer više. Promjeri su u inčima u projektu u stopama i u milimetrima u metričkom projektu, kao u desnoj ploči.
- Građevina ide od svojeg ruba (upisanog ili s površine) dolje do svog taložnika (najniže dno cijevi umanjeno za dubinu taložnika). Bez ikakvog dna cijevi crta se duboka 5 ft (1.5 m).
- Cijevi i građevine s problemom (vidi provjeru mreže u desnoj ploči) crtaju se crveno.
- Cijev bez dna cijevi se ne crta; napomena na dnu prikaza navodi koliko ih je.

## Odabir u 3D prikazu

Kliknite os trase (ili njezinu cestu), plato, liniju značajke, cijev, građevinu, točku snimanja, biljku, rampu ili drugi tvrdi pokrov. Odabire se kao da ste kliknuli na tlocrtu: njezina svojstva otvaraju se u desnoj ploči, gdje ih možete urediti, a crta se bojom odabira iznad svega u 3D-u. Što god odaberete na tlocrtu, također se ističe u 3D-u. Savjet uz pokazivač navodi što ste kliknuli s njegovim istokom, sjeverom i kotom. Cijevi i građevine mogu se kliknuti i tamo gdje su ispod zemlje; linija skrivena iza brda ne može se kliknuti kroz nju.

Kliknite prijelomnicu da vidite koja je: ističe se, a statusna traka je imenuje (prijelomnice nemaju vlastita svojstva).

Kliknite teren da u savjetu pročitate istok, sjever i kotu na tom mjestu.

## Vožnja duž osi trase

Kliknite **Vožnja** na 3D traci i odaberite os trase. Prikaz se premješta na vozačevo sjedalo: 3.5 ft (1.07 m) iznad ceste, na njezinom projektiranom profilu (na postojećem terenu duž središnje linije kad ga još nema), gledajući naprijed duž nje.

- **Reproduciraj** ili {{key:Space}} vozi brzinom koju odaberete (10 do 65 mph, ili 15 do 100 km/h); ponovni {{key:Space}} pauzira. Zaustavlja se na kraju; **Reproduciraj** tada počinje ponovno od početka.
- Klizač skače na bilo koju stacionažu; {{key:Left}} i {{key:Right}} pomiču unatrag i naprijed za 10 ft (5 m).
- Povlačenje u prikazu pauzira i omogućuje gledanje oko sebe.
- **Zaustavi** ili {{key:Esc}} vraća prikaz tamo gdje je bio.

Vertikalno pretjerivanje vrijedi i tijekom vožnje: postavite ga na 1× da vidite cestu kakva će biti.

## Svjetlo sunca

Otvorite **Sunce** na 3D traci i označite **Svjetlo sunca**. Zadajte datum, vrijeme na satu i njegovu vremensku zonu (pomak od UTC-a: ljeti, onu s ljetnim računanjem vremena), te geografsku širinu i dužinu lokaliteta. Kad projekt ima koordinatni sustav, one se popunjavaju iz njega.

Lokalitet je tada osvijetljen odakle je sunce, s **Sjenama** preko terena, koridora i platoa; izbornik navodi azimut sunca i koliko je visoko, ili da je ispod horizonta. Položaji dolaze iz NOAA-inih solarnih jednadžbi. Sjene padaju ispravno pri bilo kojem pretjerivanju, ali staju na rubu lokaliteta: brda i zgrade iza njega ne bacaju ih.

## Izvoz 3D prikaza

Kliknite {{ui:GLB}} ili {{ui:OBJ}} na traci. Ono što prikaz prikazuje sprema se u stvarnom mjerilu (bez pretjerivanja), u metrima, s Y prema gore. Pojedinosti: [Izvoz lokaliteta u 3D](topic:export-3d).
