---
title: Sestavení a úprava povrchu
summary: Jak CivilCraft trianguluje stávající terén a jak ho tvarovat pomocí skupin lomových hran, nakreslených lomových hran, vnější hranice a nejdelší vnější hrany.
keywords: tin, povrch, triangulace, lomová hrana, hranice, stávající terén, eg, vytvořit povrch, delaunay, trojúhelníky, maximální hrana, vnější hranice
from: b9eea3f3
---

CivilCraft má jeden povrch stávajícího terénu na projekt. Je to TIN (nepravidelná trojúhelníková síť) sestavená z Vašich bodů a obnovuje se automaticky při každé změně vstupu. Příkaz „obnovit“ neexistuje a žádný povrch není zastaralý.

## Co vstupuje do povrchu

- Každý bod s výškou ve skupině nastavené na {{ui:Points}}.
- Každá skupina nastavená na {{ui:Breakline}}, spojená v pořadí čísel bodů.
- Každá lomová hrana, kterou nakreslíte nástrojem {{ui:Breakline}}.
- Vnější hranice, pokud ji nakreslíte.
- Nastavení **Nejdelší vnější hrana**.

Trojúhelníky nikdy nepřekročí lomovou hranu: povrch je k ní vynucen a poté co nejrovnoměrněji rozložen kolem ní (jinde Delaunay).

## Změňte kódované čáry na lomové hrany

1. V levém panelu pod **Body** najděte skupinu (například FL).
2. Nastavte její volbu **Povrch** na {{ui:Breakline}}.
   Povrch se přepočítá, čára se nakreslí oranžově (je-li zapnuto {{ui:Breaklines}} v **Zobrazení**) a údaj **Lomové hrany** v přehledu povrchu se zvýší o jedna.
3. Zkontrolujte čáru v půdorysu. Musí procházet bod po bodu v pořadí, v jakém byla zaměřena. Pokud se klikatí, skupina obsahuje víc čar nebo body nejsou očíslované v pořadí: vraťte skupinu na {{ui:Points}} a čáry nakreslete ručně (další oddíl).

## Nakreslete lomovou hranu přes body

1. Stiskněte {{key:B}}, nebo klikněte na {{ui:Breakline}} ve skupině **Povrch**.
   Nápověda říká „Lomová hrana: klikejte na geodetické body postupně (převezme jejich výšky). Enter dokončí.“
2. Přesuňte ukazatel blízko bodu. Malý oranžový čtvereček označí bod, který se převezme.
3. Klikejte na body čáry jeden po druhém. Každé kliknutí pojmenuje bod a jeho výšku ve stavovém řádku.
4. Stiskněte {{key:Enter}} pro dokončení.
   Stavový řádek hlásí „Lomová hrana 1 přidána; povrch byl přepočítán.“

Kliknutí musí dopadnout na geodetický bod s výškou; kliknutí jinde je odmítnuto hláškou „Klikněte na geodetický bod s výškou: lomová hrana převezme výšky bodů.“ {{key:Backspace}} odebere poslední bod; {{key:Esc}} zruší celou čáru.

:::warning
Dokončete klávesou {{key:Enter}}. Dvojklik také dokončí, ale v této verzi odstraní bod, na který jste dvakrát klikli. Klikněte na poslední bod jednou a pak stiskněte {{key:Enter}}.
:::

Chcete-li odebrat všechny nakreslené lomové hrany najednou, klikněte v oddílu **Povrch** na {{ui:Remove drawn breaklines}}. Chcete-li odebrat jen poslední, použijte {{key:Mod+Z}}. Nakreslené lomové hrany zatím nelze vybírat ani upravovat jednotlivě.

## Nakreslete vnější hranici

Hranice ořízne povrch na oblast, které důvěřujete, například na hranice zaměření, aby zmizely dlouhé trojúhelníky přes nezaměřené rohy.

1. Stiskněte {{key:O}}, nebo klikněte na {{ui:Boundary}}.
2. Klikejte na rohy v pořadí kolem oblasti. Čárkovaná čára ukazuje tvar.
3. Stiskněte {{key:Enter}}.
   Stavový řádek hlásí „Hranice nastavena; trojúhelníky mimo ni byly odstraněny.“ **Hranice** v přehledu povrchu ukazuje „Ano“ a počet rohů.

Co je dobré vědět:

- Je jen jedna hranice. Nakreslení další ji nahradí. {{ui:Remove the boundary}} ji odstraní.
- Hranice umí jen ubírat: hranice, která přesahuje body, se zkrátí na jejich obrys s poznámkou „Hranice přesahuje body; byla zkrácena na jejich obrys.“
- Její rohy přebírají výšky z povrchu, takže okraj přesně sleduje terén.
- Skryté (vnitřní) hranice zatím nejsou k dispozici.

## Oříznutí dlouhých vnějších trojúhelníků

Bez hranice povrch vyplní celý obrys bodů, včetně dlouhých úzkých trojúhelníků přes konkávní hrany.

1. V **Povrch** zadejte délku do **Nejdelší vnější hrana** a stiskněte {{key:Enter}}. Začněte přibližně dvojnásobkem až trojnásobkem své typické vzdálenosti měřených bodů.
2. Vnější trojúhelníky, jejichž vnější hrana je delší než tato hodnota, se odeberou; postupuje se dovnitř, dokud není každá vnější hrana dost krátká. Hrana, která je lomovou hranou, se nikdy neodloupne.
3. Zadejte 0, aby se všechny trojúhelníky znovu zachovaly.

## Přečtěte si zprávu o povrchu

Pod údaji o povrchu je pole, které vypisuje, co stavitel udělal. S okrovým pruhem vlevo jde o informaci; s červeným pruhem obsahuje chybu a povrch neexistuje.

| Hláška | Význam |
|---|---|
| „3 body byla na stejném místě jako jiné a připojila se k němu.“ | Body bližší než 0.0001 v půdorysu se stanou jedním vrcholem (první se zachová). |
| „2 místa mají dvě různé výšky …“ | Body ležící přes sebe nebo křížící se lomové hrany nesouhlasí ve výšce. Vyhraje výška lomové hrany, pak první. |
| „1 úsek lomové hrany nebylo možné vynutit do povrchu.“ | Velmi krátký nebo téměř překrývající se úsek lomové hrany se nevešel; zkontrolujte to místo. |
| „Povrch potřebuje alespoň tři body s výškou.“ | Příliš málo bodů: zkontrolujte pořadí sloupců a skupiny. |
| „Body leží všechna na jedné přímce: žádné trojúhelníky.“ | Body nemají šířku, například jediná polygonová čára. |
| „Hranice se nepřekrývá s body.“ | Hranice je jinde, často jde o záměnu jednotek nebo souřadnic. |
| „Uvnitř hranice nezůstal žádný trojúhelník.“ | Hranice je příliš malá nebo špatně umístěná. |

## Povrch načtený z LandXML

Když otevřete LandXML, použije se jeho první povrch TIN beze změny: nadpis **Povrch** říká „Povrch (z LandXML)“ a **Nejdelší vnější hrana** je šedá. Dokud je tento povrch používán, skupiny lomových hran, nakreslené lomové hrany ani nová hranice ho nezmění. Chcete-li povrch sestavit z bodů souboru, klikněte na {{ui:Rebuild the surface from the points}}. {{key:Mod+Z}} vrátí povrch z LandXML.

## Související

- [Čtení vrstevnic, výšek a sklonů](topic:contours).
- [Import geodetických bodů](topic:import-points).
