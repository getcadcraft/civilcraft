---
title: Načrtovanje vrta od začetka do konca
summary: Deset korakov krajinskega arhitekta, od geodetskega posnetka do objavljenega kompleta, z navedbo, kaj delovno okolje krajinske ureditve za vsakega danes naredi in česa še ne naredi.
keywords: vadnica, navodila, kako, načrtovanje krajinske ureditve, načrtovanje vrta, začetek, primer, vzorec, postopno, geodetski posnetek, črte, teren, sajenje, razpredelnica, listi, objava, en projekt
from: 87900bf5
---

Krajinska ureditev se vrti v krogu: posnetek, skica, črte, teren, površine, kote, sajenje, razpredelnice, listi in spet nazaj. Tu je deset korakov, z navedbo, kaj za vsakega obstaja. Kjer ima korak vrzel, je ta navedena v razdelku **Še ni izdelano** na koncu in ni skrita v koraku.

Lahko sledite na vzorčnem mestu ali na lastnem geodetskem posnetku. Pri lastnem začnite pri koraku 1.

## 1. Uvoz geodetskega posnetka

{{ui:Površje}} › {{ui:Črte iz risbe …}}, izberite risbo posnetka (DWG 2000–2018 ali DXF). Preverite enote, vzemite plastnice, 3D polilinije in mejo za površje ter točkovne bloke kot geodetske točke. Razdelek **Preverjanje višin in posnetka** prebere višine, zapisane kot besedilo ali atribut, in pred dodajanjem česar koli navede, kaj izgleda narobe (enote, koordinatni sistem, oddaljenost od izhodišča, ravne plastnice, nenavadne višine, podvojene točke). Glejte [Preverjanje risbe posnetka pri uvozu](topic:survey-check) in [Odpiranje DWG ali DXF kot črt](topic:open-dwg-dxf). Koordinatni sistem nastavite z {{ui:Koordinatni sistem …}}.

## 2. Ročne skice

List na papirju, na primer star posnetek ali označen izpis, pride z {{ui:Skeniraj…}} (Začni s skeniranjem): postavi se v merilu ali na znane koordinate pod načrt in se lahko obriše v črte. ModelCraft prebere fotografijo ročne skice (Datoteka › Uvozi fotografijo skice…). CivilCraft sam nima orodja za ročno skico: list postavite pod načrt in ga obrišite.

## 3. Od skice do črt

Narišite značilne črte in obrise nad posnetkom v CivilCraft ali v 2D risbi. Krajinska ureditev › Več › {{ui:Iz črte}} spremeni črto v tlakovanje, zasajeno površino, zid, stopnice, značilno črto in še več, ohranjeno povezano: premaknete črto, objekt sledi. Glejte [Objekti iz črt](topic:objects-from-lines). V SuperCad Studio odprite mesto, risbo in gradbeni model v enem projektu: delovno okolje **Krajinska ureditev** ima orodja vseh, črta, izbrana v 2D risbi, pa lahko postane krajinski objekt, ki ji sledi (Ctrl+K, {{ui:Krajinski objekt iz izbrane črte risbe}}).

## 4. Predvideni teren

Odprite {{ui:Površje}} › {{ui:Več}} › {{ui:Delovno okolje krajinske ureditve}}. Predvideno površje izdelajte z {{ui:Ploščad}}, {{ui:Nasip}} in {{ui:Zatravljen jarek}} ter območji oblikovanja s točkovnimi kotami in plastnicami; tlakovanje, poti, zidovi, klančine in stopnice, ki jih dodate, se oblikujejo v isto predvideno površje. Obstoječi teren se nikoli ne spremeni. {{ui:Kote}} › {{ui:Oblikovalci terena…}} našteje vse, kar oblikuje teren, v enem vrstnem redu, z odkopom in nasipom za vsakega. Glejte [Oblikovanje terena](topic:landscape-grading) in [Oblikovalci terena in žive kote](topic:ground-modifiers).

## 5. Tlakovanje in zasajene površine

{{ui:Utrjene površine}} › {{ui:Tlakovanje}}, {{ui:Pot}}, {{ui:Zid}}, {{ui:Robnik}}, {{ui:Klančina}} in {{ui:Stopnice}}. {{ui:Površine}} nariše trato, gredo, travnik ali rušnico s svojo sestavo; sama se obreže okoli tlakovanja, zidov in stopnic. {{ui:Greda}} zapolni površino z razmikom rastlin iz mešanice rastlin. Glejte [Utrjene površine](topic:hardscape), [Zasajene površine](topic:planted-areas) in [Sajenje](topic:planting).

## 6. Višine, nakloni in stiki

