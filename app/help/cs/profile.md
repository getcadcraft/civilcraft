---
title: Návrh výškového profilu
summary: Otevřete pohled na profil, začněte návrhový profil od terénu, přidávejte a přesouvejte PVI, nastavujte délky výškových oblouků a čtěte sklony, hodnoty K a nejvyšší a nejnižší body.
keywords: profil, výškové vedení, PVI, výškový oblouk, sklon, hodnota K, hřbet, údolí, pohled na profil, konečný návrhový terén, fg, profil existujícího terénu, konstrukční čáry v profilu, křížení, promítnuto, obrubník, příkop, popisky
from: e9182bfa
---

Každá osa trasy má jeden návrhový profil: seznam PVI (staničení a výška) spojených přímými sklony, s symetrickým parabolickým výškovým obloukem v každém vnitřním PVI, které má délku. Profil existujícího terénu se vzorkuje z povrchu za vás.

## Otevření pohledu na profil

1. Vyberte osu trasy (klikněte na ni pomocí {{ui:Výběr}}).
2. Stiskněte {{key:R}}, klikněte na {{ui:Profil}} v panelu nástrojů, nebo na {{ui:Pohled na profil}} dole na pravém panelu.
   Pohled na profil se otevře pod půdorysem s terénem podél osy. Při dvou nebo více osách vyberte jednu v seznamu vlevo na liště profilu.

Pohled vždy ukazuje celou osu a roztáhne výšky tak, aby vyplnily panel. Zvětšení se vypíše v levém dolním rohu, například „Svislé zvětšení 10×“. Pohled nelze přibližovat ani posouvat.

Pohybujte kurzorem podél profilu: lišta ukáže staničení, výšky terénu a návrhu, sklon a výkop nebo násyp v daném místě a bod se pohybuje po ose v půdorysu.

## Začátek návrhového profilu

1. V pravém panelu v části **Návrhový profil** klikněte na {{ui:Začít z terénu}}.
   Dvě PVI se umístí na terén na obou koncích osy a spojí se jedním přímým sklonem. Stavový řádek hlásí: „Návrhový profil začal od terénu na obou koncích. Zapněte {{ui:Přidat PVI}} a klikáním přidávejte zlomy sklonu; v tabulce jim nastavte délku oblouku.“

Pokud osa neprotíná povrch, zobrazí se: „Pod touto osou není terén, od kterého by bylo možné začít.“ Pak přidejte PVI klikáním (v další části).

## Přidání PVI

1. Stiskněte {{key:I}}, nebo klikněte na {{ui:Přidat PVI}} na liště profilu. Tlačítko zůstane stisknuté.
2. Klikněte do profilu tam, kde chcete zlom sklonu. PVI se přidá na toto staničení a výšku, zaokrouhlené na 0.01, a bude vybráno.
3. Přidejte, kolik potřebujete, a pak znovu stiskněte {{key:I}}, abyste přidávání zastavili.

Klik na místo, kde už PVI je, se odmítne („Už je PVI v …“). PVI vždy zůstávají v pořadí podle staničení.

## Úprava PVI

- **Přetáhněte** PVI v profilu, abyste ho přesunuli. Nemůže přejít svého souseda. Přesun je jeden krok zpět.
- **Napište** přesné hodnoty do tabulky PVI v pravém panelu: **Staničení**, **Výška** a **Oblouk L** (délka výškového oblouku). Po každé stiskněte {{key:Enter}}.
- **Odstraňte** PVI křížkem na konci jeho řádku, nebo ho vyberte (kliknutím) a stiskněte {{key:Delete}}. Když má pohled na profil fokus, odstraní PVI i {{key:Backspace}}.

První a poslední PVI nikdy nemají oblouk.

## Výškové oblouky

1. Zadejte délku do pole **Oblouk L** u vnitřního PVI, například 200.
2. Oblouk se nakreslí se středem na PVI. Profil a pravý panel ukážou jeho druh (hřbet nebo údolí), L a K, staničení a výšky BVC a EVC a jeho nejvyšší nebo nejnižší bod, pokud v oblouku leží.

K se počítá z L (K = L dělené algebraickým rozdílem sklonů v procentech). Zadáváte L; zadat K přímo zatím není k dispozici.

Pokud se výškový oblouk nevejde, červené pole vysvětlí proč: zasahuje zpět do předchozího PVI nebo oblouku, nebo přes další PVI, a také ukáže, kolik místa je na dané straně (oblouk potřebuje polovinu své délky na každé straně svého PVI). Jeho tlačítko nastaví **nejdelší oblouk, který se vejde**, s jeho K, jako jeden krok ({{key:Mod+Z}} to vrátí zpět). Nebo PVI od sebe oddalte.

## Čtení údajů

Pod tabulkou PVI je seznam, který uvádí každý sklon v procentech („Sklon 1: +1.25%“) a každý oblouk, například „Hřbet na 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, a pak „Nejvyšší bod 1+62.40, 254.12“.

Pokud PVI nedosahují na oba konce osy, poznámka to uvede. Koridor se vytváří jen tam, kde se profil a osa překrývají.

## Konstrukční čáry v profilu

Konstrukční čáry se zobrazují i v pohledu na profil, takže vidíte obrubník, příkop nebo horní hranu zdi vůči profilu silnice.

- Kde konstrukční čára **protíná** osu, profil ukáže malý kosočtverec v tomto staničení a výšce, s popiskem názvu čáry a její výšky v tomto místě (vlastní výška čáry, spočítaná podél úseku, který protíná).
- Zadejte vzdálenost do {{ui:Podél v okruhu}}, abyste nakreslili i konstrukční čáry, které **běží vedle** osy v této vzdálenosti, jako přerušované čáry na jejich vlastní výšce. Prázdné nebo 0 ukáže jen křížení.
- Popisky a značky sledují každou změnu: přesunete-li vrchol, zadáte-li sklon nebo čáru zvednete, profil ukáže nové výšky hned.
- Kliknutím na kosočtverec křížení vyberete tuto konstrukční čáru; vybraná čára se vykreslí zvýrazněnou barvou.
- {{ui:Konstrukční čáry}} na liště profilu všechny skryjí nebo zobrazí. Obě nastavení se uloží se projektem.

Viz [Konstrukční čáry](topic:feature-lines).

## Dále

- Vytáhněte [koridor silnice](topic:corridor) podél osy a tohoto profilu.
- Profil se zapisuje do LandXML spolu s osou; viz [Výměna LandXML](topic:landxml).
