---
title: Mērvienības importējot: fails norāda savas mērvienības vai jūs tiek jautāts vispirms
summary: Kad zīmējums vai tīkls, ko ievedat projektā, norāda savas mērvienības, CivilCraft tās pārvērš un par to paziņo. Kad nenorāda, CivilCraft pirms nolasīšanas jautā un atceras jūsu atbildi šim failam.
keywords: mērvienības, importēt, DWG, DXF, STL, OBJ, uzmērījums, pēdas, ASV mērījumu pēdas, metri, milimetri, mērogs, nepareizs izmērs, pārāk liels, pārāk mazs, jautāt, atcerēties, INSUNITS, zīmējuma mērvienības
from: 60921963
---

## Ko jūs darīsiet

Ievedat failu projektā un pārliecinieties, ka tas ieplūst pareizajā izmērā.

## Soļi

1. Atveriet failu kā parasti: {{ui:Atvērt}}, velciet to uz plāna vai izmantojiet CAD zīmējuma komandu.
2. Ja fails norāda savas mērvienības, nekas netiek jautāts: importēšanas dialogā tās tiek rādītas kā **Kā norādīts zīmējumā**.
3. Ja nenorāda, dialogs jautā par faila **mērvienībām**, pirms atveras importēšanas dialogs. Izvēlieties, kas viena vienība failā ir, un noklikšķiniet uz {{ui:Izmantot šīs mērvienības}}.
4. {{ui:Atcelt}} (vai {{key:Esc}}) izlaiž failu. Nekas no tā netiek nolasīts projektā.

## Kuri faili norāda savas mērvienības

- **DWG un DXF**: zīmējuma ievietošanas mērvienības (`$INSUNITS`). Fails bez tām tiek jautāts. Importēšanas dialoga saraksts **Zīmējuma mērvienības** sākas ar jūsu atbildi un to joprojām var mainīt.
- **STL un OBJ** (ainavas brīvās formas): nekad nenorāda mērvienības. Jūs tiek jautāts.
- **Punktu saraksti** (CSV, TXT) un progresīvi uzmērījumu saraksti: saraksts, kas norāda savu mērvienību pirmajās rindās, tiek pārvērsts, un statusa rindā par to paziņo. Saraksts, kas nenorāda nevienu, tiek jautāts, kad nospiežat {{ui:Importēt}}, pirms punkti tiek ievietoti. Platuma un garuma kolonnas iet caur koordinātu sistēmu.
- **Punktu mākoņu papildinājums**: jautā, kad veidojat mākoni, kura fails nenorāda mērvienību, un apzīmē mākoņa skaitļus ar mērvienību, ko tas nes.
- **IFC un LandXML**: norāda savas; tās tiek pārvērstas projekta mērvienībās.
- **LAS, LAZ un augstuma rastri**: novietoti pēc savas koordinātu sistēmas; reljefa dialogs jautā augstuma mērvienību, kad fails to nenorāda.

## Labi zināt

- Atbilde šim failam tiek atcerēta šajā datorā, visās CadCraft lietotnēs. Nākamreiz, kad tas ienāk, jūs netiekat jautāts.
- Lai tiktu jautāts vēlreiz: komandu palete ({{key:Mod+K}}) › **Jautāt vēlreiz par importēto failu mērvienībām**.
- Mērvienība, ko saraksts norāda, tiek nolasīta no pirmajām astoņām rindām: rinda, piemēram, `units: ft`, vai kolonnu virsraksti, kuriem visiem ir viena mērvienība iekavās, piemēram, `Elevation (m)`.
