---
title: Profily hladiny vody v rieke
summary: Modelujte rieku z povrchu terénu a vypočítajte ustálené profily hladiny vody metódou štandardného kroku: výšky hladín, energiu, rýchlosti, Froudeho čísla a rozsah záplavy v pôdoryse. Laboratórna funkcia; každý výsledok vyžaduje posúdenie inžinierom.
keywords: hrádza, neúčinná oblasť prietoku, editor rezov, rieka, hydraulika, profil hladiny vody, vzdutie, štandardný krok, ustálené prúdenie, 1D, priečne rezy, Manning, drsnosť, prietočnosť, kritická hĺbka, normálna hĺbka, Froude, čiara energie, rozsah záplavy, záplavové územie, zaplavenie, breh, dĺžky úsekov, zúženie, rozšírenie, podkritický, nadkritický, zmiešaný režim, hydraulický skok
from: fb8bf425
---

CivilCraft počíta ustálené jednorozmerné profily hladiny vody pozdĺž rieky: pre každý prietok, ktorý zadáte, výšku hladiny na každom priečnom reze, z energetickej bilancie medzi susednými rezmi (metóda štandardného kroku). Funkcia je zatiaľ v laboratóriu, kým sa overuje.

**Iba ako pomôcka pri návrhu.** Výšky hladiny vyžadujú posúdenie kvalifikovaným inžinierom, skôr než sa na ne ktokoľvek spolieha: 1D model je len taký dobrý, ako sú jeho rezy, hodnoty drsnosti, dĺžky úsekov a okrajové podmienky, a nepozná mosty, priepusty ani prietok vystupujúci z rieky.

## Nakreslenie rieky

1. Najprv vytvorte jestvujúci povrch terénu (body, hrany zlomu alebo TIN, ktorý ste otvorili).
2. V **Povrch** › {{ui:Viac}} zvoľte {{ui:Rieka}}.
3. Kliknite pozdĺž osi rieky **od hornej k dolnej vode**, potom stlačte {{key:Enter}} alebo dvojitým kliknutím.

CivilCraft vytvorí rez kolmo na os každých 50 m (200 ft), 100 m (300 ft) na každú stranu, z terénu. Staničenie rieky sa meria od dolného konca, takže rastie proti prúdu. Brehy sa spočiatku odhadnú 10 m (30 ft) na oboch stranách najnižšieho bodu každého rezu.

Na pridanie rezu tam, kde sa rieka zužuje alebo stojí objekt, vyberte rieku, kliknite na {{ui:Pridať rez}} a nakreslite rez cez ňu (ktorýmkoľvek smerom: otočí sa tak, aby smeroval zľava doprava pri pohľade po prúde).

## Nastavenie rieky

Vyberte rieku, aby sa zobrazila vo **Vlastnostiach**:

- **Režim prúdenia**: podkritický (obvyklý prípad: počíta sa proti prúdu od dolnej okrajovej podmienky), nadkritický (počíta sa po prúde od hornej okrajovej podmienky) alebo zmiešaný (obe, potom ten s väčšou špecifickou silou v každom reze; náhľad).
- **Profily prietokov**: názov a prietok pre každý (napríklad 10-ročný a 100-ročný prietok) a okrajová podmienka na dolnom konci (a na hornom konci, keď režim nie je podkritický): **Normálna hĺbka** s energetickým sklonom (sklon dna je prvý odhad), **Známa hladina vody** s výškou, alebo **Kritická hĺbka**.
- **Rezy z terénu**: rozstup, ako ďaleko vľavo a vpravo, odhad brehu a dve hodnoty Manningovho n; {{ui:Znova vytvoriť rezy}} nahradí rezy (jeden krok späť).
- **Tabuľka rezov**: pre každý rez odsadenia ľavého a pravého brehu, n koryta a n záplavového územia, dĺžky úsekov k nasledujúcemu rezu po prúde (ľavé záplavové územie, koryto, pravé záplavové územie; meria sa z pôdorysu na začiatku) a koeficienty zúženia a rozšírenia (na začiatok 0.1 a 0.3: postupné prechody). {{ui:Úpravy}} otvorí editor rezov (ďalej); bodka za ním znamená, že rez má hrádzu alebo neúčinnú oblasť.

Každá zmena je jeden krok späť ({{key:Mod+Z}}).

## Úprava rezu: brehy, hrádze a neúčinné oblasti

{{ui:Úpravy}} pri reze nakreslí jeho terén a umožní vám ťahať to, čo riešiteľ číta: **ľavý a pravý breh** (rozdelia rez na ľavé záplavové územie, hlavné koryto a pravé záplavové územie), **hrádzu** na ktorejkoľvek strane a **neúčinné oblasti prietoku**. Každý úchyt sa dá posunúť aj šípkami a každé číslo sa dá napísať vedľa grafu. {{ui:Použiť}} je jeden krok späť.

