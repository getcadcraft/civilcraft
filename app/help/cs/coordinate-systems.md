---
title: Nastavení souřadnicového systému projektu
summary: Určete, v jakém souřadnicovém systému je zaměření, aby CivilCraft zobrazil zeměpisnou šířku a délku, umístil soubory GIS a mapové vrstvy a zapisoval soubory .prj. Vyberte podle kódu, podle názvu, podle samotných souřadnic nebo ze souboru .prj.
keywords: souřadnicový systém, crs, epsg, srid, státní rovinná soustava, spcs, utm, nad83, wgs 84, zobrazení, prj, wkt, datum, zeměpisná šířka, zeměpisná délka, lat long, zeměpisný, mřížka, georeference, georeferencing, přiřadit souřadnicový systém
from: 964250e2
---

Souřadnice projektu jsou jen čísla, dokud neřeknete, co znamenají. Nastavení souřadnicového systému **nic nepřesouvá**: CivilCraft jen ví, že například E 6 150 000 N 2 080 000 jsou souřadnice státní rovinné soustavy zóny 6 Kalifornie v US survey feet. Jakmile to ví:

- stavový řádek ukazuje zeměpisnou šířku a délku kurzoru,
- soubory GIS v jiných systémech (shapefile, GeoJSON, GeoPackage, mřížky výšek, LiDAR) se při otevření převedou do projektu,
- mapové vrstvy lze kreslit pod plán ([Zobrazení mapových vrstev pod plánem](topic:map-layers)),
- exporty do formátů GIS nesou systém (soubor `.prj` pro shapefile, kód EPSG pro GeoPackage a GeoTIFF).

## Výběr systému

1. Na panelu nástrojů ve skupině {{ui:GIS}} zvolte {{ui:Coordinates}}. Otevře se dialog **Souřadnicový systém**. Nahoře je uvedeno, v jakém systému je projekt nyní, nebo **Ne — souřadnice jsou jen čísla**.
2. Systém najděte jedním z těchto způsobů:
   - **Hledání**: zadejte kód EPSG (`2277`, `EPSG:2277`) nebo slova z názvu (`texas central`, `utm 14n`, `lambert-93`). Kódy se seřadí podle toho, co jste zadali; slova vypíší systémy, jejichž název obsahuje všechna slova.
   - {{ui:Systems these coordinates fit}} (když má projekt body nebo povrch): CivilCraft přečte střed projektu ve všech systémech stejné rodiny jednotek a vypíše ty, jejichž oblast platnosti ho obsahuje. Souřadnice státní rovinné soustavy obvykle sedí jen na několik zón: projekt v Texasu na E 3 115 000 N 10 070 000 US survey feet sedí na čtyři varianty Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). U každé položky je vidět, kde by byl střed vašeho projektu.
   - **Blízko (šířka, délka)** a {{ui:Suggest}}: zadejte, kde lokalita leží, například `30.27, -97.74` nebo `30°16′N 97°44′W`, a CivilCraft vypíše zobrazené systémy, jejichž oblast jej obsahuje, nejprve státní a oblastní mřížky.
   - {{ui:Read a .prj file…}}: otevřete soubor `.prj`, který přišel se shapefile nebo výkresem. CivilCraft ho přiřadí k seznamu podle matematiky zobrazení (takže soubor `.prj`, který datum pojmenuje jinak, přesto najde správný systém) a řekne, o který jde; pokud nic přesně neodpovídá, použije se vlastní popis souboru. Soubor `.prj` můžete také přetáhnout na dialog nebo otevřít či přetáhnout na plán samotný.
3. Klikněte na systém v seznamu. Pod **Vybráno** se ukáže název, kód EPSG, jednotka, jak dobře je jeho datum svázáno s WGS 84, jeho oblast platnosti ve zeměpisné šířce a délce a kde v něm leží střed vašeho projektu.
4. Nechte vybranou volbu **Mřížka** (u většiny projektů; ostatní viz [Terénní a místní souřadnice](topic:ground-and-local-coordinates)) a zvolte {{ui:Apply}}.

Stavový řádek nyní ukazuje zeměpisnou šířku a délku kurzoru vedle X a Y. Nastavení systému je jeden krok zpět: {{key:Mod+Z}} ho vrátí.

:::note
Jednotky musí sedět: projekt ve stopách přijme systémy v US survey feet nebo mezinárodních stopách, projekt v metrech přijme systémy v metrech. CivilCraft vysvětlí odmítnutí („Projekt je ve stopách, ale tento systém je v metrech…“). U projektu ve stopách se systémem US survey foot se použijí survey feet: „ft“ v projektu znamená stopu systému. Zeměpisné systémy (zeměpisná šířka a délka, jako samotný WGS 84) nemohou být systémem projektu: výkresy potřebují souřadnice X a Y.
:::

## Změna nebo odebrání systému

Znovu otevřete {{ui:Coordinates}}, vyberte jiný systém a zvolte {{ui:Apply}}. Pokud má projekt body nebo návrh, CivilCraft se zeptá: **Jsou souřadnice v … už?**

