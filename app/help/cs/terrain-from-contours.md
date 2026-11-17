---
title: Terén z vrstevnic
summary: Vytvořte povrch terénu z mapy vrstevnic: vyberte vrstvy čar, určete, odkud pochází výška každé čáry, zkontrolujte křížení a duplicity a vytvořte. Vrstevnice se stanou lomovými hranami, s opravenými plochými trojúhelníky na hřebenech a v údolích. Mapu zachycenou z obrázku nebo PDF lze zmenšit a umístit podle dvou známých bodů.
keywords: vrstevnice, čáry vrstevnic, terén z vrstevnic, povrch z vrstevnic, topografická mapa, zaměřovací mapa, bez souřadnic, lomové hrany, ploché trojúhelníky, hřbet, údolí, vrchol kopce, křížící se vrstevnice, duplicitní vrstevnice, interval vrstevnic, měřítko mapy, dva body, umístění mapy, DXF, DWG, shapefile
from: e6161653
---

Zeměměřič někdy pošle mapu vrstevnic: čáry s výškami, ale bez bodů. CivilCraft z těchto čar vytvoří stávající terén.

## Načtení vrstevnic

Otevřete mapu jako čáry: výkres DXF nebo DWG, shapefile nebo GeoJSON (**GIS** › {{ui:Importovat}}, nebo přetáhněte soubor na půdorys). Čáry se načtou jako **mapové vrstvy**. Pod **Povrch** › {{ui:Více}} zvolte {{ui:Terén z vrstevnic}}.

## Určení, odkud pochází každá výška

Zaškrtněte vrstvy, které obsahují vrstevnice, a pak zvolte **Výška z**:

- {{ui:Vlastních výšek linií}}: čára, jejíž všechny vrcholy mají stejnou výšku (3D polylinie, nebo polylinie s výškou). Čára ve výšce 0 je půdorysná čára bez výšky.
- **Číselné pole** vrstvy (například ELEV), pokud mapa přišla s ním.
- {{ui:Počátku a intervalu, v pořadí, v jakém jsou linie uvedeny}}: pro čáry bez jakékoli výšky. První uvedená čára dostane **Výšku první čáry**, další tu plus **Interval vrstevnic**, a tak dále. Uveďte čáry od nejnižší nahoru (nebo je přeřaďte ve vrstvě).

## Kontrola, pak vytvoření

{{ui:Zkontrolovat}} vypíše slovy, co je špatně, dříve než se cokoli změní:

- čáru **bez výšky** nebo s méně než dvěma body;
- **duplicitní** čáru (stejný tvar dvakrát, i když je nakreslen opačně);
- dvě čáry, které se **kříží**, ve **různých**, nebo ve **stejné** výšce (i čára, která kříží sama sebe), s místem;
- výšku, která **neleží na intervalu** (přepsání, například 105.5 u mapy s intervalem 1 m).

Zaškrtněte {{ui:Vynechat linie, které kříží jinou}}, aby se vypustila čára, která kříží nejvíc jiných (pak další, dokud se žádné nekříží): zbloudilá čára, která protíná každou vrstevnici, je ta, která odejde, ne vrstevnice. **Zjednodušit čáry v rámci vzdálenosti** ubírá vrcholy, které jsou blíže přímce než tato vzdálenost.

{{ui:Vytvořit terén}} přidá čáry do stávajícího terénu jako lomové hrany (jeden krok zpět), takže povrch prochází přesně každou vrstevnicí. Když je zaškrtnuto {{ui:Opravit ploché trojúhelníky na hřebenech, v údolích a na vrcholech}} a je zadán interval, CivilCraft navíc přidá bod uvnitř každého plochého trojúhelníku (trojúhelníku, jehož rohy všechny leží na jedné vrstevnici) do výšky, do které pokračuje sklon vedle něj, nikdy víc než půl intervalu od vrstevnice. Bez toho vycházejí hřebeny, dna údolí a vrcholy kopců jako ploché desky. Na zkušebním kopci klesla chyba oproti skutečnému povrchu o čtvrtinu; na hřebeni o 40 %.

## Mapa bez souřadnic

U mapy vrstevnic zachycené z obrázku nebo PDF otevřete **Zmenšit a umístit vrstvy podle dvou známých bodů**. Zadejte dva body na mapě a místa, kde skutečně jsou; zaškrtnuté vrstvy se zmenší, otočí a posunou tak, aby seděly (jeden krok zpět; výšky se nemění). Stejné dva body dají měřítko (zobrazí se ve zprávě) a natočení.

Povrch je tak dobrý jako mapa: mezi dvěma vrstevnicemi je rovina, takže skutečný terén mezi nimi není znám. Před spolehnutím na výsledek jej zkontrolujte proti bodovým výškám.
