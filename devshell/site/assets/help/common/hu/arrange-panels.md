---
title: A panelek elrendezése és második monitor használata
summary: Dokkolja az oldalsó paneleket balra, jobbra vagy alulra, rakja őket egymás alá, csoportosítsa lapokként, rögzítse vagy rejtse el őket, lebegtesse a rajz fölött, tegye sűrűbbé az elrendezést, válassza ki, hány sort használjon az eszköztár, vagy helyezze őket saját ablakba egy másik képernyőn.
keywords: panelek, dokkolás, lebegtetés, panel mozgatása, húzás, elrendezés, lapok, lapcsoport, egymás alá, rögzítés, automatikus elrejtés, panel elrejtése, panel bezárása, kompakt, elrendezés sűrűsége, sűrű, eszköztársorok, tördelés, 1 sor, 2 sor, eszköztár sorai, második monitor, két képernyő, két monitor, több monitor, ablak, felugró ablak, elrendezés visszaállítása
from: 32a8dae2
---

A rajz melletti panelek mozgathatók. Helyezze őket oda, ahol a legjobban megfelelnek, vagy adjon nekik saját ablakot egy második monitoron, hogy a rajz az első monitor teljes területét megkapja.

:::note
Minden panelnek van címsora: egy keskeny sáv a panel nevével, egy {{ui:⋯}} menüvel, egy rögzítőgombbal és egy bezárógombbal a panel tetején. A 0.7 előtti verziókban csak a név és a {{ui:⋯}} menü van meg.
:::

## Panel mozgatása az ablakon belül

1. Húzza a panelt a tetején látható nevénél fogva.
2. Húzás közben körvonalas területek jelennek meg a rajz bal és jobb oldalán, valamint alul. Ejtse a panelt valamelyikre, hogy ott dokkolódjon. Az a terület, amely fölött van, besötétedik.
3. Ha máshol ejti a rajz fölé, a panel lebegni fog.

A panelek megoszthatnak egy oldalt: egymás alá kerülnek, és a köztük lévő vonal húzásával oszthatja el a helyet (fókuszált vonalnál a nyílbillentyűk mozgatják, a dupla kattintás egyenlő arányban osztja el a helyet). Húzza a dokkolt oldal belső szélét, hogy szélesebb vagy keskenyebb legyen; dupla kattintással a szél visszaáll.

A lebegő panel a rajz fölött marad. Mozgassa a nevénél fogva, és a jobb alsó sarkának húzásával méretezze át (vagy lépjen a sarokra a Tab billentyűvel, és használja a nyílbillentyűket). A nevére duplán kattintva ismét dokkolódik oda, ahol volt.

:::touch
Egy ujjal húzza a panel nevét. A lebegő panel jobb alsó sarkát egy ujjal húzva méretezheti át, a dokkolt panelek közötti széleket ugyanígy. Ha húzás nélkül szeretné lebegtetni vagy dokkolni, használja a {{ui:⋯}} menüt.
:::

## Panelek csoportosítása lapokként

Két panel osztozhat egy kereten, és egyszerre csak az egyiket mutatja. Húzza az egyik panelt a nevénél fogva egy másik panel címsorára (a sáv körvonalas lesz, amíg fölötte van), és engedje el: a keretben ezután minden panelnek van egy lapja a címsorban. Egy lapra kattintva az a panel jelenik meg. Fókuszált lapnál a {{key:Left}} és a {{key:Right}} lapot vált, a {{key:Home}} és az {{key:End}} az elsőre, illetve az utolsóra ugrik.

Ha ki szeretne venni egy panelt a csoportból, válassza a {{ui:Kivétel a lapcsoportból}} parancsot a {{ui:⋯}} menüjében, vagy húzza máshová. A {{ui:Lap a következővel}} paranccsal és egy panel nevével húzás nélkül csoportosíthatja őket.

## Rögzítés, elrejtés és visszahozás

