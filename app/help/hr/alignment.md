---
title: Iscrtavanje horizontalne osi trase
summary: Nacrtajte os trase prema njezinim PI-jevima, postavite radijuse krivina i početnu stacionažu, pomičite PI-jeve te očitajte podatke o krivini, stacionažu i odmak.
keywords: os trase, nema rješenja, krivina ne stane, najveći radijus, najmanji radijus, minimalni radijus, projektna brzina, preklapanje, središnja linija, PI, horizontalna krivina, radijus, stacionaža, tangenta, stvaranje osi trase, raspored trase, PC, PT, stacionaža i odmak
from: 8c5df4aa
---

Os trase u CivilCraftu je lanac tangenata kroz točke presjecišta (PI), s kružnim lukom u svakom unutarnjem PI-ju koji ima radijus. Ima stacionažu od početne stacionaže koju odaberete. Projekt može imati mnogo osi trase.

## Nacrtajte os trase

1. Pritisnite {{key:A}} ili kliknite {{ui:Os trase}} u grupi **Projektiranje**.
   Traka savjeta kaže: „Os trase: kliknite PI-jeve redom. Enter ili dvostruki klik završava, Backspace briše zadnji, Esc odustaje.“
2. Kliknite prvi PI (početak osi trase).
3. Kliknite svaki sljedeći PI redom. Crvena linija prati pokazivač i prikazuje duljinu i smjerni kut tangente koju crtate, na primjer „212.40 ft  S 63°12'05" I“.
4. Kliknite zadnji PI (kraj osi trase).
5. Pritisnite {{key:Enter}}.
   Os trase se iscrta sa stacionažama i odabire se. Statusna traka kaže, na primjer: „Os trase 1: 386.36 ft, krivine radijusa 100 ft gdje stanu. Radijuse uredite u Svojstvima; Profil (R) za projektiranje nagiba.“

Dok crtate: {{key:Backspace}} uklanja zadnji PI, {{key:Esc}} odustaje, a povlačenje po praznom prostoru pomiče prikaz bez dodavanja PI-ja.

:::warning
Završite s {{key:Enter}}. Dvostruki klik također završava, ali u ovoj verziji odbacuje PI na koji ste dvaput kliknuli. Kliknite zadnji PI jednom, zatim pritisnite {{key:Enter}}.
:::

Svaki unutarnji PI dobije krivinu od 100 ft (30 m u projektu u metrima), ili najveći cijeli radijus koji stane u polovicu svake tangente ako 100 ft ne stane. Vrlo oštri PI-jevi i PI-jevi u ravnoj liniji ne dobiju krivinu.

## Postavite radijuse i koordinate

Kad je os trase odabrana, desna ploča prikazuje **Os trase**:

1. **Naziv** i **Početna stacionaža**. Stacionažu upišite kao `10+00` (ft) ili `0+500` (m), ili kao običan broj. Pogledajte [Jedinice, stacionaže i oblici brojeva](topic:units-and-stations).
2. **Duljina** i **Završna stacionaža** izračunavaju se za vas.
3. Tablica **PI-jevi** navodi **Istok (E)** i **Sjever (N)** svakog PI-ja te **Radijus** za svaki unutarnji PI. Upišite novu vrijednost i pritisnite {{key:Enter}}.
   - Radijus 0 daje kutnu točku bez krivine.
   - Prvi i zadnji PI nikad nemaju radijus.
   - Mali x na kraju retka uklanja taj PI (os trase zadržava najmanje dva).
4. Pročitajte popis **Krivine**: za svaku krivinu njezine stacionaže PC i PT, radijus R, skretanje Δ i smjer (lijevo ili desno), duljinu L, tangentu T, vanjsku udaljenost E i tetivu.
5. Redak ispod krivina daje smjerni kut prve tangente.

## Kad krivina ne stane

Ako krivine trebaju više tangente nego što ima između njihovih PI-jeva, os trase nema rješenja: ne crta se ispravno dok je ne popravite, a izostavlja se iz LandXML izvoza. Crveni okvir kaže zašto, brojkama, i nudi što bi stalo:

