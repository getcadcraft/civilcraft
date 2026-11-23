---
title: Popločavanje, zidovi i stepenice
summary: Popločavanje s padovima prema odvodniku ili poprečnim nagibom, uzorak i njegov sastav slojeva; staze koje prate teren; potporni i slobodnostojeći zidovi sa stepenastim temeljima; ivičnjaci; rampe i stepenice provjerene prema svojim granicama; IFC izvoz.
keywords: tvrdo uređenje, popločavanje, kocke, terasa, trijem, padovi, odvodnik, poprečni pad, riblja kost, vezivanje u dužinu, staza, šetnica, potporni zid, vrtni zid, temelj, zidni vijenac, ivičnjak, obrub, rampa, pristupačnost, stepenice, stepenici, visine stepenica, gazišta, odmorište
from: d34b4466
---

Tvrdo uređenje se svaki put ponovo izračunava iz terena, pa prati teren i ponovo se generiše kada se teren ili njegova linija pomjeri. Povuci njegove uglove na planu kao bilo koju liniju. Otvori ga iz {{ui:Tvrdo uređenje}} u grupi Pejzaž.

## Popločavanje

Klikni uglove i pritisni {{key:Enter}}. U Svojstvima:

- **Nivo**: prazno = prosječna kota terena ispod njega.
- **Padovi**: ravno, **poprečni pad** (% prema nekom smjeru) ili **prema odvodniku**: CivilCraft traži da klikneš gdje ide odvodnik, zatim se svaki ugao diže od odvodnika s padom. Strelice na planu prikazuju padove.
- **Uzorak** (mreža, vezivanje u dužinu, riblja kost) sa veličinom jedinice, fugom i uglom; širina **Obruba**. Na listu se fuge manje od milimetra izostavljaju.
- Popločavanje je dio projektovane površine. Njegovi slojevi (kocke, podloga, nosivi sloj) idu u IFC i količine.

## Staze

Klikni duž staze i pritisni {{key:Enter}}. Ona prati teren, sa svojim **Poprečnim padom** prema desnoj strani. Staza strmija od **Najstrmije dozvoljeno** označava se s `!` na planu gdje se nalazi, a Svojstva kažu koliko je strma.

Tamo gdje staza dolazi do puta izgrađenog koridorom, staje na vanjskoj ivici puta, izravnata s šetnicom ili bankinom tamo, u projektovanoj površini i u 3D prikazu. Staza koja presijeca put je izravnata i prikazana kao dva dijela, a kraj nacrtan do dvostruke širine staze kraće od puta nastavlja se do njegove ivice. Plan i dalje prikazuje stazu kako si je nacrtao, a njena dužina i površina broje cijelu liniju. Pogledaj [Koridor puta duž trase](topic:corridor).

## Zidovi

Klikni duž zida i pritisni {{key:Enter}}. Zid je **potporni** ili **slobodnostojeći**. Bez **Vrha**, stoji svojom **Visinom** iznad terena cijelom dužinom; upiši vrh da ga držiš horizontalno. Njegov **temelj** leži zadanu dubinu ispod terena i spušta se u cijelim koracima, pa između njih ostaje horizontalan. Svojstva daju njegovu dužinu, visine, površinu lica i korake temelja; plan na svakom kraju označava vrh i dno zida (TW / BW).

:::warning
Potporni zid viši od 1.2 m (4 ft) se označava: inženjer ga projektuje.
:::

## Ivičnjaci

Klikni duž ivičnjaka i pritisni {{key:Enter}}; postavi njegovu širinu i izdignuće.

## Rampe

Klikni od dna do vrha i pritisni {{key:Enter}}. Kote dolaze iz terena na svakom kraju, osim ako ih ne upišeš. Rampa dobija odmorište na svakih 750 mm (2.5 ft) uspona i provjerava se prema **Najstrmije dozvoljeno** (1:12 na početku) i najmanjoj širini; Svojstva kažu koliko bi dugo trebala biti.

## Stepenice

Klikni prednju ivicu donjeg stepenika, zatim tamo gdje stepenice dostižu vrh, i pritisni {{key:Enter}}. Broj visina stepenica dolazi iz visine i **Najveće visine stepenika**; gazište iz pravila udobnosti 2R + G ≈ 630 mm, nikada ispod **Najmanjeg gazišta**; odmorište na svakih **Najviše stepenika po kraku**. Svojstva kažu da li stanu između te dvije tačke ili koliko su duže potrebne.

:::note
Granice za rampe i stepenice su označene kao podrazumijevane. Postavi one koje traži tvoj građevinski propis.
:::

## Izvan CivilCraft-a

- Više › {{ui:Izvezi pejzaž IFC}}: popločavanje i staze kao `IfcPavement`, zidovi kao `IfcWall` (potporni zidovi kao RETAININGWALL) sa svojim slojevima, ivičnjaci kao `IfcKerb`, rampe kao `IfcRamp`, stepenice kao `IfcStair` sa svojim visinama i gazištima.
- **Pošalji u TakeoffCraft** iz spiska biljaka prenosi površine popločavanja i zapremine slojeva, površine lica i dužine zidova, dužine ivičnjaka i broj stepenica.
- List detalja crta presjek svakog zida, sastav svakog popločavanja i svaki krak stepenica. Pogledaj [Listovi pejzaža](topic:landscape-sheets).
