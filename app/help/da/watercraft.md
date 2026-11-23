---
title: WaterCraft: behov, brandflow, afbrydelser og vandalder
summary: Med WaterCraft-tilføjelsen gør du kunder til behov på dine vandledninger, kontrollerer flowet til rådighed ved hver brandhane, ser hvilken ledningsafbrydelse der gør mest skade, og følger vandalder og klor gennem et døgn.
keywords: watercraft, vanddistribution, behov, kunder, spidsfaktor, behovsmønster, brandflow, brandhane, restryk, kritikalitet, afbrydelse, spærbart afsnit, vandalder, klor, rest, kildesporing, blindt endeled, csv, tilføjelse
from: 066fb17a
---

WaterCraft er en tilføjelse, der arbejder på det vandnet, du allerede har tegnet med værktøjerne til vandledninger. Den tilføjer en fane i højre panel med fire afsnit.

:::warning
Kun et beregningshjælpemiddel. Det er kontrolleret mod håndregninger på opdigtede net, ikke på en reel forsyningsmodel. En vandingeniør skal kontrollere hvert resultat. Scenarier, styringsregler, ventiler og feltmålinger har deres egne emner, »Scenarier« og »Undersøgelser«, i WaterCraft-tilføjelsens hjælp.
:::

## Hvad du vil gøre

- Læg kunder på netværket som behov.
- Find de brandhaner, der ikke har det flow, du har brug for.
- Find de ledninger, hvis afbrydelse betyder mest.
- Find gammelt vand og lav klor.

## Trin

1. Åbn {{ui:Indstillinger}} › {{ui:Add-ons}} og slå {{ui:WaterCraft (vanddistribution)}} til. En WaterCraft-fane vises i højre panel.
2. Tegn først et reservoir, knudepunkter og rør med værktøjerne til vandledninger (se [Vandledninger](topic:water-mains)). Uden et net siger fanen dig, at du skal gøre det.
3. Under {{ui:Behov}} indsæt én kunde pr. linje: id, x, y, type, mængde. Vælg {{ui:Spidsfaktor}} og {{ui:Timemønster}} (boligdøgn, erhvervsdøgn, flad, eller behold mønsteret som det er). Tryk {{ui:Kontrollér}} for at se, hvor hver kunde ender (det nærmeste knudepunkt), og derefter {{ui:Læg i netværket}}. {{ui:Fortryd}} fjerner behovene igen.
4. Under {{ui:Brandvandsmængde}}: angiv det nødvendige flow og restrykket, vælg om restrykket holdes {{ui:Kun ved brandhanen}} eller {{ui:Overalt i systemet (strengere)}}, og tryk {{ui:Længde}}. Hver brandhane listes værst først, som enten »opfylder« eller »under kravet«.
5. Under {{ui:Hvilken hovedledning betyder mest}}: vælg {{ui:Én ledning ad gangen}} eller {{ui:Ét spærbart afsnit ad gangen}} og tryk {{ui:Længde}}. Hver afbrydelse viser det afbrudte behov, de afbrudte knudepunkter, knudepunkterne der nu er under minimumstrykket, og det laveste tryk, der er tilbage.
6. Under {{ui:Vandalder og klor}}: vælg hvad der skal følges (vandalder, klor eller en kildesporing), angiv antal timer der skal køres og de grænser du ønsker, og tryk {{ui:Længde}}. Knudepunkter uden for dine grænser listes.
7. Tryk {{ui:Gem som CSV}} under en tabel for at gemme den.

## Noter

- Det nødvendige brandflow og forbruget pr. bolig eller pr. acre er startværdier, ikke normer. Brug dit forsyningsselskabs egne tal.
- Et rør, der delvist afskæres af en ventil, lukkes helt, så den viste afbrydelse er lidt værre end en reel.
- Kør vandkvalitetsafsnittet længe nok til, at dagens mønster gentager sig, før du læser den sidste dag.
- {{ui:Stop}} afslutter en lang kørsel tidligt; listen viser så kun det, der blev gjort.
- Dit net bliver i dette projekt og på denne computer. Intet sendes nogen steder hen.
