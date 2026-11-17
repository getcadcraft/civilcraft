---
title: Beräkna dimensionerande spillvattenflöden och kontrollera avloppsledningen
summary: Ange de personer och det område som tillförs vid varje brunn i ett spillvattennät; CivilCraft summerar nedströms i nätet, beräknar toppflödet med en toppfaktor och tillskottsvatten och kontrollerar varje ledningsdels kapacitet och hastighet.
keywords: spillvatten, avlopp, spillvattenledning, avloppsvatten, dimensionerande flöde, toppflöde, toppfaktor, Harmon, Babbitt, tillskottsvatten, befolkning, per person, fyllnadsgrad, självrensande, hastighet, ledningsdimensionering, dimensioneringsblad
from: 73ba197a
---

Dimensionerande spillvattenflöden arbetar på [rörnätet](topic:pipe-network) när dess {{ui:Typ}} är {{ui:Spillvatten}}. Utan något markerat visar den högra panelen då **Dimensionerande spillvattenflöden** där ett dagvattennät visar dagvattendränering.

## Ange vad som kommer in

1. Markera en brunn. Under **Dimensionerande spillvattenflöden**, skriv in {{ui:Personer som tillförs här}} och {{ui:Område som tillförs här}} (hektar i ett metriskt projekt, acres i ett projekt i fot).
2. För butiker, kontor eller industri, skriv in ekvivalenta personer: området gånger de personer per hektar (eller acre) som din myndighet använder. Området räknas för tillskottsvatten i båda fallen.
3. Upprepa för varje brunn där en gata eller en tomt ansluter. En brunn där inget ansluter behåller båda på 0.

Varje ledning bär allt som tillförs vid dess övre brunn och ovanför den. Markera en brunn för att se vad som passerar genom den.

## Inställningarna

| Inställning | Vad det betyder |
|---|---|
| {{ui:Flöde per person}} | medelflödet för en person per dygn: liter (metriskt projekt) eller US-gallon (projekt i fot) |
| {{ui:Tillskottsvatten}} | grundvatten som läcker in: liter per sekund per hektar, eller gallon per dygn per acre |
| {{ui:Toppfaktor}} | Harmon, 1 + 14 / (4 + √P), eller Babbitt, 5 / P^0.2, med P befolkningen i tusental |
| {{ui:Toppfaktor minst}} / {{ui:Toppfaktor högst}} | faktorn hålls mellan dessa två |
| {{ui:Mannings n}} | för kapacitet och hastighet |
| {{ui:Lägsta hastighet}} / {{ui:Högsta hastighet}} | vid toppflödets eget djup i ledningen |
| {{ui:Mest av full kapacitet}} | hur fullt en ledning får gå vid toppen, i procent av vad den bär när den flyter full |

Startvärdena är platshållare, inte en standard. Använd de värden din myndighet publicerar.

## Vad den räknar ut

För varje ledning, i flödesordning:

- toppflöde = personer × flöde per person × toppfaktor + område × tillskottsvatten
- kapacitet vid full fyllning (Mannings ekvation vid ledningens lutning), och hur full toppen gör den
- normaldjupet för toppflödet och hastigheten där

Tabellen **Spillvattenresultat** listar varje lednings personer, toppfaktor, toppflöde (L/s, eller gpm och kubikfot per sekund), fyllnadsgrad och hastighet. Problem listas under den: en ledning som är fullare än gränsen, långsammare än lägsta hastighet (den kanske inte rensar sig själv), snabbare än högsta, eller utan fall. {{ui:Dimensionera ledningarna för de här flödena}} väljer för varje ledning den minsta standardstorleken (200 mm eller 8 tum och uppåt) som bär dess topp inom gränsen; en {{key:Mod+Z}} ångrar det.

:::note
Det här är det stationära toppflöde ett dimensioneringsblad räknar ut, kontrollerat mot ett publicerat dimensioneringsblad till dess tryckta avrundning. Det är inte en modell av avloppet över tid: inga hydrografer, magasinering, pumpar eller överfall. Se [Finns inte ännu](topic:not-built-yet).
:::

Hastigheterna använder Mannings ekvation med samma n på varje djup. Vissa myndigheters delfyllnadsdiagram låter n ändras med djupet, vilket ger en något lägre hastighet i en ledning som går 60 till 70 procent full (ungefär 3 procent mindre).
