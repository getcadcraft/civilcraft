---
title: Návrh gravitační sítě potrubí
summary: Kreslete úseky dešťového nebo splaškového potrubí objekt po objektu, nastavte pravidla sklonu, krytí a spádu, nechte CivilCraft nastavit dna a opravte problémy, které vypíše.
keywords: tvorba objektů, typ objektu, obdélníkový objekt, uliční vpusť, rám, krytí, tloušťka stěny, položka knihovny, síť potrubí, dešťová, splašková, kanalizace, objekty, šachty, vtoky, dna, sklon, spád, horní hrana, kalová jímka, gravitační potrubí
from: 10a3c14d
---

Projekt drží jednu gravitační síť potrubí, dešťovou nebo splaškovou. Skládá se z objektů (šachet, vtoků) a přímých potrubí mezi nimi. Tok běží ve směru, ve kterém kreslíte. CivilCraft kontroluje každé potrubí a objekt proti třem pravidlům, která nastavíte, a může z nich nastavit každé dno.

## Nakreslete úsek

Potrubí můžete kreslit bez povrchu, ale horní hrany, krytí a automatická dna jej potřebují.

1. Stiskněte {{key:P}}, nebo klikněte na {{ui:Potrubí}} ve skupině **Návrh**.
   Nápověda říká: „Potrubí: klikejte na objekty od začátku úseku dolů (existující kliknutím připojíte). Enter dokončí.“
2. Klikněte, kde má být umístěn horní objekt. Objekt se umístí.
3. Klikněte na každý další objekt po proudu. Chcete-li se připojit k existujícímu objektu, klikněte na něj: stavový řádek napíše „Připojeno k S3.“
4. Stiskněte {{key:Enter}}.
   Potrubí se nakreslí, jejich dna se nastaví podle pravidel a stavový řádek napíše například: „Nakresleny 3 úseky potrubí, dna nastavena podle pravidel: 12; všechny kontroly prošly.“

Nové objekty se pojmenují S1, S2 … s průměrem 48 in (1200 mm). Nová potrubí se pojmenují P1, P2 … s průměrem 12 in (300 mm). Průměry jsou v palcích v projektu ve stopách a v milimetrech v metrovém projektu.

Dokončete klávesou {{key:Enter}}. Dvojklik také funguje, ale když dvojklikem na existující objekt ukončíte úsek v něm, připojení se zruší: klikněte na něj jednou a potom stiskněte {{key:Enter}}.

## Nastavte pravidla

Když nic není vybráno, pravý panel (**Projekt**) má blok **Síť potrubí**:

| Nastavení | Výchozí hodnota | Význam |
|---|---|---|
| Typ | Dešťová | {{ui:Dešťová}} nebo {{ui:Splašková}}; zapisuje se do LandXML |
| Nejmenší sklon | 0.50% | Každé potrubí musí klesat alespoň tolik |
| Nejmenší krytí | 2 ft (0.6 m) | Od terénu po temeno potrubí, po celé jeho délce |
| Spád v objektech | 0.10 ft (0.03 m) | Dno výtoku musí být alespoň tolik pod každým dnem přítoku |

**Tyto výchozí hodnoty jsou zástupné, nejsou to norma.** Nastavte hodnoty, které vyžaduje váš úřad nebo projekt. Krytí se měří od terénu k temeni (dno plus vnitřní průměr); tloušťka stěny se nepočítá. Kde jsou upraveny plošiny nebo koridory, je upravený povrch terénem.

## Nechte CivilCraft nastavit dna

- {{ui:Nastavit všechna dna podle pravidel}} (v bloku **Síť potrubí**) nastaví všechna potrubí.
- {{ui:Nastavit jeho dna podle pravidel}} (s jedním vybraným potrubím) nastaví jen toto potrubí.

Při postupu po proudu každý úsek začíná alespoň s krytím u svého horního objektu, klesá alespoň o nejmenší sklon, klesá alespoň o spád v každém objektu a jde hlouběji všude, kde by terén podél potrubí zanechal méně než nejmenší krytí. Dna se zaokrouhlují dolů na 0.01, nikdy nahoru. Stavový řádek napíše „Dna nastavena: nejmenší krytí na začátku každého úseku, alespoň nejmenší sklon, alespoň spád v každém objektu.“, nebo pojmenuje, co nedokázal.

## Upravte objekty a potrubí

Klikněte na objekt nebo potrubí nástrojem {{ui:Výběr}}, abyste jej viděli v pravém panelu.

**Objekt**: **Název**, **Horní hrana**, **Hloubka kalové jímky**, **Průměr**, pak **Použitá horní hrana**, **Kalová jímka**, **Východ (X)** a **Sever (Y)**, a potrubí vstupující a vystupující s jejich dny.

- Nechte **Horní hrana** prázdnou, aby se převzala z povrchu; pole pak ukáže hodnotu povrchu šedě. Zadejte hodnotu, chcete-li horní hranu pevně nastavit.
- Přetažením úchytu objektu na plánu jej přesunete. Jeho potrubí ho budou následovat; jejich dna zůstanou, jak byla, takže problémy zkontrolujte potom.

