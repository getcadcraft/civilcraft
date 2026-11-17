---
title: WaterCraft: forbrug, brandvand, afbrydelser og vandalder
summary: Med add-on'et WaterCraft gør du kunder til forbrug på dine vandledninger, kontrollerer flowet til rådighed ved hver brandhane, ser hvilken ledningsafbrydelse der gør mest skade og følger vandalder og klor gennem et døgn.
keywords: watercraft, vandfordeling, forbrug, kunder, spidsfaktor, forbrugsmønster, brandvandsmængde, brandhane, restryk, kritikalitet, afbrydelse, ventilsektion, vandalder, klor, rest, kildesporing, blindt ende, csv, add-on
from: 76809f01
---

WaterCraft er et add-on, der arbejder på det vandledningsnet, du allerede har tegnet med værktøjerne til vandledninger. Det tilføjer et faneblad til det højre panel med fire afsnit.

:::warning
Kun en beregningshjælp. Den er kontrolleret mod håndregnede svar på opdigtede net, ikke på en rigtig forsyningsmodel. En vandteknisk ingeniør skal kontrollere hvert resultat. Der er ingen pumpestationer, ingen andenordens henfald og ingen scenarier endnu.
:::

## Hvad du gør

- Sæt kunder på nettet som forbrug.
- Find de brandhaner, der ligger under det flow, du har brug for.
- Find de ledninger, hvis afbrydelse betyder mest.
- Find gammelt vand og lavt klorindhold.

## Trin

1. Åbn {{ui:Indstillinger}} › {{ui:Add-ons}} og slå {{ui:WaterCraft (vandfordeling)}} til. Et {{ui:WaterCraft}}-faneblad vises i højre panel.
2. Tegn først et reservoir, knudepunkter og rør med værktøjerne til [vandledninger](topic:water-mains). Uden et net beder fanen dig om at gøre det.
3. Under {{ui:Forbrug}} indsætter du én kunde pr. linje: id, x, y, type, mængde. Vælg {{ui:Spidsfaktor}} og {{ui:Timemønster}} (boligdøgn, erhvervsdøgn, fladt, eller behold mønsteret som det er). Tryk {{ui:Kontrollér}} for at se, hvor hver kunde ender (det nærmeste knudepunkt), og tryk derefter {{ui:Læg ind i nettet}}. Fortryd tager forbruget tilbage.
4. Under {{ui:Brandvandsmængde}} sætter du den nødvendige mængde og restrykket, vælger om restrykket holdes {{ui:Kun ved brandhanen}} eller {{ui:Overalt i systemet (strengere)}}, og trykker {{ui:Længde}}. Hver brandhane vises med den dårligste først, som enten »opfylder« eller »mangler«.
5. Under {{ui:Hvilken hovedledning betyder mest}} vælger du {{ui:én ledning ad gangen}} eller {{ui:én ventilsektion ad gangen}} og trykker {{ui:Længde}}. Hver afbrydelse viser det afbrudte forbrug, de afbrudte knudepunkter, de knudepunkter, der nu kommer under minimumstrykket, og det laveste tryk, der er tilbage.
6. Under {{ui:Vandalder og klor}} vælger du, hvad der skal følges (vandalder, klor eller en kildesporing), sætter antallet af timer og de grænser, du ønsker, og trykker {{ui:Længde}}. Knudepunkter uden for dine grænser vises på listen.
7. Tryk {{ui:Gem som CSV}} under en tabel for at gemme den.

## Noter

- Den nødvendige brandvandsmængde og forbruget pr. husstand eller pr. acre er startværdier, ikke standarder. Brug din forsyningsvirksomheds egne tal.
- Et rør, der er delvist skåret af en ventil, lukkes helt, så den viste afbrydelse er lidt værre end en reel.
- Kør vandkvalitetsafsnittet længe nok til, at døgnmønsteret gentager sig, før du læser den sidste dag.
- {{ui:Stop}} afslutter en lang kørsel tidligt; listen viser så kun det, der nåede at blive gjort.
- Dit net bliver i dette projekt og på denne computer. Intet sendes nogen steder hen.
