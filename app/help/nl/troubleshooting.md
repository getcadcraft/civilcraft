---
title: Probleemoplossing
summary: Symptomen, oorzaken en oplossingen voor de problemen die mensen in CivilCraft tegenkomen, met de exacte meldingen die de app toont.
keywords: problemen, fouten, werkt niet, oplossen, help, meldingen, probleemoplossing, geweigerd, ontbrekend, verkeerd, verwisseld, hoogtelijnen ontbreken
from: a9f7dedc
---

Meldingen verschijnen in de statusbalk rechtsonder, in vakken in het linker- en rechterpaneel, en in de dialoogvensters. Ze worden hier geciteerd zoals de app ze toont.

## Bestanden openen

**"Dat bestand is groter dan 200 MB; CivilCraft opent zulke grote bestanden nog niet."**
Splits het puntenbestand, of verklein de gegevens voordat u het opent.

**"Kon site.json niet openen: Dit is geen CivilCraft-projectbestand."**
Het bestand eindigt op `.json` of begint met `{`, maar is geen CivilCraft-project. Puntenbestanden mogen niet beginnen met `{`.

**"Kon … niet openen. Dit projectbestand is van een nieuwere CivilCraft (versie 2)."**
Het project is opgeslagen door een nieuwere versie. Open het daar, of exporteer er LandXML uit.

**"Kon … niet openen. Dit is XML maar geen LandXML (het hoofdelement is <…>)."**
Het bestand is een ander soort XML. Exporteer LandXML uit het andere programma.

**"… bevat geen punten, TIN-terreinen of tracés die CivilCraft kan lezen."**
Alles in het bestand is iets wat CivilCraft overslaat (bijvoorbeeld alleen rasterterreinen, of alleen spiraaltracés). De rest van het bericht zegt wat erin zat. Zie [LandXML: wat wordt gelezen en geschreven](topic:landxml-reference).

**"Het voorbeeld kon niet worden geladen: …"**
{{ui:Het voorbeeldproject openen}} leest een bestand van de CadCraft-site. Zonder verbinding werkt dit alleen als CivilCraft is opgeslagen voor offline gebruik (de knop in de app-balk toont {{ui:Klaar voor offline gebruik}}). Ga online, klik op {{ui:Opslaan voor offline gebruik}}, dan werkt het daarna offline. Zie [Offline](common:offline).

**{{ui:Opslaan voor offline gebruik}} toont {{ui:Kon niet opslaan}}.**
Sommige bestanden zijn niet gedownload. Controleer de verbinding en klik opnieuw op de knop.

**{{ui:Opslaan voor offline gebruik}} toont {{ui:Offline gebruik is niet beschikbaar}}.**
Dit browservenster kan geen offline kopie bewaren, meestal omdat het een privévenster is of de computer wordt beheerd. Open CivilCraft in een normaal venster.

**Offline opent de app helemaal niet.**
Het is in deze browser niet opgeslagen voor offline gebruik, of de browser heeft de sitegegevens gewist (Safari doet dat voor sites die enkele weken niet zijn bezocht). Ga online, open CivilCraft en klik op {{ui:Opslaan voor offline gebruik}}.

**De offline kopie is een oudere versie.**
Klik op {{ui:Klaar voor offline gebruik}}, en daarna op {{ui:Opnieuw opslaan (de nieuwste versie ophalen)}} terwijl u online bent.

**Een bestand is grijs in het openvenster.**
Het venster toont alleen puntenbestanden, LandXML en projectbestanden op basis van hun extensies. Sleep het bestand in plaats daarvan op het plan, of hernoem het naar `.txt`.

## Punten importeren

**"Er konden geen punten uit dit bestand worden gelezen."**
Kies de kolomvolgorde zelf in **Kolommen**. Werkt niets, open het bestand dan in een teksteditor en controleer of er één punt per regel staat, met getallen erin.

**Het terrein lijkt gespiegeld, gedraaid of tot een lijn uitgerekt.**
Northing en Easting zijn verwisseld. De samenvatting zei "geraden uit het aantal kolommen". Kies PENZD in plaats van PNEZD (of andersom) bij **Kolommen**, of importeer opnieuw.

**Punten ver weg van de rest, en het plan is uitgezoomd tot een stip.**
Een regel heeft een typefout in een coördinaat, of het bestand mengt coördinatenstelsels. Zoek het punt (klik erop om het nummer te zien) en corrigeer het bestand.

