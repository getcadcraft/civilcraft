---
title: Popločavanje, zidovi i stepenice
summary: Popločavanje sa padovima ka slivniku ili poprečnim nagibom, obrazac i njegov sastav; staze koje prate teren; potporni i slobodni zidovi sa stepenastim temeljima; ivičnjaci; rampe i stepenice proverene prema svojim granicama; IFC izvoz.
keywords: tvrdo uređenje, popločavanje, pločice, patio, terasa, padovi, slivnik, poprečni pad, riblja kost, slaganje u red, staza, pešačka staza, potporni zid, baštenski zid, temelj, završna kapa, ivičnjak, ivica, rampa, pristupačnost, stepenice, stepenište, visine stepenika, gazišta, podest
from: d34b4466
---

Tvrdo uređenje se svaki put ponovo računa iz terena, pa prati teren i obnavlja se kad se teren ili njegova linija pomeri. Prevuci njegove uglove na osnovi kao i svaku liniju. Otvori ga iz {{ui:Tvrdo uređenje}} u grupi Uređenje okoline.

## Popločavanje

Klikni uglove i pritisni {{key:Enter}}. U **Svojstvima**:

- **Nivo**: prazno = srednja vrednost terena ispod njega.
- **Padovi**: ravno, **poprečni pad** (% ka nekom smeru) ili **ka slivniku**: CivilCraft traži da klikneš gde ide slivnik, pa svaki ugao raste od slivnika sa padom. Strelice na osnovi pokazuju padove.
- **Obrazac** (mreža, slaganje u red, riblja kost) sa veličinom jedinice, fugom i uglom; širina **Ivice**. Na listu se fuge manje od 1 mm izostavljaju.
- Popločavanje je deo projektovane površi. Njegovi slojevi (pločice, podloga, osnova) ulaze u IFC i količine.

## Staze

Klikni duž staze i pritisni {{key:Enter}}. Ona prati teren, sa **Poprečnim padom** ka desnoj strani. Staza strmija od **Najstrmije dozvoljeno** označava se sa `!` na osnovi tamo gde je, a **Svojstva** kažu koliko je strma.

Gde staza sreće put izgrađen koridorom, ona staje na spoljnoj ivici puta, u nivou pešačke staze ili bankine tamo, u projektovanoj površi i u 3D prikazu. Staza koja preseca put se uklapa i prikazuje kao dva dela, a kraj nacrtan do dvostruke širine staze kraći od puta se produžava do njegove ivice. Osnova i dalje prikazuje stazu kako si je nacrtao, a njena dužina i površina računaju celu liniju. Pogledaj [Protezanje koridora puta](topic:corridor).

## Zidovi

Klikni duž zida i pritisni {{key:Enter}}. Zid je **potporni** ili **slobodni**. Bez **Vrha** on stoji na svojoj **Visini** iznad terena po celoj dužini; unesi vrh da ga držiš horizontalno. Njegov **temelj** leži zadatu dubinu ispod terena i spušta se u celim koracima, pa između njih ostaje horizontalan. **Svojstva** daju njegovu dužinu, visine, površinu lica i korake temelja; osnova na svakom kraju obeležava vrh i dno zida (TW / BW).

:::warning
Potporni zid viši od 1.2 m (4 ft) je označen: inženjer ga projektuje.
:::

## Ivičnjaci

Klikni duž ivičnjaka i pritisni {{key:Enter}}; postavi njegovu širinu i izdignuće.

## Rampe

Klikni od dna ka vrhu i pritisni {{key:Enter}}. Kote dolaze iz terena na svakom kraju, osim ako ih ne unese. Rampa dobija podest na svakih 750 mm (2.5 ft) visine i proverava se prema **Najstrmije dozvoljeno** (1:12 na početku) i najmanjoj širini; **Svojstva** kažu kolika bi morala da bude dužina.

## Stepenice

Klikni prednju ivicu donjeg stepenika, pa mesto gde stepenice dostižu vrh, i pritisni {{key:Enter}}. Broj visina stepenika dolazi iz visine i **Najveće visine stepenika**; gazište iz pravila udobnosti 2R + G ≈ 630 mm, nikad manje od **Najmanjeg gazišta**; podest na svakih **Najviše visina stepenika po kraku**. **Svojstva** kažu da li se uklapaju između dve tačke ili koliko su duži potrebni.

:::note
Granice za rampe i stepenice su označene kao podrazumevane. Postavi one koje traži tvoj građevinski propis.
:::

## Van CivilCraft-a

- Više › {{ui:Izvezi IFC za uređenje}}: popločavanje i staze kao `IfcPavement`, zidovi kao `IfcWall` (potporni zidovi kao RETAININGWALL) sa svojim slojevima, ivičnjaci kao `IfcKerb`, rampe kao `IfcRamp`, stepenice kao `IfcStair` sa svojim visinama stepenika i gazištima.
- **Pošalji u TakeoffCraft** iz specifikacije biljaka prenosi površine popločavanja i zapremine slojeva, površine lica zidova, dužine ivičnjaka i broj stepenika.
- List detalja crta presek svakog zida, sastav svakog popločavanja i svaki krak stepenica. Pogledaj [Listovi uređenja okoline](topic:landscape-sheets).
