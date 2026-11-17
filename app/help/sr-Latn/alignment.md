---
title: Iscrtajte horizontalnu trasu
summary: Nacrtajte trasu preko njenih PI tačaka, postavite radijuse krivina i početnu stacionažu, pomerajte PI tačke i čitajte podatke krivina te stacionažu i odstupanje.
keywords: trasa, nema rešenja, krivina ne staje, najveći radijus, najmanji radijus, minimalni radijus, projektna brzina, preklapanje, osovina, pi, horizontalna krivina, radijus, stacionaža, tangenta, kreiraj trasu, raspored trase, pc, pt, stacionaža odstupanje
from: 8c5df4aa
---

Trasa u CivilCraft-u je lanac tangenti kroz tačke preseka (PI), sa kružnom krivinom na svakoj unutrašnjoj PI tački koja ima radijus. Ima stacionažu od početne stacionaže koju izaberete. Projekat može imati mnogo trasa.

## Crtanje trase

1. Pritisnite {{key:A}}, ili kliknite {{ui:Trasa}} u grupi **Projektovanje**.
   Savet kaže „Trasa: kliknite PI tačke redom. Enter ili dvoklik završava, Backspace briše poslednju, Esc otkazuje.“
2. Kliknite prvu PI tačku (početak trase).
3. Kliknite svaku sledeću PI tačku redom. Crvena linija prati pokazivač i pokazuje dužinu i pravac tangente koju crtate, na primer „212.40 ft  N 63°12'05" E“.
4. Kliknite poslednju PI tačku (kraj trase).
5. Pritisnite {{key:Enter}}.
   Trasa je iscrtana sa stacionažom i izabrana je. Statusna traka kaže, na primer, „Trasa 1: 386.36 ft, krivine radijusa 100 ft gde staju. Izmenite radijuse u Svojstvima; Profil (R) za projektovanje nivelete.“

Dok crtate: {{key:Backspace}} uklanja poslednju PI tačku, {{key:Esc}} otkazuje, a prevlačenje po praznom prostoru pomera pogled bez dodavanja PI tačke.

:::warning
Završite sa {{key:Enter}}. Dvoklik takođe završava, ali u ovoj verziji briše PI tačku na koju ste dvaput kliknuli. Kliknite poslednju PI tačku jednom, pa pritisnite {{key:Enter}}.
:::

Svaka unutrašnja PI tačka dobija krivinu od 100 ft (30 m u projektu u metrima), ili najveći ceo radijus koji staje u polovini svake tangente ako 100 ft ne staje. Veoma oštre PI tačke ili one kroz koje se ide pravo ne dobijaju krivinu.

## Postavljanje radijusa i koordinata

Kada je trasa izabrana, desni panel prikazuje **Trasa**:

1. **Naziv** i **Početna stacionaža**. Upišite stacionažu kao `10+00` (stope) ili `0+500` (metri), ili kao običan broj. Videti [Jedinice, stacionaže i formati brojeva](topic:units-and-stations).
2. **Dužina** i **Krajnja stacionaža** se izračunavaju za vas.
3. Tabela **PI tačke** navodi **Istok** i **Sever** svake PI tačke, i **Radijus** za svaku unutrašnju PI tačku. Upišite novu vrednost i pritisnite {{key:Enter}}.
   - Radijus 0 pravi tačku prelamanja bez krivine.
   - Prva i poslednja PI tačka nikada nemaju radijus.
   - Mali x na kraju reda uklanja tu PI tačku (trasa zadržava najmanje dve).
4. Pročitajte spisak **Krivine**: za svaku krivinu, njene stacionaže PC i PT, radijus R, skretanje Δ i smer (levo ili desno), dužinu L, tangentu T, spoljašnje odstojanje E i tetivu.
5. Linija ispod krivina daje pravac prve tangente.

## Kada krivina ne staje

Ako krivinama treba više tangente nego što ima između njihovih PI tačaka, trasa nema rešenje: nije ispravno iscrtana dok je ne popravite, i izostavlja se iz LandXML izvoza. Crveni okvir kaže zašto, brojevima, i nudi šta bi stalo:

