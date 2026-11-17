---
title: Encara no implementat
summary: Què no fa encara aquesta versió de CivilCraft i què fer avui en lloc d'això.
keywords: falta, limitacions, full de ruta, no disponible, espirals, eixamplament, dwg, dxf, embornals, retenció, perfils transversals, properament, límits
from: a2d970ef
---

CivilCraft està en fase inicial. Aquesta pàgina enumera el que la versió actual no fa, perquè no hi busqueu. No s'hi promet cap data.

## Punts

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Afegir un segon fitxer de punts al primer | Uniu els fitxers en un editor de text o en un full de càlcul abans |
| Exportar un fitxer de text de punts | Exporteu LandXML (els punts surten com a CgPoints), useu {{ui:Export}} del GIS (punts amb els camps P, N, E, Z i D), o copieu els punts amb {{ui:Copy}} en un full de càlcul |
| Estils d'etiquetes de punts, símbols per clau de descripció, corbes (arcs) a partir de codis de línia, un fitxer de claus de descripció per compartir entre projectes | Les etiquetes mostren el número, la cota i la descripció, o menys ([Configuració de CivilCraft](topic:settings)); les claus es guarden al fitxer de projecte |
| Conversió d'unitats | Convertiu el fitxer abans d'importar-lo; **Unitats** només canvia l'etiqueta |