Pod **Preverjanja oblikovanja terena** označite **Analiza naklona** in **Puščice toka in zastajanje vode**. Če se voda zbira ob teraso, okoli nje dodajte {{ui:Zatravljen jarek}}. Lastnosti povedo, koliko stopnic potrebujejo stopnice in ali se prilegajo, ter kje je pot strmejša od dovoljene meje. Podokno Težave našteje, kje se objekti slabo stikajo: zid, ki sega previsoko, greda nad tlakovanjem, stopnice, ki ne dosežejo svojega podesta. {{ui:Točkovna kota}} in {{ui:Puščica naklona}} označita teren in se posodabljata sami.

## 7. Sajenje

V **Rastlinah** poiščite v seznamu rastlin (nekaj sto vrst ali vaš seznam), izberite eno in jo postavite z {{ui:Rastlina}}, {{ui:Greda}} ali {{ui:Živa meja}}. Velikost in oznake rastline nastavite v meniju Več. Več › {{ui:Tabela rastlin}} ureja vaše zapise: sorte, dobavljene velikosti, gostoto, opombe o specifikacijah. Vsak zapis lahko nosi vaš simbol in 3D model (OBJ, STL ali GLB), Več › {{ui:Grafika rastlin}} pa riše rastline preprosteje pri večjih merilih. Glejte [Seznam rastlin](topic:plant-list), [Zapisi rastlin](topic:plant-records) in [Grafika rastlin](topic:plant-graphics).

## 8. Količine in razpredelnice

Več › {{ui:Preglednice}}: razpredelnice rastlin in utrjenih površin ter vaše lastne ostanejo povezane z objekti; shranite jih kot CSV ali XLSX ali jih postavite na liste (glejte [Preglednice](topic:worksheets)). Več › {{ui:Razpredelnica rastlin …}} pošlje števila v TakeoffCraft. Količine utrjenih površin so v lastnostih tlakovanja, zidov in stopnic. Namakanje ima svoj seznam materiala: {{ui:Namakanje}} › **Preveri sistem…**. Glejte [Namakanje](topic:irrigation).

## 9. Risbe in listi

Več › {{ui:Listi krajinske ureditve …}}: načrti sajenja, oblikovanja terena in namakanja, s podrobnostmi. {{ui:Kote}} › {{ui:Črta prereza}} nariše prereze skozi teren, zidove, sestave, stopnice in rastline. Glejte [Listi krajinske ureditve](topic:landscape-sheets) in [Prerezi in komplet za objavo](topic:landscape-sections).

## 10. Objava

{{ui:Komplet za objavo (.zip)}} v pogovornem oknu listov ustvari en PDF s seznamom listov in DWG za vsak list. Več › {{ui:Izvozi IFC krajinske ureditve}} da BimCraft rastline in utrjene površine. Shranite projekt: vse je v eni datoteki.

## Spremenite eno stvar: stopnišče

Smisel tega, da je vse v enem projektu, je, da se sprememba prenese. Poskusite z vrsto stopnic med dvema terasama:

1. Narišite črto vrste kot značilno črto (ali kot črto v risbi), nato Krajinska ureditev › Več › {{ui:Iz črte}} › {{ui:Stopnice}}. V lastnostih stopnic označite **Oblikuje teren** in nastavite spodnjo in zgornjo koto na obe terasi.
2. Narišite zasajeno gredo ob vrsti in pod njo z {{ui:Površine}} ter tlakovanje na terasah. Greda se obreže okoli stopnic in tlakovanja, razpredelnica rastlin pa šteje samo tisto, kar je posajeno.
3. Dvignite zgornjo koto vrste v lastnostih. Predvideni teren, točkovne kote, puščice naklona ter odkop in nasip se takoj spremenijo. Če vrsta več ne seže do zgornje terase, podokno Težave pove, za koliko.
4. Premaknite črto vrste. Stopnice sledijo svoji črti v istem koraku razveljavitve; greda se znova obreže in prešteje, preglednice in razpredelnice pa pokažejo nova števila.
5. Enkrat pritisnite Ctrl+Z: črta, stopnice, teren in greda se vrnejo skupaj.

Glejte [Oblikovalci terena in žive kote](topic:ground-modifiers), [Zasajene površine](topic:planted-areas) in [Preglednice](topic:worksheets).

## Še ni izdelano

To so zmožnosti, ki so zahtevane in jih ta različica še nima:

- Zidovi, ki oblikujejo teren (poročajo, kje se stikajo z njim, njihov vrh pa mu lahko sledi).
- Urejanje vašega lastnega seznama rastlin iz knjižnice v programu (uredite seznam projekta in ga shranite kot datoteko rastlin).
- Teksture in barve vaših lastnih 3D modelov rastlin GLB (oblika se prebere; uporabi se barva rastline).

Glejte [Delovno okolje krajinske ureditve](topic:landscape) za vsa orodja.
