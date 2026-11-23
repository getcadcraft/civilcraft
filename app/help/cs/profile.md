---
title: Navržení vertikálního profilu
summary: Otevřete pohled na profil, založte návrhový profil od terénu, přidávejte a táhněte PVI, nastavujte délky vertikálních oblouků a čtěte spády, hodnoty K a vysoké a nízké body.
keywords: profil, vertikální osa, pvi, vertikální oblouk, podélný spád, hodnota k, vrchol, údolí, bvc, evc, pohled na profil, navržený terén, fg, profil stávajícího terénu, konstrukční čáry v profilu, křížení, promítnuto, obrubník, příkop, popisky
from: dbb1f32d
---

Každá osa trasy má jeden návrhový profil: seznam PVI (staničení a výška) spojených přímými spády, s symetrickým parabolickým vertikálním obloukem v každém vnitřním PVI, který má délku. Profil stávajícího terénu se pro vás odebere z povrchu.

## Otevření pohledu na profil

1. Vyberte osu trasy (klikněte na ni nástrojem {{ui:Výběr}}).
2. Stiskněte {{key:R}}, nebo klikněte na {{ui:Profil}} na panelu nástrojů, nebo na {{ui:Pohled na profil}} dole v pravém panelu.
   Pohled na profil se otevře pod půdorysem a ukáže stávající terén podél osy trasy. Při dvou nebo více osách vyberte jednu v seznamu vlevo na liště profilu.

Pohled se nejdřív ukáže celou osou trasy a výšky roztáhne tak, aby vyplnily panel; zvětšení se vypíše vlevo dole, například "Vertikální zvětšení 10×".

## Zoom a posun profilu

- **Zoom:** otočte kolečkem myši (nebo stiskněte na touchpadu) a pohled se přibližuje k ukazateli. Podržte {{key:Shift}} pro zoom jen staničení, nebo {{key:Alt}} pro zoom jen výšek (to mění zvětšení). Je-li pohled na profil zaměřen, přibližují klávesy plus a minus ke středu.
- **Posun:** táhněte pravým nebo prostředním tlačítkem myši, nebo přejeďte dvěma prsty na touchpadu.
- **Přizpůsobit:** dvojklikem na profil nebo stiskem {{key:F}} zobrazíte celou osu trasy znovu.

Úprava PVI zachová zvolený zoom; neskočí zpět na přizpůsobení.

Přejeďte ukazatelem podél profilu: lišta ukazuje staničení, výšky terénu a návrhu, spád a výkop nebo násyp v tom místě, a tečka sleduje osu trasy v půdorysu.

## Založení návrhového profilu

1. V pravém panelu v části **Návrhový profil** klikněte na {{ui:Začít z terénu}}.
   Dvě PVI se umístí na terén na obou koncích osy trasy a spojí se jedním přímým spádem. Stavový řádek hlásí "Návrhový profil začal na terénu na obou koncích. Zapněte Přidat PVI a klikáním přidávejte zlomy spádu; v tabulce jim zadejte délku oblouku."

Pokud osa trasy nekříží povrch, zobrazí se "Pod touto osou trasy není terén, od kterého by se dalo začít." Pak přidejte PVI klikáním (další oddíl).

## Přidání PVI

1. Stiskněte {{key:I}}, nebo klikněte na {{ui:Přidat PVI}} na liště profilu. Zůstane stisknuté.
2. Klikněte v profilu tam, kde chcete zlom spádu. PVI se přidá v tom staničení a výšce, zaokrouhlené na 0.01, a označí se.
3. Přidejte kolik potřebujete, potom stiskněte {{key:I}} znovu a přidávání ukončete.

Klik na místo, kde už PVI je, se odmítne ("Na tomto místě už je PVI …"). PVI vždy zůstávají v pořadí staničení.

## Přichycení při přidávání nebo tažení

Tlačítko **Přichycení** na liště profilu je na začátku zapnuto. Dokud je zapnuto, PVI, které přidáte nebo táhnete, dosedne na nejbližší PVI, bod terénu, staničení PVI nebo čáru terénu, a popisek u značky řekne, který. Podržte {{key:Alt}} pro volný bod, kdekoli.

## Úprava PVI

