---
title: Dissenyar un jardí, de principi a fi
summary: Els deu passos de l'arquitecte paisatgista, des de la topografia fins al joc publicat, amb el que fa avui l'espai de treball de Paisatgisme per a cadascun i el que encara no fa.
keywords: tutorial, pas a pas, com es fa, disseny de paisatgisme, disseny de jardins, primers passos, exemple, mostra, pas per pas, topografia, línies, terreny, plantació, quadre, fulls, publicar, un sol projecte
from: 87900bf5
---

Un projecte de paisatgisme va en cercle: topografia, esbós, línies, terreny, àrees, cotes, plantació, quadres, fulls, i tornar a començar. Aquests són els deu passos, amb el que hi ha per a cadascun. Quan un pas té un buit, es indica a **Encara no implementat** al final, i no s'amaga dins del pas.

Podeu seguir-lo al lloc d'exemple, o al vostre propi plànol topogràfic. Amb el vostre, comenceu pel pas 1.

## 1. Importar la topografia

{{ui:Superfície}} › {{ui:Línies d'un dibuix…}}: trieu el plànol topogràfic (DWG 2000–2018 o DXF). Comproveu les unitats, preneu les corbes de nivell, les polilínies 3D i el contorn per a la superfície, i els blocs de punts com a punts topogràfics. La secció **Comprovació de cotes topogràfiques** llegeix les cotes escrites com a text o com a atribut i enumera el que sembla incorrecte (unitats, sistema de coordenades, distància al zero, corbes planes, cotes estranyes, punts duplicats) abans que afegiu res. Vegeu [Comprovar un plànol topogràfic en importar-lo](topic:survey-check) i [Obrir un DWG o DXF com a línies](topic:open-dwg-dxf). Definiu el sistema de coordenades amb {{ui:Sistema de coordenades…}}.

## 2. Esbossos a mà

Un full en paper, com una topografia antiga o una còpia marcada, entra amb {{ui:Escaneja…}} (Comença des d'un escaneig): es col·loca a escala o amb coordenades conegudes sota el plànol, i es pot calcar en línies. ModelCraft llegeix una foto d'un esbós a mà (Fitxer › Importa una foto d'un esbós…). CivilCraft no té cap eina per a un esbós a mà: col·loqueu el full sota el plànol i dibuixeu-hi a sobre.

## 3. De l'esbós a les línies

Dibuixeu línies característiques i contorns sobre la topografia a CivilCraft, o dibuixeu-los al dibuix 2D. Paisatgisme › Més › {{ui:Des d'una línia}} converteix una línia en paviment, una àrea plantada, un mur, escales, una línia característica i més, tot enllaçat: si moveu la línia, l'objecte la segueix. Vegeu [Objectes a partir de línies](topic:objects-from-lines). A SuperCad Studio, obriu el lloc, el dibuix i el model de l'edifici en un sol projecte: l'espai de treball **Paisatgisme** té les eines de tots, i una línia triada al dibuix 2D pot esdevenir un objecte de paisatgisme que la segueix (Ctrl+K, {{ui:Objecte de paisatgisme des de la línia del dibuix triada}}).

## 4. El terreny projectat

Obriu {{ui:Superfície}} › {{ui:Més}} › {{ui:Espai de treball de paisatgisme}}. Construïu el terreny projectat amb {{ui:Plataforma}}, {{ui:Berma}}, {{ui:Rasa de drenatge}} i les àrees d'explanació amb cotes puntuals i corbes de nivell; el paviment, els camins, els murs, les rampes i les escales que afegiu també s'expliquen dins de la mateixa superfície projectada. El terreny existent no canvia mai. {{ui:Cotes}} › {{ui:Modificadors del terreny…}} enumera tot el que modela el terreny en un sol ordre, amb el desmunt i el terraplè de cadascun. Vegeu [Explanació](topic:landscape-grading) i [Modificadors del terreny i cotes en viu](topic:ground-modifiers).

## 5. Paviments i àrees plantades

{{ui:Paviments i elements construïts}} › {{ui:Paviment}}, {{ui:Camí}}, {{ui:Mur}}, {{ui:Vorada}}, {{ui:Rampa}} i {{ui:Escales}}. {{ui:Àrees}} dibuixa un prat, un bancal, un prat alt o una cobertura vegetal amb la seva composició; es retalla sola al voltant del paviment, dels murs i de les escales. {{ui:Bancal}} omple una àrea a la separació de les plantes, a partir d'una barreja de plantes. Vegeu [Paviments i elements construïts](topic:hardscape), [Àrees plantades](topic:planted-areas) i [Plantació](topic:planting).

## 6. Cotes, pendents i unions

A **Comprovacions d'explanació**, marqueu **Anàlisi de pendents** i **Fletxes de flux i embassament**. Si l'aigua s'embassa contra una terrassa, hi afegiu una {{ui:Rasa de drenatge}} al voltant. Les propietats us diuen quantes contrapetjades necessiten les escales i si hi cap, i on un camí és més dret del seu límit. El tauler de Problemes enumera on els objectes es troben malament: un mur massa alt, un bancal per sobre del paviment, unes escales que no arriben al replà. {{ui:Cota puntual}} i {{ui:Fletxa de pendent}} etiqueten el terreny i s'actualitzen soles.

## 7. Plantació

A **Plantes**, cerqueu a la llista de plantes (unes quantes centenes d'espècies, o la vostra pròpia llista), trieu-ne una, i {{ui:Planta}}, {{ui:Bancal}} o {{ui:Seto}}. Definiu la mida i les etiquetes de la planta des de Més. Més › {{ui:Taula de plantes}} edita els vostres propis registres: cultivars, mides subministrades, densitat, notes d'especificació. Cada registre pot portar el seu propi símbol i model 3D (OBJ, STL o GLB), i Més › {{ui:Representació de plantes}} dibuixa les plantes més simples a escales més petites. Vegeu [La llista de plantes](topic:plant-list), [Registres de plantes](topic:plant-records) i [Representació de plantes](topic:plant-graphics).

## 8. Quantitats i quadres

Més › {{ui:Quadres}}: els quadres de plantes i de paviments, i els vostres, es mantenen enllaçats als objectes; deseu-los com a CSV o XLSX, o poseu-los als fulls (vegeu [Quadres](topic:worksheets)). Més › {{ui:Quadre de plantes…}} envia els recomptes a TakeoffCraft. Les quantitats del paviment, dels murs i de les escales són a les seves propietats. El reg té la seva pròpia llista de materials: {{ui:Reg}} › **Comprova el sistema…**. Vegeu [Reg](topic:irrigation).

## 9. Dibuixos i fulls

Més › {{ui:Fulls de paisatge…}}: plànols de plantació, d'explanació i de reg, amb els detalls. {{ui:Cotes}} › {{ui:Línia de secció}} dibuixa seccions pel terreny, els murs, les composicions, les escales i les plantes. Vegeu [Fulls de paisatgisme](topic:landscape-sheets) i [Seccions i el joc de publicació](topic:landscape-sections).

## 10. Publicar

{{ui:Joc de publicació (.zip)}} al diàleg de fulls crea un PDF amb una llista de fulls i un DWG per full. Més › {{ui:Exporta IFC de paisatgisme}} dona a BimCraft les plantes i els elements construïts. Deseu el projecte: tot és al mateix fitxer.

## Canvia una cosa: el tram d'escales

El sentit de tenir-ho tot en un sol projecte és que un canvi es propaga. Proveu-ho amb un tram d'escales entre dues terrasses:

1. Dibuixeu la línia del tram com a línia característica (o com a línia del dibuix), i després Paisatgisme › Més › {{ui:Des d'una línia}} › {{ui:Escales}}. A les propietats de les escales, marqueu **Dona forma al terreny** i definiu els nivells inferior i superior com les dues terrasses.
2. Dibuixeu un bancal plantat al costat i sota del tram amb {{ui:Àrees}}, i paviment a les terrasses. El bancal es retalla sol al voltant de les escales i del paviment, i el quadre de plantes només compta el que està plantat.
3. Augmenteu el nivell superior del tram a les propietats. El terreny projectat, les cotes puntuals, les fletxes de pendent i el desmunt i el terraplè canvien alhora. Si el tram ja no arriba a la terrassa superior, el tauler de Problemes diu per quant.
4. Moveu la línia del tram. Les escales la segueixen en el mateix pas de desfer; el bancal es torna a retallar i a comptar, i els quadres mostren els nous números.
5. Premeu Ctrl+Z una vegada: la línia, les escales, el terreny i el bancal tornen enrere junts.

Vegeu [Modificadors del terreny i cotes en viu](topic:ground-modifiers), [Àrees plantades](topic:planted-areas) i [Quadres](topic:worksheets).

## Encara no implementat

Són coses que s'han demanat i que no hi són en aquesta versió:

- Murs que modelen el terreny (indiquen on hi arriben, i la seva part superior pot seguir-lo).
- Editar la vostra pròpia llista de plantes de la Biblioteca a l'aplicació (editeu la llista del projecte i deseu-la com a fitxer de plantes).
- Textures i colors dels vostres propis models GLB de plantes (s'hi llegeix la forma; s'usa el color de la planta).

Vegeu [L'espai de treball de Paisatgisme](topic:landscape) per a totes les eines.
