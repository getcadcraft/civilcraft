---
title: Konstrukční čáry
summary: Kreslete 3D čáry, které stupňujete vrchol po vrcholu, vytvářejte z nich odstupňovaná odsazení a používejte je jako lomové hrany terénu nebo jako svažité plošiny v návrhu.
keywords: oblouk, křivka, poloměr, 3D oblouk, šroubovice, zakřivená obruba, překryv spádu, překryv výšek, šipky spádu, konstrukční čára, spád, sklon, výška, odstupňované odsazení, odsazení, lomová hrana, obruba, příkop, berma, svažitá plošina, odkryv, terénní úpravy, 3D mnohočára
from: d55b25fb
---

Konstrukční čára je čára s výškou v každém vrcholu: obruba, dno příkopu, horní hrana bermy, hrana svažité plošiny. Výšky nastavíte číslem nebo spádem, zkopírujete ji stranou s krokem nahoru nebo dolů a vyberete, co s ní povrchy dělají.

## Nakreslení

1. Zvolte **Povrch** › {{ui:Více}} › {{ui:Konstrukční čára}}, nebo stiskněte {{key:L}}.
2. Klikněte na její vrcholy v půdorysu. Kliknutí na zaměřovací bod převezme jeho místo a výšku; jinde vrchol převezme výšku stávajícího terénu v tom místě.
3. Stiskněte {{key:Enter}} pro dokončení otevřené čáry, nebo klikněte znovu na první vrchol pro její uzavření.

Nová čára je vybrána a začíná jako lomová hrana stávajícího terénu, ležící na terénu.

## Oblouky

Segment může být v půdorysu obloukem, jehož konce leží v různých výškách: zakončení obruby, zakřivený příkop, rampa, která zatáčí. Její spád běží rovnoměrně po oblouku a její délka se měří podél křivky.

- **Při kreslení:** stiskněte {{key:C}} (na dotykové obrazovce {{ui:Oblouk}} na panelu nad půdorysem), aby se oblouky zapnuly. Po vrcholu klikněte na bod na křivce, potom klikněte, kde oblouk končí. Pro rovné segmenty stiskněte {{key:C}} znovu. {{key:Backspace}} nejdřív odstraní bod na křivce.
- **Dodatečně:** v **Vlastnostech** napište do pole **Oblouk** vrcholu poloměr a směr zatáčení, například `50 L` nebo `50 R` (vlevo nebo vpravo, když jdete po čáře), a stiskněte {{key:Enter}}. Vyprázdněním pole se segment zase narovná. Poloměr menší než polovina segmentu je odmítnut.

Vybraná čára ukazuje poloměr každého oblouku vedle jeho spádu. **Délka** je podél oblouků v půdorysu; **3D délka** počítá i stoupání a klesání. Odstupňovaná odsazení oblouky zachovávají: oblouk na vnější straně zatáčky roste, na vnitřní se zmenšuje, a odsazení přes střed oblouku je odmítnuto.

Povrchy, 3D pohled, DXF a DWG převezmou každý oblouk jako krátké rovné kusy, které zůstanou v toleranci 0,01 od křivky. LandXML je zachovává jako oblouky (viz níže **Oblouky v jiných souborech**).

## Nastavení výšek a spádů

**Vlastnosti** vypisují vrcholy s jejich vzdáleností podél čáry, jejich **Výškou** a **Spádem k dalšímu** (v procentech). Napište buď, a stiskněte {{key:Enter}}:

- Výška posune jen tento vrchol.
- Spád nastaví výšku na vzdáleném konci jeho segmentu; vrcholy za ním zůstanou, kde jsou, takže se změní spád dalšího segmentu.

Také ve **Vlastnostech**:

| Akce | Co dělá |
|---|---|
| **Zvednout nebo snížit vše o** | Přidá každému vrcholu výšku, kterou napíšete. |
| {{ui:Výšky z terénu}} | Vrátí každý vrchol zpět na stávající terén (vrcholy mimo povrch si zachovají svou výšku a jsou vypsány). |
| {{ui:Jeden spád, od prvního k poslednímu}} | Zachová první a poslední výšku a vrcholy mezi nimi položí na jeden rovnoměrný spád. |

