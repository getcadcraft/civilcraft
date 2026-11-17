---
title: Plantilles de corredor i plantilles de terreny
summary: Feu plantilles petites i reutilitzables (vorada i cuneta, vorera, mur, rasa), construïu un corredor a partir d'elles per PK amb l'esquerra i la dreta separades, dividiu un traçat en diversos corredors i estenem capes de materials sobre un terreny.
keywords: plantilla, plantilles, biblioteca de plantilles, creació de plantilles, secció tipus, muntatge, subconjunt, components, codis de punt, condició final, connexió amb el terreny, rasa, mur de contenció, vorada, cuneta, vorera, regions, rang de PK, diversos corredors, esquerra i dreta, plantilla de terreny, terra vegetal, paviment, base, estendre, materials, quantitats
from: ce70e58b
---

Una **plantilla** és una petita secció transversal que dibuixeu una vegada i reutilitzeu: punts amb desplaçaments, pendents i codis de punt, i components amb materials. Un corredor es pot construir a partir de plantilles per PK, amb cada costat amb les seves plantilles de paviment i la seva pròpia condició final, i les mateixes plantilles es poden estendre sobre un terreny.

:::warning
Les plantilles d'exemple són marcadors per començar. Els seus números no provenen de cap norma ni de cap organisme. Un enginyer ha de revisar cada plantilla, i cada valor que li doneu, abans d'utilitzar-la en un projecte.
:::

## Obre les plantilles

Obriu {{ui:Superfície}} › {{ui:Més}} › {{ui:Plantilles de corredor…}} (o escriviu {{cmd:TEMPLATES}}). La finestra té tres llistes:

- **En aquest projecte**: les plantilles que usen els corredors i les plantilles de terreny d'aquest projecte. Es desen al fitxer del projecte.
- **La meva biblioteca**: plantilles guardades en aquest navegador i oferides en cada projecte. Useu {{ui:Desa a La meva biblioteca}} sobre una plantilla del projecte per guardar-la.
- **Exemples**: dos carrils amb capes, vorada i cuneta, vorera, connexió amb el terreny, rasa, mur de contenció, terra vegetal sota el terreny i paviment sobre el terreny. Cada una està marcada com "Per a revisió per un enginyer".

{{ui:Usa en aquest projecte}} copia una plantilla de la biblioteca o dels exemples dins del projecte. {{ui:Exporta les plantilles d'aquest projecte}} les desa com un fitxer `.cctemplates.json`, i {{ui:Importa un fitxer}} en llegeix un al projecte i a La meva biblioteca. Useu el fitxer per compartir plantilles o portar-les a un altre ordinador.

## Fes una plantilla

{{ui:Plantilla nova}} (o {{ui:Edició}} en una plantilla del projecte) obre l'editor de plantilles. Dibuixeu el costat dret, cap enfora des del punt 0,0 de la plantilla; el costat esquerre usa la mateixa plantilla cap enfora cap a l'esquerra.

1. Doneu-li un nom i un tipus: **Paviment** (la plantilla següent s'hi adjunta al final), **Condició final** (es troba amb el terreny) o **Plantilla de terreny**.
2. Afegiu **valors**: números amb nom com una amplada `w` o un pendent `s`. Una casella de número en qualsevol punt de la plantilla accepta un número o el nom d'un valor; `-t` és el valor `t` canviat de signe. Un corredor pot donar a cada ús de la plantilla els seus propis valors, de manera que una mateixa plantilla de vorada serveixi per a cada alçada de vorada.
3. Afegiu **punts** en ordre. Cadascun es situa a partir d'un punt anterior (o del punt 0,0) segons la seva restricció:

| Restricció | Situa el punt |
|---|---|
| Desplaçament amb pendent | Un desplaçament cap enfora i un pendent (pujada per recorregut; −0.02 baixa un 2%) |
| Desplaçament i pujada | Un desplaçament i una pujada |
| Recta amunt o avall | Només una pujada |
| Pendent lateral fins al terreny | Des del seu punt fins al terreny, a la relació de desmunt on el terreny és per sobre i la relació de terraplè on és per sota |
| Fins al terreny | Un desplaçament, i després recte amunt o avall fins al terreny |
| Mur de contenció | Un mur del gruix que indiqueu: en desmunt la seva part superior toca el terreny a la cara de la carretera; en terraplè la carretera passa per sobre i la seva cara exterior baixa fins al terreny |

   Marqueu **Superior** per als punts per on passa la superfície acabada. L'últim punt superior és on comença la següent plantilla d'aquell costat. Un **Objectiu** permet a un corredor moure el punt: el seu desplaçament o la seva elevació vénen d'una línia.
4. Afegiu **components**: formes tancades a través de codis de punt (`0` és el punt 0,0), cadascuna amb un nom, un material i un tipus. Les seves àrees donen els volums.

El dibuix segueix cada canvi a escala real, i la llista que hi ha a sota diu què falla (un punt que toca el terreny abans del final, un valor que la plantilla no té, un component sense àrea). {{ui:Afegeix a aquest projecte}} o {{ui:Desa}} la conserva, com un sol pas de desfer.

## Construeix un corredor a partir de plantilles

Seleccioneu un traçat que tingui un corredor i, a les seves **Propietats**, activeu {{ui:Construeix a partir de plantilles per PK}}. El corredor comença amb els exemples de dos carrils i de connexió amb el terreny a tots dos costats.

- **Regions.** Cada regió comença en un PK i arriba fins a la regió següent. {{ui:Afegeix una regió}} n'afegeix una; canvieu el seu PK inicial a la seva casella.
- **Esquerra i dreta separades.** Cada costat de cada regió té la seva pròpia llista de **Paviment**, des de l'eix cap enfora, i la seva pròpia **Condició final**: connexió amb el terreny, una rasa, un mur o qualsevol plantilla que toqui el terreny. Sense condició final, el costat es connecta amb el terreny als talussos de desmunt i terraplè del corredor. {{ui:Copia d'esquerra a dreta}} copia un costat.
- **Valors i objectius.** Sota cada plantilla d'un costat, una casella per a cada valor (buida = el valor propi de la plantilla) i, per a un punt que pren un objectiu, la línia característica o la línia d'un altre corredor que el mou.
- **Des de** i **Fins a** limiten el corredor a una part del traçat.

Les seccions, les línies del plànol per a cada codi de punt, la superfície projectada, el replanteig i el moviment de terres se'n deriven. Les **Propietats** enumeren el volum de cada component per costat i regió (àrees mitjanes entre seccions extremes al llarg de l'eix). El peralt i els objectius de vora del corredor no s'utilitzen mentre el corredor es construeix a partir de plantilles.

