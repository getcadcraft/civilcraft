---
title: Vodovod: tlaky, prietoky a požiarny prietok
summary: Nakreslite tlakovú sieť uzlov, nádrží, vodojemov, potrubí, čerpadiel a redukčných ventilov na pláne; CivilCraft vypočíta výšky, tlaky a prietoky (Hazen–Williams, slučkové siete), prietok dostupný pre požiar a deň odberu. Laboratórna funkcia; každý výsledok vyžaduje kontrolu inžiniera.
keywords: voda, vodovod, rozvod vody, tlaková sieť, tlakové potrubie, slučková sieť, hazen-williams, súčiniteľ C, strata výšky, zvyškový tlak, požiarny prietok, hydrant, odber, uzol, nádrž, vodojem, čerpadlo, charakteristika čerpadla, redukčný ventil, PRV, spätný ventil, rozšírené obdobie, epanet, inp, rýchlosť
from: df46bf6d
---

Vodovod je tlaková stránka lokality: potrubia, ktoré sú vždy plné, a voda sa do nich tlačí z nádrže, vodojemu alebo čerpadla. CivilCraft vypočíta výšku a tlak v každom uzle a prietok v každom potrubí, vrátane slučkových sietí, kde má voda viac ciest. Funkcia je v laboratóriu, kým sa overuje.

**Len pomôcka na výpočty.** Každé číslo potrebuje kontrolu kvalifikovaného inžiniera: odpoveď je len taká dobrá, ako dopyty, výšky, veľkosti potrubí a hodnoty drsnosti, ktoré ste zadali, a model ustálenej situácie nevie nič o vodnom rázi, kvalite vody ani o skutočnom správaní požiarneho čerpadla.

## Nakreslite sieť

1. Pod **Povrch** › {{ui:Viac}} zvoľte {{ui:Vodovod…}}. Okno zostane otvorené, kým pracujete na pláne.
2. Vyberte {{ui:Nádrž}} a kliknite na plán, kde je zdroj. Jej výška začína 100 ft (30 m) nad terénom; zmeňte ju vo vlastnostiach.
3. Vyberte {{ui:Uzol}} a kliknite na každé miesto, kde sa odoberá voda alebo sa stretávajú potrubia. Uzol preberá výšku z terénu; zadajte inú vo vlastnostiach, ak ju chcete prepísať.
4. Vyberte {{ui:Potrubie}}, kliknite na uzol a potom na uzol, s ktorým sa spája. Nástroj zostane zapnutý pre ďalšie potrubie. {{ui:Čerpadlo}} a {{ui:Redukčný ventil}} sa kreslia rovnako, od sacieho (alebo horného) uzla k výtlačnému (alebo dolnému) uzlu. {{ui:Vodojem}} sa umiestňuje ako uzol.
5. Vyberte uzol a zadajte jeho {{ui:Odber}} (gpm, alebo L/s v projekte v metroch). Vyberte potrubie a nastavte jeho {{ui:Priemer}} (in, alebo mm) a, ak ho poznáte, jeho Hazen–Williams C.

Každá zmena je jeden krok späť. Delete odstráni uzol a potrubia, ktoré sa v ňom končia.

## Čo znamená každá časť

- **Potrubie.** Dĺžka sa meria pozdĺž plánu, pokiaľ ju nezadáte. C je drsnosť Hazen–Williams (130 na začiatok; predvolenú hodnotu zmeňte v okne). Súčiniteľ lokálnych strát K pridá straty ohybov a tvaroviek. Zaškrtnite **Spätný ventil** pre potrubie, ktoré nesmie viesť vodu späť; **Zatvorené** potrubie nič neprenáša.
- **Nádrž.** Zdroj s pevnou výškou, úroveň vody, ktorú drží nad referenčnou rovinou. Dodáva alebo odoberá, čo sieť potrebuje.
- **Vodojem.** Hladina, ktorá sa mení počas dňa. V ustálených výsledkoch je zdrojom na svojej aktuálnej úrovni.
- **Čerpadlo.** Jeden návrhový bod (prietok a výška) dá obvyklú charakteristiku: výška pri nulovom prietoku je 133 % návrhovej výšky a výška je nulová pri dvojnásobku návrhového prietoku. Čerpadlo nikdy netlačí vodu späť.
- **Redukčný ventil.** Drží tlak, ktorý nastavíte za ním, keď je prívod vyšší. Keď je prívod nižší, je otvorený a nič nedrží; ak by voda tiekla späť, zavrie sa.

## Čítanie výsledkov

Okno zobrazuje výšku a tlak každého uzla a prietok, rýchlosť a stratu výšky na 1,000 ft (alebo na km) pre každé spojenie, s uzlami zafarbenými na pláne: zelená je medzi vaším najnižším a najvyšším tlakom, červená nižšie, jantárová vyššie. Šípky prietoku ukazujú smer. Vyberte uzol alebo potrubie, aby ste čítali jeho čísla vo vlastnostiach.

