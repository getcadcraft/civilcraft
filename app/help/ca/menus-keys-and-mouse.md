---
title: Menus, tecles i ratolí
summary: Trieu un estil de menús que encaixi amb la manera com ja treballeu, assigneu a qualsevol ordre la vostra pròpia tecla, moveu les ordres entre pestanyes de la cinta, i definiu què fan la roda i els botons del ratolí al plànol i en 3D.
keywords: estil de menú, menús, cinta, cinta civil, barra d'eines, línia d'ordres, dibuix clàssic, dreceres de teclat, dreceres, tecles, personalitza, reassigna, ratolí, roda, invertir, direcció del zoom, botó central, botó dret, desplaça, orbita, exporta, importa, canvi, familiar
from: 07ac73a0
---

Les ordres de CivilCraft són les mateixes independentment de com hi arribeu. Un **estil de menús** només decideix on es troben a la pantalla, com es diuen allà i amb quines tecles s'executen, de manera que podeu mantenir els hàbits que ja teniu. Trieu-ne un a {{ui:Configuració}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menus, tecles i ratolí}}; el canvi és immediat, i aquest navegador el recorda.

## Els tres estils

| Estil | Què obteniu |
|---|---|
| {{ui:CivilCraft}} | La barra d'eines pròpia de CivilCraft (Fitxer, Exporta, Superfície, Disseny, Edició, GIS, Visualització) i tecles simples: {{key:A}} traçat, {{key:G}} plataforma, {{key:P}} canonades, {{key:B}} línia de ruptura, {{key:O}} límit, {{key:L}} línia característica, {{key:R}} perfil, {{key:X}} seccions, {{key:E}} pendents, {{key:D}} 3D, {{key:F}} ajusta, {{key:V}} selecciona. El punt de partida. |
| {{ui:Dibuix clàssic}} | Una cinta petita ({{ui:Inici}}, {{ui:Insereix}}, {{ui:Sortida}}) i una línia d'ordres, per a qui escriu ordres: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (desfés), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Escriviu en qualsevol lloc i les lletres van a la línia d'ordres; {{key:Enter}} n'executa una, {{key:Enter}} sense res repeteix l'última ordre, {{key:Esc}} l'esborra. El botó central desplaça. |
| {{ui:Cinta civil}} | Pestanyes de botons grans, com les agrupen els programes de disseny civil les seves eines: {{ui:Inici}} (dades del terreny, crea el disseny, vistes de perfil i de secció), {{ui:Superfícies}}, {{ui:Modifica}}, {{ui:Geolocalització}}, {{ui:Visualització}} i {{ui:Sortida}}, amb un menú {{ui:Fitxer}} i botons ràpids a la dreta. Les tecles simples es mantenen. El botó central desplaça el plànol; en 3D, el botó central desplaça i {{key:Shift}} amb el botó central orbita. |

Tots els estils mantenen les tecles {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Una tecla de la disposició pròpia de CivilCraft que el vostre estil ha assignat a una altra ordre no fa res, i la barra d'estat indica on ha anat a parar la seva ordre ("A Les meves tecles, Plataforma és Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} i les fletxes mantenen sempre el seu significat, i mentre dibuixeu una línia, els seus punts conserven les seves tecles ({{key:Backspace}}, {{key:Enter}}).
:::

## Feu-lo vostre

1. Trieu l'estil més proper al que voleu i feu clic a {{ui:Personalitza…}}.
2. A {{ui:Tecles i menús}}, cerqueu una ordre (el quadre de cerca ajuda). Feu clic a {{ui:Afegeix una clau}} i premeu la tecla, o dues tecles seguides per a una tecla de dues lletres. Feu clic en una tecla per treure-la.
3. Amb una cinta, {{ui:On es troba}} mou l'ordre a un altre panell i pestanya, al menú {{ui:Fitxer}}, o a {{ui:Només tecles}}.
4. A {{ui:Ratolí}}, definiu la roda, els botons que desplacen el plànol i què fa cada botó a la vista 3D.
5. Doneu-li un nom i feu clic a {{ui:Desa}}.

Desar un estil integrat en crea una còpia pròpia ("La meva cinta civil"); l'integrat no canvia mai. Una tecla assignada a dues ordres, o una que s'executaria abans que es pogués escriure una tecla de dues lletres, es mostra en vermell i cal corregir-la abans de poder desar.

## Ratolí

- **Roda del ratolí**: {{ui:Desplaçar amunt apropa}} (el punt de partida) o {{ui:Desplaçar amunt allunya}}, i amb quina rapidesa, al plànol i en 3D. Una pinça al ratolí tàctil fa sempre zoom en la direcció en què es mouen els dits.
- **Desplaça el plànol amb**: el botó central, el botó dret, o tots dos. {{key:Space}} i arrossegar també desplaça. El botó esquerre sempre selecciona i dibuixa.
- **Arrossega a la vista 3D**: {{ui:La pròpia de cada vista}} manté els botons de CivilCraft (l'esquerre orbita, el dret desplaça). O assigneu a cada botó orbitar, desplaçar, fer zoom o res; {{key:Shift}} amb el botó intercanvia orbitar i desplaçar. Un clic sense arrossegar encara selecciona.

## Porteu-la amb vosaltres

{{ui:Exporta}} desa l'estil en ús com a un petit fitxer `.ccinput.json`; {{ui:Importa…}} n'afegeix un, des d'un altre ordinador o d'un company. Un fitxer importat només pot apuntar a les ordres pròpies de CivilCraft: la resta s'omet i es compta a la barra d'estat. {{ui:Suprimeix aquest estil}} elimina un dels vostres.

:::note
Aquests ajustos es mantenen en aquest navegador. {{ui:Usa aquest estil a totes les aplicacions}} sota les targetes d'estil fa que totes les aplicacions s'obrin amb el seu estil corresponent (la seva pròpia barra d'eines, una cinta o Dibuix clàssic), amb els canvis que hàgiu fet a cada aplicació. CivilCraft no té estil de barra de menús: quan s'escull la barra de menús d'una altra aplicació per a totes les aplicacions, CivilCraft manté la seva pròpia barra d'eines.
:::

Relacionat: [Teclat i ratolí](topic:keyboard) · [Configuració de CivilCraft](topic:settings) · [Des d'altre programari civil](topic:coming-from)