- A panel címsorában lévő rögzítőgomb **automatikusan elrejtővé** teszi: a panel elhagyja a dokkját, és kis lap lesz a szélen. Mutasson a lapra, fókuszáljon rá, vagy kattintson rá, és a panel kicsúszik a rajz fölé; ha elmozdul róla (vagy megnyomja az {{key:Esc}} billentyűt), visszacsúszik. Nyomja meg ismét a rögzítőgombot, vagy válassza a {{ui:Rögzítés feloldása}} parancsot, hogy végleg dokkolódjon.
- A bezárógomb vagy a menü {{ui:A panel elrejtése}} parancsa elrejti a panelt, és összezárja a dokkját. A szélen látható szaggatott lap visszahozza: kattintson rá, vagy fókuszáljon rá, és nyomja meg az {{key:Enter}} billentyűt.

## Sűrűbb elrendezés

A {{ui:Beállítások}} › {{ui:Általános}} › {{ui:Elrendezés sűrűsége}} két lehetőséget kínál. A {{ui:Kényelmes}} az alapértelmezett. A {{ui:Kompakt}} szűkíti az adott alkalmazás sormagasságait, panelkitöltését, eszköztárgombjait és paneleinek szövegét, hogy több minden elférjen a képernyőn. Az érték alkalmazásonként megmarad. Az érintőképernyő mindkettőnél megtartja a nagy gombjait, a telefon pedig a saját elrendezését. Az {{ui:Elrendezés visszaállítása}} a sűrűséget úgy hagyja, ahogy beállította.

## Az eszköztár sorainak száma

A {{ui:Beállítások}} › {{ui:Általános}} › {{ui:Eszköztársorok}} három lehetőséget kínál. A {{ui:Tördelés}} az alapértelmezett: minden eszközcsoport látszik, annyi sorban, amennyi kell. A {{ui:2 sor}} két sorra, az {{ui:1 sor}} egy sorra korlátozza az eszköztárat, így a rajz több magasságot kap; a nem elférő csoportok oldalirányban görgethetők az eszköztáron belül (használja az egér görgőjét, kétujjas húzást, vagy lépjen egy eszközre a {{key:Tab}} billentyűvel). A két sorban már elférő eszköztár a {{ui:2 sor}} esetén változatlan marad, mert a rács csak magasabbá tenné. A választás alkalmazásonként megmarad. Az érintőképernyő és a telefon a saját elrendezését tartja meg. A CadCraftnak saját beállítása van az eszköztárához a {{ui:Beállítások}} › {{ui:CadCraft}} alatt.

## Használat billentyűzettel

Minden panel {{ui:⋯}} gombja egy menüt nyit meg: {{ui:Dokkolás balra}}, {{ui:Dokkolás jobbra}}, {{ui:Dokkolás alulra}}, {{ui:Lebegtetés a rajz fölött}}, {{ui:Rögzítés a szélére}}, {{ui:A panel elrejtése}}, {{ui:Lap a következővel}} egy másik panellel, {{ui:Áthelyezés új ablakba}} és {{ui:Visszahelyezés}}. Lépjen a gombra a Tab billentyűvel, nyomja meg az {{key:Enter}} billentyűt, mozogjon a nyílbillentyűkkel, és nyomja meg ismét az {{key:Enter}} billentyűt. Az {{key:Esc}} bezárja a menüt.

## Panelek áthelyezése egy második monitorra

1. Válassza a {{ui:⋯}} gombot egy panelen, majd a {{ui:Minden panel áthelyezése új ablakba}} parancsot. A {{ui:Panelek áthelyezése új ablakba}} parancs a {{ui:Beállítások}} között is megtalálható.
2. Egy kis ablak nyílik meg a panelekkel. Húzza át a másik monitorra, és tegye akkora méretűvé, amekkorát szeretne.
3. Dolgozzon tovább: a panelek a korábbiak szerint hatnak a rajzra, a rajz pedig kitölti a főablakot.

A billentyűparancsok akkor is működnek, amikor a panelek ablaka van elöl: az ott lenyomott billentyűk, a mezőbe gépelést kivéve, a rajzhoz jutnak. Az alkalmazás kérdései és párbeszédpanelei továbbra is a főablakban nyílnak meg, ezért oda nézzen, amikor egy megjelenik. A téma és a panelek szövegmérete a főablakot követi.