- **Hrádza** má miesto (odsadenie) a výšku koruny. Terén za ňou, ďalej od rieky, je odrezaný od rieky, kým je hladina vody pod korunou: jeho plocha, zmáčaný obvod a prietočnosť sa nezapočítavajú. Nad korunou sa počíta celý rez. Hrádza stojí mimo brehu, ktorý chráni; hrádza vnútri brehov sa označí.
- **Neúčinná oblasť prietoku** drží vodu, ale neprenáša prietok (jamka za násypom, mŕtva voda vedľa prístupu k mostu). Zadajte jej dve odsadenia a ak chcete, hladinu vody, pod ktorou je neúčinná ({{ui:vždy}}, keď je pole prázdne): nad touto hladinou preteká ako zvyšok. Oblasť, ktorá zakrýva časť hlavného koryta, sa označí.
- Medzi dvoma rezmi rozsah záplavy nechá suchý terén za hrádzou, ktorú majú oba rezy, kým je hladina vody tam pod korunou (čiara medzi dvoma korunami je priama).

## Výpočet a čítanie výsledkov

Kliknite na {{ui:Profily hladiny vody}}. Pre zvolený profil dostanete:

- **graf** pozdĺž rieky (prúdenie zľava doprava): dno koryta, brehy, hladina vody, čiara energie a kritická hladina vody; rezy držané na kritickej hĺbke sú označené kruhom;
- **tabuľku** pre každý rez: staničenie rieky, prietok, dno koryta, hladinu vody, kritickú hladinu vody, čiaru energie, hĺbku, rýchlosť v koryte a celkovú, Froudeho číslo koryta, plochu prietoku, šírku hladiny, prietok v každom záplavovom území a v koryte, energetický sklon a upozornenia;
- **upozornenia** jednoduchými slovami, napríklad rez nastavený na kritickú hĺbku, voda nad koncami rezu alebo veľká zmena prietočnosti medzi dvoma rezmi (pridajte medzi ne rezy).

{{ui:Tabuľka (CSV)}}, {{ui:Správa}} (čistý text s metódou, okrajovými podmienkami a každou tabuľkou) a {{ui:Graf (SVG)}} sa uložia do priečinka na stiahnutie. Každý z nich nesie riadok o posúdení.

Začiarknite {{ui:Zobraziť rozsah zaplavenia}} vo **Vlastnostiach**, aby sa pre zvolený profil vyšrafovala mokrá oblasť v pôdoryse, s čiarou hladiny vody tam, kde je hĺbka nulová. Medzi rezmi je hladina vody v priečnom smere rieky vodorovná a mení sa lineárne so staničením rieky. Terén za hrádzou zostane suchý, kým je voda pod jej korunou. Iné nízko položené miesta vnútri koridoru rieky, kam voda nemôže dosiahnuť (napríklad za cestným násypom), sú stále vyšrafované: skontrolujte ich.

## Vo výkrese a v paneli Problémy

Čiary rieky idú do pôdorysu, PDF a DWG na vlastných hladinách: **C-WATR-CNTR** (os), **C-WATR-SCTN** (každá čiara rezu, s jej staničením rieky) a **C-WATR-FLOD** (čiara hladiny zaplavenia, keď je pre profil začiarknuté {{ui:Zobraziť rozsah zaplavenia}}). Upozornenia rieky (rez nastavený na kritickú hĺbku, voda nad koncami rezu, zmena prietočnosti, ktorá vyžaduje viac rezov, energetická bilancia, ktorá sa neuzavrela, hrádza vnútri brehov) sa tiež posielajú na panel **Problémy**, týkajú sa rieky a sú umiestnené pri reze, z ktorého pochádzajú.

## Ako sa to počíta

- Energia medzi dvoma rezmi: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Prietočnosť rozdelením: každé záplavové územie sa rozdelí tam, kde sa mení jeho n, K = Σ (1/n)·A·R^(2/3) (1.486/n v US jednotkách); koryto je jeden kus, so zloženým n, keď sa jeho n mení. α vyplýva z toho, ako sa prietočnosť rozdelí.
- Trecí sklon podľa priemernej prietočnosti, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², cez dĺžku úseku vážený prietokom.
- Koeficient zúženia, keď prúd po prúde zrýchľuje, rozšírenia, keď spomaľuje.
- Kritická hĺbka = najmenšia špecifická energia. Každá výška hladiny sa rieši v intervale, takže nikdy nepreskočí na nesprávnu stranu kritickej hodnoty; keď riešenie neexistuje, nastaví sa na kritickú hĺbku a označí sa.

Program je overený voči normálnej hĺbke podľa Manninga, kritickej hĺbke v obdĺžnikovom koryte a Chowovmu príkladu vzdutia (*Open-Channel Hydraulics*, 1959, kapitola 10), integrovanom nezávisle. Rovnakú metódu používajú bežné 1D riečne programy, takže ručný výpočet alebo študentské poznámky sa dajú preniesť.

## Priepusty a mosty

