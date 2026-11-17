---
title: Puntenwolken van een drone of scanner
summary: Met de add-on Puntenwolken opent u een LAS- of LAZ-bestand met miljoenen punten, bekijkt u alles, maakt u het schoon, sorteert u het in maaiveld, vegetatie en gebouwen, en bouwt u er het maaiveld, de hoogtelijnen en de volumes uit.
keywords: puntenwolk, las, laz, drone, fotogrammetrie, recap, lidar, scan, maaiveld, classificeren, ruis, stapel, volume, ontgraven en ophogen, hoogtelijnen, breeklijn, eye-dome, orthomosaic, ortho, drapeeren, kaartlaag, las exporteren, laz exporteren, comprimeren
from: e4a4901f
---

De meeste mensen hebben dit nooit nodig, daarom is het een add-on. Schakel {{ui:Puntenwolken}} in via Instellingen › Add-ons; dan verschijnt een tabblad {{ui:Puntenwolken}} in het rechterpaneel. Het bestand wordt in uw browser gelezen en in tegels gesneden die worden bewaard in de eigen opslag van uw browser (of in een map die u kiest). **Er wordt niets geüpload.**

:::warning
Alles wat dit tabblad meldt is een getal uit uw gegevens, geen certificaat. Het is getest op een verzonnen terrein, nog niet op een echte drone-opname: lees de eerste resultaten met zorg en laat ons weten wat u vindt. De bevoegde professional bepaalt wat het maaiveld, de hoogtelijnen en de volumes waard zijn.
:::

## Een wolk openen

Kies onder {{ui:Een wolk openen}} een LAS- of LAZ-bestand. Het tabblad vermeldt hoeveel punten het bevat, het coördinatenstelsel en de eenheden, en hoeveel ruimte een opbouw nodig heeft; druk op {{ui:De wolk opbouwen}}. Een opbouw kan worden gestopt en gaat verder met {{ui:Hervatten}} (kies hetzelfde bestand opnieuw). Het bestand wordt nooit gewijzigd. Een bestand van 100 miljoen punten wordt op een werkstation in enkele minuten opgebouwd en heeft ongeveer evenveel ruimte nodig als het bestand zelf.

Onder {{ui:Wolken op deze computer}} opent of verwijdert u een wolk. {{ui:Wolken in een map bewaren…}} (Chrome, Edge en de Studio-app) bewaart de tegels in een map die u kiest, bijvoorbeeld een CadCraft-wolkenmap in Documenten, zodat een wolk van 10 GB niet in de opslag van de browser hoeft te passen; wolken die eerder zijn opgebouwd, blijven waar ze zijn opgebouwd. De browser vraagt na een herstart opnieuw om toestemming: druk op {{ui:Gebruik de map … opnieuw}}.

## Ernaar kijken

{{ui:Bekijken in 3D}} tekent de wolk eerst uit grove tegels en verfijnt die als u dichterbij komt, maar nooit meer dan {{ui:Meeste getekende punten}} tegelijk (2.5 miljoen; 500 duizend op een telefoon). Kleur op de eigen kleur van het bestand, hoogte, klasse, intensiteit of residu. {{ui:Eye-dome-verlichting}} schaduwt randen naar diepte, zodat de vorm leesbaar is zonder normalen (uit op een telefoon); {{ui:Punten krimpen met afstand}} maakt verre punten kleiner en nabije groter; {{ui:Puntgrootte}} stelt de grootte in. Het plan toont de wolk als rasterbeeld onder uw tekening en **verfijnt zich zodra u inzoomt** op een deel ervan.

## Opschonen

Onder {{ui:Opschonen}} tekent u een lasso, een kader of een veelhoek in het plan (of in 3D vanuit het bovenaanzicht: in 3D wordt de omtrek recht naar beneden genomen, dus die is alleen vanaf boven exact). Het tabblad toont hoeveel punten erin liggen **voordat** u toepast: {{ui:Deze punten verwijderen}}, {{ui:Hun klasse wijzigen}}, {{ui:Verwijderde punten herstellen}} of {{ui:Bijsnijden tot deze grens}}. {{ui:Ongedaan maken}} en {{ui:Opnieuw}} lopen door het bewerkingslogboek; het bestand zelf wordt nooit gewijzigd. {{ui:Ruisfilter…}} markeert losse punten als lage punten (klasse 7) of hoge ruis (klasse 18).

## Sorteren

{{ui:Maaiveld zoeken}} werkt tegel voor tegel en markeert maaiveld (klasse 2) en lage punten; de tolerantie is 0.15 m, of 0.08 m met de schakelaar voor meetkwaliteit. Het meldt tegelnaden die niet overeenkomen. {{ui:Vegetatie en gebouwen classificeren}} markeert daarna lage, middelhoge en hoge vegetatie en gebouwen op basis van hoogte boven het maaiveld en hoe vlak de omgeving is. Er is geen machine learning, dus een platte schuur onder bomen kan verkeerd zijn: kijk ernaar.

## Maaiveld, hoogtelijnen, breeklijnen

