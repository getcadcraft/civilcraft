---
title: Fitxers que pots obrir, desar i exportar
summary: Entren fitxers de punts, LandXML i projectes de CivilCraft; surten projectes, LandXML, DXF i PDF. Què conserva cadascun, on van els fitxers i què canvia sense connexió.
keywords: obrir, desar, exportar, importar, formats de fitxer, csv, txt, landxml, xml, dxf, pdf, json, baixa, fitxer de projecte
from: 82bff559
---

CivilCraft obre fitxers del vostre ordinador i desa baixant-los de nou a l'ordinador. No es puja res i no es guarda res en cap servidor. Vegeu també [Els vostres fitxers](common:your-files).

## Què obre

Feu clic a {{ui:Obre}} (o premeu {{key:Mod+O}}) i trieu un fitxer, o arrossegueu el fitxer al plànol des de {{pick:mac=Finder|windows=l'Explorador de fitxers|linux=l'administrador de fitxers}}. Un fitxer cada vegada; els fitxers de més de 200 MB es rebutgen. Un fitxer LandXML o de projecte de més de 32 MB es llegeix en trossos d'uns 4 MB, mai com un sol bloc de text; mentre s'obre un LandXML, cal comptar que fa servir uns 13 cops la mida del fitxer en memòria (en la nostra prova, un fitxer de 69 MB va fer servir uns 0.9 GB).

| Tipus | Noms de fitxer | Què passa |
|---|---|---|
| Fitxer de punts | `.csv`, `.txt`, `.pnt`, `.xyz` (qualsevol fitxer de text) | S'obre el diàleg **Importa punts**. Els punts substitueixen els del projecte; els traçats, les plataformes i els tubs es mantenen. |
| LandXML | `.xml`, `.landxml` | Es crea un **projecte nou** a partir del fitxer (abans es pregunta si l'actual té canvis sense desar). |
| Projecte de CivilCraft | `.civilcraft.json` (qualsevol `.json`) | El projecte s'obre tal com es va desar (abans es pregunta si l'actual té canvis sense desar). |

CivilCraft decideix pel final del nom del fitxer i, després, pels primers caràcters: el text que comença per `{` es llegeix com a projecte, el que comença per `<` com a LandXML, i qualsevol altra cosa com a fitxer de punts. Un fitxer que el quadre d'obrir mostra en gris encara es pot arrossegar al plànol.

:::note
Importar un fitxer de punts en un projecte que ja té punts els substitueix sense preguntar, i buida l'historial de desfer (obrir qualsevol fitxer és un inici nou per a desfer). Si el model digital del terreny venia d'un LandXML, importar punts el torna a fer a partir dels punts. Deseu primer si potser voleu recuperar els punts antics.
:::

