---
title: Úpravy terénu a živé výšky
summary: Vše, co tvaruje navrhovaný terén, v jednom seřazeném seznamu (kde se objekty překrývají, vyhrává pozdější), výkop a násyp pro každou úpravu, kontroly spojů v panelu Problémy a bodové výšky a šipky sklonu, které čtou terén živě.
keywords: úpravy terénu, zásobník, pořadí, navrhovaný terén, stávající terén, překryv, výkop a násyp, spoj, opěrná zeď, hrana dlažby, úroveň lože, odpočívadlo schodů, bodová výška, výška bodu, šipka sklonu, popisek sklonu, spády
from: 3998a5b0
---

Navrhovaný terén = stávající terén + úpravy, v pořadí. Stávající terén se nikdy nemění.

## Seznam

{{ui:Výšky}} › {{ui:Úpravy terénu…}} vypíše každý objekt, který tvaruje terén: plošiny, valy, průlehy, plochy úprav, dlažby a cesty, osázené plochy s hotovou výškou a schody a rampy, u kterých je zaškrtnuto pole **Tvaruje terén** (se spodní a horní výškou). Kde se dva objekty překrývají, vyhrává **pozdější**. Přetažením řádku nebo šipkami změníte pořadí; terén se hned přepočítá. Každý řádek ukazuje svůj výkop a násyp (co tvaruje po položkách nad ním) a celkový součet je pod seznamem.

## Kontroly spojů

Panel Problémy vypisuje s odkazem **přejít na**:

- opěrnou zeď, jejíž vysoká strana je nad jejím vrcholem (zemina nad zdí), nebo jejíž nízká strana ukazuje svůj základ;
- osázenou plochu, jejíž hotová výška je nad hranou dlažby, na kterou narází, nebo víc než typických 150 mm pod ní;
- schody, jejichž spodek nebo vrchol nenavazuje na dlažbu, na které přistávají;
- dvě úpravy, které se překrývají (tam vyhrává pozdější).

Opěrná zeď může mít vrchol, který sleduje vysokou stranu terénu: její výška se přepočítá při každé změně terénu.

## Opěrná zeď, která tvaruje terén

Vyberte opěrnou zeď a zaškrtněte **Tvaruje terén**. Pás pod zdí (stejně široký, jako je zeď silná) se připojí do seznamu jako úprava:

- hrana na **vysoké straně** se drží na terénu v tom místě, staničení po staničení, takže vrchol zdi sleduje vysokou stranu (s římsou nahoře). Zadáte-li **Horní** výšku, drží vysokou stranu na této výšce mínus římsa;
- hrana na **nízké straně** se drží na výšce **Terén držený na nízké straně**, kterou zadáte, nebo, je-li pole prázdné, na terénu v tom místě;
- vysoká strana je ta, jejíž terén je po celé délce zdi vyšší, takže se podél zdi nikdy neprohodí;
- terén za pásem se nemění a stávající terén se nikdy nemění.

Jako každá úprava stojí zeď v seznamu a úprava uvedená za ní vyhrává tam, kde se překrývají. Zeď, jejíž držená výška na konci je víc než typických 150 mm od stávajícího terénu v tom místě, dostane varování v panelu Problémy (s **přejít na**). Volně stojící zeď terén netvaruje. Pole je u souborů z dřívějších verzí vypnuté, takže se otevřou tak, jak byly.

## Bodové výšky a šipky sklonu

{{ui:Bodová výška}} (jedno kliknutí) a {{ui:Šipka sklonu}} (dvě kliknutí) čtou terén pokaždé, když se vykreslí: přesunete-li objekt nebo změníte jeho výšku, popisky se přizpůsobí. Ve Vlastnostech vyberte, zda popisek čte navrhovaný, nebo stávající terén; popisky stávajícího terénu jsou v závorkách. Šipky ukazují směrem z kopce a zobrazují `1:20 (5.0 %)`.
