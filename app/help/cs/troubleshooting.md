---
title: Řešení potíží
summary: Příznaky, příčiny a opravy problémů, se kterými se lidé setkávají v CivilCraftu, včetně přesných hlášení, která aplikace zobrazuje.
keywords: problémy, chyby, nefunguje, oprava, nápověda, hlášení, řešení potíží, odmítnuto, chybí, špatně, zaměněno, vrstevnice chybí
from: a9f7dedc
---

Hlášení se zobrazují ve stavovém řádku vpravo dole, v polích levého a pravého panelu a v dialozích. Zde jsou citována tak, jak je aplikace zobrazuje.

## Otevírání souborů

**"Tento soubor má více než 200 MB; CivilCraft zatím takto velké soubory neotevírá."**
Rozdělte soubor s body, nebo před otevřením zredukujte data.

**"Soubor site.json nelze otevřít: Nejde o soubor projektu CivilCraftu."**
Soubor končí na `.json` nebo začíná `{`, ale není projektem CivilCraftu. Soubory bodů nesmějí začínat `{`.

**"Nelze otevřít … Tento soubor projektu pochází z novějšího CivilCraftu (verze 2)."**
Projekt byl uložen novějším sestavením. Otevřete jej tam, nebo z něj exportujte LandXML.

**"Nelze otevřít … Toto je XML, ale ne LandXML (jeho kořenový prvek je <…>)."**
Soubor je jiný typ XML. Exportujte LandXML z jiného programu.

**"… neobsahuje body, TIN povrchy ani osy, které CivilCraft umí načíst."**
Vše v souboru CivilCraft přeskakuje (například jen mřížkové povrchy nebo jen spirální osy). Zbytek hlášení říká, co v souboru bylo. Viz [LandXML: co se čte a zapisuje](topic:landxml-reference).

**"Ukázku nelze načíst: …"**
{{ui:Otevřít ukázkový web}} načítá soubor z webu CadCraftu. Bez připojení funguje jen tehdy, pokud byl CivilCraft uložen pro offline použití (tlačítko v liště aplikace ukazuje {{ui:Připraveno offline}}). Připojte se k internetu, klikněte na {{ui:Uložit pro offline}} a od té doby bude fungovat i offline. Viz [Offline](common:offline).

**{{ui:Uložit pro offline}} zobrazí {{ui:Nepodařilo se uložit}}.**
Některé soubory se nestáhly. Zkontrolujte připojení a klikněte na tlačítko znovu.

**{{ui:Uložit pro offline}} zobrazí {{ui:Offline není dostupné}}.**
Toto okno prohlížeče nemůže uchovat offline kopii, obvykle proto, že jde o soukromé okno nebo je počítač spravovaný. Otevřete CivilCraft v běžném okně.

**Offline se aplikace vůbec neotevře.**
Nebyla uložena pro offline použití v tomto prohlížeči, nebo prohlížeč smazal data webu (Safari to dělá u webů, které nebyly několik týdnů navštíveny). Připojte se k internetu, otevřete CivilCraft a klikněte na {{ui:Uložit pro offline}}.

**Offline kopie je starší sestavení.**
Klikněte na {{ui:Připraveno offline}} a pak při připojení na {{ui:Uložit znovu (získat nejnovější verzi)}}.

**Soubor je v okně pro otevření šedý.**
Okno zobrazuje jen soubory bodů, LandXML a soubory projektů podle jejich přípon. Přetáhněte soubor na plán, nebo jej přejmenujte na `.txt`.

## Import bodů

**"Z tohoto souboru nebylo možné načíst žádné body."**
Vyberte ručně pořadí sloupců v **Sloupce**. Pokud nic nefunguje, otevřete soubor v textovém editoru a zkontrolujte, že je na každém řádku jeden bod a že obsahuje čísla.

**Lokalita vypadá zrcadlově, pootočeně nebo protažená do čáry.**
Souřadnice sever a východ jsou zaměněné. Shrnutí uvádělo "odhadnuto podle počtu sloupců". Vyberte v **Sloupce** PENZD místo PNEZD (nebo naopak), nebo importujte znovu.

**Body daleko od ostatních a plán oddálený na tečku.**
Řádek má překlep v souřadnici, nebo soubor míchá souřadnicové systémy. Najděte bod (kliknutím na něj zobrazíte jeho číslo) a opravte soubor.