**Typ**: zvolte jeden z typů objektů sítě (níže), nebo žádný pro kruhový objekt vlastního průměru.

**Potrubí**: **Název**, objekty, mezi kterými vede, **Průměr**, **Horní dno**, **Dolní dno**, pak **Délka**, **Sklon** a **Nejmenší krytí**.

Po každé hodnotě stiskněte {{key:Enter}}.

## Čtěte a opravujte problémy

Blok **Síť potrubí** vypisuje každý problém (až 40); klikněte na jeden z nich, abyste vybrali potrubí nebo objekt. Vybrané potrubí nebo objekt vypisuje své vlastní. Když žádné není, napíše: „Každé potrubí a objekt prochází pravidly.“

| Zpráva (příklady) | Co dělat |
|---|---|
| „P2 stoupá do kopce (-0.40%).“ nebo „… vede vodorovně …“ | Prohoďte dna, nebo je nastavte podle pravidel. |
| „P2 se sklonem 0.30% je plošší než minimum 0.50%.“ | Snižte dolní dno, nebo zvedněte horní. |
| „P3 má podél sebe 1.40 krytí z 35, což je méně než minimum 2.“ | Snižte potrubí; nastavte jeho dna podle pravidel. |
| „V S3 odchází P4 na 245.20, o méně než 0.1 pod P3 přitékajícím na 245.25.“ | Snižte horní dno výtokového potrubí. |
| „Temeno P1 je nad horní hranou S1.“ | Potrubí je pro objekt příliš vysoko. |
| „Z S2 vystupují 2 potrubí; gravitační síť by měla mít z každého objektu jeden výtok.“ | Odstraňte jedno odchozí potrubí, nebo jej nakreslete znovu správným směrem. |
| „Potrubí tvoří smyčku; tok musí končit ve výtoku.“ | Úsek byl nakreslen zpět do sebe; smažte potrubí. |
| „S5 je mimo povrch a nemá výšku horní hrany.“ | Zadejte horní hranu, nebo přesuňte objekt na povrch. |
| „P6 zčásti vede mimo povrch; krytí tam není známo.“ | Rozšiřte povrch, nebo přijměte, že tam se krytí nekontroluje. |
| „P7 zatím nemá dna.“ | Zadejte je, nebo je nastavte podle pravidel. |

Problémová potrubí a objekty jsou na plánu také označeny červeně.

## Typy objektů

Typ objektu je objekt sestavený z jeho parametrů: šachta, vtok, rozdělovací šachta nebo výtok, **kruhový** (vnitřní průměr) nebo **obdélníkový** (vnitřní šířka a délka), se svou **tloušťkou stěny**, **deskou dna**, **kalovou jímkou** pod nejnižším potrubím a **rámem a poklopem** (kruhový nebo obdélníkový otvor, výška rámu). Typy patří do sítě, pod **Typy objektů** ve Vlastnostech projektu.

1. Klikněte na {{ui:Nový typ objektu}}. Dialog kreslí objekt na plánu a v řezu, jak píšete.
2. Klikněte na {{ui:Přidat typ}}.
3. Vyberte objekt a zvolte typ pod **Typ**. Převezme velikost typu a jeho kalovou jímku; vlastní kalovou jímku lze stále změnit.

Upravte typ a každý objekt tohoto typu převezme jeho rozměry. Odstraníte-li typ, jeho objekty zůstanou jako kruhové objekty stejné šířky. Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí zpět.

Obdélníkový objekt se kreslí na plánu, v DXF, DWG a PDF, a ve 3D jako obdélník s délkou podél jeho výtokového potrubí; potrubí začíná u jeho stěny. LandXML jej zapisuje jako obdélníkový objekt (`RectStruct`) s jeho tloušťkou stěny a takové objekty čte zpět jako typy.

### Sdílení typu přes knihovnu

{{ui:Uložit jako položku knihovny}} zapíše typ jako položku knihovny CadCraft (soubor `.json`): jeho symbol na plánu, 3D těleso do typické hloubky a všechny rozměry. Nahrajte ji do knihovny, abyste ji sdíleli. {{ui:Otevřít položku knihovny}} přečte objekt uložený tímto způsobem zpět do sítě, převedený na jednotky projektu. Položky knihovny, které nejsou objekty vytvořené v CivilCraftu, se odmítnou s uvedením důvodu.

## Smazání

Vyberte potrubí a stiskněte {{key:Delete}}, aby se odstranilo. Smazání objektu odstraní i potrubí, která jsou k němu připojena. Na Macu stiskněte Fn a Delete, nebo klikněte na {{ui:Smazat}}.

## Ještě není hotovo

Průtoky, dimenze potrubí a čára hydraulického spádu jsou v [Dešťová kanalizace](topic:storm-drainage). Katalogy potrubí, nekruhová potrubí, potrubí v zobrazení profilu, zakřivená potrubí a více než jedna síť na projekt zatím nejsou k dispozici. Viz [Ještě není hotovo](topic:not-built-yet).
