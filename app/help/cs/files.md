---
title: Soubory, které můžete otevřít, uložit a exportovat
summary: Soubory bodů, LandXML a projekty CivilCraft dovnitř; projekty, LandXML, DXF a PDF ven; co každý soubor uchovává, kam se ukládá a co se mění offline.
keywords: otevřít, uložit, export, import, formáty souborů, csv, txt, landxml, xml, dxf, pdf, json, stáhnout, soubor projektu
from: a7debb61
---

CivilCraft otevírá soubory z vašeho počítače a ukládá je tak, že je stáhne zpět do počítače. Nic se nenahrává a na serveru se nic neukládá. Viz také [Vaše soubory](common:your-files).

## Co otevírá

Klikněte na {{ui:Otevřít}} (nebo stiskněte {{key:Mod+O}}) a vyberte soubor, případně přetáhněte soubor z {{pick:mac=Finder|windows=File Explorer|linux=váš správce souborů}} na půdorys. Najednou jeden soubor; soubory větší než 200 MB se nepřijmou.

| Druh | Názvy souborů | Co se stane |
|---|---|---|
| Soubor bodů | `.csv`, `.txt`, `.pnt`, `.xyz` (libovolný textový soubor) | Otevře se dialog **Import bodů**. Body nahradí body projektu; osy tras, plochy a potrubí zůstanou. |
| LandXML | `.xml`, `.landxml` | Ze souboru se vytvoří **nový projekt** (pokud má aktuální projekt neuložené změny, nejprve se vás zeptáme). |
| Projekt CivilCraft | `.civilcraft.json` (libovolný `.json`) | Projekt se otevře tak, jak byl uložen (pokud má aktuální projekt neuložené změny, nejprve se vás zeptáme). |

CivilCraft rozhoduje podle přípony souboru, potom podle jeho prvních znaků: text začínající na `{` se čte jako projekt, text začínající na `<` jako LandXML, cokoli jiného jako soubor bodů. Soubor, který je v otevíracím okně šedý, lze přesto přetáhnout na půdorys.

:::note
Import souboru bodů do projektu, který už body obsahuje, je nahradí bez dotazu a vymaže historii zpět (otevření libovolného souboru je pro zpět nový začátek). Pokud povrch pochází z LandXML, import bodů ho přepne zpět na povrch vytvořený z bodů. Pokud možná budete chtít staré body zpět, nejprve uložte.
:::

Podrobnosti: [Formáty souborů bodů](topic:point-file-formats), [LandXML: co se čte a zapisuje](topic:landxml-reference).

## Co ukládá

{{ui:Uložit}} ({{key:Mod+S}}) zapíše dva soubory vedle sebe, pojmenované podle **Název** v levém panelu: `<name>.civilcraft.json`, projekt, ve kterém pokračujete v úpravách, a `<name>.ifc`, stejný návrh ve formátu IFC 4.3 pro ostatní (viz [Export a import IFC](topic:ifc)). Každý soubor odkazuje na ten druhý a IFC navíc obsahuje komprimovanou kopii projektu, takže IFC odeslané samostatně se znovu otevře s plnou možností úprav.

- **Ve Studiu** se oba soubory zapíší vedle sebe, na místo.
- **V Chrome a Edge** první Uložit požádá o složku a zapíše do ní oba soubory; další uložení půjdou do stejné složky. Zrušením dotazu na složku se místo toho oba soubory stáhnou.
- **V ostatních prohlížečích** se oba soubory stáhnou, nejprve soubor projektu.

Otevření kteréhokoli souboru hledá ten druhý. Otevřete oba najednou (nebo je oba přetáhněte), nebo otevřete jen jeden: ve Studiu se druhý najde ve stejné složce; v prohlížeči se vás CivilCraft zeptá, zda ho máte přidat, nebo zda chcete pokračovat s tím, který máte. Pokud IFC po uložení v CivilCraftu změnil jiný program, nebo je jeden soubor starší než druhý, projekt se otevře z novějšího návrhu a panel Problémy vysvětlí, co se stalo, s volbami **Uložit nyní** (znovu zapíše oba soubory) a **Zobrazit geometrii IFC jako referenci**. IFC samotné, které změnil jiný program, se otevře z jeho kopie projektu s tím, co ještě odpovídá: osy tras, které změnil, převezmou jeho geometrii; objekty, které odstranil, se vynechají; ostatní změny se vypíší, ale nepřevezmou. Soubor projektu starší než 0.7.1 se otevře jako dříve.

Soubor projektu uchovává:

- každý bod (číslo, souřadnice, výšku, popis) a název souboru bodů, ze kterého pochází
- nastavení povrchu: volby skupin, nakreslené lomové hrany, hranici, nejdelší vnější hranu a TIN načtený z LandXML
- nastavení zobrazení
- osy tras s jejich PI, poloměry a počátečním staničením, jejich návrhové profily (PVI a délky oblouků) a nastavení koridoru
- plochy a síť potrubí s jejími pravidly

Historii zpět neuchovává. Povrchy, vrstevnice, čáry nulových prací a objemy se neukládají; při otevření projektu se znovu vytvoří z uložených vstupů. Soubor projektu z novějšího CivilCraftu se odmítne se zprávou, která uvede jeho verzi.

## Co exportuje

