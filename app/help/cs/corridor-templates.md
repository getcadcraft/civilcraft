---
title: Šablony koridorů a šablony terénu
summary: Vytvářejte malé opakovaně použitelné šablony (obrubník a žlab, chodník, zeď, příkop), sestavujte z nich koridor podle staničení s oddělenou levou a pravou stranou, rozdělte osu trasy na několik koridorů a rozprostřete vrstvené materiály na terén.
keywords: šablona, šablony, knihovna šablon, tvorba šablon, typický příčný řez, sestava, dílčí sestava, komponenty, kódy bodů, koncová podmínka, napojení na terén, příkop, opěrná zeď, obrubník, žlab, chodník, oblasti, rozsah staničení, více koridorů, několik koridorů, vlevo a vpravo, šablona terénu, ornice, vozovka, podklad, rozprostření, materiály, množství
from: ce70e58b
---

**Šablona** je malý příčný řez, který nakreslíte jednou a opakovaně použijete: body s odsazeními, sklony a kódy bodů a komponenty s materiály. Koridor lze sestavit ze šablon podle staničení, přičemž každá strana má své vlastní šablony vozovky a svou vlastní koncovou podmínku, a tytéž šablony lze rozprostřít na terén.

:::warning
Vzorové šablony jsou zástupné, slouží jako výchozí bod. Jejich hodnoty nepocházejí z žádné normy ani úřadu. Inženýr musí zkontrolovat každou šablonu a každou hodnotu, kterou jí dáte, dříve než se použije pro návrh.
:::

## Otevřete šablony

