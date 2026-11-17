---
title: Augu ieraksti, šķirnes un piegādes izmēri
summary: Jūsu projekta augu saraksts kā tabula: šķirnes, piegādes izmēri (konteiners, saknu bumba, apkārtmērs, tīrais stumbrs), blīvums, specifikācijas piezīmes, CSV ievade un izvade; katrs ievietotais augs norāda izmēru; augu simboli pēc mēroga un jūsu simboli un 3D modeļi.
keywords: augu tabula, augu datubāze, šķirne, sugas šķirne, piegādes izmērs, konteiners, saknu bumba, ar atsegtām saknēm, apkārtmērs, tīrais stumbrs, blīvums, augi uz kvadrātmetru, specifikācija, specifikācijas piezīmes, augu simbols, bloks, savs simbols, 3D augs, detalizācijas līmenis, mērogs
from: 12251beb
---

Atveriet {{ui:Augu tabula}} no ainavas grupas izvēlnes {{ui:Vairāk}} vai no sadaļas Augi. Katra rinda ir augu ieraksts šī projekta sarakstā (ieraksts no augu saraksta tiek nokopēts, kad to pievienojat). Katra izmaiņa tiek pārbaudīta tāpat kā importētais fails, un tā ir viens atsaukšanas solis.

## Kolonnas

- **Botāniskais nosaukums**, **Parastais nosaukums**, **Tips**, **Augstums** un **Izplatība** pieaugušā vecumā (metros).
- **Attālums** (no centra līdz centram) vai **Blīvums** (augi uz m²). Dobe ar ierakstu, kuram ir blīvums un nav attāluma, tiek aizpildīta ar šo blīvumu pēc tās pašas shēmas (trijstūrveida vai kvadrātveida).
- **Piegādes izmēri**: viens ieraksts katram izmēram, atdalīts ar `;`. Katrs ieraksts ir identifikators, veids (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) un pēc tam jebkurš no: tilpums `10L`, augstums `h0.6`, izplatība `s0.4`, apkārtmērs `g14-16` (cm), tīrais stumbrs `st1.8`. Piemērs: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Šķirnes**: nosaukumi, atdalīti ar `;`. Šķirne saglabā savus izmērus un piezīmes, ja importētajā failā tādi bija.
- **Specifikācijas piezīmes**.

{{ui:Dublēt}} nokopē rindu ar jaunu atslēgu; {{ui:Saglabāt kā CSV}} un {{ui:Saglabāt kā augu failu}} ieraksta sarakstu (CSV rindas šķirnēm atrodas zem to sugas, ar `cultivar_of`). CSV vai augu faila importēšana to apvieno ar esošo.

## Jūsu bibliotēkas augu saraksts

Pierakstieties savā CadCraft kontā (Iestatījumi, Jūsu papildinājumi, Pierakstīties), un augu tabula var izmantot sarakstu, ko glabājat bibliotēkā:

- {{ui:No mans bibliotēkas saraksta}} ieved jūsu pašu augu vienumus (arī tos, kas vēl gaida pārskatīšanu). Augs, kas šeit jau ir, tiek atjaunināts no bibliotēkas; šeit pievienotās šķirnes, piegādes izmēri, blīvums un specifikācija tiek saglabāti.
- {{ui:Saglabāt kā augu sarakstu}} saglabā katru rindu kā jūsu pašu bibliotēkas augu vienumu, vienu vienumu uz sugu: jauns augs ir jauns vienums, mainīts augs ir jauna versija, nemainīts augs paliek nepieskarts. Vispirms atzīmējiet rūtiņu: saglabājot, augi tiek padarīti publiski pieejami saskaņā ar CC0. Pirmo publisko augšupielādi no personas, kas vēl nav uzticama, pārbauda cilvēks, pirms tā parādās, kā jebkuru augšupielādi.

Bibliotēkā glabājas pamata augu ieraksts. Šķirnes, piegādes izmēri, blīvums un specifikācijas piezīmes paliek projektā un augu failā ({{ui:Saglabāt kā augu failu}}); dialogā katru reizi, kad saglabājat, tiek norādīts, cik rindu tas ietekmē.

## Ievietotais augs norāda izmēru

Atlasiet augu, dzīvžogu vai dobes vai stādījumu laukuma maisījuma rindu: ja ierakstam ir šķirnes vai piegādes izmēri, {{ui:Šķirne un izmērs}} izvēlas vienu. Augu specifikācijā tad skaita pēc sugas, šķirnes un izmēra, un uzraksts tos var parādīt: `{botanical} '{cultivar}' {size}` vai `{full}`.

## Augu simboli pēc mēroga

{{ui:Augu grafika}} (Ainava › Vairāk) nosaka, kā augi tiek zīmēti plānā: **automātiski** (rupjāks par 1:500 — riņķis pēc izplatības; starp 1:200 un 1:500 — kontūra ar centru; smalkāks — detalizētais simbols; abus mērogus var mainīt) vai viens līmenis visiem mērogiem. Lapu dialogam ir savs **Augu detalizācija plānā** šim komplektam.

Ierakstam sadaļā Augi {{ui:Savs simbols…}} nolasa SVG vai DXF/DWG zīmējuma bloku un zīmē to auga izplatībā detalizētajā līmenī. {{ui:Savs 3D modelis…}} nolasa OBJ, STL vai GLB; augu grafikā izvēlieties **Katra ieraksta savs modelis**, lai to redzētu 3D. Failiem ir ierobežojumi (512 KB SVG, 2000 formu, 50 000 trijstūru), un tie tiek glabāti projektā. SVG pārveidojumi netiek lietoti (jūs tiek informēts, ja failam tie ir). Skat. [Augu grafika, jūsu simboli un 3D augi](topic:plant-graphics) par līmeņiem, ierobežojumiem un to, ko GLB drīkst saturēt.
