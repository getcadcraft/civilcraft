---
title: Návrh vodorovné osy trasy
summary: Nakreslete osu podle jejích PI, nastavte poloměry oblouků a počáteční staničení, posouvejte PI a čtěte data oblouků a staničení a odsazení.
keywords: osa trasy, žádné řešení, oblouk se nevejde, největší poloměr, nejmenší poloměr, minimální poloměr, návrhová rychlost, překryv, osa trasy, pi, vodorovný oblouk, poloměr, staničení, tečna, vytvořit osu, rozvržení osy, pc, pt, staničení odsazení
from: 8c5df4aa
---

Osa trasy v CivilCraftu je řetěz tečen procházejících průsečíky (PI), přičemž na každém vnitřním PI s poloměrem je kruhový oblouk. Je staničena od počátečního staničení, které zvolíte. Projekt může obsahovat mnoho os.

## Nakreslete osu

1. Stiskněte {{key:A}}, nebo klikněte na {{ui:Alignment}} ve skupině **Návrh**.
   Nápověda říká „Osa trasy: klikejte na PI postupně. Enter nebo dvojklik dokončí, Backspace odebere poslední, Esc zruší.“
2. Klikněte na první PI (začátek osy).
3. Klikněte postupně na každé další PI. Červená čára sleduje ukazatel a ukazuje délku a směrník tečny, kterou kreslíte, například „212.40 ft  N 63°12'05" E“.
4. Klikněte na poslední PI (konec osy).
5. Stiskněte {{key:Enter}}.
   Osa se nakreslí se staničením a je vybrána. Stavový řádek hlásí například „Osa trasy 1: 386.36 ft, oblouky o poloměru 100 ft tam, kde se vejdou. Poloměry upravte ve Vlastnostech; Profil (R) pro návrh jejího sklonu.“

Při kreslení: {{key:Backspace}} odebere poslední PI, {{key:Esc}} zruší, a tažení po prázdném místě posouvá pohled bez přidání PI.

:::warning
Dokončete klávesou {{key:Enter}}. Dvojklik také dokončí, ale v této verzi odstraní PI, na které jste dvakrát klikli. Klikněte na poslední PI jednou a pak stiskněte {{key:Enter}}.
:::

Každé vnitřní PI dostane oblouk o poloměru 100 ft (30 m v projektu v metrech), nebo největší celý poloměr, který se vejde do poloviny každé tečny, pokud se 100 ft nevejde. Velmi ostrá nebo přímo procházející PI oblouk nedostanou.

## Nastavte poloměry a souřadnice

Když je osa vybrána, pravý panel zobrazí **Osa trasy**:

1. **Název** a **Počáteční staničení**. Staničení zadejte jako `10+00` (stopy) nebo `0+500` (metry), nebo jako obyčejné číslo. Viz [Jednotky, staničení a formáty čísel](topic:units-and-stations).
2. **Délka** a **Koncové staničení** se spočítají za Vás.
3. Tabulka **PI** ukazuje u každého PI jeho **X** a **Y** a u každého vnitřního PI **Poloměr**. Zadejte novou hodnotu a stiskněte {{key:Enter}}.
   - Poloměr 0 vytvoří lomový bod bez oblouku.
   - První a poslední PI nikdy nemají poloměr.
   - Malé x na konci řádku odstraní dané PI (osa má vždy alespoň dva body).
4. Přečtěte seznam **Oblouky**: u každého oblouku jeho staničení PC a PT, poloměr R, lomový úhel Δ a směr (vlevo nebo vpravo), délku L, tečnovou délku T, vnější vzdálenost E a tětivu.
5. Řádek pod oblouky udává směrník první tečny.

## Když se oblouk nevejde

Pokud oblouky potřebují více tečny, než je mezi jejich PI, osa nemá řešení: nekreslí se správně, dokud ji neopravíte, a vynechá se z exportů LandXML. Červené pole řekne proč, v číslech, a nabídne, co by se vešlo:

- „Oblouky u PI 2 a PI 3 potřebují mezi sebou 240.00 ft tečny (130.00 + 110.00), ale PI jsou vzdálena 180.00 ft.“ — nebo, když má oblouk jen jedno z nich, „Oblouk u PI 2 potřebuje 240.00 ft tečny směrem k PI 1 …“.
- Tlačítko u každého PI nastaví **největší poloměr, který se tam vejde**, přičemž druhý oblouk zůstane beze změny (musí se vejít i do druhé tečny PI). Mají-li oba PI oblouky, **Obě** zmenší oba poloměry poměrně tak, aby se právě setkaly.
- Když je jeden oblouk sám delší než tečna, pole řekne, že u druhého PI při takové velikosti žádný oblouk nevejde.
- PI, které se vrací přímo zpět, nemůže mít oblouk; pole nabídne **Bez oblouku u PI n**.