V **Vlastnostiach** rieky, pod **Priepusty a mosty**, {{ui:Pridať priepust}} alebo {{ui:Pridať most}} umiestni jeden medzi dva rezy (každý úsek zachová aspoň dva). Profil pod ním sa nezmení; hladina vody tesne nad ním vychádza z objektu a profil pokračuje proti prúdu odtiaľto. **Výsledky** pridajú tabuľku každého objektu: dolnú vodu, výšku hornej vody, ktorá regulácia rozhoduje, prietok otvorom a prietok cez cestu alebo mostovku. Iba podkritické prúdenie.

- **Priepust** (obdĺžnikový alebo kruhový, jeden alebo viac rovnakých otvorov). Regulácia vtoku je prepadové prúdenie, kým je vtok voľný, a otvorové prúdenie, keď je zatopený, plynulo medzi hornou vodou jednej až jednej a pol násobku výšky. Regulácia výtoku je energetická bilancia: strata na vtoku, trenie a výtoková rýchlostná výška, nad vyššou z hodnôt dolnej vody a stredu kritickej hĺbky a temena, mínus pokles pozdĺž otvoru. Horná voda je väčšia z týchto dvoch. Začiarknite **Voda môže prepadať cez cestu** a prepadové prúdenie cez cestu sa delí o prietok s otvormi.
- **Most.** Otvor je rez pod mostom, zarezaný v opornách, pričom každý pilier je plocha, ktorá neprenáša prietok. Hladina vody v otvore pochádza z reza pod ním (koeficient rozšírenia) a rez nad ním z otvoru (koeficient zúženia). Ak otvor nedokáže pretiecť prietok pri tejto dolnej vode, beží na kritickej hĺbke a most sa označí ako dusenie. Ak voda dosiahne spodnú hranu konštrukcie, prietok je tlakový (typu výtoku pod hradidlom, keď je dolná voda pod spodnou hranou, zatopený nad ňou) a voda nad mostovkou pridá prepadové prúdenie; horná hladina je tá, pri ktorej sa tieto spolu rovnajú prietoku.

Koeficienty (výtok, strata na vtoku, prepad) sú zadané okrúhle predvolené hodnoty. Zmeňte ich pre váš návrh. Nie sú to vložené grafy, ktoré tlačia návrhové príručky priepustov, takže s hornou vodou priepustu blízko jeho limitu zaobchádzajte ako s odhadom. Voda cez cestu alebo mostovku, zatopený vtok, dusený otvor a rýchly prúd v otvore sa zobrazia v paneli **Problémy**.

## Nestacionárne prúdenie

{{ui:Nestacionárne prúdenie…}} vo **Vlastnostiach** rieky vedie povodňový hydrogram pozdĺž rezov. Zadajte prítok ako hodiny a prietoky, jeden pár na riadok, sklon po prúde (normálna hĺbka) a ako dlho sa má počítať. Začína od ustálenej hladiny vody pri prvom prietoku a rieši úplné jednorozmerné rovnice (implicitná štvorbodová schéma, vážená 0.6 v čase). Dostanete maximálnu výšku hladiny a prietok na každom reze s hodinou, kedy každá nastane, graf prietoku na oboch koncoch a kontrolu objemu (prítok, odtok a zmena uloženého). Kontroluje sa, či ustálený prietok zostáva ustálený, či skok prítoku končí na ustálenom profile nového prietoku, uzavretie objemu a rýchlosť povodňovej vlny oproti kinematickej vlne. Podkritické prúdenie, jeden úsek, bez bočného prítoku a bez priepustov či mostov v behu.

## Sútoky

Úseky, ktoré spájajú prietok do jedného výtoku: prietoky sa sčítajú a hladina vody na začiatku dolného úseku sa prenesie na konce úsekov, ktoré sa k nemu pripájajú (rovnaká hladina vody v sútoku, jednoduchá metóda: bez uhla, bez hybnosti, preto vyhovuje nízkym Froudeovým číslam). Model a testy sú na mieste (`river-structures.js`); panel na spojenie dvoch riek v pôdoryse ešte nie je hotový.

## Ešte nie je hotové

Prepady a stavidlá ako samostatné objekty, panel pre sútoky, objekty vnútri nestacionárneho behu a nestacionárne nadkritické prúdenie. Beh so zmiešaným režimom označí hydraulický skok medzi dvoma rezmi, ale neumiestni ho.

**Kde sa rieky stretávajú.** V **Vlastnostiach** rieky názov „Tečie do“ označuje rieku, do ktorej sa vlieva. Rieky, ktoré sa vlievajú, sa riešia spoločne: rieka, do ktorej tečú, nesie súčet ich prietokov a každá z nich končí na hladine vody prvého reza tejto rieky (metóda rovnakej hladiny vody; vynecháva uhol a hybnosť prietokov). Na spojenie hlavnej rieky a potoka nakreslite krátku rieku pod sútokom a nechajte do nej tiecť obe. Výsledky zobrazia tabuľku sútoku. Predvolené hodnoty v týchto výsledkoch (zúženie 0.1, rozšírenie 0.3, koryto v jednom kuse so zloženou drsnosťou, zmiešaný režim podľa špecifickej sily) ostávajú, kým ich inžinier neposúdi, a výsledky to uvádzajú.
