---
title: Vizato me ngjitje, qoshe të zgjedhura dhe zhvendos, kopjo, rrotullo
summary: Vendos aksët, platformat, parcelat dhe vijat karakteristike saktësisht mbi pika dhe qoshe që ke tashmë, shkruaj ose zgjidh koordinatat lindje dhe veri të një qoshe, kthe një tangjente drejt dy pikave, dhe zhvendos, kopjo ose rrotullo një objekt me një distancë ose kënd.
keywords: ngjitje, ngjitjet, osnap, ngjit te pika, ngjit te qoshja, PI, kulm, qoshe, zgjidh, kryq, lindje, veri, koordinata, koordinata të shkruara, tangjente, drejtim, azimut, zhvendos, kopjo, rrotullo, transformo, kopjo e rrotulluar, dublo, alt, pikë e lirë, vizatim
from: 49864dda
---

Të reja në 0.9: kur vizaton, kursori bie mbi pikat dhe qoshet që janë tashmë në plan, dhe një qoshe platforme, parcele ose vije karakteristike mund të shkruhet ose zgjidhet me kryq. Kjo temë kalon nëpër tre veglat.

## Çfarë do të bëni

- Vizato me ngjitje, që një aks, platformë, parcelë ose vijë e re të fillojë dhe të mbarojë saktësisht mbi diçka që ekziston.
- Vendos lindjen dhe veriun e një qoshe duke i shkruar ose duke zgjedhur një vend në plan.
- Kthe një tangjente të aksit drejt dy pikave të zgjedhura.
- Zhvendos, kopjo ose rrotullo një objekt të tërë.

## Hapat

1. Zgjidh një vegël vizatimi, për shembull {{ui:Aks rrugor}}, {{ui:Platformë}}, {{ui:Parcela}} ose {{ui:Vijë karakteristike}}. Lëviz treguesin afër një pike rilevimi, një PI të aksit rrugor, një platforme, parcele ose qoshe masash, një kulmi të vijës karakteristike ose një strukture kanalizimi. Shfaqet një shenjë me etiketë (PI, Qoshe, Kulm, Strukturë ose Pikë dhe numri i saj) dhe lindjen dhe veriun ku do të bjerë. Kliko për ta vendosur pikën atje.
2. Për të vendosur një pikë lirshëm, mbaj {{key:Alt}} ndërsa klikon. Ngjitja fiket.
3. Zgjidh një platformë, parcelë ose vijë karakteristike. Te **Vetitë**, blloku {{ui:Qoshet}} liston çdo qoshe me një kuti **Lindje** dhe një kuti **Veri**. Shkruaj numra të rinj, ose shtyp butonin e kryqit pranë një qoshe dhe kliko një vend në plan. Qoshja merr atë lindje dhe veri. Shtyp {{key:Esc}} për të anuluar një zgjedhje. Kryqi funksionon vetëm në plan: mbyll më parë pamjen 3D.
4. Për të kthyer një tangjente, zgjidh një aks rrugor. Te **Vetitë**, nën {{ui:Tangjente nga dy pika}}, zgjidh tangjenten, shtyp {{ui:Pika e parë}} dhe kliko në plan, shtyp {{ui:Pika e dytë}} dhe kliko përsëri, pastaj shtyp {{ui:Cakto drejtimin}}. Tangjentja kthehet të shkojë nga pika e parë drejt të dytës dhe ruan gjatësinë e saj.
5. Për të zhvendosur, kopjuar ose rrotulluar, zgjidh një aks rrugor, platformë, parcelë ose vijë karakteristike. Te **Vetitë**, nën {{ui:Zhvendos, kopjo dhe rrotullo}}, shkruaj {{ui:Zhvendos lindore}} dhe {{ui:Zhvendos veriore}} (numrat negativë shkojnë në perëndim dhe jug) dhe shtyp {{ui:Zhvendos}} ose {{ui:Kopjo}}. Ose shtyp {{ui:Distanca nga dy pika}} dhe kliko pikën ku zhvendoset dhe pikën ku shkon.
6. Për të rrotulluar, shkruaj këndin te {{ui:Rrotullo në drejtim të kundërt të orës}} (në gradë), pastaj shtyp {{ui:Rrotullo}} ose {{ui:Kopjo e rrotulluar}}. Rrotullimi bëhet rreth mesit të qoshjeve të tij, përveç nëse zgjidh një pikë për ta rrotulluar rreth saj me kryqin pranë këndit.

## Shënime

- Një kopje e lë origjinalin aty ku është dhe pas kësaj zgjidhet.
- Çdo zhvendosje, kopjim, rrotullim, qoshe e zgjedhur dhe tangjente e kthyer është një hap zhbërjeje.
- Ngjitjet arrijnë 10 piksela ekrani nga kursori. Një shenjë ngjitjeje vetëm ofron një vend; asgjë nuk ndryshon derisa të klikoni.
- I njëjti kryq është te rreshtat PI të një aksi rrugor. Shih [Aksët rrugorë](topic:alignment), [Parcelat](topic:parcels) dhe [Vijat karakteristike](topic:feature-lines).
