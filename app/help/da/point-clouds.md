---
title: Punktskyer fra drone eller scanner
summary: Med tilføjelsen Punktsky kan du åbne en LAS- eller LAZ-fil med millioner af punkter, se på det hele, rense den, sortere den i terræn, vegetation og bygninger og bygge terræn, højdekurver og volumener ud fra den.
keywords: punktsky, las, laz, drone, fotogrammetri, recap, lidar, scanning, terræn, klassificér, støj, oplag, volumen, afgravning og opfyld, højdekurver, brudlinje, eye-dome, ortomosaik, ortho, drapér, kortlag, eksportér las, eksportér laz, komprimér
from: e4a4901f
---

De fleste får aldrig brug for dette, så det er en tilføjelse. Slå {{ui:Punktsky}} til under Indstillinger › Add-ons; en fane {{ui:Punktsky}} vises i det højre panel. Filen læses i din browser og deles op i fliser, som gemmes i din browsers egen lagring (eller i en mappe, du vælger). **Intet uploades.**

:::warning
Alt, denne fane viser, er et tal fra dine data, ikke et certifikat. Den er testet på et opdigtet område, ikke endnu på en rigtig drone-opmåling: læs de første resultater med omtanke, og fortæl os, hvad du finder. Den registrerede fagperson afgør, hvad terrænet, højdekurverne og volumenerne er værd.
:::

## Åbn en punktsky

Under {{ui:Åbn en punktsky}} vælger du en LAS- eller LAZ-fil. Fanen viser, hvor mange punkter den indeholder, dens koordinatsystem og enheder og hvor meget plads en opbygning kræver; tryk på {{ui:Byg punktskyen}}. En opbygning kan stoppes og fortsættes med {{ui:Genoptag}} (vælg den samme fil igen). Filen ændres aldrig. En fil med 100 millioner punkter bygges på minutter på en arbejdsstation og fylder omtrent lige så meget som filen selv.

Under {{ui:Punktskyer på denne computer}} åbner eller fjerner du en punktsky. {{ui:Gem punktskyer i en mappe…}} (Chrome, Edge og Studio-appen) gemmer fliserne i en mappe, du vælger, fx en CadCraft-punktskymappe i Dokumenter, så en punktsky på 10 GB ikke skal passe ind i browserens lagerplads; punktskyer bygget tidligere bliver, hvor de blev bygget. Browseren spørger igen om tilladelse efter en genstart: tryk på {{ui:Brug mappen … igen}}.

## Se på den

{{ui:Se den i 3D}} tegner punktskyen ud fra grove fliser og skærper efter, når du kommer tættere på, og aldrig mere end {{ui:Flest punkter tegnet}} ad gangen (2.5 millioner; 500 tusind på en telefon). Farv efter filens egen farve, højde, klasse, intensitet eller residual. {{ui:Eye-dome-belysning}} skygger kanter efter dybde, så formen kan læses uden normaler (fra på en telefon); {{ui:Punkter bliver mindre med afstand}} gør fjerne punkter mindre og nære større; {{ui:Punktstørrelse}} angiver størrelsen. Planen viser punktskyen som et raster under din tegning og **skærpes, når du zoomer ind** på en del af den.

## Rens den

Under {{ui:Rens}} tegner du en lasso, en boks eller en polygon i planen (eller i 3D fra oppefra: i 3D tages konturen lige ned, så den kun er præcis set oppefra). Fanen viser, hvor mange punkter der er inde i området, **før** du anvender: {{ui:Slet disse punkter}}, {{ui:Ændr deres klasse}}, {{ui:Gendan slettede punkter}} eller {{ui:Beskær til denne grænse}}. {{ui:Fortryd}} og {{ui:Gentag}} bevæger sig gennem redigeringslogbogen; selve filen ændres aldrig. {{ui:Støjfilter…}} markerer løsrevne punkter som lave punkter (klasse 7) eller høj støj (klasse 18).

## Sortér den

{{ui:Find terrænet}} arbejder flise for flise og markerer terræn (klasse 2) og lave punkter; tolerancen er 0.15 m, eller 0.08 m med opmålingskontakten. Den rapporterer flisesømme, der ikke stemmer overens. {{ui:Klassificér vegetation og bygninger}} markerer derefter lav, mellem og høj vegetation og bygninger ud fra højden over terrænet og hvor fladt omgivelserne er. Der er ingen maskinlæring, så et fladt tag under træer kan være forkert: kontrollér det.

## Terræn, højdekurver, brudlinjer

