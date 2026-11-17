---
title: Modifikatori terena i kote uživo
summary: Sve što oblikuje projektirani teren u jednom poredanom popisu (kasniji pobjeđuje tamo gdje se preklapa), iskop i nasip po modifikatoru, provjere spojeva na ploči Problemi, te kote i strelice nagiba koje čitaju teren uživo.
keywords: modifikatori terena, slijed, redoslijed, projektirani teren, postojeći teren, preklapanje, iskop i nasip, spoj, potporni zid, rub popločenja, kota podloge, podest stube, kota točke, visinska kota, strelica nagiba, oznaka nagiba, padovi
from: 3998a5b0
---

Projektirani teren = postojeći teren + modifikatori, redom. Postojeći teren se nikad ne mijenja.

## Popis

{{ui:Kote}} › {{ui:Modifikatori terena…}} navodi svaki objekt koji oblikuje teren: platoe, {{ui:Nasipić (berma)}}, {{ui:Zaravnjeni jarak (swale)}}, područja planiranja, popločenja i staze, zasađene površine s konačnom kotom te stube i rampe kojima je označen okvir **Oblikuje teren** (s donjom i gornjom kotom). Gdje se dva preklapaju, **kasniji** pobjeđuje. Povucite redak ili upotrijebite strelice da promijenite redoslijed; teren se odmah ponovno izračuna. Svaki redak pokazuje svoj iskop i nasip (što oblikuje nakon onih iznad njega), a ukupno je ispod popisa.

## Provjere spojeva

Ploča Problemi navodi, s **idi na**:

- zid čija je visoka strana iznad njegova vrha (tlo preko zida) ili čija niska strana prikazuje njegov temelj;
- zasađenu površinu čija je konačna kota iznad ruba popločenja s kojim se spaja ili više od tipičnih 150 mm ispod njega;
- stube čiji donji ili gornji dio ne dodiruje popločenje na kojem slijeću;
- dva modifikatora koja se preklapaju (kasniji pobjeđuje tamo).

Potporni zid može imati vrh koji prati visoku stranu terena: njegova se visina ponovno izračuna kad god se teren promijeni.

## Potporni zid koji oblikuje teren

Odaberite potporni zid i označite **Oblikuje teren**. Traka ispod zida (široka koliko je zid debeo) ulazi u popis kao modifikator:

- rub na **visokoj strani** zadržava se na terenu tamo, stanica po stanica, pa vrh zida prati visoku stranu (s kapnom pločom na vrhu). Upišite kotu **Vrh** i visoka strana drži se na toj koti umanjenoj za kapnu ploču;
- rub na **niskoj strani** zadržava se na koti **Teren zadržan na niskoj strani** koju upišete, ili, ako je prazno, na terenu tamo;
- visoka strana je strana čiji je teren viši duž cijelog zida, pa se nikad ne zamijeni duž zida;
- teren iza trake se ne mijenja, a postojeći teren nikad.

Kao i svaki modifikator, zid je na popisu, a modifikator naveden nakon njega pobjeđuje tamo gdje se preklapaju. Zid čija zadržana kota na kraju odstupa više od tipičnih 150 mm od postojećeg terena ondje dobiva upozorenje na ploči Problemi (s **idi na**). Samostojeći zid ne oblikuje teren. Okvir je isključen u datotekama iz ranijih verzija, pa se one otvaraju kako su bile.

## Kote i strelice nagiba

{{ui:Kota točke}} (jedan klik) i {{ui:Strelica nagiba}} (dva klika) čitaju teren svaki put kad se nacrtaju: pomaknete li objekt ili mu ponovno postavite kotu, oznake slijede. U {{ui:Svojstva}} odaberite čita li oznaka projektirani ili postojeći teren; oznake postojećeg terena prikazuju se u zagradama. Strelice pokazuju nizbrdo i ispisuju `1:20 (5.0 %)`.
