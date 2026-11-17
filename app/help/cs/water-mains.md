---
title: Vodovodní řady: tlaky, průtoky a požární průtok
summary: Nakreslete tlakovou síť uzlů, nádrží, vodojemů, potrubí, čerpadel a redukčních ventilů na plán; CivilCraft spočítá výšky, tlaky a průtoky (Hazen–Williams, smyčkové sítě), průtok dostupný pro požár a denní spotřebu. Laboratorní funkce; každý výsledek vyžaduje kontrolu inženýrem.
keywords: voda, vodovodní řad, rozvod vody, tlaková síť, tlakové potrubí, smyčková síť, hazen-williams, součinitel C, ztráta výšky, zbytkový tlak, požární průtok, hydrant, odběr, uzel, nádrž, vodojem, čerpadlo, křivka čerpadla, redukční ventil, prv, zpětný ventil, prodloužené období, epanet, inp, rychlost
from: df46bf6d
---

Vodovodní řady jsou tlakovou stranou lokality: potrubí, které je vždy plné, s vodou tlačenou nádrží, vodojemem nebo čerpadlem. CivilCraft počítá výšku a tlak na každém uzlu a průtok v každém potrubí, včetně smyčkových sítí, kde má voda víc cest. Je v laboratoři, dokud se kontroluje.

**Pouze pomocný výpočet.** Každé číslo vyžaduje kontrolu kvalifikovaným inženýrem: odpověď je jen tak dobrá jako odběry, výšky, velikosti potrubí a hodnoty drsnosti, které jste zadali, a model v ustáleném stavu nic neví o vodním rázu, jakosti vody ani o skutečném chování požárního čerpadla.

## Nakreslete síť

1. Pod **Povrch** › {{ui:Více}} zvolte {{ui:Vodovody…}}. Okno zůstane otevřené, zatímco pracujete na plánu.
2. Vyberte {{ui:Nádrž}} a klikněte na plán, kde je zdroj. Její výška začíná 100 ft (30 m) nad terénem; změňte ji ve Vlastnostech.
3. Vyberte {{ui:Uzel}} a klikněte na každé místo, kde se odebírá voda nebo kde se potrubí stýkají. Uzel převezme svou výšku z terénu; napište jinou ve Vlastnostech, chcete-li ji přepsat.
4. Vyberte {{ui:Potrubí}}, klikněte na uzel a pak na uzel, ke kterému se připojuje. Nástroj zůstává zapnutý pro další potrubí. {{ui:Čerpadlo}} a {{ui:Redukční ventil}} se kreslí stejně, od sacího (nebo horního) uzlu k výtlačnému (nebo dolnímu) uzlu. {{ui:Vodojem}} se umisťuje jako uzel.
5. Vyberte uzel a zadejte jeho {{ui:Odběr}} (gpm, nebo L/s v projektu v metrech). Vyberte potrubí a nastavte jeho {{ui:Průměr}} (in, nebo mm) a, pokud ji znáte, jeho součinitel Hazen–Williams C.

Každá změna je jeden krok zpět. Delete odstraní uzel a potrubí, která v něm končí.

## Co znamená každá část

- **Potrubí.** Délka se měří podél plánu, pokud ji nezadáte. C je drsnost Hazen–Williams (výchozí 130; výchozí hodnotu změníte v okně). Součinitel místní ztráty K přidává ztráty ohybů a tvarovek. Zaškrtněte **Zpětný ventil** u potrubí, které nesmí vést vodu zpět; potrubí **Uzavřené** nevede nic.
- **Nádrž.** Zdroj s pevnou výškou, hladinou vody, kterou drží nad vztažnou rovinou. Dodává nebo odebírá, co síť potřebuje.
- **Vodojem.** Hladina, která se mění během dne. Ve výsledcích v ustáleném stavu je to zdroj na své aktuální hladině.
- **Čerpadlo.** Jeden návrhový bod (průtok a výška) dá obvyklou křivku jím: výška při nulovém průtoku je 133 % návrhové výšky a výška je nulová při dvojnásobku návrhového průtoku. Čerpadlo nikdy netlačí vodu zpět.
- **Redukční ventil.** Udržuje tlak, který nastavíte za ním, zatímco přívod je vyšší. Když je přívod nižší, je otevřen a nic nedrží; pokud by voda tekla zpět, uzavře se.

## Čtení výsledků

Okno ukazuje výšku a tlak každého uzlu a průtok, rychlost a ztrátu výšky na 1,000 ft (nebo na km) každé spojnice; uzly na plánu jsou obarvené: zelená je mezi nejnižším a nejvyšším tlakem, červená pod ním, oranžová nad ním. Šipky ukazují směr průtoku. Vyberte uzel nebo potrubí a přečtěte jeho čísla ve Vlastnostech.

