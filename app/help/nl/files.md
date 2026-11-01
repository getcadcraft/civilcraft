---
title: Bestanden die u kunt openen, opslaan en exporteren
summary: Puntenbestanden, LandXML en CivilCraft-projecten importeren; projecten, LandXML, DXF en PDF exporteren; wat elk bewaart, waar de bestanden naartoe gaan en wat er offline verandert.
keywords: openen, opslaan, exporteren, importeren, bestandsindelingen, csv, txt, landxml, xml, dxf, pdf, json, downloaden, projectbestand
from: a7debb61
---

CivilCraft opent bestanden van uw computer en slaat op door bestanden terug naar uw computer te downloaden. Er wordt niets geüpload en niets op een server bewaard. Zie ook [Uw bestanden](common:your-files).

## Wat er wordt geopend

Klik op {{ui:Open}} (of druk op {{key:Mod+O}}) en kies een bestand, of sleep het bestand vanuit {{pick:mac=Finder|windows=File Explorer|linux=uw bestandsbeheerder}} naar het plan. Eén bestand tegelijk; bestanden groter dan 200 MB worden geweigerd.

| Soort | Bestandsnamen | Wat er gebeurt |
|---|---|---|
| Puntenbestand | `.csv`, `.txt`, `.pnt`, `.xyz` (elk tekstbestand) | Het dialoogvenster **Punten importeren** wordt geopend. De punten vervangen de punten van het project; tracés, plateaus en leidingen blijven behouden. |
| LandXML | `.xml`, `.landxml` | Er wordt een **nieuw project** gemaakt van het bestand (u wordt eerst gevraagd als het huidige project niet-opgeslagen wijzigingen heeft). |
| CivilCraft-project | `.civilcraft.json` (elk `.json`) | Het project wordt geopend zoals het is opgeslagen (u wordt eerst gevraagd als het huidige project niet-opgeslagen wijzigingen heeft). |

CivilCraft bepaalt het type aan de hand van de bestandsextensie en daarna aan de hand van de eerste tekens: tekst die begint met `{` wordt als project gelezen, tekst die begint met `<` als LandXML, al het andere als puntenbestand. Een bestand dat het openvenster grijs weergeeft, kan nog steeds op het plan worden neergezet.

:::note
Het importeren van een puntenbestand in een project dat al punten heeft, vervangt die punten zonder vooraf te vragen, en wist de geschiedenis van ongedaan maken (het openen van elk bestand is een nieuwe start voor ongedaan maken). Als het terrein uit LandXML afkomstig was, zet het importeren van punten het terrein terug naar een terrein dat uit de punten is opgebouwd. Sla eerst op als u de oude punten misschien terug wilt.
:::

Details: [Puntenbestandsindelingen](topic:point-file-formats), [LandXML: wat wordt gelezen en geschreven](topic:landxml-reference).

## Wat er wordt opgeslagen

{{ui:Save}} ({{key:Mod+S}}) schrijft twee bestanden naast elkaar, genoemd naar **Naam** in het linkerpaneel: `<naam>.civilcraft.json`, het project dat u blijft bewerken, en `<naam>.ifc`, hetzelfde ontwerp als IFC 4.3 voor anderen (zie [IFC exporteren en importeren](topic:ifc)). Elk bestand verwijst naar het andere, en de IFC bevat ook een gecomprimeerde kopie van het project, zodat een IFC die op zichzelf wordt verzonden nog steeds volledig bewerkbaar opent.

- **In Studio** worden beide bestanden naast elkaar, op dezelfde plaats, geschreven.
- **In Chrome en Edge** vraagt het eerste opslaan om een map en schrijft beide daarin; latere keren gaat het naar dezelfde map. Annuleer de vraag naar de map om beide in plaats daarvan te downloaden.
- **In andere browsers** worden beide bestanden gedownload, het projectbestand eerst.