Pod tabuľkami je zoznam toho, na čo sa pozrieť: nízky alebo vysoký tlak, potrubie rýchlejšie ako váš limit, uzol odpojený od každého zdroja alebo riešič, ktorý sa neustálil. Rovnaké zistenia sú v paneli Problémy. Limity nastavte v okne (na začiatok 20 psi, 100 psi a 10 ft/s; 140 kPa, 700 kPa a 3 m/s v projekte v metroch).

## Požiarny prietok

{{ui:Požiarny prietok…}} nakreslí prietok v jednom uzle a zobrazí tlak tam a najnižší tlak kdekoľvek v sieti. Tiež nájde prietok dostupný v tomto uzle, pokiaľ najslabší uzol v sieti zachováva zvyškový tlak, ktorý zadáte. Ostatné odbery zostanú, ako sú.

## Deň odberu

{{ui:Deň odberu…}} spustí sieť hodinu po hodine. Zadajte vzor odberu v nastaveniach súboru (zoznam násobiteľov, ktorý sa opakuje); nádrže sa plnia a vyprázdňujú podľa prietoku dnu a von a čerpadlo môže nasledovať vzor zapnuté/vypnuté. Nádrž, ktorá dosiahne svoju najvyššiu alebo najnižšiu úroveň, sa uvedie v zozname: CivilCraft jej prívod ani odtok za vás neuzavrie, takže to čítajte ako "táto nádrž je príliš malá, alebo čerpadlo príliš veľké".

## EPANET text

{{ui:Uložiť ako text EPANET (.inp)}} zapíše sieť vo formáte prostého textu, ktorý čítajú mnohé vodárenské programy, a {{ui:Otvoriť text EPANET (.inp)…}} prečíta jeden taký. Prenesie sa len to, čo CivilCraft modeluje: uzly, nádrže, vodojemy, potrubia, čerpadlá s charakteristikou výšky, redukčné ventily, vzory odberu a časy. Iné typy ventilov, čerpadlá zadané výkonom a iné vzorce straty výšky sa uvedú a vynechajú. Súbor musí používať rovnaké jednotky ako projekt.

## Hydranty, ventily a tvarovky

Vyberte uzol a zaškrtnite **Hydrant**, aby sa tam umiestnil jeden; vyberte hlavné potrubie a stlačte **Pridať v strede**, aby ste naň umiestnili ventil, vzdušný ventil, vypúšťací ventil alebo merač. Sú to objekty siete: pohybujú sa s ňou a jeden krok späť ich odstráni.

Rozloženie tiež naznačuje tvarovky a CivilCraft ich uvedie bez toho, aby ste o to žiadali: **T-kus** tam, kde sa stretnú tri hlavné potrubia; **kríž** tam, kde sa stretnú štyri; **koleno** (s jeho uhlom) tam, kde sa dve hlavné potrubia otočia o 5° alebo viac; **redukciu** tam, kde sa stretnú dve veľkosti; a **záslepku** na slepom konci. {{ui:Zoznam tvaroviek (CSV)}} ich spočíta a hlavné potrubia podľa veľkosti. Ide o to, čo naznačuje rozloženie: výkaz na kontrolu voči vašim vlastným detailom, nie zoznam na objednanie.

Hlavné potrubia sú uložené na úrovni terénu mínus krytie (4 ft alebo 1.2 m), aby sa dali nakresliť a namodelovať v 3D; vyššie uvedené tlaky na tom nikdy nezávisia.

## Na pláne a v súboroch

Plán, PDF a DWG alebo DXF nesú hlavné potrubia na **C-WATR-MAIN** s ich veľkosťami na **C-WATR-TEXT**, hydranty na **C-WATR-HYDR**, ventily na **C-WATR-VALV** a tvarovky na **C-WATR-FITT**. Export LandXML zapíše vodovodnú sieť potrubí (šachtu pre každý uzol, potrubie pre každé hlavné potrubie, pomenované hydranty); import LandXML ju načíta späť ako vodovodné hlavné potrubia, bez odberov, čerpadiel a ventilov, ktoré LandXML neobsahuje. Export IFC zapíše hlavné potrubia ako segmenty potrubia, hydranty, ventily a tvarovky v jednom vodovodnom systéme. Tieto súbory sme overili voči vlastnému čítaču a zapisovačom; vyskúšajte ich vo svojich ďalších programoch a dajte nám vedieť, čo v nich hovoria.

## Čo tu ešte nie je

Kvalita a vek vody, riadenie a pravidlá nad rámec vzoru zapnuté/vypnuté čerpadla, iné typy ventilov, odber podľa tlaku, potrubia so meniacim sa priemerom a prietoky v kanalizácii v čase. Pozri [Ešte nie je hotové](topic:not-built-yet). Návrhové splaškové prietoky, čo je iný výpočet, sú v [Návrhové splaškové prietoky](topic:sanitary-design).
