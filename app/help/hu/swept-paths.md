---
title: Járművek áthaladási pályái
summary: Hajtson végig egy járművet legfeljebb három pótkocsival egy vonal vagy egy nyomvonal mentén, előre vagy hátramenetben, és lássa a lesöpört területet, a kerékpályákat, a kormányzást, és azt, hol csuklik össze.
keywords: áthaladási pálya, fordulópálya, járműkövetés, fordulósablon, tervezési jármű, teherautó, busz, pótkocsi, félpótkocsi, tolatás, hátramenet, összecsuklás, csuklóhatár, kormányzárás, kanyarodási eltolódás, kerékpálya, rakodórámpa, fordulósugár
from: 8caafb8a
---

Az áthaladási pálya egy vonal mentén hajtja a járművet, és megmutatja azt a területet, amelyet a karosszéria átfed. Arra használja, hogy ellenőrizze: egy teherautó be tud-e fordulni, el tud-e érni egy rakodórámpát, vagy hátrafelé be tud-e állni egy pótkocsival úgy, hogy közben nem hagyja el a burkolatot.

## Jármű hajtása egy vonal mentén

1. Rajzolja meg azt a vonalat, amelyen a jármű halad, a haladás irányában: egy vonalas elemet (íveket is lehet: rajzolás közben nyomja meg a {{key:C}} billentyűt, lásd [Vonalas elemek](topic:feature-lines)), vagy egy nyomvonalat.
2. Jelölje ki, majd a **Tulajdonságok** alatt kattintson a {{ui:Áthaladási pálya…}} gombra.
3. A **Kiindulás** alatt válasszon egy járművet, majd állítsa be a méreteit a saját tervezési járművéből: szélesség, első túlnyúlás, tengelytávolság, hátsó túlnyúlás, nyomtáv és a **Kormányzárás**. Legfeljebb három pótkocsit adhat hozzá, mindegyiknek megadva, hol csatlakozik, a csatlakozástól a tengelyéig mért hosszát, a túlnyúlásait és a **Legnagyobb csuklószöget**.
4. Válassza ki a **Hajtás** módot: előre vagy hátramenet. Kattintson a {{ui:Végigvezetés}} gombra.

:::warning
A kiindulási járművek helyőrző értékek, nem szabvány. Állítsa be a méreteket a projektjében használt tervezési járműből.
:::

## Előre és hátramenet

| Hajtás | Mi követi a vonalat | Mit számít ki a CivilCraft |
|---|---|---|
| **Előre** | Az első tengely középpontja | Hová kerül a hátsó tengely és minden pótkocsi, a kormányszög és a csuklószög |
| **Hátramenet** | Az utolsó tengely középpontja (a pótkocsi hátulja) | Hová kerül minden előtte lévő egység, és hogy a vezetőfülke milyen kormányzást igényel, hogy a pótkocsit oda tegye |

A hátramenetes tolatás ellenőrzésére szolgál: mondja meg, hová kell a pótkocsinak kerülnie, és a CivilCraft megmondja, képes-e erre a vezetőfülke.

## Az eredmény értelmezése

Az áthaladási pálya narancssárgával van az alaprajzon: a körvonala, és szaggatottan a legkülső kerekek pályái. Jelölje ki (kattintson a belsejébe), hogy a **Tulajdonságok** alatt lássa:

- A **Megtett hossz**, a legnagyobb **Kormányzás** szöget és a **Csuklószöget** a határértékeikhez képest, valamint a **Lesöpört területet**.
- Minden problémát a vonal mentén, a távolságával együtt: a kormányzás a **Kormányzárás** fölé megy, vagy egy pótkocsi a csuklóhatáron túl fordul (összecsuklik).
- **A jármű a vonal mentén**: a csúszka mozgatásával a jármű bármely pontban megjelenik, a kormányzásával és csuklószögével ott.

Ha módosítja a vonalat, az áthaladási pálya követi. Az {{ui:A jármű szerkesztése…}} a méreteket változtatja; a **Hajtás** vált előre és hátramenet között. Minden módosítás egy lépés: a {{key:Mod+Z}} visszavonja. A {{key:Delete}} törli a kijelölt áthaladási pályát (a vonal marad).

A körvonal és a kerékpályák a PDF-be, DXF-be és DWG-be kerülnek, a C-ROAD-SWPT rétegen.

## Hogyan számítjuk ki

Minden egység a saját hátsó tengelyének vonala körül fordul, és az előtte lévő pont (az első tengely vagy a csatlakozás) húzza. Ez az alacsony sebességű, csúszásmentes modell, amelyet az áthaladási pálya-ellenőrzések használnak. A lesöpört terület minden pozíció karosszéria-körvonalának egyesítése. Nem modellezi a sebességet, a gumik csúszását, a kormány fordulási idejét, a kormányzott pótkocsikat vagy a karosszéria alatti szabad magasságot.
