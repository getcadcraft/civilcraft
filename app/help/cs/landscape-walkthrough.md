---
title: Navrhněte zahradu od začátku do konce
summary: Deset kroků krajinářského architekta od zaměření až po publikovanou sadu, s tím, co pro každý z nich dělá pracovní prostor Krajina dnes a co zatím nedělá.
keywords: návod, průvodce, jak na to, návrh krajiny, návrh zahrady, začínáme, příklad, vzorek, krok za krokem, zaměření, čáry, terén, výsadba, rozpis, listy, publikování, jeden projekt
from: 87900bf5
---

Návrh krajiny se točí v kruhu: zaměření, náčrt, čáry, terén, plochy, výšky, výsadba, rozpisy, listy, a zpátky. Tady je deset kroků a to, co pro každý z nich existuje. Kde krok má mezeru, je pojmenována v části **Ještě není hotovo** na konci, a není skryta v kroku.

Můžete postupovat podle vzorového pozemku, nebo podle vlastního zaměřovacího výkresu. U vlastního začněte krokem 1.

## 1. Přineste zaměření

{{ui:Povrch}} › {{ui:Čáry z výkresu…}}, zvolte výkres zaměření (DWG 2000–2018 nebo DXF). Zkontrolujte jednotky, převezměte vrstevnice, 3D polylinie a hranici pro povrch a bloky bodů jako zaměřovací body. Sekce **Kontrola výšek a zaměření** přečte výšky zapsané jako text nebo jako atribut a vypíše, co vypadá špatně (jednotky, souřadnicový systém, vzdálenost od nuly, ploché vrstevnice, podivné výšky, zdvojené body), než cokoli přidáte. Viz [Kontrola zaměřovacího výkresu při importu](topic:survey-check) a [Otevření DWG nebo DXF jako čar](topic:open-dwg-dxf). Souřadnicový systém nastavte pomocí {{ui:Souřadnicový systém…}}.

## 2. Ruční náčrty

List na papíře, například starší zaměření nebo popsaný tisk, se načte pomocí {{ui:Skenovat…}} (Začít od skenu): je umístěn v měřítku nebo podle známých souřadnic pod půdorysem a lze jej obtáhnout do čar. ModelCraft čte fotografii ručního náčrtu (Soubor › Importovat fotografii náčrtu…). Samotný CivilCraft nemá nástroj pro ruční náčrt: položte list pod půdorys a kreslete přes něj.

## 3. Od náčrtu k čarám

Kreslete hranové čáry a obrysy nad zaměřením v CivilCraftu, nebo je kreslete ve 2D výkresu. Krajina › Více › {{ui:Z čáry}} promění čáru v dlažbu, plochu osázenou rostlinami, zeď, schody, hranovou čáru a další, zachované propojené: pohnete-li čárou, objekt ji následuje. Viz [Objekty z čar](topic:objects-from-lines). V SuperCad Studio otevřete pozemek, výkres a model budovy v jednom projektu: pracovní prostor **Krajina** má nástroje všech tří a čára vybraná ve 2D výkresu se může stát objektem krajiny, který ji sleduje (Ctrl+K, {{ui:Objekt krajiny z vybrané čáry výkresu}}).

## 4. Navržený terén

Otevřete {{ui:Povrch}} › {{ui:Více}} › {{ui:Pracovní prostor Krajina}}. Navržený terén vytvořte pomocí {{ui:Plošina}}, {{ui:Val}}, {{ui:Průleh}} a plochy úprav s bodovými výškami a vrstevnicemi; dlažby, cesty, zdi, rampy a schody, které přidáte, se zaříznou do téhož navrženého povrchu. Stávající terén se nikdy nemění. {{ui:Výšky}} › {{ui:Úpravy terénu…}} vypíše vše, co tvaruje terén, v jednom pořadí, s výkopem a násypem u každého. Viz [Úpravy terénu](topic:landscape-grading) a [Úpravy terénu a živé výšky](topic:ground-modifiers).

## 5. Dlažby a plochy osázené rostlinami

{{ui:Zpevněné plochy}} › {{ui:Dlažba}}, {{ui:Cesta}}, {{ui:Zeď}}, {{ui:Obrubník}}, {{ui:Rampa}} a {{ui:Schody}}. {{ui:Plochy}} nakreslí trávník, záhon, louku nebo půdopokryvnou plochu s její konstrukční skladbou; sama se ořízne podle dlažeb, zdí a schodů. {{ui:Záhon}} vyplní plochu v rozestupu rostlin ze směsi rostlin. Viz [Zpevněné plochy](topic:hardscape), [Plochy osázené rostlinami](topic:planted-areas) a [Výsadba](topic:planting).

## 6. Výšky, sklony a napojení