{{ui:Byg terræn}} laver det eksisterende terræn ud fra terrænpunkterne og føjer det til projektet på samme måde som en LAS-import (ét trin at fortryde). Derefter sammenlignes punkterne med det: middelværdien, RMS, 95. percentil, andelen inden for tolerancen og de ti steder, der afviger mest, hver med {{ui:Gå derhen}}. Farvning efter {{ui:Residual}} viser, hvor terrænet og punktskyen er uenige.

En **brudlinje** (en kantsten, grøft eller kant af en skråning) vælges på punktskyen: {{ui:Vælg en brudlinje på punktskyen}} i 3D-visningen tager det nærmeste tegnede punkt ved hvert klik, og {{ui:Vælg en brudlinje i planen}} tager det nærmeste punkt i punktskyen (terræn først) under hvert klik; dobbeltklik eller Enter afslutter linjen. Den næste {{ui:Byg terræn}} bruger den. {{ui:Vis højdekurver}} tegner højdekurverne over punktskyen i et lille billede og sætter projektets interval.

## Volumener

{{ui:Oplagsvolumen…}} beregner volumenet af overfladen over et grundplan inden for en grænse, du tegner. Tegn grænsen på jævnt terræn rundt om dyngen og vælg grundplanet: det laveste grænsepunkt, et plan, en blød buet bund, en overflade gennem grænsen eller en kote, du skriver. På skrånende eller buet terræn bruger du planet eller den buede bund; det laveste punkt angiver for høj en værdi. Grænsepunkter, der står over resten (et træ på linjen), udelades fra grundplanet. {{ui:Flyvning til flyvning}} giver afgravning og opfyld mellem to punktskyer. Begge kan gemmes som CSV.

## Ortomosaik

Under {{ui:Ortomosaik (billede set oppefra)}} vælger du dronens ortomosaik sammen med dens world-fil og `.prj`, når de findes: en GeoTIFF eller en PNG eller JPEG. Den bliver et **kortlag** i projektet, så planen viser den under din tegning, og 3D-visningen (farve {{ui:Kort}}) maler den på det terræn, du har bygget, så byg {{ui:Byg terræn}} først. Fanen viser, hvor meget af punktskyen billedet dækker, og advarer, når det ikke dækker noget: den typiske årsag er et andet koordinatsystem, så giv `.prj`-filen med. Når der ingen `.prj` er, spørger programmet, hvor koordinaterne er. Billedet gemmes i projektfilen; en GeoTIFF over 200 MB afvises, og en meget stor mosaik reduceres til 16 megapixel, så klip mosaikken til stedet først ved en stor opmåling.

## Eksportér

{{ui:Eksportér}} skriver den rensede, klassificerede punktsky som en ny fil (alle punkter, de rensede klasser eller kun terrænet). Under {{ui:Filtype}} vælger du:

- **LAS 1.4 (ikke komprimeret)**: punktformat 6, eller 7 med farve.
- **LAZ (komprimeret)**: de samme punkter komprimeret uden tab, så hvert punkt kommer tilbage nøjagtigt. Den skrives som punktformat 0, eller 2 med farve, i en LAS 1.4-fil. På det opdigtede 300 m-område var LAZ-filen omkring en femtedel af størrelsen af LAS 1.4-filen. LAZ-formaterne 0 og 2 rummer kun klasserne 0 til 31: et punkt med en højere klasse afvises med en besked, så eksportér den punktsky som LAS 1.4.

LAZ-filen skrives af CadCrafts egen komprimering, lavet ud fra den offentliggjorte LAZ-specifikation. Vi har kontrolleret, at vores egen læser og to uafhængige LAZ-læsere (laz-perf, som appen bruger til at åbne LAZ-filer, og laspy med lazrs) læser hvert punkt tilbage nøjagtigt, og at LAZ-filer lavet af laspy bliver byte for byte ens, når vi skriver deres punkter igen. Andre programmer er ikke afprøvet endnu, så hvis et af dem ikke vil åbne en fil, så fortæl os hvilket.

Hvor browseren kan skrive en fil, mens den arbejder, vælger du filen først, og en meget stor punktsky skrives til den en flise ad gangen i stedet for at samles i hukommelsen; ellers samles filen og downloades, hvilket er fint op til nogle få hundrede megabyte.

## Hvad den ikke gør

Den læser kun LAS og LAZ (E57, PLY og PCD er ikke koblet til denne fane endnu, og flere filer fra én flyvning sammenføjes ikke), omprojicerer ikke en punktsky (projektets system og meter antages), læser ikke Autodesks RCP- eller RCS-filer, laver ikke en overflade ud fra fotos og finder ikke stolper, kantsten eller rør af sig selv.
