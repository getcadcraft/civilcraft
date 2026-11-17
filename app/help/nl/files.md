---
title: Bestanden die u kunt openen, opslaan en exporteren
summary: Puntenbestanden, LandXML en CivilCraft-projecten importeren; projecten, LandXML, DXF en PDF exporteren; wat elk bewaart, waar de bestanden naartoe gaan en wat er offline verandert.
keywords: openen, opslaan, exporteren, importeren, bestandsformaten, csv, txt, landxml, xml, dxf, pdf, json, downloaden, projectbestand
from: 82bff559
---

CivilCraft opent bestanden van uw computer en slaat op door bestanden terug naar uw computer te downloaden. Er wordt niets geüpload en niets op een server bewaard. Zie ook [Uw bestanden](common:your-files).

## Wat het opent

Klik op {{ui:Openen}} (of druk op {{key:Mod+O}}) en kies een bestand, of sleep het bestand vanuit {{pick:mac=Finder|windows=Verkenner|linux=uw bestandsbeheer}} naar het plan. Één bestand tegelijk; bestanden groter dan 200 MB worden geweigerd. Een LandXML- of projectbestand groter dan 32 MB wordt in stukken van ongeveer 4 MB gelezen, nooit als één blok tekst. Terwijl een LandXML wordt geopend, reken op ongeveer 13 keer de grootte van het bestand aan geheugen (in onze test gebruikte een bestand van 69 MB ongeveer 0.9 GB).

| Soort | Bestandsnamen | Wat er gebeurt |
|---|---|---|
| Puntenbestand | `.csv`, `.txt`, `.pnt`, `.xyz` (elk tekstbestand) | Het dialoogvenster **Punten importeren** wordt geopend. De punten vervangen de punten van het project; tracés, plateaus en leidingen blijven staan. |
| LandXML | `.xml`, `.landxml` | Er wordt een **nieuw project** gemaakt van het bestand (u wordt eerst gevraagd als het huidige niet-opgeslagen wijzigingen heeft). |
| CivilCraft-project | `.civilcraft.json` (elke `.json`) | Het project wordt geopend zoals het is opgeslagen (u wordt eerst gevraagd als het huidige niet-opgeslagen wijzigingen heeft). |

CivilCraft beslist op basis van de extensie van het bestand, en daarna op basis van de eerste tekens: tekst die begint met `{` wordt als project gelezen, tekst die begint met `<` als LandXML, al het andere als puntenbestand. Een bestand dat het openvenster grijs weergeeft, kan nog steeds op het plan worden gesleept.

:::note
Het importeren van een puntenbestand in een project dat al punten heeft, vervangt die zonder te vragen en wist de geschiedenis voor ongedaan maken (het openen van elk bestand begint met een schone geschiedenis voor ongedaan maken). Als het terrein uit LandXML kwam, zet het importeren van punten het terug naar een terrein dat uit de punten is opgebouwd. Sla eerst op als u de oude punten misschien terug wilt.
:::

Details: [Puntenbestandsformaten](topic:point-file-formats), [LandXML: wat wordt gelezen en geschreven](topic:landxml-reference).

## Wat het opslaat

{{ui:Opslaan}} ({{key:Mod+S}}) schrijft twee bestanden naast elkaar, genoemd naar **Naam** in het linkerpaneel: `<naam>.civilcraft.json`, het project waarin u blijft bewerken, en `<naam>.ifc`, hetzelfde ontwerp als IFC 4.3 voor anderen (zie [IFC-export en -import](topic:ifc)). Elk bestand verwijst naar het andere, en de IFC bevat ook een gecomprimeerde kopie van het project, zodat een IFC die alleen wordt verzonden nog steeds volledig bewerkbaar opent.

- **In Studio** worden beide bestanden naast elkaar, op dezelfde plek, geschreven.
- **In Chrome en Edge** vraagt het eerste opslaan om een map en schrijft beide daarin; latere keren gaan naar dezelfde map. Annuleer de vraag naar de map om beide te downloaden.
- **In andere browsers** worden beide bestanden gedownload, het projectbestand eerst.

