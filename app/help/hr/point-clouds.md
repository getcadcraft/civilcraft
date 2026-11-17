---
title: Oblaci točaka s dronova ili skenera
summary: Uz dodatak Oblaci točaka otvorite LAS ili LAZ datoteku s milijunima točaka, pregledajte ih, očistite, razvrstajte u teren, vegetaciju i zgrade te iz njih izradite teren, izohipse i volumene.
keywords: oblak točaka, las, laz, dron, fotogrametrija, recap, lidar, skeniranje, teren, klasificiraj, šum, gomila materijala, volumen, iskop i nasip, izohipse, prijelomnica, eye-dome, ortomozaik, ortho, drapiranje, sloj karte, izvoz las, izvoz laz, komprimiraj
from: e4a4901f
---

Većini ljudi ovo nikad ne treba, zato je riječ o dodatku. Uključite {{ui:Oblaci točaka}} u Postavke › Dodaci; kartica {{ui:Oblaci točaka}} pojavit će se na desnoj ploči. Datoteka se čita u vašem pregledniku i dijeli na pločice koje se čuvaju u pohrani vašeg preglednika (ili u mapi koju odaberete). **Ništa se ne učitava.**

:::warning
Sve što ova kartica prikazuje brojka je iz vaših podataka, a ne potvrda. Testirano je na izmišljenom gradilištu, a ne još na stvarnom snimanju dronom: prve rezultate čitajte pažljivo i javite nam što ste našli. Ovlašteni inženjer odlučuje o vrijednosti terena, izohipsa i volumena.
:::

## Otvori oblak

Pod {{ui:Otvori oblak}} odaberite LAS ili LAZ datoteku. Kartica pokazuje koliko točaka sadrži, njezin koordinatni sustav i jedinice te koliko prostora treba za izradu; pritisnite {{ui:Izradi oblak}}. Izrada se može zaustaviti i nastaviti pomoću {{ui:Nastavi}} (ponovno odaberite istu datoteku). Datoteka se nikad ne mijenja. Datoteka sa 100 milijuna točaka izradi se za nekoliko minuta na radnoj stanici i treba prostora otprilike koliko i sama datoteka.

Pod {{ui:Oblaci na ovom računalu}} otvarate ili uklanjate oblak. {{ui:Čuvaj oblake u mapi…}} (Chrome, Edge i aplikacija Studio) pločice sprema u mapu koju odaberete, npr. mapu za oblake CadCraft u Dokumentima, pa oblak od 10 GB ne mora stati u pohranu preglednika; oblaci izrađeni ranije ostaju tamo gdje su izrađeni. Preglednik nakon ponovnog pokretanja ponovno traži dopuštenje: pritisnite {{ui:Ponovno koristi mapu …}}.

## Pogledajte ga

{{ui:Pogledaj u 3D}} crta oblak od grubih pločica i poboljšava prikaz kako se približavate, ali nikad ne više od {{ui:Najviše prikazanih točaka}} odjednom (2.5 milijuna; 500 tisuća na telefonu). Boja prema vlastitoj boji datoteke, visini, klasi, intenzitetu ili ostatku. {{ui:Eye-dome osvjetljenje}} sjenčа rubove prema dubini pa se oblik čita bez normala (na telefonu isključeno); {{ui:Točke se smanjuju s udaljenošću}} udaljene točke čini manjima, a bliske većima; {{ui:Veličina točke}} postavlja veličinu. Tlocrt prikazuje oblak kao rasterski sloj ispod vašeg crteža i **poboljšava prikaz kad uvećate** neki njegov dio.

## Očistite ga

Pod {{ui:Očisti}} nacrtajte laso, pravokutnik ili poligon u tlocrtu (ili u 3D pogledu s gornjeg pogleda: u 3D-u se obris projicira okomito, pa je točan samo odozgo). Kartica prije primjene pokazuje koliko je točaka unutra: {{ui:Izbriši ove točke}}, {{ui:Promijeni njihovu klasu}}, {{ui:Vrati izbrisane točke}} ili {{ui:Obreži na ovu granicu}}. {{ui:Poništi}} i {{ui:Ponovi}} kreću se kroz dnevnik uređivanja; sama datoteka se nikad ne mijenja. {{ui:Filtar šuma…}} označava lutajuće točke kao niske točke (klasa 7) ili visoki šum (klasa 18).

## Razvrstajte ga

{{ui:Pronađi teren}} radi pločicu po pločicu i označava teren (klasa 2) i niske točke; tolerancija je 0.15 m, odnosno 0.08 m uz prekidač geodetske kvalitete. Javlja spojeve pločica koji se ne slažu. {{ui:Razvrstaj vegetaciju i zgrade}} zatim označava nisku, srednju i visoku vegetaciju te zgrade prema visini iznad terena i ravnosti okoline. Nema strojnog učenja, pa niska ravna šupa pod drvećem može biti pogrešno označena: provjerite.

