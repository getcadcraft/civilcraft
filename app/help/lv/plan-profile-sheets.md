---
title: Plāna un profila lapas
summary: Trases izdrukāšana kā plāna un profila lapu kopums vienā PDF failā ar savienojuma līnijām starp tām.
keywords: plāns un profils, lapas, izdrukāšana, pdf, savienojuma līnija, plānu sagatavošana, ceļu plāni, profila izdruka, vertikālais pārspīlējums, lapu komplekts
from: 34b4ec78
---

Plāna un profila lapas parasti tiek veidotas ceļu plāniem: katrā lapā ceļa posms ir attēlots divreiz — plāns augšā un profils apakšā, vienādā horizontālajā mērogā, tādēļ pikets abās daļās atrodas vienā un tajā pašā vietā.

## Lapu izveide

1. Atlasiet trasi. Sadaļā **Rekvizīti** noklikšķiniet uz {{ui:Plāna un profila lapas}}.
2. Izvēlieties **Papīru**, **Plāna mērogu** un **Profila pārspīlējumu** (cik reizes profils tiek zīmēts augstāks, nekā tas ir garš; sākumā 10×). Dialogā norādīts, cik lapu tas veido un cik daudz trases katra lapa parāda.
3. Lai izdrukātu daļu no trases, mainiet **No pikets** un **Līdz pikets**.
4. Noklikšķiniet uz {{ui:Lejupielādēt PDF}}. PDF failā ir viena lappuse katrai lapai.

## Kas ir uz lapas

| Daļa | Ko tā parāda |
|---|---|
| Plāns | Viss plānā (horizontāles, uzmērījuma punkti, trase un tās piketāža, koridori, platformas, raksturlīnijas, caurules, paraugu līnijas), pagriezts tā, lai šis posms iet pāri lapai, ar ziemeļbultiņu, pagriezta atbilstoši |
| Savienojuma līnijas | Strihpunktēta līnija, perpendikulāra trasei katrā galā, kur posms turpinās citā lapā, ar uzrakstu "Savienojuma līnija pik. 5+50.00, skat. 2. lapu" |
| Profils | Esošais reljefs (punktēts), projektētais profils (sarkans), katras tangentes slīpums un katras vertikālās līknes PVI, augstums, L un K; pikets apakšā, augstumi abās pusēs |
| Virsraksta josla | Projekta nosaukums, trase un tās piketu diapazons, "Lapa 1 no 3", horizontālais un vertikālais mērogs un pārspīlējums |

Posma garums katrā lapā ir tik garš, cik plāna logs atļauj mērogā, noapaļots uz leju līdz veselam 50 ft (20 m) garam posmam garos posmos vai līdz veselam 10 ft (5 m) īsos posmos.

:::note
Ja profila augstumi neiederētos izvēlētajā pārspīlējumā, CivilCraft zīmē katru lapu lielākajā no 10×, 5×, 4×, 2× un 1× vērtībām, kas ietilpst, un statusa joslā tas tiek norādīts. Izliekta trase tiek pagriezta atbilstoši virzienam no katra posma sākuma līdz beigām, tādēļ ceļš lapā var nedaudz celties vai krist.
:::
