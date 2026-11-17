---
title: Novetats de la 0.9
summary: Plantilles de corredor i de terreny, referències a objectes i botons de selecció en dibuixar, anàlisi GIS amb taula d'atributs, estudis d'ombra, rendiment solar, confort i vent per a un emplaçament, una vista Render 3D, i els complements Núvols de punts i WaterCraft.
keywords: novetats, 0.9, notes de la versió, plantilles de corredor, plantilles de terreny, editor de plantilles, secció tipus, diversos corredors, referència, referències, selecció, moure, copiar, girar, tangent, render, render 3d, anàlisi gis, zona d'influència, superposició, unió espacial, taula d'atributs, estil per atribut, estudi d'ombra, rendiment solar, utci, confort a l'exterior, estudi de vent, openfoam, núvols de punts, las, laz, watercraft, cabal d'incendi, hidrant, edat de l'aigua, clor, demandes, consells emergents, disposició, què hi ha de nou, notes de la versió, registre de canvis, canvis, 0.8, 0.8.1, versió, funcions noves, pluja, clavegueram, entollament, desbordament, moviment de terres, equilibri, desmunt i terraplè, transport, millor traçat, cost mínim, traçat, bassa de retenció, desguàs, buidatge, franc, progrés, topografia, dron, pila de material, de l'adreça a la parcel·la, parcel·la, sòl, inundació, estabilitat de talussos, bishop, assentament, cruïlla, senyalització, senyals, distància de visibilitat, ajust, mínims quadrats, poligonal, mina a cel obert, model de blocs, enllaç de ràdio, fresnel, agulla, encreuament, idiomes, problemes, live, dwg
from: d7ac5b14
---

Això és el que ha canviat a CivilCraft 0.9, en comparació amb la 0.8.1. CivilCraft 0.9 forma part de CadCraft Studio 0.9 i de les seves vuit aplicacions. Les parts grans són les plantilles de corredor i de terreny, les referències en dibuixar, l'anàlisi GIS, els estudis del sol, del rendiment solar, del confort i del vent, i dos complements: Núvols de punts i WaterCraft.

## Novetats

### Plantilles de corredor i de terreny

- **Plantilles de corredor.** Obriu {{ui:Superfície}} › {{ui:Més}} › {{ui:Plantilles de corredor…}} (o escriviu {{cmd:TEMPLATES}}). Una plantilla és una petita secció transversal amb components, desplaçaments, pendents, materials i codis de punt. Deseu-les al projecte, a {{ui:La meva biblioteca}} o com a fitxer `.cctemplates.json`. L'editor de plantilles mostra un dibuix a escala real i llista els problemes a mesura que escriviu.
- **Construeix a partir de plantilles per PK.** Seleccioneu un traçat i activeu {{ui:Construeix a partir de plantilles per PK}} a les seves Propietats. Cada costat de cada regió té la seva pròpia llista de paviments i la seva pròpia condició final. {{ui:Afegeix un corredor}} sota {{ui:Corredors en aquest traçat}} posa diversos corredors en un mateix traçat.
- **Plantilles de terreny.** {{ui:Superfície}} › {{ui:Més}} › {{ui:Plantilles de terreny…}} (o escriviu {{cmd:TERRAINTEMPLATES}}) aplica materials en capes, com la terra vegetal o el paviment i la base, sobre un terreny, amb l'àrea i el volum de cada capa. Vegeu [Plantilles de corredor i plantilles de terreny](topic:corridor-templates).

### Dibuix