Pod **Kontroly terénu** zaškrtněte **Analýzu sklonu** a **Šipky toku a zaplavení**. Pokud voda stojí u terasy, přidejte kolem ní {{ui:Průleh}}. Vlastnosti vám řeknou, kolik stupňů schody potřebují a zda se do nich vejdou, a kde je cesta strmější než její limit. Panel Problémy vypisuje, kde se objekty špatně stýkají: zeď přečnívající přes okraj, záhon nad dlažbou, schody, které minou své podesty. {{ui:Bodová výška}} a {{ui:Šipka sklonu}} popisují terén a aktualizují se samy.

## 7. Výsadba

V **Rostlinách** hledejte v seznamu rostlin (několik set druhů, nebo váš vlastní seznam), vyberte jednu a {{ui:Zasadit}}, {{ui:Záhon}} nebo {{ui:Živý plot}}. Velikost rostliny a popisky nastavte z Více. Více › {{ui:Tabulka rostlin}} upravuje vaše vlastní záznamy: kultivary, dodávané velikosti, hustotu, poznámky ke specifikaci. Každý záznam může nést vlastní symbol a 3D model (OBJ, STL nebo GLB), a Více › {{ui:Grafika rostlin}} kreslí rostliny jednodušeji při hrubších měřítkách. Viz [Seznam rostlin](topic:plant-list), [Záznamy rostlin](topic:plant-records) a [Grafika rostlin](topic:plant-graphics).

## 8. Množství a rozpisy

Více › {{ui:Výkazy}}: rozpisy rostlin a zpevněných ploch a vaše vlastní zůstávají propojené s objekty; uložte je jako CSV nebo XLSX, nebo je dejte na listy (viz [Výkazy](topic:worksheets)). Více › {{ui:Rozpis rostlin…}} pošle počty do TakeoffCraft. Množství zpevněných ploch jsou ve Vlastnostech dlažeb, zdí a schodů. Zavlažování má vlastní výkaz materiálu: {{ui:Zavlažování}} › **Zkontrolovat systém…**. Viz [Zavlažování](topic:irrigation).

## 9. Výkresy a listy

Více › {{ui:Listy krajiny…}}: výsadbový, úpravový a zavlažovací plán, s detaily. {{ui:Výšky}} › {{ui:Řezová čára}} kreslí řezy terénem, zdmi, konstrukčními skladbami, schody a rostlinami. Viz [Listy krajiny](topic:landscape-sheets) a [Řezy a sada k publikování](topic:landscape-sections).

## 10. Publikování

{{ui:Sada k publikování (.zip)}} v dialogu listů vytvoří jedno PDF se seznamem listů a DWG pro každý list. Více › {{ui:Exportovat IFC krajiny}} předá BimCraftu rostliny a zpevněné plochy. Uložte projekt: vše je v jednom souboru.

## Změňte jednu věc: schodiště

Smyslem uchování všeho v jednom projektu je, že se změna promítne všude. Zkuste to se schodištěm mezi dvěma terasami:

1. Nakreslete čáru schodiště jako hranovou čáru (nebo jako čáru ve výkresu), pak Krajina › Více › {{ui:Z čáry}} › {{ui:Schody}}. Ve Vlastnostech schodů zaškrtněte **Tvaruje terén** a nastavte spodní a horní výšku na dvě terasy.
2. Nakreslete záhon vedle a pod schodiště pomocí {{ui:Plochy}} a dlažbu na terasách. Záhon se ořízne podle schodů a dlažby a rozpis rostlin počítá jen to, co je zasazeno.
3. Zvyšte horní výšku schodiště ve Vlastnostech. Navržený terén, bodové výšky, šipky sklonu a výkop a násyp se změní hned. Pokud schodiště už nedosáhne na horní terasu, panel Problémy řekne, o kolik.
4. Pohněte čárou schodiště. Schody ji následují ve stejném kroku zpět; záhon se znovu ořízne a přepočítá a výkazy a rozpisy ukážou nová čísla.
5. Stiskněte jednou Ctrl+Z: čára, schody, terén a záhon se vrátí společně.

Viz [Úpravy terénu a živé výšky](topic:ground-modifiers), [Plochy osázené rostlinami](topic:planted-areas) a [Výkazy](topic:worksheets).

## Ještě není hotovo

Tyto věci jsou požadovány a v tomto sestavení nejsou:

- Zdi, které tvarují terén (hlásí, kde se s ním stýkají, a jejich horní hrana ho může následovat).
- Úprava vašeho vlastního seznamu rostlin z knihovny přímo v aplikaci (upravte seznam projektu a uložte jej jako soubor rostlin).
- Textury a barvy vlastních 3D modelů rostlin GLB (tvar se čte; použije se barva rostliny).

Viz [Pracovní prostor Krajina](topic:landscape) pro každý nástroj.