Més detalls: [Formats de fitxer de punts](topic:point-file-formats), [LandXML: què es llegeix i què s'escriu](topic:landxml-reference).

## Què desa

{{ui:Desa}} ({{key:Mod+S}}) escriu dos fitxers un al costat de l'altre, amb el nom que indica **Nom** al panell de l'esquerra: `<name>.civilcraft.json`, el projecte que continueu editant, i `<name>.ifc`, el mateix disseny en IFC 4.3 per a qualsevol altre programa (vegeu [Exportació i importació d'IFC](topic:ifc)). Cada fitxer registra l'altre, i l'IFC també porta una còpia comprimida del projecte, de manera que un IFC enviat tot sol es pot tornar a obrir completament editable.

- **A Studio** els dos fitxers s'escriuen un al costat de l'altre, al mateix lloc.
- **A Chrome i Edge**, el primer desament demana una carpeta i hi escriu tots dos; els desaments posteriors van a la mateixa carpeta. Cancel·leu la pregunta sobre la carpeta per baixar tots dos fitxers.
- **En altres navegadors** es baixen tots dos fitxers, primer el del projecte.

En obrir qualsevol dels dos fitxers es busca l'altre. Obriu-los tots dos a la vegada (o arrossegueu-los tots dos), o obriu-ne un: a Studio l'altre es troba a la mateixa carpeta; en un navegador, CivilCraft us demana que l'afegiu, o que continueu amb el que teniu. Si un altre programa ha canviat l'IFC després que CivilCraft el desés, o si un fitxer és més antic que l'altre, el projecte s'obre a partir del disseny més nou i el panell de **Problemes** explica què ha passat, amb **Desa ara** (torna a escriure tots dos fitxers) i **Mostra la geometria de l'IFC com a referència**. Un IFC pel seu compte que un altre programa ha canviat s'obre des de la seva còpia del projecte amb el que encara coincideix: els traçats que ha canviat prenen la seva geometria, els objectes que ha suprimit es deixen fora, i la resta dels canvis es llisten, no s'apliquen. Un fitxer de projecte anterior a la versió 0.7.1 s'obre com abans.

El fitxer de projecte conserva:

- cada punt (número, coordenades, cota, descripció) i el nom del fitxer de punts d'on venen
- la configuració del model digital del terreny: les eleccions de grup, les línies de ruptura dibuixades, el límit, la vora exterior més llarga i una TIN llegida d'un LandXML
- la configuració de visualització
- els traçats amb els seus PI, radis i abscissa inicial, els seus perfils de disseny (PVI i longituds de corba) i la configuració dels corredors
- les plataformes i la xarxa de tubs amb les seves regles

No conserva l'historial de desfer. Els models digitals del terreny, les corbes de nivell, les línies de tall i els volums no s'emmagatzemen; es tornen a construir a partir de les dades desades quan s'obre el projecte. Un fitxer de projecte d'una versió més nova de CivilCraft es rebutja amb un missatge que n'indica la versió.

## Què exporta

| Botó | Fitxer | Contingut |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: punts, el terreny actual (i la superfície d'explanació quan n'hi ha una) com a superfícies TIN, traçats, perfils del terreny i de disseny, la xarxa de tubs |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 de les línies del plànol tal com es mostren, en capes amb nom |
| {{ui:DWG}} | `<name>.dwg` | Les mateixes línies en un dibuix DWG, en el format que trieu (de 2000 a 2018) |
| {{ui:PDF}} | `<name>.pdf` | Un traçat vectorial del plànol en un full, a una escala que trieu |
| {{ui:GLB}} o {{ui:OBJ}} (a la barra de la vista 3D) | `<name>-3d.glb`, `<name>-3d.obj` | El que mostra la vista 3D com a model 3D: metres, Y cap amunt, escala real, al voltant d'un origen local registrat |

El que deixa fora cadascun: [Intercanvi LandXML](topic:landxml), [Exporta el plànol a DXF](topic:dxf-export) (també DWG), [Traça el plànol a PDF](topic:plot-pdf), [Exporta el lloc en 3D](topic:export-3d).

## On van els fitxers

Els fitxers desats i exportats van on el navegador posa les baixades, normalment a la carpeta Baixades. Per triar una carpeta cada vegada:

:::chromium
Obriu la **Configuració** del navegador, després **Baixades**, i activeu **Pregunta on desar cada fitxer abans de baixar-lo**.
:::

:::firefox
Obriu **Configuració**, després **General**, i a **Fitxers i aplicacions** trieu **Pregunta sempre on desar els fitxers**.
:::

:::safari
Obriu **Safari > Configuració > General** i poseu **Ubicació de baixada de fitxers** en **Pregunta a cada baixada**.
:::

Si deseu dues vegades amb el mateix nom, el navegador pot afegir un número al segon fitxer, per exemple `Site (1).civilcraft.json`. Obriu el més nou la propera vegada.

## En línia i fora de línia

De totes maneres, CivilCraft només funciona al vostre ordinador: en obrir es llegeix el fitxer al navegador, en desar es baixa. Per obrir CivilCraft sense cap connexió, primer deseu-lo per fer-lo servir sense connexió:

1. Mentre hi ha connexió, feu clic a {{ui:Desa per fer-lo servir sense connexió}} a la barra de l'aplicació de dalt.
2. El botó compta amb números ("Desant 12 de 30") i després mostra {{ui:Disponible sense connexió}}. CivilCraft és petit (uns 0.6 MB), així que això triga una estona. La còpia desada inclou aquesta ajuda i el lloc de mostra.
3. Sense connexió, obriu la mateixa adreça (o un marcador d'aquesta). Tot funciona, inclòs {{ui:Obre el lloc de mostra}}.

Els altres estats del botó:

- {{ui:No s'ha pogut desar}}: alguns fitxers no s'han baixat. Comproveu la connexió i feu-hi clic per tornar-ho a provar.
- {{ui:Mode sense connexió no disponible}}: aquesta finestra del navegador no pot guardar una còpia fora de línia (les finestres privades i alguns ordinadors gestionats ho bloquegen). Useu una finestra normal.

Feu clic a {{ui:Disponible sense connexió}} per veure quan es va desar la còpia, amb dues opcions: {{ui:Torna a desar (obté la versió més recent)}} i {{ui:Elimina la còpia sense connexió}}. Torneu a desar abans d'una visita a una obra perquè la còpia coincideixi amb la versió més recent. Més a [Mode sense connexió](common:offline).

:::offline
Ara no hi ha connexió. Si CivilCraft s'ha desat per fer-lo servir sense connexió, tot funciona, inclòs el lloc de mostra. Si no, seguiu treballant en aquesta pestanya, però no la recarregueu fins que torneu a tenir connexió; sense una còpia desada, {{ui:Obre el lloc de mostra}} falla amb "La mostra no s'ha pogut carregar".
:::

:::tip
Per a feina de camp, deseu CivilCraft per fer-lo servir sense connexió i porteu els fitxers de punts al mateix portàtil. Els projectes i les exportacions es desen com a baixades sense connexió, així que podeu importar les mesures d'un dia, comprovar el model digital del terreny i desar el projecte a l'obra.
:::

El desament al núvol encara no està disponible, i les versions d'escriptori encara no s'han publicat. De moment, els fitxers que desau són l'única còpia: guardeu-los en un lloc amb còpia de seguretat.

## Complements que usa un fitxer

Quan deseu un projecte que conté dades d'un complement (les marques de Normativa d'edificació, o una font d'adreça a obra), el fitxer registra quins complements i quines versions. Si l'obriu en un ordinador que no el té, una barra sobre el plànol ho indica i ofereix afegir-lo des de la llista del vostre compte. El registre només és una nota: el fitxer s'obre de totes maneres.

## Desfer des de Studio

Dins de CadCraft Studio, cada pas que acabeu a CivilCraft s'indica a Studio, perquè el seu desfer a nivell de projecte pugui desfer l'últim pas entre aplicacions. Studio només desfà un pas quan la pila de desfer pròpia de CivilCraft és exactament com la va deixar aquell pas; després d'obrir un altre fitxer, aleshores Studio ignora aquesta finestra de desfer.

## Tancar amb canvis sense desar

Quan el projecte té canvis sense desar i tanqueu la pestanya, recarregueu o abandoneu la pàgina, el navegador pregunta si voleu marxar. El text i l'aspecte són del navegador i CivilCraft no els pot canviar. {{ui:Nou}}, i obrir un projecte o un fitxer LandXML, pregunten en canvi al quadre propi de CivilCraft **Canvis sense desar**, amb {{ui:Cancel·la}}, {{ui:No desis}} i {{ui:Desa una còpia}}.
