---
title: Dārza projektēšana no sākuma līdz beigām
summary: Ainavu arhitekta desmit soļi no uzmērījuma līdz publicētajam komplektam, ar to, ko ainavu darbvieta šodien dara katrā solī un ko vēl nedara.
keywords: pamācība, soli pa solim, kā, ainavu projektēšana, dārza projektēšana, darba sākums, piemērs, paraugs, uzmērījums, līnijas, reljefs, stādīšana, specifikācija, lapas, publicēšana, viens projekts
from: 87900bf5
---

Ainavu projekts iet pa apli: uzmērījums, skice, līnijas, zeme, laukumi, līmeņi, stādīšana, specifikācijas, lapas un atpakaļ. Šeit ir desmit soļi un tas, kas katram no tiem jau ir. Ja solim ir trūkums, tas minēts beigās sadaļā **Vēl nav izveidots**, nevis paslēpts solī.

Varat sekot līdzi parauga objektā vai savā uzmērījuma rasējumā. Ar savu rasējumu sāciet no 1. soļa.

## 1. Ievietojiet uzmērījumu

{{ui:Surface}} › {{ui:Linework from a drawing…}}, izvēlieties uzmērījuma rasējumu (DWG 2000–2018 vai DXF). Pārbaudiet mērvienības, virsmai paņemiet horizontāles, 3D polilīnijas un robežu, bet punktu blokus — kā uzmērījuma punktus. Sadaļa **Uzmērījuma līmeņi un pārbaude** pirms kaut kā pievienošanas nolasa tekstā vai atribūtā ierakstītos līmeņus un uzskaita, kas šķiet nepareizs (mērvienības, koordinātu sistēma, attālums no nulles, plakanas horizontāles, dīvaini līmeņi, dubultoti punkti). Skatiet [Uzmērījuma rasējuma pārbaude importējot](topic:survey-check) un [DWG vai DXF atvēršana kā līnijas](topic:open-dwg-dxf). Koordinātu sistēmu iestatiet ar {{ui:Coordinate system…}}.

## 2. Skices ar roku

Lapa uz papīra, piemēram, vecs uzmērījums vai atzīmēta izdruka, tiek ievietota ar {{ui:Scan…}} (Sākt no skenējuma): to novieto mērogā vai pēc zināmām koordinātām zem plāna, un to var apvilkt kā līnijas. ModelCraft nolasa skices ar roku fotogrāfiju (Fails › Importēt skices fotogrāfiju…). Pats CivilCraft rīka skicei ar roku nedod: novietojiet lapu zem plāna un zīmējiet pāri tai.

## 3. No skices uz līnijām

Zīmējiet elementu līnijas un kontūras pār uzmērījumu CivilCraft vai zīmējiet 2D rasējumā. Ainava › Vairāk › {{ui:From a line}} pārvērš līniju par segumu, stādījumu laukumu, sienu, kāpnēm, elementa līniju un citu, saistītu ar šo līniju: pārvietojot līniju, objekts seko. Skatiet [Objekti no līnijām](topic:objects-from-lines). SuperCad Studio programmā atveriet objektu, rasējumu un ēkas modeli vienā projektā: **Ainavu darbvieta** ietver visu trīs rīkus, un 2D rasējumā izvēlēta līnija var kļūt par ainavu objektu, kas tai seko (Ctrl+K, {{ui:Ainavu objekts no izvēlētās rasējuma līnijas}}).

## 4. Projektētā zeme

