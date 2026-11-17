---
title: Izračunajte oborinske protoke, dimenzije cijevi i hidrauličku liniju
summary: Nacrtajte slivna područja koja otječu u svaku građevinu, zbrojite protoke niz mrežu racionalnom metodom, odredite dimenzije cijevi prema Manningovoj jednadžbi i pogledajte gdje hidraulička linija teče puna ili doseže površinu.
keywords: oborinska odvodnja, slivno područje, područje odvodnje, racionalna metoda, koeficijent otjecanja, vrijeme koncentracije, intenzitet oborina, idf, manning, dimenzioniranje cijevi, hidraulička linija, hgl, energetska linija, egl, tlak, poplava, povratna voda
from: e44872ec
---

Oborinska odvodnja radi na [mreži cijevi](topic:pipe-network): prvo nacrtajte mrežu, zatim površine koje u nju otječu. Sve se prikazuje pod **Oborinska odvodnja** u desnoj ploči kada ništa nije odabrano.

## Nacrtajte slivno područje

1. Kliknite **Nacrtaj slivno područje** pod **Oborinska odvodnja**.
2. Kliknite kutove područja koje otječe u jednu građevinu. {{key:Enter}} ili dvostruki klik završava; {{key:Backspace}} vraća zadnji kut, {{key:Esc}} zaustavlja.
3. Slivno područje otječe u građevinu unutar njega, inače u najbližu. Otvore se njegova **Svojstva**: postavite naziv, **koeficijent otjecanja C** (udio kiše koji otječe, 0 do 1), **vrijeme koncentracije** u minutama i u koju građevinu **Otječe u**.

**Nacrtaj još jedno slivno područje** u njegovim Svojstvima pokreće sljedeće. Kliknite unutar slivnog područja na tlocrtu da ga odaberete; {{key:Delete}} ga uklanja. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Postavite projektnu oborinu

Intenzitet oborina je i = a ÷ (tc + b) na potenciju c, u in/h za projekt u ft, a u mm/h za projekt u m. Prilagodite **Intenzitet a**, **b** i **c** vlastitoj krivulji intenzitet–trajanje–učestalost za povratni period za koji projektirate.

:::warning
Početna krivulja intenziteta, Manningov n (0.013) i gubitak na spoju (0.5) su privremene vrijednosti, a ne standard. Postavite ih prema vlastitim podacima o oborinama i projektnim kriterijima.
:::

- **Najkraće vrijeme koncentracije**: nijedna cijev se ne računa za kraće vrijeme (na početku 10 minuta).
- **Manningov n**: hrapavost cijevi.
- **Gubitak na spoju**: visinski gubitak u svakoj građevini, kao udio brzinske visine V²/2g cijevi koja iz nje izlazi.
- **Razina vode na ispustu**: donja voda, mjesto gdje posljednja cijev ulijeva. Ostavite prazno kada ispust radi slobodno.

## Kako se protoci zbrajaju

Svaka cijev nosi sva slivna područja iznad sebe. Q = C × i × A, gdje se C × A zbraja niz mrežu, a i je intenzitet za najdulje vrijeme koncentracije dolazne vode: vlastito vrijeme slivnog područja ili vrijeme od uzvodnog slivnog područja plus vrijeme protjecanja kroz cijevi (duljina ÷ brzina punog toka). Q je u ft³/s (A u acrima) ili u m³/s (A u hektarima).

## Odredite dimenzije cijevi

Tablica ispod **Protoci i hidrauličke linije** za svaku cijev prikazuje protok, koliko nosi punim tokom pri svom nagibu, brzinu, hidrauličku liniju na njezinu vrhu i dnu te koliko je duboko teče.

**Odredi dimenzije cijevi za ove protoke** svakoj cijevi dodjeljuje najmanju standardnu dimenziju koja nosi njezin protok pri vlastitom nagibu (12 do 72 in, odnosno 300 do 1800 mm). To je jedan korak. Dna cijevi ostaju gdje jesu: ako se dimenzije promijene, upotrijebite **Postavi svako dno cijevi prema pravilima** da zadržite nadsloj, a zatim ponovno provjerite tablicu.

## Čitanje hidrauličkih linija

Hidraulička linija (HGL) računa se od ispusta uzvodno:

- Cijev koja teče djelomično puna ima HGL na vodnoj površini: dno cijevi plus normalna dubina.
- Kada je voda ispod nje viša od njezina tjemena, ili kada nosi više nego što može puna, teče puna (pod tlakom), a njezin HGL raste za nagib trenja na svojoj duljini.
- U svakoj građevini HGL je HGL na vrhu izlazne cijevi plus gubitak na spoju.
- Energetska linija (EGL) je HGL plus brzinska visina.

Cijev koja teče puna se navodi, kao i svaka građevina čiji je HGL iznad ruba: voda tamo dopire do površine, a građevina je na tlocrtu označena crvenom bojom. Odaberite cijev ili građevinu da u njezinim Svojstvima vidite protok, dubinu, brzinu i obje linije.

## Usmjeri oluju

Racionalna metoda daje jedan vrh za svaku cijev. {{ui:Usmjeri oluju}} (ispod rezultata, u Svojstvima mreže) umjesto toga računa cijelu oluju: otjecanje svakog slivnog područja kroz vrijeme, prenosi se niz cijevi s njihovim vremenom protjecanja i akumulacijom te se zbraja tamo gdje se susreću.

1. Ostavite {{ui:Kiša traje}} i {{ui:Intenzitet kiše}} prazno da upotrijebite najdulje vrijeme koncentracije i krivulju oborina iznad, ili upišite vlastite vrijednosti.
2. Pritisnite {{ui:Usmjeri oluju}}. Tablica za svaku cijev navodi najveći ulazni i izlazni protok, koliko je izlazni vrh niži, koliki dio pune kapacitete cijevi koristi i minutu u kojoj doseže vrh.
3. Svaki ispust dobiva mali grafikon protoka kroz vrijeme i {{ui:Preuzmi hidrogram (CSV)}}.

Slivno područje ispušta oborinu uprosječenu kroz svoje vrijeme koncentracije, pa oluja kraća od toga doseže niži vrh od C × i × A. Svaka cijev usmjerava se Muskingum–Cunge metodom, koristeći dubinu protoka koju je racionalna metoda već pronašla. Dvije grane s različitim vremenom koncentracije ne doseže vrhove zajedno, pa je njihov zbroj niži od zbroja njihovih vrhova.

Ovo ne modelira tlak, povratnu vodu, akumulaciju u građevinama ni poplavu. Cijev čiji je usmjereni vrh iznad pune kapacitete navodi se, a njezina se voda propušta kao da stane. Koristite za uvid u vrijeme i prigušenje, a ne za određivanje dimenzija cijevi. To je pomoćno sredstvo za izračun: inženjer ga provjerava.

## Spremljeno s projektom

Slivna područja i postavke oluje spremaju se u datoteku projekta. Još nisu u PDF ispisu, DWG ili DXF, ni u LandXML-u: vidi [Još nije izrađeno](topic:not-built-yet).
