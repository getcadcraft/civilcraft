---
title: Përzgjidh, kopjo dhe ngjit pikat e rilevimit
summary: Përzgjidh pikat e rilevimit me klikim, me Shift dhe një kuti, ose të gjitha njëherësh; kopjo, prit, ngjit, ngjit në vend, dublo dhe fshi ato me numra të rinj pikash që nuk përplasen kurrë; ngjit rreshtat e pikave nga dhe te një fletëllogaritëse.
keywords: kopjo, ngjit, prit, dublo, fshi pikat, përzgjidh pikat, përzgjidh të gjitha, përzgjedhje me kuti, dritare, vendlënie, fletëllogaritëse, csv, rinumëro, numrat e pikave, ngjit në vend, klonim, piketim
from: 78a6aea7
---

Pikat e rilevimit mund të kopjohen dhe ngjiten brenda një projekti, midis projekteve në dy skeda shfletuesi, dhe nga dhe te një fletëllogaritëse. Çdo ndryshim është një hap zhbërjeje, dhe sipërfaqja rindërtohet menjëherë nga pikat e reja.

## Përzgjidh pikat

Me {{ui:Përzgjidh}} ({{key:V}}):

- **Kliko** një pikë për ta përzgjedhur (dhe vetëm atë). Numrat e saj shfaqen nën **Vetitë**.
- {{key:Shift}} dhe **klikim** shton një pikë në përzgjedhje, ose e heq prej saj.
- {{key:Shift}} dhe **tërheqje** vizaton një kuti: pikat brenda saj shtohen në përzgjedhje. Nëse tërhiqni rreth pikave në vend të kësaj, bëhet një laso; shih [Përzgjedhja me laso e pikave të rilevimit](topic:lasso-selection). Një tërheqje pa {{key:Shift}} lëviz pamjen, si gjithmonë.
- {{key:Mod+A}} (ose {{ui:Më shumë}} › {{ui:Përzgjidh të gjitha pikat}}) përzgjedh çdo pikë.
- {{key:Esc}} (ose {{ui:Më shumë}} › {{ui:Mos përzgjidh asnjë}}) pastron përzgjedhjen.

Pikat e përzgjedhura kanë një unazë. Me më shumë se një të përzgjedhur, **Vetitë** tregon sa janë, numrat e tyre, gamën e kotës dhe grupet e tyre.

## Kopjo, prit dhe fshi

- {{ui:Kopjo}} ose {{key:Mod+C}} kopjon pikat e përzgjedhura. CivilCraft e mban kopjen, dhe e vendos gjithashtu në kujtesën e sistemit si rreshta pikash, që ta ngjitni menjëherë në një fletëllogaritëse ose skedar teksti.
- {{ui:Më shumë}} › {{ui:Prit}} ose {{key:Mod+X}} i kopjon dhe i fshin, në një hap.
- {{ui:Më shumë}} › {{ui:Fshi}} ose {{key:Delete}} i fshin. {{key:Mod+Z}} i sjell përsëri.

Rreshtat janë: pikë, veri, lindje, kotë, përshkrim (P,N,E,Z,D), të ndarë me presje, me tre shifra dhjetore. Për të pasur lindjen para veriut, vendos **Rreshtat e pikave** te [Cilësimet e CivilCraft](topic:settings). Një përshkrim që një fletëllogaritëse do ta trajtonte si formulë (që fillon me =, +, - ose @) merr një apostrof përpara, që të mbetet tekst.

## Ngjit

1. Shtyp {{key:Mod+V}} ose kliko {{ui:Ngjit}}. Pikat ndjekin treguesin si kryqe të vogla, me një vijë me pika që kthehet atje ku ishin.
2. Kliko aty ku duhet të shkojnë. Mesi i pikave të kopjuara bie mbi klikimin.
3. Ose shtyp {{key:Enter}} për t'i vendosur te koordinatat e tyre, ose {{key:Esc}} për të anuluar.

{{ui:Më shumë}} › {{ui:Ngjit në vend}} ose {{key:Mod+Shift+V}} ngjit në koordinatat e vetë pikave menjëherë. Pikat e ngjitura përzgjidhen pas kësaj, që t'i kopjoni, zhvendosni ose fshini përsëri.

