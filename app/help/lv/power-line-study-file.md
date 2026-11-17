---
title: Pētījumu faili citai līniju programmai (.DON)
summary: Saglabājiet vienu gaisvadu līniju kā .DON pētījuma failu vai nolasiet tās balstus jaunā līnijā. Nav pārbaudīts ar programmu, kas tos lasa.
keywords: don, .don, pētījuma fails, xml, eksportēt, importēt, gaisvadu līniju programma, vilkšana, canton
from: 1abc4d07
---

Dažas gaisvadu līniju programmas glabā pētījumu `.DON` failā (XML teksts). CivilCraft var ierakstīt vienu līniju kā šādu failu un nolasīt cita faila balstus.

:::warning
**Nav pārbaudīts.** Mēs to izveidojām pēc lietotāja kopīgota saraksta ar formāta lauku nosaukumiem, nevis no reāla faila, un neesam atvēruši mūsu failus programmā, kas tos lasa. Atveriet failu tur un pārbaudiet katru vērtību, pirms paļaujaties uz to. Ja varat kopīgot `.DON` failu (noņemot klienta datus), tas palīdz mums to izlabot.
:::

## Pētījuma faila saglabāšana

1. Piešķiriet līnijai vadītāju un pārliecinieties, ka tai ir rezultāti (rekvizītos nav „nav aprēķināts”).
2. {{ui:Vairāk}} › {{ui:Saglabāt pētījuma failu (.DON)…}}, izvēlieties līniju, pievienojiet aprakstu un darba numuru.
3. {{ui:Saglabāt pētījuma failu}}.

Failā ir līnijas balsti (koordinātas, terēns, augstumi, lomas, šķērssija, balsts, kas saglabāts vai ieteikts, slodzes pa slodzes gadījumiem, pamats), viena sadaļa katram posmam starp galiem (vadītājs, spriegums, noteicošais posms, posmi, spriegums un katenāras parametrs, lielākais spriegums pa slodzes gadījumiem) un vilkšanas tabulas. Garumi ir metros, spēki daN; teksts tiek rakstīts Latin-1, tāpēc rakstzīme ārpus tās kļūst par `?`.

## Pētījuma faila nolasīšana

{{ui:Vairāk}} › {{ui:Atvērt pētījuma failu (.DON)…}} nolasa balstus jaunā līnijā. Vadītājs, balsti un šķērssijas tiek sasaistītas ar jūsu bibliotēku pēc nosaukuma; kas nav atrasts, tiek atstāts, lai jūs izvēlaties rekvizītos.