Každé tlačítko je jeden krok: {{key:Mod+Z}} vrátí poloměry zpět. Nabízené poloměry se zaokrouhlují dolů na 0.01, aby se vždy vešly.

### Návrhový minimální poloměr

Zadejte **Návrhový minimální poloměr** (například podle návrhové rychlosti), aby se každý oblouk kontroloval proti němu; nechte prázdné, pokud žádný nechcete. Oblouk pod ním je uveden s tlačítkem **nejmenší poloměr, který splňuje minimum**, pokud se tento poloměr vejde. Když se nevejde, pole to řekne a uvede největší poloměr, který tečny dovolí, abyste věděli, že musíte posunout PI nebo snížit minimum.

## Posouvejte PI v půdorysu

1. S aktivním {{ui:Select}} klikněte na osu, aby se vybrala. U jejích PI se objeví čtvercové úchyty.
2. Přetáhněte úchyt. Osa, její staničení, profil a koridor se pohnou s ním.
3. Uvolněte. Posun je jeden krok zpět.

Přidání PI mezi dvě stávající zatím není k dispozici: odstraňte osu a nakreslete ji znovu, nebo zadejte nové souřadnice PI, která máte.

## Čtěte staničení a odsazení

Přejeďte ukazatelem přes půdorys. Stavový řádek ukáže nejbližší osu (nebo vybranou) se staničením a odsazením, **L** nebo **R** při pohledu po staničení, například „Osa trasy 1: Sta 2+15.30, odsazení 18.42 R“. Za oběma konci přidá „(za koncem)“.

## Co se kreslí

V půdorysu, v DXF a v PDF: osová čára (tečny jako úsečky, oblouky jako skutečné kružnicové oblouky), značka každých 50 ft (20 m) s delší značkou a popisek staničení každých 100 jednotek, a značky PC a PT s popisky jejich staničení.

## Smazání osy

Vyberte ji a stiskněte {{key:Delete}}, nebo klikněte na {{ui:Delete}} na panelu nástrojů nebo na konci pravého panelu. Její profil a koridor odejdou s ní. {{key:Mod+Z}} ji vrátí.

:::mac
Na klávesnici Macu klávesa označená **delete** je v prohlížeči {{key:Backspace}} a výběr nemaže. Stiskněte {{key:Delete}} (Fn a delete), nebo použijte tlačítko {{ui:Delete}}.
:::

## Dále

- [Návrh vertikálního profilu](topic:profile).

## Návrhová rychlost a třída

Ve Vlastnostech osy jsou **Návrhová rychlost** (km/h nebo mph) a **Návrhová třída** uloženy s osou, zapsány v projektu a zapisovány do IFC (Pset_RoadDesignCriteriaCommon). CivilCraft nemá tabulku, která by rychlost spojovala s minimálním poloměrem, takže se z nich nic nekontroluje: nastavte **Minimální poloměr** podle vlastního návrhového předpisu.

## Přechodnice

Oblouk může mít na obou koncích klotoidní přechodnici: tečna, přechodnice, oblouk, přechodnice, tečna. V tabulce PI zadejte délku do **Přechodnice vstup** a **Přechodnice výstup** u PI, které má poloměr. PI zůstává na místě; oblouk se k němu posune, aby se vešel, takže tečnová vzdálenost vzroste o odsazení přechodnice. Obě délky se mohou lišit a PI s jednou délkou dostane přechodnici jen na tomto konci.

Seznam oblouků pak uvádí TS, SC, CS a ST (tečna–přechodnice, přechodnice–oblouk, oblouk–přechodnice, přechodnice–tečna) s úhlem přechodnice θs, tečnovými vzdálenostmi a vnější vzdáleností. Staničení běží po přechodnicích jako všude jinde. Přechodnice, které dohromady stáčejí víc než oblouk, se odmítnou s uvedením PI; přechodnice delší, než tečna dovolí, je překryv, jako u kteréhokoli oblouku. Převýšení používá přechodnici jako náběh (viz [Koridor](topic:corridor)).
