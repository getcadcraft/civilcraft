---
title: Jellemzővonalak
summary: Rajzoljon csúcspontonként tagolt 3D-s vonalakat, készítsen belőlük lépcsős eltolásokat, és használja őket a terep töréselőjeként vagy a tervben lejtős tereplépcsőként.
keywords: ív, görbe, sugár, 3D-s ív, csavarvonal, íves szegély, esésfedés, magassági fedés, esésnyilak, jellemzővonal, esés, lejtés, magasság, lépcsős eltolás, eltolás, töréselő, szegély, árok, töltésperem, lejtős tereplépcső, lejtő a terephez, tereprendezés, 3D-s polivonal
from: d55b25fb
---

A jellemzővonal minden csúcspontjában magassággal rendelkező vonal: szegély, árok folyási vonala, töltésperem teteje, lejtős tereplépcső széle. A magasságokat számmal vagy eséssel adja meg, lépcsővel fel vagy le oldalra másolja, és eldönti, mit kezdjenek vele a felületek.

## Egy vonal rajzolása

1. Válassza a **Felület** › {{ui:Továbbiak}} › {{ui:Jellemzővonal}} lehetőséget, vagy nyomja meg az {{key:L}} billentyűt.
2. Kattintson a csúcspontjaira a terven. Egy meglévő felmérési pontra kattintva a csúcs annak helyét és magasságát veszi át; máshol a csúcs a meglévő terep ottani magasságát kapja.
3. Nyomja meg az {{key:Enter}} billentyűt egy nyitott vonal befejezéséhez, vagy kattintson újra az első csúcsra a lezáráshoz.

Az új vonal kijelölve jelenik meg, és a meglévő terep töréselőjeként indul, a terepen fekve.

## Ívek

Egy szakasz lehet olyan ív a terven, amelynek végei különböző magasságban vannak: szegélyív, íves árok, egy fordulós rámpa. Esése egyenletesen fut végig az íven, a hossza pedig a görbe mentén mérődik.

- **Rajzolás közben:** nyomja meg az {{key:C}} billentyűt (érintőképernyőn a terv fölötti sávban lévő {{ui:Ív}} gombot), hogy az ívek be legyenek kapcsolva. Egy csúcs után kattintson a görbe egy pontjára, majd arra a helyre, ahol az ív véget ér. Az egyenes szakaszokhoz nyomja meg újra az {{key:C}} billentyűt. A {{key:Backspace}} billentyű előbb a görbe pontját törli.
- **Utólag:** a **Tulajdonságok** panelen írjon be sugarat és a fordulás irányát a csúcs **Ív** mezőjébe, például `50 L` vagy `50 R` (balra vagy jobbra, ahogy a vonalon halad), majd nyomja meg az {{key:Enter}} billentyűt. Ürítse ki a mezőt, hogy a szakasz ismét egyenes legyen. A szakasz felénél kisebb sugár nem fogadható el.

A kijelölt vonal az egyes ívek sugarát az eséssel együtt mutatja a szakasznál. A **Hossz** a terven az ívek mentén mérődik; a **3D-hossz** a fel- és lejtéseket is beszámítja. A lépcsős eltolások megtartják az íveket: a kanyar külső ívje nő, a belső zsugorodik, és az az eltolás, amely egy ív középpontján túlra esne, nem fogadható el.

A felületek, a 3D-nézet, valamint a DXF és a DWG minden ívet rövid egyenes darabokként kezelnek, amelyek 0,01-en belül maradnak a görbétől. A LandXML megtartja ívként (lásd lent: **Ívek más fájlokban**).

## Magasságok és esések beállítása

A **Tulajdonságok** felsorolja a csúcsokat a vonal mentén mért távolságukkal, a **Magasságukkal** és a **Következőig tartó esésükkel** (százalékban). Írjon be bármelyiket, és nyomja meg az {{key:Enter}} billentyűt:

- A magasság csak azt a csúcsot mozgatja.
- Az esés a szakasz távoli végének magasságát állítja be; az utána következő csúcsok helyben maradnak, így a következő szakasz esése változik.

Szintén a **Tulajdonságok** alatt:

| Művelet | Mit csinál |
|---|---|
| **Mindet emeli vagy süllyeszti ennyivel** | Minden csúcshoz hozzáadja az Ön által megadott magasságot. |
| {{ui:Magasságok a terepről}} | Visszahelyezi minden csúcsot a meglévő terepre (a felületen kívül eső csúcsok megtartják magasságukat, és fel vannak sorolva). |
| {{ui:Egy esés az elsőtől az utolsóig}} | Megtartja az első és az utolsó magasságot, a köztük lévő csúcsokat pedig egyenletes esésbe rendezi. |