- „Krivine na PI 2 i PI 3 treba da imaju 240.00 ft tangente između sebe (130.00 + 110.00), a PI tačke su udaljene 180.00 ft.“ — ili, kada je samo jedna od njih sa krivinom, „Krivina na PI 2 treba 240.00 ft tangente ka PI 1 …“.
- Dugme za svaku PI tačku postavlja **najveći radijus koji staje** tu, dok je druga krivina ostavljena kakva jeste (mora da staje i u drugoj tangenti te PI tačke). Kada obe PI tačke imaju krivine, **Obe** smanjuje dva radijusa srazmerno tako da se upravo spoje.
- Kada je sama jedna krivina duža od tangente, okvir kaže da nijedna krivina na drugoj PI tački ne može da stane dok je tako velika.
- PI tačka koja se vraća unazad ne može da primi krivinu; okvir nudi **Bez krivine na PI n**.

Svako dugme je jedan korak: {{key:Mod+Z}} vraća radijuse. Ponuđeni radijusi se zaokružuju naniže na 0.01 da uvek stanu.

### Projektni minimalni radijus

Upišite **Minimalni projektni radijus** (na primer iz projektne brzine) da se svaka krivina proveri prema njemu; ostavite prazno ako nema. Krivina ispod njega navodi se sa dugmetom za **najmanji radijus koji zadovoljava minimum**, kada taj radijus staje. Kada ne staje, okvir to kaže i daje najveći radijus koji tangente dozvoljavaju, pa znate da treba da pomerite PI tačku ili smanjite minimum.

## Pomeranje PI tačaka na planu

1. Sa aktivnim {{ui:Izaberi}} kliknite trasu da je izaberete. Kvadratići se pojavljuju na njenim PI tačkama.
2. Prevucite kvadratić. Trasa, njena stacionaža, profil i koridor prate.
3. Otpustite. Pomeranje je jedan korak za poništavanje.

Dodavanje PI tačke između dve postojeće još nije dostupno: uklonite trasu i nacrtajte je ponovo, ili upišite nove koordinate za PI tačke koje imate.

## Čitanje stacionaže i odstupanja

Pomerite pokazivač iznad plana. Statusna traka prikazuje najbližu trasu (ili izabranu) sa stacionažom i odstupanjem, **L** ili **R** gledano u smeru rasta stacionaže, na primer „Trasa 1: Sta 2+15.30, odstupanje 18.42 R“. Iza bilo kog kraja dodaje se „(iza kraja)“.

## Šta se crta

Na planu, u DXF-u i u PDF-u: osovina (tangente kao linije, krivine kao prave lukove), oznaka na svakih 50 ft (20 m) sa dužom oznakom i nazivom stacionaže na svakih 100 jedinica, i oznake PC i PT sa njihovim stacionažama.

## Brisanje trase

Izaberite je i pritisnite {{key:Delete}}, ili kliknite {{ui:Izbriši}} na traci sa alatkama ili na dnu desnog panela. Njen profil i koridor idu sa njom. {{key:Mod+Z}} je vraća.

:::mac
Na Mac tastaturi, taster označen sa **delete** je u pregledaču {{key:Backspace}} i ne briše izbor. Pritisnite {{key:Delete}} (Fn i delete), ili upotrebite dugme {{ui:Izbriši}}.
:::

## Dalje

- [Projektovanje vertikalnog profila](topic:profile).

## Projektna brzina i klasa

Ispod svojstava trase, **Projektna brzina** (km/h ili mph) i **Projektna klasa** čuvaju se uz trasu, upisuju se u projekat i zapisuju u IFC (Pset_RoadDesignCriteriaCommon). CivilCraft nema tabelu koja vezuje brzinu za minimalni radijus, pa se ništa ne proverava na osnovu njih: postavite **Minimalni projektni radijus** prema vašem sopstvenom projektnom standardu.

## Spirale

Krivina može imati klotoidnu spiralu na bilo kom kraju: tangenta, spirala, krivina, spirala, tangenta. U tabeli PI tačaka upišite dužinu u **Spirala ulaz** i **Spirala izlaz** za PI tačku koja ima radijus. PI tačka ostaje gde jeste; krivina se pomera unutra da napravi mesto, pa rastojanje tangente raste za pomak spirale. Dve dužine mogu da se razlikuju, a PI tačka sa samo jednom dužinom dobija spiralu samo na tom kraju.

Spisak krivina zatim glasi TS, SC, CS i ST (tangenta na spiralu, spirala na krivinu, krivina na spiralu, spirala na tangentu) sa uglom spirale θs, rastojanjima tangente i spoljašnjim odstojanjem. Stacionaže teku duž spirala kao i svuda. Spirale koje zajedno skreću više nego krivina se odbijaju uz navođenje PI tačke; spirala duža od onoga što tangenta dozvoljava je preklapanje, kao kod svake krivine. Nadvišenje koristi spiralu kao prelaznu rampu (videti [Koridor](topic:corridor)).
