---
title: Oblaci tačaka iz drona ili skenera
summary: Uz dodatak Oblaci tačaka otvorite LAS ili LAZ datoteku s milionima tačaka, pregledajte je cijelu, očistite je, razvrstajte na teren, vegetaciju i zgrade te iz nje izgradite teren, izohipse i zapremine.
keywords: oblak tačaka, las, laz, dron, fotogrametrija, recap, lidar, skeniranje, teren, klasifikacija, šum, gomila, zapremina, iskop i nasip, izohipse, linija loma, eye-dome, ortomozaik, ortho, prekrivanje, sloj karte, izvoz LAS, izvoz LAZ, kompresija
from: e4a4901f
---

Većina ljudi ovo nikad ne treba, zato je ovo dodatak. Uključite {{ui:Oblaci tačaka}} u Postavke › Dodaci; u desnom panelu pojavit će se kartica {{ui:Oblaci tačaka}}. Datoteka se čita u vašem pregledniku i dijeli na pločice koje se čuvaju u vlastitom skladištu pregledača (ili u folderu koji odaberete). **Ništa se ne otprema.**

:::warning
Sve što ova kartica prikazuje je broj iz vaših podataka, a ne potvrda. Testirano je na izmišljenoj lokaciji, a ne još na pravom snimanju dronom: prve rezultate čitajte pažljivo i javite nam šta nađete. Ovlašteni inženjer odlučuje šta vrijede teren, izohipse i zapremine.
:::

## Otvorite oblak

Pod {{ui:Otvori oblak}} odaberite LAS ili LAZ datoteku. Kartica pokazuje koliko tačaka sadrži, njen koordinatni sistem i jedinice te koliko prostora treba za izgradnju; pritisnite {{ui:Izgradi oblak}}. Izgradnja se može zaustaviti i nastavlja se s {{ui:Nastavi}} (ponovo odaberite istu datoteku). Datoteka se nikad ne mijenja. Oblak od 100 miliona tačaka gradi se za nekoliko minuta na radnoj stanici i zauzima otprilike onoliko prostora koliko i sama datoteka.

Pod {{ui:Oblaci na ovom računaru}} otvarate ili uklanjate oblak. {{ui:Čuvaj oblake u folderu…}} (Chrome, Edge i aplikacija Studio) čuva pločice u folderu koji odaberete, na primjer folderu CadCraft oblaci u Dokumentima, tako da oblak od 10 GB ne mora stati u prostor pregledača; oblaci izgrađeni ranije ostaju tamo gdje su izgrađeni. Pregledač ponovo traži dozvolu nakon ponovnog pokretanja: pritisnite {{ui:Koristi folder … ponovo}}.

## Pogledajte ga

{{ui:Pogledaj u 3D}} crta oblak iz grubih pločica i pročišćava ga kako se približavate, nikad s više od {{ui:Najviše prikazanih tačaka}} odjednom (2.5 miliona; 500 hiljada na telefonu). Bojite prema boji iz same datoteke, visini, klasi, intenzitetu ili ostatku. {{ui:Eye-dome osvjetljenje}} sjenči ivice prema dubini tako da se oblik vidi bez normala (isključeno na telefonu); {{ui:Tačke se smanjuju s udaljenošću}} čini udaljene tačke manjim, a bliske većim; {{ui:Veličina tačke}} određuje veličinu. Plan prikazuje oblak kao rastersku sliku ispod vašeg crteža i **pročišćava se kad uvećate** neki dio.

## Očistite ga

Pod {{ui:Očisti}} nacrtajte lasso, pravougaonik ili poligon u planu (ili u 3D iz pogleda odozgo: u 3D se obris projicira pravo nadolje, tako da je tačan samo odozgo). Kartica prikazuje koliko tačaka je unutra **prije** nego što primijenite: {{ui:Izbriši ove tačke}}, {{ui:Promijeni im klasu}}, {{ui:Vrati izbrisane tačke}} ili {{ui:Obreži na ovu granicu}}. {{ui:Poništi}} i {{ui:Ponovi}} se kreću kroz dnevnik izmjena; sama datoteka se nikad ne mijenja. {{ui:Filter šuma…}} označava rasute tačke kao niske tačke (klasa 7) ili visoki šum (klasa 18).

## Razvrstajte ga

{{ui:Pronađi teren}} radi pločicu po pločicu i označava teren (klasa 2) i niske tačke; tolerancija je 0.15 m, ili 0.08 m uz prekidač za geodetski nivo tačnosti. Prijavljuje spojeve pločica koji se ne slažu. {{ui:Klasifikuj vegetaciju i zgrade}} zatim označava nisku, srednju i visoku vegetaciju te zgrade prema visini iznad terena i tome koliko su okolne površine ravne. Nema mašinskog učenja, pa ravna krovna šupa ispod drveća može biti pogrešno označena: provjerite.

