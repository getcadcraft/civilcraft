---
title: La pantalla, part per part
summary: Un recorregut per cada barra i tauler de CivilCraft pel seu nom a la pantalla, des de la barra d'eines fins a la barra d'estat.
keywords: interfície, pantalla, barra d'eines, taulers, propietats, barra d'estat, vista de perfil, disposició, recorregut, ui
from: 76272010
---

CivilCraft té una sola pantalla. No hi ha pestanyes ni disposicions. Els taulers laterals es poden moure, deixar flotants o portar a una finestra pròpia: vegeu [Organitzeu els taulers i useu un segon monitor](common:arrange-panels). De dalt a baix i d'esquerra a dreta:

- la **barra d'aplicació** (marca de CadCraft, nom de l'aplicació, versió, Quant a, mode de pantalla, Ajuda, Desa per fer-lo servir sense connexió, Paper i Model)
- la **barra d'eines** amb set grups de botons
- el **tauler esquerre**: Lloc, Punts, Superfície, Visualització i, quan n'importeu algun, capes GIS
- el **plànol** al mig, amb la **vista de perfil** sota quan és oberta
- el **tauler dret**: Propietats del que hi ha seleccionat
- la **barra d'estat** a la part de baix

## Barra d'aplicació

La barra fina de dalt de tot pertany al lloc de CadCraft, no a CivilCraft mateix.

- El menú de versió mostra quina versió feu servir.
- {{ui:Quant a CivilCraft}} obre la pàgina de l'aplicació al lloc.
- {{ui:Pantalla completa}} canvia els modes de pantalla: pantalla completa, després pantalla completa amb les barres amagades, i després torna a normal. {{key:Ctrl+Shift+F}} fa el mateix a totes les plataformes, inclòs un Mac (és la tecla Control allà, no Command). Amb les barres amagades, moveu el punter a la vora superior per tornar-les a mostrar.
- {{ui:Ajuda}} (o {{key:F1}}) obre aquesta ajuda en un tauler lateral; {{key:F1}} o {{key:Esc}} el tanquen.
- {{ui:Desa per fer-lo servir sense connexió}} manté CivilCraft en aquest navegador perquè s'obri sense connexió; després mostra {{ui:Disponible sense connexió}}. Vegeu [Fitxers que podeu obrir, desar i exportar](topic:files#online-and-offline).
- {{ui:Paper}} i {{ui:Model}} canvien entre un tema clar i un de fosc. El plànol i el perfil segueixen el tema; els PDF s'imprimeixen sempre en blanc.

## Barra d'eines

Cada grup té una etiqueta petita sobre els seus botons. Passeu el punter sobre un botó per veure'n la informació i la tecla.

| Grup | Botons | Què fan |
|---|---|---|
| Fitxer | {{ui:Nou}}, {{ui:Obre}}, {{ui:Desa}} | Comença de nou, obre un fitxer de punts, LandXML o projecte, desa el projecte com a baixada |
| Exporta | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Escriu LandXML 1.2, un DXF R12 o un DWG del plànol, o traça el plànol a PDF |
| Superfície | {{ui:Línia de ruptura}}, {{ui:Contorn}} | Dibuixa una línia de ruptura entre punts topogràfics; dibuixa el contorn exterior |
| Disseny | {{ui:Traçat}}, {{ui:Plataforma}}, {{ui:Canonades}}, {{ui:Perfil}} | Dibuixa un traçat, una plataforma o un tram de tubs; mostra o amaga la vista de perfil |
| Edició | {{ui:Desfés}}, {{ui:Refés}}, {{ui:Copia}}, {{ui:Enganxa}}, {{ui:Més}} | Desfà, refà, copia i enganxa punts topogràfics; {{ui:Més}} conté Retalla, Enganxa al mateix lloc, Duplica, Suprimeix, Selecciona tots els punts i Neteja la selecció |
| GIS | {{ui:Coordenades}}, {{ui:Importa}}, {{ui:Exporta}}, {{ui:Mapa}} | Estableix el sistema de coordenades, importa i exporta fitxers GIS, mostra les capes de mapa sota el plànol |
| Visualització | {{ui:Selecciona}}, {{ui:Ajusta}}, {{ui:3D}} | Tria i mou coses; amplia per mostrar-ho tot; mostra el lloc en 3D ([Visualitza el lloc en 3D](topic:site-3d)) |