:::note
Klikimi mbi {{ui:Ngjit}} në shiritin e veglave e lexon kujtesën e sistemit. Herën e parë, shfletuesi mund të pyesë nëse CivilCraft-it i lejohet të shohë kujtesën. Nëse e refuzoni, butoni i shiritit ngjit vetëm kopjen e vet të CivilCraft-it; {{key:Mod+V}} ngjit ende rreshta nga një fletëllogaritëse pa pyetur.
:::

## Numrat e pikave nuk përplasen kurrë

Dy pika nuk ndajnë kurrë një numër. Kur ngjitni:

- Një pikë e ngjitur e mban numrin e saj kur asnjë pikë në projekt nuk e ka. Kështu, pas **Prit**, pikat ngjiten përsëri me numrat e tyre, dhe pikat e kopjuara nga një projekt tjetër i mbajnë ato aty ku janë të lira.
- Një pikë e ngjitur me numër të zënë merr një numër të ri të plotë: një më shumë se numri më i lartë në përdorim, duke numëruar përpara.
- Shiriti i statusit thotë çfarë ndodhi, për shembull "1 e mbajti numrin e vet; 9 morën numra të rinj: 10–18 u bënë 277–285".

Te [Cilësimet e CivilCraft](topic:settings) mund të zgjidhni **Gjithmonë numra të rinj**, dhe një numër ku fillojnë numrat e rinj, për shembull 5000 për pikat e projektimit.

:::warning
Grupet e pikave që ndërtojnë sipërfaqen si **vijë të thyerjes** bashkojnë pikat e tyre sipas renditjes së numrave. Kopjet e ngjitura të pikave të vijës së thyerjes (për shembull matje FL) marrin numra të rinj, më të lartë, dhe lidhen në fund të asaj vije të thyerjes, ndoshta me një kërcim të gjatë. Kontrolloni planin pas ngjitjes së pikave të tilla, ose vendosni grupin e tyre në {{ui:Pikat}}.
:::

## Dublo

{{ui:Më shumë}} › {{ui:Dublo}} ose {{key:Mod+D}} bën një kopje të pikave të përzgjedhura që ndjek treguesin: kliko aty ku shkon. Kopjet marrin gjithmonë numra të rinj, dhe shiriti i CivilCraft-it mbetet siç ishte.

## Nga një fletëllogaritëse ose skedar teksti

Përzgjidhni rreshta pikash në një fletëllogaritëse (pikë, veri, lindje, kotë, përshkrim) dhe kopjojini. Në CivilCraft shtypni {{key:Mod+V}} dhe kliko aty ku duhet të shkojnë, ose shtypni {{key:Mod+Shift+V}} për t'i vendosur te koordinatat e tyre, që zakonisht është ajo që dëshironi për të dhëna reale rilevimi.

Rreshtat lexohen saktësisht si një [skedar pikash](topic:point-file-formats): presje, tab ose hapësira, një rresht titulli nëse ka një. Pa rresht titulli, renditja e kolonave vjen nga **Rreshtat e pikave** te [Cilësimet e CivilCraft](topic:settings).

Kur janë të dyja të pranishme, CivilCraft vendos sipas asaj që është më e re: rreshtat në kujtesën e sistemit që ndryshojnë nga kopja e fundit e CivilCraft-it u kopjuan më vonë, prandaj ngjiten. Teksti që nuk mban pika injorohet, dhe ngjitet kopja e vet e CivilCraft-it.

## Midis projekteve dhe skedave

Kopja mbahet në këtë shfletues, kështu që një skedë e dytë e CivilCraft-it mund ta ngjitë, edhe pasi të mbyllet skeda e parë. Pikat e kopjuara në një projekt në metra dhe të ngjitura në një projekt në këmbë mbajnë numrat e tyre siç janë: asgjë nuk konvertohet, dhe shiriti i statusit e thotë këtë.

## Çfarë nuk kopjohet

Për tani kopjohen vetëm pikat e rilevimit. Aksët rrugorë, platformat, rrjetet e tubave, vijat e thyerjes dhe kufijtë nuk mund të kopjohen ose ngjiten ende. Ngjitja nuk mund të zhvendosë pikat ekzistuese: përdorni {{ui:Prit}} dhe ngjit, ose zhvendosni një pikë në një kohë ([Redakto një pikë rilevimi](topic:edit-points)).
