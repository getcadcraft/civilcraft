---
title: Iscrtavanje horizontalne trase
summary: Iscrtaj trasu preko njenih PI tačaka, postavi poluprečnike krivina i početnu stacionažu, pomjeri PI tačke, i pročitaj podatke o krivinama, stacionažu i odstupanje.
keywords: trasa, nema rješenja, krivina ne staje, najveći poluprečnik, najmanji poluprečnik, minimalni poluprečnik, projektna brzina, preklapanje, osa, pi, horizontalna krivina, poluprečnik, stacioniranje, tangenta, kreiraj trasu, raspored trase, pc, pt, stacionaža odstupanje
from: 8c5df4aa
---

Trasa u CivilCraftu je lanac tangenti kroz tačke presjeka (PI), sa kružnom krivinom na svakoj unutrašnjoj PI tački koja ima poluprečnik. Stacionira se od početne stacionaže koju izabereš. Projekat može imati mnogo trasa.

## Iscrtaj trasu

1. Pritisni {{key:A}} ili klikni {{ui:Trasa}} u grupi **Projektovanje**.
   Savjet kaže „Trasa: klikni PI tačke redom. Enter ili dvostruki klik završava, Backspace briše posljednju, Esc otkazuje.”
2. Klikni prvu PI tačku (početak trase).
3. Klikni svaku sljedeću PI tačku redom. Crvena linija prati pokazivač i prikazuje dužinu i azimut tangente koju crtaš, na primjer „212.40 ft  N 63°12'05" E”.
4. Klikni posljednju PI tačku (kraj trase).
5. Pritisni {{key:Enter}}.
   Trasa je iscrtana sa stacionažom i izabrana je. Statusna traka kaže, na primjer, „Trasa 1: 386.36 ft, krivine poluprečnika 100 ft gdje stanu. Uredi poluprečnike u Svojstvima; Profil (R) za projektovanje njenog nagiba.”

Dok crtaš: {{key:Backspace}} briše posljednju PI tačku, {{key:Esc}} otkazuje, a prevlačenje po praznom prostoru pomjera pogled bez dodavanja PI tačke.

:::warning
Završi sa {{key:Enter}}. Dvostruki klik takođe završava, ali u ovoj verziji odbacuje PI tačku na koju si dvaput kliknuo. Klikni posljednju PI tačku jednom, pa pritisni {{key:Enter}}.
:::

Svaka unutrašnja PI tačka dobija krivinu od 100 ft (30 m u projektu u metrima), ili najveći cijeli poluprečnik koji stane u polovinu svake tangente ako 100 ft ne stane. Vrlo oštre ili prave PI tačke ne dobijaju krivinu.

## Postavi poluprečnike i koordinate

Kad je trasa izabrana, desni panel prikazuje **Trasa**:

1. **Naziv** i **Početna stacionaža**. Upiši stacionažu kao `10+00` (stope) ili `0+500` (metri), ili kao običan broj. Vidi [Jedinice, stacionaže i formati brojeva](topic:units-and-stations).
2. **Dužina** i **Krajnja stacionaža** računaju se za tebe.
3. Tabela **PI** navodi **Istok** i **Sjever** svake PI tačke, i **Poluprečnik** za svaku unutrašnju PI tačku. Upiši novu vrijednost i pritisni {{key:Enter}}.
   - Poluprečnik 0 pravi tačku ugla bez krivine.
   - Prva i posljednja PI tačka nikad nemaju poluprečnik.
   - Mali x na kraju reda uklanja tu PI tačku (trasa zadržava najmanje dvije).
4. Pročitaj listu **Krivine**: za svaku krivinu, njene stacionaže PC i PT, poluprečnik R, skretanje Δ i smjer (lijevo ili desno), dužinu L, tangentu T, spoljnu udaljenost E i tetivu.
5. Linija ispod krivina daje azimut prve tangente.

## Kad krivina ne stane

Ako krivine trebaju više tangente nego što ima između njihovih PI tačaka, trasa nema rješenje: nije ispravno iscrtana dok je ne popraviš, i izostavlja se iz LandXML izvoza. Crveni okvir kaže zašto, brojevima, i nudi šta bi stalo:

