---
title: Volums de moviment de terres
summary: Llegir els desmunts, terraplens i volums nets entre el terreny existent i la superfície projectada, per plataforma i corredor i en total, i entendre el mètode de graella que hi ha darrere.
keywords: volums, moviment de terres, desmunt, terraplè, net, desmunt i terraplè, amidaments, mètode de graella, comparació de superfícies, superfície de volum, iardes cúbiques, metres cúbics
from: 299d7bc7
---

Tan aviat com una plataforma o un corredor s'explana sense problemes, CivilCraft compara la superfície projectada amb el terreny existent i informa del desmunt i del terraplè. Els nombres s'actualitzen amb cada canvi.

## On llegir-los

- **Moviment de terres** al tauler de la dreta sense res seleccionat (la vista **Projecte**), quan hi ha almenys una plataforma o un corredor.
- **Moviment de terres** al tauler de la dreta quan hi ha una plataforma seleccionada (els mateixos totals per a tot el projecte).
- La línia sota la configuració d'un corredor, amb el seu propi desmunt i terraplè.

El bloc **Moviment de terres** mostra:

- **Desmunt**, **Terraplè** i **Net** (amb "terraplè" o "desmunt" darrere, el que sigui més gran)
- una línia per element quan n'hi ha més d'un, per exemple "Plataforma 1: desmunt 120.4 cu yd, terraplè 310.2 cu yd"
- la línia del mètode: "Mètode de graella: terreny existent i superfície explanada mostrejats cada 0.5 ft dins de les línies de tall (92,891 cel·les). No s'aplica cap esponjament ni contracció."

Els volums són en iardes cúbiques en un projecte en peus, i en metres cúbics en un projecte en metres.

## Envieu-los a TakeoffCraft

Per pressupostar el moviment de terres, trieu {{ui:Envia a TakeoffCraft}} al peu del bloc **Moviment de terres**. CivilCraft desa un fitxer de quantitats (`<site>.quantities.json`) amb dues quantitats: desmunt i terraplè, en iardes cúbiques (projecte en peus) o metres cúbics (projecte en metres), els mateixos nombres que el bloc, fins a la centèsima. Obriu-lo a TakeoffCraft amb **Obre l'amidament**, o arrossegueu-lo allà: esdevenen dues partides que podeu valorar ([Desmunt i terraplè des de CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Torneu a enviar-lo després d'un canvi i obriu el fitxer nou: les mateixes partides prenen els nous nombres.

Només s'envien els totals, de manera que res no es compta dues vegades; la nota del fitxer llista el desmunt i el terraplè propis de cada plataforma i de cada corredor.

## Com es calculen

CivilCraft fa servir el **mètode de graella**:

1. S'estén una graella de cel·les quadrades sobre l'àrea dins de cada línia de tall.
2. Al centre de cada cel·la es mostregen les dues superfícies.
3. Cada cel·la compta com un prisma: la diferència de cota per l'àrea de la cel·la. On la superfície projectada és més baixa, és desmunt; on és més alta, és terraplè.
4. Les cel·les se sumen.

La mida de la cel·la es tria per a vosaltres perquè el rectangle al voltant de les àrees explanades contingui unes 250,000 cel·les, arrodonida a un valor net (1, 2 o 5 vegades una potència de deu). Encara no podeu fixar-la vosaltres mateixos. La línia del mètode us diu la mida i el nombre de cel·les. Les cel·les més petites són més precises a les vores; sobre cel·les senceres entre plans nivellats el resultat és exacte.

## Coses a saber

- Només es compta l'àrea dins de les línies de tall. El terreny fora d'elles no canvia.
- Una plataforma o un corredor amb un problema no s'explana i no suma res. Si el bloc diu "Encara no hi ha volums: una plataforma ha d'explanar-se sense problemes.", mireu la caixa vermella que hi ha a sobre.
- Quan els elements se solapen, el posterior ha substituït l'anterior dins de la seva línia de tall, i el solapament es compta una vegada.
- No s'aplica cap factor d'esponjament ni de contracció. Multipliqueu els resultats vosaltres mateixos si necessiteu volums en banc, solts o compactats.
- El decapatge de la capa vegetal, les profunditats de paviment i de subrasant, i els volums de prismes de TIN a TIN encara no estan disponibles.

## Comprovar un resultat

- Activeu {{ui:Projectat (explanat)}} a **Visualització** i mireu les corbes de nivell dins de les línies de tall.
- Moveu el punter sobre l'àrea explanada: la barra d'estat mostra **Terreny** i **Explanat**. La diferència és la profunditat del desmunt o del terraplè en aquell punt.
- Per a un corredor, la lectura de la vista de perfil mostra el desmunt o el terraplè a l'eix central a cada estació.
