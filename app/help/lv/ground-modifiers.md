---
title: Zemes modifikatori un dzīvie līmeņi
summary: Viss, kas veido projektēto zemi vienā sakārtotā sarakstā (vēlākais uzvar, kur pārklājas), izrakums un uzbērums katram modifikatoram, savienojumu pārbaudes Problēmu panelī un punktveida līmeņi un slīpuma bultiņas, kas nolasa zemi reāllaikā.
keywords: zemes modifikatori, secība, kārtība, projektētā zeme, esošā zeme, pārklāšanās, izrakums un uzbērums, savienojums, atbalstsiena, seguma mala, gultnes līmenis, kāpņu laukums, punktveida līmenis, punktveida augstums, slīpuma bultiņa, slīpuma uzraksts, kritums
from: 3998a5b0
---

Projektētā zeme = esošā zeme + modifikatori secībā. Esošā zeme nekad netiek mainīta.

## Saraksts

{{ui:Līmeņi}} › {{ui:Zemes modifikatori…}} uzskaita katru objektu, kas veido zemi: platformas, uzbērtnes, zemesgrāvjus, vertikālās plānošanas laukumus, segumus un ceļus, stādījumu laukumus ar gala līmeni, kā arī kāpnes un rampas, kuru lodziņš **Veido zemi** ir atzīmēts (ar to apakšējo un augšējo līmeni). Kur divi pārklājas, **vēlākais** uzvar. Velciet rindu vai izmantojiet bultiņas, lai mainītu secību; zeme tiek pārveidota uzreiz. Katrā rindā redzams tās izrakums un uzbērums (ko tā veido pēc tiem, kas ir virs tās), un zem saraksta — kopsumma.

## Savienojumu pārbaudes

Problēmu panelis ar **Doties uz** uzskaita:

- sienu, kuras augstākā puse ir augstāk par tās augšu (augsne pāri sienai), vai kuras zemākā puse rāda tās pamatu;
- stādījumu laukumu, kura gala līmenis ir augstāk par seguma malu, ar ko tas saskaras, vai vairāk nekā tipiskie 150 mm zem tās;
- kāpnes, kuru apakša vai augša nesaskaras ar segumu, uz kura tās nolaižas;
- divus modifikatorus, kas pārklājas (tur uzvar vēlākais).

Atbalstsienas augšējā mala var sekot zemes augstākajai pusei: tās augstums tiek aprēķināts no jauna katru reizi, kad mainās zeme.

## Atbalstsiena, kas veido zemi

Atlasiet atbalstsienu un atzīmējiet **Veido zemi**. Josla zem sienas (tik plata, cik siena ir bieza) pievienojas sarakstam kā modifikators:

- augstās puses mala tiek turēta pie zemes tajā vietā, pikets pēc piketa, tāpēc sienas augša seko augstākajai pusei (ar virsējo segu augšā). Ievadiet līmeni **Augša**, un augstākā puse tiek turēta šajā līmenī, atskaitot virsējo segu;
- zemākās puses mala tiek turēta līmenī **Zemākajā pusē turēta zeme**, ko ievadāt, vai, ja tas ir tukšs, zemes līmenī tajā vietā;
- augstākā puse ir tā, kuras zeme visā sienā ir augstāka, tāpēc tā nekad neapmainās gar sienu;
- zeme aiz joslas netiek mainīta, un esošā zeme nekad netiek mainīta.

Kā jebkurš modifikators tā atrodas sarakstā, un modifikators aiz tā uzvar, kur tie pārklājas. Siena, kuras turētais līmenis kādā galā ir vairāk nekā tipiskie 150 mm no esošās zemes tajā vietā, saņem brīdinājumu Problēmu panelī (ar **Doties uz**). Brīvi stāvoša siena zemi neveido. Lodziņš ir izslēgts failos no agrākām versijām, tāpēc tie tiek atvērti tādi, kādi bija.

## Punktveida līmeņi un slīpuma bultiņas

{{ui:Punktveida līmenis}} (viens klikšķis) un {{ui:Slīpuma bultiņa}} (divi klikšķi) nolasa zemi katru reizi, kad tie tiek zīmēti: ja pārvietojat vai maināt līmeni objektam, uzraksti seko. Rekvizītos izvēlieties, vai uzraksts nolasa projektēto vai esošo zemi; esošās zemes uzraksti tiek rādīti iekavās. Bultiņas norāda lejup pa nogāzi un rāda tekstu `1:20 (5.0 %)`.