- {{ui:Yes — nothing moves}}: čísla zůstanou, jak jsou, a mění se jen jejich význam. Použijte to, když byl starý systém vybrán omylem.
- {{ui:No — convert them}}: každý průzkumný bod, lomová hrana, hranice, PI osy trasy, roh plošiny a konstrukce se převede ze starého systému do nového, v jednom kroku zpět. Povrch načtený z LandXML jako trojúhelníky nelze převést; nejprve jej znovu sestavte z bodů.

{{ui:Remove the system}} systém odebere (nic se nepřesune). Vrstvy GIS už v projektu zůstanou tam, kde jsou.

## Zeměpisná šířka a délka ve stavovém řádku

Dokud má projekt systém, stavový řádek ukazuje zeměpisnou šířku a délku kurzoru v WGS 84, například `30°18′00.00″ N  97°42′00.00″ W`. Desetinné stupně nastavíte v {{ui:Settings}}, {{ui:CivilCraft}}, **Zeměpisná šířka a délka** ([nastavení CivilCraftu](topic:settings)). S terénními nebo místními souřadnicemi musí údaj nejprve projít tímto krokem, takže sedí na bod pod kurzorem.

## Jak dobrý je posun datem

Zeměpisná šířka, délka, GeoJSON i mapové vrstvy jsou všechny ve WGS 84. Vazba každého systému na WGS 84 je v dialogu uvedena:

| Co dialog říká | Co to znamená |
|---|---|
| WGS 84 samotný | Žádný posun. |
| NAD83 se bere jako WGS 84 | Oba se liší o metr nebo dva na většině území Severní Ameriky, nejvýše o několik metrů. Vhodné pro mapové vrstvy a kontext lokality; ne pro zaměřovací body. |
| Známo asi na *n* m (údaj EPSG) | Zveřejněný posun; mapové vrstvy a GeoJSON mohou být o zhruba tolik mimo. |
| Pro tento datum neznámo | Bez souboru mřížky neexistuje zveřejněný posun: mapové vrstvy a GeoJSON mohou být mimo o stovky metrů. |
| Ze souboru posunu mřížky … | Je použit soubor posunu mřížky (níže): uvnitř mřížky do zhruba 10 cm od NAD83. |

Souřadnice vašeho projektu nikdy neprocházejí posunem datem: prochází jím jen to, co se převádí do zeměpisné šířky a délky nebo z nich. Svislé datum a geoidové modely se nezpracovávají (výšky se nikdy nepřevádějí). Pokud nejlepší posun potřebuje soubor mřížky, seznam uvádí hrubší zveřejněný posun a dialog ukáže jeho přesnost (například systémy NAD27 zhruba 20 m), dokud mřížku nepřidáte.

## Soubory posunu mřížky

U systému NAD27 způsobí **Soubor posunu mřížky** v dialogu souřadnicového systému, že zeměpisná šířka a délka, soubory GIS a mapové vrstvy budou do zhruba 10 cm od NAD83 místo zhruba 20 m:

- **Stáhněte** mřížku, kterou navrhne pro oblast systému (NADCON5 pro souvislé území Spojených států, NADCON pro Aljašku, NTv2 pro Kanadu) z cdn.proj.org, veřejného serveru mřížek PROJ. Odesílá se jen název souboru mřížky.
- Nebo **Přidat soubor mřížky…**, pokud už ho máte: NTv2 (`.gsb`) nebo mřížku PROJ GeoTIFF (`.tif`), do 20 MB.

Mřížka se uloží do souboru projektu, takže cestuje s projektem. Oddíl ukazuje, zda je střed projektu uvnitř mřížky: mimo ni se posun vůbec neuplatní, takže použijte mřížku, která pokrývá lokalitu. **Přestat používat mřížku** vrátí hrubý posun. Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí zpět.

Vrstvy GIS už v projektu zůstanou tam, kde jsou, když se mřížka změní; chcete-li je umístit přes mřížku, importujte je znovu. Souřadnice projektu se nikdy nepřesunou.

## Co bylo ověřeno

- Každý převod byl porovnán s PROJ (pyproj 3.7.1 s PROJ 9.5.1), knihovnou souřadnic, kterou používá většina GIS programů, u více než 330 systémů: státní rovinné soustavy v US survey feet a stopách, UTM sever i jih, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator a webový Mercator, mimo jiné. Hodnoty X a Y se shodují na 1 cm se stejným posunem datem (většina s odchylkou výrazně pod 1 mm) a matematika zobrazení se shoduje s vlastními definicemi PROJ na 1 cm.
- Soubory `.prj`, které PROJ zapsal v obou běžných formách (ESRI i OGC), byly přečteny zpět u 105 systémů: 208 ze 210 se shodovalo s přesným kódem EPSG a zbývající dva s systémem se stejnou matematikou na stejném elipsoidu. Soubory `.prj`, které CivilCraft zapisuje, čte PROJ jako týž systém. Soubory ESRI `.prj` pro polární stereografické systémy (UPS, polární Aljaška) načíst nelze; tyto systémy vybírejte podle kódu.
- Zeměpisná šířka a délka ve stavovém řádku se v prohlížeči shodovala s PROJ na 0.01″.