Bij het openen van een van beide bestanden wordt naar het andere gezocht. Open beide tegelijk (of sleep beide), of open er één: in Studio wordt het andere in dezelfde map gevonden; in een browser vraagt CivilCraft of u het wilt toevoegen, of of u met het ene bestand verdergaat. Als de IFC na het opslaan door CivilCraft door een ander programma is gewijzigd, of als het ene bestand ouder is dan het andere, wordt het project geopend vanuit het nieuwste ontwerp. Het paneel Problemen vertelt wat er is gebeurd, met **Nu opslaan** (schrijft beide bestanden opnieuw) en **De geometrie van de IFC als referentie tonen**. Een IFC op zichzelf die door een ander programma is gewijzigd, wordt geopend vanuit de kopie van het project met wat nog overeenkomt: tracés die zijn gewijzigd nemen hun geometrie over, objecten die zijn verwijderd worden weggelaten, en de rest van de wijzigingen wordt weergegeven, niet overgenomen. Een projectbestand van vóór 0.7.1 wordt als voorheen geopend.

Het projectbestand bewaart:

- elk punt (nummer, coördinaten, hoogte, beschrijving) en de naam van het puntenbestand waaruit ze kwamen
- de terreininstellingen: keuzes voor groepen, getekende breeklijnen, de begrenzing, de langste buitenrand, en een TIN die uit LandXML is gelezen
- de weergave-instellingen
- tracés met hun PI's, stralen en beginstationering, hun ontwerpprofielen (PVI's en booglengten) en corridorinstellingen
- plateaus en het leidingnetwerk met zijn regels

Het bewaart de geschiedenis voor ongedaan maken niet. Terreinen, hoogtelijnen, ontgravingslijnen en volumes worden niet opgeslagen; ze worden opnieuw opgebouwd uit de opgeslagen invoer wanneer het project opent. Een projectbestand van een nieuwere CivilCraft wordt geweigerd met een melding die de versie noemt.

## Wat het exporteert

| Knop | Bestand | Inhoud |
|---|---|---|
| {{ui:LandXML}} | `<naam>.xml` | LandXML 1.2: punten, het bestaande terrein (en het aangelegde terrein als dat er is) als TIN-oppervlakken, tracés, terrein- en ontwerpprofielen, het leidingnetwerk |
| {{ui:DXF}} | `<naam>.dxf` | R12 DXF van de planlijnen zoals ze worden weergegeven, op benoemde lagen |
| {{ui:DWG}} | `<naam>.dwg` | Dezelfde lijnen als DWG-tekening, in het formaat dat u kiest (2000 tot 2018) |
| {{ui:PDF}} | `<naam>.pdf` | Een vectorplot van het plan op een blad, op een schaal die u kiest |
| {{ui:GLB}} of {{ui:OBJ}} (op de balk van de 3D-weergave) | `<naam>-3d.glb`, `<naam>-3d.obj` | Wat de 3D-weergave als 3D-model toont: meters, Y omhoog, ware schaal, rond een vastgelegde lokale oorsprong |

Wat elk weglaat: [LandXML-uitwisseling](topic:landxml), [Het plan naar DXF exporteren](topic:dxf-export) (DWG ook), [Het plan naar PDF plotten](topic:plot-pdf), [Het terrein in 3D exporteren](topic:export-3d).

## Waar de bestanden naartoe gaan

Opgeslagen en geëxporteerde bestanden gaan naar waar uw browser downloads plaatst, meestal de map Downloads. Om elke keer een map te kiezen:

:::chromium
Open de **Instellingen** van de browser, dan **Downloads**, en zet **Vragen waar elk bestand moet worden opgeslagen voordat het wordt gedownload** aan.
:::

:::firefox
Open **Instellingen**, dan **Algemeen**, en kies onder **Bestanden en toepassingen** **Altijd vragen waar bestanden moeten worden opgeslagen**.
:::

:::safari
Open **Safari > Instellingen > Algemeen** en zet **Downloadlocatie voor bestanden** op **Vragen bij elke download**.
:::

Als u twee keer met dezelfde naam opslaat, kan de browser een nummer aan het tweede bestand toevoegen, bijvoorbeeld `Site (1).civilcraft.json`. Open de nieuwste de volgende keer.