{{ui:Maaiveld opbouwen}} maakt het bestaande maaiveld uit de maaiveldpunten en voegt het aan het project toe op dezelfde manier als een LAS-import (één stap ongedaan te maken). Daarna vergelijkt het de punten ermee: het gemiddelde, de RMS, het 95e percentiel, het aandeel binnen de tolerantie en de tien plekken die het meest afwijken, elk met {{ui:Daarheen gaan}}. Kleur op {{ui:Residu}} toont waar het maaiveld en de wolk niet overeenkomen.

Een **breeklijn** (een stoeprand, sloot of bovenkant van een talud) kiest u op de wolk: {{ui:Een breeklijn op de wolk kiezen}} in de 3D-weergave neemt bij elke klik het dichtstbijzijnde getekende punt, en {{ui:Een breeklijn in het plan kiezen}} neemt onder elke klik het dichtstbijzijnde wolkpunt (eerst het maaiveld); dubbelklik of druk op Enter om de lijn te beëindigen. De volgende {{ui:Maaiveld opbouwen}} gebruikt hem. {{ui:Hoogtelijnen tonen}} tekent de hoogtelijnen over de wolk in een klein beeld en stelt het interval van het project in.

## Volumes

{{ui:Volume van stapel…}} berekent het volume van het oppervlak boven een basis binnen een grens die u tekent. Teken de grens op vlak terrein rond de stapel en kies de basis: het laagste grenspunt, een vlak, een glad gekromde basis, een oppervlak door de grens, of een hoogte die u typt. Op hellend of gekromd terrein gebruikt u het vlak of de gekromde basis; het laagste punt leest te hoog. Grenspunten die boven de rest uitsteken (een boom op de lijn) worden uit de basis gelaten. {{ui:Vlucht naar vlucht}} geeft ontgraving en ophoging tussen twee wolken. Beide kunnen als CSV worden opgeslagen.

## Orthomosaïek

Onder {{ui:Orthomosaïek (beeld van boven)}} kiest u de orthomosaïek van de drone samen met het bijbehorende wereldbestand en `.prj` als die er zijn: een GeoTIFF, of een PNG of JPEG. Het wordt een **kaartlaag** van het project, zodat het plan het onder uw tekening toont, en de 3D-weergave (kleur {{ui:Kaart}}) schildert het op het maaiveld dat u hebt opgebouwd, dus {{ui:Maaiveld opbouwen}} eerst. Het tabblad vermeldt hoeveel van de wolk het beeld bedekt en waarschuwt als het niets bedekt: de gebruikelijke oorzaak is een ander coördinatenstelsel, dus geef het `.prj`-bestand erbij. Zonder `.prj` vraagt het programma waar de coördinaten zijn. Het beeld wordt in het projectbestand bewaard; een GeoTIFF van meer dan 200 MB wordt geweigerd en een zeer grote mozaïek wordt verkleind tot 16 megapixels, dus knip bij een grote opname eerst de mozaïek op het terrein bij.

## Exporteren

{{ui:Exporteren}} schrijft de opgeschoonde, geclassificeerde wolk als nieuw bestand (alle punten, de schone klassen, of alleen het maaiveld). Kies onder {{ui:Bestandstype}}:

- **LAS 1.4 (niet gecomprimeerd)**: puntformaat 6, of 7 met kleur.
- **LAZ (gecomprimeerd)**: dezelfde punten zonder verlies gecomprimeerd, zodat elk punt exact terugkomt. Het wordt geschreven als puntformaat 0, of 2 met kleur, in een LAS 1.4-bestand. Op het verzonnen terrein van 300 m was de LAZ ongeveer een vijfde van de grootte van het LAS 1.4-bestand. LAZ-formaten 0 en 2 bevatten alleen klassen 0 tot 31: een punt met een hogere klasse wordt met een melding geweigerd, dus exporteer die wolk als LAS 1.4.

De LAZ wordt geschreven door de eigen compressor van CadCraft, gemaakt op basis van de gepubliceerde LAZ-specificatie. We hebben gecontroleerd dat onze eigen lezer en twee onafhankelijke LAZ-lezers (laz-perf, die de app gebruikt om LAZ-bestanden te openen, en laspy met lazrs) elk punt exact teruglezen, en dat LAZ-bestanden die door laspy zijn gemaakt, byte voor byte gelijk blijven wanneer we hun punten opnieuw schrijven. Andere programma's zijn nog niet geprobeerd; als een daarvan een bestand niet opent, laat ons dan weten welke.

Waar de browser een bestand al tijdens het schrijven kan maken, kiest u eerst het bestand, en wordt een zeer grote wolk er per tegel naartoe geschreven in plaats van in het geheugen verzameld; anders wordt het bestand verzameld en gedownload, wat prima is tot enkele honderden megabytes.

## Wat het niet doet

Het leest alleen LAS en LAZ (E57, PLY en PCD zijn nog niet in dit tabblad aangesloten, en meerdere bestanden van één vlucht worden niet samengevoegd). Het herprojecteert een wolk niet (het stelsel en de meters van het project worden aangenomen), leest geen RCP- of RCS-bestanden van Autodesk, maakt geen oppervlak uit foto's en vindt zelf geen masten, stoepranden of leidingen.
