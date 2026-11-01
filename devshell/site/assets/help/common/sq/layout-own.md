---
title: Rregullo paraqitjen tënde dhe ruaj konfigurimet
summary: Zgjidh cili panel shfaq shfletuesin e projektit, Vetitë ose përmbajtjen e vet, ku shkon kutia e veglave dhe çfarë mbajnë shiritat, ruaje si paraqitjen tënde, dhe mbaj konfigurime të plota me emër për t'i ndërruar mes tyre.
keywords: paraqitje, mjedis pune, rregullo, personalizo, paraqitja ime, paraqitje e imja, panele, redaktues, shfletuesi i projektit, vetitë, kutia e veglave, shiriti i shpejtë, kutia e informacionit, konfigurim, profil, ruaj konfigurimin, ndërro konfigurimin, eksporto konfigurimin, importo konfigurimin, ccenv
from: 2a71af43
---

Përveç tre paraqitjeve të integruara, mund të rregullosh një të tuajën, dhe ta ruash të gjithë konfigurimin me një emër që të kthehesh te ai me një hap.

## Rregullo paraqitjen tënde

1. Hap {{ui:Cilësimet}} (ingranazhi, ose {{key:Mod+,}}), zgjidh {{ui:Globale}}, pastaj {{ui:Paraqitja}}.
2. Zgjidh {{ui:Rregullo paraqitjen tënde…}}. Dialogu fillon nga paraqitja që përdor tani.
3. Jepi një emër, pastaj zgjidh:
   - **Mbi vizatim:** shiriti i veglave të aplikacionit, një shirit me skeda ose asnjë; një shirit titulli; një kuti informacioni dhe cilat kontrolle mban.
   - **Pranë vizatimit:** kutia e veglave në të majtë, në të djathtë ose aspak, me ose pa {{ui:Veglat e mia}}; cili panel mban paletat, cili është lart (shfletuesi i projektit ose Vetitë, për shembull), dhe cilat janë skeda nën të.
   - **Zona e vizatimit:** skedat e pamjes, një shirit i shpejtë dhe një shirit pamjeje me kontrollet që shenjon, paleta e redaktimit, një shirit statusi.
   - **Pamja:** madhësia, konturet e butonave dhe stili i skedave.
4. Zgjidh {{ui:Përdor këtë paraqitje}}. Aplikacioni kalon menjëherë, dhe çdo aplikacion që ka paraqitje e përdor gjithashtu.

Vetëm ajo që ka ky aplikacion ofrohet. Paraqitja jote renditet te {{ui:Nga shtojcat dhe skedarët}}; {{ui:Eksporto këtë paraqitje}} e ruan si skedar që mund t'ia japësh një kolegu, dhe butoni i heqjes e largon. Panelet që ajo mbush vazhdojnë të vendosen, të lundrojnë dhe të zhvendosen në dritaren e tyre, si në [Rregullo panelet](common:arrange-panels).

## Ruaj konfigurimin tënd si mjedis pune

Një mjedis pune është i gjithë konfigurimi yt për çdo aplikacion në këtë shfletues: paraqitja, stili i menusë dhe tastet e tua, stili i shiritit të veglave, panelet dhe madhësitë e tyre, dhe {{ui:Veglat e mia}}. Tema dhe gjuha nuk bëjnë pjesë të tij.

- **Ruaj:** shkruaj një emër nën {{ui:Mjediset e punës}} dhe zgjidh {{ui:Ruaj konfigurimin tim}}. Ruajtja me një emër që ekziston zëvendëson atë konfigurim.
- **Ndërro:** zgjidh një konfigurim në listë dhe zgjidh {{ui:Kalo te ai}}. Aplikacioni rifreskohet në atë konfigurim; nëse ke punë të paruajtur, aplikacioni pyet më parë, si në çdo rifreskim.
- **Ndaj:** {{ui:Eksporto}} ruan konfigurimin e zgjedhur si skedar `.ccenv.json`; {{ui:Importo një konfigurim…}} shton një të tillë nga një skedar. Një skedar vendos vetëm këto zgjedhje, asgjë tjetër.
- **Hiq:** zgjidh një konfigurim dhe zgjidh {{ui:Hiq}}.

Mund të mbash deri në dymbëdhjetë konfigurime.

Për t'i provuar paraqitjet e integruara më parë, shih [paraqitjen me kutinë e veglave dhe kutinë e informacionit](common:layout-toolbox) dhe [paraqitjen me shiritin dhe shfletuesin e projektit](common:layout-ribbon).
