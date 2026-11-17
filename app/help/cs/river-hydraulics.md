---
title: Profily hladiny vody v řece
summary: Modelujte řeku z povrchu terénu a počítejte ustálené profily hladiny vody metodou standardního kroku: hladiny vody, energii, rychlosti, Froudova čísla a rozsah zátopy v půdorysu. Laboratorní funkce; každý výsledek vyžaduje posouzení inženýrem.
keywords: hráz, neúčinná oblast proudění, editor příčných profilů, řeka, hydraulika, profil hladiny vody, vzdutí, standardní krok, ustálené proudění, 1D, příčné profily, Manning, drsnost, průtočná kapacita, kritická hloubka, normální hloubka, Froude, čára energie, rozsah zátopy, záplavové území, zaplavení, body břehů, délky úseků, zúžení, rozšíření, podkritické, nadkritické, smíšený režim, hydraulický skok
from: fb8bf425
---

CivilCraft počítá ustálené jednorozměrné profily hladiny vody podél řeky: pro každý průtok, který zadáte, hladinu vody v každém příčném profilu, z bilance energie mezi sousedními profily (metoda standardního kroku). Funkce je v laboratoři, dokud se ověřuje.

**Pouze pomůcka pro návrh.** Hladiny vody potřebují posouzení kvalifikovaným inženýrem, než se na ně kdokoli spolehne: jednorozměrný model je jen tak dobrý jako jeho profily, hodnoty drsnosti, délky úseků a okrajové podmínky, a neví nic o mostech, propustcích nebo o vodě, která z řeky odtéká.

## Nakreslení řeky

1. Nejprve vytvořte stávající povrch terénu (body, lomové hrany nebo TIN, který jste otevřeli).
2. V **Povrch** › {{ui:Více}} zvolte {{ui:Řeka}}.
3. Klikejte podél osy toku **od horního k dolnímu toku**, pak stiskněte {{key:Enter}}, nebo dvakrát klikněte.

CivilCraft vede řez kolmo k ose každých 50 m (200 ft), 100 m (300 ft) na každou stranu, z terénu. Staničení řeky se měří od dolního konce, takže roste proti proudu. Břehy začínají jako odhad 10 m (30 ft) na obě strany od nejnižšího bodu každého profilu.

Chcete-li přidat profil tam, kde se řeka zužuje nebo kde je objekt, vyberte řeku, klikněte na {{ui:Přidat příčný profil}} a nakreslete řez napříč (na kterou stranu: je otočen tak, aby běžel zleva doprava při pohledu po proudu).

## Nastavení řeky

Vyberte řeku, aby se zobrazila ve **Vlastnosti**:

- **Režim proudění**: podkritický (obvyklý případ: počítá se proti proudu od dolní okrajové podmínky), nadkritický (počítá se po proudu od horní okrajové podmínky), nebo smíšený (obojí, pak ten s větší měrnou silou v každém profilu; náhled).
- **Profily průtoků**: název a průtok pro každý (například 10letý a 100letý průtok) a okrajová podmínka na dolním konci (a na horním, když režim není podkritický): **Normální hloubka** se sklonem energie (sklon dna je první odhad), **Známá hladina vody** nebo **Kritická hloubka**.
- **Profily z terénu**: rozestup, jak daleko vlevo a vpravo, odhad břehu a dvě hodnoty Manningova n; {{ui:Vyříznout příčné profily znovu}} nahradí profily (jeden krok zpět).
- **Tabulka profilů**: pro každý profil odsazení levého a pravého břehu, n koryta a n přebřehu, délky úseků k dalšímu profilu po proudu (levý přebřeh, koryto, pravý přebřeh; měřeno z půdorysu, na začátku) a součinitele zúžení a rozšíření (na začátku 0.1 a 0.3: plynulé přechody). {{ui:Úpravy}} otevře editor profilů (dále); tečka za ním znamená, že profil má hráz nebo neúčinnou oblast.

Každá změna je jeden krok zpět ({{key:Mod+Z}}).

## Úprava profilu: břehy, hráze a neúčinné oblasti

{{ui:Úpravy}} u profilu nakreslí jeho terén a umožní vám táhnout to, co řešitel čte: **levý a pravý břeh** (rozdělí profil na levý přebřeh, hlavní koryto a pravý přebřeh), **hráz** na kterékoli straně a **neúčinné oblasti proudění**. Každou úchytku lze posunout šipkami a každé číslo lze napsat vedle grafu. {{ui:Použít}} je jeden krok zpět.