Una eina de dibuix es queda premuda mentre és activa. Fer-hi clic de nou, prémer {{key:Esc}} o prémer {{key:V}} torna a {{ui:Selecciona}}. {{ui:Desfés}}, {{ui:Refés}}, {{ui:Copia}} i els elements de {{ui:Més}} apareixen en gris quan no poden actuar; la informació sobre eines explica per què (per exemple "Selecciona primer els punts topogràfics"). Tots els botons són a [Referència de la barra d'eines](topic:toolbar).

En una finestra estreta, la barra d'eines es desplaça lateralment.

## Tauler esquerre

### Lloc

- **Nom**: el nom del projecte. Dona nom a cada fitxer que deseu o exporteu i s'imprimeix a la franja del títol del PDF.
- **Unitats**: {{ui:Peus d'enquesta dels EUA}} o {{ui:Metres}}. Això indica què signifiquen els números. Canviar-ho **no** converteix les coordenades; vegeu [Unitats, punts quilomètrics i formats de número](topic:units-and-stations).

### Punts

Buit, indica com obrir un fitxer de punts. Amb punts, mostra el nom del fitxer, el nombre de punts i quants en tenen cota, després una taula de **grups de punts**: una fila per cada primera paraula de la descripció (GRD, FL, TBS …), amb un recompte i una opció de **Superfície**:

- {{ui:Punts}}: els punts entren a la superfície (és el valor per defecte de cada grup).
- {{ui:Línia de ruptura}}: els punts del grup s'uneixen, en ordre de número de punt, en una sola línia de ruptura.
- {{ui:Exclòs}}: el grup no toca la superfície.

### Superfície

Dades del terreny existent: punts, triangles, cota més baixa i més alta, cota mitjana, àrea 2D i 3D, línies de ruptura i si hi ha un contorn. Sota les dades, un quadre llista tot el que el constructor de la superfície ha hagut d'arreglar o no ha pogut fer. Després:

- **Aresta exterior més llarga**: 0 manté tots els triangles exteriors; un número retalla els triangles exteriors llargs i prims.
- Enllaços que apareixen quan s'apliquen: {{ui:Elimina el límit}}, {{ui:Elimina les línies de ruptura dibuixades}} i, per a una superfície llegida de LandXML, {{ui:Reconstrueix la superfície a partir dels punts}}.

### Visualització

- **Superfície**: {{ui:Terreny actual}} o {{ui:Projectat (explanat)}}. La segona està disponible quan una plataforma o un corredor explana sense problemes.
- **Corbes de nivell cada**, **Corbes principals cada** i **Bandes** (el nombre de bandes de color).
- Caselles: {{ui:Corbes de nivell}}, {{ui:Etiquetes de corbes}}, {{ui:Triangles}}, {{ui:Bandes d'elevació}}, {{ui:Fletxes de talús}}, {{ui:Punts}}, {{ui:Etiquetes de punts}}, {{ui:Línies de ruptura}}, {{ui:Vora de la superfície}}, {{ui:Canonades}}.
- Apareix una llegenda de les cotes de les bandes quan les bandes són activades.

La configuració de visualització es desa amb el projecte però no és un pas de desfer: {{key:Mod+Z}} mai no desmarca una casella.

## Plànol

El plànol mostra els punts, la superfície i tot el que dissenyeu, en vista de planta amb el nord cap amunt. Gireu la roda per ampliar al punter, arrossegueu l'espai buit per desplaçar. La llista completa és a [Tecles i ratolí](topic:keyboard).

- En un projecte buit, una caixa titulada **Comença amb punts topogràfics** llista els primers passos i ofereix {{ui:Obre el lloc d'exemple}}.
- Mentre hi ha una eina de dibuix activa, una indicació a la part superior del plànol diu on fer clic i com acabar.
- Arrossegar un fitxer sobre el plànol mostra "Deixa anar un fitxer de punts, LandXML o projecte".
- Les coses seleccionades es ressalten. Un traçat o una plataforma seleccionats mostren nanses quadrades als seus PI o cantons; una estructura seleccionada mostra una sola nansa. Arrossegueu una nansa per moure-la.
- Els punts topogràfics seleccionats tenen un anell. {{key:Shift}} i un clic afegeixen o treuen un punt; {{key:Shift}} i un arrossegament dibuixen una caixa (o, arrossegant al voltant, un llaç) que afegeix els punts de dins. Vegeu [Selecciona, copia i enganxa punts topogràfics](topic:copy-paste-points).

## Vista de perfil

Premeu {{key:R}} o feu clic a {{ui:Perfil}} per obrir-la sota el plànol. La seva barra té:

- una llista de traçats (activa quan n'hi ha dos o més)
- {{ui:Afegeix PVI}}: mentre està premut, un clic al perfil afegeix un PVI ({{key:I}} l'activa o la desactiva)
- una lectura del punt quilomètric, el terreny, la cota de projecte, la pendent i el desmunt o terraplè sota el punter
- un botó de tancar

El perfil mostra el terreny existent, el perfil de projecte, les pendents de cada tangent, el punt quilomètric i la cota de cada PVI, L i K de cada corba vertical amb el seu BVC i EVC, els punts alts i baixos, i l'exageració vertical. Sempre ajusta tot el traçat: no fa zoom ni desplaçament. En moure el punter al llarg del perfil, un punt es posa sobre el traçat al plànol.

## Tauler dret: Propietats

El títol indica què mostra.

- **Projecte** (res seleccionat): els traçats i les plataformes com a enllaços, el bloc **Moviment de terres**, i el bloc **Xarxa de tubs** amb les seves regles i problemes.
- **Traçat**: nom, punt quilomètric inicial, longitud, la taula de PI, les corbes, la taula de PVI i les dades del perfil de projecte, i la configuració del **Corredor**.
- **Plataforma**: nom, cota, pendents de desmunt i terraplè, àrea, dades d'enllaç amb el terreny i moviment de terres.
- **Estructura** o **Tub**: mides, cotes de tapa, cotes de solera, pendent, recobriment i qualsevol problema.
- **Punt** i el seu número: les coordenades del punt, la cota, la descripció i el grup (només lectura).

Els camps tenen efecte quan premeu {{key:Enter}} o en sortiu. Un valor que no s'accepta es marca com a no vàlid i no canvia res.

## Barra d'estat

- **E** i **N**: coordenades est i nord sota el punter.
- **Terreny**: la cota del terreny allà (i **Explanat** quan una plataforma o un corredor l'ha canviat), o "Fora de la superfície".
- El traçat més proper (o el seleccionat) amb el **PK** i el desplaçament (**L** o **R**) sota el punter.
- A la dreta, els missatges: què acaba de passar, o per què s'ha rebutjat alguna cosa. Un missatge s'esborra sol al cap de pocs segons.

## Diàlegs

- **Importa punts**: s'obre amb cada fitxer de punts. Vegeu [Importa punts topogràfics](topic:import-points).
- **Traça el plànol a PDF**: vegeu [Traça el plànol a PDF](topic:plot-pdf).
- **Canvis sense desar**: pregunta abans que {{ui:Nou}} o obrir un projecte o un fitxer LandXML descarti el treball sense desar. {{ui:Desa una còpia}} baixa abans el projecte.

## Pantalles petites

Fins a 760 píxels d'amplada, com en un telèfon, el plànol conserva la pantalla: la barra d'eines és una sola fila que es desplaça lateralment, i els taulers s'obren com a fulls des d'una barra a la part inferior. {{ui:Eines}} amaga la barra d'eines i {{ui:Mou}} la posa a la part inferior.
