---
title: Popločavanje, zidovi i stepenice
summary: Popločavanje sa padom ka slivniku ili poprečnim padom, šara i njen sloj građenja; staze koje prate teren; potporni i slobodno stojeći zidovi sa stepenastim temeljima; ivičnjaci; rampe i stepenice provereni prema svojim ograničenjima; IFC izvoz.
keywords: tvrdo uređenje, popločavanje, kocke, terasa, padovi, slivnik, poprečni pad, riblja kost, slog u red, staza, šetalište, potporni zid, baštenski zid, temelj, završna kapa, ivičnjak, ivica, rampa, pristupačnost, stepenice, gazišta, visine stepenika, odmorište
from: 51475877
---

Tvrdo uređenje se uvek ponovo izračunava iz terena, pa prati teren i ponovo se generiše kad se teren ili njegova linija pomeri. Prevuci njegove uglove na planu kao i svaku liniju. Otvori ga pomoću {{ui:Tvrdo uređenje}} u grupi Pejzaž.

## Popločavanje

Klikni uglove i pritisni {{key:Enter}}. U Svojstvima:

- **Kota**: prazno = srednja kota terena ispod njega.
- **Padovi**: kota, **poprečni pad** (% u nekom smeru) ili **ka slivniku**: CivilCraft traži da klikneš gde ide slivnik, pa se svaki ugao diže od slivnika uz pad. Strelice na planu pokazuju padove.
- **Šara** (mreža, slog u red, riblja kost) sa veličinom jedinice, spojnicom i uglom; **Ivica** sa širinom. Na listu, spojnice uže od milimetra se izostavljaju.
- Popločavanje je deo projektovane površi. Njegovi slojevi (kocke, podloga, osnova) ulaze u IFC i u količine.

## Staze

Klikni duž staze i pritisni {{key:Enter}}. Staza prati teren, sa svojim **Poprečnim padom** ka desnoj strani. Staza strmija od **Najstrmije dozvoljeno** označava se sa `!` na planu gde se to dešava, a Svojstva kažu koliko je strma.

## Zidovi

Klikni duž zida i pritisni {{key:Enter}}. Zid je **potporni** ili **slobodno stojeći**. Bez **Vrha**, stoji svojom **Visinom** iznad terena duž celog zida; upiši vrh da ga držiš horizontalno. Njegov **temelj** leži zadatu dubinu ispod terena i stepenasto se spušta u celim koracima, pa između njih ostaje horizontalan. Svojstva daju njegovu dužinu, visine, površinu lica i korake temelja; na planu se na svakom kraju obeležavaju vrh i dno zida (TW / BW).

:::warning
Potporni zid viši od 1.2 m (4 ft) se označava: projektuje ga inženjer.
:::

## Ivičnjaci

Klikni duž ivičnjaka i pritisni {{key:Enter}}; podesi njegovu širinu i visinu izdizanja.

## Rampe

Klikni od dna do vrha i pritisni {{key:Enter}}. Kote dolaze iz terena na svakom kraju, osim ako ih ne upišeš. Rampa dobija odmorište na svakih 750 mm (2.5 ft) visine i proverava se prema **Najstrmije dozvoljeno** (1:12 kao početna vrednost) i najmanjoj širini; Svojstva kažu koliko bi dugačka morala biti.

## Stepenice

Klikni prednju ivicu donjeg stepenika, pa mesto gde stepenice stižu do vrha, i pritisni {{key:Enter}}. Broj stepenika dolazi iz visine i **Najveće visine stepenika**; gaz iz pravila udobnosti 2R + G ≈ 630 mm, nikad manje od **Najmanjeg gaza**; odmorište na svakih **Najviše stepenika u kraku**. Svojstva kažu da li stanu između dve tačke ili koliko im treba duže.

:::note
Ograničenja za rampe i stepenice su označene podrazumevane vrednosti. Podesi ona koja traži tvoj građevinski propis.
:::

## Van CivilCraft-a

- Više › {{ui:Izvezi IFC za uređenje}}: popločavanja i staze kao `IfcPavement`, zidovi kao `IfcWall` (potporni zidovi kao RETAININGWALL) sa svojim slojevima, ivičnjaci kao `IfcKerb`, rampe kao `IfcRamp`, stepenice kao `IfcStair` sa svojim visinama stepenika i gazištima.
- Specifikacija biljaka, **Pošalji u TakeoffCraft**, nosi površine popločanja i zapremine slojeva, površine lica zidova i dužine, dužine ivičnjaka i broj stepenika.
- Lista detalja crta presek svakog zida, građu svakog popločanja i svaki krak stepenica. Vidi [Pejzažni listovi](topic:landscape-sheets).
