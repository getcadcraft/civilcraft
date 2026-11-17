---
title: Felmérési pontok kijelölése, másolása és beillesztése
summary: Jelöljön ki felmérési pontokat kattintással, Shift-tel és kerettel, vagy egyszerre mindet; másolja, vágja, illessze be, illessze helyben, kettőzze és törölje őket, mindig új, soha nem ütköző pontszámokkal; illessze be a pontsorokat táblázatból és táblázatba.
keywords: másolás, beillesztés, kivágás, kettőzés, pontok törlése, pontok kijelölése, összes kijelölése, keretes kijelölés, ablak, vágólap, táblázat, csv, újraszámozás, pontszámok, beillesztés helyben, klónozás, kitűzés
from: 78a6aea7
---

Felmérési pontok másolhatók és illeszthetők be egy projekten belül, két böngészőlapon lévő projektek között, valamint táblázatból és táblázatba. Minden változtatás egy visszavonási lépés, a felület pedig azonnal újraépül az új pontokból.

## Pontok kijelölése

A {{ui:Kijelölés}} eszközzel ({{key:V}}):

- **Kattintás** egy pontra kijelöli azt (és csak azt). A pont számai a **Tulajdonságok** alatt látszanak.
- {{key:Shift}} és **kattintás** hozzáad egy pontot a kijelöléshez, vagy kivesz onnan.
- {{key:Shift}} és **húzás** keretet rajzol: a benne lévő pontok bekerülnek a kijelölésbe. Ha a pontok köré húz, lasszó lesz belőle; lásd [Felmérési pontok lasszós kijelölése](topic:lasso-selection). Shift nélküli húzás mindig eltolja a nézetet.
- {{key:Mod+A}} (vagy {{ui:Továbbiak}} › {{ui:Összes pont kijelölése}}) minden pontot kijelöl.
- {{key:Esc}} (vagy {{ui:Továbbiak}} › {{ui:Kijelölés megszüntetése}}) törli a kijelölést.

A kijelölt pontok körbe vannak véve. Ha egynél több pont van kijelölve, a **Tulajdonságok** megmutatja a darabszámukat, a számaikat, a magassági tartományukat és a csoportjaikat.

## Másolás, kivágás és törlés

- {{ui:Másolás}} vagy {{key:Mod+C}} másolja a kijelölt pontokat. A CivilCraft megőrzi a másolatot, és pontsorokként a rendszer vágólapjára is teszi, így közvetlenül beilleszthető táblázatba vagy szövegfájlba.
- {{ui:Továbbiak}} › {{ui:Kivágás}} vagy {{key:Mod+X}} egy lépésben másolja és törli őket.
- {{ui:Továbbiak}} › {{ui:Törlés}} vagy {{key:Delete}} törli őket. A {{key:Mod+Z}} visszahozza őket.

A sorok: pont, északi, keleti, magasság, leírás (P,N,E,Z,D), vesszővel elválasztva, három tizedesjeggyel. Ha a keleti koordináta kerüljön az északi elé, állítsa be a **Pontsorok** beállítást a [CivilCraft beállításai](topic:settings) részben. A táblázatkezelő számára képletnek tűnő leírás (=, +, - vagy @ jellel kezdődő) elé aposztrófot kap, így szövegként marad meg.

## Beillesztés

1. Nyomja meg a {{key:Mod+V}} billentyűt, vagy kattintson a {{ui:Beillesztés}} gombra. A pontok kis keresztekként követik a mutatót, egy pontozott vonallal a kiindulási helyükig.
2. Kattintson arra a helyre, ahová kerülniük kell. A másolt pontok középpontja a kattintásra kerül.
3. Vagy nyomja meg az {{key:Enter}} billentyűt, hogy saját koordinátáikra kerüljenek, vagy az {{key:Esc}} billentyűt a megszakításhoz.

A {{ui:Továbbiak}} › {{ui:Beillesztés helyben}} vagy a {{key:Mod+Shift+V}} azonnal a pontok saját koordinátáira illeszti be őket. A beillesztett pontok utána ki vannak jelölve, így újra másolhatja, mozgathatja vagy törölheti őket.

