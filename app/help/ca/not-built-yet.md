---
title: Encara no implementat
summary: Què no fa encara aquesta versió de CivilCraft, i què cal fer avui en lloc d'això.
keywords: que falta, limitacions, full de ruta, no disponible, espirals, eixamplament, dwg, dxf, embornals, retenció, seccions transversals, properament, límits
from: b91588d4
---

CivilCraft està en una fase inicial. Aquesta pàgina enumera el que la versió actual no fa, perquè no hi busqueu això. Res d'aquí té una data prevista.

## Punts

| Encara no implementat | Què fer avui |
|---|---|
| Afegir un segon fitxer de punts al primer | Uniu els fitxers en un editor de text o un full de càlcul abans |
| Exportar un fitxer de text de punts | Exporteu LandXML (els punts surten com a CgPoints), useu {{ui:Exporta}} de SIG (punts amb els camps P, N, E, Z i D), o {{ui:Copia}} els punts a un full de càlcul |
| Estils d'etiqueta de punt, símbols per clau de descripció, corbes (arcs) a partir de codis de línia, un fitxer de claus de descripció per compartir entre projectes | Les etiquetes mostren el número, l'elevació i la descripció, o menys ([Configuració de CivilCraft](topic:settings)); les claus es guarden al fitxer del projecte |
| Conversió d'unitats | Convertiu el fitxer abans d'importar-lo; **Unitats** només canvia l'etiqueta |

## Superfícies

