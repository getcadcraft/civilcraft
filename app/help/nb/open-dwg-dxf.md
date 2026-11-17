---
title: Åpne en DWG eller DXF som tegningslinjer
summary: Åpne tegningens linjer på planen, lag for lag, bruk konturene, 3D-polylinjene og de lukkede konturene til terrengmodellen, og gjør punktblokkene om til landmålingspunkter.
keywords: landmålingskontroll, tekstkoter, dwg, dxf, cad, tegning, tegningslinjer, konturer, bruddlinjer, grense, polylinje, 3D-polylinje, lag, bakgrunnskart, topo, landmålingstegning, blokker, blokkreferanser, landmålingspunkter fra blokker, attributter, punktblokker, innsettingspunkt
from: da0f4c58
---

En topografisk landmåling kommer ofte som en tegning: konturer som polylinjer på sin høyde, bruddlinjer som 3D-polylinjer, tomtegrensen som en lukket polylinje. CivilCraft åpner tegningens **modellrom** som lag på planen, og kan gjøre disse linjene direkte om til terrengmodellen.

## Åpne tegningen

1. Klikk {{ui:Tegningslinjer}} i gruppen **Terrengmodell** (eller {{ui:Åpne}}, eller slipp filen på planen) og velg en `.dwg`- eller `.dxf`-fil. Tegningen leses på denne datamaskinen; ingenting lastes opp. DWG fra 2000 til 2018 og ASCII-DXF leses.
2. Dialogen **Tegningslinjer** lister tegningens lag som har linjer, lukkede figurer eller punkter, og om de har **høyder**. Lag som er av i tegningen starter uavkrysset. Tekst, skravurer, måltilsettinger og andre objekter som ikke er linjer, telles og utelates (dialogen sier hvilke).
3. Kontroller **Tegningsenheter**. Når tegningen sier hvilke enheter den bruker, konverterer CivilCraft dem til prosjektets (millimeter til meter, meter til fot, tommer til fot). En tegning i fot leses som amerikanske landmålingsfot uten skalering: de to avviker med 2 deler per million, og å skalere statsplan-koordinater med det ville flytte dem med fot. Når tegningen ikke sier hvilke enheter den bruker, leses tallene i prosjektets enheter; velg riktige enheter i listen hvis de ikke stemmer.
4. Under **Bruk for terrengmodellen** velger du hva hvert lag gir terrengmodellen (eller lar stå på **Bare vis den**). Lag med navn som konturer (TOPO, CONT, CNTR) som har høyder, starter som bruddlinjer.
5. Klikk {{ui:Legg til}}. Lagene vises under **GIS-layers** i venstre panel; hver bruk legges inn i terrengmodellen. Hver del er et trinn for seg: {{key:Mod+Z}} tar dem tilbake ett om gangen.

## Hva hver type lag kan gi

| Laget inneholder | Bruk for terrengmodellen |
|---|---|
| Konturer (polylinjer på en høyde) | Bruddlinjer på linjenes egen høyde, eller på ELEV-feltet |
| 3D-polylinjer | Bruddlinjer på deres egne høyder |
| En lukket kontur | Terrengmodellens grense (den største lukkede figuren, eller den du valgte) |
| Punkter med en høyde | Landmålingspunkter, beskrevet med lagnavnet |
| Linjer på høyde 0 (plan-tegningslinjer) | Ingenting: de blir på planen som en basistegning |

En tegning som CivilCraft har skrevet, har formlinjene sine som 3D-polylinjer som husker buene sine. Dialogen viser da **Formlinjer**: la den stå avkrysset for å hente dem tilbake som formlinjer med buene og bruksområdene sine (ett angrertrinn), eller fjern krysset for å lese dem som tegningslinjer, som alle andre lag.

Senere kan du bruke {{ui:Bruk for terrengmodellen}} i lagmenyen under **GIS-layers** for å gjøre det samme for et lag du bare viste.

## Landmålingspunkter fra blokker

Landmålingstegninger har ofte punktene sine som blokker: et lite symbol på hver måling, med attributter for punktnummer, beskrivelse og høyde. Når tegningen har blokkreferanser, har dialogen en seksjon **Landmålingspunkter fra blokker**:

1. Kryss av blokkene du vil ta (tabellen sier hvor mange referanser hver har, på hvilke lag, og hvilke attributter), eller kryss av lag for å ta alle blokkreferanser på dem.
2. Velg hvor hvert punkts **nummer**, **beskrivelse** og **høyde** kommer fra: et attributt, blokkens eller lagets navn, de neste ledige numrene, eller innsettingspunktets Z. CivilCraft starter på de sannsynlige attributtene (PT, DESC, ELEV og lignende), og tar høyden fra et attributt bare når blokkene står på null.
3. Fjern krysset for tegningslinjelagene hvis du bare vil ha punktene, og klikk deretter {{ui:Legg til}}.

Hver referanse blir ett landmålingspunkt på innsettingspunktet sitt. Bare referanser plassert i modellrommet teller; blokker nestet i andre blokker gjør ikke det. Numre som allerede finnes i prosjektet, eller brukes to ganger i tegningen, får nye numre etter det høyeste, og et høydeattributt som ikke er et tall gir det punktet uten høyde; statuslinjen teller begge. Tegningen endres aldri, og hvert punkt husker blokken sin: Egenskapene viser **Fra blokk** med blokken, laget og håndtaket. Å legge til punktene er ett trinn, så {{key:Mod+Z}} tar dem alle bort.

## Høyder skrevet som tekst, og kontrollen

Kotehøyder skrevet som tekst (eller i et blokkattributt som ikke er en landmålingspunktblokk) er ikke tegningslinjer. Seksjonen **Landmålte kotehøyder og kontroll** kan ta dem som landmålingspunkter, og lister det som ser feil ut i tegningen: enheter, koordinatsystem, avstand fra null, flate konturer, merkelige høyder, doble punkter. Se [Kontroller en landmålingstegning ved import](topic:survey-check).

## Hvordan tegningen leses

- Buer, sirkler, ellipser, bulet polylinjesegmenter og splines blir til korte rette stykker (hver 5° på det meste).
- Blokkreferanser tegnes der de er plassert, også nestede blokker; det en blokk har på lag 0 tar referansens lag.
- Objekter tegnet i et annet plan (en annen ekstruderingsretning) plasseres i verdenskoordinater.
- Hvert objekt får tre felt: LAYER, TYPE (objekttypen) og ELEV (høyden når alle punktene deler én).
- Koordinatene tas som de er: tegningen må bruke de samme koordinatene som prosjektet (for eksempel samme statsplan-sone). Koblede tegninger (xrefer) åpnes ikke: åpne dem hver for seg.

:::tip
En konturtegning gir den beste terrengmodellen med noen få kotehøyder på toppene og i søkkene, der konturer alene etterlater flate trekanter. Legg dem til som landmålingspunkter, eller fra et punktlag i tegningen.
:::