- **Hráz** má místo (odsazení) a výšku koruny. Terén za ní, pryč od řeky, je odříznut od řeky, dokud je hladina vody pod korunou: jeho plocha, smočený obvod a průtočnost se vynechají. Nad korunou se celý profil počítá znovu. Hráz stojí vně břehu, který chrání; ta uvnitř břehů je označena.
- **Neúčinná oblast proudění** zadržuje vodu, ale nepřenáší průtok (tůňka za násypem, mrtvá voda vedle přístupu k mostu). Zadejte její dvě odsazení a, pokud chcete, hladinu vody, pod kterou je neúčinná ({{ui:vždy}}, když je prázdné): nad touto hladinou proudí jako zbytek. Oblast, která zasahuje do části hlavního koryta, je označena.
- Mezi dvěma profily rozsah zátopy nechá suchý terén za hrází, kterou mají oba profily, dokud je hladina pod korunou (čára mezi oběma korunami je přímka).

## Výpočet a čtení výsledků

Klikněte na {{ui:Profily hladiny vody}}. Pro zvolený profil získáte:

- **graf** podél řeky (proudění zleva doprava): dno koryta, břehy, hladinu vody, čáru energie a kritickou hladinu; profily držené na kritické hloubce jsou zakroužkovány;
- **tabulku** pro každý profil: staničení řeky, průtok, dno koryta, hladinu vody, kritickou hladinu, čáru energie, hloubku, rychlost v korytě a celkovou, Froudovo číslo koryta, plochu průtoku, šířku hladiny, průtok v každém přebřehu a v korytě, sklon energie a varování;
- **varování** prostými slovy, například profil nastavený na kritickou hloubku, voda nad konci profilu nebo velká změna průtočnosti mezi dvěma profily (přidejte mezi ně profily).

{{ui:Tabulka (CSV)}}, {{ui:Zpráva}} (prostý text s metodou, okrajovými podmínkami a každou tabulkou) a {{ui:Graf (SVG)}} se uloží do vašich stažených souborů. Každý z nich nese řádek o posouzení.

Zaškrtněte {{ui:Zobrazit rozsah zátopy}} ve **Vlastnosti**, aby se na půdorysu vystínovala mokrá oblast pro zvolený profil, s čárou hladiny vody tam, kde je hloubka nulová. Mezi profily je hladina vody napříč řekou vodorovná a mění se lineárně se staničením řeky. Terén za hrází zůstává suchý, dokud je voda pod její korunou. Jiný nízko položený terén uvnitř koridoru řeky, kam voda nedosáhne (například za silničním násypem), je stále vystínován: zkontrolujte to.

## Na výkresu a v Problémech

Čáry řeky jdou do půdorysu, PDF a DWG na vlastních vrstvách: **C-WATR-CNTR** (osa), **C-WATR-SCTN** (každá řezová čára s jejím staničením) a **C-WATR-FLOD** (čára hladiny rozsahu zátopy, když je pro profil zaškrtnuto {{ui:Zobrazit rozsah zátopy}}). Varování řeky (profil nastavený na kritickou hloubku, voda nad konci profilů, změna průtočnosti, která žádá více profilů, bilance energie, která se neuzavřela, hráz uvnitř břehů) jdou také do panelu **Problémy**; vztahují se k řece a jsou umístěna u profilu, ze kterého pocházejí.

## Jak se počítá

- Energie mezi dvěma profily: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Průtočnost dělením na části: každý přebřeh se rozdělí tam, kde se mění jeho n, K = Σ (1/n)·A·R^(2/3) (1.486/n v jednotkách USA); koryto je jeden kus, se složeným n, když se jeho n mění. α vyplývá z rozdělení průtočnosti.
- Třecí sklon podle průměrné průtočnosti, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², přes délku úseku váženou průtokem.
- Součinitel zúžení, když proudění po proudu zrychluje, rozšíření, když zpomaluje.
- Kritická hloubka = nejmenší měrná energie. Každá hladina vody se řeší na intervalu, takže nikdy nepřeskočí na špatnou stranu kritické; když řešení neexistuje, nastaví se na kritickou hloubku a je označena.

Program je ověřen vůči normální hloubce podle Manninga, kritické hloubce v obdélníkovém korytě a Chowovu příkladu vzdutí (*Open-Channel Hydraulics*, 1959, kapitola 10), integrovanému nezávisle. Stejnou metodou pracují běžné jednorozměrné programy pro řeky, takže ruční výpočet nebo poznámky studenta se přenesou.

## Propustky a mosty

