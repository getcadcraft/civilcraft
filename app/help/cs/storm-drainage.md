---
title: Výpočet dešťových průtoků, průměrů potrubí a čáry hydraulického spádu
summary: Nakreslete povodí, která odvádějí do každé šachty, sečtěte průtoky sítí racionální metodou, navrhněte průměry potrubí Manningovou rovnicí a zjistěte, kde čára hydraulického spádu teče plným průřezem nebo dosáhne povrchu.
keywords: dešťová kanalizace, povodí, plocha odvodnění, racionální metoda, součinitel odtoku, doba koncentrace, intenzita srážek, idf, manning, návrh potrubí, čára hydraulického spádu, hgl, čára energetického spádu, egl, tlakové proudění, záplavy, dolní voda
from: e44872ec
---

Dešťová kanalizace pracuje na [síti potrubí](topic:pipe-network): nejprve nakreslete síť, pak plochy, které do ní odvádějí. Vše se zobrazí pod **Dešťová kanalizace** v pravém panelu, když nic není vybráno.

## Nakreslení povodí

1. Klikněte na **Nakreslit povodí** pod **Dešťová kanalizace**.
2. Klikněte na rohy plochy, která odvádí do jedné šachty. {{key:Enter}} nebo dvojklik dokončí; {{key:Backspace}} vrátí poslední roh, {{key:Esc}} zastaví.
3. Povodí odvádí do šachty uvnitř něj, jinak do nejbližší. Otevřou se jeho **Vlastnosti**: nastavte název, **Součinitel odtoku C** (podíl deště, který odtéká, 0 až 1), **Dobu koncentrace** v minutách a to, do které šachty **Odvádí do**.

**Nakreslit další povodí** v jeho Vlastnostech spustí další. Kliknutím dovnitř povodí v půdorysu jej vyberete; {{key:Delete}} jej odstraní. Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí zpět.

## Nastavení návrhové bouře

Intenzita srážek je i = a ÷ (tc + b) na mocninu c, v palcích za hodinu u projektu ve stopách a v milimetrech za hodinu u projektu v metrech. Přizpůsobte **Intenzitu a**, **b** a **c** vlastní křivce intenzita–trvání–četnost pro dobu opakování, na kterou navrhujete.

:::warning
Výchozí křivka intenzity, Manningovo n (0.013) a ztráta ve šachtě (0.5) jsou zástupné hodnoty, ne norma. Nastavte je podle vlastních srážkových dat a návrhových kritérií.
:::

- **Nejkratší doba koncentrace**: žádné potrubí se nepočítá na kratší dobu (zpočátku 10 minut).
- **Manningovo n**: drsnost potrubí.
- **Ztráta ve šachtě**: ztráta výšky v každé šachtě jako podíl rychlostní výšky V²/2g potrubí, které z ní odchází.
- **Hladina na výtoku**: dolní voda, kam ústí poslední potrubí. Nechte prázdné, když výtok volně odtéká.

## Jak se průtoky sčítají

Každé potrubí nese všechna povodí nad sebou. Q = C × i × A, kde C × A se sčítá po síti a i je intenzita při nejdelší době koncentrace přitékající vody: vlastní doba povodí, nebo doba z horního povodí plus doba průtoku potrubím (délka ÷ rychlost při plném průřezu). Q je v krychlových stopách za sekundu (A v akrech), nebo v krychlových metrech za sekundu (A v hektarech).

## Navržení potrubí

Tabulka pod **Průtoky a čáry spádu** ukazuje u každého potrubí průtok, co unese při plném průřezu na svém spádu, rychlost, hydraulický spád na jeho horním a dolním konci a jak hluboko protéká.

**Navrhnout průměry podle těchto průtoků** dá každému potrubí nejmenší normalizovaný průměr, který unese jeho průtok na vlastním spádu (12 až 72 palců, nebo 300 až 1800 mm). Je to jeden krok. Dna zůstávají, kde jsou: změní-li se průměry, použijte **Nastavit všechna dna podle pravidel**, aby se zachovalo krytí, a pak tabulku znovu zkontrolujte.

## Čáry spádu

Čára hydraulického spádu (HGL) se počítá od výtoku proti proudu:

- Potrubí tekoucí částečně plné má HGL na hladině vody: dno plus normální hloubka.
- Když je voda pod ním výš než jeho temeno, nebo nese více, než unese při plném průřezu, teče plným průřezem (v tlaku) a jeho HGL stoupá o třecí spád po jeho délce.
- V každé šachtě je HGL horní HGL odcházejícího potrubí plus ztráta ve šachtě.
- Čára energetického spádu (EGL) je HGL plus rychlostní výška.

Potrubí, které teče plným průřezem, je uvedeno, stejně jako každá šachta, kde HGL leží nad horní hranou poklopu: voda tam dosáhne povrchu a šachta je v půdorysu označena červeně. Vyberte potrubí nebo šachtu a ve svých Vlastnostech uvidíte průtok, hloubku, rychlost a obě čáry spádu.

## Provést průchod bouře

Racionální metoda dá jeden vrchol pro každé potrubí. {{ui:Provést průchod bouře}} (pod výsledky, ve Vlastnostech sítě) místo toho spočítá celou bouři: odtok každého povodí v čase, který se přenáší potrubím s jeho dobou průtoku a retencí, a sčítá se tam, kde se setkají.

1. Nechte {{ui:Déšť trvá}} a {{ui:Intenzita deště}} prázdné, aby se použila nejdelší doba koncentrace a výše uvedená srážková křivka, nebo zadejte vlastní hodnoty.
2. Stiskněte {{ui:Provést průchod bouře}}. Tabulka uvádí pro každé potrubí nejvyšší průtok dovnitř a ven, o kolik je výstupní vrchol nižší, kolik z plné kapacity potrubí využívá a minutu, kdy vrcholí.
3. U každého výtoku je malý graf průtoku v čase a tlačítko {{ui:Stáhnout hydrogram (CSV)}}.

Povodí odesílá déšť zprůměrovaný za svou dobu koncentrace, takže bouře kratší než tato doba vrcholí níže než C × i × A. Každé potrubí se prochází metodou Muskingum–Cunge s hloubkou proudění, kterou už racionální metoda zjistila. Dvě větve s různou dobou koncentrace nevrcholí společně, takže jejich součet je nižší než součet jejich vrcholů.

Tento postup neuvažuje tlakové proudění, zpětné vzdutí, retenci v šachtách ani záplavy. Potrubí, jehož vypočítaný vrchol je nad jeho plnou kapacitou, je uvedeno a jeho voda je předána, jako by se vešla. Použijte to k zjištění časování a útlumu, ne k navrhování průměru. Je to pomocný výpočet: kontroluje jej inženýr.

## Uloženo s projektem

Povodí a nastavení bouře se ukládají do souboru projektu. Zatím nejsou v PDF výstupu půdorysu, v DWG ani DXF, ani v LandXML: viz [Ještě není hotovo](topic:not-built-yet).
