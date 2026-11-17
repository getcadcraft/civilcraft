---
title: Kontrollera en mätritning vid import
summary: Läs nivåer som skrivits som text eller i blockattribut som mätpunkter, och kontrollera en DWG eller DXF för fel enheter, inget koordinatsystem, ett avlägset origo, platta höjdkurvor, udda nivåer och dubblerade punkter innan du bygger mark av den.
keywords: mätkontroll, importkontroll, mätnivåer, punkthöjder, textnivåer, nivåer som text, attribut, enheter, koordinatsystem, långt från origo, höjdkurvor vid noll, avvikande värden, dubbletter, problem, landskapsarkitekt, mätritning
from: d46acd24
---

En mätritning kan se rätt ut och ändå vara fel för en mark: dess enheter kan vara gissade, dess höjdkurvor kan ligga platt på höjden 0, eller dess nivåer kan vara skrivna som text som inte alls är geometri. Avsnittet **Mätnivåer och kontroll** i dialogrutan {{ui:Linjer}} (se [Öppna en DWG- eller DXF-fil som linjer](topic:open-dwg-dxf)) läser av de nivåerna och säger vad som ser fel ut innan något läggs till.

## Nivåer skrivna som text eller i attribut

Många mätritningar anger en punkthöjd som en liten text bredvid ett kryss, till exempel `104.37` eller `EL 104.37`, eller som ett attribut på ett punktblock. Dessa är inte linjer, så linjeläsaren lämnar dem utanför. Avsnittet räknar hur många som hittats och låter dig ta dem som **punkter**:

1. Bocka i **Ta … nivåer som mätpunkter**. De är avbockade från början, eftersom inte varje tal i en ritning är en höjd.
2. Text läses när den är en nivå för sig själv: ett tal med en decimaldel (`104.37`, `+104,37`, `-3.50`), eller ett tal efter `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` eller `LEVEL`, med valfritt `m`, `ft` eller `'` efter sig. Ett heltal ensamt (`12`) läses som ett parcell- eller bladnummer, inte som en nivå; text som `GATE 3` eller ett datum läses aldrig. Textens formateringskoder ignoreras.
3. För blockattribut, välj **Blockattribut som innehåller nivån**. CivilCraft hittar själv en tagg som heter ELEV, Z, LEVEL, RL eller liknande; välj en annan i listan om ritningen har en egen. Valet kommer ihåg för det filnamnet på den här datorn, så att den öppnas igen startar på samma tagg. En tagg du väljer tar även heltal som nivåer.
4. Klicka på {{ui:Lägg till}}. Punkterna numreras efter det högsta numret i projektet, varje punkt beskrivs med sitt lager (eller sitt block), och höjderna omvandlas till projektets enheter som resten av ritningen. Allt är ett steg: {{key:Mod+Z}} tar bort punkterna.

Texten sitter vid sin egen infogningspunkt (eller sin justeringspunkt när den har en). Text inuti block läses inte, och ritningen ändras aldrig.

## Kontrollen

Kontrollen körs på det du är på väg att ta in och listar vad den hittar, en rad för varje typ av problem:

| Den säger | Vad det betyder |
|---|---|
| **Units not stated** › **Enheter ej angivna** | Ritningen anger inte vilka enheter den har, så dess tal läses som projektets enheter. Kontrollera ett avstånd du känner till. |
| **Units converted** › **Enheter omvandlade** | Ritningens enheter skiljer sig från projektets och skalas (en notering, inget fel). |
| **The data spans … km** eller **… m** › **Data spänner över … km** eller **… m** | Utsträckningen är större än 200 km eller mindre än en halv meter, vilket oftast betyder fel enhet (millimeter lästa som meter, eller tvärtom). |
| **No coordinate system** › **Inget koordinatsystem** | Projektet har inget. Det är en varning när data ligger långt från noll, som statsplan- eller riksnätskoordinater gör. Se [Koordinatsystem](topic:coordinate-systems). |
| **Far from the origin** › **Långt från origo** | Data ligger mer än 100 km från noll. Långt från noll tappar 3D-vyer och exporter precision och skakar. |
| **Contour layer … has no height** › **Höjdkurvelager … saknar höjd** | Ett lager som heter som höjdkurvor (TOPO, CONT, CNTR, CONTOUR) innehåller linjer på höjden 0, så en mark byggd av dem skulle bli platt. |
| **Levels exactly 0** › **Nivåer exakt 0** | Vissa nivåer är 0 medan den typiska nivån ligger långt ifrån det: troligen saknas höjder. |
| **Levels far from the rest** › **Nivåer långt från resten** | Några nivåer ligger långt utanför de andra (mätt mot mitten av alla nivåer, så en brant tomt med stort spann flaggas inte), eller över 9 000 m eller under -11 000 m. |
| **Points on top of another point** › **Punkter ovanpå en annan punkt** | Två punkter på samma plats med samma nivå, eller med olika nivåer. |

Efter att du klickat på {{ui:Lägg till}} går samma rader till **Problem**, en för varje typ, med filnamnet, så att du kan återvända till dem. Kontrollen bedömer ritningen; den ändrar ingenting i den, och den hindrar inte att du använder ritningen.

:::tip
När kontrollen säger att höjdkurvor är platta på 0 och det finns nivåer skrivna som text: ta nivåerna som mätpunkter. De bär ofta de verkliga höjder som höjdkurvorna saknar.
:::

## Vad som inte kontrolleras

Kontrollen jämför inte ritningen med en andra mätning, och den kan inte avgöra vilket koordinatsystem ritningen är i: den säger bara att inget är inställt.
