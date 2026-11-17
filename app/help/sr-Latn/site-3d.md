---
title: Prikaz lokacije u 3D
summary: Otvorite 3D prikaz, orbitirajte, pomerajte i uvećavajte, podesite vertikalno uveličanje i bojenje, izaberite šta se prikazuje, i kliknite osovine trase, platoe, linije objekata, linije loma, cevi, konstrukcije i tačke da ih izaberete.
keywords: oznake, 3d oznake, bilbord, oznake okrenute ka kameri, oznake stacionaža, oznake izohipsi, oznake tačaka, prevlačenje, iz vazduha, slojevi mape na površini, 3d, tri d, 3D prikaz, kocka prikaza, kompas, orbitiranje, perspektiva, paralelno, izometrijski, iso, vertikalno uveličanje, teren, model, model lokacije, obilazak, vizuelizacija, renderovanje, cevi u 3D, konstrukcije, revizioni šahtovi, koridor u 3D, put u 3D, površina puta, trake, ivičnjaci, trotoari, biljke u 3D, drveće u 3D, žbunje, živice, pejzaž 3D, rampe u 3D, stepenice, zidovi, popločavanje, tvrdi pejzaž 3D
from: a16bafe1
---

3D prikaz prikazuje lokaciju kao jedan model: postojeći teren i izravnatu površinu, izohipse prevučene preko njih, linije loma i ivicu površine, svaku osovinu trase na njenom projektnom profilu sa oznakama stacionaža, linije objekata koridora i sam put (trake, rame, slivnike, ivičnjake, pojaseve i trotoare u sopstvenim bojama), platoe sa njihovim linijama preseka sa terenom, mrežu cevi sa cevima i konstrukcijama na njihovim stvarnim kotama, i iz radnog prostora Pejzaž biljke, popločavanje, staze, zidove, ivičnjake, rampe i stepenice. Čita isti projekat kao plan, pa se svaka izmena vidi u oba.

## Otvorite 3D prikaz

1. Otvorite geodetske tačke (ili datoteku LandXML ili projekta) da postoji površina. Same biljke, popločavanje ili rampe su dovoljne da se otvori.
2. Pritisnite {{key:D}}, ili kliknite {{ui:3D}} u grupi {{ui:Pogled}} trake sa alatima.
   3D prikaz se otvara preko plana, gledajući celu lokaciju s jugoistoka. Prvi put traje malo dok se učita.
3. Pritisnite {{key:D}} ponovo, ili ponovo kliknite {{ui:3D}}, da se vratite na plan. Izbor alata za crtanje, kao što je {{ui:Trasa}} ili {{ui:Plato}}, takođe vraća na plan, jer se crtanje odvija tamo.

## Kretanje

| Za | Uradite ovo |
|---|---|
| Orbitiranje | Prevucite levim ili srednjim dugmetom |
| Pomeranje | Prevucite desnim dugmetom, ili {{key:Shift}} i prevucite |
| Uvećavanje | Okrenite točkić; uvećava prema pokazivaču |
| Orbitiranje na trekpedu | Prevucite dvema prstima ({{key:Shift}} i prevlačenje pomera) |
| Uvećavanje na trekpedu | Stisnite prstima |
| Dodir | Jedan prst orbitira; dva prsta stišću za uvećavanje i pomeraju za pomeranje |
| Tasteri (prikaz je u fokusu) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitiraju, a uz {{key:Shift}} pomeraju; {{key:Plus}} i {{key:Minus}} uvećavaju |

Traka iznad prikaza ima ostalo:

- Lista prikaza: **Iso**, **Gore**, **Dole**, **Ispred** (gledajući na sever), **Pozadi**, **Levo**, **Desno**.
- {{ui:Perspektiva}}: pritisnuto je perspektivni prikaz; kliknite za paralelnu projekciju (bez skraćenja).
- {{ui:Obuhvat}}: ponovo prikazuje sve. {{key:F}} radi isto dok je 3D prikaz otvoren.

## Kocka prikaza

Kocka prikaza u gornjem desnom uglu okreće se s prikazom. Kliknite stranu, ivicu ili ugao da gledate lokaciju odatle (kamera se glatko okreće, osim ako sistem traži smanjen pokret). Prevucite kocku da orbitirate. Prsten kompasa ispod nje pokazuje sever (sever mreže, +Y): prevucite prsten da okrenete lokaciju oko vertikale, ili kliknite N, E, S ili W da gledate sa te strane. {{ui:Početna}}, mala kućica u njenom gornjem levom uglu, vraća na izometrijski prikaz cele lokacije. Tastaturom: {{key:Tab}} do kocke, strelice biraju stranu, ivicu ili ugao, a {{key:Enter}} gleda odatle.