## Diversos corredors en un mateix traçat

Sota **Corredors d'aquest traçat**, {{ui:Afegeix un corredor}} n'afegeix un sobre la resta del traçat: el primer corredor rep un PK final al mig (o conserva el seu), i el nou comença allà amb l'última regió de plantilles del primer. Cada corredor té el seu propi nom, rang de PK, plantilles i moviment de terres. Desactiveu-ne un amb la seva casella {{ui:Activades}}. Quan dos rangs se solapen, el corredor posterior s'explana per sobre de l'anterior.

## Plantilles de terreny

Una plantilla de terreny estén les capes d'una plantilla sobre un terreny des del seu punt 0,0: una capa per sota del punt 0,0 entra al terreny (terra vegetal a retirar), i una capa per sobre hi descansa (base i paviment d'un aparcament). Les amplades i els pendents no importen, només la profunditat de cada component per sobre o per sota del punt 0,0.

Obriu {{ui:Superfície}} › {{ui:Més}} › {{ui:Plantilles de terreny…}} (o escriviu {{cmd:TERRAINTEMPLATES}}); el bloc també és a les Propietats del projecte. {{ui:Afegeix una plantilla de terreny}} n'afegeix una amb l'exemple de terra vegetal. Per a cadascuna trieu:

- la **plantilla** (els seus valors es poden canviar per a aquesta),
- el **terreny**: el terreny actual o la superfície projectada,
- la **forma** que la retalla: tot el terreny, una parcel·la, una plataforma o una línia característica tancada. Diverses plantilles de terreny poden usar formes diferents sobre el mateix terreny.

Cada capa enumera el seu gruix, l'àrea en planta i el volum. El volum és l'àrea en planta multiplicada pel gruix, mesurat en vertical cap avall; l'àrea es mesura sobre una graella, i també s'indica l'àrea estesa (inclinada). Les formes es dibuixen al plànol a la capa C-TOPO-TMPL. Les plantilles de terreny no canvien la superfície projectada.

## Materials i quantitats

El bloc {{ui:Moviment de terres}} del projecte enumera els **Materials de les plantilles**: cada component del corredor i cada capa de plantilla de terreny amb el seu volum. {{ui:Envia a TakeoffCraft}} els escriu al fitxer de quantitats després del desmunt i el terraplè, un element cadascun, en iardes cúbiques (projectes en peus) o en metres cúbics.

## Fitxers

Les plantilles, les regions, els corredors addicionals i les plantilles de terreny es desen al fitxer del projecte. Un projecte que no n'usa cap es desa exactament com abans, i les versions anteriors de CivilCraft obren un projecte que els usa (les ignoren i construeixen el muntatge propi del corredor).
