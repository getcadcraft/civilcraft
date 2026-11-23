---
title: WaterCraft: forbruk, brannvann, avbrudd og vannalder
summary: Med tillegget WaterCraft gjør du kunder om til forbruk på vannledningene dine, kontrollerer strømmen som er tilgjengelig ved hver brannhydrant, ser hvilket hovedledningsavbrudd som gjør mest skade, og følger vannalder og klor gjennom et døgn.
keywords: watercraft, vannfordeling, forbruk, kunder, toppfaktor, forbruksmønster, brannvann, brannhydrant, restrykk, kritikalitet, avbrudd, ventilseksjon, vannalder, klor, rest, kildesporing, blindende, csv, tillegg
from: 066fb17a
---

WaterCraft er et tillegg som virker på vannnettet du allerede har tegnet med verktøyene for vannledninger. Det legger til en fane i høyre panel med fire seksjoner.

:::warning
Bare et beregningshjelpemiddel. Det er kontrollert mot håndberegnede svar på oppdiktede nett, ikke mot en ekte modell for et vannverk. En vannfaglig ingeniør må kontrollere hvert resultat. Scenarier, styringsregler, ventiler og feltavlesninger har egne emner, «Scenarier» og «Studier», i hjelpen for WaterCraft-tillegget.
:::

## Dette gjør du

- Legg kunder inn i nettet som forbruk.
- Finn hydrantene som ikke når strømmen du trenger.
- Finn ledningene hvis avbrudd betyr mest.
- Finn gammelt vann og lav klorkonsentrasjon.

## Fremgangsmåte

1. Åpne {{ui:Innstillinger}} › {{ui:Tillegg}} og slå på {{ui:WaterCraft (vannfordeling)}}. En fane for {{ui:WaterCraft}} vises i høyre panel.
2. Tegn først et reservoar, kryss og rør med verktøyene for vannledninger (se [Vannledninger](topic:water-mains)). Uten et nett forteller fanen deg å gjøre det.
3. Under {{ui:Forbruk}} limer du inn én kunde per linje: id, x, y, type, mengde. Velg {{ui:Toppfaktor}} og {{ui:Timemønster}} (boligdøgn, næringsdøgn, flatt, eller behold mønsteret slik det er). Trykk {{ui:Kontroller}} for å se hvor hver kunde havner (nærmeste kryss), deretter {{ui:Legg inn i nettet}}. Angre tar forbruket tilbake.
4. Under {{ui:Brannvann}} angir du nødvendig strøm og restrykk, velger om restrykket holdes {{ui:Bare ved brannhydranten}} eller {{ui:Overalt i systemet (strengere)}}, og trykker {{ui:Lengde}}. Hver hydrant listes dårligst først, som «oppfyller» eller «under».
5. Under {{ui:Hvilken hovedledning betyr mest}} velger du {{ui:ett rør om gangen}} eller {{ui:én ventilert seksjon om gangen}} og trykker {{ui:Lengde}}. Hvert avbrudd viser forbruket som kobles fra, kryssene som kobles fra, kryssene som nylig kommer under minimumstrykket, og det laveste trykket som gjenstår.
6. Under {{ui:Vannalder og klor}} velger du hva du vil følge (vannalder, klor eller en kildesporing), angir timene som skal kjøres og grensene du ønsker, og trykker {{ui:Lengde}}. Kryss utenfor grensene dine listes opp.
7. Trykk {{ui:Lagre som CSV}} under en tabell for å beholde den.

## Merknader

- Nødvendig brannvannsstrøm og forbruk per bolig eller per acre er startverdier, ikke normer. Bruk ditt vannverks egne tall.
- Et rør som er delvis avskåret av en ventil, stenges helt, så avbruddet som vises, er litt verre enn et ekte.
- Kjør vannkvalitetsdelen lenge nok til at døgnmønsteret gjentar seg før du leser den siste dagen.
- {{ui:Stopp}} avslutter en lang kjøring tidlig; listen viser da bare det som ble gjort.
- Nettet ditt blir i dette prosjektet og på denne datamaskinen. Ingenting sendes noe sted.
