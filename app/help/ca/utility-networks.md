---
title: Xarxes de serveis i OpenStreetMap
summary: Trams d'aigua, clavegueram, pluvials, gas, electricitat i telecomunicacions amb material, diàmetre, recobriment i propietari; dades d'OpenStreetMap des d'un fitxer JSON d'Overpass; encreuaments, seccions de rasa i volums; capes de servei en DWG, DXF i PDF; segments de tub i de cable en IFC.
keywords: servei, serveis, xarxa, xarxes, osm, openstreetmap, overpass, tub, cable, gas, clavegueram, pluvial, telecomunicacions, electricitat, aigua, hidrant, pou de registre, rasa, encreuament, distància lliure, recobriment, profunditat, dwg, ifc, georeferenciat, capes
from: 8a85dace
---

Dibuixeu els serveis soterrats d'un lloc com una xarxa per cada servei, comproveu on es creuen i envieu-los com a capes de dibuix i com a IFC.

## Crea trams

Obriu **Superfície, Més, Xarxes de serveis...**

- **Crea un tram a partir de la selecció** converteix el traçat, la línia característica o el tub seleccionats en un tram del servei que hàgiu triat. Després, ompliu a la taula el material, el diàmetre (mm), el recobriment (la profunditat fins a la part superior del tub o del cable) i el propietari.
- **Llegeix dades d'OpenStreetMap** llegeix un fitxer JSON d'Overpass que hàgiu desat (una consulta amb `out geom;`). El projecte necessita primer un sistema de coordenades, perquè les posicions d'OpenStreetMap són de latitud i longitud. Es llegeixen les canonades (segons la substància), els cables soterrats d'electricitat i de telecomunicacions, els hidrants, els pous de registre i els embornals pluvials. Qualsevol altra cosa es compta com a exclosa i es diu al missatge. Les línies aèries queden excloses.
- **Afegeix el mapa d'OpenStreetMap** l'afegeix sota el plànol. Només es dibuixa mentre les capes de mapa d'internet estiguin activades a Configuració.

## Comprovacions i sortides

- **Encreuaments**: els trams de serveis diferents que s'encreuen en planta es llisten amb l'alçada lliure entre ells quan hi ha una superfície del terreny; el mínim és un valor provisional que definiu vosaltres, no un valor de cap norma.
- **Rasa**: cada tram té una rasa (diàmetre del tub més la distància lliure a cada costat, talús lateral, llit) amb un volum. El total es mostra a la finestra i al CSV.
- **Dibuix**: els trams i els punts són a capes de servei (per exemple, U-WATR-RUN, U-POWR-RUN), i així arriben a PDF, DXF i DWG.
- **IFC**: els trams passen a l'exportació IFC com a segments de tub i segments de cable, amb hidrants, vàlvules i cambres, un sistema per servei, en el sistema de coordenades del projecte.

## Dades d'OpenStreetMap

Les dades d'OpenStreetMap tenen drets d'autor dels col·laboradors d'OpenStreetMap i es publiquen amb la llicència ODbL. L'atribució s'afegeix al dibuix, al CSV i a l'IFC. Si compartiu un fitxer que conté dades d'OpenStreetMap, mantingueu l'atribució i llegiu les condicions de compartir-ho igual de la llicència.

## Què encara no està implementat

Els trams encara no es dibuixen punt per punt a la planta amb una eina, i els encreuaments encara no es dibuixen a la vista del perfil (el càlcul està fet). Les profunditats, els diàmetres i les distàncies lliures comencen com a valors provisionals: useu els números de la vostra norma.
