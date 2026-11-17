---
title: Pregled lokacije u 3D-u
summary: Otvorite 3D pogled, orbitirajte, pomjerajte pogled i zumirajte, postavite vertikalno uvećanje i bojenje, izaberite šta se prikazuje, te kliknite osi, platoe, linije karakteristika, linije prijeloma, cijevi, građevine i tačke da ih izaberete.
keywords: oznake, 3d oznake, oznake okrenute ka kameri, oznake stacionaža, oznake izohipsa, oznake tačaka, preklapanje, iz vazduha, slojevi karte na površini, 3d, tri d, 3d pogled, kocka pogleda, kompas, orbitiranje, perspektiva, paralelno, izometrijski, iso, vertikalno uvećanje, teren, model, model lokacije, obilazak, vizualizacija, render, cijevi u 3D-u, građevine, šahtovi, koridor u 3D-u, put u 3D-u, površina puta, trake, ivičnjaci, trotoari, biljke u 3D-u, drveće u 3D-u, žbunje, živice, pejzaž 3D, rampe u 3D-u, stepenice, zidovi, popločanje, tvrdo uređenje 3D
from: a16bafe1
---

3D pogled prikazuje lokaciju kao jedan model: postojeći teren i uređenu površinu, izohipse preko njih, linije prijeloma i ivicu površine, svaku os trase na njenom projektnom profilu s oznakama stacionaža, linije karakteristika koridora i sam put (trake, bankine, slivnike, ivičnjake, pojaseve i trotoare u sopstvenim bojama), platoe s njihovim linijama presijecanja, mrežu cijevi s cijevima i građevinama na njihovim stvarnim kotama, te iz radnog prostora Pejzaž biljke, popločanje, staze, zidove, ivičnjake, rampe i stepenice. Čita isti projekat kao plan, pa se svaka izmjena vidi na oba.

## Otvorite 3D pogled

1. Otvori tačke snimanja (ili LandXML ili datoteku projekta) da postoji površina. Biljke, popločanje ili rampe same po sebi su dovoljne da se otvori.
2. Pritisni {{key:D}}, ili klikni {{ui:3D}} u grupi {{ui:Pogled}} trake sa alatima.
   3D pogled se otvara preko plana, gledajući cijelu lokaciju s jugoistoka. Prvi put traje malo da se učita.
3. Pritisni {{key:D}} ponovo, ili ponovo klikni {{ui:3D}}, da se vratiš na plan. Izbor alata za crtanje kao što su {{ui:Trasa}} ili {{ui:Plato}} također vraća na plan, jer se crtanje odvija tamo.

## Kretanje

| Da | Uradi ovo |
|---|---|
| Orbitiraj | Prevuci lijevim ili srednjim dugmetom |
| Pomjeri pogled | Prevuci desnim dugmetom, ili {{key:Shift}} i prevuci |
| Zumiraj | Okreni točkić; zumira prema pokazivaču |
| Orbitiraj na touchpadu | Prevuci dva prsta ({{key:Shift}} i prevlačenje pomjera pogled) |
| Zumiraj na touchpadu | Štipni |
| Dodir | Jedan prst orbitira; dva prsta štipaju za zum i pomjeraju za pomjeranje pogleda |
| Tasteri (pogled ima fokus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} orbitiraju, uz {{key:Shift}} pomjeraju; {{key:Plus}} i {{key:Minus}} zumiraju |

Traka iznad pogleda ima ostalo:

- Lista pogleda: **Iso**, **Vrh**, **Dno**, **Ispred** (gledajući na sjever), **Pozadi**, **Lijevo**, **Desno**.
- {{ui:Perspektiva}}: pritisnuto je perspektivni pogled; klikni da dobiješ paralelnu projekciju (bez skraćenja).
- {{ui:Obuhvat}}: ponovo prikazuje sve. {{key:F}} radi isto dok je 3D pogled otvoren.

## Kocka pogleda

Kocka pogleda u gornjem desnom uglu se okreće s pogledom. Klikni stranu, ivicu ili ugao da pogledaš lokaciju odatle (kamera se okreće glatko, osim ako vaš sistem traži smanjeno kretanje). Prevuci kocku da orbitiraš. Prsten kompasa ispod nje pokazuje sjever (mrežni sjever, +Y): prevuci prsten da okreneš lokaciju oko vertikale, ili klikni N, E, S ili W da gledaš s te strane. {{ui:Početna}}, mala kućica u njenom gornjem lijevom uglu, vraća na izometrijski pogled cijele lokacije. Tastaturom: {{key:Tab}} do kocke, strelice biraju stranu, ivicu ili ugao, {{key:Enter}} gleda odatle.

