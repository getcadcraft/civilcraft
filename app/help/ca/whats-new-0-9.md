---
title: Novetats de la 0.9 (anteriors)
summary: Plantilles de corredor i de terreny, encaixos i botons Tria mentre es dibuixa, anàlisi SIG amb una taula d'atributs, estudis d'ombra, producció solar, confort i vent per a un lloc, una vista Render 3D, i els complements Núvols de punts i WaterCraft.
keywords: novetats 0.9, versió anterior, novetats, 0.9, notes de la versió, plantilles de corredor, plantilles de terreny, editor de plantilles, secció tipus, diversos corredors, encaix, encaixos, tria, moure, copiar, girar, tangent, render, render 3d, anàlisi sig, buffer, superposició, unió espacial, taula d'atributs, estil per atribut, estudi d'ombra, producció solar, utci, confort a l'exterior, estudi de vent, openfoam, núvols de punts, las, laz, watercraft, cabal d'incendi, boca d'incendi, edat de l'aigua, clor, demandes, indicacions, disposició, novetats, notes de la versió, registre de canvis, canvis, 0.8, 0.8.1, versió, noves funcions, pluja, pluvial, estancament, desbordament, moviment de terres, equilibri, desmunt i terraplè, transport, millor ruta, cost mínim, traçat, bassa de detenció, desguàs, buidatge, progrés, topografia, dron, pila d'acopi, adreça a lloc, parcel·la, sòl, inundació, estabilitat de talussos, bishop, assentament, cruïlla, senyalització, senyals, distància de visibilitat, ajust, mínims quadrats, itinerari, mina a cel obert, enllaç de ràdio, fresnel, agulla, encreuament, idiomes, problemes, en directe, dwg
from: 4664522c
---

Això és el que ha canviat a CivilCraft 0.9, respecte de la 0.8.1. CivilCraft 0.9 forma part de CadCraft Studio 0.9 i de les seves vuit aplicacions. Les parts principals són les plantilles de corredor i de terreny, els encaixos mentre es dibuixa, l'anàlisi SIG, els estudis del sol, la producció solar, el confort i el vent d'un lloc, i dos complements: Núvols de punts i WaterCraft.

## Novetats

### Plantilles de corredor i de terreny

- **Plantilles de corredor.** Obriu {{ui:Superfície}} › {{ui:Més}} › {{ui:Plantilles de corredor…}} (o escriviu {{cmd:TEMPLATES}}). Una plantilla és una petita secció transversal amb components, desfasaments, pendents, materials i codis de punt. Guardeu-les al projecte, a {{ui:La meva biblioteca}} o com a fitxer `.cctemplates.json`. L'editor de plantilles mostra un dibuix a escala real i llista els problemes mentre escriviu.
- **Construir a partir de plantilles per PK.** Seleccioneu un traçat i activeu {{ui:Construeix a partir de plantilles per PK}} a les seves Propietats. Cada costat de cada regió té la seva pròpia llista de calçada i la seva pròpia condició final. {{ui:Afegeix un corredor}} sota {{ui:Corredors en aquest traçat}} posa diversos corredors en un mateix traçat.
- **Plantilles de terreny.** {{ui:Superfície}} › {{ui:Més}} › {{ui:Plantilles de terreny…}} (o escriviu {{cmd:TERRAINTEMPLATES}}) superposa materials en capes, com la terra vegetal o el paviment i la base, sobre un terreny, amb àrea i volum per capa. Vegeu [Plantilles de corredor i plantilles de terreny](topic:corridor-templates).

### Dibuix

- **Encaixos.** Les eines Traçat, Plataforma, Parcel·la, Massa, Línia característica, Mesura, Límit i Conca s'encaixen a punts topogràfics, PI, cantons, vèrtexs i estructures, amb una etiqueta al costat del marcador. Manteniu {{key:Alt}} per a un punt lliure.
- **Botons Tria, tangent i moure, copiar, girar.** Els cantons de plataforma, de parcel·la i de línia característica tenen caselles d'Est i Nord escrites i un botó Tria amb forma de creueta. Les Propietats també tenen {{ui:Tangent a partir de dos punts}} per als traçats, i {{ui:Mou, copia i gira}} per als traçats, les plataformes, les parcel·les i les línies característiques. Vegeu [Dibuixa amb encaixos, cantons triats i moure, copiar, girar](topic:draft-with-snaps).
- **Vista Render en 3D.** El botó {{ui:Render}} de la barra 3D dibuixa el terreny amb colors naturals, cel, bruma i ombres suaus. No canvia el model. El menú {{ui:Sol}} ara té els botons {{ui:Aplica}} i {{ui:Tanca}}. Vegeu [Veure el lloc en 3D](topic:site-3d).
- **Panells que s'obren d'una secció alhora.** El panell esquerre i el panell de Propietats obren una secció i tanquen les altres, i les fitxes de la Cinta de Paisatgisme que tenen diverses eines són botons dividits.

