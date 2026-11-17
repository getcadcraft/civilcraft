---
title: Modifikatori terena i nivoi uživo
summary: Sve što oblikuje projektovani teren u jednoj redoslijednoj listi (kasniji pobjeđuje tamo gdje se preklapa), iskop i nasip po modifikatoru, provjere spojeva u panelu Problemi, te tačkasti nivoi i strelice nagiba koji čitaju teren uživo.
keywords: modifikatori terena, slog, redoslijed, projektovani teren, postojeći teren, preklapanje, iskop i nasip, spoj, potporni zid, ivica popločanja, nivo dna, podest, tačkasti nivo, kota tačke, strelica nagiba, oznaka nagiba, padovi
from: 3998a5b0
---

Projektovani teren = postojeći teren + modifikatori, redom. Postojeći teren se nikada ne mijenja.

## Lista

{{ui:Nivoi}} › {{ui:Modifikatori terena…}} prikazuje svaki objekat koji oblikuje teren: platforme, nasipe, jarke za odvodnju, područja nivelacije, popločanja i staze, zasađene površine sa završenim nivoom, te stepenice i rampe kod kojih je polje **Oblikuje teren** označeno (sa njihovim donjim i gornjim nivoom). Gdje se dva preklapaju, **kasniji** pobjeđuje. Prevucite red ili upotrijebite strelice da promijenite redoslijed; teren se odmah ponovo izrađuje. Svaki red prikazuje svoj iskop i nasip (ono što oblikuje nakon onih iznad njega), a ukupno je ispod liste.

## Provjere spojeva

Panel Problemi prikazuje, uz **idi na**:

- zid čija je visoka strana iznad njegovog vrha (zemlja preko zida), ili čija niska strana prikazuje svoj temelj;
- zasađena površina čiji je završeni nivo iznad ivice popločanja na koju nailazi, ili više od uobičajenih 150 mm ispod nje;
- stepenice čiji donji ili gornji dio ne dodiruje popločanje na koje se spuštaju;
- dva modifikatora koji se preklapaju (kasniji tamo pobjeđuje).

Potporni zid može imati vrh koji prati visoku stranu terena: njegova visina se ponovo izračunava kad god se teren promijeni.

## Potporni zid koji oblikuje teren

Odaberite potporni zid i označite **Oblikuje teren**. Traka ispod zida (široka koliko je zid debeo) ulazi u listu kao modifikator:

- ivica na **visokoj strani** zadržava se na tlu tamo, stanica po stanica, tako da vrh zida prati visoku stranu (sa pokrovnom pločom na vrhu). Upišite nivo **Vrh** i umjesto toga će visoku stranu držati na tom nivou umanjenom za pokrovnu ploču;
- ivica na **niskoj strani** zadržava se na nivou **Teren držan na niskoj strani** koji upišete, ili, ako je prazno, na tlu tamo;
- visoka strana je ona čiji je teren viši duž cijelog zida, pa se nikada ne mijenja duž zida;
- teren izvan trake se ne mijenja, a postojeći teren se nikada ne mijenja.

Kao i svaki modifikator, stoji u listi, a modifikator naveden poslije njega pobjeđuje tamo gdje se preklapaju. Zid čiji zadržani nivo na kraju je više od uobičajenih 150 mm od postojećeg terena tamo dobija upozorenje u panelu Problemi (uz **idi na**). Samostojeći zid ne oblikuje teren. Polje je isključeno u datotekama iz ranijih verzija, pa se otvaraju onako kako su bile.

## Tačkasti nivoi i strelice nagiba

{{ui:Tačkasti nivo}} (jedan klik) i {{ui:Strelica nagiba}} (dva klika) čitaju teren svaki put kada se iscrtaju: pomjerite ili ponovo nivelišite objekat, a oznake slijede. U Svojstvima izaberite da li oznaka čita projektovani ili postojeći teren; oznake postojećeg terena prikazuju se u zagradama. Strelice pokazuju nizbrdo i navode `1:20 (5.0 %)`.
