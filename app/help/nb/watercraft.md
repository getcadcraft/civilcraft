---
title: WaterCraft: forbruk, brannvann, avbrudd og vannalder
summary: Med tillegget WaterCraft gjør du kunder om til forbruk på vannledningene dine, sjekker vannmengden som finnes ved hver brannhydrant, ser hvilket ledningsavbrudd som gjør mest skade, og følger vannalder og klor gjennom et døgn.
keywords: watercraft, vannfordeling, forbruk, kunder, toppfaktor, forbruksmønster, brannvann, brannhydrant, restrykk, kritikalitet, avbrudd, avstengt seksjon, vannalder, klor, rest, kildesporing, blindledning, csv, tillegg
from: 76809f01
---

WaterCraft er et tillegg som virker på vannnettet du allerede har tegnet med verktøyene for Vannledninger. Det legger til en fane i panelet til høyre med fire seksjoner.

:::warning
Kun et beregningshjelpemiddel. Det er kontrollert mot håndberegninger på oppdiktede nett, ikke på en ekte modell fra et vannverk. En vannekspert må kontrollere alle resultater. Det finnes ingen trykkøkningsstasjoner, ingen annenordens nedbrytning og ingen scenarioer ennå.
:::

## Hva du skal gjøre

- Legg kunder inn i nettet som forbruk.
- Finn hydrantene som ikke når den vannmengden som trengs.
- Finn ledningene der et avbrudd betyr mest.
- Finn gammelt vann og lavt klorinnhold.

## Steg

1. Åpne {{ui:Innstillinger}} › {{ui:Tillegg}} og slå på {{ui:WaterCraft (vannfordeling)}}. En fane for WaterCraft vises i panelet til høyre.
2. Tegn først et reservoar, knutepunkter og rør med verktøyene for Vannledninger (se [Vannledninger](topic:water-mains)). Uten et nett viser fanen en melding om at dette må gjøres først.
3. Under {{ui:Forbruk}} limes én kunde inn per linje: id, x, y, type, mengde. Velg {{ui:Toppfaktor}} og {{ui:Timemønster}} (boligdag, næringsdag, jevnt, eller behold mønsteret som det er). Trykk {{ui:Kontroller}} for å se hvor hver kunde havner (nærmeste knutepunkt), og deretter {{ui:Legg inn i nettet}}. {{ui:Angre}} tar forbruket tilbake.
4. Under {{ui:Brannvann}} angis nødvendig vannmengde og restrykket, velg om restrykket holdes {{ui:Bare ved hydranten}} eller {{ui:Overalt i systemet (strengere)}}, og trykk {{ui:Lengde}}. Hver hydrant listes med den verste først, som «oppfyller» eller «for lite».
5. Under {{ui:Hvilken hovedledning som betyr mest}} velges {{ui:én ledning om gangen}} eller {{ui:én avstengt seksjon om gangen}}, og det trykkes {{ui:Lengde}}. Hvert avbrudd viser forbruket som kobles fra, knutepunktene som kobles fra, knutepunktene som nå får under minimumstrykket, og det laveste trykket som gjenstår.
6. Under {{ui:Vannalder og klor}} velges hva som skal følges (vannalder, klor eller kildesporing), angi timene som skal kjøres og grensene som ønskes, og trykk {{ui:Lengde}}. Knutepunkter utenfor grensene listes.
7. Trykk {{ui:Lagre som CSV}} under en hvilken som helst tabell for å beholde den.

## Merknader

- Nødvendig brannvann og bruk per bolig eller per acre er utgangsverdier, ikke standarder. Bruk vannverkets egne tall.
- En ledning som delvis er avstengt av en ventil, regnes som helt stengt, så avbruddet som vises er litt verre enn et reelt avbrudd.
- Kjør vannkvalitetsseksjonen lenge nok til at døgnmønsteret gjentar seg før den siste dagen leses.
- {{ui:Stopp}} avslutter en lang kjøring tidlig; listen viser da bare det som ble gjort.
- Nettet blir værende i dette prosjektet og på denne datamaskinen. Ingenting sendes noe sted.