### Anàlisi SIG

- **Analitza.** {{ui:Superfície}} › {{ui:Més}} › {{ui:Analitza}} ofereix buffer, superposició, unió espacial, selecció per atribut o per forma, i mesura. Cada eina fa una capa nova en un sol pas per desfer.
- **Taula d'atributs.** El menú de tres punts d'una capa té {{ui:Taula d'atributs…}} i {{ui:Estil per atribut…}}. Vegeu [Analitza capes SIG](topic:gis-analysis) i [Treballa amb la taula d'atributs d'una capa](topic:gis-table).

### El lloc: sol, solar, confort i vent

- **Secció Entorn.** Seleccioneu un volum: la secció {{ui:Entorn}} es troba sota {{ui:Hores de sol}} a les seves Propietats. Té un estudi d'ombra (mapa, taula, animació, CSV), producció solar a partir d'un fitxer de temps meteorològic d'un any típic (.epw) i confort a l'exterior (UTCI).
- **Vent, només de cribratge.** {{ui:Executa l'estudi de vent}} acolora el terreny d'assegut a incòmode per a cada direcció del vent del fitxer meteorològic. No està validat i el panell ho indica.
- **Complement de vent per a vianants (OpenFOAM).** Desactivat fins que l'activeu a {{ui:Configuració}} › {{ui:Complements}}. OpenFOAM és un programa que instal·leu vosaltres. Vegeu [Ombra, producció solar i confort a l'exterior](topic:environment).

### Núvols de punts (complement)

- Activeu {{ui:Núvols de punts}} a {{ui:Configuració}} › {{ui:Complements}}; apareix una pestanya Núvols de punts a la fitxa de la dreta. Obriu un fitxer LAS o LAZ, netegeu-lo, classifiqueu-lo en terreny, vegetació i edificis, construïu el terreny, les corbes de nivell i els volums, i exporteu LAS o LAZ. Vegeu [Núvols de punts d'un dron o escàner](topic:point-clouds).

### WaterCraft (complement)

- Activeu {{ui:WaterCraft (distribució d'aigua)}} a {{ui:Configuració}} › {{ui:Complements}}; apareix una pestanya WaterCraft. Té demandes dels clients, cabal d'incendi a cada boca d'incendi, quina interrupció de canonada importa més, i edat de l'aigua i clor, cada una desada com a CSV. Vegeu [WaterCraft: demandes, cabal d'incendi, interrupcions i edat de l'aigua](topic:watercraft).

### Treballar junts

- En una sessió Live veieu els cursors i els noms de les altres persones al plànol. Plantes de la biblioteca: CivilCraft Paisatgisme comença des de la seva col·lecció predeterminada de la biblioteca, {{ui:CivilCraft paisatgisme}}.

## A totes les aplicacions

- Les indicacions es mostren com a informacions emergents de Bootstrap, i la indicació d'inici es pot tancar.
- La franja de pestanyes d'un panell que no cap es desplaça en lloc de quedar tallada.
- Els títols de les pestanyes del navegador diuen `<document> - CivilCraft | CadCraft`.
- {{ui:Configuració}} té una secció de Disposició on les disposicions són un desplegable d'opcions de dues línies.
- Les unitats de pes i temperatura són a {{ui:Configuració}} › {{ui:General}} › {{ui:Unitats}}.
- La llista d'idiomes mostra els idiomes per als quals la versió té fitxers. Els idiomes diferents de l'anglès són esborranys automàtics.

## Corregit

- Els complements de cerca d'adreces i d'EnergyPlus no es podien activar; ara sí.
- L'ajuda ara indica que el complement Núvols de punts escriu un núvol net com a LAS 1.4 o LAZ.
- Fer clic a la nansa del propi objecte seleccionat ja no inicia un arrossegament de nansa que aturava un Tria en espera.

## Límits reconeguts

- Les plantilles de corredor d'exemple són marcadors de posició sense cap norma; un enginyer les ha de comprovar. Les plantilles de terreny no afegeixen cap superfície i no es dibuixen en 3D ni a la vista de secció. El segon corredor en un traçat no és a l'exportació IFC. No hi ha transició entre dues plantilles per PK.
- Els núvols de punts es van provar amb fitxers inventats, no amb un vol de dron real. Només es llegeixen LAS i LAZ.
- L'anàlisi SIG es va provar amb capes inventades.
- L'ombra, la producció solar i el confort són estimacions de planificació; el vent és un cribratge no validat. Res d'això no és un valor de disseny.
- WaterCraft és una ajuda al càlcul comprovada amb xarxes inventades. Un enginyer d'aigua decideix quin valor tenen els números.
- Els idiomes diferents de l'anglès són esborranys automàtics.
- Els instal·ladors de Windows no estan signats digitalment, i la imatge de disc de macOS no està notaritzada.

## Anteriors: 0.8 i 0.8.1

Això és el que va canviar a CivilCraft 0.8 (2026-11-01) i 0.8.1 (2026-11-02), respecte de la 0.7. Les parts noves més importants són eines per provar el nivellament i el lloc (pluja, moviment de terres, rutes, basses, progrés), i sis finestres de càlcul per al terreny, les carreteres, la topografia, les mines, els enllaços i el ferrocarril.

### Novetats

**Prova el nivellament**

- **Fes ploure.** {{ui:Fes ploure…}} (sota {{ui:Superfície}}) fa caure una tempesta sobre el terreny nivellat. Veieu com l'aigua baixa de les plataformes, s'acumula als racons baixos i desborda les basses que són massa petites. L'execució és animada i dona els volums, el cabal màxim de sortida i un CSV de cada bassa. La cel·la predeterminada és gruixuda perquè una primera ullada sigui ràpida; una cel·la més fina és més lenta. Les basses que desborden també apareixen al panell de Problemes.
- **Equilibrador de moviment de terres.** {{ui:Equilibrador de moviment de terres…}} puja o baixa una plataforma fins que el desmunt iguala el terraplè, i mostra la taula de transport entre tots dos.
- **Millor ruta.** {{ui:Millor traçat…}}: trieu un inici i un final, i CivilCraft troba el camí més barat pel terreny que es manté dins dels vostres límits de pendent i de corba, i després en fa un traçat.
- **Basses de detenció.** {{ui:Basses de retenció…}} calcula l'estadi i l'emmagatzematge a partir del vostre terreny, accepta dispositius de desguàs (orifici, vertedor, vertedor en V, abocador), encamina una tempesta a través de la bassa i comprova el cabal punta retingut, el temps de buidatge i la francbord.
- **Progrés a partir de topografies.** {{ui:Progrés a partir de topografies…}} compara superfícies de dron o d'escàner de dates diferents amb el terreny tal com era i amb el disseny: percentatge completat per volum, àrees excavades de més i rebliment de més, piles d'acopi, i quan acabarà la feina a aquest ritme (marcat com a estimació).

**Coneix el lloc**

- **Adreça a lloc.** {{ui:Adreça a lloc…}} alinea dades obertes de parcel·les, edificis, zonificació, sòl, inundació i terreny en un sol lloc. Podeu guardar el lloc al fitxer del projecte: l'adreça escrita, cada font amb el dia en què la vau obtenir i la seva llicència, i el que va tornar. Reobriu o compartiu el projecte i el lloc hi és encara, sense tornar a obtenir res. També el podeu desar com a fitxer de lloc o enviar-lo a BimCraft. Vegeu [Adreça a lloc](topic:address-to-site).

**Terreny, carreteres, topografia, mines, enllaços i ferrocarril**

- **Sòls i talussos.** {{ui:Sòls i talussos…}} dibuixa el perfil del sòl entre les perforacions que escriviu. El mètode de Bishop després cerca el cercle crític sobre el vostre terreny, amb un nivell freàtic, una sobrecàrrega i un coeficient sísmic; l'assentament d'una sabata inclou la consolidació, l'assentament immediat i el temps.
- **Cruïlles i senyalització horitzontal.** {{ui:Cruïlles i senyalització…}} uneix braços amb retorns de vorada (un radi per braç, o retorns de tres centres), la distància de visibilitat per a la velocitat de projecte, una comprovació dels triangles de visibilitat, passos de vianants, barres d'aturada, marcatges i senyals amb una taula de senyals. Es dibuixen al plànol i es desen com a .dxf amb capes amb nom.
- **Compensació topogràfica.** {{ui:Ajust topogràfic…}} fa una compensació per mínims quadrats d'un itinerari o d'una xarxa: coordenades compensades, el·lipses d'error, la prova de khi quadrat i un senyal a la mesura que no encaixa. Hi ha xarxes lliures, tancament d'un itinerari per la regla de la brúixola i RW5, fitxers de camp GSI, JobXML o CSV, i els punts compensats es desen com a CSV.
- **Mines a cel obert.** {{ui:Mines a cel obert…}} converteix les mostres de sondeig en un model de blocs i la mina final dins del vostre angle de talús, amb la relació d'estèril, una taula per banc i una corba de llei i tonatge. També hi ha mines imbricades per factor d'ingressos i un pla de producció amb flux de caixa descomptat.
- **Enllaços de ràdio.** {{ui:Enllaços de ràdio…}} comprova la visibilitat directa sobre el vostre terreny amb la curvatura de la terra, la primera zona de Fresnel, el pressupost d'enllaç, el marge d'esvaïment i l'aturada per multicamí, i dona l'alçada del mastil que permetria netejar el camí. També fa pressupostos de pèrdues de fibra, quantitats de la ruta i el vent sobre una torre.
- **Agulles ferroviàries.** {{ui:Agulles ferroviàries…}} fa una agulla a partir del seu número de contracorrent, encreuaments entre vies paral·leles i un gàlib d'estructura inclinat pel peralt i eixamplat en una corba. Una agulla pot situar-se en un PK d'un traçat.

Vegeu [Sòls, cruïlles, compensació topogràfica, mines, enllaços de ràdio i agulles](topic:soils-roads-survey-mines-links).

### A totes les aplicacions

- **Idiomes.** 54 idiomes, deu d'ells nous. Els idiomes diferents de l'anglès són esborranys automàtics fins que un parlant nadiu els llegeixi. Els temes d'ajuda encara són majoritàriament en anglès.
- **Files de la barra d'eines.** {{ui:Configuració}} › {{ui:General}} › {{ui:Files de la barra d'eines}}: Ajust (com abans), 2 files o 1 fila. La Cinta de CivilCraft mostra l'eina més usada en gran, les següents en petit, i la resta darrere de la fletxa del nom del grup.
- **Dispositius d'entrada.** Touchpad, llapis, ratolí 3D, comandament i MIDI poden manejar les aplicacions.
- **Problemes.** Un panell de Problemes que avisa en totes les aplicacions, amb comprovacions que llegeixen paquets de normativa.
- **Live.** Una vista de qui és on en una sessió Live.
- **Complements.** Una llista de complements, amb complements d'il·luminació.
- **Connecteu la vostra IA.** Qualsevol assistent que connecteu pot manejar les eines de CivilCraft. Inclou una nota que indica que la connexió en un clic des de CadCraft Studio i el connector allotjat encara no estan preparats. Vegeu [Deixeu que un assistent d'IA treballi amb el vostre lloc](topic:assistants).

### Corregit a la 0.8.1

- **Secció de classes DWG.** Es llegia com el tipus equivocat (GitHub cadcraft#5). Corregit a CivilCraft juntament amb CadCraft, BimCraft, ModelCraft i TakeoffCraft.
- **Canvi d'idioma en execució.** CadCraft Studio i les edicions empaquetades poden canviar d'idioma en temps d'execució. Abans només eren en anglès. Encara no s'ha provat a totes les plataformes: digueu-nos si l'idioma no canvia.

### Encara no és a aquesta versió

- **Són ajudes al càlcul.** Cada resultat de les finestres noves necessita la comprovació d'un enginyer. Les resistències del sòl parteixen de valors típics del grup de sòl, i la finestra ho indica.
- **Fes ploure.** Una execució sobre el lloc d'exemple pot trigar més de dos minuts al navegador amb una cel·la fina. Es va comprovar amb casos fets a mà i una conca en forma de V, encara no sobre un lloc real amb nivellament.
- **Adreça a lloc.** Llegeix fitxers de dades obertes que porteu vosaltres, i només es va provar amb fitxers propis. Els arbres no són una font. Obtenir les fonts per a vosaltres espera la redacció sobre la privadesa.
- **Progrés a partir de topografies.** Provat només amb topografies inventades. El progrés en plànols i marcatges (MarkupCraft) i la comparació d'escaneig amb model (BimCraft) no estan fets.
- **Sòls i talussos.** Només superfícies circulars: sense cerca de falca ni de bloc, i sense esquerda de tensió.
- **Cruïlles.** Un radi per braç, sense trajectòries de camions, i encara no entren al corredor.
- **Fitxers de camp.** Els lectors es van escriure a partir de descripcions públiques del format i es van provar amb fitxers que vam fer nosaltres. Es necessiten fitxers d'instruments reals.
- **Enllaços i ferrocarril.** Enllaços de ràdio: només pèrdua en espai lliure i multicamí (sense esvaïment per pluja ni diagrames d'antena), i cap estàndard ferroviari: cada límit ferroviari és un marcador de posició, amb xifres de projecte que cap enginyer ferroviari no ha comprovat.
- **Windows i macOS.** La 0.8 no està signada digitalment. Windows pot avisar, i macOS demana clic dret i després Obre.

Tot la resta és a [Encara no implementat](topic:not-built-yet). Per a la versió anterior, vegeu [Novetats de la 0.7](topic:whats-new-0-7).
