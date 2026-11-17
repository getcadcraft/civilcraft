---
title: Unitats, estacions i formats de nombres
summary: Projectes en peus i en metres, com s'escriuen i s'introdueixen les estacions, els pendents, els talussos laterals, els rumbs, les àrees, els volums i els diàmetres de canonada, i què provoca canviar les unitats.
keywords: escriure una longitud, aritmètica, calculadora, suma, fracció, peus i polzades, 4+7/16, unitats, peus, peus d'agrimensura (US), metres, mètric, imperial, format d'estació, numeració d'estacions, pendent, percentatge, talús lateral, h:v, rumb, iardes cúbiques, diàmetre
from: 0b9b5b6b
---

## Unitats del projecte

Un projecte és en **peus US** o en **metres** (**Unitats** al tauler esquerre). Cada coordenada, cota, longitud i estació del projecte és en aquesta unitat.

:::warning
Canviar **Unitats** canvia les etiquetes, el format d'estació, els valors per defecte i com s'escriuen els fitxers. **No** converteix cap nombre. Un lloc mesurat en peus i canviat a metres conserva els mateixos números, ara llegits com a metres. La barra d'estat diu "Les unitats ara són metres. Les coordenades no s'han convertit." Definiu les unitats perquè coincideixin amb les dades abans de dissenyar.
:::

Això és el que depèn de les unitats:

| | Peus US | Metres |
|---|---|---|
| Format d'estació | `12+34.56` (estacions de 100 ft) | `1+234.567` (estacions de 1000 m) |
| Intervals de corbes de nivell oferts | de 0.25 a 20 ft | de 0.1 a 10 m |
| Àrea | sq ft | sq m |
| Volum | cu yd | cu m |
| Diàmetre de canonada i d'estructura | polzades | mil·límetres |
| Radi de corba per defecte | 100 ft | 30 m |
| Marques d'estacions al plànol | cada 50 ft, etiquetes cada 100 ft | cada 20 m, etiquetes cada 100 m |
| Escales de traçat | de 1" = 5' a 1" = 1000' | de 1:50 a 1:10000 |
| Unitat lineal de LandXML | USSurveyFoot | meter |

Un projecte nou comença en peus, o en metres quan la unitat de longitud marcada amb estrella a {{ui:Configuració}} › {{ui:General}} › {{ui:Unitats}} és una unitat mètrica. La llista **Unitats** mostra les unitats activades allà, i sempre les del projecte. Amb una unitat d'àrea o de volum marcada amb estrella allà (acres, hectàrees, acres-peus…), les àrees i els volums s'informen en aquesta unitat en lloc de la columna de dalt. Vegeu [Unitats, valors escrits i les llistes d'unitats](common:unit-lists).

Quan obriu un LandXML, el projecte pren les unitats del fitxer. Un fitxer en peus internacionals s'obre com un projecte en peus; els nombres no es canvien.

## Escriure longituds i sumes

Qualsevol caixa que accepti una longitud o una cota llegeix més que un simple nombre: premeu {{key:Enter}} i la caixa mostra el resultat en les unitats del projecte.

| Escriviu | En un projecte en peus | En un projecte en metres |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | les mateixes longituds en metres |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | en peus | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, i les altres en peus d'agrimensura (US) | les mateixes longituds en metres |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | la suma, en peus | la suma, en metres |

Qualsevol marca de longitud de la taula d'unitats compartida funciona, amb la seva mida exacta: els peus d'un projecte són peus d'agrimensura (US), de manera que `10 US ft` és 10 i `3 ch` (la cadena de peus internacionals) és 197.9996. Useu `+ - * /` i parèntesis, i `abs`, `round`, `ceil` i `floor`. Un guió escrit dins d'una longitud forma part d'ella (`24'-6"`, `6-1/2`); amb espais al voltant, resta (`24' - 6"` = 23.5 ft). Un nombre sol multiplica o divideix una longitud, i és una longitud en les unitats del projecte quan se li suma una. Si CivilCraft no pot llegir el que heu escrit, la caixa es marca i la barra d'estat indica on.

Les estacions no són sumes: `10+00` en una caixa d'estació és l'estació 10+00. Els pendents en percentatge, els números de punt i les descripcions es llegeixen tal com són.

## Estacions

Una estació és una distància al llarg d'un traçat, escrita amb un signe més:

- Peus: la part abans del més són centenars de peus. `12+34.56` són 1,234.56 ft.
- Metres: la part abans del més són milers de metres. `1+234.567` són 1,234.567 m.
- Les estacions negatives mantenen el signe davant: `-0+50.00`.

On escriviu una estació (**Estació inicial**, l'**Estació** d'un PVI), la podeu escriure amb el més (`12+34.56`) o com a número simple (`1234.56`). Els espais s'ignoren.

## Pendents i talussos

- **Pendents** (perfils, canonades, talussos de carril i d'arcen) són en percentatge: `+1.25%` puja cap amunt de l'estació, `-0.50%` baixa.
- **Talussos laterals** (desmunt i terraplè de la plataforma, desmunt i terraplè del corredor) són horitzontal a vertical: `3` vol dir 3 : 1, tres d'horitzontal per una de vertical, amunt o avall.
- **K** per a una corba vertical és la seva longitud dividida pel canvi de pendent en percentatge.

## Rumbs i angles

Els rumbs són rumbs de quadrant en graus, minuts i segons: `N 63°12'05" E`. Les deflexions de corba (Δ) fan servir els mateixos graus, minuts i segons, amb "esquerra" o "dreta".

## Desplaçaments

Els desplaçaments des d'un traçat són distàncies perpendiculars a ell, marcades **L** (esquerra) o **R** (dreta) mirant cap amunt de l'estació.

## Visualització de nombres

- Les coordenades i les cotes mostren 2 decimals als taulers i a la barra d'estat (3 per a un punt topogràfic seleccionat).
- Les àrees i els volums s'agrupen per milers: `128,250 sq ft`, `454.9 cu yd`.
- Les coordenades no s'agrupen mai, de manera que es poden copiar tal com són.

## Coordenades

CivilCraft treballa en un pla pla: est cap a la dreta, nord cap amunt. El treball de disseny sempre es fa en coordenades projectades (plans de coordenades estatals, UTM o una graella local). Podeu dir a CivilCraft quin sistema de coordenades fan servir, i si són coordenades de graella, del terreny o locals; llavors mostra la latitud i la longitud, i col·loca els fitxers SIG i les capes de mapa, però mai no canvia les unitats ni mou les coordenades per si sol. Vegeu [Definir el sistema de coordenades del projecte](topic:coordinate-systems) i [Coordenades del terreny i coordenades locals](topic:ground-and-local-coordinates). Els valors grans de plans de coordenades estatals (milions de peus) són correctes; CivilCraft treballa internament relatiu al lloc per conservar la precisió.