V **Vlastnosti** řeky pod **Propustky a mosty** umístí {{ui:Přidat propustek}} nebo {{ui:Přidat most}} jeden mezi dva profily (každý úsek zachová alespoň dva profily). Profil pod ním se nemění; hladina vody těsně nad ním pochází z objektu a profil pokračuje proti proudu odtud. **Výsledky** přidají tabulku každého objektu: hladinu za objektem, hladinu před objektem, který řídicí režim rozhoduje, průtok otvorem a průtok přes silnici nebo mostovku. Pouze podkritické proudění.

- **Propustek** (krabicový nebo kruhový, jedno nebo více stejných hrdel). Řízení na vtoku je přepadové, dokud je vtok volný, a otvorové, jakmile je zatopený, mísené mezi hladinou před objektem o jedné až jedné a půl násobku výšky. Řízení na výtoku je bilance energie: ztráta na vtoku, tření a výtoková rychlostní výška, nad vyšší z hladiny za objektem a středu kritické hloubky a temene, méně pokles podél hrdla. Hladina před objektem je větší z obou. Zaškrtněte **Voda může přetékat přes silnici** a přepadový průtok silnice se dělí o průtok s hrdly.
- **Most.** Otvor je profil pod mostem, řezaný u opěr; každý pilíř je plocha, která nepřenáší průtok. Hladina vody v otvoru pochází z profilu pod ním (součinitel rozšíření) a profil nad ním z otvoru (součinitel zúžení). Když otvor nepropustí průtok při dané hladině za objektem, proudí na kritické hloubce a most je označen jako ucpaný. Dosáhne-li voda spodní hrany nosníků, je průtok tlakový (typ výpusti, dokud je hladina za objektem pod spodní hranou, zatopený nad ní) a voda přes mostovku přidá přepadový průtok; hladina proti proudu je ta, při které se sečtou na průtok.

Součinitele (průtočnosti, ztráty na vtoku, přepadu) jsou zadané zaokrouhlené výchozí hodnoty. Změňte je pro svůj návrh. Nejsou to přizpůsobené grafy, které tisknou příručky pro navrhování propustků, takže s hladinou před propustkem blízko jeho meze zacházejte jako s odhadem. Voda přes silnici nebo mostovku, zatopený vtok, ucpaný otvor a rychlé proudění v hrdle jsou zobrazeny v **Problémy**.

## Neustálené proudění

{{ui:Neustálené proudění…}} ve **Vlastnosti** řeky vede povodňový hydrogram podél profilů. Napište přítok jako hodiny a průtoky, jeden pár na řádek, sklon na dolním konci (normální hloubka) a jak dlouho běžet. Začíná z ustálené hladiny vody při prvním průtoku a řeší úplné jednorozměrné rovnice (implicitní čtyřbodové schéma, s váhou 0.6 v čase). Dostanete maximální hladinu vody a průtok v každém profilu s hodinou, kdy k nim dojde, graf průtoku na obou koncích a kontrolu objemu (dovnitř, ven a změna uložená). Ověřuje se, že ustálené proudění zůstane ustálené, že skok v přítoku skončí na ustáleném profilu nového průtoku, uzavření objemu a rychlost povodňové vlny oproti kinematické vlně. Podkritické proudění, jeden úsek, bez bočního přítoku a bez propustků nebo mostů uvnitř běhu.

## Soutoky

Úseky, které spojují průtok do jednoho výtoku: průtoky se sčítají a hladina vody na hlavě dolního úseku se přenese až ke koncům úseků, které se do něj připojují (stejná hladina vody na soutoku, jednoduchá metoda: bez úhlu, bez hybnosti, takže se hodí pro nízká Froudova čísla). Model a testy jsou na místě (`river-structures.js`); panel pro spojení dvou řek na půdorysu ještě není hotový.

## Ještě není hotovo

Jezy a hrazení jako vlastní objekty, panel pro soutoky, objekty uvnitř neustáleného běhu a neustálené nadkritické proudění. Běh se smíšeným režimem označí hydraulický skok mezi dvěma profily, ale neumístí jej.

**Kde se řeky spojují.** Ve **Vlastnosti** řeky pojmenuje "Vtéká do" řeku, do které se připojuje. Řeky, které se připojují, se řeší společně: řeka, do které vtékají, nese součet jejich průtoků a každá z nich končí na hladině vody prvního profilu té řeky (metoda stejné hladiny; vynechává úhel a hybnost průtoků). Chcete-li spojit hlavní řeku a potok, nakreslete krátkou řeku pod soutokem a nechte obě do ní vtékat. Výsledky ukážou tabulku soutoku. Výchozí hodnoty v těchto výsledcích (zúžení 0.1, rozšíření 0.3, koryto jednoho kusu se složenou drsností, smíšený režim podle měrné síly) platí, dokud je neposoudí inženýr, a výsledky to říkají.
