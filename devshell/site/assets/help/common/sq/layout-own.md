---
title: Rregullo paraqitjen tënde dhe ruaj konfigurimet
summary: Zgjidh cili panel shfaq shfletuesin e projektit, Vetitë ose përmbajtjen e vet, ku shkon kutia e veglave dhe çfarë mbajnë shiritat, ruaje si paraqitjen tënde, dhe mbaj konfigurime të plota me emër për të ndërruar mes tyre.
keywords: paraqitje, hapësirë pune, rregullo, personalizo, paraqitja ime, paraqitja e vet, panele, redaktues, shfletues projekti, veti, kutia e veglave, shiriti i shpejtë, kutia e informacionit, mjedis pune, konfigurim, profil, ruaj konfigurimin, ndërro konfigurimin, eksporto konfigurimin, importo konfigurimin, ccenv
from: 6af528e0
---

Përveç tre paraqitjeve të integruara mund të rregullosh një të tënden, dhe ta ruash tërë konfigurimin me një emër, që të kthehesh te ai me një hap.

## Rregullo paraqitjen tënde

1. Hap {{ui:Cilësimet}} (ingranazhi, ose {{key:Mod+,}}), zgjidh {{ui:Global}}, pastaj {{ui:Paraqitja}}.
2. Zgjidh {{ui:Rregullo paraqitjen tënde…}}. Dialogu fillon nga paraqitja që përdor tani.
3. Jepi një emër, pastaj zgjidh:
   - **Mbi vizatim:** shiriti i veglave të aplikacionit, një shirit me skeda ose asnjë; një shirit titulli; një kuti informacioni dhe cilat kontrolle mban.
   - **Pranë vizatimit:** kutia e veglave në të majtë, në të djathtë ose aspak, me ose pa {{ui:Veglat e mia}}; cili panel mban paletat, cili është lart (shfletuesi i projektit ose Vetitë, për shembull), dhe cilët janë skeda nën të.
   - **Zona e vizatimit:** skedat e pamjeve, një shirit i shpejtë dhe një shirit pamjeje me kontrollet që shënon, paleta e redaktimit, një shirit statusi.
   - **Pamja:** madhësia, konturet e butonave dhe stili i skedave.
4. Zgjidh {{ui:Përdor këtë paraqitje}}. Aplikacioni kalon menjëherë te ajo, dhe çdo aplikacion që ka paraqitje e përdor gjithashtu.

Ofrohet vetëm ajo që ka ky aplikacion. Paraqitja jote renditet te {{ui:Nga shtojcat dhe skedarët}}; {{ui:Eksporto këtë paraqitje}} e ruan si skedar që mund t'ia japësh një kolegu, dhe butoni {{ui:Hiq}} e largon. Panelet që ajo plotëson vendosen, lundrojnë dhe zhvendosen në dritaren e tyre, si në [Rregullo panelet](common:arrange-panels).

## Ruaje konfigurimin si mjedis pune

Mjedisi i punës është tërë konfigurimi yt për çdo aplikacion në këtë shfletues: paraqitja, stili i menusë dhe tastet e tua, stili i shiritit të mjeteve, panelet dhe madhësitë e tyre, dhe {{ui:Veglat e mia}}. Tema dhe gjuha nuk janë pjesë e tij.

- **Ruaj:** shkruaj një emër nën {{ui:Mjediset e punës}} dhe zgjidh {{ui:Ruaj konfigurimin tim}}. Ruajtja me një emër që ekziston zëvendëson atë konfigurim.
- **Ndërro:** zgjidh një konfigurim në listë dhe zgjidh {{ui:Kalo te ai}}. Aplikacioni rifreskohet në atë konfigurim; nëse ke punë të paruajtur, aplikacioni pyet së pari, si në çdo rifreskim.
- **Ndaj:** {{ui:Eksporto}} ruan konfigurimin e zgjedhur si skedar `.ccenv.json`; {{ui:Importo një konfigurim…}} shton një të tillë nga një skedar. Një skedar vendos vetëm këto zgjedhje, asgjë tjetër.
- **Hiq:** zgjidh një konfigurim dhe zgjidh {{ui:Hiq}}.

Mund të mbash deri në dymbëdhjetë konfigurime.

Për të ndryshuar një paraqitje pa hapur dialogun (tërhiq një bllok, kliko me të djathtën mbi një mjet), shih [Ndrysho paraqitjen në ekran](common:layout-edit). Për të provuar fillimisht paraqitjet e integruara, shih [paraqitjen e kutisë së veglave dhe të kutisë së informacionit](common:layout-toolbox), [paraqitjen e shiritit dhe të shfletuesit të projektit](common:layout-ribbon) dhe [paraqitjen Drafting](common:layout-drafting).
