---
title: Oblaci tačaka iz drona ili skenera
summary: Uz dodatak Oblaci tačaka otvori LAS ili LAZ datoteku sa milionima tačaka, pogledaj ceo oblak, očisti ga, razvrstaj u teren, vegetaciju i zgrade, i od njega napravi teren, izohipse i zapremine.
keywords: oblak tačaka, las, laz, dron, fotogrametrija, recap, lidar, skeniranje, teren, klasifikacija, šum, deponija, zapremina, iskop i nasip, izohipse, linija loma, osvetljenje dubine, ortomozaik, ortho, prekrivanje, sloj mape, izvezi las, izvezi laz, kompresija
from: e4a4901f
---

Većina ljudi ovo nikad ne treba, zato je ovo dodatak. Uključi {{ui:Oblaci tačaka}} u Podešavanja › Dodaci; pojaviće se kartica {{ui:Oblaci tačaka}} u desnom panelu. Datoteka se čita u tvom pregledaču i deli na pločice koje se čuvaju u sopstvenom skladištu pregledača (ili u fascikli koju izabereš). **Ništa se ne otprema.**

:::warning
Sve što ova kartica prikazuje je broj iz tvojih podataka, a ne sertifikat. Testirano je na izmišljenoj lokaciji, još ne na pravom snimku dronom: prve rezultate čitaj pažljivo i javi nam šta nađeš. Ovlašćeni inženjer odlučuje koliko vrede teren, izohipse i zapremine.
:::

## Otvori oblak

Pod {{ui:Otvori oblak}} izaberi LAS ili LAZ datoteku. Kartica kaže koliko tačaka sadrži, njen koordinatni sistem i jedinice, i koliko prostora treba za izradu; pritisni {{ui:Napravi oblak}}. Izrada može da se zaustavi i nastavlja se sa {{ui:Nastavi}} (izaberi istu datoteku ponovo). Datoteka se nikad ne menja. Datoteka od 100 miliona tačaka se izrađuje za nekoliko minuta na radnoj stanici i zauzima otprilike onoliko prostora koliko i sama datoteka.

Pod {{ui:Oblaci na ovom računaru}} otvaraš ili uklanjaš oblak. {{ui:Čuvaj oblake u fascikli…}} (Chrome, Edge i aplikacija Studio) čuva pločice u fascikli koju izabereš, na primer u fascikli CadCraft oblaci u Dokumentima, pa oblak od 10 GB ne mora da stane u prostor pregledača; oblaci napravljeni ranije ostaju tamo gde su napravljeni. Pregledač ponovo traži dozvolu posle ponovnog pokretanja: pritisni {{ui:Ponovo koristi fasciklu …}}.

## Pogledaj ga

{{ui:Pogledaj u 3D}} crta oblak iz grubih pločica i poboljšava ga kako se približavaš, nikad više od {{ui:Najviše prikazanih tačaka}} istovremeno (2.5 miliona; 500 hiljada na telefonu). Boji prema boji iz datoteke, visini, klasi, intenzitetu ili rezidualu. {{ui:Osvetljenje dubine}} senči ivice prema dubini, tako da se oblik čita bez normala (isključeno na telefonu); {{ui:Tačke se smanjuju s daljinom}} čini udaljene tačke manjim, a bliske većim; {{ui:Veličina tačke}} određuje veličinu. Osnova prikazuje oblak kao rasterski sloj ispod crteža i **poboljšava se kad zumiraš** na deo oblaka.

## Očisti

Pod {{ui:Očisti}} nacrtaj lasso, okvir ili poligon u osnovi (ili u 3D iz pogleda odozgo: u 3D se obris projektuje direktno nadole, pa je tačan samo odozgo). Kartica pokazuje koliko tačaka je unutra **pre** nego što primeniš: {{ui:Izbriši ove tačke}}, {{ui:Promeni im klasu}}, {{ui:Vrati obrisane tačke}} ili {{ui:Iseci po ovoj granici}}. {{ui:Opozovi}} i {{ui:Ponovi}} prolaze kroz dnevnik izmena; sama datoteka se nikad ne menja. {{ui:Filter šuma…}} obeležava rasute tačke kao niske tačke (klasa 7) ili visoki šum (klasa 18).

## Razvrstaj

{{ui:Pronađi teren}} radi pločicu po pločicu i obeležava teren (klasa 2) i niske tačke; tolerancija je 0.15 m, ili 0.08 m uz prekidač za geodetski nivo tačnosti. Prijavljuje spojeve pločica koji se ne slažu. {{ui:Klasifikuj vegetaciju i zgrade}} zatim obeležava nisku, srednju i visoku vegetaciju i zgrade, prema visini iznad terena i prema tome koliko su okolne površine ravne. Nema mašinskog učenja, pa šupa s ravnim krovom ispod drveća može biti pogrešno označena: pogledaj.