- „Krivine na PI 2 i PI 3 trebaju 240.00 ft tangente između njih (130.00 + 110.00), a PI-jevi su udaljeni 180.00 ft.“ — ili, kad je samo jedna od njih krivina, „Krivina na PI 2 treba 240.00 ft tangente prema PI 1 …“.
- Gumb za svaki PI postavlja **najveći radijus koji tu stane**, a druga krivina ostaje kakva je (mora stati i na drugu tangentu tog PI-ja). Ako oba PI-ja imaju krivine, **Oba** proporcionalno smanjuje oba radijusa da se upravo spoje.
- Kad je sama jedna krivina duža od tangente, okvir kaže da nijedna krivina na drugom PI-ju ne može stati dok je tako velika.
- PI koji se vraća ravno unatrag ne može dobiti krivinu; okvir nudi **Bez krivine na PI n**.

Svaki gumb je jedan korak: {{key:Mod+Z}} vraća radijuse. Ponuđeni radijusi zaokruženi su naniže na 0.01 da uvijek stanu.

### Projektni minimalni radijus

Upišite **Projektni minimalni radijus** (na primjer iz projektne brzine) da se svaka krivina provjeri prema njemu; ostavite prazno ako nema. Krivina manja od njega navodi se s gumbom za **najmanji radijus koji zadovoljava minimum**, ako taj radijus stane. Kad ne stane, okvir to kaže i daje najveći radijus koji tangente dopuštaju, da znate pomaknuti PI ili sniziti minimum.

## Pomicanje PI-jeva na planu

1. Dok je aktivan {{ui:Odaberi}}, kliknite os trase da je odaberete. Na njezinim PI-jevima pojave se kvadratne ručke.
2. Povucite ručku. Os trase, njezina stacionaža, profil i koridor slijede.
3. Otpustite. Pomak je jedan korak poništavanja.

Dodavanje PI-ja između dva postojeća još nije dostupno: uklonite os trase i ponovno je nacrtajte ili upišite nove koordinate za PI-jeve koje imate.

## Očitajte stacionažu i odmak

Pomaknite pokazivač nad plan. Statusna traka prikazuje najbližu os trase (ili odabranu) sa stacionažom i odmakom, **L** ili **R** gledajući u smjeru rastuće stacionaže, na primjer „Os trase 1: Stac. 2+15.30, odmak 18.42 R“. Iza bilo kojeg kraja dodaje se „(iza kraja)“.

## Što se crta

Na planu, u DXF-u i u PDF-u: središnja linija (tangente kao linije, krivine kao točni lukovi), oznaka svakih 50 ft (20 m) s dužom oznakom i oznakom stacionaže svakih 100 jedinica, te oznake PC i PT s njihovim stacionažama.

## Brisanje osi trase

Odaberite je i pritisnite {{key:Delete}}, ili kliknite {{ui:Izbriši}} na alatnoj traci ili na dnu desne ploče. Njezin profil i koridor odlaze s njom. {{key:Mod+Z}} je vraća.

:::mac
Na Mac tipkovnici tipka označena **delete** je {{key:Backspace}} za preglednik i ne briše odabir. Pritisnite {{key:Delete}} (Fn i delete) ili upotrijebite gumb {{ui:Izbriši}}.
:::

## Dalje

- [Projektirajte vertikalni profil](topic:profile).

## Projektna brzina i razred

Pod svojstvima osi trase **Projektna brzina** (km/h ili mph) i **Projektni razred** čuvaju se uz os trase, spremaju se u projekt i zapisuju u IFC (Pset_RoadDesignCriteriaCommon). CivilCraft nema tablicu koja veže brzinu uz minimalni radijus, pa se ništa ne provjerava prema njima: postavite **Minimalni radijus** prema vlastitom projektnom standardu.

## Spirale

Krivina može imati klotoidnu spiralu na bilo kojem kraju: tangenta, spirala, krivina, spirala, tangenta. U tablici PI-jeva upišite duljinu u **Ulazna spirala** i **Izlazna spirala** za PI koji ima radijus. PI ostaje gdje je; krivina se pomakne unutra da napravi mjesto, pa se udaljenost tangente povećava za pomak spirale. Dvije duljine mogu biti različite, a PI s samo jednom duljinom dobiva spiralu samo na tom kraju.

Popis krivina tada prikazuje TS, SC, CS i ST (tangenta na spiralu, spirala na krivinu, krivina na spiralu, spirala na tangentu) s kutom spirale θs, udaljenostima tangente i vanjskom udaljenošću. Stacionaže teku duž spirala kao i inače. Spirale koje zajedno skreću više nego krivina odbijaju se uz navođenje PI-ja; spirala dulja nego što tangenta dopušta je preklapanje, kao i za svaku krivinu. Nadvišenje koristi spiralu kao izlaznu dionicu (vidi [Koridor](topic:corridor)).