A kijelölt vonal a terven megmutatja a csúcsok magasságait, és a szakaszok mentén az eséseket. Húzzon egy csúcsot a {{ui:Kijelölés}} eszközzel a mozgatáshoz; a magassága megmarad.

## Lépcsős eltolások

A **Lépcsős eltolás** alatt adja meg a **Távolságot** (pozitív a vonal irányától jobbra, negatív balra), majd egy magasságot (ennyivel fel vagy le) vagy egy százalékos lejtést, és kattintson az {{ui:Az eltolt vonal elkészítése}} gombra. A másolat új jellemzővonal lesz: például egy szegély hátoldala 0,5 ft-tal oldalra és 0,5 ft-tal magasabbra, vagy egy árokszél 6 ft-tal kijjebb, 2%-os lejtéssel. Az a távolság, amely éles kanyarnál a másolatot önmagára hajtaná, nem fogadható el.

## Esések és magasságok a képernyőn

Nyomja meg az {{key:E}} billentyűt, vagy jelölje be a **Megjelenítés** alatt az **Esések és magasságok a jellemzővonalakon** lehetőséget, hogy minden jellemzővonal esését lássa a szakaszok mentén (egy kis, lefelé mutató nyíllal), és a magasságát a csúcsoknál. Ezek csak a képernyőn jelennek meg: semmi nem kerül a rajzba, és a PDF, a DXF és a DWG változatlan marad. A rövid szakaszok és a sűrű csúcsok címke nélkül maradnak, amíg rá nem nagyít. A kijelölt vonal mindig megmutatja a saját esését és magasságait.

## A hossz-szelvény nézetben

Az a jellemzővonal, amely egy nyomvonalat keresztez, megjelenik annak hossz-szelvény nézetében, a nevével és a magasságával a keresztezésnél; a mellette futó vonalak is megjeleníthetők. Lásd: [Függőleges szelvény tervezése](topic:profile).

## Mit csinálnak vele a felületek

Válassza ki a **Használat** értékét:

| Használat | Mi történik |
|---|---|
| Meglévő terep töréselője | A meglévő terep a vonalon a saját magasságán halad át, mint egy rajzolt töréselő. |
| Tervbe alakítva | Egy **zárt** vonal lejtős tereplépcsővé válik: a benne lévő tervezett felület a széléhez igazodik. Kapcsolja be a **Kitermelés a terepig** opciót, hogy a széléből a terepig bevágási és feltöltési lejtők (vízszintes a függőlegeshez 1) fussanak, ahogy egy tereplépcsőnél; minden lejtő az él saját magasságánál kezdődik. |
| Csak rajzolt | A terven marad, és DXF, DWG és PDF formátumban is kimegy (C-GRAD-FEAT réteg, 3D-s polivonalak), de a felületek figyelmen kívül hagyják. |

A térfogatok, a metszetek és a 3D-nézet tartalmazzák a tervbe alakított jellemzővonalakat, mint a tereplépcsőket. Minden módosítás egy lépés: a {{key:Mod+Z}} visszavonja.

## Vonalak megosztása a csapattal

A CadCraft Studio-ban a felhőfájljaiból megnyitott rajzban, csapatcsomagon, a projekt **Tulajdonságai** (ha nincs semmi kijelölve) között van egy **Csapat** szakasz a {{ui:Csapatvonalak…}} gombbal: itt azok a vonalak láthatók, amelyeket a csapat megosztott, mindegyik a saját revíziójával, anélkül, hogy előbb jellemzővonalat kellene kijelölni. Jelöljön ki egy vonalat a megosztáshoz, töltsön fel új revíziót, húzza le a csapat revízióit, vagy szüntesse meg a megosztást. Ezen a beállításon kívül a szakasz megmondja, mire van szükség.

## Ívek más fájlokban

| Fájl | Mi történik az ívekkel rendelkező jellemzővonallal |
|---|---|
| CivilCraft-projekt | Pontosan megmarad. |
| LandXML | Tervi jellemzőként íródik ki vonalakkal és ívekkel, a magasságaikkal együtt, és az ívekkel együtt olvasódik vissza. Más programból származó jellemzővonal **Csak rajzolt** típusként érkezik: válassza ki a **Használat** értékét, hogy felületbe kerüljön. |
| DWG és DXF | A 3D-s polivonal nem tud ívet tartalmazni, ezért a vonal az egyes ívek 0,01-en belüli rövid darabjaiként íródik ki. A CivilCraft a rajzban is jelzi, melyik darabok voltak ívek: ha a rajzot vonalrajzként nyitja meg, a {{ui:Jellemzővonalak}} gomb a vonalakat az íveikkel együtt jellemzővonalként hozza vissza. Más programok sima 3D-s polivonalként látják. |
