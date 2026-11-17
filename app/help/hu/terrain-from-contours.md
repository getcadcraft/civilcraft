---
title: Terep szintvonalakból
summary: Készítse el a terepfelületet szintvonalas térképből: válassza ki a vonalrétegeket, adja meg, honnan származik minden vonal magassága, ellenőrizzen keresztezéseket és duplikátumokat, majd építsen. A szintvonalak töréselemekként kerülnek be, a gerincek és völgyek lapos háromszögei javítva. Egy képről vagy PDF-ből készült térkép két ismert pontjával léptékezhető és elhelyezhető.
keywords: szintvonalak, szintvonal, terep szintvonalakból, felület szintvonalakból, topográfiai térkép, felmérési térkép, koordináták nélkül, töréselem, lapos háromszögek, gerinc, völgy, dombtető, keresztező szintvonalak, duplikált szintvonalak, szintköz, térkép léptékezése, két pont, térkép elhelyezése, DXF, DWG, shapefile
from: e6161653
---

Egy felmérő néha szintvonalas térképet küld: vonalakat magasságokkal, de pontok nélkül. A CivilCraft ezekből a vonalakból építi meg a meglévő terepet.

## A szintvonalak behozatala

Nyissa meg a térképet vonalrajzként: DXF vagy DWG rajz, shapefile vagy GeoJSON (**GIS** › {{ui:Importálás}}, vagy húzza a fájlt az alaprajzra). A vonalak **térképrétegekként** érkeznek be. A **Felület** › {{ui:Továbbiak}} alatt válassza a {{ui:Terep szintvonalakból}} lehetőséget.

## Adja meg, honnan jön minden magasság

Jelölje be a szintvonalakat tartalmazó rétegeket, majd válassza ki a **Magasság forrása** lehetőséget:

- {{ui:A vonalak saját magasságai}}: olyan vonal, amelynek minden csúcsa azonos magasságú (3D polivonal, vagy magassággal rendelkező polivonal). A 0-s vonal síkrajz, nincs szintje.
- A réteg egy **számmezője** (például ELEV), ha a térkép tartalmazott ilyet.
- {{ui:Egy kezdőérték és egy köz, a vonalak felsorolási sorrendjében}}: olyan vonalakhoz, amelyeknek egyáltalán nincs magasságuk. Az első felsorolt vonal az **Első vonal magassága** értéket kapja, a következő ennek és a **Szintköz** értékének összegét, és így tovább. Az alacsonytól a magas felé sorolja fel a vonalakat (vagy rendezze át őket a rétegben).

## Ellenőrzés, majd építés

Az {{ui:Ellenőrzés}} szavakban felsorolja, mi hibás, mielőtt bármi megváltozna:

- olyan vonal, amelynek **nincs magassága**, vagy két pontnál kevesebb van;
- **duplikált** vonal (ugyanaz az alak kétszer, akkor is, ha fordított irányban van rajzolva);
- két vonal, amely **keresztezi** egymást, eltérő vagy azonos magasságon (az önmagát keresztező vonal is), a helyével együtt;
- olyan magasság, amely **nincs a köz szerint** (elütés, például 105,5 egy 1 m-es térképen).

Jelölje be a {{ui:Más vonalat keresztező vonalak kihagyása}} lehetőséget, hogy elhagyja azt a vonalat, amely a legtöbb másikat keresztezi (majd a következőt, amíg nincs keresztezés): a kóbor vonal az, amely minden szintvonalat átvág, nem a szintvonalak. A **Vonalak egyszerűsítése ezen távolságon belül** ritkítja azokat a csúcsokat, amelyek ennél a távolságnál közelebb vannak az egyenes szakaszhoz.

A {{ui:A terep felépítése}} a vonalakat töréselemekként adja a meglévő talajhoz (egy visszavonási lépés), így a felület minden szintvonalon pontosan áthalad. Ha a {{ui:Lapos háromszögek javítása gerinceken, völgyeken és dombtetőkön}} be van jelölve és meg van adva a köz, a CivilCraft minden lapos háromszögbe (olyan háromszögbe, amelynek minden csúcsa ugyanazon a szintvonalon van) is tesz egy pontot, arra a magasságra, amelyre a mellette lévő lejtő folytatódik, de soha nem a szintvonaltól fél köznél távolabb. Enélkül a gerincek tetején, a völgyek fenekén és a dombtetőkön lapos táblák jelennek meg. Egy teszt dombon a valós felülettől való hiba egynegyedével csökkent; egy gerincen 40%-kal.

## Térkép koordináták nélkül

Egy képről vagy PDF-ből készült szintvonalas térképnél nyissa meg a **Rétegek léptékezése és elhelyezése két ismert ponttal** lehetőséget. Adjon meg a térképen két pontot, és azt, hol vannak valójában; a bejelölt rétegek léptékezve lesznek, elforgatva és odamozgatva, hogy illeszkedjenek (egy visszavonási lépés; a magasságok nem változnak). Ugyanez a két pont adja a léptéket (az üzenetben látható) és a forgatást.

A felület csak olyan pontos, mint a térkép: két szintvonal között sík, így a köztük lévő valódi terep nem ismert. Mielőtt támaszkodna rá, ellenőrizze az eredményt a magassági pontokkal.
