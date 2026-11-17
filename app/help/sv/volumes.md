---
title: Jordarbetsvolymer
summary: Läs schakt-, fyllnings- och nettovolymer mellan befintlig mark och den projekterade ytan, per platta och korridor och totalt, och förstå rutnätsmetoden bakom dem.
keywords: volymer, jordarbeten, schakt, fyllning, netto, schakt och fyllning, mängder, rutnätsmetod, ytjämförelse, volymyta, kubikyard, kubikmeter
from: 299d7bc7
---

Så snart en platta eller korridor planeras utan problem jämför CivilCraft den projekterade ytan med befintlig mark och redovisar schakt och fyllning. Siffrorna uppdateras vid varje ändring.

## Var du läser dem

- **Jordarbeten** i högerpanelen när inget är markerat (vyn **Projekt**), när det finns minst en platta eller en korridor.
- **Jordarbeten** i högerpanelen när en platta är markerad (samma totaler för hela projektet).
- Raden under en korridors inställningar, med just den korridorens egna schakt och fyllning.

Blocket **Jordarbeten** visar:

- **Schakt**, **Fyllning** och **Netto** (med "fyllning" eller "schakt" efter, beroende på vilket som är störst)
- en rad per objekt när det finns fler än ett, till exempel "Platta 1: schakt 120.4 cu yd, fyllning 310.2 cu yd"
- metodraden: "Rutnätsmetod: befintlig mark och den planerade ytan samplas var 0.5 ft innanför släntkrönslinjerna (92,891 celler). Ingen svällning eller krympning tillämpad."

Volymer anges i kubikyard i ett fotprojekt och i kubikmeter i ett metriskt projekt.

## Skicka dem till TakeoffCraft

För att prissätta jordarbetet väljer du {{ui:Skicka till TakeoffCraft}} längst ner i blocket **Jordarbeten**. CivilCraft sparar en mängdfil (`<site>.quantities.json`) med två mängder: schakt och fyllning, i kubikyard (fotprojekt) eller kubikmeter (metriskt projekt), samma tal som i blocket, med två decimaler. Öppna den i TakeoffCraft med **Öppna mängdavtagning**, eller släpp den där: de blir två poster du kan prissätta ([Schakt och fyllning från CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Skicka igen efter en ändring och öppna den nya filen: samma poster får de nya talen.

Bara totalerna skickas, så ingenting räknas två gånger; filens anteckning listar varje plattas och korridors egna schakt och fyllning.

## Så räknas de ut

CivilCraft använder **rutnätsmetoden**:

1. Ett rutnät av kvadratiska celler läggs över området innanför varje släntkrönslinje.
2. I mitten av varje cell samplas båda ytorna.
3. Varje cell räknas som ett prisma: skillnaden i höjd gånger cellens area. Där den projekterade ytan är lägre är det schakt; högre är det fyllning.
4. Cellerna adderas.

Cellstorleken väljs åt dig så att rektangeln runt de planerade områdena innehåller cirka 250,000 celler, avrundad till ett jämnt värde (1, 2 eller 5 gånger en tiopotens). Du kan inte själv ställa in den ännu. Metodraden anger storleken och antalet celler. Mindre celler ger större noggrannhet längs kanterna; på hela celler mellan plana plan blir resultatet exakt.

## Bra att veta

- Bara området innanför släntkrönslinjerna räknas. Mark utanför dem är oförändrad.
- En platta eller korridor med ett problem planeras inte in och bidrar med ingenting. Om blocket säger "Inga volymer ännu: en platta måste planeras utan problem.", leta efter en röd ruta ovanför det.
- Där objekt överlappar har det senare ersatt det tidigare innanför sin släntkrönslinje, och överlappet räknas en gång.
- Ingen svällnings- eller krympningsfaktor tillämpas. Multiplicera resultaten själv om du behöver volymer i fast, lös eller packad massa.
- Avtorvning av matjord, beläggnings- och underbyggnadsdjup samt TIN-till-TIN-prismavolymer finns inte ännu.

## Kontrollera ett resultat

- Slå på {{ui:Projekterad (planerad)}} under **Visning** och titta på höjdkurvorna innanför släntkrönslinjerna.
- För pekaren över det planerade området: statusfältet visar **Mark** och **Planerad**. Skillnaden är schakt- eller fyllningsdjupet på den platsen.
- För en korridor visar profilvyns avläsning schakt eller fyllning på mittlinjen vid varje station.