- „Krivine na PI 2 i PI 3 trebaju 240.00 ft tangente između njih (130.00 + 110.00), a PI tačke su udaljene 180.00 ft.” — ili, kad samo jedna ima krivinu, „Krivina na PI 2 treba 240.00 ft tangente prema PI 1 …”.
- Dugme za svaku PI tačku postavlja **najveći poluprečnik koji stane** tamo, uz drugu krivinu kakva jeste (mora stati i u drugu tangentu te PI tačke). Kad obje PI tačke imaju krivine, **Oboje** smanjuje dva poluprečnika srazmjerno da se tek spoje.
- Kad je sama jedna krivina duža od tangente, okvir kaže da nijedna krivina na drugoj PI tački ne može stati dok je toliko velika.
- PI tačka koja se vraća pravo nazad ne može dobiti krivinu; okvir nudi **Bez krivine na PI n**.

Svako dugme je jedan korak: {{key:Mod+Z}} vraća poluprečnike. Ponuđeni poluprečnici zaokruženi su naniže na 0.01 da uvijek stanu.

### Projektni minimalni poluprečnik

Upiši **Projektni minimalni poluprečnik** (na primjer iz projektne brzine) da se svaka krivina provjeri prema njemu; ostavi prazno ako ga ne želiš. Krivina ispod njega navodi se sa dugmetom za **najmanji poluprečnik koji zadovoljava minimum**, kad taj poluprečnik stane. Kad ne stane, okvir to kaže i daje najveći poluprečnik koji tangente dozvoljavaju, pa znaš da treba pomjeriti PI tačku ili sniziti minimum.

## Pomjeri PI tačke na planu

1. Sa aktivnim {{ui:Odaberi}}, klikni trasu da je izabereš. Kvadratne ručke pojavljuju se na njenim PI tačkama.
2. Prevuci ručku. Trasa, njena stacionaža, profil i koridor prate.
3. Otpusti. Pomjeranje je jedan korak poništavanja.

Dodavanje PI tačke između dvije postojeće još nije dostupno: obriši trasu i ponovo je iscrtaj, ili upiši nove koordinate za PI tačke koje imaš.

## Pročitaj stacionažu i odstupanje

Pomjeri pokazivač preko plana. Statusna traka pokazuje najbližu trasu (ili izabranu) sa stacionažom i odstupanjem, **L** ili **R** gledajući u smjeru stacionaže, na primjer „Trasa 1: Sta 2+15.30, odstupanje 18.42 R”. Izvan bilo kog kraja dodaje „(iza kraja)”.

## Šta se crta

Na planu, u DXF-u i u PDF-u: osa (tangente kao linije, krivine kao prave lukove), oznaka svakih 50 ft (20 m) sa dužom oznakom i natpisom stacionaže svakih 100 jedinica, i oznake PC i PT sa njihovim stacionažama.

## Obriši trasu

Izaberi je i pritisni {{key:Delete}}, ili klikni {{ui:Izbriši}} na traci sa alatima ili na dnu desnog panela. Njen profil i koridor idu s njom. {{key:Mod+Z}} je vraća.

:::mac
Na Mac tastaturi, taster označen sa **delete** je {{key:Backspace}} za pregledač i ne briše izbor. Pritisni {{key:Delete}} (Fn i delete), ili koristi dugme {{ui:Izbriši}}.
:::

## Dalje

- [Projektuj vertikalni profil](topic:profile).
## Projektna brzina i klasa

Ispod Svojstava trase, **Projektna brzina** (km/h ili mph) i **Projektna klasa** čuvaju se uz trasu, snimaju se u projektu i upisuju u IFC (Pset_RoadDesignCriteriaCommon). CivilCraft nema tabelu koja vezuje brzinu za minimalni poluprečnik, pa se ništa ne provjerava na osnovu njih: postavi **Minimalni poluprečnik** prema tvom standardu projektovanja.

## Spirale

Krivina može imati klotoidnu spiralu na bilo kom kraju: tangenta, spirala, krivina, spirala, tangenta. U tabeli PI, upiši dužinu u **Spirala ulaz** i **Spirala izlaz** za PI tačku koja ima poluprečnik. PI tačka ostaje gdje jeste; krivina se pomjera unutra da napravi mjesta, pa se udaljenost tangente povećava za odstupanje spirale. Dvije dužine mogu se razlikovati, a PI tačka sa samo jednom dužinom dobija spiralu samo na tom kraju.

Lista krivina tada glasi TS, SC, CS i ST (tangenta do spirale, spirala do krivine, krivina do spirale, spirala do tangente) sa uglom spirale θs, udaljenostima tangente i spoljnom udaljenošću. Stacionaže teku duž spirala kao i svuda drugdje. Spirale koje zajedno skreću više nego krivina se odbijaju uz navođenje PI tačke; spirala duža nego što tangenta dozvoljava je preklapanje, kao i za svaku krivinu. Nagib u krivini koristi spiralu kao svoj izlaz (vidi [Koridor](topic:corridor)).