Vybraná čára ukazuje své výšky ve vrcholech a své spády podél segmentů v půdorysu. Vrchol přetáhnete pomocí {{ui:Výběr}}; jeho výška zůstane.

## Odstupňovaná odsazení

Pod **Odstupňované odsazení** napište **Vzdálenost** (kladná napravo od směru čáry, záporná nalevo), potom výšku (nahoru nebo dolů o) nebo spád v procentech, a klikněte na {{ui:Vytvořit odsazenou čáru}}. Kopie je nová konstrukční čára: například zadní strana obruby 0,5 ft stranou a o 0,5 ft výše, nebo hrana příkopu 6 ft ven při 2 %. Vzdálenost, která by kopii přeložila přes sebe v ostré zatáčce, je odmítnuta.

## Spády a výšky na obrazovce

Stiskněte {{key:E}}, nebo zaškrtněte **Spády a výšky na konstrukčních čarách** v části Zobrazení, abyste viděli spád každé konstrukční čáry podél každého segmentu (s malou šipkou ukazující z kopce) a její výšku ve vrcholech. Zobrazují se jen na obrazovce: do výkresu se nic nepřidává a PDF, DXF a DWG zůstávají beze změny. Krátké segmenty a nahuštěné vrcholy zůstanou bez popisků, dokud nepřiblížíte. Vybraná čára vždy ukazuje své vlastní spády a výšky.

## V pohledu na profil

Konstrukční čára, která protíná osu trasy, se zobrazí v pohledu na profil této osy, se svým názvem a výškou v místě průsečíku; čáry vedle ní lze zobrazit také. Viz [Návrh podélného profilu](topic:profile).

## Co s ní povrchy dělají

Zvolte **Použití**:

| Použití | Co se stane |
|---|---|
| Lomová hrana stávajícího terénu | Stávající terén prochází čárou ve svých výškách, jako nakreslená lomová hrana. |
| Upraveno do návrhu | **Uzavřená** čára se stane svažitou plošinou: navrhovaný povrch uvnitř ní je upraven k jejímu okraji. Zapněte **Odkryv k terénu**, aby se od jejího okraje k terénu vedly svahy zářezu a násypu (vodorovně k svisle 1), jako u plošiny; každý svah začíná u vlastní výšky hrany v tom místě. |
| Pouze nakreslená | Zůstává na půdorysu a jde do DXF, DWG a PDF (vrstva C-GRAD-FEAT, 3D mnohočáry), ale povrchy ji ignorují. |

Objemy, řezy a 3D pohled zahrnují konstrukční čáry upravené do návrhu, stejně jako plošiny. Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí zpět.

## Sdílení čar s týmem

V nákresu otevřeném z vašich cloudových souborů v CadCraft Studio, v týmovém tarifu, má Vlastnosti projektu (bez výběru) sekci **Tým** s {{ui:Čáry týmu…}}: čáry, které váš tým sdílí, každá s revizí, bez nutnosti nejdřív vybrat konstrukční čáru. Vyberte čáru pro sdílení, odešlete novou revizi, stáhněte tu týmovou, nebo sdílení ukončete. Mimo toto nastavení sekce uvede, co potřebuje.

## Oblouky v jiných souborech

| Soubor | Co se stane s konstrukční čárou s oblouky |
|---|---|
| Projekt CivilCraft | Zachová se přesně. |
| LandXML | Zapíše se jako půdorysný prvek konstrukční čáry z přímek a oblouků s jejich výškami a načte se zpět s oblouky. Konstrukční čára z jiného programu se načte jako **Pouze nakreslená**: zvolte její **Použití**, aby byla v povrchu. |
| DWG a DXF | 3D mnohočára nemůže obsahovat oblouk, takže se čára zapíše jako krátké kusy v toleranci 0,01 od každého oblouku. CivilCraft také zaznamenává do výkresu, které kusy byly oblouky: když výkres otevřete jako linie, {{ui:Konstrukční čáry}} vrátí čáry zpět jako konstrukční čáry i s jejich oblouky. Jiné programy vidí obyčejnou 3D mnohočáru. |
