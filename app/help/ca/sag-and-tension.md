---
title: Flexa i tensió
summary: Els vostres casos de càrrega (temperatura, vent, glaçada) i els límits de tensió, com CivilCraft calcula la tensió de cada secció, i les taules de tesat.
keywords: flexa, tensió, cas de càrrega, temperatura, vent, glaçada, glaçada asimètrica, vany de referència, vany equivalent, canvi d'estat, catenària, taula de tesat, resistència a la ruptura, tensió quotidiana
from: f8876c35
---

## Casos de càrrega i límits

{{ui:Més}} › {{ui:Casos de càrrega i límits…}} edita les regles que segueix cada línia del projecte.

- **Casos de càrrega**: una temperatura, una pressió del vent sobre el conductor (Pa), i glaçada radial (mm, amb la seva densitat). El primer cas és la referència.
- **Límits de tensió**: una part de la resistència a la ruptura del conductor, sobre la tensió horitzontal o sobre la tensió més gran en un suport, en un cas de càrrega. O indiqueu la tensió horitzontal directament.
- **Distàncies de seguretat**: la distància lliure que el conductor manté sobre el terreny, una carretera, un edifici i altres. Afegiu-ne, reanomeneu-ne i suprimiu-ne: són vostres. Sota elles, trieu les regles per a **Plantes de paisatgisme sota una línia**, **Murs de paisatgisme sota una línia** i **Encreuaments subterranis**.
- **Casos que fan servir les comprovacions**: quin cas dona la flexa més gran (calor), el balanceig de l'aïllador (vent), la glaçada, i la glaçada en un costat d'un suport.
- **Factors**: factor de separació de fases k, balanceig màxim de l'aïllador, un factor per a les càrregues als suports i a les ferreteries, els angles de gir que fan els suports d'angle i de final de línia, la coberta mínima dels cables soterrats, i la caiguda de tensió més gran.

## Paquets: regles i una biblioteca per a un país

Cap norma de cap país no està incorporada a CivilCraft. Un **paquet** conserva un conjunt de regles i una biblioteca en un sol fitxer (`.cclinepack.json`), per a un país, un operador de xarxa o una empresa:

- **Desa com a paquet…** a {{ui:Casos de càrrega i límits…}} escriu el conjunt de regles mostrat i la vostra biblioteca (o, si la biblioteca és buida, els elements que fa servir aquest projecte). Escriviu primer el **País o regió**.
- **Obre un conjunt de regles o un paquet…** llegeix un paquet, un fitxer de regles o un fitxer de biblioteca. Les regles d'un paquet es mostren al diàleg (feu clic a **Aplica** per fer-les servir) i els seus elements van a la vostra biblioteca.
- Els paquets que comparteixen altres apareixen a la pàgina de complements sota **Paquets de línies elèctriques**. Dos paquets d'exemple mostren el format; no són les regles de cap país.

Cada paquet es revisa en obrir-lo, com qualsevol fitxer. Comproveu cada valor amb la norma aplicable abans que es construeixi res.

Hi ha dos conjunts de regles d'exemple per començar: **Exemple: clima fred** i **Exemple: clima suau**. Els seus valors no provenen de cap norma: definiu els que dóna la vostra norma. {{ui:Desa les regles}} i {{ui:Obre les regles…}} comparteixen un conjunt de regles com a fitxer.

## Com es calcula la tensió

Per a cada secció entre amarratges:

1. El **vany de referència** és √(ΣL³ ÷ ΣL) dels seus vanys.
2. Cada límit es converteix en una tensió horitzontal en el cas de referència mitjançant l'**equació de canvi d'estat** sobre el vany de referència: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. El més restrictiu fixa la tensió.
3. La tensió de cada cas de càrrega se'n deriva, i la forma de cada vany és la **catenària** exacta que passa pels seus dos punts d'amarratge (inclosos els vanys en pendent): la flexa des de la corda, la longitud i la tensió a cada extrem.

La càrrega per metre en un cas: pes més glaçada (àrea de glaçada × densitat × g) en vertical; pressió del vent × el diàmetre glaçat en horitzontal.

## Taules de tesat

{{ui:Més}} › {{ui:Taules de tesat…}} llista, per a cada secció, la tensió horitzontal i la flexa de cada vany a cada temperatura del conjunt de regles (de −5 °C a 40 °C de 5 °C en 5 °C com a inici), en aire en calma. Deseu-les, i la taula de suports, com a CSV.

No es compten: la fluència del conductor al llarg dels anys ni l'allargament d'un conductor nou. Afegiu-los mitjançant les temperatures a les quals feu el tesat.
