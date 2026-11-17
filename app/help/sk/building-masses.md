---
title: Kreslenie hmôt budov na lokalite
summary: Nakreslite hmotu budovy na parcele, určte jej podlažia a výšku podlažia, pozrite si jej hrubú podlahovú plochu, zvoľte, ako sedí na svahovitom teréne, potiahnite jej výšku v 3D a pošlite ju BimCraftu alebo uložte ako súbor IFC.
keywords: hmota, hmotová štúdia, hmota budovy, objem, pôdorys, podlažia, výška podlažia, hrubá podlahová plocha, GFA, sklon, podstavec, výkop a násyp, potiahnuť a tlačiť, 3D, štúdia lokality, predbežný návrh, IFC, rozpracovať, BimCraft, A-MASS
from: e5a67c16
---

Hmota budovy je pôdorys, počet podlaží a výška podlažia: včasná otázka „koľko budovy sa sem zmestí a čo to urobí so terénom“. Hmoty sú na pôdoryse s názvom, počtom podlaží a hrubou podlahovou plochou, idú do PDF výstupu a do exportov DWG a DXF na vrstvách `A-MASS` a `A-MASS-TEXT` a sú uložené v súbore projektu.

## Nakreslenie hmoty

1. V **Vlastnostiach**, pod **Hmoty budov**, kliknite na **Nakresliť hmotu**. (Je aj v ponuke **Ďalšie** na paneli nástrojov vedľa **Povrch**.)
2. Klikajte na rohy pôdorysu. Kliknutie blízko rohu parcely alebo geodetického bodu prevezme presné miesto tohto bodu.
3. Kliknite znova na prvý roh, alebo stlačte {{key:Enter}}, aby ste dokončili. {{key:Backspace}} vráti posledný roh; {{key:Esc}} zastaví kreslenie.

Nová hmota má tri podlažia a výšku podlažia 12 ft (3.6 m) a patrí parcele, v ktorej leží jej stred.

## Podlažia, výška a plocha

Kliknite na hmotu, aby ste zmenili jej **Názov**, **Použitie**, **Podlažia**, **Výšku podlažia** a **Parcelu**. **Výška** je počet podlaží krát výška podlažia: zadajte výšku a počet podlaží sa nastaví na najbližší celý počet podlaží (najmenej jedno). **Pôdorys** a **Hrubá podlahová plocha** (pôdorys krát podlažia) sa vypočítajú za vás.

## Na svahovitom teréne

Terén pod hmotou sa berie z povrchu: jestvujúci terén, alebo upravený terén, ak ste zvolili **Navrhovaný terén (upravený)**. **Na svahovitom teréne** určuje, kde leží prízemie:

- **Stupňovite**: na priemernom teréne pod pôdorysom. Nízka strana sa zasype až k nemu a vysoká sa vyreže, a obe sa približne vyrovnajú.
- **Podstavec**: na najvyššom teréne. Plný podstavec zasype nízku stranu.
- **Výkop**: na najnižšom teréne. Vysoká strana sa odstráni do svahu.

Vlastnosti ukazujú rozsah terénu pod hmotou, **Úroveň prízemia** a objem násypu a výkopu medzi terénom a touto úrovňou. Miesto pôdorysu, ktoré je mimo povrchu, sa vynechá a Vlastnosti povedia, koľko ich bolo.

## V 3D pohľade

Hmoty sú vykreslené v 3D pohľade lokality, s čiarou okolo každého podlažia a ich názvami nad strechou. **Zobraziť** má políčko pre **Hmoty budov**. Kliknutím na hmotu ju označíte. Keď je hmota označená:

- potiahnite jej strechu nahor alebo nadol, aby ste ju posunuli po jednom podlaží, alebo stlačte {{key:PageUp}} a {{key:PageDown}};
- celý presun je jeden krok späť.

Ulicový pohľad **Jazda** tiež vidí hmoty a **Slnko** vrhá ich tiene na terén.

## Odoslanie ďalej

- **Hmoty ako IFC** uloží každú hmotu ako súbor IFC4: lokalitu, budovu s jej podlažiami a hmotu ako prvok budovy s jej číslami v sade vlastností `CadCraft_SiteMass`. Ak je v projekte nastavený súradnicový systém, súbor sa umiestni na mapu a nesie zemepisnú šírku a dĺžku lokality; bez neho nehovorí nič o tom, kde sa nachádza.
- **Rozpracovať v BimCraft** otvorí BimCraft v novej karte s hmotami. Tam výber hmoty ukáže jej čísla a **Rozpracovať túto hmotu**, ktorá z pôdorysu postaví steny na každej úrovni a podlahu pod budovou, v jednom kroku späť. Nič sa nenahráva: súbor prechádza medzi dvoma kartami tohto prehliadača.

Pozrite tiež **Limity územného plánu** a **Slnečné hodiny**.