Otevřete {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (nebo napište {{cmd:TEMPLATES}}). Okno má tři seznamy:

- **V tomto projektu**: šablony, které používají koridory a šablony terénu tohoto projektu. Ukládají se do souboru projektu.
- **Moje knihovna**: šablony uložené v tomto prohlížeči a nabízené v každém projektu. Chcete-li šablonu zachovat, použijte u šablony projektu {{ui:Save to My library}}.
- **Příklady**: dva jízdní pruhy s vrstvami, obrubník a žlab, chodník, napojení na terén, příkop, opěrná zeď, ornice pod terénem a vozovka na terénu. U každé je označení „Ke kontrole inženýrem“.

{{ui:Use in this project}} zkopíruje šablonu z knihovny nebo z příkladů do projektu. {{ui:Export this project's templates}} je uloží jako soubor `.cctemplates.json`, a {{ui:Import a file}} načte jeden takový soubor do projektu a do Mojí knihovny. Soubor použijte ke sdílení šablon nebo k jejich přenosu do jiného počítače.

## Vytvořte šablonu

{{ui:New template}} (nebo {{ui:Edit}} u šablony projektu) otevře editor šablon. Kreslete pravou stranu směrem ven od bodu šablony 0,0; levou stranu tvoří táž šablona směrem ven doleva.

1. Dejte jí název a druh: **Vozovka** (další šablona se připojí na její konec), **Koncová podmínka** (dotýká se terénu) nebo **Šablona terénu**.
2. Přidejte **hodnoty**: pojmenovaná čísla, například šířku `w` nebo sklon `s`. Pole pro číslo kdekoli v šabloně přijme číslo nebo název hodnoty; `-t` je hodnota `t` se záporným znaménkem. Koridor může každému použití šablony dát vlastní hodnoty, takže jedna šablona obrubníku slouží pro každou výšku obrubníku.
3. Přidávejte **body** v pořadí. Každý se umístí od dřívějšího bodu (nebo od bodu 0,0) podle svého omezení:

| Omezení | Umístí bod |
|---|---|
| Odsazení se sklonem | Odsazení směrem ven a sklon (převýšení na délku; −0.02 klesá o 2 %) |
| Odsazení a převýšení | Odsazení a převýšení |
| Rovně nahoru nebo dolů | Jen převýšení |
| Boční sklon k terénu | Ven od svého bodu k terénu, v poměru výkopu tam, kde je terén nad, a v poměru násypu tam, kde je pod ním |
| K terénu | Odsazení a pak rovně nahoru nebo dolů k terénu |
| Opěrná zeď | Zeď o tloušťce, kterou zadáte: ve výkopu se její horní hrana dotýká terénu u líce vozovky, v násypu vede vozovka přes ni a její vnější líc klesá k terénu |

   Zaškrtněte **Horní** u bodů, kterými prochází hotový povrch. Poslední horní bod je místo, kde na dané straně začíná další šablona. **Cíl** umožní koridoru bod posunout: jeho odsazení nebo výška se převezme z čáry.
4. Přidejte **komponenty**: uzavřené tvary přes kódy bodů (`0` je bod 0,0), každý s názvem, materiálem a druhem. Jejich plochy dávají objemy.

Výkres následuje každou změnu v pravém měřítku a seznam pod ním říká, co je špatně (bod, který se dotkne terénu před koncem, hodnota, kterou šablona nemá, komponenta bez plochy). {{ui:Add to this project}} nebo {{ui:Save}} to uloží jako jeden krok zpět.

## Sestavte koridor ze šablon

Vyberte osu trasy s koridorem a v jejích Vlastnostech zapněte {{ui:Build from templates by station}}. Koridor začne s příklady dvou pruhů a napojení na terén na obou stranách.

- **Oblasti.** Každá oblast začíná na staničení a běží až k začátku další oblasti. {{ui:Add a region}} přidá jednu; její počáteční staničení změníte v jejím poli.
- **Vlevo a vpravo odděleně.** Každá strana každé oblasti má vlastní seznam **Vozovka**, od osy trasy směrem ven, a vlastní **Koncovou podmínku**: napojení na terén, příkop, zeď nebo libovolnou šablonu, která se dotýká terénu. Bez koncové podmínky se strana napojí na výkop a násyp koridoru. {{ui:Copy left to right}} zkopíruje jednu stranu.
- **Hodnoty a cíle.** Pod každou šablonou na straně je pole pro každou hodnotu (prázdné = vlastní hodnota šablony) a u bodu, který přebírá cíl, čára napojení nebo čára jiného koridoru, která jej posouvá.
- **Od a Do** omezí koridor na část osy trasy.

Průřezy, půdorysné čáry pro každý kód bodu, navrhovaný povrch, vytyčování i zemní práce se podle toho upraví. Vlastnosti ukazují objem každé komponenty na stranu a oblast (průměrné koncové plochy podél osy trasy). Převýšení v oblouku a hranové cíle koridoru se při sestavení ze šablon nepoužívají.

## Několik koridorů na jedné ose trasy

Pod **Koridory na této ose trasy** přidá {{ui:Add a corridor}} koridor na zbytek osy trasy: prvnímu koridoru se nastaví koncové staničení uprostřed (nebo si ponechá své), a nový začíná tam s poslední oblastí šablon prvního. Každý koridor má vlastní název, rozsah staničení, šablony a zemní práce. Vypnete ho zaškrtávacím políčkem {{ui:On}}. Tam, kde se rozsahy překrývají, pozdější koridor zarovnává přes dřívější.

## Šablony terénu

Šablona terénu rozprostře vrstvy šablony na terén od jejího bodu 0,0: vrstva pod bodem 0,0 jde do země (ornice k odstranění), vrstva nad ním leží na terénu (podklad a vozovka na parkovišti). Šířky a sklony nemají význam, záleží jen na hloubce každé komponenty nad nebo pod bodem 0,0.

Otevřete {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (nebo napište {{cmd:TERRAINTEMPLATES}}); blok je také ve Vlastnostech projektu. {{ui:Add a terrain template}} přidá jednu s příkladem ornice. U každé vyberte:

- **šablonu** (její hodnoty lze pro tuto změnit),
- **terén**: stávající terén nebo navrhovaný povrch,
- **tvar**, který ji ořízne: celý terén, parcelu, plošinu nebo uzavřenou konstrukční čáru. Několik šablon terénu může na témže terénu používat různé tvary.

Každá vrstva uvádí svou tloušťku, plošnou plochu a objem. Objem je plošná plocha krát tloušťka, tloušťka měřená přímo dolů; plocha se měří na mřížce a uvádí se i rozvinutá (sklonová) plocha. Tvary se kreslí na plán na vrstvu C-TOPO-TMPL. Šablony terénu nemění navrhovaný povrch.

## Materiály a množství

Blok projektu Zemní práce uvádí **Materiály ze šablon**: každou komponentu koridoru a každou vrstvu šablony terénu s jejím objemem. {{ui:Send to TakeoffCraft}} je zapíše do souboru množství po výkopu a násypu, po jedné položce, v krychlových yardech (projekty ve stopách) nebo v krychlových metrech.

## Soubory

Šablony, oblasti, dodatečné koridory a šablony terénu se ukládají do souboru projektu. Projekt, který žádné z toho nepoužívá, se uloží přesně jako dříve, a starší verze CivilCraftu otevřou projekt, který je používá (šablony ignorují a sestaví vlastní sestavu koridoru).