Na planu ista kocka prikazuje vrh. Kliknite bilo koju drugu stranu, ivicu ili ugao (ili je prevucite) da otvorite 3D prikaz koji gleda odatle: to je najbrži put u 3D iz određenog pravca. Da zamenite kocku malom ikonom ose ili je sakrijete, pogledajte **Indikator ugla** u [Podešavanjima CivilCraft-a](topic:settings).

## Uveličanje kota

Lokacije su obično mnogo šire nego više, pa su kote na početku rastegnute za **2×**. Izaberite **1×**, **2×**, **3×**, **5×** ili **10×** u listi na traci, ili pod **3D vertikalno uveličanje** u [Podešavanjima CivilCraft-a](topic:settings) (to je jedna postavka). Menja se samo prikaz: zapremine, profili i izvozi ostaju u pravoj razmeri.

## Bojenje površina

- **Pojasevi kota**: isti pojasevi i boje kao na planu (broj pojaseva se podešava pod **Prikaz** u levom panelu). Svaka ivica pojasa tačno je presečena na svojoj koti.
- **Jedna boja**: postojeći teren i izravnata površina, svaki u jednoj boji.
- **Slojevi mape**: slojevi mape prikazani ispod plana (georeferencirana slika, pločice mape ili servis mape; pogledajte [Slojevi mape](topic:map-layers)) položeni preko površina kao list, tako da aerofotografija pokazuje na brdima. Slike koje još pristižu popunjavaju se kako stižu. Bez prikazanog sloja mape, površine zadržavaju svoje pojaseve kota i prikaz to kaže. Slika je za ekran: izvozi GLB i OBJ je ne nose.

Kad su prikazane obe površine, postojeći teren je providan preko izravnate površine, pa vidite usek (teren iznad projekta) i nasip.

## Izaberite šta se prikazuje

Kliknite {{ui:Prikaz}} na traci i označite ili obrišite:

| Stavka | Šta je |
|---|---|
| Postojeći teren | Površina napravljena od geodetskih tačaka (ili pročitana iz LandXML) |
| Izravnata površina | Postojeći teren sa koridorima i platoima izravnatim u njega (samo kad ih ima) |
| Ivice trouglova | Svaka ivica TIN-a, kao linije |
| Izohipse | Male i glavne izohipse svake prikazane površine, na intervalu plana |
| Ivica površine | Spoljna ivica svake prikazane površine, na njenim kotama |
| Linije loma | Svaka linija loma, na svojim kotama |
| Osovine trase i stacionaže | Svaka osovina na svom projektnom profilu (na terenu tamo gde nema profila), sa oznakama svakih 50 ft ili 20 m |
| Linije objekata koridora | Ivica kolovoza, rame i preseci sa terenom na obe strane |
| Površine puta | Put koji svaki koridor gradi iz svog sastava: trake, rame, slivnike, ivičnjake, pojaseve i trotoare, svaki u sopstvenoj boji, na izravnatoj površini |
| Biljke | Svaka biljka, i biljke u lejama i živicama, kao jednostavni oblici veličine po spisku biljaka: drvo je stablo i okrugla krošnja (kupa za četinara, čupav vrh na visokom stablu za palmu), žbunovi, biljke živice, trajnice i pokrivači tla su kupole, trave su čupovi, penjačice su tanke kolone. Stoje na izravnatoj površini (ili postojećem terenu) u veličini koju plan prikazuje: zrelo ili pri sađenju |
| Tvrdi pejzaž | Popločavanje i staze s njihovim padovima, zidovi, ivičnjaci, stepenice i rampe koje se penju u nizovima sa ravnim podestima između |
| Platoi i preseci sa terenom | Obris svakog plato na njegovoj koti i njegova linija preseka sa terenom |
| Cevi i konstrukcije | Cevi kao okrugle cevi između njihovih unutrašnjih dna, konstrukcije od oboda do taložnika |
| Geodetske tačke | Tačka na svakoj tački sa kotom (u početku isključeno) |
| GIS slojevi | GIS slojevi prikazani na planu, u svojim bojama: linije i obrisi sa sopstvenim kotama na tim kotama, ostali položeni na postojeći teren (prate ga tačno); tačke kao mali krstovi. Oblici bez kota van površine se izostavljaju, a prikaz kaže koliko ih ima |
| Oznake | Nazivi i vrednosti koji uvek gledaju ka vama: naziv svake osovine na njenom početku i njene stacionaže svakih 100 ft (ili 100 m), kota svake glavne izohipse, platoi, linije objekata i konstrukcije po nazivu, a kad je označeno **Geodetske tačke**, broj i kota svake tačke |

Oznake ostaju iste veličine i uspravne koliko god okrećete ili uvećavate, a brdo ispred oznake je sakriva. Gde bi se gomilale, najvažnije se prikazuju, a ostale čekaju dok ne uvećate: prvo osovine, zatim konstrukcije, platoi, linije objekata, stacionaže, izohipse i tačke, bliže prvo. Samo su na ekranu; izvozi i štampanja ih izostavljaju.