:::chromium
A Chrome és az Edge a másik képernyőre is el tudja helyezni az ablakot. Ha csatlakoztatott egy második képernyőt, válassza az {{ui:Áthelyezés a másik képernyőmre}} parancsot a panelek ablakában (vagy a {{ui:A panelek a másik képernyőmre}} parancsot egy panel {{ui:⋯}} menüjében). A böngésző egyszer megkérdezi, hogy az oldal láthatja-e a képernyőit; ha engedélyezi, a panelek ablaka ezután mindig azon a képernyőn nyílik meg.
:::

:::firefox safari
Húzza át a panelek ablakát saját kezűleg a másik monitorra. Legközelebb ugyanott és ugyanakkora méretben nyílik meg.
:::

## Több panelablak

Minden panelnek lehet saját ablaka: legfeljebb négy panelablak, például monitoronként egy.

- Egy panel {{ui:⋯}} menüjében az {{ui:Áthelyezés új ablakba}} új ablakot nyit az adott panelnek, az {{ui:Áthelyezés a(z) 2. panelablakba}} (és így tovább) pedig egy már megnyitott ablakba helyezi át. A második ablak neve „panelek 2”.
- Húzzon egy panelt a nevénél fogva egyik ablakból a másikba: ha a főablak fölött engedi el, ott dokkolódik (a körvonalas területek addig látszanak, amíg fölötte van) vagy lebegni kezd; ha egy másik panelablak fölött engedi el, beköltözik oda. Ha bárhol máshol engedi el, marad ott, ahol volt.
- Az a panelablak, amelyben már nincs panel, magától bezárul.

Újratöltés után az alkalmazás újra felkínálja a panelablakait. A böngészők kattintásonként egy ablakot nyitnak meg, ezért minden ablakhoz egyszer válassza az {{ui:A következő megnyitása}} parancsot.

## Párbeszédpanel mozgatása

Minden párbeszédpanel arrébb tehető a rajz elől: nyomja meg és húzza a címsorát. A párbeszédpanel megjegyzi, hol hagyta, mindegyik külön-külön, és legközelebb ugyanoda tér vissza. Dupla kattintással a címsoron ismét középre kerül.

Billentyűzetről nyomja meg az {{key:Alt}}+{{key:Shift}}+egy nyílbillentyű kombinációt, miközben a fókusz a párbeszédpanelen belül van, hogy egyszerre 16 képponttal mozgassa; a {{key:Ctrl}} hozzáadásával 64-gyel. A képernyőn kívülre került párbeszédpanelt (kisebb ablak vagy képernyő után) a program visszahozza.

Telefonon a párbeszédpanelek teljes szélességű lapok maradnak, és nem mozgathatók.

A CadCraft Studióban a CadCraft {{ui:Plottolás PDF-be}} párbeszédpanelje, amelyet munka közben nyitva tarthat, a címsorában egy gombot kap: {{ui:Megnyitás saját ablakban}}. A párbeszédpanel saját ablakba költözik, amelyet egy másik monitorra is tehet. A párbeszédpanel bezárása bezárja az ablakot, az ablak bezárása pedig a párbeszédpanelt.

## A panelek visszahelyezése

- Válassza a {{ui:A panelek visszahelyezése}} parancsot a panelek ablakában, vagy egyszerűen zárja be. A panelek visszakerülnek oda, ahol voltak.
- A főablak bezárása vagy újratöltése a panelek ablakát is bezárja. Amikor az alkalmazás újra megnyílik, jelzi, hogy a panelei saját ablakban voltak; válassza a {{ui:Megnyitás}} parancsot az ablak visszahozásához, vagy a {{ui:Maradjanak itt}} lehetőséget.
- A {{ui:Beállítások}} › {{ui:Általános}} › {{ui:Elrendezés visszaállítása}} minden panelt visszahelyez a kiindulási helyére.

:::tip
Ha semmi sem nyílik meg, amikor a paneleket új ablakba helyezi, a böngésző letiltotta a felugró ablakot. Az alkalmazás ezt jelzi, és a paneleket ott hagyja, ahol voltak. Engedélyezze a felugró ablakokat a getcadcraft.com oldalnál, majd próbálja újra.
:::

Az elrendezés alkalmazásonként megmarad ebben a böngészőben, a többi beállításával együtt.