Bij het openen van een van beide bestanden wordt naar het andere gezocht. Open beide tegelijk (of sleep beide), of open er één: in Studio wordt het andere gevonden in dezelfde map; in een browser vraagt CivilCraft of u het wilt toevoegen, of of u verdergaat met het bestand dat u hebt. Als de IFC door een ander programma is gewijzigd nadat CivilCraft hem heeft opgeslagen, of als het ene bestand ouder is dan het andere, wordt het project geopend vanuit het nieuwere ontwerp en vertelt het paneel Problemen wat er is gebeurd, met **Nu opslaan** (schrijft beide bestanden opnieuw) en **De geometrie van de IFC als referentie tonen**. Een IFC op zichzelf die een ander programma heeft gewijzigd, wordt geopend vanuit de kopie van het project daarin, met wat nog overeenkomt: tracés die het heeft gewijzigd, nemen zijn geometrie over; objecten die het heeft verwijderd, worden weggelaten; en de overige wijzigingen worden vermeld, niet overgenomen. Een projectbestand van vóór 0.7.1 wordt geopend zoals voorheen.

Het projectbestand bewaart:

- elk punt (nummer, coördinaten, hoogte, beschrijving) en de naam van het puntenbestand waaruit ze kwamen
- de terreininstellingen: keuzes voor groepen, getekende breeklijnen, de begrenzing, de langste buitenrand, en een TIN dat uit LandXML is gelezen
- de weergave-instellingen
- tracés met hun PIs, stralen en beginstationering, hun ontwerpprofielen (PVIs en booglengtes) en corridorinstellingen
- plateaus en het leidingnetwerk met zijn regels

De geschiedenis van ongedaan maken wordt niet bewaard. Terreinen, hoogtelijnen, ontgravingslijnen en volumes worden niet opgeslagen; ze worden opnieuw opgebouwd uit de opgeslagen invoer wanneer het project wordt geopend. Een projectbestand van een nieuwere CivilCraft wordt geweigerd, met een melding die de versie noemt.

## Wat er wordt geëxporteerd

| Knop | Bestand | Inhoud |
|---|---|---|
| {{ui:LandXML}} | `<naam>.xml` | LandXML 1.2: punten, het bestaande terrein (en het afgewerkte terrein als er een is) als TIN-oppervlakken, tracés, maaiveld- en ontwerpprofielen, het leidingnetwerk |
| {{ui:DXF}} | `<naam>.dxf` | R12 DXF van het lijnwerk van het plan zoals het wordt weergegeven, op benoemde lagen |
| {{ui:DWG}} | `<naam>.dwg` | Hetzelfde lijnwerk als DWG-tekening, in het formaat dat u kiest (2000 tot 2018) |
| {{ui:PDF}} | `<naam>.pdf` | Een vectorplot van het plan op een blad, op een schaal die u kiest |
| {{ui:GLB}} of {{ui:OBJ}} (op de balk van de 3D-weergave) | `<naam>-3d.glb`, `<naam>-3d.obj` | Wat de 3D-weergave toont als 3D-model: meters, Y omhoog, ware schaal, rond een vastgelegde lokale oorsprong |

Wat elk weglaat: [LandXML uitwisselen](topic:landxml), [Het plan naar DXF exporteren](topic:dxf-export) (DWG ook), [Het plan naar PDF plotten](topic:plot-pdf), [Het terrein in 3D exporteren](topic:export-3d).

## Waar de bestanden naartoe gaan

Opgeslagen en geëxporteerde bestanden gaan naar waar uw browser downloads plaatst, meestal de map Downloads. Om elke keer een map te kiezen:

:::chromium
Open de **Instellingen** van de browser, dan **Downloads**, en zet **Vragen waar elk bestand moet worden opgeslagen voordat het wordt gedownload** aan.
:::

:::firefox
Open **Instellingen**, dan **Algemeen**, en kies onder **Bestanden en toepassingen** **Altijd vragen waar bestanden moeten worden opgeslagen**.
:::

:::safari
Open **Safari > Instellingen > Algemeen** en zet **Downloadlocatie** op **Vragen bij elke download**.
:::

Als u twee keer opslaat met dezelfde naam, kan de browser een nummer aan het tweede bestand toevoegen, bijvoorbeeld `Terrein (1).civilcraft.json`. Open de nieuwste de volgende keer.

