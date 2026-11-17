---
title: Csapadékvíz-hozamok, csőméretek és a nyomásvonal kiszámítása
summary: Rajzolja meg az egyes műtárgyakba lefolyó vízgyűjtőket, adja össze a hozamokat a hálózaton a racionális módszerrel, méretezze a csöveket Manning egyenlete szerint, és lássa meg, hol telik meg a nyomásvonal, és hol éri el a felszínt.
keywords: csapadékvíz-elvezetés, vízgyűjtő, vízgyűjtőterület, racionális módszer, lefolyási tényező, koncentrációs idő, csapadékintenzitás, idf, manning, csőméretezés, nyomásvonal, hgl, energiavonal, egl, túlterhelés, elöntés, alvíz
from: e44872ec
---

A csapadékvíz-elvezetés a [csőhálózaton](topic:pipe-network) működik: először rajzolja meg a hálózatot, utána azokat a területeket, amelyek ebbe folynak. Minden a **Csapadékvíz-elvezetés** alatt jelenik meg a jobb oldali panelen, ha nincs semmi kijelölve.

## Vízgyűjtő rajzolása

1. Kattintson a **Vízgyűjtő rajzolása** gombra a **Csapadékvíz-elvezetés** alatt.
2. Kattintson annak a területnek a sarkaira, amely egy műtárgyba folyik. Az {{key:Enter}} vagy a dupla kattintás befejezi; a {{key:Backspace}} visszavonja az utolsó sarkot, az {{key:Esc}} megállítja.
3. A vízgyűjtő a benne lévő műtárgyba folyik, különben a legközelebbibe. Megnyílnak a **Tulajdonságai**: adja meg a nevét, a **Lefolyási tényezőt C** (az esőzésből lefolyó rész aránya, 0 és 1 között), a **Koncentrációs időt** percben, valamint azt, melyik műtárgyba **folyik**.

A **Vízgyűjtő rajzolása** gomb a Tulajdonságai között a következő vízgyűjtőt kezdi el. Kattintson a vízgyűjtő belsejébe az alaprajzon a kijelöléshez; a {{key:Delete}} törli. Minden módosítás egy lépés: a {{key:Mod+Z}} visszavonja.

## A tervezési csapadék beállítása

Az esőintenzitás i = a ÷ (tc + b), a c kitevőjű hatványon, in/óra egységben láb-alapú projektnél, mm/óra egységben méter-alapú projektnél. Állítsa be az **Intenzitás a**, **b** és **c** értékét a saját intenzitás-időtartam-gyakoriság görbéjéhez, a tervezett visszatérési időre.

:::warning
A kiinduló intenzitásgörbe, a Manning n (0,013) és a csomóponti veszteség (0,5) helyőrző értékek, nem szabvány. Állítsa be őket a saját csapadékadatai és tervezési előírásai alapján.
:::

- **Legrövidebb koncentrációs idő**: egyetlen csövet sem számolnak rövidebb idővel (kezdetben 10 perc).
- **Manning n**: a csövek érdessége.
- **Csomóponti veszteség**: a fejveszteség minden műtárgyban, a kilépő cső V²/2g sebességi magasságának részeként.
- **Vízszint a kifolyónál**: az alvíz, ahol az utolsó cső kiürül. Hagyja üresen, ha a kifolyó szabadon folyik.

## Hogyan adódnak össze a hozamok

Minden cső szállítja az alatta lévő összes vízgyűjtőt. Q = C × i × A, ahol a C × A a hálózaton lefelé összegződik, az i pedig a beérkező víz leghosszabb koncentrációs idejéhez tartozó intenzitás: a vízgyűjtő saját ideje, vagy egy felső vízgyűjtő ideje plusz a csöveken való átfolyás ideje (hossz ÷ teljes telt sebesség). A Q köbláb/másodperc (A acre-ban), illetve köbméter/másodperc (A hektárban) mértékegységben van.

## Csövek méretezése

