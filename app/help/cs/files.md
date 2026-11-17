---
title: Soubory, které můžete otevřít, uložit a exportovat
summary: Bodové soubory, LandXML a projekty CivilCraft jako vstup; projekty, LandXML, DXF a PDF jako výstup; co každý z nich uchovává, kam se soubory ukládají a co se mění offline.
keywords: otevřít, uložit, export, import, formáty souborů, csv, txt, landxml, xml, dxf, pdf, json, stáhnout, soubor projektu
from: 82bff559
---

CivilCraft otevírá soubory z vašeho počítače a ukládá je tak, že je stáhne zpět do něj. Nic se nenahrává a nic se neuchovává na serveru. Viz také [Vaše soubory](common:your-files).

## Co se otevírá

Klikněte na {{ui:Open}} (nebo stiskněte {{key:Mod+O}}) a vyberte soubor, nebo přetáhněte soubor z {{pick:mac=Finder|windows=Průzkumník souborů|linux=váš správce souborů}} na půdorys. Vždy jeden soubor; soubory větší než 200 MB se odmítnou. Soubor LandXML nebo projektu větší než 32 MB se čte po částech po asi 4 MB, nikdy jako jeden celý blok textu. Během otevírání LandXML počítejte s tím, že zabere přibližně 13násobek velikosti souboru v paměti (soubor o velikosti 69 MB zabral v našem testu asi 0.9 GB).

| Druh | Názvy souborů | Co se stane |
|---|---|---|
| Bodový soubor | `.csv`, `.txt`, `.pnt`, `.xyz` (jakýkoli textový soubor) | Otevře se dialog **Importovat body**. Body nahradí body projektu; trasy, stavební plochy a potrubí zůstanou. |
| LandXML | `.xml`, `.landxml` | Ze souboru se vytvoří **nový projekt** (pokud má aktuální projekt neuložené změny, zeptá se vás CivilCraft předem). |
| Projekt CivilCraft | `.civilcraft.json` (jakýkoli `.json`) | Projekt se otevře tak, jak byl uložen (pokud má aktuální projekt neuložené změny, zeptá se vás CivilCraft předem). |

CivilCraft rozhoduje podle koncovky souboru, pak podle jeho prvních znaků: text začínající `{` se čte jako projekt, text začínající `<` jako LandXML, cokoli jiného jako bodový soubor. Soubor, který je v dialogu pro otevření šedě nedostupný, lze přesto přetáhnout na půdorys.

:::note
Import bodového souboru do projektu, který už body má, je nahradí bez dotazu a vymaže historii zpět (otevření jakéhokoli souboru je pro funkci Zpět nový začátek). Pokud povrch pochází z LandXML, import bodů ho přepne zpět na povrch vytvořený z bodů. Pokud možná budete chtít staré body vrátit, nejdřív uložte.
:::

Podrobnosti: [Formáty bodových souborů](topic:point-file-formats), [LandXML: co se čte a zapisuje](topic:landxml-reference).

## Co se ukládá

{{ui:Save}} ({{key:Mod+S}}) zapíše dva soubory vedle sebe, pojmenované podle **Název** v levém panelu: `<name>.civilcraft.json`, projekt, ve kterém pokračujete v úpravách, a `<name>.ifc`, stejný návrh ve formátu IFC 4.3 pro ostatní (viz [Export a import IFC](topic:ifc)). Každý soubor odkazuje na ten druhý a IFC navíc nese komprimovanou kopii projektu, takže IFC odeslané samostatně lze znovu otevřít plně upravitelné.

- **Ve Studiu** se oba soubory zapíší vedle sebe, na místě.
- **V Chrome a Edge** první uložení se zeptá na složku a zapíše do ní oba soubory; další uložení jdou do stejné složky. Zrušením dotazu na složku se oba soubory místo toho stáhnou.
- **V ostatních prohlížečích** se oba soubory stáhnou, projektový soubor jako první.

Otevření jednoho z obou souborů hledá ten druhý. Otevřete je oba najednou (nebo přetáhněte oba), nebo otevřete jen jeden: ve Studiu se ten druhý najde ve stejné složce; v prohlížeči se CivilCraft zeptá, zda ho máte přidat, nebo zda chcete pokračovat s tím, který máte. Pokud IFC po uložení v CivilCraftu změnil jiný program, nebo je jeden soubor starší než druhý, projekt se otevře z novějšího návrhu a panel Problémy popíše, co se stalo, s volbami **Uložit hned** (zapíše oba soubory znovu) a **Zobrazit geometrii IFC jako referenci**. Samotné IFC, které změnil jiný program, se otevře z jeho kopie projektu s tím, co stále odpovídá: osy, které změnil, převezmou jeho geometrii; objekty, které odstranil, se vynechají; ostatní změny se vypíší, ale nepřevezmou. Projektový soubor starší než 0.7.1 se otevře jako dříve.

Projektový soubor uchovává:

- každý bod (číslo, souřadnice, výšku, popis) a název bodového souboru, ze kterého pochází
- nastavení povrchu: volby skupin, nakreslené lomové hrany, hranici, nejdelší vnější hranu a TIN načtený z LandXML
- nastavení zobrazení
- osy trasy s jejich PI, poloměry a počátečním staničením, jejich návrhové profily (PVI a délky oblouků) a nastavení koridoru
- stavební plochy a síť potrubí s jejími pravidly

Neuchovává historii zpět. Povrchy, vrstevnice, linie zavázání a objemy se neukládají; při otevření projektu se znovu vytvoří z uložených vstupů. Projektový soubor z novější verze CivilCraft se odmítne se zprávou, která uvádí jeho verzi.

## Co se exportuje