## Online en offline

CivilCraft werkt in beide gevallen alleen op uw computer: openen leest het bestand in de browser, opslaan downloadt het. Om CivilCraft zonder enige verbinding te openen, slaat u het eerst op voor offlinegebruik:

1. Klik terwijl u online bent op {{ui:Save for offline}} in de app-balk bovenaan.
2. De knop telt op ("Bezig met opslaan, 12 van 30") en toont daarna {{ui:Offline ready}}. CivilCraft is klein (ongeveer 0.6 MB), dus dit duurt even. De opgeslagen kopie bevat deze help en het voorbeeldterrein.
3. Zonder verbinding opent u hetzelfde adres (of een bladwijzer ervan). Alles werkt, inclusief {{ui:Open the sample site}}.

De andere statussen van de knop:

- {{ui:Could not save}}: sommige bestanden zijn niet gedownload. Controleer de verbinding en klik erop om het opnieuw te proberen.
- {{ui:Offline not available}}: dit browservenster kan geen offlinekopie bewaren (privévensters en sommige beheerde computers blokkeren dit). Gebruik een normaal venster.

Klik op {{ui:Offline ready}} om te zien wanneer de kopie is opgeslagen, met twee keuzes: {{ui:Save again (get the newest version)}} en {{ui:Remove the offline copy}}. Sla opnieuw op vóór een bezoek aan de bouwplaats, zodat de kopie overeenkomt met de nieuwste build. Meer in [Offline](common:offline).

:::offline
U bent nu offline. Als CivilCraft is opgeslagen voor offlinegebruik, werkt alles, inclusief het voorbeeldterrein. Zo niet, blijf dan in dit tabblad werken, maar laad het niet opnieuw voordat u weer online bent; zonder opgeslagen kopie mislukt {{ui:Open the sample site}} met "Het voorbeeld kon niet worden geladen".
:::

:::tip
Voor gebruik in het veld slaat u CivilCraft op voor offlinegebruik en zet u uw puntenbestanden op de laptop zelf. Projecten en exports worden zonder verbinding als downloads opgeslagen, zodat u de metingen van een dag kunt importeren, het terrein kunt controleren en het project op locatie kunt opslaan.
:::

Cloudopslag is nog niet beschikbaar, en desktopversies zijn nog niet uitgebracht. Voorlopig zijn de bestanden die u opslaat de enige kopie: bewaar ze ergens waar een back-up van wordt gemaakt.

## Add-ons die een bestand gebruikt

Wanneer u een project opslaat dat gegevens van een add-on bevat (de vinkjes voor Bouwvoorschriften, of een bron Adres naar terrein), registreert het bestand welke add-ons en welke versies. Opent u het op een computer zonder één ervan, dan toont een balk boven het plan dat en biedt aan hem toe te voegen vanuit de lijst van uw account. De registratie is alleen een notitie: het bestand wordt hoe dan ook geopend.

## Ongedaan maken vanuit Studio

Binnen CadCraft Studio wordt elke stap die u in CivilCraft afrondt aan Studio doorgegeven, zodat het ongedaan maken op projectniveau de laatste stap over alle apps heen kan terugdraaien. Studio draait een stap alleen terug wanneer de stapel voor ongedaan maken van CivilCraft precies is zoals die stap hem heeft achtergelaten; nadat u een ander bestand hebt geopend, slaat het dit venster over.

## Sluiten met niet-opgeslagen wijzigingen

Wanneer het project niet-opgeslagen wijzigingen heeft en u het tabblad sluit, de pagina herlaadt of de pagina verlaat, vraagt de browser of u wilt vertrekken. De bewoording en de vormgeving daarvan horen bij de browser en kunnen niet door CivilCraft worden gewijzigd. {{ui:New}}, en het openen van een project of LandXML-bestand, vragen in plaats daarvan in het eigen vak **Niet-opgeslagen wijzigingen** van CivilCraft, met {{ui:Cancel}}, {{ui:Don’t save}} en {{ui:Save a copy}}.