Atveriet {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Projektēto zemi veidojiet ar {{ui:Platform}}, {{ui:Berm}}, {{ui:Swale}} un reljefa laukumiem ar punktveida līmeņiem un horizontālēm; bruģējums, celiņi, sienas, nogāzes un kāpnes, ko pievienojat, tiek pielāgoti tai pašai projektētajai virsmai. Esošā zeme nemainās nekad. {{ui:Levels}} › {{ui:Ground modifiers…}} uzskaita visu, kas veido zemi, vienā kārtībā, ar izrakumu un uzbērumu katram. Skatiet [Vertikālo plānošanu](topic:landscape-grading) un [Zemes modifikatori un dzīvie līmeņi](topic:ground-modifiers).

## 5. Bruģējums un stādījumu laukumi

{{ui:Hardscape}} › {{ui:Paving}}, {{ui:Path}}, {{ui:Wall}}, {{ui:Kerb}}, {{ui:Ramp}} un {{ui:Steps}}. {{ui:Areas}} zīmē zālienu, dobi, pļavu vai segzāli ar tā konstrukciju; tas pats apgriežas ap bruģējumu, sienām un kāpnēm. {{ui:Bed}} aizpilda laukumu ar augu attālumu no augu maisījuma. Skatiet [Cietais segums](topic:hardscape), [Stādījumu laukumi](topic:planted-areas) un [Stādīšana](topic:planting).

## 6. Līmeņi, slīpumi un savienojumi

Sadaļā **Vertikālās plānošanas pārbaudes** atzīmējiet **Slīpuma analīze** un **Plūsmas bultiņas un ūdens uzkrāšanās**. Ja ūdens uzkrājas pie terases, apkārt tai pievienojiet {{ui:Swale}}. Rekvizīti parāda, cik pakāpienu kāpnēm vajadzīgs un vai tie ietilpst, un kur celiņš ir stāvāks par savu ierobežojumu. Problēmu panelis uzskaita, kur objekti savienojas slikti: siena ir pārāk augsta, dobe ir virs bruģējuma, kāpnes nesasniedz savu laukumu. {{ui:Spot level}} un {{ui:Gradient arrow}} atzīmē zemi un atjaunina sevi paši.

## 7. Stādīšana

Sadaļā **Augi** meklējiet augu sarakstā (dažus simtus sugu vai savu sarakstu), izvēlieties vienu un izmantojiet {{ui:Plant}}, {{ui:Bed}} vai {{ui:Hedge}}. Auga izmēru un uzrakstus iestatiet sadaļā Vairāk. Vairāk › {{ui:Plant table}} rediģē jūsu pašu ierakstus: šķirnes, piegādātos izmērus, blīvumu, specifikācijas piezīmes. Katrs ieraksts var saturēt jūsu pašu simbolu un 3D modeli (OBJ, STL vai GLB), un Vairāk › {{ui:Plant graphics}} lielākos mērogos zīmē augus vienkāršāk. Skatiet [Augu saraksts](topic:plant-list), [Augu ieraksti](topic:plant-records) un [Augu grafika](topic:plant-graphics).

## 8. Daudzumi un specifikācijas

Vairāk › {{ui:Worksheets}}: augu un cietā seguma specifikācijas, kā arī jūsu pašu, paliek saistītas ar objektiem; saglabājiet tās kā CSV vai XLSX vai ievietojiet uz lapām (skatiet [Darblapas](topic:worksheets)). Vairāk › {{ui:Plant schedule…}} nosūta skaitus uz TakeoffCraft. Cietā seguma daudzumi ir bruģējuma, sienu un kāpņu rekvizītos. Laistīšanai ir savs materiālu saraksts: {{ui:Irrigation}} › **Pārbaudīt sistēmu…**. Skatiet [Laistīšana](topic:irrigation).

## 9. Rasējumi un lapas

Vairāk › {{ui:Landscape sheets…}}: stādīšanas, reljefa un laistīšanas plāni ar detaļām. {{ui:Levels}} › {{ui:Section line}} zīmē griezumus caur zemi, sienām, konstrukcijām, kāpnēm un augiem. Skatiet [Ainavu lapas](topic:landscape-sheets) un [Griezumi un publicējamais komplekts](topic:landscape-sections).

## 10. Publicēšana

{{ui:Publish set (.zip)}} lapu dialogā izveido vienu PDF ar lapu sarakstu un DWG katrai lapai. Vairāk › {{ui:Export landscape IFC}} nodod BimCraft augus un cieto segumu. Saglabājiet projektu: viss ir vienā failā.

## Mainiet vienu lietu: kāpnes

Ideja, ka viss ir vienā projektā, ir tāda, ka izmaiņa tiek pārnesta tālāk. Izmēģiniet to ar kāpņu posmu starp divām terasēm:

1. Zīmējiet posma līniju kā elementa līniju (vai līniju rasējumā), tad Ainava › Vairāk › {{ui:From a line}} › {{ui:Steps}}. Kāpņu rekvizītos atzīmējiet **Veido zemi** un iestatiet augšējo un apakšējo līmeni uz abām terasēm.
2. Zīmējiet stādījumu dobi blakus kāpnēm un zem tām ar {{ui:Areas}}, bet bruģējumu uzklājiet uz terasēm. Dobe apgriežas ap kāpnēm un bruģējumu, un augu specifikācija skaita tikai to, kas ir iestādīts.
3. Paaugstiniet posma augšējo līmeni rekvizītos. Projektētā zeme, punktveida līmeņi, slīpuma bultiņas un izrakums un uzbērums mainās uzreiz. Ja posms vairs nesasniedz augšējo terasi, Problēmu panelis parāda, par cik.
4. Pārvietojiet posma līniju. Kāpnes seko savai līnijai tajā pašā atsaukšanas solī; dobe atkal tiek apgriezta un pārskaitīta, un darblapas un specifikācijas rāda jaunos skaitļus.
5. Nospiediet Ctrl+Z vienreiz: līnija, kāpnes, zeme un dobe atgriežas kopā.

Skatiet [Zemes modifikatori un dzīvie līmeņi](topic:ground-modifiers), [Stādījumu laukumi](topic:planted-areas) un [Darblapas](topic:worksheets).

## Vēl nav izveidots

Šie ir pieprasīti, bet šajā versijā nav:

- Sienas, kas veido zemi (tās ziņo, kur savienojas ar zemi, un to augša var sekot tai).
- Savā bibliotēkas augu sarakstā rediģēšana lietotnē (rediģējiet projekta sarakstu un saglabājiet to kā augu failu).
- Savu GLB augu modeļu tekstūras un krāsas (forma tiek nolasīta; tiek izmantota auga krāsa).

Visiem rīkiem skatiet [Ainavu darbvieta](topic:landscape).