**Regels vermeld onder "Regels niet gelezen".**
Zie de tabel in [Meetpunten importeren](topic:import-points#rows-that-are-not-read).

**Mijn oude punten zijn weg.**
Een puntenbestand importeren vervangt alle punten en wist ongedaan maken. Open uw opgeslagen project om ze terug te krijgen.

## Het terrein

**"Terrein: Niet gebouwd" met een rood vak.**
Het vak zegt waarom: "Een terrein heeft minstens drie punten met hoogten nodig.", "De punten liggen allemaal op één lijn: geen driehoeken.", "Geen punten met hoogten.", "De begrenzing overlapt de punten niet." of "Er blijven geen driehoeken binnen de begrenzing over." Controleer de kolomvolgorde, de puntengroepen (staan ze op {{ui:Weggelaten}}?) en de begrenzing.

**Hoogtelijnen snijden recht door een greppel of rug.**
Die lijn is geen breeklijn. Zet de groep op {{ui:Breeklijn}}, of teken hem met het gereedschap {{ui:Breeklijn}}. Zie [Het terrein opbouwen en verfijnen](topic:build-surface).

**Een breeklijngroep tekent een zigzag.**
De groep bevat meer dan één lijn, of de punten zijn niet langs de lijn genummerd. Zet de groep terug op {{ui:Punten}} en teken elke lijn met het gereedschap {{ui:Breeklijn}}.

**Lange, dunne driehoeken langs de buitenkant.**
Teken een begrenzing ({{key:O}}) of stel **Langste buitenrand** in.

**Helemaal geen hoogtelijnen, terwijl het terrein is opgebouwd.**
Ofwel {{ui:Hoogtelijnen}} staat uit onder **Weergave**, ofwel het interval is zo klein dat er meer dan 2,000 hoogtelijnniveaus zouden zijn. Kies een groter interval.

**Breeklijnen of een begrenzing veranderen niets.**
Het terrein komt uit LandXML ("Terrein (uit LandXML)"). Het wordt gebruikt zoals het is. Klik op {{ui:Het oppervlak opnieuw bouwen uit de punten}} om het in plaats daarvan uit de punten op te bouwen.

**"Er is nog geen terrein: open eerst de punten."**
Breeklijn, begrenzing en plateau hebben een bestaand maaiveldterrein nodig. Importeer eerst punten.

**"Klik op een meetpunt met een hoogte: een breeklijn neemt de hoogten van de punten over."**
Het gereedschap {{ui:Breeklijn}} kiest alleen punten. Zoom in en klik op een punt (een oranje vierkant toont het punt dat het zal nemen).

## Tekenen

**Mijn laatste punt verdween toen ik dubbelklikte om te voltooien.**
In deze versie voltooit dubbelklikken het tracé, het plateau, de breeklijn of de begrenzing, maar laat het punt waarop u dubbelklikte weg. Klik één keer op het laatste punt en druk op {{key:Enter}}. Gebruik {{key:Mod+Z}} als dat al gebeurd is, en teken daarna opnieuw.

**Ik kan een tekening niet voltooien op een tablet.**
Voltooien vereist {{key:Enter}}; er is nog geen knop op het scherm. Sluit een toetsenbord aan. Zie [Muis, trackpad en aanraken](topic:keyboard#mouse-trackpad-and-touch).

**Slepen om een punt te plaatsen verschuift de weergave.**
Een sleep van meer dan een paar pixels verschuift het plan in elk gereedschap. Klik zonder te bewegen.

**"Een tracé heeft minstens twee punten nodig." / "Een plateau heeft minstens drie hoeken nodig." / "Een leidingtraject heeft minstens twee kunstwerken nodig."**
U drukte te vroeg op {{key:Enter}}. De tekening wordt weggegooid; begin opnieuw.

**Toetsen zoals A of G doen niets.**
Een tekstvak of een lijst in een paneel heeft nog de focus, dus de letters gaan daarheen. Klik één keer op het plan en druk daarna op de toets. Op een Mac is de Backspace-toets voor de browser de Delete-toets: gebruik Fn en Delete om een selectie te verwijderen.

## Tracés en profielen

**"De bochten bij PI 2 en PI 3 overlappen elkaar: … Gebruik kleinere stralen."**
Twee bochten hebben meer raaklijn nodig dan er tussen hun PI's ligt. Verlaag een of beide stralen in de PI-tabel, of verplaats de PI's verder uit elkaar.

**"PI 3 keert direct terug; er kan geen bocht worden gemaakt."**
Het tracé keert bij dat PI op zichzelf terug. Verplaats of verwijder het PI.

**"Dit tracé heeft geen maaiveld onder zich om vanaf te beginnen."**
Het tracé ligt naast het terrein. Verplaats het naar het terrein, of voeg PVI's toe door te klikken terwijl {{ui:PVI's toevoegen}} aan staat.

