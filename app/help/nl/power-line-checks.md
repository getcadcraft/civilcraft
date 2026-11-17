---
title: Controles elektriciteitslijnen
summary: Wat CivilCraft op elke lijn en kabel controleert, altijd actueel: vrije hoogten, afstanden, uitzwaai, optrek, mastbelastingen en dimensionering, aansluitstukken, stagen, funderingen, ontbrekende gegevens, verbindingen, overbelasting en spanningsval.
keywords: controles, vrije hoogte, grondvrije hoogte, obstakel, kruising, fasenafstand, isolatorzwaai, optrek, mastbelasting, nominale belasting, dimensionering, fundering, stag, spanstag, aansluitstuk, dwarsarm, spanningsval, overbelasting, ontbrekende gegevens, losgekoppeld
from: e6a0da47
---

**Controles** in de sectie Elektriciteitslijnen toont elk probleem: rood voor wat faalt en oranje voor waarschuwingen. Klik op een regel om de lijn, mast, kabel of apparatuur te selecteren waar het over gaat; falende masten en overspanningen worden rood omcirkeld op het plan zolang de werkomgeving open is.

:::warning
Een ontwerphulpmiddel: dit zijn controles van uw ontwerp tegen uw eigen regels, geen certificering.
:::

## Vrije hoogten

De laagste fase van de geleider wordt langs elke overspanning gevolgd bij elk belastinggeval. De laagste vrije hoogte boven het maaiveld moet de **vrijhoogteregel** van de lijn halen. Waar een overspanning een **obstakel** kruist (getekend met {{ui:Obstakel}}: een punt of een lijn, met de hoogte boven het maaiveld en de eigen vrijhoogteregel), wordt de vrije hoogte boven de bovenkant van het obstakel op dezelfde manier gecontroleerd.

**Wat de werkomgeving Landschap boven het maaiveld zet, telt ook mee.** Losse planten (hun kroon op volwassen breedte en hoogte), hagen en plantvakken (de hoogste soort erin) en muren (hun bovenkant) zijn obstakels onder een lijn, zonder dat u ze opnieuw tekent. Ze houden de regels die zijn ingesteld in {{ui:Belastinggevallen en grenzen…}}: **Landschapsplanten onder een lijn** (de voorbeeldsets gebruiken *Bomen en planten*, 3 m) en **Landschapsmuren onder een lijn** (*Gebouw*); kies **Niet gecontroleerd** om ze buiten beschouwing te laten. De vrije hoogte wordt recht omhoog gemeten van de top van de plant of muur tot de geleider waar de overspanning erover heen gaat; de afstand opzij tot een kroon naast de lijn wordt niet gecontroleerd. Een boom verplaatsen of een muur verhogen verandert de controles meteen.

Uw vrijhoogteregels zijn van uzelf: open ze met **Regels…** naast elke **Vrijhoogteregel** (of via {{ui:Belastinggevallen en grenzen…}}) om ze toe te voegen, te hernoemen, te wijzigen of te verwijderen.

## Afstanden en uitzwaai

- **Benodigde fasenafstand**: k·√(doorhang + isolatorlengte) + U/150, met de doorhang in het warme geval en de spanning U in kV (een gangbare vorm; k komt uit uw regelset). Vergeleken met de fasenafstand van de dwarsarm.
- **Isolatorzwaai** bij hangmasten, onder het windgeval: atan(transversale belasting ÷ verticale belasting), tegen de grootste zwaai van de regelset.
- **Optrek**: een hangmast die lager ligt dan zijn buren kan bij koude omhoog worden getrokken; hij wordt gemarkeerd.

## Mastbelastingen en dimensionering

Voor elke mast en elk belastinggeval, met elke geleider van de lijn:

- **Transversaal**: wind per meter × de windoverspanning (de helft van de twee overspanningen), plus 2·H·sin(hoek ÷ 2) bij een hoek.
- **Langs de lijn**: het verschil van de trekkrachten aan beide zijden bij een eindmast of hoek; bij een hangmast alleen onder ijs aan één kant (elke overspanning apart berekend, wat aan de veilige kant zit).
- **Verticaal**: de verticale belasting per meter × de gewichtsoverspanning (tussen de laagste punten aan beide kanten) plus de apparatuur.

De horizontale belasting wordt naar het nominale punt van de mast gebracht (equivalente belasting = belasting × bevestigingshoogte ÷ hoogte van het nominale punt) en vergeleken met de **nominale belasting** × de factor van de regelset. Is hij te zwak, dan wordt de kleinste mast van hetzelfde materiaal in uw bibliotheek die hem wel draagt, voorgesteld. Een mast met een **stag** geeft de horizontale belasting door aan het stag, dat belasting ÷ sin(stag-hoek) draagt en wordt getoetst aan de eigen sterkte.

Aansluitstukken (klemmen, isolatoren, dwarsarmen) worden getoetst aan hun nominale belasting: een verankerend aansluitstuk draagt de trekkracht van de geleider, een hangend aansluitstuk zijn deel van de verticale en transversale belasting. De getoonde **fundering** is de diepte van de mast in de grond en een gat dat iets breder is dan zijn voet.

## Gegevens, verbindingen en stroom

- Een onderdeel met een leeg verplicht veld, of met een sleutel die niet in de bibliotheek staat.
- Een kabelroute-einde of apparatuur die op niets is aangesloten.
- **Spanningsval** en **stroom** van elke bron (apparatuur aangemerkt als bron) naar de belastingen (kW en arbeidsfactor op apparatuur), langs bovenleidingoverspanningen en kabels: √3·I·L·(R cos φ + X sin φ), met R bij 20 °C. Meer dan de stroomsterkte van de kabel, of meer spanningsval dan de regelset toestaat, wordt gemarkeerd.