Na planu ista kocka prikazuje vrh. Klikni bilo koju drugu stranu, ivicu ili ugao (ili je prevuci) da otvoriš 3D pogled gledajući odatle: to je najbrži ulaz u 3D iz date smjera. Da zamijeniš kocku malom ikonom osa, ili je sakriješ, vidi **Indikator ugla** u [Postavkama CivilCraft-a](topic:settings).

## Uvećanje kota

Lokacije su obično mnogo šire nego što su visoke, pa su kote na početku rastegnute za **2×**. Izaberi **1×**, **2×**, **3×**, **5×** ili **10×** u listi na traci, ili pod **Vertikalno uvećanje u 3D-u** u [Postavkama CivilCraft-a](topic:settings) (to su jedna postavka). Mijenja se samo pogled: zapremine, profili i izvozi ostaju u pravoj razmjeri.

## Bojenje površina

- **Pojasevi kota**: isti pojasevi i boje kao pojasevi kota na planu (broj pojaseva se postavlja pod **Prikaz** u lijevom panelu). Svaka ivica pojasa je presječena tačno na svojoj koti.
- **Jedna boja**: postojeći teren i uređena površina, svaki u jednoj običnoj boji.
- **Slojevi karte**: slojevi karte prikazani ispod plana (georeferencirana slika, pločice karte ili kartografski servis; vidi [Slojevi karte](topic:map-layers)) postavljeni preko površina kao list, tako da aerofotografija pokazuje se na brdima. Slike koje još stižu popunjavaju se kako dolaze. Kada nijedan sloj karte nije prikazan, površine zadržavaju svoje pojaseve kota, a pogled to kaže. Slika je za ekran: izvozi GLB i OBJ je ne nose.

Kada se prikazuju obje površine, postojeći teren je providan preko uređene površine, pa možeš vidjeti iskop (teren iznad projekta) i nasip.

## Izaberite šta se prikazuje

Klikni {{ui:Prikaži}} na traci i označi ili odznači:

| Stavka | Šta je |
|---|---|
| Postojeći teren | Površina izgrađena iz tačaka snimanja (ili pročitana iz LandXML-a) |
| Uređena površina | Postojeći teren s uređenim koridorima i platoima (samo kada ih ima) |
| Ivice trouglova | Svaka ivica TIN-a, kao linije |
| Izohipse | Manje i glavne izohipse svake prikazane površine, na intervalu plana |
| Ivica površine | Vanjska ivica svake prikazane površine, na njenim kotama |
| Linije prijeloma | Svaka linija prijeloma, na svojim kotama |
| Osi trase i stacionaže | Svaka os trase na svom projektnom profilu (na terenu gdje nema profila), s oznakama svakih 50 ft ili 20 m |
| Linije karakteristika koridora | Ivica kolovoza, bankina i linija presijecanja s obje strane |
| Površine puta | Put koji svaki koridor gradi iz svog presjeka: trake, bankine, slivnici, ivičnjaci, pojasevi i trotoari, svaki u svojoj boji, na uređenoj površini |
| Biljke | Svaka biljka, i biljke u gredicama i živicama, kao jednostavni oblici veličine prema spisku biljaka: drvo je deblo i okrugla kruna (konus za četinjaču, čuperak na visokom deblu za palmu), žbunovi, biljke za živice, trajnice i pokrivači tla su kupole, trave čuperci, penjačice tanke kolone. Stoje na uređenoj površini (ili postojećem terenu) u veličini koju plan prikazuje: odrasle ili u trenutku sadnje |
| Tvrdo uređenje | Popločanje i staze s njihovim padovima, zidovi, ivičnjaci, stepenice i rampe koje se penju u dionicama s ravnim podestima između njih |
| Platoi i linije presijecanja | Obris svakog platoa na njegovoj koti i njegova linija presijecanja |
| Cijevi i građevine | Cijevi kao okrugle cijevi između njihovih kota dna, građevine od oboda do sabirne jame |
| Tačke snimanja | Tačka na svakoj tački s kotom (isključeno na početku) |
| GIS slojevi | GIS slojevi prikazani na planu, u njihovim bojama: linije i obrisi sa sopstvenim kotama na tim kotama, drugi položeni na postojeći teren (prate ga tačno); tačke kao mali krstići. Oblici bez kota van površine su izostavljeni, a pogled kaže koliko ih je |
| Oznake | Imena i vrijednosti koje uvijek gledaju prema vama: naziv svake osi trase na njenom početku i stacionaže svakih 100 ft (ili 100 m), kota svake glavne izohipse, platoi, linije karakteristika i građevine po imenu, i uz označene **Tačke snimanja** broj i kota svake tačke |

Oznake ostaju iste veličine i uspravne koliko god okrenete ili zumirate, a brdo ispred oznake je sakriva. Gdje bi se gužvale, najvažnije se prikazuju, a ostale čekaju dok ne uvećate: prvo osi trase, zatim građevine, platoi, linije karakteristika, stacionaže, izohipse i tačke, bliži prvo. Samo su na ekranu; izvozi i štampanja ih izostavljaju.