- **Referències a objectes.** Les eines Traçat, Plataforma, Parcel·la, Volum, Línia característica, Mesura, Límit i Conca s'ajusten a punts topogràfics, PI, cantonades, vèrtexs i estructures, amb una etiqueta al costat del marcador. Mantingueu premuda {{key:Alt}} per a un punt lliure.
- **Botons de selecció per punt, tangent i moure, copiar, girar.** Les cantonades de plataforma, de parcel·la i de línia característica tenen caselles X (est) i Y (nord) escrites i un botó de selecció per punt amb creu. Les Propietats també tenen {{ui:Tangent a partir de dos punts}} per als traçats i {{ui:Mou, copia i gira}} per als traçats, les plataformes, les parcel·les i les línies característiques. Vegeu [Dibuixeu amb referències, cantonades triades i moure, copiar, girar](topic:draft-with-snaps).
- **Vista Render en 3D.** El botó {{ui:Render}} de la barra 3D dibuixa el terreny amb colors naturals, cel, bruma i ombres suaus. No canvia el model. El menú {{ui:Sol}} ara té els botons {{ui:Aplica}} i {{ui:Tanca}}. Vegeu [Vegeu l'emplaçament en 3D](topic:site-3d).
- **Els taulers s'obren una secció alhora.** El tauler de l'esquerra i el tauler de Propietats obren una secció i tanquen les altres, i les fitxes de la cinta de Paisatgisme que contenen diverses eines són botons dividits.

### Anàlisi GIS

- **Analitza.** {{ui:Superfície}} › {{ui:Més}} › {{ui:Analitza}} ofereix zona d'influència, superposició, unió espacial, selecció per atribut o per forma, i mesura. Cada eina crea una capa nova en un sol pas de desfer.
- **Taula d'atributs.** El menú de tres punts d'una capa té {{ui:Taula d'atributs…}} i {{ui:Estil per atribut…}}. Vegeu [Analitzeu capes GIS](topic:gis-analysis) i [Treballeu amb la taula d'atributs d'una capa](topic:gis-table).

### L'emplaçament: sol, solar, confort i vent

- **Secció d'entorn.** Seleccioneu un volum: la secció {{ui:Entorn}} es troba sota {{ui:Hores de sol}} a les seves Propietats. Té un estudi d'ombra (mapa, taula, animació, CSV), rendiment solar a partir d'un fitxer meteorològic d'any típic (.epw) i confort a l'exterior (UTCI).
- **Vent, només com a cribratge.** {{ui:Executa l'estudi de vent}} acoloreix el terreny des de lloc per seure fins a incòmode per a cada direcció del vent del fitxer meteorològic. No està validat, i el tauler ho diu.
- **Complement de vent per a vianants (OpenFOAM).** Desactivat fins que l'activeu a {{ui:Configuració}} › {{ui:Complements}}. OpenFOAM és un programari que instal·leu vosaltres mateixos. Vegeu [Ombra, rendiment solar i confort a l'exterior](topic:environment).

### Núvols de punts (complement)

- Activeu {{ui:Núvols de punts}} a {{ui:Configuració}} › {{ui:Complements}}; apareix una pestanya Núvols de punts al tauler de la dreta. Obriu un fitxer LAS o LAZ, netegeu-lo, classifiqueu-lo en terreny, vegetació i edificis, construïu el terreny, les corbes de nivell i els volums, i exporteu LAS o LAZ. Vegeu [Núvols de punts d'un dron o escàner](topic:point-clouds).

### WaterCraft (complement)

- Activeu {{ui:WaterCraft (distribució d'aigua)}} a {{ui:Configuració}} › {{ui:Complements}}; apareix una pestanya WaterCraft. Té demandes dels clients, cabal d'incendi a cada hidrant, quina interrupció de canonada importa més, i edat de l'aigua i clor, cadascun desat com a CSV. Vegeu [WaterCraft: demandes, cabal d'incendi, interrupcions i edat de l'aigua](topic:watercraft).

### Treballar junts

- En una sessió Live veieu els cursors i els noms de les altres persones al plànol. Plantes de la biblioteca: CivilCraft Paisatgisme comença des de la seva col·lecció predeterminada de la biblioteca, {{ui:CivilCraft paisatgisme}}.

## En totes les aplicacions

- Els consells emergents es mostren com a Bootstrap, i el consell d'inici es pot tancar.
- La barra de pestanyes d'un tauler que no hi cap es desplaça en lloc de tallar-se.
- Els títols de les pestanyes del navegador tenen el format `<document> - CivilCraft | CadCraft`.
- {{ui:Configuració}} té una secció de Disposició on les disposicions són un desplegable d'opcions de dues línies.
- Les unitats de pes i de temperatura són a {{ui:Configuració}} › {{ui:Global}} › {{ui:Unitats}}.
- La llista d'idiomes mostra els idiomes dels quals té fitxers la versió. Els idiomes que no són l'anglès són esborranys automàtics.

## Corregit

- Els complements de cerca d'adreces i de comprovació d'EnergyPlus no es podien activar; ara sí.
- L'ajuda ara indica que el complement Núvols de punts desa un núvol netejat com a LAS 1.4 o LAZ.
- Fer clic a la nansa del propi objecte seleccionat ja no inicia un arrossegament de nansa que aturava una selecció per punt en espera.

## Límits reals

- Les plantilles d'exemple de corredor són provisionals i no segueixen cap norma; un enginyer les ha de revisar. Les plantilles de terreny no afegeixen cap superfície i no es dibuixen en 3D ni a la vista de secció. El segon corredor d'un traçat no és a l'exportació IFC. No hi ha transició gradual entre dues plantilles per PK.
- Els núvols de punts s'han provat amb fitxers inventats, no amb un vol de dron real. Només es llegeixen LAS i LAZ.
- L'anàlisi GIS s'ha provat amb capes inventades.
- L'ombra, el solar i el confort són estimacions per a la planificació; el vent és un cribratge no validat. Res d'això no és un valor de projecte.
- WaterCraft és una eina de càlcul comprovada amb xarxes inventades. Un enginyer d'aigües decideix quin valor tenen els números.
- Els idiomes més enllà de l'anglès són esborranys automàtics.
- Els instal·ladors de Windows no estan signats amb codi, i la imatge de disc de macOS no està notaritzada.

## Anteriors: 0.8 i 0.8.1

Això és el que ha canviat a CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02), en comparació amb la 0.7. Les parts grans són eines que proven la vostra explanació i el vostre emplaçament (pluja, moviment de terres, traçats, basses, progrés) i sis finestres de càlcul per al terreny, les carreteres, la topografia, les mines, els enllaços i el ferrocarril.

### Novetats

**Provar l'explanació**

- **Fes ploure.** {{ui:Fes ploure…}} (sota {{ui:Superfície}}) fa caure una tempesta sobre el terreny explanat. Veureu com l'aigua escorre des de les plataformes, s'acumula a les cantonades baixes i desborda les basses que són massa petites. L'execució és animada i dóna els volums, el cabal màxim de sortida i un CSV de cada bassa. La cel·la predeterminada és gruixuda perquè una primera ullada sigui ràpida; una cel·la més fina és més lenta. Les basses que desborden també apareixen al tauler de Problemes.
- **Equilibrador de moviment de terres.** {{ui:Equilibrador de moviment de terres…}} puja o baixa una plataforma fins que el desmunt iguala el terraplè, i mostra la taula de transport entre tots dos.
- **Millor traçat.** {{ui:Millor traçat…}}: trieu un inici i un final, i CivilCraft troba el camí més econòmic pel terreny que es manté dins dels vostres límits de pendent i de corba, i després en fa un traçat.
- **Basses de retenció.** {{ui:Basses de retenció…}} calcula l'etapa i l'emmagatzematge a partir del vostre terreny, accepta dispositius de desguàs (orifici, vertedor, entalla en V, abocador), fa passar una tempesta per la bassa i comprova el cabal punta retingut, el temps de buidatge i el franc.
- **Progrés a partir de topografies.** {{ui:Progrés a partir de topografies…}} compara superfícies de drons o d'escàners de dates diferents amb el terreny tal com era i amb el disseny: percentatge completat per volum, àrees excavades de més i reblertes de més, piles de material, i quan acabarà la feina a aquest ritme (marcat com a estimació).

**Conèixer l'emplaçament**

- **De l'adreça a la parcel·la.** {{ui:De l'adreça a la parcel·la…}} reuneix en un sol emplaçament les dades obertes de parcel·la, edifici, zonificació, sòl, inundació i terreny. Podeu guardar l'emplaçament al fitxer del projecte: l'adreça escrita, cada font amb el dia en què la vau obtenir i la seva llicència, i el que va tornar. Reobriu o compartiu el projecte i l'emplaçament hi és encara, sense tornar a obtenir res. També el podeu desar com a fitxer d'emplaçament o enviar-lo a BimCraft. Vegeu [De l'adreça a la parcel·la](topic:address-to-site).

**Terreny, carreteres, topografia, mines, enllaços i ferrocarril**

- **Sòls i talussos.** {{ui:Sòls i talussos…}} dibuixa el perfil del sòl entre les perforacions que escriviu. El mètode de Bishop després cerca el cercle crític sobre el vostre terreny, amb un nivell freàtic, una sobrecàrrega i un coeficient sísmic; l'assentament d'una sabata obté consolidació, assentament immediat i temps.
- **Cruïlles i senyalització.** {{ui:Cruïlles i senyalització…}} ajunta braços amb retorns de vorada (un radi per braç, o retorns de tres centres), la distància de visibilitat per a la velocitat de projecte, una comprovació dels triangles de visibilitat, passos de vianants, barres d'aturada, marques i senyals amb un quadre de senyals. Es dibuixen al plànol i es desen com a .dxf amb capes amb nom.
- **Ajust topogràfic.** {{ui:Ajust topogràfic…}} fa un ajust per mínims quadrats d'una poligonal o d'una xarxa: coordenades ajustades, el·lipses d'error, la prova de khi-quadrat i un senyal a la mesura que no encaixa. Hi són incloses les xarxes lliures, el tancament d'una poligonal pel mètode de la brúixola i els fitxers de camp RW5, GSI, JobXML o CSV, i els punts ajustats es desen com a CSV.
- **Mines a cel obert.** {{ui:Mines a cel obert…}} converteix les mostres de sondeig en un model de blocs i la fossa final dins del vostre angle de talús, amb la relació d'estèril, una taula per banc i una corba de llei i tonatge. Hi ha també fosses imbricades per factor d'ingrés i un programa de producció amb flux de caixa descomptat.
- **Enllaços de ràdio.** {{ui:Enllaços de ràdio…}} comprova la visibilitat directa sobre el terreny amb l'abombament de la Terra, la primera zona de Fresnel, el balanç d'enllaç, el marge d'esvaïment i la interrupció per multitrajecte, i dona l'alçada de mastil que deixaria lliure el camí. També fa balanços de pèrdues per fibra, quantitats de ruta i el vent sobre una torre.
- **Agulles ferroviàries.** {{ui:Agulles ferroviàries…}} fa una agulla a partir del seu número de cor, encreuaments entre vies paral·leles i un gàlib d'obra inclinat per peralt i eixamplat en una corba. Una agulla pot situar-se en un punt quilomètric d'un traçat.

Vegeu [Sòls, cruïlles, ajust topogràfic, mines, enllaços de ràdio i agulles](topic:soils-roads-survey-mines-links).

### En totes les aplicacions

- **Idiomes.** 54 idiomes, deu d'ells nous. Els idiomes que no són l'anglès són esborranys automàtics fins que una persona nadiua els llegeixi. Els temes d'ajuda encara són en gran part en anglès.
- **Files de la barra d'eines.** {{ui:Configuració}} › {{ui:General}} › {{ui:Files de la barra d'eines}}: Ajusta (com abans), 2 files o 1 fila. La cinta de CivilCraft mostra l'eina més usada en gran, les següents petites, i la resta darrere la fletxa del nom del grup.
- **Dispositius d'entrada.** El ratolí tàctil, el llapis, el ratolí 3D, el comandament i el MIDI poden controlar les aplicacions.
- **Problemes.** Un tauler de Problemes que avisa en totes les aplicacions, amb comprovacions que llegeixen paquets de normativa.
- **Live.** Una vista de qui és on en una sessió Live.
- **Complements.** Una llista de complements, amb complements d'il·luminació.
- **Connecteu la vostra IA.** Qualsevol assistent que connecteu pot controlar les eines de CivilCraft. Ve amb una nota que indica que la connexió d'un clic dins de CadCraft Studio i el connector allotjat encara no estan a punt. Vegeu [Deixeu que un assistent d'IA treballi amb el vostre emplaçament](topic:assistants).

### Corregit a la 0.8.1

- **Secció de classes DWG.** Es llegia com un tipus incorrecte (GitHub cadcraft#5). Corregit a CivilCraft juntament amb CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Canvi d'idioma en execució.** CadCraft Studio i les edicions empaquetades poden canviar d'idioma en execució. Abans només eren en anglès. Encara no s'ha provat a totes les plataformes: digueu-nos si l'idioma no canvia.

### Encara no és en aquesta versió

- **Són eines de càlcul.** Cada resultat de les finestres noves necessita la revisió d'un enginyer. Les resistències del sòl parteixen de valors típics del grup de sòl, i la finestra ho indica.
- **Fes ploure.** Una execució a l'emplaçament d'exemple pot trigar més de dos minuts al navegador amb una cel·la fina. S'ha comprovat amb casos fets a mà i una conca en forma de V, però encara no en un emplaçament real explanat.
- **De l'adreça a la parcel·la.** Llegeix fitxers de dades obertes que porteu, i només s'ha provat amb els nostres propis fitxers. Els arbres no són una font. Obtenir les fonts per a vosaltres espera el text de privadesa.
- **Progrés a partir de topografies.** Només s'ha provat amb topografies inventades. El progrés en fulls i marques (MarkupCraft) i la comparació d'escaneig amb model (BimCraft) encara no estan implementats.
- **Sòls i talussos.** Només superfícies circulars: sense cerca de falca o de bloc i sense esquerda de tensió.
- **Cruïlles.** Un radi per braç, sense trajectòries de vehicles pesants, i encara no entren al corredor.
- **Fitxers de camp.** Els lectors s'han escrit a partir de descripcions públiques dels formats i s'han provat amb fitxers que vam fer. Es necessiten fitxers reals d'instruments.
- **Enllaços i ferrocarril.** Enllaços de ràdio: només pèrdua en espai lliure i multitrajecte (sense esvaïment per pluja ni diagrames d'antena), i cap norma ferroviària: cada límit ferroviari és provisional, amb xifres d'esborrany que cap enginyer ferroviari no ha revisat.
- **Windows i macOS.** La 0.8 no està signada amb codi. Windows pot avisar, i macOS demana fer clic dret i després Obre.

La resta és a [Encara no implementat](topic:not-built-yet). Per a la versió anterior, vegeu [Novetats de la 0.7](topic:whats-new-0-7).