## Online en offline

CivilCraft werkt in beide gevallen alleen op uw computer: openen leest het bestand in de browser, opslaan downloadt het. Om CivilCraft zonder enige verbinding te openen, slaat u het eerst op voor offlinegebruik:

1. Klik terwijl u online bent op {{ui:Opslaan voor offline gebruik}} in de appbalk bovenaan.
2. De knop telt op ("Opslaan 12 van 30") en toont daarna {{ui:Klaar voor offline gebruik}}. CivilCraft is klein (ongeveer 0.6 MB), dus dit duurt even. De opgeslagen kopie bevat deze help en de voorbeeldsite.
3. Zonder verbinding opent u hetzelfde adres (of een bladwijzer ervan). Alles werkt, inclusief {{ui:Open de voorbeeldsite}}.

De andere statussen van de knop:

- {{ui:Kon niet opslaan}}: sommige bestanden zijn niet gedownload. Controleer de verbinding en klik erop om het opnieuw te proberen.
- {{ui:Offline gebruik is niet beschikbaar}}: dit browservenster kan geen offlinekopie bewaren (privévensters en sommige beheerde computers blokkeren dat). Gebruik een normaal venster.

Klik op {{ui:Klaar voor offline gebruik}} om te zien wanneer de kopie is opgeslagen, met twee keuzes: {{ui:Opnieuw opslaan (de nieuwste versie ophalen)}} en {{ui:De offlinekopie verwijderen}}. Sla opnieuw op vóór een bezoek aan de bouwplaats, zodat de kopie overeenkomt met de nieuwste build. Meer in [Offline](common:offline).

:::offline
U bent nu offline. Als CivilCraft voor offlinegebruik is opgeslagen, werkt alles, inclusief de voorbeeldsite. Zo niet, blijf dan in dit tabblad werken, maar laad het niet opnieuw voordat u weer online bent; zonder opgeslagen kopie mislukt {{ui:Open de voorbeeldsite}} met "Het voorbeeld kon niet worden geladen".
:::

:::tip
Voor gebruik in het veld: sla CivilCraft op voor offlinegebruik en zet uw puntenbestanden op de laptop zelf. Projecten en exports worden zonder verbinding als downloads opgeslagen, zodat u de metingen van een dag kunt importeren, het terrein kunt controleren en het project op de bouwplaats kunt opslaan.
:::

Cloudopslag is nog niet beschikbaar, en desktopversies zijn nog niet uit. Vandaag zijn de bestanden die u opslaat de enige kopie: bewaar ze op een plek waarvan een back-up wordt gemaakt.

## Add-ons die een bestand gebruikt

Als u een project opslaat dat gegevens van een add-on bevat (de vinkjes Bouwregelgeving of een bron Adres naar terrein), legt het bestand vast welke add-ons en welke versies. Opent u het op een computer waar er een ontbreekt, dan toont een balk boven het plan dat en biedt aan die toe te voegen vanuit de lijst van uw account. De vastlegging is alleen een notitie: het bestand opent in elk geval.

## Ongedaan maken vanuit Studio

In CadCraft Studio wordt elke stap die u in CivilCraft afrondt aan Studio doorgegeven, zodat het ongedaan maken op projectniveau de laatste stap over alle apps heen kan terugdraaien. Studio draait een stap alleen terug als de eigen ongedaan-makenstapel van CivilCraft precies is zoals die stap hem heeft achtergelaten; nadat u een ander bestand hebt geopend, slaat het deze stap over.

## Sluiten met niet-opgeslagen wijzigingen

Als het project niet-opgeslagen wijzigingen heeft en u het tabblad sluit, de pagina opnieuw laadt of de pagina verlaat, vraagt de browser of u wilt vertrekken. De tekst en vormgeving daarvan horen bij de browser en kunnen door CivilCraft niet worden gewijzigd. {{ui:Nieuw}}, en het openen van een project- of LandXML-bestand, vragen in plaats daarvan in het eigen vak **Niet-opgeslagen wijzigingen** van CivilCraft, met {{ui:Annuleren}}, {{ui:Niet opslaan}} en {{ui:Een kopie opslaan}}.
