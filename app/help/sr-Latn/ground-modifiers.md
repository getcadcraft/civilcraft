---
title: Modifikatori terena i dinamičke kote
summary: Sve što oblikuje projektovani teren u jednoj uređenoj listi (kasniji važi tamo gde se preklapaju), iskop i nasip po modifikatoru, provere spojeva u panelu Problemi, i tačkaste kote i strelice nagiba koje čitaju teren uživo.
keywords: modifikatori terena, slog, redosled, projektovani teren, postojeći teren, preklapanje, iskop i nasip, spoj, potporni zid, ivica popločanja, kota nivoa dna, odmorište stepenica, kota tačke, tačkasta visina, strelica nagiba, oznaka nagiba, padovi
from: 3998a5b0
---

Projektovani teren = postojeći teren + modifikatori, po redosledu. Postojeći teren se nikad ne menja.

## Lista

{{ui:Kote}} › {{ui:Modifikatori terena…}} prikazuje svaki objekat koji oblikuje teren: platforme, nasipe, odvodne jarke, površine za nivelaciju, popločanja i staze, zasađene površine sa završnom kotom, kao i stepenice i rampe kod kojih je označeno polje **Oblikuje teren** (sa njihovim donjim i gornjim kotama). Kad se dva preklapaju, **kasniji** pobeđuje. Prevuci red ili koristi strelice da promeniš redosled; teren se odmah ponovo gradi. Svaki red prikazuje svoj iskop i nasip (šta oblikuje posle onih iznad njega), a ukupno je ispod liste.

## Provere spojeva

Panel Problemi navodi, uz **idi na**:

- zid čija je visoka strana iznad njegovog vrha (zemlja preko zida) ili čija niska strana prikazuje njegov temelj;
- zasađenu površinu čija je završna kota iznad ivice popločanja na koju se oslanja, ili više od tipičnih 150 mm ispod nje;
- stepenice čije dno ili vrh ne dodiruju popločanje na koje sleću;
- dva modifikatora koja se preklapaju (kasniji tu pobeđuje).

Potporni zid može da ima vrh koji prati visoku stranu terena: njegova visina se ponovo izračunava kad god se teren promeni.

## Potporni zid koji oblikuje teren

Izaberi potporni zid i označi **Oblikuje teren**. Traka ispod zida (široka koliko je zid debeo) pridružuje se listi kao modifikator:

- ivica na **visokoj strani** drži se na terenu tamo, stanica po stanica, tako da vrh zida prati visoku stranu (sa završnom kapom na vrhu). Upiši **Vrh** i visoka strana se drži na toj koti umanjenoj za završnu kapu;
- ivica na **niskoj strani** drži se na koti **Teren držan na niskoj strani** koju upišeš, ili, ako je prazno, na terenu tamo;
- visoka strana je ona čiji je teren viši duž celog zida, pa se ne menja duž zida;
- teren iza trake se ne menja, a postojeći teren nikad.

Kao svaki modifikator, zid stoji u listi, a modifikator naveden posle njega pobeđuje tamo gde se preklapaju. Zid čija je držana kota na kraju više od tipičnih 150 mm od postojećeg terena dobija upozorenje u panelu Problemi (uz **idi na**). Slobodno stojeći zid ne oblikuje teren. Polje je isključeno u datotekama iz ranijih verzija, pa se one otvaraju onako kako su bile.

## Tačkaste kote i strelice nagiba

{{ui:Kota tačke}} (jedan klik) i {{ui:Strelica nagiba}} (dva klika) čitaju teren svaki put kad se crtaju: pomeriš li ili ponovo nivelišeš objekat, oznake prate. U Svojstvima izaberi da li oznaka čita projektovani ili postojeći teren; oznake postojećeg terena prikazuju se u zagradama. Strelice pokazuju nizbrdo i pišu `1:20 (5.0 %)`.
