---
title: Popločenje, zidovi i stube
summary: Popločenje s padovima prema odvodu ili poprečnim nagibom, uzorak i njegova građa; staze koje prate teren; potporni i samostojeći zidovi s stepenastim temeljima; rubnjaci; rampe i stube provjerene prema svojim ograničenjima; izvoz IFC-a.
keywords: popločenje, pločnik, terasa, padovi, odvod, poprečni nagib, riblja kost, slaganje u red, staza, pješačka staza, potporni zid, vrtni zid, temelj, kapna ploča, rubnjak, obrub, rampa, pristupačnost, stube, stepenice, gazišta, podest
from: 51475877
---

Popločenje se svaki put ponovno izračunava iz terena, pa prati teren i regenerira se kad se teren ili njegova linija pomakne. Povucite njegove kutove na tlocrtu kao i svaku liniju. Otvorite ga iz {{ui:Popločenje i građevinski uređeni elementi}} u grupi Krajobraz.

## Popločenje

Kliknite kutove i pritisnite {{key:Enter}}. U {{ui:Svojstva}}:

- **Kota**: prazno = srednja kota terena ispod njega.
- **Padovi**: kota, **poprečni nagib** (% prema nekom smjeru) ili **prema odvodu**: CivilCraft traži da kliknete gdje ide odvod, pa se svaki kut diže od odvoda zadanim padom. Strelice na tlocrtu pokazuju padove.
- **Uzorak** (mreža, slaganje u red, riblja kost) s veličinom jedinice, fugom i kutom; **Obrub** širine. Na listu se fuge manje od milimetra izostavljaju.
- Popločenje je dio projektirane površine. Njegovi slojevi (popločne ploče, posteljica, podloga) ulaze u IFC i u količine.

## Staze

Kliknite duž staze i pritisnite {{key:Enter}}. Ona prati teren, s **poprečnim nagibom** na svoju desnu stranu. Staza strmija od **Najvećeg dopuštenog nagiba** označava se `!` na tlocrtu tamo gdje je, a Svojstva kažu koliko je strma.

## Zidovi

Kliknite duž zida i pritisnite {{key:Enter}}. Zid je **potporni** ili **samostojeći**. Bez **Vrha** stoji svojom **Visinom** iznad terena cijelom dužinom; upišite vrh da ga držite vodoravno. Njegov **temelj** leži zadanu dubinu ispod terena i stepenasto se spušta u cijelim koracima, pa između njih ostaje vodoravan. Svojstva daju duljinu, visine, površinu lica i korake temelja; tlocrt na svakom kraju označava vrh i dno zida (TW / BW).

:::warning
Potporni zid viši od 1.2 m (4 ft) se označava: projektira ga inženjer.
:::

## Rubnjaci

Kliknite duž rubnjaka i pritisnite {{key:Enter}}; postavite njegovu širinu i istak.

## Rampe

Kliknite od dna do vrha i pritisnite {{key:Enter}}. Kote dolaze s terena na svakom kraju, osim ako ih upišete. Rampa dobiva podest na svaki uspon od 750 mm (2.5 ft) i provjerava se prema **Najvećem dopuštenom nagibu** (u početku 1:12) i najmanjoj širini; Svojstva kažu koliko bi dugačka morala biti.

## Stube

Kliknite prednji rub donje stube, zatim mjesto gdje stube dosežu vrh, i pritisnite {{key:Enter}}. Broj čela dolazi iz visine i **Najvećeg čela**; gazište iz pravila udobnosti 2R + G ≈ 630 mm, nikad manje od **Najmanjeg gazišta**; podest na svakih **najviše čela po kraku**. Svojstva kažu stanu li stube između dviju točaka ili koliko moraju biti dulje.

:::note
Granice za rampe i stube su označene zadane vrijednosti. Postavite one koje zahtijeva vaš građevinski propis.
:::

## Izvan CivilCraft-a

- {{ui:Više}} › {{ui:Izvezi IFC krajobraza}}: popločenja i staze kao `IfcPavement`, zidovi kao `IfcWall` (potporni zidovi kao RETAININGWALL) sa svojim slojevima, rubnjaci kao `IfcKerb`, rampe kao `IfcRamp`, stube kao `IfcStair` s čelima i gazištima.
- **Pošalji u TakeoffCraft** na popisu biljaka nosi površine popločenja i volumene slojeva, površine lica zidova i njihove duljine, duljine rubnjaka te broj stuba.
- Lista detalja crta presjek svakog zida, građu svakog popločenja i svaki krak stuba. Vidi [Listovi za krajobraz](topic:landscape-sheets).