## Teren, izohipse, linije loma

{{ui:Napravi teren}} pravi postojeći teren od tačaka terena i dodaje ga projektu na isti način kao uvoz LAS (jedan korak opozivanja). Zatim upoređuje tačke s njim: srednju vrednost, RMS, 95. percentil, deo unutar tolerancije i deset mesta koja se najviše razlikuju, svako sa {{ui:Idi tamo}}. Boja prema {{ui:Rezidual}} pokazuje gde se teren i oblak ne slažu.

**Linija loma** (ivičnjak, jarak ili vrh nasipa) bira se na oblaku: {{ui:Izaberi liniju loma na oblaku}} u 3D pogledu uzima najbližu nacrtanu tačku pri svakom kliku, a {{ui:Izaberi liniju loma u osnovi}} uzima najbližu tačku oblaka (prvo teren) pod svakim klikom; dvostruki klik ili Enter završava liniju. Sledeće {{ui:Napravi teren}} je koristi. {{ui:Prikaži izohipse}} crta izohipse preko oblaka u maloj slici i postavlja interval projekta.

## Zapremine

{{ui:Zapremina deponije…}} računa zapreminu površi iznad osnove unutar granice koju nacrtaš. Nacrtaj granicu na ravnom terenu oko gomile i izaberi osnovu: najnižu tačku granice, ravan, glatku krivu osnovu, površ kroz granicu ili nivo koji upišeš. Na nagnutom ili zakrivljenom terenu koristi ravan ili krivu osnovu; najniža tačka previsoko pokazuje. Tačke granice koje stoje iznad ostalih (drvo na liniji) se izostavljaju iz osnove. {{ui:Od leta do leta}} daje iskop i nasip između dva oblaka. Oba mogu da se sačuvaju kao CSV.

## Ortomozaik

Pod {{ui:Ortomozaik (slika odozgo)}} izaberi ortomozaik drona zajedno sa njegovom svetskom datotekom i `.prj` ako je ima: GeoTIFF, ili PNG ili JPEG. Postaje **sloj mape** projekta, pa osnova prikazuje njega ispod crteža, a 3D pogled (boja {{ui:Mapa}}) ga slika na izgrađenom terenu, zato prvo {{ui:Napravi teren}}. Kartica kaže koliki deo oblaka slika pokriva i upozorava kad ne pokriva nijedan: obično je uzrok drugačiji koordinatni sistem, zato dodaj datoteku `.prj`. Kad nema `.prj`, program pita gde su koordinate. Slika se čuva unutar datoteke projekta; GeoTIFF preko 200 MB se odbija, a vrlo veliki mozaik se smanjuje na 16 megapiksela, zato za veliko snimanje prvo iseci mozaik na lokaciju.

## Izvoz

{{ui:Izvoz}} upisuje očišćen, klasifikovan oblak kao novu datoteku (sve tačke, čiste klase ili samo teren). Pod {{ui:Vrsta datoteke}} izaberi:

- **LAS 1.4 (nekompresovano)**: format tačke 6, ili 7 sa bojom.
- **LAZ (kompresovano)**: iste tačke kompresovane bez gubitka, pa se svaka tačka vraća tačno. Piše se kao format tačke 0, ili 2 sa bojom, u datoteci LAS 1.4. Na izmišljenoj lokaciji od 300 m LAZ je bio oko petine veličine datoteke LAS 1.4. Formati LAZ 0 i 2 čuvaju samo klase 0 do 31: tačka sa višom klasom se odbija porukom, pa taj oblak izvezi kao LAS 1.4.

LAZ piše sopstveni kompresor CadCraft-a, napravljen po objavljenoj specifikaciji LAZ. Proverili smo da naš čitač i dva nezavisna LAZ čitača (laz-perf, koji aplikacija koristi za otvaranje LAZ datoteka, i laspy sa lazrs) vraćaju svaku tačku tačno, i da LAZ datoteke koje pravi laspy budu bajt po bajt iste kad ponovo upišemo njihove tačke. Drugi programi još nisu isprobani, pa ako jedan ne otvara datoteku, javi nam koji.

Gde pregledač može da piše datoteku dok radi, prvo izaberi datoteku, a vrlo veliki oblak se upisuje u nju po pločicu, umesto da se skuplja u memoriji; inače se datoteka skuplja i preuzima, što je u redu do nekoliko stotina megabajta.

## Šta ne radi

Čita samo LAS i LAZ (E57, PLY i PCD još nisu povezani s ovom karticom, i više datoteka jednog leta se ne spaja), ne prebacuje oblak u drugi koordinatni sistem (pretpostavlja se sistem projekta i metri), ne čita Autodesk-ove RCP ili RCS datoteke, ne pravi površ od fotografija i ne nalazi sam stubove, ivičnjake ili cevi.
