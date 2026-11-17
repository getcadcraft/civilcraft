---
title: Kreslení hmot budov na lokalitě
summary: Nakreslete hmotu budovy na parcelu, dejte jí podlaží a výšku podlaží, zjistěte její hrubou podlahovou plochu, zvolte, jak sedí na svažitém terénu, tlačte a tahejte její výšku ve 3D a pošlete ji do BimCraftu nebo uložte jako soubor IFC.
keywords: hmota, hmotová studie, hmota budovy, objem, půdorys, podlaží, výška podlaží, hrubá podlahová plocha, GFA, sklon, podium, výkop a násyp, tlačení a tahání, 3D, studie lokality, časný návrh, IFC, rozpracovat, BimCraft, A-MASS
from: e5a67c16
---

Hmota budovy je půdorys, počet podlaží a výška podlaží: ta časná otázka „kolik budovy se sem vejde a co to udělá s terénem“. Hmoty leží v půdorysu se svým názvem, počtem podlaží a hrubou podlahovou plochou, jdou do PDF výkresu i do exportů DWG a DXF na vrstvy `A-MASS` a `A-MASS-TEXT` a ukládají se do souboru projektu.

## Nakreslení hmoty

1. Ve **Vlastnostech**, pod **Hmoty budov**, klikněte na **Nakreslit hmotu**. (Je také v nabídce **Další** na panelu nástrojů vedle **Povrch**.)
2. Klikejte na rohy půdorysu. Klik poblíž rohu parcely nebo geodetického bodu převezme přesné místo toho bodu.
3. Klikněte znovu na první roh, nebo stiskněte {{key:Enter}}, pro dokončení. {{key:Backspace}} vezme zpět poslední roh; {{key:Esc}} zastaví kreslení.

Nová hmota má tři podlaží a výšku podlaží 12 ft (3.6 m) a patří k parcele, do které spadá její střed.

## Podlaží, výška a plocha

Klikněte na hmotu a změňte její **Název**, **Využití**, **Podlaží**, **Výšku podlaží** a **Parcelu**. **Výška** je počet podlaží krát výška podlaží: zadejte výšku a počet podlaží se nastaví na nejbližší celé číslo (nikdy méně než jedno). **Půdorys** a **Hrubá podlahová plocha** (půdorys krát podlaží) se spočítají za Vás.

## Na svahu

Terén pod hmotou se čte z povrchu: stávající terén, nebo upravený terén, pokud jste zvolili **Navržený terén (upravený)**. **Na svahu** určuje, kam přijde přízemí:

- **Odstupňovaně**: na průměrném terénu pod půdorysem. Nízká strana se zasype až k němu a vysoká se odřízne; obě strany se téměř vyrovnají.
- **Podium**: na nejvyšším terénu. Plný základ vyplní nízkou stranu.
- **Výkop**: na nejnižším terénu. Vysoká strana se odříznutím zapustí do svahu.

Vlastnosti ukazují rozsah terénu pod hmotou, **Úroveň přízemí** a objem násypu a výkopu mezi terénem a touto úrovní. Místo půdorysu, které leží mimo povrch, se vynechá a Vlastnosti řeknou, kolik jich je.

## Ve 3D pohledu

Hmoty se kreslí v 3D pohledu lokality, s čarou kolem každého podlaží a jejich názvy nad střechou. **Zobrazit** má zaškrtávací políčko pro **Hmoty budov**. Kliknutím na hmotu ji vyberete. Když je hmota vybrána:

- přetáhněte její střechu nahoru nebo dolů, abyste ji posunuli nebo táhli vždy o jedno podlaží, nebo stiskněte {{key:PageUp}} a {{key:PageDown}};
- celý posun je jeden krok zpět.

Pohled ulice v **Jízdě** vidí hmoty také a **Slunce** vrhá jejich stíny na terén.

## Odeslání dál

- **Hmoty jako IFC** uloží každou hmotu jako soubor IFC4: lokalitu, budovu s jejími podlažími a hmotu jako prvek budovy s jejími čísly v sadě vlastností `CadCraft_SiteMass`. Je-li v projektu nastaven souřadnicový systém, soubor se umístí na mapu a nese zeměpisnou šířku a délku lokality; bez něj neříká nic o tom, kde se nachází.
- **Rozpracovat v BimCraftu** otevře BimCraft v nové záložce s hmotami. Tam výběr hmoty ukáže její čísla a tlačítko **Rozpracovat tuto hmotu**, které z půdorysu vytvoří stěny na každém podlaží a podlahu pod budovou, v jednom kroku zpět. Nic se nenahrává: soubor putuje mezi dvěma záložkami tohoto prohlížeče.

Viz také **Limity zónování** a **Hodiny slunečního svitu**.
