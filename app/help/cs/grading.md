---
title: Urovnání stavební plošiny
summary: Nakreslete rovnou plošinu, nastavte její výšku a sklony zářezu a násypu a nechte CivilCraft ji napojit na stávající terén a přidat k navrhovanému povrchu.
keywords: opěrná zeď, opěrné zdi, svislá strana, zeď místo svahu, sklon strany, sklon na každé straně, násep, urovnání, plošina, stavební plošina, napojení, čára napojení, skupina urovnání, sklon zářezu, sklon násypu, konečný terén, navrhovaný povrch, urovnání terénu, hranová čára
from: 482319a6
---

Plošina je rovná plocha v jedné výšce. Od jejího okraje CivilCraft urovnává směrem ven: sklonem zářezu tam, kde je terén výše než plošina, a sklonem násypu tam, kde je níž, dokud svah nenarazí na stávající terén. Ta čára setkání je čára napojení. Plošina a její svahy nahradí stávající terén uvnitř čáry napojení a vytvoří navrhovaný povrch.

## Nakreslit plošinu

Potřebujete nejprve existující povrch terénu.

1. Stiskněte {{key:G}}, nebo klikněte na {{ui:Pad}} ve skupině **Návrh**.
   Nápověda zní: "Plošina: klikněte na její rohy. Enter nebo dvojklik dokončí, Backspace odebere poslední, Esc zruší."
2. Klikněte na rohy plošiny postupně, v libovolném směru. Modrý obrys sleduje ukazatel.
3. Po posledním rohu (alespoň tři) stiskněte {{key:Enter}}.
   Plošina se nakreslí a vybere. Začíná na výšce terénu uprostřed, zaokrouhlené na 0.1, se sklonem zářezu 2 : 1 a sklonem násypu 3 : 1. Stavový řádek říká například "Plošina 1 ve výšce 254.3 (terén uprostřed), zářez 2:1, násyp 3:1. Změňte je ve Vlastnostech."

:::warning
Dokončete pomocí {{key:Enter}}. Dvojklik také dokončí, ale v této verzi odebere roh, na který jste dvakrát klikli. Klikněte na poslední roh jednou a pak stiskněte {{key:Enter}}.
:::

Obrys plošiny se nesmí křížit sám se sebou ("The pad outline crosses itself." se hlásí, když se křiží).

## Nastavit výšku a sklony

S vybranou plošinou ukazuje pravý panel **Plošina**:

1. **Název**.
2. **Výška**: rovná výška plošiny.
3. **Sklon zářezu** a **Sklon násypu**, jako H:V (2 znamená 2 : 1). Oba musí být větší než 0.
4. **Plocha plošiny** a **Rohy** se zobrazují pro informaci.

Stiskněte {{key:Enter}} po každé hodnotě. Čára napojení, navrhovaný povrch a objemy se hned aktualizují.

Pod poli čte řádek například "Čára napojení: 48 čar svahu (20 v zářezu, 28 v násypu), nejvzdálenější 31.20 ft ven." Půdorys ukazuje čáru napojení a čáry svahu purpurově.

## Jak se napojení hledá

- Čáry svahu vycházejí z každé hrany kolmo k ní, zhruba každou dvacetinu velikosti plošiny.
- U vnějších rohů se rozbíhají po 10°, takže svah obepíná roh.
- U vnitřních rohů jedna čára běží po osectrise, kde se setkávají svahy od obou hran.
- Každá čára stoupá sklonem zářezu nebo klesá sklonem násypu, dokud nedosáhne terénu.

## Svahy podle stran a opěrné zdi

Pod **Strany a opěrné zdi** ve Vlastnostech plošiny, nástupiště nebo valu lze každou stranu urovnat po svém. Strana 1 vede od prvního rohu, který jste klikli, ke druhému, strana 2 od druhého ke třetímu, a tak dále.

