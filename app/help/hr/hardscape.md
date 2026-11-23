---
title: Popločenje, zidovi i stepenice
summary: Popločenje s padom prema odvodu ili poprečnim nagibom, uzorak i slojevi; staze koje prate teren; potporni i slobodnostojeći zidovi sa stepenastim temeljima; rubnjaci; rampe i stepenice provjerene prema granicama; IFC izvoz.
keywords: popločenje, hardscape, pločice, popločavanje, terasa, nagibi, odvod, poprečni nagib, riblja kost, slog, staza, pješačka staza, potporni zid, vrtni zid, temelj, završna kapa, rubnjak, obrub, rampa, pristupačnost, stepenice, stube, visina stepenice, gazište, podest
from: d34b4466
---

Hardscape se svaki put ponovno izračunava iz terena, pa prati teren i obnavlja se kad se teren ili njegova linija pomakne. Povucite njegove kutove na tlocrtu kao i bilo koju liniju. Otvorite ga iz {{ui:Popločenje i građevinski uređeni elementi}} u grupi Krajobraz.

## Popločenje

Kliknite kutove i pritisnite {{key:Enter}}. U Svojstvima:

- **Razina**: prazno = srednja razina terena ispod.
- **Nagibi**: ravno, **poprečni nagib** (postotak u nekom smjeru) ili **prema odvodu**: CivilCraft traži da kliknete gdje ide odvod, zatim se svaki kut diže od odvoda prema nagibu. Strelice na tlocrtu pokazuju nagibe.
- **Uzorak** (mreža, slog, riblja kost) s veličinom jedinice, fugom i kutom; **Obrub** širine. Na listu se fuge manje od milimetra izostavljaju.
- Popločenje je dio projektirane površine. Njegovi slojevi (ploče, posteljica, podloga) ulaze u IFC i količine.

## Staze

Kliknite duž staze i pritisnite {{key:Enter}}. Ona prati teren, s **poprečnim nagibom** na desnu stranu. Staza strmija od **Najstrmiji dopušteni** označava se s `!` na tlocrtu tamo gdje je, a Svojstva kažu koliko strmo postaje.

Gdje staza dodiruje cestu izgrađenu koridorom, staje na vanjskom rubu ceste, na razini nogostupa ili bankine tamo, u projektiranoj površini i u 3D prikazu. Staza koja presijeca cestu obrađuje se i prikazuje kao dva dijela, a kraj nacrtan do dvostruke širine staze od ceste produžuje se do njezina ruba. Tlocrt i dalje prikazuje stazu kako ste je nacrtali, a njezina duljina i površina računaju cijelu liniju. Vidi [Provlačenje koridora ceste](topic:corridor).

## Zidovi

Kliknite duž zida i pritisnite {{key:Enter}}. Zid je **potporni** ili **slobodnostojeći**. Bez **Vrha** stoji **Visinu** iznad terena cijelom dužinom; upišite vrh da bi ga držao u razini. Njegov **temelj** leži zadanu dubinu ispod terena i stepenasto se spušta u cijelim koracima, pa između njih ostaje u razini. Svojstva daju duljinu zida, visine, površinu lica i korake temelja; tlocrt označava vrh i dno zida (TW / BW) na svakom kraju.

:::warning
Potporni zid viši od 1.2 m (4 ft) označen je: projektira ga inženjer.
:::

## Rubnjaci

Kliknite duž rubnjaka i pritisnite {{key:Enter}}; postavite njegovu širinu i visinu istaka.

## Rampe

Kliknite od dna do vrha i pritisnite {{key:Enter}}. Razine dolaze s terena na svakom kraju, osim ako ih ne upišete. Rampa dobiva podest svakih 750 mm (2.5 ft) uspona i provjerava se prema **Najstrmiji dopušteni** (1:12 za početak) i najmanjoj širini; Svojstva kažu koliko bi dugo trebala biti.

## Stepenice

Kliknite prednji rub donje stepenice, zatim mjesto gdje stepenice dosežu vrh, i pritisnite {{key:Enter}}. Broj stepenica dolazi iz visine i **Najveće visine stepenice**; gazište iz pravila udobnosti 2V + G ≈ 630 mm, nikad manje od **Najmanjeg gazišta**; podest na svakih **Najviše stepenica u kraku**. Svojstva kažu staju li između dviju točaka ili koliko su im dulje potrebne.

:::note
Granice za rampe i stepenice su označene zadane vrijednosti. Postavite one koje zahtijeva vaš građevinski propis.
:::

## Izvan CivilCraft-a

- Više › {{ui:Izvezi IFC krajobraza}}: popločenje i staze kao `IfcPavement`, zidovi kao `IfcWall` (potporni zidovi kao RETAININGWALL) sa svojim slojevima, rubnjaci kao `IfcKerb`, rampe kao `IfcRamp`, stepenice kao `IfcStair` sa svojim stepenicama i gazištima.
- **Pošalji u TakeoffCraft** na popisu biljaka prenosi površine popločenja i volumene slojeva, površine lica zidova i duljine, duljine rubnjaka te broj stepenica.
- Detaljni listovi crtaju presjek svakog zida, građu svakog popločenja i svaki krak stepenica. Vidi [Listovi krajobraza](topic:landscape-sheets).