**Řádky uvedené pod "Řádky nenačtené".**
Viz tabulku v [Import bodů](topic:import-points#rows-that-are-not-read).

**Moje staré body zmizely.**
Import souboru bodů nahradí všechny body a vymaže zpět. Otevřete uložený projekt a body se vrátí.

## Povrch

**"Povrch: ještě není hotovo" s červeným rámečkem.**
Rámeček říká proč: "Povrch potřebuje alespoň tři body s výškami.", "Body leží všechny na jedné přímce: žádné trojúhelníky.", "Žádné body s výškami.", "Hranice se nepřekrývá s body." nebo "Uvnitř hranice nezůstaly žádné trojúhelníky." Zkontrolujte pořadí sloupců, skupiny bodů (nejsou označeny jako {{ui:Vynecháno}}?) a hranici.

**Vrstevnice procházejí přímo přes příkop nebo hřbet.**
Ta čára není lomová hrana. Nastavte její skupinu na {{ui:Lomová hrana}}, nebo ji nakreslete nástrojem {{ui:Lomová hrana}}. Viz [Vytvoření a úprava povrchu](topic:build-surface).

**Skupina lomové hrany kreslí cikcak.**
Skupina obsahuje víc než jednu čáru, nebo její body nejsou očíslované podél čáry. Nastavte skupinu zpět na {{ui:Body}} a každou čáru nakreslete nástrojem {{ui:Lomová hrana}}.

**Dlouhé tenké trojúhelníky podél okraje.**
Nakreslete hranici ({{key:O}}), nebo nastavte **Nejdelší vnější hrana**.

**Žádné vrstevnice, ačkoli je povrch vytvořen.**
Buď je {{ui:Vrstevnice}} vypnuté v **Zobrazení**, nebo je interval tak malý, že by vzniklo víc než 2 000 úrovní vrstevnic. Zvolte větší interval.

**Lomové hrany nebo hranice nic nemění.**
Povrch pochází z LandXML ("Povrch (z LandXML)"). Používá se beze změny. Klikněte na {{ui:Obnovit povrch z bodů}} a vytvořte jej z bodů.

**"Povrch zatím neexistuje: nejprve otevřete body."**
Lomová hrana, hranice a plošina potřebují existující terén. Nejprve importujte body.

**"Klikněte na bod s výškou: lomová hrana převezme výšky bodů."**
Nástroj {{ui:Lomová hrana}} vybírá jen body zaměření. Přibližte a klikněte na bod (oranžový čtverec ukazuje, který bod se použije).

## Kreslení

**Můj poslední bod zmizel, když jsem dvojklikem dokončil kreslení.**
V této verzi dvojklik dokončí osu, plošinu, lomovou hranu nebo hranici, ale zahodí bod, na který jste dvakrát klikli. Klikněte jednou na poslední bod a stiskněte {{key:Enter}}. Pokud se to už stalo, použijte {{key:Mod+Z}} a nakreslete znovu.

**Na tabletu nelze kreslení dokončit.**
Dokončení vyžaduje {{key:Enter}}; zatím není žádné tlačítko na obrazovce. Připojte klávesnici. Viz [Myš, touchpad a dotyk](topic:keyboard#mouse-trackpad-and-touch).

**Tažení při umisťování bodu místo toho posouvá plán.**
Tažení o víc než několik pixelů posune plán v každém nástroji. Klikněte bez pohybu.

**"Osa potřebuje alespoň dva body." / "Plošina potřebuje alespoň tři rohy." / "Úsek potrubí potřebuje alespoň dva objekty."**
Stiskli jste {{key:Enter}} příliš brzy. Kresba se zahodí; začněte znovu.

**Klávesy jako A nebo G nedělají nic.**
Textové pole nebo seznam v panelu má stále fokus, takže písmena jdou do něj. Klikněte jednou na plán a pak stiskněte klávesu. Na Macu posílá klávesa delete prohlížeči Backspace: k odstranění výběru použijte Fn a delete.

## Osy a profily

**"Oblouky u PI 2 a PI 3 se překrývají: … Použijte menší poloměry."**
Dva oblouky potřebují víc tečny, než je mezi jejich PI. Zmenšete jeden nebo oba poloměry v tabulce PI, nebo oddalte PI.

**"PI 3 se otáčí zpět přímo; nemůže přijmout oblouk."**
Osa se v tomto PI vrací sama do sebe. Přesuňte nebo odstraňte PI.

**"Tato osa nemá pod sebou terén, ze kterého by začínala."**
Osa je mimo povrch. Přesuňte ji na povrch, nebo přidejte PVI kliknutím při zapnutém {{ui:Přidat PVI}}.

**"Výškový oblouk u PVI 3 (L = …) začíná dříve, než skončí předchozí oblouk nebo PVI." / "… přesahuje další PVI."**
Zkraťte délku oblouku, nebo oddalte PVI.

**"Na … už PVI existuje."**
Na tomto staničení už PVI je. Klikněte jinde, nebo přetáhněte existující.

**Zobrazení profilu je prázdné: "Nakreslete osu, aby se zobrazil její profil."**
Osa neexistuje, nebo vybraná osa obsahuje chyby.

## Koridory a plošiny

**"Koridor potřebuje návrhový profil bez chyb."**
Začněte návrhový profil ({{ui:Začít z terénu}}) a opravte překryvy oblouků.

**"… boční svahy vybíhají z povrchu dříve, než narazí na terén." / "… čáry svahů vybíhají z povrchu dříve, než na něj narazí …"**
Urovnání dosáhne okraje povrchu dříve, než narazí na terén. Přesuňte návrh dovnitř od okraje, nebo jej přiblížte k terénu. Nová plošina nakreslená částečně mimo povrch může začínat na nulové výšce: zadejte skutečnou výšku.

**"Čáry denního světla koridoru … se křižují" / "Čára denního světla se protíná sama …"**
Svahy z různých stran se srážejí: těsné oblouky, úzké plošiny, hluboké výkopy nebo vysoké násypy. Použijte větší poloměr, užší sestavu, širší plošinu nebo strmější svahy.

**"Zatím žádné objemy: plošina se musí urovnat bez problémů."**
Opravte problémy uvedené v červeném rámečku nad tím.

**{{ui:Navrhovaný (urovnaný)}} je šedé.**
Zatím se žádná plošina ani koridor neurovnaly.

## Potrubí

**"P2 zatím nemá dna."**
Klikněte na {{ui:Nastavit jeho dna podle pravidel}}, nebo zadejte dna.

**"P1: u S1 chybí terén, ze kterého by začínal."**
Horní šachta je mimo povrch a nemá poklop. Zadejte pro ni poklop.

**Každá trubka je označena poté, co jsem přesunul šachtu.**
Přesun šachty nemění dna. Klikněte na {{ui:Nastavit všechna dna podle pravidel}}.

Všechna hlášení sítě jsou vysvětlena v [Návrh sítě gravitačního potrubí](topic:pipe-network#read-and-fix-problems).

## Ukládání a export

**"Zatím není co exportovat." / "Zatím není co vykreslit."**
Projekt je prázdný. Nejprve importujte body.

**Uložený soubor nemohu najít.**
Je ve složce stažených souborů prohlížeče (obvykle složka Stažené). Viz [Soubory, které můžete otevřít, uložit a exportovat](topic:files#where-the-files-go).

**Měřítko PDF je na papíře špatné.**
Tiskněte na 100 % nebo ve skutečné velikosti, ne "přizpůsobit stránce".

**Otazníky v textu PDF.**
Názvy nebo popisy obsahují znaky mimo západoevropskou sadu. Stavový řádek je počítá. Přejmenujte je prostými znaky.

**Vykreslení je u okrajů oříznuté.**
Měřítko je pro list příliš velké. Zvolte měřítko označené "(vejde se)", větší list, nebo {{ui:Co je na obrazovce}}.

**{{key:Mod+P}} otevřelo tiskový dialog prohlížeče.**
Stránka neměla fokus. Zavřete dialog, klikněte na plán a stiskněte {{key:Mod+P}} znovu, nebo klikněte na {{ui:PDF}}.

## Samotná aplikace

**Obrazovka je prázdná nebo lišta nástrojů nic nedělá.**
Použijte aktuální verzi Chrome, Edge, Firefox nebo Safari a stránku znovu načtěte. Viz [Prohlížeče](common:browsers).

**Aplikace je s velkým souborem bodů pomalá.**
Vypněte {{ui:Trojúhelníky}}, {{ui:Popisky bodů}} a {{ui:Pásma výšek}} a použijte větší interval vrstevnic. Velmi velké povrchy se po každé změně chvíli přepočítávají.

**Prohlížeč se ptá "Opustit web?"**
Projekt má neuložené změny. Zůstaňte, uložte pomocí {{key:Mod+S}} a pak odejděte.
