---
title: Configuració de CivilCraft
summary: Trieu l'ordre de columnes per a les files de punts copiades i enganxades i per endevinar les columnes d'un fitxer, com es numeren els punts enganxats, què mostren les etiquetes de punts, l'indicador de cantonada, l'exageració vertical 3D, com es mostren la latitud i la longitud, i si les capes de mapa es carreguen des d'internet.
keywords: configuració, preferències, pnezd, penzd, ordre de columnes, files de punts, renumerar, números de punts, número inicial, etiquetes de punts, etiquetes, descripció, cota, cub de vista, icona d'eixos, indicador de cantonada, brúixola, exageració vertical, 3d, latitud, longitud, dms, graus decimals, capes de mapa, internet, privacitat
from: 64b9cb92
---

Obriu {{ui:Configuració}} amb la roda dentada de la barra de l'aplicació o amb {{key:Mod+,}}. La primera pestanya, {{ui:CivilCraft}}, conté la configuració pròpia d'aquesta aplicació; {{ui:General}} conté la que comparteixen totes les aplicacions CadCraft (tema, barra d'eines, plafons). La configuració de CivilCraft només existeix a l'aplicació: la canvieu aquí, i aquest navegador la recorda. {{ui:Restableix la configuració de CivilCraft}} torna cada opció al seu valor inicial.

## Files de punts

**P, N, E, Z, D** (l'inicial) o **P, E, N, Z, D**: punt, nord, est, cota, descripció, o est abans que nord. Es fa servir en tres llocs:

- **Copia**: les files que CivilCraft posa al porta-retalls del sistema per a un full de càlcul.
- **Enganxa**: files enganxades d'un full de càlcul o d'un fitxer de text que no tenen fila de capçalera.
- **Importa**: la suposició del diàleg **Importa punts** quan un fitxer no té fila de capçalera (un fitxer amb quatre columnes es llegeix com a PENZ, amb tres com a ENZ). Vegeu [Formats de fitxers de punts](topic:point-file-formats).

Una fila de capçalera que anomena les columnes sempre preval, i també ho fa una opció de la llista **Columnes** del diàleg d'importació.

## Números per als punts enganxats

- **Manté els números lliures** (l'inicial): un punt enganxat conserva el seu número quan cap altre punt no el fa servir; només els punts en conflicte reben números nous.
- **Sempre números nous**: cada punt enganxat rep un número nou, encara que el seu estigui lliure.

**Els números nous comencen a**: deixeu-ho buit perquè compti a partir d'un més que el número més alt en ús. Escriviu un número, per exemple 5000, per donar als punts nous números a partir d'aquest; els números ja en ús s'ometen. Dos punts mai no comparteixen número en cap dels dos casos. Vegeu [Selecciona, copia i enganxa punts topogràfics](topic:copy-paste-points#point-numbers-never-clash).

## Etiquetes de punts

Què mostra una etiqueta de punt quan {{ui:Etiquetes de punts}} és activa a **Visualització**: **Número**, **Número i cota** o **Número, cota i descripció** (l'inicial). Les exportacions DXF, DWG i PDF mostren les mateixes etiquetes que la pantalla.

## Indicador de cantonada

Què es posa a la cantonada del plànol i de la vista 3D: **Cub de vista** (l'inicial), **Icona d'eixos** o **Cap**.

- **Cub de vista** (dalt a la dreta). Al plànol mostra la part superior, amb l'anell de la brúixola: la N és el nord de la graella (cap amunt del plànol). Feu clic a qualsevol altra cara, aresta o cantonada del cub, o arrossegueu-lo, i s'obre la [vista 3D](topic:site-3d) mirant des d'allí. {{ui:Inici}} al cub del plànol encaixa el plànol.
- A la vista 3D el cub gira amb la vista: feu clic a una cara, aresta o cantonada per mirar des d'allí, arrossegueu el cub per orbitar, arrossegueu l'anell de la brúixola per girar al voltant de la vertical, feu clic a una lletra per mirar des d'aquella cara, i useu {{ui:Inici}} per a la vista isomètrica de tot el lloc. Mirant de dret una cara, les fletxes petites passen a la cara següent i les fletxes corbes giren la vista un quart de volta.
- **Icona d'eixos** (baix a l'esquerra): un petit marcador X (est) i Y (nord) al plànol, X, Y i Z (amunt) en 3D.

## Exageració vertical 3D

Quant estira la vista 3D les cotes: **1×**, **2×** (l'inicial), **3×**, **5×** o **10×**. La llista de la barra de la vista 3D és la mateixa opció, de manera que canviar-ne una canvia totes dues. Els volums, els perfils i les exportacions 3D es mantenen a escala real.

## Latitud i longitud

Com mostra la barra d'estat la latitud i la longitud del punter quan el projecte té un sistema de coordenades: **graus, minuts i segons** (l'inicial, per exemple `30°18′00.00″ N`) o **graus decimals** (`30.300000° N`). Vegeu [Defineix el sistema de coordenades del projecte](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Capes de mapa des d'internet

**Desactivat** (l'inicial) o **Activat**. Quan està activat, CivilCraft demana als servidors de mapes que afegiu imatges de la zona a la pantalla. El vostre dibuix es queda en aquest ordinador; el servidor veu la zona i la vostra adreça d'internet. Mentre està desactivat, no es demana res a cap servidor de mapes, ni tan sols quan un projecte que obriu n'anomena un; una imatge georeferenciada d'un fitxer funciona de totes dues maneres. Vegeu [Mostra capes de mapa sota el plànol](topic:map-layers).

## Assistents

**Deixa que els assistents d'IA i els scripts usin CivilCraft** (desactivat a l'inici) permet que un assistent del vostre ordinador accedeixi al lloc obert a través de CadCraft Studio: **Llegeix** descriu el lloc i proporciona punts, cotes de la superfície, punts quilomètrics, perfils, volums i parcel·les; **Edita** li permet seleccionar i afegir punts topogràfics; **Desa** i **Exporta** li permeten desar el projecte i escriure LandXML o DWG. **Carpetes que pot usar** (a Studio) són on pot desar i exportar. **Activitat** llista les seves crides. Vegeu [Deixeu que un assistent d'IA treballi amb el vostre lloc](topic:assistants).
