---
title: Shfletuesit dhe kompjuterat
summary: Në cilët shfletues funksionojnë aplikacionet, çfarë ndryshon mes tyre, dhe çfarë i duhet kompjuterit tënd.
keywords: chrome, edge, firefox, safari, brave, shfletues, mac, windows, linux, ipad, tablet, webgl, kërkesa, memorie
from: a11b09b1
---

Aplikacionet funksionojnë brenda një shfletuesi uebi. Ato e bëjnë punën në kompjuterin tënd: skedarët e tu hapen aty dhe nuk dërgohen kurrë tek ne (shih [Ku shkojnë skedarët e tu](common:your-files)).

## Cili shfletues

Përdor një version të përditësuar të njërit prej këtyre:

| Shfletuesi | Motori | Shënime |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Më i plotë: zgjedhja e dosjeve, ruajtja për përdorim jashtë linje, trajtimi i skedarëve. |
| Firefox | Gecko | Funksionon. Hapja e një dosjeje të tërë përdor një zgjedhës më të thjeshtë. Ruajtja jashtë linje mund të mos funksionojë në dritaret private. |
| Safari | WebKit | Funksionon në Mac dhe iPad. Hapja e një dosjeje të tërë përdor një zgjedhës më të thjeshtë. Safari mund të fshijë një kopje jashtë linje që nuk e ke përdorur për disa javë. |

Të tre motorët janë të mirë për punën e përditshme. Kur një aplikacion bën diçka ndryshe në një prej tyre, ndihma e tij tregon hapat për shfletuesin tënd.

## Çfarë ndryshon mes shfletuesve

- **Hapja e një dosjeje.** Shfletuesit Chromium shfaqin një zgjedhës të vërtetë dosjesh dhe mund ta lexojnë dosjen drejtpërdrejt. Firefox dhe Safari të kërkojnë të zgjedhësh një dosje dhe pastaj lexojnë çdo skedar në të, gjë që zgjat më shumë për dosje të mëdha projektesh; tërheqja e dosjes mbi aplikacion funksionon në të tre.
- **Ruajtja.** Aplikacionet ruajnë duke shkarkuar një skedar. Shfletuesi yt vendos ku shkojnë shkarkimet dhe nëse pyet më parë.

:::chromium
Në Chrome ose Edge, ndiz "Pyet ku të ruhet çdo skedar përpara shkarkimit" (te Cilësimet, nën Shkarkimet) për të zgjedhur një dosje çdo herë.
:::

:::firefox
Në Firefox, hap Cilësimet, pastaj Të përgjithshme, pastaj Shkarkimet, dhe zgjidh "Pyet gjithmonë ku të ruhen skedarët" për të zgjedhur një dosje çdo herë.
:::

:::safari
Në Safari, hap Cilësimet, pastaj Të përgjithshme, dhe vendos "Vendndodhja e shkarkimit të skedarëve" në "Pyet për çdo shkarkim" për të zgjedhur një dosje çdo herë.
:::

## Mac, Windows dhe Linux

Aplikacionet janë të njëjta në çdo kompjuter. Ndryshon tastiera: shkurtoret shkruhen automatikisht për kompjuterin tënd. Shih [Tastet, mausi dhe trackpad-i](common:keys).

## Tabletë dhe ekrane me prekje

Disa aplikacione pranojnë prekjen (një gisht vizaton ose përzgjedh, dy gishta zmadhojnë me pinch dhe lëvizin). Ndihma e çdo aplikacioni thotë nëse e bën. Në iPad, përdor Safari ose Chrome. Një tastierë ndihmon me aplikacionet që përdorin komanda të shkruara.

## Shfletuesi dhe sistemi më i vjetër

Këto i lexuam nga kodi i aplikacioneve 0.7, jo nga një supozim: çdo skedar u analizua dhe çdo veçori gjuhe që përdor u kontrollua me të dhënat publike të përputhshmërisë së shfletuesve. Nën këto versione aplikacionet nuk mund as të nisen, sepse shfletuesi nuk e kupton kodin.

| | Versioni më i vjetër që mund t'i nisë aplikacionet |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS dhe iOS 16.4) |

CadCraft Studio ka motorin e vet të uebit në Windows, kështu që kërkon Windows 10 ose 11; në Mac përdor atë të sistemit, kështu që kërkon macOS 13.3 ose më të ri. Cilësimet › Përditësimet në Studio tregon mbi çfarë funksionon kopja jote.

Ky është versioni më i vjetër që *nis*, i lexuar nga kodi. Nuk është një listë shfletuesish të vjetër me të cilët i kemi provuar aplikacionet, kështu që një version më i vjetër që nis mund të mos ketë ndonjë veçori.

## Çfarë i duhet kompjuterit tënd

Këto janë minimume të planifikuara për aplikacionet, jo kërkesa të matura:

- 8 GB memorie (rekomandohen 16 GB për modele të mëdha të federuara).
- Një çip grafik me WebGL 2 për aplikacionet 3D. Nëse një pamje 3D mbetet bosh, kontrollo që përshpejtimi me harduer të jetë i ndezur te cilësimet e shfletuesit.
- Një ekran të paktën 1280 piksel të gjerë për shiritat e plotë të veglave; ekranet më të vegjël i mbështjellin.

Skedarët shumë të mëdhenj (grupe të mëdha planesh, modele të mëdha) përdorin shumë memorie në një skedë shfletuesi. Mbyll skedat e tjera të rënda nëse një aplikacion ngadalësohet.