## Superfícies

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Més d'una superfície construïda a partir de punts | Un projecte per superfície |
| Ocultar els límits (interiors) | Useu **Vora exterior més llarga** o un límit exterior |
| Seleccionar o editar una línia de ruptura dibuixada | {{key:Mod+Z}}, o {{ui:Elimina les línies de ruptura dibuixades}} i torneu a dibuixar-la |
| Editar una superfície llegida de LandXML (línies de ruptura, límit) | {{ui:Reconstrueix la superfície a partir dels punts}} |
| Editar una superfície feta a partir d'una graella d'altituds | Torneu a importar la graella amb altres opcions |
| Convertir una superfície llegida de LandXML quan canvia el sistema de coordenades | Primer, {{ui:Reconstrueix la superfície a partir dels punts}} |
| Cotes puntuals etiquetades i valors de pendent | Llegiu-los a la barra d'estat, o acoloriu la superfície per pendent amb **Anàlisi de pendent** a l'espai de treball Paisatge ([Explanació per al paisatge](topic:landscape-grading#grading-checks)) |

## Traçats i perfils

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Espirals que no siguin clotoides; una espiral entre dues corbes (transicions compostes) | Les espirals clotoides als extrems d'una corba estan disponibles; les altres es nomenen i s'ometen en importar LandXML |
| Inserir un PI entre dos altres | Torneu a dibuixar el traçat, o torneu a escriure les coordenades del PI |
| Traçats a partir d'objectes, desplaçaments, eixamplaments | Dibuixeu per PI |
| Escriure K per a una corba vertical | Escriviu L (es mostra K) |
| Corbes verticals circulars i no simètriques | Només corbes parabòliques simètriques |
| Més d'un perfil de projecte per traçat | Un traçat per variant |
| Fer zoom a la vista de perfil, bandes de perfil sota el perfil | La vista de perfil s'ajusta a tot el traçat; imprimiu-la en [fulls de pla i perfil](topic:plan-profile-sheets) |
| Seccions en DWG o LandXML | Fulls de seccions en PDF; {{ui:CSV}} de les àrees i els volums |
| Línies de mostreig en angle, o d'amplades diferents al llarg de la carretera | Una amplada a cada costat per a tot el traçat |

## Corredors

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Medianes, barreres i un peralt que gira les plantilles | Dibuixeu-les com a plantilles ([Plantilles de corredor](topic:corridor-templates)); les plantilles per punt quilomètric encara no tenen en compte el peralt |
| Un canvi gradual entre les plantilles de dues regions (transicions, cònics) | Canvieu la plantilla en un punt quilomètric, o assigneu a un punt una amplada objectiu a una línia dibuixada com a cònic |
| Rotació al voltant d'una vora, peralt en LandXML | El peralt gira al voltant de l'eix en corbes circulars; amplieu un carril amb una amplada objectiu a una línia característica |
| Objectius per als talussos laterals (sortida fins a una línia o una superfície), superfícies de corredor pròpies | Els objectius mouen les vores de la calçada i de les espatlleres ([Corredors](topic:corridor)); el corredor s'anivella a la superfície projectada |
| Corredors exportats com a calçades LandXML; un segon corredor en un traçat a l'exportació IFC | S'exporta la superfície projectada |
| Plantilles de terreny que canvien la superfície projectada, en 3D o en les seccions | Donen àrees i volums de cada capa ([Plantilles de terreny](topic:corridor-templates#terrain-templates)) |
| Trajectòries de gir amb velocitat, lliscament de pneumàtics, temps de direcció, remolcs de direcció o distància lliure del cos; una biblioteca de vehicles de disseny estàndard; una trajectòria de gir dibuixada arrossegant el vehicle | Trajectòries de gir a poca velocitat al llarg d'una línia característica o d'un traçat, amb les vostres pròpies mides de vehicle ([Trajectòries de gir de vehicles](topic:swept-paths)) |

## Explanació i volums

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Bancals, línies característiques obertes explanades cap al disseny, explanació cap a una línia característica d'un altre lloc | Tanqueu la línia característica ([Línies característiques](topic:feature-lines)), o useu-la com a línia de ruptura del terreny existent |
| Inserir o eliminar un vèrtex de línia característica | Torneu a dibuixar la línia, o feu-ne un desfasament escalonat |
| Arcs en línies de ruptura dibuixades (per punts topogràfics), espirals en línies característiques | Dibuixeu una línia característica amb arcs i useu-la com a línia de ruptura del terreny existent |
| Explanació fins a una distància, una cota o una altra superfície | Només sortida al terreny existent |
| Afegir o treure una cantonada de plataforma | Suprimiu la plataforma i torneu a dibuixar-la |
| Volums TIN a TIN (prisma), triar la mida de la cel·la de la graella | Mètode de graella, mida de cel·la que es tria automàticament |
| Expansió i contracció, capa vegetal, gruixos de paviment | Apliqueu els factors als números informats vosaltres mateixos |
| Costos de transport gratuït i de sobretransport, transport entre traçats diferents, zones d'emprèstit i de residus col·locades al plànol | El diagrama de masses amb punts d'equilibri, volums moguts i distàncies mitjanes de transport |

## Xarxes de canonades

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Més d'una xarxa per projecte | Projectes separats per a pluvial i residual |
| Conduccions d'aigua: qualitat i edat de l'aigua, controls basats en regles, altres tipus de vàlvula (control de cabal, estrangulació, sostingut), bombes indicades per potència, demanda que depèn de la pressió, una opció Darcy–Weisbach, un catàleg de canonades amb gruixos de paret i classes de pressió. La resta de xarxes a pressió és al laboratori: [Conduccions d'aigua](topic:water-mains) | Comproveu-ho en programari de distribució d'aigua; els cabals de disseny residuals són a [Cabals de disseny residuals](topic:sanitary-design) |
| Fluxos de clavegueram en el temps (hidrogrames, encaminament dinàmic, emmagatzematge, bombes, desbordaments) | [Cabals de disseny residuals](topic:sanitary-design) dona el cabal punta constant que fa servir un full de disseny |
| Capacitat dels embornals, dispersió a la cuneta, encaminament de retenció, hidrogrames, pèrdues d'energia diferents d'un únic coeficient de nus | Comproveu-les en un altre programari; els cabals, les mides i les línies de gradient hidràulic són a [Drenatge pluvial](topic:storm-drainage) |
| Conques al PDF, DWG, DXF o LandXML del traçat; conques a partir de la superfície (divisòries) | Dibuixeu les conques a mà; es desen al fitxer de projecte |
| Catàlegs de canonades, canonades no circulars, estructures que no són caixes ni cilindres verticals (cons, graons, bancals), una categoria de drenatge a la biblioteca | Tipus d'estructura a partir de paràmetres ([Xarxa de canonades](topic:pipe-network)); canonades amb un diàmetre |
| Canonades a la vista de perfil, canonades corbades | Llegiu les cotes de solera i el recobriment al panell de la dreta |

## Parcel·les

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Disposar lots per àrea o façana, parcel·les a partir de les línies del voltant, dret de pas | Dibuixeu cada parcel·la per les seves cantonades, o introduïu-ne els rumbs i les distàncies |
| Taules de corbes i taules de línies al plànol; etiquetes moguts a mà | Cada tram s'etiqueta al llarg de si mateix |
| Parcel·les en LandXML | Les parcel·les es desen al fitxer de projecte i van al PDF, DWG i DXF |

## Poligonals

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Ajust de mínims quadrats, la regla del trànsit, ponderació d'angles segons distàncies | La regla de la brúixola |
| Angles de desviació, angles zenitals i distàncies inclinades, cotes per nivellació trigonomètrica | Reduïu-ho bé a distàncies i angles horitzontals, o a rumbs |
| Visuals laterals, fitxers de dades crues de col·lectors de dades | Importeu els punts com a fitxer de punts |

## Replanteig

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Estaques de desplaçament (punts de referència retirats de l'estaca), estaques de talús al punt de captura | Estaqueu als desplaçaments que necessiteu, inclosos els més enllà de l'espatlera |
| Enviar estaques directament en el format propi d'un col·lector de dades | El CSV s'obre en el programari d'oficina de la majoria de col·lectors |
| Replantejar canonades, plataformes i parcel·les | Useu punts topogràfics a prop d'un traçat, o els trams de la parcel·la |

## Fitxers i sortida

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Text, trames i cotes de DWG o DXF; espai de paper; dibuixos enllaçats (xrefs); DXF binari | Es pot obrir la geometria de l'espai model ([Obre un DWG o DXF com a geometria](topic:open-dwg-dxf)); obriu els dibuixos enllaçats per separat |
| Moure diversos punts alhora arrossegant | Talleu i enganxeu-los, o editeu-los d'un en un |
| Fulls en vertical, caixetins propis, finestres gràfiques que organitzeu, fulls de pla i perfil en DWG | Un full de pla horitzontal per PDF, o fulls de pla i perfil al llarg d'un traçat (PDF) |
| Traçar bandes d'altituds i perfils | Les bandes només són a pantalla; feu una captura de pantalla si les necessiteu |
| Canviar noms de capa, colors o estils d'etiqueta | Canvieu-los en un programa CAD després d'exportar el DXF |
| Desament al núvol i historial de versions | Deseu els fitxers `.civilcraft.json` i feu-ne còpies de seguretat; per treballar en un projecte conjuntament, useu una sessió en directe a CadCraft Studio ([Dissenyeu un lloc junts, en directe](topic:work-live)) |
| CadCraft Studio per a iPad i iPhone, i des de Google Play | Useu CivilCraft al navegador del dispositiu; a Android, CadCraft Studio s'instal·la des del seu APK a getcadcraft.com/download |
| Obrir diversos fitxers de punts o de projecte alhora | Un fitxer per obertura (els fitxers GIS que van junts, com les parts d'un shapefile, s'obren junts) |

## Paisatge

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Caps i broquets de fabricants | Caps genèrics, o afegiu els vostres caps des d'un fitxer; les dades dels fabricants arriben a mesura que donin permís |
| Longituds laterals màximes per a línies de degoteig, cabals en el temps, bombes, xarxes de canonades en bucle | Mantingueu els trams de degoteig a la longitud publicada pel fabricant; la comprovació necessita una xarxa ramificada |
| El contorn exacte d'un objecte de forma lliure còncau; el volum sota terra mesurat exactament | L'envolupant convexa s'anivella i el volum sota terra és una estimació (indicat a Propietats) |
| Plantes a Col·loca des de la biblioteca de BimCraft i ModelCraft | Exporteu l'IFC de paisatge i obriu-lo a BimCraft al costat de l'edifici |
| Models detallats de plantes (fulles, branques, estacions) a la vista 3D; objectes de forma lliure i reg a la vista 3D | Les plantes es mostren en 3D com a formes simples dimensionades a partir de la llista de plantes ([Vista del lloc en 3D](topic:site-3d)); la dispersió de ModelCraft fa imatges de plantació |
| Murs d'obra dura que retenen un nivell explanat darrere d'ells a la superfície | Doneu a una plataforma o a una base costats verticals: són murs de contenció a la superfície ([Explanació](topic:grading)) |
| Transformacions SVG en els vostres propis símbols; textures i colors dels vostres propis models de plantes GLB; geometria GLB comprimida | Aplaneu les transformacions al vostre programa de dibuix primer; els models es dibuixen amb el color de la planta; exporteu el GLB sense compressió ([Gràfics de plantes](topic:plant-graphics)) |
| La vostra pròpia llista de plantes guardada al vostre compte de la Biblioteca (editada a l'aplicació) | Editeu la llista pròpia del projecte a la taula de Plantes i deseu-la com a fitxer de plantes |
| Les eines de paisatgisme per a assistents sense la finestra (el servidor de fitxers i la línia d'ordres) | Funcionen amb la finestra de CivilCraft oberta ([Deixeu que un assistent d'IA treballi amb el vostre lloc](topic:assistants)) |

## Línies elèctriques

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Un estàndard de país integrat (casos de càrrega, distàncies lliures, factors) | Definiu els valors del vostre estàndard a {{ui:Casos de càrrega i límits…}} i deseu-los, amb la vostra biblioteca, com a paquet per reutilitzar i compartir ([Paquets](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distància lateral d'un conductor a la capçada d'un arbre o a un mur al costat de la línia | La distància lliure vertical sobre plantes i murs que travessa la línia ([Comprovacions de línies elèctriques](topic:power-line-checks#clearances)) |
| Fluència del conductor i estirament d'un conductor nou | Tingueu-los en compte a través de les temperatures de la taula de tensat |
| Capacitat tèrmica de cables soterrats (capacitat de corrent segons com es posen) | Introduïu la capacitat de corrent del vostre proveïdor a l'element de cable |
| Estudis de curtcircuit, protecció i posada a terra | Useu un programa elèctric específic; CivilCraft dona les longituds i els cables de la xarxa |
| Torres de gelosia dissenyades barra per barra, i tirants d'ancoratge al terreny | Els suports es comproven per la seva càrrega nominal; els tirants per la seva càrrega nominal |
| Un fitxer d'estudi `.DON` comprovat al programa que el llegeix | Comproveu el fitxer allà; envieu-nos una mostra perquè puguem provar-ho amb un de real |
| Línies elèctriques a la vista 3D i en IFC | El plànol, el perfil de la línia, els fulls i les capes GIS |
| Les eines de línies elèctriques per a assistents sense la finestra | Funcionen amb la finestra de CivilCraft oberta ([Deixeu que un assistent d'IA treballi amb el vostre lloc](topic:assistants)) |

## Volums d'edificació

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Una biblioteca de codis de zonificació o de les normes de qualsevol ciutat | Escriviu els límits de la vostra pròpia ordenança ([Límits de zonificació](topic:zoning-limits)) |
| Llum del cel als murs (llum de la façana), vent | [Hores de sol](topic:sun-hours) només compta el sol directe |
| Ombra d'arbres, plantes o qualsevol cosa no dibuixada com a volum | Dibuixeu els edificis veïns com a volums |
| Formes de coberta en volums | Volums amb la part superior plana |
| Obertures, cobertes i tipus de mur quan un volum es desenvolupa a BimCraft | BimCraft construeix murs exteriors simples a cada planta i un forjat; afegiu-hi la resta allà |

## GIS i sistemes de coordenades

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| File Geodatabase; estils, icones, superposicions de terreny i enllaços de xarxa de KML | Convertiu a GeoPackage, shapefile o GeoJSON primer; els marcadors KML es llegeixen sense estils |
| Editar elements GIS o els seus atributs | Editeu-los en un programa GIS i torneu a importar. El panell d'anàlisi fa capes noves (zona d'influència, superposició, unió, selecció) i afegeix camps d'àrea i longitud, però no edita un element al lloc |
| Anàlisi de xarxa i ràster, zones d'influència amb extrems plans o quadrats i d'un sol costat, afegir o suprimir files i canviar el tipus d'un camp a la taula d'atributs, colors de classe manuals, una llegenda d'estil als plànols | Useu Selecciona per triar elements i crear-ne una capa; els extrems plans no s'ofereixen. Acolorir per atribut i la taula d'atributs sí que estan fets: vegeu [Estilitzar una capa per un atribut](topic:gis-symbology) i [Treballar amb la taula d'atributs d'una capa](topic:gis-table) |
| Estils d'etiqueta (mida, col·locació) i etiquetes que no se superposen | Les etiquetes són d'una mida i poden superposar-se on els elements són densos |
| Datums verticals i models de geoide | Les altituds s'usen tal com les dona el fitxer; comproveu el datum vertical vosaltres mateixos |
| Desplaçaments de graella diferents de NAD83 des de NAD27 suggerits per àrea (OSTN15; NTv2 per a altres datums funciona quan afegiu el fitxer), diverses graelles alhora, graelles verticals | Afegiu vosaltres el fitxer de graella del vostre datum; una graella per projecte |
| Capes de mapa a l'exportació DXF o 3D | Les capes de mapa van al PDF de plànol, i al costat del DWG com a imatge |
| Servidors de mapes que requereixen inici de sessió, clau o token | Useu serveis públics, o un fitxer d'imatge georeferenciada |
| Escriure fitxers LAS o LAZ a partir d'una superfície, del model del terreny o de les eines de graella d'altituds i LiDAR | Exporteu les superfícies com a graella d'altituds GeoTIFF. El complement [Núvols de punts](topic:point-clouds) escriu un núvol netejat com a LAS 1.4 o LAZ |
| Intensitat, color i retorns LiDAR; graelles d'altituds amb diverses bandes; fitxers de graella o LiDAR de més de 200 MB | El LiDAR es filtra només per classe, les graelles usen la seva primera banda; talleu primer els fitxers grans en rajoles |

## Entrada

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Selecció de caixa amb tàctil (necessita {{key:Shift}}) | Manteniu premut cada punt topogràfic per afegir-lo |
| Coordenades o distàncies escrites mentre es dibuixa | Dibuixeu aproximadament, i després escriviu les coordenades exactes del PI a la taula de PI del traçat |
| Escriure coordenades per a cantonades de plataforma i estructures | Arrossegueu les seves nanses; feu zoom per a la precisió i observeu E i N a la barra d'estat |
| Referència a objectes (excepte els punts topogràfics per a línies de ruptura) | Feu zoom i observeu la barra d'estat |

## Vista 3D

| Encara no implementat | Avui, en lloc d'això |
|---|---|
| Dibuixar o editar a la vista 3D | Dibuixeu i editeu al plànol; la vista 3D segueix cada edició |
| Seleccionar línies característiques de corredor o elements GIS fent clic en 3D | Feu-hi clic al plànol |
| Exportar la vista exagerada o en peus | Les exportacions són a escala real en metres; vegeu [Exporta el lloc en 3D](topic:export-3d) |
| Etiquetes en exportacions GLB o OBJ, mides i estils d'etiquetes en 3D | Les etiquetes es mostren només a la vista 3D, d'una mida; vegeu [Vista del lloc en 3D](topic:site-3d) |
| Textures de fotos, enregistrar una conducció com a vídeo, ombres de més enllà del lloc, hores de sol mostrades a la vista 3D | Capes de mapa superposades a les superfícies; conduïu i la posició del sol en un moment; [hores de sol](topic:sun-hours) per a un dia o una estació al plànol |
