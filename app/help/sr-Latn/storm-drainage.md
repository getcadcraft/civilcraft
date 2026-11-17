---
title: Izračunaj protoke oborinskih voda, dimenzije cevi i hidrauličku liniju gradijenta
summary: Nacrtaj slivove koji otiču u svaki objekat, saberi protoke niz mrežu racionalnom metodom, odredi dimenzije cevi po Manningovoj jednačini i vidi gde hidraulička linija gradijenta teče punim presekom ili dopire do površine.
keywords: oborinska kanalizacija, sliv, površina sliva, racionalna metoda, koeficijent oticaja, vreme koncentracije, intenzitet padavina, idf, manning, dimenzionisanje cevi, hidraulička linija gradijenta, hgl, linija energije, egl, preopterećenje, poplava, nizvodni nivo
from: e44872ec
---

Oborinska kanalizacija radi na [mreži cevi](topic:pipe-network): prvo nacrtajte mrežu, pa površine koje u nju otiču. Sve se pojavljuje pod **Oborinska kanalizacija** u desnom panelu kada ništa nije izabrano.

## Nacrtaj sliv

1. Kliknite **Nacrtaj sliv** pod **Oborinska kanalizacija**.
2. Kliknite tačke ivica područja koje otiče u jedan objekat. {{key:Enter}} ili dvoklik završava; {{key:Backspace}} vraća poslednju tačku, {{key:Esc}} prekida.
3. Sliv otiče u objekat unutar njega, inače u najbliži. Otvaraju se njegova **Svojstva**: podesite ime, **Koeficijent oticaja C** (udeo kiše koji otiče, od 0 do 1), **Vreme koncentracije** u minutima i koji objekat **Odvodi u**.

**Nacrtaj još jedan sliv** u njegovim Svojstvima pokreće sledeći. Kliknite unutar sliva na planu da ga izaberete; {{key:Delete}} ga uklanja. Svaka promena je jedan korak: {{key:Mod+Z}} je opoziva.

## Podesi merodavnu kišu

Intenzitet padavina je i = a ÷ (tc + b) na stepen c, u in/h za projekat u ft i u mm/h za projekat u m. Prilagodite **Intenzitet a**, **b** i **c** svojoj krivoj intenzitet-trajanje-učestalost za povratni period za koji projektujete.

:::warning
Početna kriva intenziteta, Manning n (0.013) i gubitak na spoju (0.5) su privremene vrednosti, a ne standard. Podesite ih prema sopstvenim podacima o padavinama i projektnim kriterijumima.
:::

- **Najkraće vreme koncentracije**: nijedna cev se ne računa na kraćem vremenu (na početku 10 minuta).
- **Manning n**: hrapavost cevi.
- **Gubitak na spoju**: visina izgubljena u svakom objektu, kao udeo brzinske visine V²/2g cevi koja iz njega izlazi.
- **Nivo vode na izlazu**: nizvodni nivo, gde se prazni poslednja cev. Ostavite prazno kada izlaz radi slobodno.

## Kako se protoci sabiraju

Svaka cev nosi svaki sliv iznad nje. Q = C × i × A, gde se C × A sabira niz mrežu, a i je intenzitet na najdužem vremenu koncentracije vode koja stiže: sopstveno vreme sliva, ili vreme od uzvodnog sliva plus vreme proticanja kroz cevi (dužina ÷ brzina pri punom preseku). Q je u ft³/s (A u acre) ili m³/s (A u ha).

## Dimenzioniši cevi

Tabela pod **Protoci i linije gradijenta** prikazuje za svaku cev protok, koliko ona nosi pri punom preseku na svom padu, brzinu, hidrauličku liniju gradijenta na vrhu i dnu, i kolika je dubina vode.

**Dimenzioniši cevi za ove protoke** daje svakoj cevi najmanju standardnu dimenziju koja nosi njen protok na svom padu (12 do 72 in, ili 300 do 1800 mm). To je jedan korak. Dna ostaju gde jesu: ako se dimenzije promene, upotrebite **Postavi sva dna prema pravilima** da zadržite pokrivenost, pa ponovo proverite tabelu.

## Čitanje linija gradijenta

Hidraulička linija gradijenta (HGL) računa se od izlaza uzvodno:

- Cev koja teče delimično puna ima HGL na površini vode: dno plus normalna dubina.
- Kada je voda ispod nje viša od njenog temena, ili nosi više nego što može pri punom preseku, ona teče puna, pod pritiskom, i njen HGL raste za pad trenja duž svoje dužine.
- Na svakom objektu HGL je gornji HGL izlazne cevi plus gubitak na spoju.
- Linija energije (EGL) je HGL plus brzinska visina.

Cev koja teče puna se navodi, i navodi se svaki objekat na kome je HGL iznad ivice poklopca: voda tamo dopire do površine, a objekat je na planu obeležen crvenim krugom. Izaberite cev ili objekat da vidite njen protok, dubinu, brzinu i obe linije gradijenta u njenim Svojstvima.

## Simuliraj oluju

Racionalna metoda daje jedan vrh za svaku cev. {{ui:Route the storm}} (ispod rezultata, u Svojstvima mreže) računa celu oluju: oticaj svakog sliva kroz vreme, prenet niz cevi uz njihovo vreme proticanja i akumulaciju, i sabran tamo gde se sastaju.

1. Ostavite {{ui:Rain lasts}} i {{ui:Rain intensity}} prazne da biste koristili najduže vreme koncentracije i krivu padavina iznad, ili upišite svoje.
2. Pritisnite {{ui:Route the storm}}. Tabela navodi za svaku cev najveći protok ulaza i izlaza, za koliko je izlazni vrh niži, koliko od punog kapaciteta cevi koristi i minut u kome dostiže vrh.
3. Svaki izlaz dobija mali grafikon protoka kroz vreme i {{ui:Download the hydrograph (CSV)}}.

Sliv šalje dalje kišu usrednjenu na svoje vreme koncentracije, pa kraća oluja od toga dostiže niži vrh od C × i × A. Svaka cev se simulira Muskingum–Cunge metodom, koristeći dubinu toka koju je racionalna metoda već našla. Dve grane sa različitim vremenima koncentracije ne dostižu vrh zajedno, pa je njihov zbir niži od zbira njihovih vrhova.

Ovo ne modelira preopterećenje, povratnu vodu, akumulaciju u objektima ni poplavu. Cev čiji simulirani vrh premašuje njen puni kapacitet se navodi, a njena voda se prosleđuje kao da stane. Koristite ga da vidite vreme i prigušenje, a ne da dimenzionišete cev. To je pomoćno sredstvo za proračun; inženjer ga proverava.

## Sačuvano uz projekat

Slivovi i podešavanja oluje čuvaju se u datoteci projekta. Još nisu u PDF izlazu za plan, DWG ili DXF, ili LandXML: videti [Još nije izgrađeno](topic:not-built-yet).
