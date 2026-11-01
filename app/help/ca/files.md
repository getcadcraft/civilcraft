---
title: Fitxers que podeu obrir, desar i exportar
summary: Fitxers de punts, LandXML i projectes de CivilCraft per obrir; projectes, LandXML, DXF i PDF per exportar; què conserva cada un, on van els fitxers i què canvia sense connexió.
keywords: obre, desa, exporta, importa, formats de fitxer, csv, txt, landxml, xml, dxf, pdf, json, baixa, fitxer de projecte
from: a7debb61
---

CivilCraft obre fitxers del vostre ordinador i desa tornant-los a baixar a l'ordinador. No es puja res i no es guarda res en cap servidor. Vegeu també [Els vostres fitxers](common:your-files).

## Què obre

Feu clic a {{ui:Obre}} (o premeu {{key:Mod+O}}) i trieu un fitxer, o arrossegueu el fitxer des de {{pick:mac=Finder|windows=File Explorer|linux=el gestor de fitxers}} fins al plànol. Un fitxer cada cop; els fitxers de més de 200 MB es rebutgen.

| Tipus | Noms de fitxer | Què passa |
|---|---|---|
| Fitxer de punts | `.csv`, `.txt`, `.pnt`, `.xyz` (qualsevol fitxer de text) | S'obre el diàleg **Importa punts**. Els punts substitueixen els punts del projecte; els traçats, les plataformes i els tubs es mantenen. |
| LandXML | `.xml`, `.landxml` | Es crea un **projecte nou** a partir del fitxer (abans es pregunta si l'actual té canvis sense desar). |
| Projecte de CivilCraft | `.civilcraft.json` (qualsevol `.json`) | El projecte s'obre tal com es va desar (abans es pregunta si l'actual té canvis sense desar). |

CivilCraft decideix pel final del fitxer i després pels primers caràcters: el text que comença amb `{` es llegeix com a projecte, el text que comença amb `<` com a LandXML, i la resta com a fitxer de punts. Un fitxer que el quadre d'obrir mostra en gris encara es pot deixar anar sobre el plànol.

:::note
Importar un fitxer de punts en un projecte que ja té punts els substitueix sense preguntar, i buida l'historial de desfer (obrir qualsevol fitxer és un inici nou per a desfer). Si la superfície venia de LandXML, importar punts la torna a convertir en una superfície construïda a partir dels punts. Desa primer si podríeu voler recuperar els punts antics.
:::

Detalls: [Formats de fitxer de punts](topic:point-file-formats), [LandXML: què es llegeix i què s'escriu](topic:landxml-reference).

## Què desa

{{ui:Desa}} ({{key:Mod+S}}) escriu dos fitxers un al costat de l'altre, amb el nom de **Nom** del tauler esquerre: `<nom>.civilcraft.json`, el projecte que continueu editant, i `<nom>.ifc`, el mateix disseny en IFC 4.3 per a qualsevol altre programa (vegeu [Exportació i importació d'IFC](topic:ifc)). Cada fitxer registra l'altre, i l'IFC porta també una còpia comprimida del projecte, de manera que un IFC enviat sol es pot tornar a obrir completament editable.

- **A Studio** els dos fitxers s'escriuen un al costat de l'altre, al mateix lloc.
- **A Chrome i Edge** el primer desament demana una carpeta i hi escriu tots dos; els desaments posteriors van a la mateixa carpeta. Cancel·leu la pregunta de la carpeta per baixar els dos fitxers.
- **En altres navegadors** els dos fitxers es baixen, primer el fitxer de projecte.

Obrir qualsevol dels dos fitxers busca l'altre. Obriu-los junts (o arrossegueu-los tots dos), o obriu-ne un: a Studio l'altre es troba a la mateixa carpeta; en un navegador, CivilCraft us demana que l'afegiu, o que continueu amb el que teniu. Si l'IFC l'ha canviat un altre programa després que CivilCraft el desés, o un fitxer és més antic que l'altre, el projecte s'obre a partir del disseny més recent i el tauler Problemes explica què ha passat, amb **Desa ara** (torna a escriure tots dos fitxers) i **Mostra la geometria de l'IFC com a referència**. Un IFC sol que un altre programa ha canviat s'obre a partir de la seva còpia del projecte amb el que encara coincideix: els traçats que ha canviat prenen la seva geometria, els objectes que ha suprimit es deixen fora, i la resta dels canvis es llisten però no s'apliquen. Un fitxer de projecte anterior a la 0.7.1 s'obre com abans.

El fitxer de projecte conserva:

- cada punt (número, coordenades, cota, descripció) i el nom del fitxer de punts d'on venen
- la configuració de la superfície: opcions de grup, línies de ruptura dibuixades, el contorn, l'aresta exterior més llarga, i una TIN llegida de LandXML
- la configuració de visualització
- els traçats amb els seus PI, radis i punt quilomètric inicial, els seus perfils de projecte (PVI i longituds de corba) i la configuració del corredor
- les plataformes i la xarxa de tubs amb les seves regles

No conserva l'historial de desfer. Les superfícies, les corbes de nivell, les línies d'enllaç amb el terreny (daylight) i els volums no s'emmagatzemen; es tornen a construir a partir de les dades desades quan s'obre el projecte. Un fitxer de projecte d'un CivilCraft més nou es rebutja amb un missatge que n'indica la versió.

## Què exporta