## Teren, izohipse, prijelomnice

{{ui:Izradi teren}} izrađuje postojeći teren iz točaka terena i dodaje ga projektu na isti način kao uvoz LAS-a (jedan korak poništavanja). Zatim uspoređuje točke s njim: srednju vrijednost, RMS, 95. percentil, udio unutar tolerancije i deset mjesta s najvećim odstupanjima, svako s {{ui:Idi tamo}}. Bojanje prema {{ui:Ostatak}} pokazuje gdje se teren i oblak ne podudaraju.

**Prijelomnica** (rub kolnika, jarak ili vrh nasipa) bira se na oblaku: {{ui:Odaberi prijelomnicu na oblaku}} u 3D pogledu uzima najbližu nacrtanu točku pri svakom kliku, a {{ui:Odaberi prijelomnicu u tlocrtu}} uzima najbližu točku oblaka (najprije teren) ispod svakog klika; dvostruki klik ili Enter završava liniju. Sljedeće {{ui:Izradi teren}} je koristi. {{ui:Prikaži izohipse}} crta izohipse preko oblaka na maloj slici i postavlja interval projekta.

## Volumeni

{{ui:Volumen gomile…}} izračunava volumen površine iznad baze unutar granice koju nacrtate. Nacrtajte granicu na ravnom terenu oko gomile i odaberite bazu: najnižu točku granice, ravninu, glatku zakrivljenu bazu, plohu kroz granicu ili kotu koju upišete. Na nagnutom ili zakrivljenom terenu koristite ravninu ili zakrivljenu bazu; najniža točka daje previsoku vrijednost. Točke granice koje stoje iznad ostalih (drvo na liniji) izostavljaju se iz baze. {{ui:Od leta do leta}} daje iskop i nasip između dva oblaka. Oba se mogu spremiti kao CSV.

## Ortomozaik

Pod {{ui:Ortomozaik (slika odozgo)}} odaberite dronov ortomozaik zajedno s njegovom world file datotekom i `.prj` datotekom kad je ima: GeoTIFF, ili PNG ili JPEG. Postaje **sloj karte** projekta, pa tlocrt prikazuje njega ispod vašeg crteža, a 3D pogled (boja: {{ui:Karta}}) ga nanosi na izrađeni teren, zato prvo {{ui:Izradi teren}}. Kartica pokazuje koliki dio oblaka slika pokriva i upozorava kad ne pokriva nijedan: uobičajeni uzrok je drugi koordinatni sustav, pa uz nju dajte datoteku `.prj`. Kad nema `.prj`, program pita gdje su koordinate. Slika se čuva unutar datoteke projekta; GeoTIFF veći od 200 MB se odbija, a vrlo velik mozaik smanjuje se na 16 megapiksela, pa za velika snimanja prvo obrežite mozaik na gradilište.

## Izvoz

{{ui:Izvoz}} zapisuje očišćen, razvrstan oblak kao novu datoteku (sve točke, samo očišćene klase ili samo teren). Pod {{ui:Vrsta datoteke}} odaberite:

- **LAS 1.4 (nekomprimirano)**: format točaka 6, ili 7 s bojom.
- **LAZ (komprimirano)**: iste točke komprimirane bez gubitka, pa se svaka točka vraća točno. Zapisuje se kao format točaka 0, ili 2 s bojom, u datoteci LAS 1.4. Na izmišljenom gradilištu od 300 m LAZ je bio otprilike petina veličine datoteke LAS 1.4. Formati LAZ 0 i 2 sadrže samo klase od 0 do 31: točka s višom klasom odbija se uz poruku, pa taj oblak izvezite kao LAS 1.4.

LAZ zapisuje vlastiti kompresor CadCraft-a, izrađen prema objavljenoj specifikaciji LAZ-a. Provjerili smo da naš čitač i dva neovisna LAZ čitača (laz-perf, koji aplikacija koristi za otvaranje LAZ datoteka, te laspy s lazrs) vraćaju svaku točku točno, te da LAZ datoteke koje napravi laspy budu bajt po bajt iste kad ponovno zapišemo njihove točke. Drugi programi još nisu isprobani, pa ako neki ne otvara datoteku, javite nam koji.

Ako preglednik može zapisivati datoteku dok radi, prvo odaberete datoteku pa se vrlo velik oblak zapisuje u nju pločicu po pločicu umjesto da se skuplja u memoriji; inače se datoteka skuplja i preuzima, što je u redu do nekoliko stotina megabajta.

## Što ne radi

Čita samo LAS i LAZ (E57, PLY i PCD još nisu povezani s ovom karticom, a više datoteka jednog leta se ne spaja), ne reprojicira oblak (pretpostavljaju se koordinatni sustav i metri projekta), ne čita Autodeskove datoteke RCP ili RCS, ne izrađuje plohu iz fotografija i sam ne pronalazi stupove, rubove kolnika ili cijevi.
