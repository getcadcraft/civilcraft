---
title: Popločanje, zidovi i stepenice
summary: Popločanje s padovima prema odvodniku ili poprečnim padom, uzorak i njegova konstrukcija; staze koje prate teren; potporni i samostojeći zidovi sa stepenastim temeljima; ivičnjaci; rampe i stepenice provjerene prema svojim granicama; izvoz u IFC.
keywords: tvrdo uređenje, popločanje, pločice, terasa, padovi, odvodnik, poprečni pad, riblja kost, slagani spoj, staza, šetnica, potporni zid, zid bašte, temelj, pokrovna ploča, ivičnjak, ivica, rampa, pristupačnost, stepenice, stepenik, visina stepenika, gazište, podest
from: 51475877
---

Tvrdo uređenje se ponovo izračunava iz terena svaki put, pa prati teren i ponovo se generiše kada se teren ili njegova linija pomjeri. Povucite njegove uglove na planu kao i bilo koju liniju. Otvorite ga iz {{ui:Tvrdo uređenje}} u grupi Pejzaž.

## Popločanje

Kliknite uglove i pritisnite {{key:Enter}}. U Svojstvima:

- **Nivo**: prazno = srednji nivo terena ispod njega.
- **Padovi**: nivo, **poprečni pad** (% prema nekom smjeru) ili **prema odvodniku**: CivilCraft traži da kliknete gdje ide odvodnik, zatim se svaki ugao diže od odvodnika s padom. Strelice na planu prikazuju padove.
- **Uzorak** (mreža, slagani spoj, riblja kost) sa veličinom jedinice, spojem i uglom; širina **Ivičenja**. Na listu se izostavljaju spojevi manji od jednog milimetra.
- Popločanje je dio projektovane površine. Njegovi slojevi (pločice, ležište, donji sloj) ulaze u IFC i količine.

## Staze

Kliknite duž staze i pritisnite {{key:Enter}}. Prati teren, sa **poprečnim padom** na desnu stranu. Staza strmija od **Najstrmijeg dozvoljenog** označava se sa `!` na planu gdje se nalazi, a Svojstva kažu koliko je strma.

## Zidovi

Kliknite duž zida i pritisnite {{key:Enter}}. Zid je **potporni** ili **samostojeći**. Bez **Vrha**, stoji svojom **Visinom** iznad terena duž cijele dužine; upišite vrh da ga držite na nivou. Njegov **temelj** nalazi se na zadanoj dubini ispod terena i spušta se u cijelim stepenicama, pa između njih ostaje na nivou. Svojstva daju njegovu dužinu, visine, površinu lica i stepenice temelja; plan u svakom kraju označava vrh i dno zida (TW / BW).

:::warning
Potporni zid viši od 1.2 m (4 ft) se označava: projektuje ga inženjer.
:::

## Ivičnjaci

Kliknite duž ivičnjaka i pritisnite {{key:Enter}}; postavite njegovu širinu i visinu izbočenja.

## Rampe

Kliknite od dna do vrha i pritisnite {{key:Enter}}. Nivoi dolaze iz terena na svakom kraju, osim ako ih ne upišete. Rampa dobija podest na svakih 750 mm (2.5 ft) uspona i provjerava se prema **Najstrmijem dozvoljenom** (u početku 1:12) i najmanjoj širini; Svojstva kažu koliko bi dugačka morala biti.

## Stepenice

Kliknite prednju ivicu donjeg stepenika, zatim mjesto gdje stepenice dostižu vrh, i pritisnite {{key:Enter}}. Broj stepenika (visina stepenika) dolazi iz visine i **Najveće visine stepenika**; gazište iz pravila udobnosti 2R + G ≈ 630 mm, nikada ispod **Najmanjeg gazišta**; podest na svaki **Najviše stepenika po kraku**. Svojstva kažu da li stanu između dvije tačke ili koliko su im potrebne duže.

:::note
Granice za rampe i stepenice su označene zadane vrijednosti. Postavite one koje zahtijeva vaš građevinski propis.
:::

## Izvoz

- Više › {{ui:Izvezi pejzaž IFC}}: popločanje i staze kao `IfcPavement`, zidovi kao `IfcWall` (potporni zidovi kao RETAININGWALL) sa svojim slojevima, ivičnjaci kao `IfcKerb`, rampe kao `IfcRamp`, stepenice kao `IfcStair` sa svojim stepenicima i gazištima.
- **Pošalji u TakeoffCraft** u specifikaciji biljaka prenosi površine popločanja i zapremine slojeva, površine lica i dužine zidova, dužine ivičnjaka i broj stepenika.
- List detalja crta presjek svakog zida, konstrukciju svakog popločanja i svaki krak stepenica. Pogledajte [Listovi za pejzaž](topic:landscape-sheets).
