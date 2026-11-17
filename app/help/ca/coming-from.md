---
title: Si veniu d'un altre programari civil
summary: Com els fluxos de treball de disseny civil coneguts es corresponen amb CivilCraft, i les diferències que confonen els usuaris experimentats durant la primera hora.
keywords: canvi, migració, coneguda, diferències, flux de treball, ordres, correspondència, cogo, corredor, explanació, xarxa de canonades, estils, línia d'ordres
from: feae37d6
---

Si heu usat Civil 3D, ja coneixeu les idees de CivilCraft: punts i grups de punts, superfícies TIN amb línies de ruptura i contorns, traçats per PI, perfils per PVI, seccions tipus unides en corredors, explanació fins a les línies d'arrencada, xarxes de canonades per gravetat, LandXML. El que és diferent és gairebé tot el que ho envolta: no hi ha fitxer de dibuix, ni línia d'ordres (tret que trieu l'estil de menú {{ui:Dibuix clàssic}}), ni estils, ni Prospector, ni diàlegs de configuració. CivilCraft és una eina petita i centrada, en un navegador, i en aquesta versió fa només una part del que fa un paquet civil complet. Aquesta pàgina relaciona el que coneixeu amb el que hi ha aquí.

:::tip
Si us agrada la cinta de Civil 3D, trieu l'estil de menú {{ui:Cinta civil}} a {{ui:Configuració}} › {{ui:CivilCraft}} › {{ui:Menús, tecles i ratolí}}: les pestanyes Inici, Superfícies, Modifica, Geolocalització, Visualitza i Sortida; el botó del mig desplaça la vista, i {{key:Shift}} amb el botó del mig orbita la vista 3D. Si escriviu ordres, {{ui:Dibuix clàssic}} afegeix una línia d'ordres (ALIGNMENT, PAD, PROFILE, ZOOM …). Vegeu [Menús, tecles i ratolí](topic:menus-keys-and-mouse).
:::

## Mapa del flux de treball

| Què voleu fer | Via coneguda | A CivilCraft |
|---|---|---|
| Importar punts de topografia | Importar punts amb un format de fitxer de punts | {{ui:Obre}}, i després comproveu l'ordre de les columnes a **Importa punts** ([Importa punts de topografia](topic:import-points)) |
| Ordenar punts | Grups de punts, claus de descripció | Grups automàtics per la primera paraula de la descripció; sense claus de descripció |
| Editar un punt | Editor de punts, nanses | Feu-hi clic i escriviu a Propietats, o arrossegueu-lo ([Edita un punt de topografia](topic:edit-points)) |
| Construir el terreny existent | Crear una superfície, afegir grups de punts com a dades | Automàtic: la superfície es reconstrueix quan canvien les seves entrades |
| Afegir línies de ruptura | Afegir línies de ruptura a partir de polilínies o línies característiques | Configureu un grup de punts a {{ui:Línia de ruptura}}, o feu clic als punts amb l'eina {{ui:Línia de ruptura}} ({{key:B}}) |
| Retallar la superfície | Contorn exterior, contorn ocult, longitud màxima de triangle | {{ui:Contorn}} ({{key:O}}, només exterior) i **Aresta exterior més llarga** |
| Mostrar les corbes de nivell | Estil de superfície | **Visualització** al panell esquerre: interval, principal cada, etiquetes, bandes, fletxes de pendent |
| Disposar un eix | Eines de creació de traçats, configuració de corbes i espirals | {{ui:Traçat}} ({{key:A}}): feu clic als PI, {{key:Enter}}; radis i longituds d'espiral a la taula de PI |
| Crear una vista de perfil | Assistent de vista de perfil, bandes | {{ui:Perfil}} ({{key:R}}): una vista de perfil sota el plànol, sempre ajustada |
| Dissenyar la pendent | Eines de disposició de perfil | {{ui:Comença des del terreny}}, {{ui:Afegeix PVI}} ({{key:I}}), arrossegueu els PVI, escriviu **Corba L** |
| Construir una carretera | Seccions tipus, subseccions, corredor, objectius, regions | Marqueu **Desplaça una secció tipus al llarg del perfil de disseny** sota el traçat; un carril, una vorera i un talús a cada costat, o cada costat construït per peces (cuneta, vorada, vorera …) |
| Explanar una plataforma | Línies característiques, grups d'explanació, criteris d'explanació | {{ui:Plataforma}} ({{key:G}}): una plataforma plana amb talusos de desmunt i terraplè fins a l'arrencada |
| Calcular moviments de terres | Superfícies de volum, tauler de volums | **Moviments de terres** al panell dret, mètode de graella, s'actualitza en viu |
| Disposar pluvials o sanitari | Xarxa de canonades amb llista de peces, regles | {{ui:Canonades}} ({{key:P}}): feu clic a les estructures aigües avall; tres regles que definiu; cotes de solera automàtiques |
| Intercanviar amb altres | Importació i exportació LandXML | {{ui:Obre}} un fitxer LandXML; {{ui:LandXML}} per exportar ([Intercanvia LandXML](topic:landxml)) |
| Enviar la línia a CAD | Exportar a DWG | {{ui:DWG}} (format 2000 a 2018) o {{ui:DXF}} (R12) |
| Traçar | Presentacions, finestres gràfiques, jocs de fulls | {{ui:PDF}}: un full horitzontal del plànol a una escala triada; fulls de planta i de perfil, i fulls de seccions en PDF |
| Compartir treball entre fitxers | Dreceres de dades, referències | No disponible: un projecte per fitxer |
| Desfer | Desfés | {{key:Mod+Z}} i {{key:Mod+Y}}, 200 passos; els ajustos de visualització no són passos per desfer |

## Diferències que fan entrebancar la gent

**No hi ha línia d'ordres** tret que trieu l'estil de menú {{ui:Dibuix clàssic}}. Les eines són botons de la barra d'eines i lletres soles: {{key:A}} traçat, {{key:G}} plataforma, {{key:P}} canonades, {{key:B}} línia de ruptura, {{key:O}} contorn, {{key:R}} perfil, {{key:I}} afegeix PVI, {{key:V}} selecciona, {{key:F}} ajusta. En els altres estils de menú, escriure un nom d'ordre no fa res. Vegeu [Tecles i ratolí](topic:keyboard).

**Enter acaba; el doble clic és arriscat.** Feu clic una vegada al darrer punt i després premeu {{key:Enter}}. En aquesta versió el doble clic també acaba, però elimina el punt on heu fet doble clic. El clic dret no acaba ni repeteix; només desplaça la vista quan l'arrossegueu.

**Tot és dinàmic, sempre.** Canvieu un grup de punts, un radi, un PVI o una pendent de plataforma, i la superfície, les corbes de nivell, el corredor, les línies d'arrencada i els volums s'actualitzen de seguida. No hi ha res a reconstruir i res no queda desactualitzat.

**Res no és un objecte de dibuix.** El plànol és una vista del disseny, no un dibuix que pugueu editar amb ordres CAD. No podeu afegir les vostres pròpies línies o textos, canviar el color d'una capa ni descompondre res. Exporteu a DXF i acabeu el dibuix en un programa CAD.

**Sense estils.** Els colors, els gruixos de línia, les mides d'etiqueta i els noms de capa són fixos (vegeu [Capes del plànol](topic:plan-layers)). Paper i Model a la barra d'aplicacions canvien entre una pantalla clara i una de fosca.

**Un de cada.** Una superfície de terreny existent, un resultat explanat i una xarxa de canonades per projecte. Molts traçats i plataformes estan bé.

**Les unitats són etiquetes.** Triar {{ui:Peus d'enquesta dels EUA}} o {{ui:Metres}} no converteix res. No hi ha escala de dibuix. Un sistema de coordenades és opcional: definiu-lo a {{ui:Coordenades}} i no es mou res, només indica què signifiquen els números (vegeu [Definiu el sistema de coordenades del projecte](topic:coordinate-systems)). Els peus es tracten com a peus d'enquesta dels EUA quan s'escriuen a LandXML.

**Les línies de ruptura s'uneixen en ordre de número de punt.** Un grup configurat com a {{ui:Línia de ruptura}} esdevé una sola línia que passa per tots els seus punts, en ordre de número. Els codis compartits (dues línies de flux codificades "FL") fan una sola línia en zigzag; dibuixeu-les a mà.

**Les abscisses semblen iguals, les metres difereixen.** Els peus usen PK de 100 ft (12+34.56); les metres usen PK de 1000 m (1+234.567).

**Suprimir en un Mac.** La tecla marcada delete del Mac és Backspace al navegador. Useu Fn i delete, o el botó {{ui:Elimina}}, per suprimir una selecció.

**Els fitxers són baixades.** {{ui:Desa}} baixa un fitxer `.civilcraft.json` cada vegada; no hi ha "desar sobre el fitxer obert". Una còpia de recuperació del treball no desat es guarda en aquest navegador ([Recupera el treball no desat](common:recover)). Obrir un fitxer de punts substitueix els punts sense preguntar. Vegeu [Fitxers que podeu obrir, desar i exportar](topic:files).

**Les regles són vostres.** Les regles de la xarxa de canonades i la secció tipus del corredor comencen amb valors de marcador de posició que no són cap norma. Definiu-ne els vostres abans de confiar en cap comprovació.

**Els volums es basen en graella.** El desmunt i el terraplè surten d'una graella fina entre les dues superfícies, dins de les línies d'arrencada, sense esponjament ni contracció. Són propers però no iguals a un volum TIN a TIN.

## Què falta

Espirals que no siguin clotoides, seccions tipus que canvien al llarg de la carretera, plataformes inclinades, capacitat d'embornals i retenció, catàlegs de peces, canonades en perfil, disposició de parcel·les i dimensionament de lots, compensació per mínims quadrats i bases de dades topogràfiques, obrir DWG, i més. La llista completa, amb el que cal fer avui, és a [Encara no implementat](topic:not-built-yet).