| Tlačítko | Soubor | Obsah |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: body, stávající terén (a upravený povrch, pokud existuje) jako povrchy TIN, osy tras, terénní a návrhové profily, síť potrubí |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 čar půdorysu tak, jak se zobrazují, na pojmenovaných vrstvách |
| {{ui:DWG}} | `<name>.dwg` | Stejné čáry jako výkres DWG ve formátu, který zvolíte (2000 až 2018) |
| {{ui:PDF}} | `<name>.pdf` | Vektorové vykreslení půdorysu na list v měřítku, které zvolíte |
| {{ui:GLB}} nebo {{ui:OBJ}} (na liště 3D pohledu) | `<name>-3d.glb`, `<name>-3d.obj` | To, co 3D pohled zobrazuje jako 3D model: metry, osa Y nahoru, skutečné měřítko, kolem zaznamenaného lokálního počátku |

Co každý výstup vynechává: [Výměna LandXML](topic:landxml), [Export půdorysu do DXF](topic:dxf-export) (DWG také), [Vykreslení půdorysu do PDF](topic:plot-pdf), [Export staveniště do 3D](topic:export-3d).

## Kam se soubory ukládají

Uložené a exportované soubory se ukládají tam, kam prohlížeč ukládá stažené soubory, obvykle do složky Stažené soubory. Chcete-li pokaždé vybrat složku:

:::chromium
Otevřete **Nastavení** prohlížeče, potom **Stahování** a zapněte **Před stažením každého souboru se zeptat, kam ho uložit**.
:::

:::firefox
Otevřete **Nastavení**, potom **Obecné** a v části **Soubory a aplikace** zvolte **Vždy se zeptat, kam uložit soubory**.
:::

:::safari
Otevřete **Safari > Nastavení > Obecné** a nastavte **Umístění stahovaných souborů** na **Zeptat se při každém stažení**.
:::

Pokud uložíte dvakrát pod stejným názvem, prohlížeč může druhému souboru přidat číslo, například `Site (1).civilcraft.json`. Příště otevřete nejnovější.

## Online a offline

CivilCraft v každém případě funguje jen na vašem počítači: otevření načte soubor v prohlížeči, uložení ho stáhne. Chcete-li otevřít CivilCraft bez jakéhokoli připojení, nejprve ho uložte pro offline použití:

1. Při připojení klikněte nahoře v liště aplikace na {{ui:Uložit pro offline}}.
2. Tlačítko počítá nahoru ("Ukládání 12 z 30") a poté zobrazí {{ui:Připraveno offline}}. CivilCraft je malý (asi 0.6 MB), takže to chvíli trvá. Uložená kopie obsahuje i tuto nápovědu a ukázkové staveniště.
3. Bez připojení otevřete stejnou adresu (nebo její záložku). Vše funguje, včetně {{ui:Otevřít ukázkové staveniště}}.

Další stavy tlačítka:

- {{ui:Nepodařilo se uložit}}: některé soubory se nestáhly. Zkontrolujte připojení a klikněte na něj znovu.
- {{ui:Offline není dostupné}}: toto okno prohlížeče nemůže uchovat offline kopii (soukromá okna a některé spravované počítače to blokují). Použijte běžné okno.

Kliknutím na {{ui:Připraveno offline}} zobrazíte, kdy byla kopie uložena, s dvěma možnostmi: {{ui:Uložit znovu (získat nejnovější verzi)}} a {{ui:Odebrat offline kopii}}. Před návštěvou staveniště uložte znovu, aby kopie odpovídala nejnovějšímu sestavení. Více v [Offline](common:offline).

:::offline
Jste nyní offline. Pokud byl CivilCraft uložen pro offline použití, vše funguje, včetně ukázkového staveniště. Pokud ne, pokračujte v práci na této kartě, ale neobnovujte ji, dokud nebudete znovu online; bez uložené kopie {{ui:Otevřít ukázkové staveniště}} selže se zprávou "Ukázku se nepodařilo načíst".
:::

:::tip
Pro práci v terénu uložte CivilCraft pro offline použití a přineste soubory bodů přímo na notebook. Projekty a exporty se bez připojení ukládají jako stažení, takže můžete importovat měření z jednoho dne, zkontrolovat povrch a uložit projekt přímo na staveništi.
:::

Ukládání do cloudu zatím není k dispozici a desktopové verze zatím nejsou vydány. Dnes jsou soubory, které uložíte, jedinou kopií: uchovávejte je na místě, kde se zálohují.

## Doplňky, které soubor používá

Když uložíte projekt, který obsahuje data z doplňku (zaškrtávací políčko Stavební předpisy nebo zdroj Adresa na staveniště), soubor zaznamená, které doplňky a které verze. Otevřete-li ho na počítači, kde některý chybí, lišta nad půdorysem to oznámí a nabídne přidání ze seznamu vašeho účtu. Záznam je pouze poznámka: soubor se otevře v každém případě.

## Zpět ze Studia

Uvnitř CadCraft Studio se každý krok, který dokončíte v CivilCraftu, oznámí Studiu, takže jeho zpět na úrovni projektu může vzít zpět poslední krok napříč aplikacemi. Studio krok vrátí zpět jen tehdy, když je zásobník zpět v CivilCraftu přesně v takovém stavu, v jakém ho tento krok zanechal; po otevření jiného souboru toto okno přeskočí.

## Zavření s neuloženými změnami

Má-li projekt neuložené změny a zavřete kartu, obnovíte stránku nebo ji opustíte, prohlížeč se zeptá, zda chcete odejít. Jeho znění a vzhled patří prohlížeči a CivilCraft je nemůže změnit. {{ui:Nový}} a otevření projektu nebo souboru LandXML se místo toho zeptají ve vlastním okně CivilCraftu **Neuložené změny** s volbami {{ui:Zrušit}}, {{ui:Neukládat}} a {{ui:Uložit kopii}}.