- **Všechny strany**: **Se sklonem** použije výše uvedené sklony zářezu a násypu na každé straně; **Svisle: opěrné zdi** dá zeď na každou stranu.
- Pro každou stranu: **Sklony výše**, **Vlastní sklony** (napište sklon zářezu a násypu pro tu stranu) nebo **Svisle (opěrná zeď)**.
- Sklon napište jako `3` nebo `3:1` (vodorovně k 1 svisle), `33%` nebo `18.4°`; zobrazí se jako H:1. Vlastní **Sklon zářezu** a **Sklon násypu** plošiny berou totéž.
- Svislá strana nemá násep: opěrná zeď vede podél hrany od plošiny dolů ke stávajícímu terénu (v násypu) nebo od terénu dolů k plošině (v zářezu). **Tloušťka zdi** (zpočátku 0.3 m nebo 1 ft) je, o kolik terén odskočí od hrany plošiny ke stávajícímu terénu. Objemy zářezu a násypu vynechávají násep, který na této straně už není.
- Kde se zeď setkává se šikmou stranou, svah obepíná konec zdi; dvě zdi se setkají ve zkosení.
- Pod poli: délka zdí, odkrytá plocha (výška × délka), nejvyšší a průměrná výška.

Půdorys kreslí vnější líc každé zdi krátkými značkami napříč a její výšku na obou koncích a v nejvyšším bodě (na vrstvě opěrných zdí, která jde také do DXF a DWG). 3D pohled ukazuje zdi jako tělesa (Zobrazit › Opěrné zdi) a exporty GLB, OBJ a USD je zahrnují. Řezy přes hranu ukazují schod.

**Varování** (ve Vlastnostech a v panelu Problémy): zeď vyšší než **Varovat nad výškou zdi** (zpočátku 1.0 m nebo 3.3 ft) hlásí "může být potřeba projektovaná zeď nebo povolení; zkontrolujte místní předpisy", a když napíšete **Nejstrmější sklon, který půda drží**, hlásí se každá strana, jejíž sklon zářezu nebo násypu je strmější. Jsou to varování: urovnání se stále postaví. Každá změna je jeden krok pro {{key:Mod+Z}}.

## Posun rohů

Vyberte plošinu a přetáhněte čtvercový úchyt u rohu. Každé přetažení je jeden krok zpět. Přidání nebo odebrání rohu zatím není k dispozici: smažte plošinu a nakreslete ji znovu.

## Když se neurovná

Červený rámeček pod **Zemní práce** pojmenuje plošinu a problém:

| Zpráva | Co dělat |
|---|---|
| "3 čáry svahu vyběhnou z povrchu, než se s ním setkají: plošina je příliš blízko okraje povrchu nebo příliš vysoko/nízko." | Posuňte plošinu od okraje povrchu dovnitř, nebo přiveďte její výšku blíže k terénu. |
| "Čára napojení se křižuje sama se sebou (svahy z různých stran plošiny se do sebe zarážejí). Přetvořte plošinu nebo změňte sklony." | Typické pro úzké nebo tvaru L plošiny v hlubokém zářezu nebo vysokém násypu. Rozšiřte plošinu, vyrovnejte rozdíl, nebo zvyšte strmost sklonů. |
| "The pad outline crosses itself." (Obrys plošiny se křiží sám se sebou.) | Nakreslete rohy znovu postupně kolem plošiny. |

Plošina s problémem se vynechá z navrhovaného povrchu a z objemů, dokud se neopraví.

## Zobrazit výsledek

1. Pod **Zobrazení** nastavte **Povrch** na {{ui:Proposed (graded)}}.
   Vrstevnice nyní vedou rovně přes plošinu a sledují svahy až ke čáře napojení.
2. Najeďte ukazatelem na plošinu: stavový řádek ukáže výšky **Terén** a **Urovnaný**.
3. Přečtěte zářez a násyp pod **Zemní práce**; viz [Objemy zemních prací](topic:volumes).

Plošiny se urovnávají až po koridorech, v pořadí, v jakém byly nakresleny. Pozdější plošina nahradí cokoli dříve uvnitř své čáry napojení.

## Smazat plošinu

Vyberte ji a stiskněte {{key:Delete}} (na Macu Fn a delete), nebo klikněte na {{ui:Delete}}.

## Ještě není hotovo

Plošiny jsou rovné: svahové plošiny, čáry lomu s proměnným sklonem, terasy a urovnání na vzdálenost nebo výškový cíl zatím nejsou k dispozici. Viz [Ještě není hotovo](topic:not-built-yet).