| Encara no implementat | Què fer avui |
|---|---|
| Més d'una superfície construïda a partir de punts | Un projecte per superfície |
| Amagar límits interns | Useu **Vora exterior més llarga** o un límit exterior |
| Seleccionar o editar una línia de ruptura dibuixada | {{key:Mod+Z}}, o {{ui:Elimina les línies de ruptura dibuixades}} i tornar-la a dibuixar |
| Editar una superfície llegida d'un LandXML (línies de ruptura, límit) | {{ui:Reconstrueix la superfície a partir dels punts}} |
| Editar una superfície feta d'una graella d'elevacions | Importeu de nou la graella amb altres opcions |
| Convertir una superfície llegida d'un LandXML quan canvia el sistema de coordenades | Primer {{ui:Reconstrueix la superfície a partir dels punts}} |
| Cotes puntuals i valors de pendent amb etiqueta | Llegiu-los a la barra d'estat, o acoloriu la superfície per pendent amb **Anàlisi de pendents** a l'espai de treball de Paisatgisme ([Anàlisi del nivellament per al paisatgisme](topic:landscape-grading#grading-checks)) |

## Traçats i perfils

| Encara no implementat | Què fer avui |
|---|---|
| Espirals que no siguin clotoides; una espiral entre dues corbes (transicions compostes) | Les espirals clotoides als extrems d'una corba estan disponibles; les altres es nomenen i es salten en importar LandXML |
| Inserir un PI entre dos altres | Torneu a dibuixar el traçat, o reescriviu les coordenades del PI |
| Traçats a partir d'objectes, desfasaments, eixamplaments | Dibuixeu amb PI |
| Escriure K per a una corba vertical | Escriviu L (es mostra la K) |
| Corbes verticals circulars i no simètriques | Només corbes parabòliques simètriques |
| Més d'un perfil de disseny per traçat | Un traçat per variant |
| Fer zoom a la vista del perfil, bandes de perfil sota el perfil | La vista del perfil s'ajusta a tot el traçat; imprimiu-la als [plànols de planta i perfil](topic:plan-profile-sheets) |
| Seccions en DWG o LandXML | Plànols de seccions en PDF; {{ui:CSV}} de les àrees i volums |
| Línies de mostreig obliqües, o de diferents amplades al llarg de la carretera | Una amplada per cada costat per a tot el traçat |

## Corredors

| Encara no implementat | Què fer avui |
|---|---|
| Medianes, barreres i un peralt que roti les plantilles | Dibuixeu-los com a plantilles ([Plantilles de corredor](topic:corridor-templates)); les plantilles per PK encara no admeten peralt |
| Un canvi gradual entre les plantilles de dues regions (transicions, reduccions) | Canvieu la plantilla en una estació, o doneu a un punt un objectiu d'amplada a una línia dibuixada com a reducció |
| Rotació al voltant d'una vora, peralt en LandXML | El peralt gira al voltant de l'eix en corbes circulars; eixamplar un carril amb un objectiu d'amplada a una línia característica |
| Objectius per als talussos laterals (línia de tall fins a una línia o a una superfície), superfícies de corredor pròpies | Els objectius mouen les vores de la calçada i dels arcens ([Corredors](topic:corridor)); el corredor es nivella a la superfície projectada |
| Retorns de vorada, carrils de gir i illetes nivellats en una unió; el final d'un carrer lateral tallat a la vora de la carretera principal en un encreuament oblic; un camí unit a una carretera en planta, en la seva longitud i àrea | Les carreteres que es troben s'uneixen en angle recte, amb la vora de la carretera principal oberta i el carrer lateral suavitzat ([On les carreteres es troben](topic:corridor#where-roads-meet-roads-pads-and-paths)); un camí s'atura a la vora de la carretera a la superfície projectada i en 3D |
| Corredors exportats com a calçades LandXML; un segon corredor en un traçat a l'exportació IFC | S'exporta la superfície projectada |
| Plantilles de terreny que canvien la superfície projectada, en 3D o a les seccions | Donen àrees i volums de cada capa ([Plantilles de terreny](topic:corridor-templates#terrain-templates)) |
| Recorreguts de vehicles amb velocitat, lliscament de pneumàtics, temps de direcció, remolcs de direcció o folga de la carrosseria; una biblioteca de vehicles de disseny estàndard; un recorregut dibuixat arrossegant el vehicle | Recorreguts de baixa velocitat al llarg d'una línia característica o d'un traçat, amb les mides dels vostres propis vehicles ([Recorreguts de vehicles](topic:swept-paths)) |

## Nivellament i volums

| Encara no implementat | Què fer avui |
|---|---|
| Bancals, línies característiques obertes nivellades en el disseny, nivellament fins a una línia característica d'un altre lloc | Tanqueu la línia característica ([Línies característiques](topic:feature-lines)), o useu-la com a línia de ruptura del terreny actual |
| Inserir o treure un vèrtex d'una línia característica | Torneu a dibuixar la línia, o feu-ne un desfasament escalonat |
| Arcs en les línies de ruptura dibuixades (per punts topogràfics), espirals en línies característiques | Dibuixeu una línia característica amb arcs i useu-la com a línia de ruptura del terreny actual |
| Nivellament fins a una distància, una elevació o una altra superfície | Només línia de tall fins al terreny actual |
| Afegir o treure un cantó d'una plataforma | Esborreu la plataforma i torneu-la a dibuixar |
| Volums TIN a TIN (prisma), triar la mida de la cel·la de la graella | Mètode de graella, mida de cel·la triada per vosaltres |
| Esponjament i contracció, sòl superficial, gruixos de paviment | Apliqueu els factors als números informats vosaltres mateixos |
| Costos de transport lliure i de sobretransport, transport entre traçats diferents, zones de préstec i de residus col·locades al plànol | El diagrama de transport de massa amb punts d'equilibri, volums mou i distàncies mitjanes de transport |

## Xarxes de canonades

| Encara no implementat | Què fer avui |
|---|---|
| Més d'una xarxa per projecte | Projectes separats per a pluvials i sanejament |
| Canonades d'aigua: qualitat i antiguitat de l'aigua, controls basats en regles, altres tipus de vàlvules (control de cabal, estrangulació, sostingut), bombes donades per potència, demanda que depèn de la pressió, una opció de Darcy–Weisbach, un catàleg de canonades amb gruixos de paret i classes de pressió. La resta de les xarxes de pressió és al laboratori: [Canonades d'aigua](topic:water-mains) | Comproveu-ho en un programa de distribució d'aigua; els cabals de disseny del sanejament són a [Cabals de disseny del sanejament](topic:sanitary-design) |
| Fluxos de clavegueram en el temps (hidrogrames, encaminament dinàmic, emmagatzematge, bombes, desbordaments) | [Cabals de disseny del sanejament](topic:sanitary-design) dóna el cabal punta constant que utilitza un plànol de disseny |
| Capacitat d'embornal, dispersió a la cuneta, encaminament de retenció, hidrogrames, pèrdues d'energia diferents d'un coeficient de confluència | Comproveu-ho en altres programes; els cabals, les mides i les línies de pendent són a [Drenatge pluvial](topic:storm-drainage) |
| Conques al plot PDF, DWG, DXF o LandXML; conques a partir de la superfície (divisòries d'aigua) | Dibuixeu les conques a mà; es guarden al fitxer del projecte |
| Catàlegs de canonades, canonades no circulars, estructures que no són caixes o cilindres verticals (cons, graons, bancals), una categoria de drenatge a la biblioteca | Tipus d'estructura a partir de paràmetres ([Xarxa de canonades](topic:pipe-network)); canonades amb un diàmetre |
| Canonades a la vista del perfil, canonades corbes | Llegiu les cotes d'entrada i de recobriment a la fitxa dreta |

## Parcel·les

| Encara no implementat | Què fer avui |
|---|---|
| Distribució de lots per superfície o façana, parcel·les a partir de les línies que les envolten, dret de pas | Dibuixeu cada parcel·la pels seus cantons, o introduïu-ne les dades de rumb |
| Taules de corbes i de línies al plànol; etiquetes mogudes a mà | Cada tram es rotula al llarg de si mateix |
| Parcel·les en LandXML | Les parcel·les es guarden al fitxer del projecte i van al PDF, DWG i DXF |

## Itineraris topogràfics

| Encara no implementat | Què fer avui |
|---|---|
| Compensació de mínims quadrats, la regla del trànsit, ponderar els angles segons les distàncies | La regla de la brúixola |
| Angles de desviació, angles zenitals i distàncies inclinades, elevacions per nivellació trigonomètrica | Redueixi's correctament a distàncies i angles horitzontals, o a rumbs |
| Visuals laterals, fitxers de dades brutes des de col·lectors de dades | Importeu els punts com a fitxer de punts |

## Replanteig

| Encara no implementat | Què fer avui |
|---|---|
| Estaques de desfasament (punts de referència retrocedits de l'estaca), estaques de talús al punt de captació | Replanteu als desfasaments que necessiteu, inclosos els més enllà de l'arcen |
| Enviar les estaques directament al format propi d'un col·lector de dades | El CSV s'obre en el programari d'oficina de la majoria de col·lectors de dades |
| Replantejar canonades, plataformes i parcel·les | Useu punts topogràfics a prop d'un traçat, o les línies de la parcel·la |

## Fitxers i sortida

| Encara no implementat | Què fer avui |
|---|---|
| Text, trames i cotes de DWG o DXF; espai de paper; dibuixos enllaçats (referències externes); DXF binari | Les línies de l'espai model s'obren ([Obre un DWG o DXF com a línies](topic:open-dwg-dxf)); obriu els dibuixos enllaçats per separat |
| Moure diversos punts alhora arrossegant | Talleu i enganxeu-los, o editeu-los d'un en un |
| Plànols en vertical, caixetins propis, finestres de visualització que disposeu vosaltres, plànols de planta i perfil en DWG | Un plànol de planta horitzontal per PDF, o plànols de planta i perfil al llarg d'un traçat (PDF) |
| Traçar bandes d'elevació i perfils | Les bandes només es veuen a la pantalla; feu una captura de pantalla si les necessiteu |
| Canviar noms de capa, colors o estils d'etiqueta | Canvieu-los en un programa CAD després d'exportar el DXF |
| Desament al núvol i historial de versions | Deseu els fitxers `.civilcraft.json` i feu-ne còpies de seguretat; per treballar junts en un projecte, useu una sessió en directe a CadCraft Studio ([Dissenyeu un lloc junts, en directe](topic:work-live)) |
| CadCraft Studio per a iPad i iPhone, i des de Google Play | Useu CivilCraft al navegador del dispositiu; a Android, CadCraft Studio s'instal·la des del seu APK a getcadcraft.com/download |
| Obrir diversos fitxers de punts o de projecte alhora | Un fitxer per obertura (els fitxers SIG que van junts, com les parts d'un shapefile, s'obren junts) |

## Paisatgisme

| Encara no implementat | Què fer avui |
|---|---|
| Capçals i broquets de fabricants | Capçals genèrics, o afegiu els vostres capçals des d'un fitxer; les dades dels fabricants arriben a mesura que ho permeten |
| Longituds laterals màximes per a línies de degoteig, cabals en el temps, bombes, xarxes de canonades en bucle | Mantingueu els tirs de degoteig dins la longitud publicada pel fabricant; la comprovació necessita una xarxa ramificada |
| El contorn exacte d'un objecte de forma lliure còncau; el seu volum sota terra mesurat exactament | S'enfonsa l'envolvent convexa i el volum sota terra és una estimació (indicada a les Propietats) |
| Plantes de la pròpia Biblioteca de BimCraft i ModelCraft (Col·loca des de la biblioteca) | Exporteu IFC de paisatgisme i obriu-lo a BimCraft al costat de l'edifici |
| Models de plantes detallats (fulles, branques, estacions) a la vista 3D; objectes de forma lliure i reg a la vista 3D | Les plantes es veuen en 3D com a formes simples dimensionades a partir de la llista de plantes ([Veure el lloc en 3D](topic:site-3d)); la dispersió de ModelCraft fa imatges de plantacions |
| Murs de paviment que contenen un nivell nivellat darrere seu a la superfície | Doneu a una plataforma o a un pad costats verticals: són murs de contenció a la superfície ([Nivellament](topic:grading)) |
| Transformacions SVG als vostres propis símbols; textures i colors dels vostres propis models GLB de plantes; geometria GLB comprimida | Aplaneu les transformacions al vostre programa de dibuix primer; els models es dibuixen amb el color de la planta; exporteu el GLB sense compressió ([Gràfics de plantes](topic:plant-graphics)) |
| La vostra pròpia llista de plantes guardada al vostre compte de la Biblioteca (editada a l'aplicació) | Editeu la llista pròpia del projecte a la Taula de plantes i deseu-la com a fitxer de plantes |
| Les eines de paisatgisme per a assistents sense la finestra (el servidor de fitxers i la línia d'ordres) | Funcionen amb la finestra de CivilCraft oberta ([Deixeu que un assistent d'IA treballi amb el vostre lloc](topic:assistants)) |

## Línies elèctriques

| Encara no implementat | Què fer avui |
|---|---|
| Un estàndard d'un país integrat (casos de càrrega, separacions, factors) | Definiu els valors del vostre estàndard a {{ui:Casos de càrrega i límits…}} i deseu-los, amb la vostra biblioteca, com a paquet per reutilitzar i compartir ([Paquets](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| La distància lateral d'un conductor a la capçada d'un arbre o a un mur al costat de la línia | La distància vertical sobre les plantes i els murs que la línia creua ([Comprovacions de línies elèctriques](topic:power-line-checks#clearances)) |
| Fluència del conductor i l'allargament d'un conductor nou | Tingueu-ho en compte amb les temperatures de la taula de tensat |
| Capacitat tèrmica de cables soterrats (capacitat de corrent segons com es posen) | Introduïu la capacitat de corrent del vostre proveïdor a l'element de cable |
| Estudis de curtcircuit, protecció i posada a terra | Useu un programa elèctric específic; CivilCraft dona les longituds de la xarxa i els cables |
| Torres d'encelosia dissenyades barra per barra, i tirants d'ancoratge al sòl | Els suports es comproven per la seva càrrega nominal; els tirants per la seva càrrega assignada |
| Un fitxer d'estudi `.DON` comprovat al programa que el llegeix | Comproveu-lo allà; envieu-nos una mostra perquè la puguem provar amb una de real |
| Línies elèctriques en la vista 3D i en IFC | El plànol, el perfil de la línia, els plànols i les capes SIG |
| Les eines de línies elèctriques per a assistents sense la finestra | Funcionen amb la finestra de CivilCraft oberta ([Deixeu que un assistent d'IA treballi amb el vostre lloc](topic:assistants)) |

## Volums edificables

| Encara no implementat | Què fer avui |
|---|---|
| Una biblioteca de codis d'urbanisme o les normes de qualsevol ciutat | Escriviu els límits de la vostra pròpia ordenança ([Límits d'zonificació](topic:zoning-limits)) |
| Llum del cel a les parets (llum de façana), vent | [Hores de sol](topic:sun-hours) només compta el sol directe |
| Ombra d'arbres, plantes o qualsevol cosa que no es dibuixi com a volum | Dibuixeu els edificis veïns com a volums |
| Formes de coberta en volums | Volums de cobertes planes |
| Obertures, cobertes i tipus de paret quan un volum es desenvolupa a BimCraft | BimCraft construeix murs exteriors senzills a cada planta i un forjat; afegiu-hi la resta allà |

## SIG i sistemes de coordenades

| Encara no implementat | Què fer avui |
|---|---|
| Geobase de fitxers (File Geodatabase); estils KML, icones, superposicions i enllaços de xarxa | Convertiu primer a GeoPackage, shapefile o GeoJSON; les marques de posició KML es llegeixen sense els seus estils |
| Editar entitats SIG o els seus atributs | Editeu-les en un programa SIG i importeu de nou. El panell Analitza crea capes noves (buffer, superposició, unió, selecció) i afegeix camps d'àrea i longitud, però no edita una entitat al lloc |
| Anàlisi de xarxa i de ràster, buffers amb extrems plans o quadrats i buffers d'un sol costat, afegir o esborrar files i canviar el tipus d'un camp a la taula d'atributs, colors de classe manuals, una llegenda d'estil als plots | Useu Selecciona per triar entitats i fer-ne una capa; els extrems plans no s'ofereixen. Acolorir per atribut i la taula d'atributs sí que hi són: vegeu [Estilitza una capa per un atribut](topic:gis-symbology) i [Treballa amb la taula d'atributs d'una capa](topic:gis-table) |
| Estils d'etiqueta (mida, col·locació) i etiquetes que s'eviten entre elles | Les etiquetes tenen una mida i poden encavalcar-se on les entitats són denses |
| Datums verticals i models de geoide | S'usen les elevacions tal com les dóna el fitxer; comproveu vosaltres el datum vertical |
| Desplaçaments de quadrícula diferents de NAD83 a partir de NAD27 suggerits per àrea (OSTN15, NTv2 per a altres datums funcionen quan afegiu el fitxer), diverses quadrícules alhora, quadrícules verticals | Afegiu vosaltres el fitxer de quadrícula del vostre datum; una quadrícula per projecte |
| Capes de mapa en el DXF o en les exportacions 3D | Les capes de mapa van al plot PDF, i al costat del DWG com a imatge |
| Servidors de mapes que requereixen inici de sessió, clau o token | Useu serveis públics, o un fitxer d'imatge georeferenciada |
| Escriure fitxers LAS o LAZ a partir d'una superfície, del model del terreny o de les eines de graella d'elevacions i LiDAR | Exporteu les superfícies com a graella d'elevacions GeoTIFF. El complement [Núvols de punts](topic:point-clouds) escriu un núvol net com a LAS 1.4 o LAZ |
| Intensitat, color i retorns LiDAR; graelles d'elevacions amb diverses bandes; fitxers de graella o LiDAR de més de 200 MB | El LiDAR es filtra només per classe, les graelles usen la seva primera banda; talleu els fitxers grans en rajoles primer |

## Entrada

| Encara no implementat | Què fer avui |
|---|---|
| Selecció per recuadre amb tàctil (cal {{key:Shift}}) | Manteniu premut cada punt topogràfic per afegir-lo |
| Coordenades o distàncies escrites mentre es dibuixa | Dibuixeu aproximadament, i després escriviu les coordenades exactes del PI a la taula de PI del traçat |
| Escriure coordenades per als cantons de plataforma i les estructures | Arrossegueu les seves nanses; feu zoom per a precisió i vigileu E i N a la barra d'estat |
| Ajustar-se a objectes (diferents dels punts topogràfics per a les línies de ruptura) | Feu zoom i vigileu la barra d'estat |

## Vista 3D

| Encara no implementat | Què fer avui |
|---|---|
| Dibuixar o editar a la vista 3D | Dibuixeu i editeu al plànol; la vista 3D segueix cada edició |
| Seleccionar línies característiques de corredor o entitats SIG fent clic en 3D | Cliqueu-les al plànol |
| Exportar la vista exagerada o en peus | Les exportacions són a escala real en metres; vegeu [Exporta el lloc en 3D](topic:export-3d) |
| Etiquetes en exportacions GLB o OBJ, mides i estils d'etiqueta en 3D | Les etiquetes només es mostren a la vista 3D, d'una mida; vegeu [Veure el lloc en 3D](topic:site-3d) |
| Textures de fotos, gravació d'un recorregut com a vídeo, ombres de més enllà del lloc, hores de sol a la vista 3D | Capes de mapa superposades a les superfícies; recorregut i posició del sol en un moment; [hores de sol](topic:sun-hours) per a un dia o una estació al plànol |