## Teren, izohipse, linije loma

{{ui:Izgradi teren}} pravi postojeći teren od tačaka terena i dodaje ga projektu na isti način kao uvoz LAS-a (jedan korak poništavanja). Zatim upoređuje tačke s njim: srednju vrijednost, RMS, 95. percentil, udio unutar tolerancije i deset mjesta koja se najviše razlikuju, svako s {{ui:Idi tamo}}. Bojenje prema {{ui:Ostatak}} pokazuje gdje se teren i oblak ne slažu.

**Linija loma** (ivičnjak, jarak ili vrh nasipa) bira se na oblaku: {{ui:Odaberi liniju loma na oblaku}} u 3D pogledu uzima najbližu nacrtanu tačku pri svakom kliku, a {{ui:Odaberi liniju loma u planu}} uzima najbližu tačku oblaka (prvo teren) ispod svakog klika; dvoklik ili Enter završava liniju. Sljedeći {{ui:Izgradi teren}} je koristi. {{ui:Prikaži izohipse}} crta izohipse preko oblaka na maloj slici i postavlja interval projekta.

## Zapremine

{{ui:Zapremina gomile…}} računa zapreminu površine iznad baze unutar granice koju nacrtate. Nacrtajte granicu na ravnom terenu oko gomile i odaberite bazu: najnižu tačku granice, ravan, glatku zakrivljenu bazu, površinu kroz granicu ili nivo koji upišete. Na nagnutom ili zakrivljenom terenu koristite ravan ili zakrivljenu bazu; najniža tačka pokazuje previsoko. Tačke granice koje stoje iznad ostalih (drvo na liniji) izostavljaju se iz baze. {{ui:Let do leta}} daje iskop i nasip između dva oblaka. Oba se mogu sačuvati kao CSV.

## Ortomozaik

Pod {{ui:Ortomozaik (slika odozgo)}} odaberite dronov ortomozaik zajedno s njegovom svjetskom datotekom i `.prj` kad je ima: GeoTIFF, ili PNG ili JPEG. On postaje **sloj karte** projekta, tako da ga plan prikazuje ispod vašeg crteža, a 3D pogled (boja {{ui:Karta}}) ga slika na teren koji ste izgradili, pa prvo {{ui:Izgradi teren}}. Kartica kaže koliko oblaka slika pokriva i upozorava kad ne pokriva ništa: uobičajen uzrok je drugačiji koordinatni sistem, zato uz nju dajte `.prj` datoteku. Kad nema `.prj`, program pita gdje su koordinate. Slika se čuva unutar datoteke projekta; GeoTIFF veći od 200 MB se odbija, a vrlo veliki mozaik se smanjuje na 16 megapiksela, pa za veliko snimanje prvo isjecite mozaik na lokaciju.

## Izvoz

{{ui:Izvoz}} zapisuje očišćen, klasificiran oblak kao novu datoteku (sve tačke, čiste klase ili samo teren). Pod {{ui:Vrsta datoteke}} odaberite:

- **LAS 1.4 (nekomprimirano)**: format tačaka 6, ili 7 s bojom.
- **LAZ (komprimirano)**: iste tačke komprimirane bez gubitka, tako da se svaka tačka vrati tačno. Zapisuje se kao format tačaka 0, ili 2 s bojom, u LAS 1.4 datoteci. Na izmišljenoj lokaciji od 300 m LAZ je bio oko petine veličine LAS 1.4 datoteke. Formati LAZ 0 i 2 čuvaju samo klase 0 do 31: tačka s višom klasom se odbija uz poruku, zato taj oblak izvezite kao LAS 1.4.

LAZ piše vlastiti kompresor CadCraft-a, napravljen prema objavljenoj LAZ specifikaciji. Provjerili smo da naš čitač i dva nezavisna LAZ čitača (laz-perf, koji aplikacija koristi za otvaranje LAZ datoteka, i laspy s lazrs) vraćaju svaku tačku tačno, te da LAZ datoteke koje napravi laspy budu bajt po bajt iste kad ponovo zapišemo njihove tačke. Drugi programi još nisu testirani, pa ako neki ne otvori datoteku, javite nam koji.

Tamo gdje pregledač može zapisivati datoteku dok radi, prvo odaberete datoteku i vrlo veliki oblak se zapisuje u nju pločicu po pločicu, umjesto da se skuplja u memoriji; inače se datoteka skuplja i preuzima, što je u redu do nekoliko stotina megabajta.

## Šta ne radi

Čita samo LAS i LAZ (E57, PLY i PCD još nisu povezani s ovom karticom, a više datoteka jednog snimanja se ne spaja), ne vrši reprojekciju oblaka (pretpostavlja se koordinatni sistem projekta i metri), ne čita Autodeskove RCP ili RCS datoteke, ne pravi površinu iz fotografija i ne pronalazi stubove, ivičnjake ili cijevi sam.