- **Táhněte** PVI v profilu, abyste ho přesunuli. Nemůže přejít svého souseda. Přesun je jeden krok zpět.
- **Zadejte** přesné hodnoty v tabulce PVI v pravém panelu: **Staničení**, **Výška**, **Sklon %** a **Oblouk L** (délka vertikálního oblouku). Po každé stiskněte {{key:Enter}}.
- **Vyberte** hodnotu z profilu: malé tlačítko vedle staničení nebo výšky PVI počká na jeden klik v pohledu na profil a hodnotu vyplní. Klik se přichytí jako u Přidat PVI; podržte {{key:Alt}} pro volný bod; {{key:Esc}} zruší.
- **Sklon %** je spád tečny, která začíná v tomto PVI a vede k dalšímu. Jeho zadání posune výšku **dalšího** PVI (jeho staničení se nikdy nehýbe). Je-li další PVI zamčené, posune se místo toho výška předchozího PVI.
- **Zamkněte** PVI visacím zámkem na konci jeho řádku. Zamčené PVI se netáhne a úprava sklonu ho nepřesune. Jsou-li zamčeny oba konce tečny, její sklon se nedá změnit: stavový řádek to hlásí a nejdřív odemkněte jeden konec. Zámek se uloží do souboru.
- **Odeberte** PVI křížkem na konci jeho řádku, nebo ho vyberte (klikněte) a stiskněte {{key:Delete}}. Je-li pohled na profil zaměřen, odebere je také {{key:Backspace}}.

První a poslední PVI nikdy nedostanou oblouk.

## Vertikální oblouky

1. Zadejte délku do **Oblouk L** u vnitřního PVI, například 200.
2. Oblouk se nakreslí se středem na PVI. Profil a pravý panel ukážou jeho druh (vrcholový, nebo údolní), L a K, staničení a výšky BVC a EVC a jeho vysoký nebo nízký bod, pokud leží uvnitř oblouku.

K se počítá z L (K = L děleno algebraickým rozdílem spádů v procentech). Zadáváte L; zadat K přímo zatím nejde.

Pokud se vertikální oblouk nevejde, červený rámeček řekne proč: zasahuje zpět do PVI nebo oblouku před ním, nebo přes další PVI, a kolik místa je na té straně (oblouk potřebuje polovinu své délky na každé straně svého PVI). Jeho tlačítko nastaví **nejdelší oblouk, který se vejde**, s jeho K, jako jeden krok ({{key:Mod+Z}} to vrátí zpět). Nebo PVI od sebe odsuňte.

## Čtení údajů

Pod tabulkou PVI seznam uvádí každý spád v procentech ("Spád 1: +1.25%") a každý oblouk, například "Vrcholový oblouk při 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", potom "Vysoký bod 1+62.40, 254.12".

Pokud PVI nedosahují obou konců osy trasy, poznámka to řekne. Koridor se staví jen tam, kde se profil a osa trasy překrývají.

## Konstrukční čáry v profilu

Konstrukční čáry se zobrazují i v pohledu na profil, takže vidíte obrubník, příkop nebo horní hranu zdi proti profilu silnice.

- Kde konstrukční čára **kříží** osu trasy, profil ukáže malý kosočtverec v tom staničení a výšce, popsaný názvem čáry a její výškou v tom místě (vlastní výška čáry, vypočtená podél úseku, který kříží).
- Zadejte vzdálenost do {{ui:Podél v okruhu}}, aby se nakreslily i konstrukční čáry, které **vedou podél** osy trasy v té vzdálenosti, čárkovaně ve svých vlastních výškách. Prázdné nebo 0 ukáže jen křížení.
- Značky a popisky sledují každou změnu: posuňte vrchol, zadejte spád nebo zvedněte čáru a profil ukáže nové výšky hned.
- Kliknutím na kosočtverec křížení vyberete tuto konstrukční čáru; vybraná čára se kreslí zvýrazněnou barvou.
- {{ui:Konstrukční čáry}} na liště profilu všechny skryje nebo zobrazí. Obě nastavení se uloží s projektem.

Viz [Konstrukční čáry](topic:feature-lines).

## Dále

- [Protáhněte silniční koridor](topic:corridor) podél osy trasy a tohoto profilu.
- Profil se zapíše do LandXML spolu s osou trasy; viz [Výměna LandXML](topic:landxml).
