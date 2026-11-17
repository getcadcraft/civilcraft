---
title: Transportlīdzekļa apgrieziena trajektorijas
summary: Vadīt transportlīdzekli ar līdz trim piekabēm pa elementa līniju vai trasi, uz priekšu vai atpakaļgaitā, un redzēt aizņemto zonu, tā riteņu trajektorijas, stūres leņķi un vietu, kur piekabe saliecas.
keywords: apgrieziena trajektorija, pagrieziena trajektorija, transportlīdzekļa izsekošana, pagrieziena šablons, projektētais transportlīdzeklis, kravas auto, autobuss, piekabe, puspiekabe, atpakaļgaita, salocīšanās, locīšanās, stūres bloķējums, nobīde no trajektorijas, riteņa trajektorija, iekraušanas rampa, pagrieziena rādiuss
from: 8caafb8a
---

Apgrieziena trajektorija virza transportlīdzekli pa līniju un parāda zemi, pāri kurai iet tā korpuss. Izmantojiet to, lai pārbaudītu, vai kravas automašīna var pagriezties stūrī, nokļūt līdz iekraušanas rampai vai atpakaļ ievietot piekabi bez braukšanas ārpus seguma.

## Vadīt transportlīdzekli pa līniju

1. Uzzīmējiet līniju, pa kuru brauc transportlīdzeklis, braukšanas virzienā: elementa līniju (loki ir pieļaujami: zīmējot nospiediet {{key:C}}, skatiet [Elementa līnijas](topic:feature-lines)) vai trasi.
2. Atlasiet to un noklikšķiniet uz {{ui:Apgrieziena trajektorija…}} tā **Rekvizītos**.
3. Sadaļā **Sākt no** izvēlieties transportlīdzekli, tad iestatiet tā izmērus no sava projektētā transportlīdzekļa: platums, priekšējais uzkaras, riteņbāze, aizmugurējais uzkaras, sliežu platums un **Stūres bloķējums**. Pievienojiet līdz trim piekabēm, katrai norādot, kur tā ir pieķerta, tās garumu no pieķeres līdz asij, uzkaras un savu **Lielāko locīšanos**.
4. Izvēlieties **Braukšana**: uz priekšu vai atpakaļgaitā. Noklikšķiniet uz {{ui:Izbraukt}}.

:::warning
Transportlīdzekļi, no kuriem sākt, ir vietturi, nevis standarts. Iestatiet izmērus pēc projektētā transportlīdzekļa, ko izmanto jūsu projekts.
:::

## Uz priekšu un atpakaļgaitā

| Braukšana | Kas seko līnijai | Ko CivilCraft aprēķina |
|---|---|---|
| **Uz priekšu** | Priekšējās ass centrs | Kur iet aizmugurējā ass un katra piekabe, stūres leņķis un locīšanās |
| **Atpakaļgaitā** | Pēdējās ass centrs (piekabes aizmugure) | Kur iet katra vienība priekšā un kādu stūri kabīnei vajag, lai tur novietotu piekabi |

Atpakaļgaitas kustību pārbauda šādi: norādiet, kur piekabei jāatrodas, un CivilCraft pasaka, vai kabīne to var izdarīt.

## Rezultāta nolasīšana

Apgrieziena trajektorija plānā zīmēta oranžā: tās kontūra un, punktētā līnijā, malējo riteņu trajektorijas. Atlasiet to (noklikšķiniet tās iekšpusē), lai redzētu **Rekvizītos**:

- **Nobrauktais garums**, lielākais **Stūres** leņķis un **Locīšanās** pret to ierobežojumiem, un **Aizņemtā platība**.
- Jebkura problēma pa līniju ar attālumu: stūre aiz bloķējuma vai piekabe, kas pagriežas aiz savas locīšanās robežas (tā saliecas).
- **Transportlīdzeklis pa līniju**: pārvietojiet slīdni, lai redzētu transportlīdzekli jebkurā punktā, ar tā stūri un locīšanos tur.

Mainiet līniju, un apgrieziena trajektorija seko. {{ui:Rediģēt transportlīdzekli…}} maina izmērus; **Braukšana** pārslēdz starp uz priekšu un atpakaļgaitā. Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc. {{key:Delete}} dzēš atlasīto apgrieziena trajektoriju (līnija paliek).

Kontūra un riteņu trajektorijas tiek ievietotas PDF, DXF un DWG failos slānī C-ROAD-SWPT.

## Kā tas tiek aprēķināts

Katra vienība pagriežas ap savas aizmugurējās ass līniju un tiek vilkta ar punktu tai priekšā (priekšējo asi vai pieķeri), zemas ātruma, bez slīdēšanas modeli, ko izmanto apgrieziena trajektoriju pārbaudēs. Aizņemtā platība ir visu pozīciju korpusa kontūru kopums. Tas nemodelē ātrumu, riepu slīdēšanu, laiku, ko stūre prasa, lai pagrieztos, stūrējamās piekabes vai brīvo atstatumu zem korpusa.