Vaši izbori, uvećanje i bojenje se pamte u ovom pretraživaču.

Put se gradi na postojećem terenu. S osi trase i koridorom, ali bez tačaka snimanja ili površine za sada, put se crta na privremenom zamjenskom terenu: na prosječnoj koti svog projektnog profila, ili u nivou na koti 0 kada nema ni profila. Upozorenje na dnu 3D pogleda i u svojstvima koridora to kaže. To je samo slika: od nje ne dolaze zapremine ni presjeci. Otvori tačke snimanja ili površinu i put se sam premješta na pravi teren.

Vertikalno uvećanje rasteže teren, a ne biljke: one stoje na uvećanom terenu na svojoj pravoj visini i širini, pa drvo izgleda kao drvo na svakoj postavci. Biljke su jednostavni oblici, a ne detaljni modeli: hiljade njih ostaju brzo za okretanje i zumiranje.

## Cijevi i građevine

- Cijev se crta s dnom unutra na kotama dna koje postavite i njenim vrhom unutra (tjeme) jedan unutrašnji prečnik više. Prečnici su u inčima u projektu u stopama i u milimetrima u projektu u metrima, kao u desnom panelu.
- Građevina ide od svog oboda (upisanog ili iz površine) do svoje sabirne jame (najniža kota dna minus dubina sabirne jame). Bez ikakve kote dna, crta se dubine 5 ft (1,5 m).
- Cijevi i građevine s problemom (vidi provjeru mreže u desnom panelu) crtaju se crveno.
- Cijev bez kota dna se ne crta; napomena na dnu pogleda kaže koliko ih je.

## Biranje iz 3D pogleda

Klikni osu trase (ili njen put), platou, liniju karakteristika, cijev, građevinu, tačku snimanja, biljku, rampu ili drugo tvrdo uređenje. Izabere se kao da ste kliknuli na planu: njena svojstva se otvaraju u desnom panelu, gdje je možete urediti, i crta se u boji izbora preko svega u 3D-u. Što god izaberete na planu, također se označava u 3D-u. Savjet pored pokazivača imenuje ono što ste kliknuli s njegovom istočnom koordinatom, sjevernom koordinatom i kotom. Cijevi i građevine se mogu kliknuti i tamo gdje su ispod zemlje; liniju skrivenu iza brda ne možete kliknuti kroz nju.

Klikni liniju prijeloma da vidiš koja je: označi se, a statusna traka je imenuje (linije prijeloma nemaju sopstvena svojstva).

Klikni teren da pročitaš istočnu koordinatu, sjevernu koordinatu i kotu tamo u savjetu.

## Vožnja duž osi trase

Klikni **Vožnja** na 3D traci i izaberi os trase. Pogled se premješta na sjedište vozača: 3,5 ft (1,07 m) iznad puta, na njegovom projektnom profilu (na postojećem terenu duž ose kada ga još nema), gledajući unaprijed duž njega.

- **Pusti** ili {{key:Space}} vozi brzinom koju izabereš (10 do 65 mph, ili 15 do 100 km/h); {{key:Space}} ponovo pauzira. Staje na kraju; **Pusti** tada počinje ponovo od početka.
- Klizač skače na bilo koju stacionažu; {{key:Left}} i {{key:Right}} korače 10 ft (5 m) unazad i unaprijed.
- Prevlačenje u pogledu pauzira i dopušta vam da se osvrnete.
- **Zaustavi** ili {{key:Esc}} vraća pogled tamo gdje je bio.

Vertikalno uvećanje važi i dok vozite: postavi ga na 1× da vidiš put kako će biti.

## Svjetlo od sunca

Otvori **Sunce** na 3D traci i označi **Osvjetljenje od sunca**. Unesi datum, vrijeme na satu i njegovu vremensku zonu (odstupanje od UTC: ljeti, ona s ljetnjim računanjem), te geografsku širinu i dužinu lokacije. Kada projekat ima koordinatni sistem, one se popunjavaju iz njega.

Lokacija je tada osvijetljena odakle je sunce, sa **Sjenama** preko terena, koridora i platoa; meni kaže azimut sunca i koliko je visoko, ili da je ispod horizonta. Položaji dolaze iz NOAA-inih solarnih jednačina. Sjene padaju na pravi način pri bilo kojem uvećanju, ali staju na ivici lokacije: brda i zgrade izvan nje ne bacaju nijednu.

## Izvoz 3D pogleda

Klikni {{ui:GLB}} ili {{ui:OBJ}} na traci. Ono što pogled prikazuje se spašava, u pravoj razmjeri (bez uvećanja), u metrima, s Y prema gore. Detalji: [Izvoz lokacije u 3D](topic:export-3d).
