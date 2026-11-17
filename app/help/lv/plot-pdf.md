---
title: Plāna izdrukāšana PDF formātā
summary: Izdrukāt visu vai pašreizējo skatu vektoru PDF formātā standarta lapā inženierijas vai metriskā mērogā, slāņu krāsās vai melnā.
keywords: izdruka, drukāšana, pdf, lapa, mērogs, papīra izmērs, plāna lapa, publicēšana, virsraksta josla, ziemeļbultiņa, mēroga josla
from: 9af396ca
---

{{ui:PDF}} izdrukā plānu vektoru PDF failā uz vienas lapas ar virsraksta joslu, ziemeļbultiņu un mēroga joslu. PDF tiek izveidots pārlūkprogrammā un lejupielādēts; tas neiet caur pārlūka drukāšanas dialogu.

## Izdrukāšana

1. Iestatiet plānu sadaļā **Attēlojums**: rādītā virsma, horizontāļu intervāls un kas ir ieslēgts. Izdruka seko šiem iestatījumiem.
2. Ja vēlaties tikai daļu no objekta, tuviniet un panoramējiet plānu uz to.
3. Noklikšķiniet uz {{ui:PDF}} grupā **Eksportēt** vai nospiediet {{key:Mod+P}}.
   Atveras dialogs **Plāna izdrukāšana PDF formātā**.
4. Izvēlieties **Apgabals**: {{ui:Viss}} vai {{ui:Ekrānā redzamais}}.
5. Izvēlieties **Papīrs**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 vai A1. Projekts pēdās sākas ar Tabloid, projekts metros — ar A3. Lapas vienmēr ir ainavas orientācijā.
6. Izvēlieties **Mērogs**. Sarakstā lielākais mērogs, kas ietilpst, atzīmēts ar "(ietilpst)" un tiek izvēlēts.
   - Pēdās: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metros: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Izvēlieties **Krāsa**: {{ui:Slāņu krāsas}} vai {{ui:Melna}}.
8. Izlasiet rindu zem izvēles. Tajā norādīts laukuma izmērs uz papīra un lapas izmērs, piemēram, "Laukums ir 297 × 222 mm pie 1" = 40' uz 432 × 279 mm lapas (ainavas orientācijā)."
9. Noklikšķiniet uz {{ui:Lejupielādēt PDF}}.
   Pārlūks lejupielādē `<name>.pdf`. Statusa joslā ir teikts "Izdrukāts <name>.pdf pie 1" = 40'."

Ja laukums ir lielāks par lapu izvēlētajā mērogā, izdruka tiek centrēta un malas tiek apgrieztas. Izvēlieties mērogu, kas atzīmēts "(ietilpst)", vai lielāku lapu.

## Kas ir uz lapas

- Plāns, centrēts zīmēšanas laukumā, kā īsti vektori: horizontāles, uzraksti, trases ar piketāžu, koridori, platformas un nogāžu līnijas, caurules, punkti.
- Līniju biezums pēc slāņiem: trases, platformas un caurules biezākas; trijstūri un papildhorizontāles smalkas.
- Virsraksta josla apakšā ar projekta **Nosaukums**, mērogu, piezīmi par horizontāļu intervālu un to, kura virsma (esošā vai izlīdzinātā), kā arī datumu un versiju labajā pusē.
- Ziemeļbultiņa augšējā labajā stūrī (plāna ziemeļi ir augšā) un mēroga josla virsraksta joslā.
- Kartes slāņi, kas rādīti zem plāna (attēls, kartes flīzes vai kartes pakalpojums), ja ir atzīmēts **Kartes slāņi zem plāna**: tie tiek zīmēti kā viens attēls visam zīmēšanas laukumam ar 150 dpi, zem līnijām, un kartes autortiesību norāde iet virsraksta joslā. CivilCraft līdz 8 sekundēm gaida kartes attēlus, kas vēl ierodas; ja daži vēl trūkst, statusa josla par to informē.

Tekstā tiek izmantots PDF iebūvētais Helvetica fonts. Rakstzīmes ārpus Rietumeiropas kopas (Windows-1252) tiek drukātas kā "?", un statusa ziņojums tās saskaita.

## Kas netiek izdrukāts

- Augstuma joslas.
- Profila skats. Profilu izdrukāšana vēl nav pieejama.
- Vairāk nekā viena lapa (trasei izmantojiet [plāna un profila lapas](topic:plan-profile-sheets)), skatlogi, pielāgots virsraksta bloks vai portreta orientācijas lapas.

:::note
Dialogā norādīts, ka nogāžu bultiņas ir tikai ekrānā. Šajā versijā nogāžu bultiņas, kas ieslēgtas sadaļā **Attēlojums**, tiek izdrukātas (un eksportētas uz DXF). Ja tās nevēlaties, pirms izdrukāšanas izslēdziet tās.
:::

## Drukāšana uz papīra

Atveriet lejupielādēto PDF jebkurā PDF skatītājā un drukājiet 100% (īstā izmērā), lai mērogs paliktu patiess. "Pielāgot lapai" maina mērogu.