| Botó | Fitxer | Contingut |
|---|---|---|
| {{ui:LandXML}} | `<nom>.xml` | LandXML 1.2: punts, el terreny actual (i la superfície projectada quan n'hi ha una) com a superfícies TIN, traçats, perfils del terreny i de projecte, la xarxa de tubs |
| {{ui:DXF}} | `<nom>.dxf` | DXF R12 de la línia del plànol tal com es mostra, en capes amb nom |
| {{ui:DWG}} | `<nom>.dwg` | La mateixa línia com a dibuix DWG, en el format que trieu (del 2000 al 2018) |
| {{ui:PDF}} | `<nom>.pdf` | Un traçat vectorial del plànol en un full, a l'escala que trieu |
| {{ui:GLB}} o {{ui:OBJ}} (a la barra de la vista 3D) | `<nom>-3d.glb`, `<nom>-3d.obj` | El que mostra la vista 3D com a model 3D: metres, Y cap amunt, escala real, al voltant d'un origen local registrat |

Què deixa fora cada un: [LandXML d'intercanvi](topic:landxml), [Exporta el plànol a DXF](topic:dxf-export) (també DWG), [Traça el plànol a PDF](topic:plot-pdf), [Exporta el lloc en 3D](topic:export-3d).

## On van els fitxers

Els fitxers desats i exportats van on el navegador posa les baixades, normalment la carpeta Descàrregues. Per triar una carpeta cada vegada:

:::chromium
Obriu la **Configuració** del navegador, després **Descàrregues**, i activeu **Pregunta on desar cada fitxer abans de baixar-lo**.
:::

:::firefox
Obriu **Configuració**, després **General**, i a **Fitxers i aplicacions** trieu **Pregunta sempre on desar els fitxers**.
:::

:::safari
Obriu **Safari > Configuració > General** i poseu **Ubicació de baixada de fitxers** en **Pregunta per a cada baixada**.
:::

Si deseu dues vegades amb el mateix nom, el navegador pot afegir un número al segon fitxer, per exemple `Lloc (1).civilcraft.json`. Obriu el més recent la propera vegada.

## En línia i sense connexió

CivilCraft funciona només al vostre ordinador en tots dos casos: obrir llegeix el fitxer al navegador, desar el baixa. Per obrir CivilCraft sense cap connexió, deseu-lo primer per a ús sense connexió:

1. Mentre hi sigueu connectats, feu clic a {{ui:Desa per fer-lo servir sense connexió}} a la barra d'aplicació de dalt.
2. El botó compta ("Desant 12 de 30") i després mostra {{ui:Disponible sense connexió}}. CivilCraft és petit (uns 0.6 MB), així que triga una mica. La còpia desada inclou aquesta ajuda i el lloc d'exemple.
3. Sense connexió, obriu la mateixa adreça (o un marcador seu). Tot funciona, inclòs {{ui:Obre el lloc d'exemple}}.

Els altres estats del botó:

- {{ui:No s'ha pogut desar}}: alguns fitxers no s'han baixat. Comproveu la connexió i feu clic per tornar-ho a provar.
- {{ui:Mode sense connexió no disponible}}: aquesta finestra del navegador no pot guardar una còpia sense connexió (les finestres privades i alguns ordinadors gestionats ho bloquegen). Useu una finestra normal.

Feu clic a {{ui:Disponible sense connexió}} per veure quan es va desar la còpia, amb dues opcions: {{ui:Torna a desar (obté la versió més recent)}} i {{ui:Elimina la còpia sense connexió}}. Torneu a desar abans d'una visita a obra perquè la còpia coincideixi amb la versió més recent. Més a [Sense connexió](common:offline).

:::offline
Ara no teniu connexió. Si CivilCraft s'ha desat per a ús sense connexió, tot funciona, inclòs el lloc d'exemple. Si no, continueu treballant en aquesta pestanya, però no la recarregueu fins que tingueu connexió; sense una còpia desada, {{ui:Obre el lloc d'exemple}} falla amb "No s'ha pogut carregar la mostra".
:::

:::tip
Per a feina de camp, deseu CivilCraft per a ús sense connexió i porteu els fitxers de punts al mateix portàtil. Els projectes i les exportacions es desen com a baixades sense connexió, de manera que podeu importar les mesures d'un dia, revisar la superfície i desar el projecte a l'obra.
:::

El desament al núvol encara no està disponible, i les versions d'escriptori encara no estan publicades. Avui, els fitxers que deseu són l'única còpia: guardeu-los en un lloc amb còpia de seguretat.

## Complements que usa un fitxer

Quan desats un projecte que conté dades d'un complement (les marques de normativa d'edificació, o una font d'Adreça a obra), el fitxer registra quins complements i quines versions. Si l'obriu en un ordinador que no en té un, una barra sobre el plànol ho indica i ofereix afegir-lo des de la llista del vostre compte. El registre només és una nota: el fitxer s'obre de totes maneres.

## Desfer des de Studio

Dins de CadCraft Studio, cada pas que acabeu a CivilCraft s'indica a Studio, de manera que el seu desfer a nivell de projecte pot desfer l'últim pas entre aplicacions. Studio només desfà un pas quan la pila de desfer de CivilCraft és exactament com la va deixar aquell pas; després d'obrir un altre fitxer, Studio ometrà aquesta finestra.

## Tancar amb canvis sense desar

Quan el projecte té canvis sense desar i tanqueu la pestanya, torneu a carregar la pàgina o en sortiu, el navegador pregunta si voleu sortir. El text i l'aspecte són del navegador i CivilCraft no els pot canviar. {{ui:Nou}}, i obrir un projecte o un fitxer LandXML, demanen en canvi al quadre **Canvis sense desar** propi de CivilCraft, amb {{ui:Cancel·la}}, {{ui:No desis}} i {{ui:Desa una còpia}}.