Pod tabulkami je seznam toho, na co se dívat: nízký nebo vysoký tlak, potrubí rychlejší než vaše limity, uzel odříznutý od všech zdrojů, nebo řešič, který se neustálil. Stejná zjištění jsou v panelu Problémy. Limity nastavíte v okně (zpočátku 20 psi, 100 psi a 10 ft/s; 140 kPa, 700 kPa a 3 m/s v projektu v metrech).

## Požární průtok

{{ui:Požární průtok…}} nakreslí průtok na jednom uzlu a ukáže tlak tam a nejnižší tlak kdekoli v síti. Také zjistí průtok dostupný na tomto uzlu, zatímco nejslabší uzel v síti udržuje zbytkový tlak, který zadáte. Ostatní odběry zůstávají beze změny.

## Denní spotřeba

{{ui:Denní spotřeba…}} spustí síť hodinu po hodině. Zadejte vzor odběru v nastavení souboru (seznam násobitelů, který se opakuje); vodojemy se plní a vyprazdňují podle přítoku a odtoku a čerpadlo může následovat vzor zapnuto/vypnuto. Vodojem, který dosáhne nejvyšší nebo nejnižší hladiny, je v seznamu uveden jménem: CivilCraft za vás jeho přítok ani odtok nezavírá, takže to čtěte jako "tento vodojem je příliš malý, nebo čerpadlo příliš velké".

## Text EPANET

{{ui:Uložit jako text EPANET (.inp)}} zapíše síť ve formátu prostého textu, který čte mnoho vodohospodářských programů, a {{ui:Otevřít text EPANET (.inp)…}} jeden takový přečte. Přenese se jen to, co CivilCraft modeluje: uzly, nádrže, vodojemy, potrubí, čerpadla s křivkou výšky, redukční ventily, vzory odběru a časy. Jiné typy ventilů, čerpadla zadaná výkonem a jiné vzorce ztrát se pojmenují a vynechají. Soubor musí používat stejné jednotky jako projekt.

## Hydranty, ventily a tvarovky

Vyberte uzel a zaškrtněte **Hydrant**, abyste tam jeden umístili; vyberte řad a stiskněte **Přidat doprostřed**, abyste na něj dali ventil, odvzdušňovací ventil, vypouštění nebo vodoměr. Jsou to objekty sítě: pohybují se s ní a jeden krok zpět je odstraní.

Rozvržení také naznačuje tvarovky a CivilCraft je vypíše, aniž byste o to žádali: **T-kus**, kde se stýkají tři řady, **křížení**, kde se stýkají čtyři, **koleno** (s úhlem), kde se dvě řady stáčejí o 5° nebo víc, **redukce**, kde se stýkají dvě velikosti, a **zátka** na slepém konci. {{ui:Rozpis tvarovek (CSV)}} je spočítá a spočítá řady podle velikosti. Jde o to, co rozvržení naznačuje: výkaz k ověření proti vašim vlastním detailům, ne seznam k objednání.

Řady se kladou pod terén minus krytí (4 ft nebo 1.2 m), aby je šlo nakreslit a modelovat ve 3D; výše uvedené tlaky na tom nikdy nezávisí.

## Na plánu a v souborech

Plán, PDF a DWG nebo DXF nesou řady na **C-WATR-MAIN** s jejich velikostmi na **C-WATR-TEXT**, hydranty na **C-WATR-HYDR**, ventily na **C-WATR-VALV** a tvarovky na **C-WATR-FITT**. Export LandXML zapisuje vodovodní síť (objekt pro každý uzel, potrubí pro každou řadu, hydranty pojmenované); import LandXML ji čte zpět jako vodovodní řady, bez odběrů, čerpadel a ventilů, které LandXML nepřenáší. Export IFC zapisuje řady jako segmenty potrubí, hydranty, ventily a tvarovky v jednom vodovodním systému. Tyto soubory byly ověřeny proti našim vlastním čtečkám a zápisům; zkuste je v ostatních programech a dejte nám vědět, co v nich je.

## Co zatím není

Kvalita a stáří vody, řízení a pravidla nad rámec vzoru zapnuto/vypnuto čerpadla, jiné typy ventilů, odběr podle tlaku, potrubí s proměnlivým průměrem a průtoky v kanalizaci v čase. Viz [Zatím neexistuje](topic:not-built-yet). Návrhové průtoky splaškové kanalizace, což je jiný výpočet, jsou v [Návrhové splaškové průtoky](topic:sanitary-design).