| Tlačítko | Soubor | Obsah |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: body, stávající terén (a upravený povrch, je-li k dispozici) jako povrchy TIN, osy trasy, terénní a návrhové profily, síť potrubí |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 linií půdorysu tak, jak se zobrazují, na pojmenovaných vrstvách |
| {{ui:DWG}} | `<name>.dwg` | Tytéž linie jako výkres DWG ve formátu, který vyberete (2000 až 2018) |
| {{ui:PDF}} | `<name>.pdf` | Vektorové vykreslení půdorysu na listu v měřítku, které vyberete |
| {{ui:GLB}} nebo {{ui:OBJ}} (na liště 3D pohledu) | `<name>-3d.glb`, `<name>-3d.obj` | To, co 3D pohled zobrazuje jako 3D model: metry, osa Y nahoru, skutečné měřítko, kolem zaznamenaného místního počátku |

Co každý z nich vynechává: [Výměna LandXML](topic:landxml), [Export půdorysu do DXF](topic:dxf-export) (DWG také), [Vykreslení půdorysu do PDF](topic:plot-pdf), [Export lokality do 3D](topic:export-3d).

## Kam soubory jdou

Uložené a exportované soubory jdou tam, kam prohlížeč ukládá stažené soubory, obvykle do složky Stažené. Chcete-li vybírat složku pokaždé:

:::chromium
Otevřete **Nastavení** prohlížeče, pak **Stahování** a zapněte **Před stažením každého souboru se zeptat, kam ho uložit**.
:::

:::firefox
Otevřete **Nastavení**, pak **Obecné**, a v části **Soubory a aplikace** zvolte **Vždy se zeptat, kam uložit soubory**.
:::

:::safari
Otevřete **Safari > Nastavení > Obecné** a nastavte **Umístění stahovaných souborů** na **Zeptat se při každém stahování**.
:::

Pokud uložíte dvakrát se stejným názvem, prohlížeč může k druhému souboru přidat číslo, například `Site (1).civilcraft.json`. Příště otevřete nejnovější.

## Online a offline

CivilCraft funguje vždy jen na vašem počítači: otevření načte soubor v prohlížeči, uložení ho stáhne. Chcete-li otevřít CivilCraft bez jakéhokoli připojení, nejdřív ho uložte pro práci offline:

1. Když jste online, klikněte v horní liště aplikace na {{ui:Save for offline}}.
2. Tlačítko počítá nahoru ("Ukládání 12 z 30") a pak zobrazí {{ui:Offline ready}}. CivilCraft je malý (asi 0.6 MB), takže to chvíli trvá. Uložená kopie obsahuje i tuto nápovědu a ukázkovou lokalitu.
3. Bez připojení otevřete stejnou adresu (nebo záložku na ni). Vše funguje, včetně {{ui:Open the sample site}}.

Ostatní stavy tlačítka:

- {{ui:Could not save}}: některé soubory se nestáhly. Zkontrolujte připojení a klikněte na tlačítko, aby se pokus opakoval.
- {{ui:Offline not available}}: toto okno prohlížeče nemůže uchovat offline kopii (soukromá okna a některé spravované počítače to blokují). Použijte běžné okno.

Klikněte na {{ui:Offline ready}}, abyste viděli, kdy se kopie uložila, se dvěma volbami: {{ui:Save again (get the newest version)}} a {{ui:Remove the offline copy}}. Před návštěvou lokality uložte znovu, aby kopie odpovídala nejnovějšímu sestavení. Více v [Offline](common:offline).

:::offline
Jste nyní offline. Pokud byl CivilCraft uložen pro práci offline, vše funguje, včetně ukázkové lokality. Pokud ne, pracujte dál v této kartě, ale neobnovujte ji, dokud nebudete znovu online; bez uložené kopie selže {{ui:Open the sample site}} s hlášením "Ukázku nelze načíst".
:::

:::tip
Pro práci v terénu uložte CivilCraft pro práci offline a přineste si soubory bodů přímo na notebook. Projekty a exporty se bez připojení ukládají jako stažené soubory, takže můžete naimportovat měření z jednoho dne, zkontrolovat povrch a uložit projekt přímo na místě.
:::

Cloudové ukládání zatím není k dispozici a desktopové verze ještě nevyšly. Zatím jsou soubory, které uložíte, jedinou kopií: uchovávejte je na místě, které se zálohuje.

## Doplňky, které soubor používá

Když uložíte projekt, který obsahuje data z doplňku (zaškrtnutí stavebních předpisů nebo zdroj Adresa k lokalitě), soubor zaznamená, které doplňky a které verze. Pokud ho otevřete na počítači, kde některý chybí, nad půdorysem se zobrazí lišta, která to řekne, a nabídne přidání ze seznamu vašeho účtu. Záznam je jen poznámka: soubor se otevře tak či onak.

## Zpět ze Studia

Uvnitř CadCraft Studio se každý dokončený krok v CivilCraftu oznámí Studiu, takže jeho zpět na úrovni projektu může vrátit poslední krok napříč aplikacemi. Studio vrátí krok jen tehdy, když zásobník funkce Zpět v CivilCraftu je přesně v takovém stavu, v jakém ho krok zanechal; poté, co otevřete jiný soubor, toto okno přeskočí.

## Zavření s neuloženými změnami

Když má projekt neuložené změny a zavřete kartu, obnovíte stránku nebo ji opustíte, prohlížeč se zeptá, zda chcete odejít. Jeho znění a vzhled patří prohlížeči a CivilCraft je nemůže změnit. {{ui:New}} a otevření projektu nebo souboru LandXML se místo toho zeptají v dialogu CivilCraftu **Neuložené změny** s volbami {{ui:Cancel}}, {{ui:Don’t save}} a {{ui:Save a copy}}.
