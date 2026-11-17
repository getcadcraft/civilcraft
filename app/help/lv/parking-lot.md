---
title: Stāvlaukuma izkārtojums
summary: Izkārtojiet stāvvietas, braukšanas joslas, pieejamās un furgonu vietas un salas kontūras iekšienē, izveidojiet stāvlaukuma vertikālo plānojumu ar nogāzēm uz drenāžu pret esošo reljefu, pēc tam izbrūģējiet un iestādiet to. Pieejams arī palīgam.
keywords: stāvvieta, stāvlaukums, vieta, josla, pieejams, ada, furgons, sala, drenāža, nogāze, vertikālā plānošana, izrakums, uzbērums, segums, bruģakmens, stādīšana, koks, reljefs, punktu mākonis, mcp, palīgs
from: 06c14da9
---

Ievietojiet stāvlaukumu zemesgabalā, platformā vai slēgtā raksturīgā līnijā un iegūstiet skaitus, vertikālo plānojumu un segumu vienā solī.

## Izkārtojums

1. Plānā atlasiet zemesgabalu, platformu vai slēgtu raksturīgo līniju.
2. Atveriet **Virsma, Vairāk, Stāvlaukums...**
3. Izvēlieties noteikumus, stāvvietas leņķi (90, 75, 60, 45, 30 grādi vai paralēli) un vienvirziena vai divvirzienu braukšanas joslas. Stāvvietu, joslu un salu izmēri sākas no tabulas, un katru var pārrakstīt.
4. Izvēlieties **Izkārtot**.

Rindas iet pa kontūras malu, kas dod visvairāk stāvvietu (vai pa leņķi, ko ierakstāt). Stāvvieta tiek skaitīta tikai tad, ja tā pilnībā atrodas kontūras iekšpusē. Ja vietas atlikušas vienai rindai un joslai, tiek pievienota vienpusēja josla. Logā uzskaitītas vietas, pieejamās un furgonu vietas, salas, drenāža un laukums uz vietu, un plānā stāvvietas, pieejamās vietas ar to šrafētajām piekļuves joslām, salas, joslu centra līnijas un drenāža ir redzamas savos slāņos (C-PARK-...), tāpēc tās nonāk PDF, DXF un DWG.

## Pieejamās vietas

Ar ASV noteikumiem skaits seko 2010. gada ADA standartu tabulai 208.2 nodrošinātajām vietām (viena no sešām, noapaļota uz augšu, ir furgonu vieta), novietotām vistuvāk kontūras pirmajam stūrim (ieejai), katra ar piekļuves joslu; divas dalās ar vienu. Stāvvieta, kas šaurāka par pieejamo platumu, vai nogāze, stāvāka par 1:48 pieejamajās vietās, tiek rādīta kā problēma. **Šie skaitļi ierakstīti no standarta, kā to atceras, un nav pārbaudīti pret drukāto standartu.** Tipiskie stāvvietu un joslu izmēri ir no stāvlaukumu projektēšanas rokasgrāmatām, un arī tie nav pārbaudīti. Pārbaudiet abus un savus vietējos noteikumus, pirms uz tiem paļaujaties. Izvēlieties **Pielāgots**, lai ievadītu savu pieejamo vietu skaitu.

## Nogāzes uz drenāžu, izrakums un uzbērums

Ja to neizslēdzat, stāvlaukums kļūst par vertikālās plānošanas zonu darba telpā **Ainavas**. Drenāžas tiek novietotas pa joslu centra līnijām aptuveni ik pēc 100 pēdām (30 m); virsma paceļas no katras drenāžas ar nogāzi, kuru norādāt (sākumā 1.5 procenti), tātad katrs punkts noslīd uz tuvāko drenāžu. Līmenis tiek izvēlēts tā, lai stāvlaukuma izrakums un uzbērums būtu līdzsvarā ar esošo reljefu. Esošais reljefs ir projekta esošā virsma, kas var nākt no uzmērījuma punktiem, LandXML, lidāra vai skenēšanas punktu mākoņa, kas pārvērsts virsmā, vai horizontālēm. Logā redzams izrakuma un uzbēruma aprēķins; projekta paši tilpumi pēc tam rāda precīzu skaitli. Vertikālās plānošanas zona saglabā savu malu uz esošā reljefa, tāpēc, ja jaunā virsma malā atšķiras no reljefa, rodas pakāpe, un logs norāda, cik liela tā ir.

## Segums un stādīšana

Visa kontūra saņem bruģakmens segumu (rindu rakstu, ko var mainīt sadaļā **Ainavas**, **Cietie elementi**), un katra sala saņem krūmu dobi un, ja tā ir pietiekami plata, koku, ko ņem no augu saraksta. Pēc tam viss ir parasts Ainavas objekts: rediģējiet to vai izvēlieties **Izkārtot vēlreiz**, lai aizstātu to, ko stāvlaukums izveidoja. Stāvlaukuma noņemšana noņem to, ko tas izveidoja.

## No palīga

To pašu stāvlaukumu var pieprasīt caur MCP: `parking_layout` priekšskatījums, `parking_build` ieraksta, `parking_remove` noņem stāvlaukumu. Pieprasiet pēc zemesgabala nosaukuma vai nosūtiet kontūru.

## Kas nav izdarīts

Netiek pārbaudīts, vai joslas sasniedz ielu. Segums aptver visu kontūru, tāpēc tā laukumā ietilpst salas. Segumu materiālu izvēle no Bibliotēkas un Bibliotēkas tips stāvvietām nav izveidoti; segumu raksts ir no sadaļas Cietie elementi. Citu valstu noteikumi nav izveidoti.
