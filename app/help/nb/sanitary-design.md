---
title: Beregn dimensjonerende spillvannsstrømmer og kontroller avløpsledningen
summary: Skriv inn personene og arealet som kommer inn ved hver kum i et spillvannsnett; CivilCraft legger dem sammen nedover nettet, regner ut topp-vannføringen med en toppfaktor og innlekking, og kontrollerer kapasiteten og hastigheten i hvert rør.
keywords: spillvann, avløp, spillvannsledning, avløpsvann, dimensjonerende vannmengde, topp-vannføring, toppfaktor, harmon, babbitt, innlekking, befolkning, per person, fyllingsgrad, selvrensende, hastighet, rørdimensjonering, beregningsskjema
from: 73ba197a
---

Dimensjonerende spillvannsstrømmer virker på [rørnettet](topic:pipe-network) når dets {{ui:Type}} er {{ui:Sanitary}}. Uten noe valgt viser høyre panel da **Dimensjonerende spillvannsstrømmer**, der et overvannsnett viser overvannsdrenering.

## Skriv inn det som kommer inn

1. Velg en kum. Under **Dimensjonerende spillvannsstrømmer**, skriv inn {{ui:Personer som kommer inn her}} og {{ui:Areal som kommer inn her}} (hektar i et meterprosjekt, acres i et fotprosjekt).
2. For butikker, kontorer eller industri, skriv inn ekvivalente personer: arealet ganger antall personer per hektar (eller acre) din etat bruker. Arealet teller for innlekking uansett.
3. Gjenta for hver kum der en gate eller en tomt kobles til. En kum der ingenting kobles til holder begge på 0.

Hvert rør bærer alt som kommer inn ved sin øvre kum og oppstrøms for den. Velg en kum for å se hva som går gjennom den.

## Innstillingene

| Innstilling | Hva den betyr |
|---|---|
| {{ui:Vannføring per person}} | gjennomsnittlig vannføring for én person per døgn: liter (meterprosjekt) eller amerikanske gallons (fotprosjekt) |
| {{ui:Innlekking}} | grunnvann som lekker inn: liter per sekund per hektar, eller gallons per døgn per acre |
| {{ui:Toppfaktor}} | Harmon, 1 + 14 / (4 + √P), eller Babbitt, 5 / P^0,2, med P befolkningen i tusen |
| {{ui:Toppfaktor minst}} / {{ui:Toppfaktor høyst}} | faktoren holdes mellom disse to |
| {{ui:Mannings n}} | for kapasitet og hastighet |
| {{ui:Minste hastighet}} / {{ui:Største hastighet}} | ved toppstrømmens egen dybde i røret |
| {{ui:Høyst av full kapasitet}} | hvor fullt et rør kan gå ved toppen, som en prosent av det det bærer når det er fullt |

Startverdiene er plassholdere, ikke en standard. Bruk verdiene din etat publiserer.

## Hva den regner ut

For hvert rør, i strømningsrekkefølge:

- topp-vannføring = personer × vannføring per person × toppfaktor + areal × innlekking
- kapasitet når røret er fullt (Mannings ligning ved rørets helning), og hvor fullt toppstrømmen gjør det
- normaldybden for toppstrømmen og hastigheten der

Tabellen **Spillvannsresultater** lister hvert rørs personer, toppfaktor, topp-vannføring (L/s, eller gpm og kubikkfot per sekund), fyllingsgrad og hastighet. Problemer listes under den: et rør fullere enn grensen, langsommere enn minste hastighet (det kan ikke rense seg selv), raskere enn største, eller uten fall. {{ui:Dimensjoner rørene for disse vannmengdene}} velger for hvert rør den minste standardstørrelsen (200 mm eller 8 inch og større) som bærer toppen innenfor grensen; ett {{key:Mod+Z}} angrer det.

:::note
Dette er den stasjonære toppvannføringen et beregningsskjema regner ut, kontrollert mot et publisert beregningsskjema til dets trykte avrunding. Det er ingen modell av avløpet over tid: ingen hydrografer, magasinering, pumper eller overløp. Se [Ikke bygget ennå](topic:not-built-yet).
:::

Hastigheter bruker Mannings ligning med samme n på alle dybder. Noen etaters diagrammer for delvis fylte rør lar n endre seg med dybden, noe som gir en litt lavere hastighet i et rør som går 60 til 70 prosent fullt (omtrent 3 prosent mindre).