A **Hozamok és nyomásvonalak** alatti táblázat minden csőhöz megmutatja a hozamot, azt, mit szállít telt keresztmetszettel a saját lejtésén, a sebességet, a nyomásvonalat a cső felső és alsó végénél, valamint azt, milyen mélységgel folyik.

A **Csövek méretezése ezekre a hozamokra** minden csőnek a legkisebb szabványos méretet adja, amely a saját lejtésén szállítja a hozamát (12–72 in, illetve 300–1800 mm). Ez egy lépés. A fenékmagasságok maradnak, ahol vannak: ha a méretek változnak, használja a **Minden csőfenékmagasság beállítása a szabályok szerint** gombot a fedés megtartásához, majd ellenőrizze újra a táblázatot.

## Nyomásvonalak olvasása

A nyomásvonal (HGL) a kifolyótól felfelé számolódik:

- Részben telt csőnél a HGL a vízfelszínen van: a fenékmagasság plusz a normál mélység.
- Ha az alatta lévő víz magasabb, mint a cső koronája, vagy több vizet szállít, mint amennyit telt állapotban bír, a cső nyomás alatt folyik (túlterhelt), és a HGL a cső hosszán a súrlódási lejtéssel emelkedik.
- Minden műtárgynál a HGL a kilépő cső felső HGL-je plusz a csomóponti veszteség.
- Az energiavonal (EGL) a HGL plusz a sebességi magasság.

A nyomás alatt folyó csövet felsorolja a rendszer, ugyanígy minden műtárgyat, ahol a HGL a perem fölött van: ott a víz eléri a felszínt, és a műtárgy piros karikával jelölődik az alaprajzon. Válasszon ki egy csövet vagy műtárgyat, hogy a Tulajdonságaiban lássa a hozamot, mélységet, sebességet és mindkét vonalat.

## Vihar végigvezetése

A racionális módszer csövenként egy csúcsértéket ad. A {{ui:Viharvíz végigvezetése}} (az eredmények alatt, a hálózat Tulajdonságai között) az egész vihart kiszámítja: minden vízgyűjtő idősoros lefolyását, ahogy a csöveken a futási idejével és tározásával lefolyik, és összeadódik a találkozásoknál.

1. Hagyja üresen az {{ui:Az eső tart}} és a {{ui:Csapadékintenzitás}} mezőt, hogy a leghosszabb koncentrációs időt és a fenti csapadékgörbét használja, vagy írjon be sajátot.
2. Nyomja meg a {{ui:Viharvíz végigvezetése}} gombot. A táblázat csövenként megadja a legnagyobb be- és kifolyó hozamot, azt, mennyivel alacsonyabb a kimenő csúcs, a cső teljes kapacitásának hányad részét használja-e, valamint azt, melyik percben éri el a csúcsot.
3. Minden kifolyóhoz készül egy kis hozam–idő diagram és a {{ui:Hidrogram letöltése (CSV)}} gomb.

A vízgyűjtő a koncentrációs idő alatt átlagolt csapadékot adja le, így a koncentrációs időnél rövidebb vihar alacsonyabb csúcsot ér el, mint C × i × A. Minden csövet a Muskingum–Cunge módszerrel vezetünk végig, a racionális módszer által már megállapított áramlási mélység felhasználásával. Két olyan ág, amelynek eltérő a koncentrációs ideje, nem csúcsosodik egyszerre, ezért összegük kisebb, mint a csúcsaik összege.

Ez nem modellezi a túlterhelést, a visszaduzzasztást, a műtárgyakban lévő tárolást vagy az elöntést. Az a cső, amelynek a végigvezetett csúcsa meghaladja a teljes kapacitását, fel van sorolva, és a vize továbbadódik, mintha beférne. Az időzítés és a csillapítás megítéléséhez használja, a cső méretezéséhez ne. Ez egy számítási segédeszköz: mérnöknek kell ellenőriznie.

## Mentés a projekttel

A vízgyűjtők és a viharbeállítások a projektfájlban mentődnek. Még nem szerepelnek a PDF-kimenetben, a DWG-ben vagy DXF-ben, sem a LandXML-ben: lásd [Még nincs elkészítve](topic:not-built-yet).