:::note
Az eszköztár {{ui:Beillesztés}} gombja a rendszer vágólapját olvassa. Először a böngésző megkérdezheti, hogy a CivilCraft láthatja-e a vágólapot. Ha megtagadja, az eszköztár gombja csak a CivilCraft saját másolatát illeszti be; a {{key:Mod+V}} továbbra is kérdezés nélkül illeszt be sorokat egy táblázatból.
:::

## A pontszámok sosem ütköznek

Két pont soha nem osztozik egy számon. Beillesztéskor:

- Egy beillesztett pont megtartja a számát, ha a projektben nincs más pont azzal a számmal. Így a **Kivágás** után a pontok saját számaikkal kerülnek vissza, a másik projektből másolt pontok pedig megtartják a számukat, ha az szabad.
- Egy beillesztett pont, amelynek száma foglalt, új egész számot kap: a használatban lévő legnagyobb számnál eggyel többet, felfelé számolva.
- Az állapotsor leírja, mi történt, például „1 megtartotta a számát; 9 új számot kapott: 10–18 lett 277–285”.

A [CivilCraft beállításai](topic:settings) részben kiválaszthatja a **Mindig új számok** lehetőséget, és megadhatja, honnan induljanak az új számok, például 5000-től a tervezési pontoknál.

:::warning
A pontcsoportok, amelyek a felületet **töréselemként** építik fel, pontjaikat számsorrendben kötik össze. A beillesztett másolatok a töréselem-pontokból (például FL-mérésekből) új, nagyobb számot kapnak, és az adott töréselem végéhez csatlakoznak, esetleg hosszú ugrással. Ilyen pontok beillesztése után ellenőrizze a tervet, vagy állítsa a csoportjukat {{ui:Pontok}} értékre.
:::

## Kettőzés

A {{ui:Továbbiak}} › {{ui:Kettőzés}} vagy a {{key:Mod+D}} a kijelölt pontokról a mutatót követő másolatot készít: kattintson arra a helyre, ahová kerülnie kell. A másolatok mindig új számot kapnak, a CivilCraft vágólapja pedig változatlan marad.

## Táblázatból vagy szövegfájlból

Jelöljön ki pontsorokat egy táblázatban (pont, északi, keleti, magasság, leírás), és másolja őket. A CivilCraftban nyomja meg a {{key:Mod+V}} billentyűt, és kattintson arra a helyre, ahová kerülniük kell, vagy nyomja meg a {{key:Mod+Shift+V}} billentyűt, hogy saját koordinátáikra kerüljenek, ami valódi felmérési adatnál általában a kívánt eredmény.

A sorokat pontosan úgy olvassa a program, mint egy [pontfájlt](topic:point-file-formats): vesszők, tabulátorok vagy szóközök, és fejléc sor, ha van. Fejléc nélkül az oszlopsorrendet a [CivilCraft beállításai](topic:settings) **Pontsorok** beállítása adja meg.

Ha mindkettő jelen van, a CivilCraft az újabb alapján dönt: a rendszer vágólapján lévő sorok, amelyek eltérnek a CivilCraft utolsó másolatától, később lettek másolva, ezért azokat illeszti be. A pontot nem tartalmazó szöveget figyelmen kívül hagyja, és helyette a CivilCraft saját másolatát illeszti be.

## Projektek és lapok között

A másolat ebben a böngészőben marad meg, így a CivilCraft második lapja beilleszti akkor is, ha az első lap már bezárult. A méteres projektben másolt pontok, amelyeket láb mértékegységű projektbe illesztenek, megtartják a számaikat: semmi sem konvertálódik, és az állapotsor ezt jelzi.

## Mi nem másolható

Egyelőre csak felmérési pontok másolhatók. A nyomvonalak, tereplépcsők, csőhálózatok, töréselemek és határok még nem másolhatók vagy illeszthetők be. A beillesztés nem mozgathat meglévő pontokat: használja a {{ui:Kivágás}} parancsot és a beillesztést, vagy mozgasson egyszerre egy pontot ([Felmérési pont szerkesztése](topic:edit-points)).