**"De verticale bocht bij PVI 3 (L = …) begint voordat de bocht of het PVI ervoor eindigt." / "… loopt voorbij het volgende PVI."**
Verkort de bochtlengte of verplaats de PVI's verder uit elkaar.

**"Er is al een PVI bij …"**
Bij die stationering is al een PVI. Klik ergens anders, of sleep het bestaande PVI.

**Het profielbeeld is leeg: "Teken een tracé om het profiel te zien."**
Er is geen tracé, of het geselecteerde tracé heeft fouten.

## Corridors en plateaus

**"De corridor heeft een ontwerpprofiel zonder fouten nodig."**
Start een ontwerpprofiel ({{ui:Beginnen vanaf het maaiveld}}) en los eventuele overlappende bochten op.

**"… de taluds lopen van het terrein af voordat ze het maaiveld raken." / "… taluds lopen van het terrein af voordat ze het raken …"**
De afwerking bereikt de rand van het terrein voordat ze het maaiveld raakt. Verplaats het ontwerp van de rand af, of breng het dichter naar het maaiveld. Een nieuw plateau dat deels buiten het terrein is getekend, kan op hoogte 0 beginnen: typ een echte hoogte.

**"De ontgravingslijnen van de corridor kruisen …" / "De ontgravingslijn kruist zichzelf …"**
Taluds van verschillende zijden lopen in elkaar: krappe bochten, smalle plateaus, diepe ontgravingen of hoge ophogingen. Gebruik een grotere straal, een smallere opbouw, een breder plateau of steilere taluds.

**"Nog geen volumes: een plateau moet zonder problemen kunnen worden afgewerkt."**
Los de problemen op die in het rode vak erboven staan.

**{{ui:Voorgesteld (afgewerkt)}} is grijs.**
Nog geen plateau of corridor is afgewerkt.

## Leidingen

**"P2 heeft nog geen binnenonderkanten."**
Klik op {{ui:Binnenonderkanten uit de regels instellen}} of typ de binnenonderkanten.

**"P1: geen maaiveld bij S1 om vanaf te beginnen."**
Het bovenstroomse kunstwerk ligt naast het terrein en heeft geen rand. Typ er een deksel­hoogte voor in.

**Alle leidingen worden gemarkeerd nadat ik een kunstwerk heb verplaatst.**
Een kunstwerk verplaatsen wijzigt de binnenonderkanten niet. Klik op {{ui:Alle binnenonderkanten uit de regels instellen}}.

Alle meldingen over het netwerk worden uitgelegd in [Een zwaartekrachtleidingnet opzetten](topic:pipe-network#read-and-fix-problems).

## Opslaan en exporteren

**"Nog niets om te exporteren." / "Nog niets om te plotten."**
Het project is leeg. Importeer eerst punten.

**Ik kan het opgeslagen bestand niet vinden.**
Het staat in de downloads van de browser (meestal de map Downloads). Zie [Bestanden die u kunt openen, opslaan en exporteren](topic:files#where-the-files-go).

**De PDF-schaal klopt niet op papier.**
Druk af op 100% of werkelijke grootte, niet op "passend op pagina".

**Vraagtekens in de PDF-tekst.**
Namen of beschrijvingen gebruiken tekens buiten de West-Europese set. Het statusbericht telt ze. Hernoem met gewone tekens.

**De plot wordt aan de randen afgesneden.**
De schaal is te groot voor het blad. Kies de schaal met "(past)", een groter blad, of {{ui:Wat op het scherm staat}}.

**{{key:Mod+P}} opende het afdrukvenster van de browser.**
De pagina had de focus niet. Sluit het venster, klik op het plan en druk opnieuw op {{key:Mod+P}}, of klik op {{ui:PDF}}.

## De app zelf

**Het scherm is leeg of de werkbalk doet niets.**
Gebruik een actuele versie van Chrome, Edge, Firefox of Safari en laad de pagina opnieuw. Zie [Browsers](common:browsers).

**De app is traag met een groot puntenbestand.**
Schakel {{ui:Driehoeken}}, {{ui:Puntlabels}} en {{ui:Hoogtebanden}} uit, en gebruik een groter interval voor hoogtelijnen. Zeer grote terreinen hebben na elke wijziging even nodig om opnieuw op te bouwen.

**De browser vraagt "Site verlaten?"**
Het project heeft niet-opgeslagen wijzigingen. Blijf, sla op met {{key:Mod+S}} en verlaat daarna de site.