Vaši izbori, uveličanje i bojenje pamte se u ovom pregledaču.

Put se gradi na postojećem terenu. Sa osovinom trase i koridorom, ali bez geodetskih tačaka ili površine, put se crta na privremenom zamenskom terenu: na prosečnoj koti njegovog projektnog profila, ili ravno na koti 0 kad nema ni profila. Upozorenje na dnu 3D prikaza i u svojstvima koridora to kaže. To je samo slika: zapremine ni preseci ne dolaze iz nje. Otvorite geodetske tačke ili površinu i put se sam pomera na pravi teren.

Vertikalno uveličanje rasteže teren, a ne biljke: one stoje na uveličanom terenu na svojoj pravoj visini i rasponu, pa drvo izgleda kao drvo na bilo kojoj postavci. Biljke su jednostavni oblici, a ne detaljni modeli: hiljade njih ostaju brze za okretanje i uvećavanje.

## Cevi i konstrukcije

- Cev se crta tako da joj je dno unutra na unutrašnjim kotama koje postavite, a gornji deo (kruna) jedan unutrašnji prečnik više. Prečnici su u inčima u projektu u stopama, a u milimetrima u metričkom projektu, kao u desnom panelu.
- Konstrukcija ide od svog oboda (upisanog ili sa površine) do svog taložnika (najniža kota dna minus dubina taložnika). Bez ijedne kote dna, crta se 5 ft (1.5 m) duboko.
- Cevi i konstrukcije sa problemom (pogledajte proveru mreže u desnom panelu) crtaju se crveno.
- Cev bez kota dna se ne crta; napomena na dnu prikaza kaže koliko ih ima.

## Birajte iz 3D prikaza

Kliknite osovinu trase (ili njen put), plato, liniju objekta, cev, konstrukciju, geodetsku tačku, biljku, rampu ili drugi tvrdi pejzaž. Izabrano je kao da ste kliknuli na planu: njena svojstva se otvaraju u desnom panelu, gde ih menjate, i crta se bojom izbora iznad svega u 3D. Šta god izaberete na planu, označeno je i u 3D. Savet pored pokazivača imenuje šta ste kliknuli, sa njegovim istočnim i severnim koordinatama i kotom. Cevi i konstrukcije mogu da se kliknu i tamo gde su pod zemljom; linija sakrivena iza brda ne može da se klikne kroz nju.

Kliknite liniju loma da vidite koja je: označena je, a statusna traka je imenuje (linije loma nemaju sopstvena svojstva).

Kliknite teren da pročitate istok, sever i kotu tamo u savetu.

## Vozite duž osovine trase

Kliknite **Vožnja** na 3D traci i izaberite osovinu trase. Prikaz se pomera na sedište vozača: 3.5 ft (1.07 m) iznad puta, na njegovom projektnom profilu (na postojećem terenu duž ose kad ga još nema), gledajući unapred duž njega.

- **Pusti** ili {{key:Space}} vozi brzinom koju izaberete (10 do 65 mph, ili 15 do 100 km/h); ponovo {{key:Space}} pauzira. Staje na kraju; **Pusti** tada počinje od početka.
- Klizač skače na bilo koju stacionažu; {{key:Left}} i {{key:Right}} pomeraju 10 ft (5 m) unazad i unapred.
- Prevlačenje u prikazu pauzira i dozvoljava da gledate okolo.
- **Zaustavi** ili {{key:Esc}} vraća prikaz tamo gde je bio.

Uveličanje kota važi i dok vozite: postavite ga na 1× da vidite put onako kako će biti.

## Svetlost sunca

Otvorite **Sunce** na 3D traci i označite **Svetlost sunca**. Unesite datum, vreme na satu i njegovu vremensku zonu (razliku od UTC: leti, letnje računanje vremena), i geografsku širinu i dužinu lokacije. Kad projekat ima koordinatni sistem, one se popunjavaju iz njega.

Lokacija je tada osvetljena odakle je sunce, sa **Senkama** preko terena, koridora i platoa; meni kaže azimut sunca i koliko je visoko, ili da je ispod horizonta. Položaji dolaze iz NOAA-inih solarnih jednačina. Senke padaju kako treba pri svakom uveličanju, ali staju na ivici lokacije: brda i zgrade iza nje ne bacaju nijednu.

## Izvoz 3D prikaza

Kliknite {{ui:GLB}} ili {{ui:OBJ}} na traci. Ono što prikaz pokazuje čuva se u pravoj razmeri (bez uveličanja), u metrima, sa Y nagore. Pojedinosti: [Izvoz lokacije u 3D](topic:export-3d).
