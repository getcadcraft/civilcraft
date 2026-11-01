---
title: Obrazovka po částech
summary: Prohlídka všech lišt a panelů v CivilCraftu podle jejich názvu na obrazovce, od panelu nástrojů po stavový řádek.
keywords: rozhraní, obrazovka, panel nástrojů, panely, vlastnosti, stavový řádek, podélný profil, rozvržení, prohlídka, uživatelské rozhraní
from: 76272010
---

CivilCraft má jednu obrazovku. Nejsou tu karty ani rozvržení. Boční panely lze přesouvat, nechat plovoucí nebo přesunout do samostatného okna: viz [Uspořádání panelů a použití druhého monitoru](common:arrange-panels). Shora dolů a zleva doprava:

- **lišta aplikace** (značka CadCraft, název aplikace, verze, O aplikaci, režim obrazovky, Nápověda, Uložit pro offline, Papír a Model)
- **panel nástrojů** se sedmi skupinami tlačítek
- **levý panel**: Staveniště, Body, Povrch, Zobrazení a, jakmile nějaké naimportujete, Vrstvy GIS
- **půdorys** uprostřed, s **podélným profilem** pod ním, je-li otevřen
- **pravý panel**: Vlastnosti vybraného
- **stavový řádek** podél spodního okraje

## Lišta aplikace

Tenká lišta úplně nahoře patří webu CadCraft, ne samotnému CivilCraftu.

- Nabídka verzí ukazuje, kterou verzi používáte.
- {{ui:O aplikaci CivilCraft}} otevře stránku aplikace na webu.
- {{ui:Celá obrazovka}} přepíná režimy obrazovky: celá obrazovka, potom celá obrazovka se skrytými lištami a potom zpět do normálního. {{key:Ctrl+Shift+F}} dělá totéž na každé platformě, včetně Macu (tam je to klávesa Control, ne Command). Při skrytých lištách je vrátíte přesunutím ukazatele k hornímu okraji.
- {{ui:Nápověda}} (nebo {{key:F1}}) otevře tuto nápovědu v bočním panelu; {{key:F1}} nebo {{key:Esc}} ji zavře.
- {{ui:Uložit pro offline}} uchová CivilCraft v tomto prohlížeči, aby se otevřel bez připojení; poté zobrazuje {{ui:Připraveno offline}}. Viz [Soubory, které můžete otevřít, uložit a exportovat](topic:files#online-and-offline).
- {{ui:Papír}} a {{ui:Model}} přepínají mezi světlým a tmavým motivem. Půdorys a profil motiv sledují; PDF se vždy tisknou na bílé.

## Panel nástrojů

Každá skupina má nad tlačítky malý popisek. Najetím na tlačítko zobrazíte jeho popisek a klávesu.

| Skupina | Tlačítka | Co dělají |
|---|---|---|
| Soubor | {{ui:Nový}}, {{ui:Otevřít}}, {{ui:Uložit}} | Začít znovu, otevřít soubor bodů, LandXML nebo projekt, uložit projekt jako stažený soubor |
| Export | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Zapsat LandXML 1.2, DXF R12 nebo DWG půdorysu, nebo vykreslit půdorys do PDF |
| Povrch | {{ui:Lomová hrana}}, {{ui:Hranice}} | Nakreslit lomovou hranu body zaměření; nakreslit vnější hranici |
| Návrh | {{ui:Osa trasy}}, {{ui:Plošina}}, {{ui:Potrubí}}, {{ui:Profil}} | Nakreslit osu trasy, plošinu, potrubní úsek; zobrazit nebo skrýt podélný profil |
| Úpravy | {{ui:Zpět}}, {{ui:Znovu}}, {{ui:Kopírovat}}, {{ui:Vložit}}, {{ui:Více}} | Zpět, znovu, kopírovat a vkládat body zaměření; {{ui:Více}} obsahuje Vyjmout, Vložit na stejné místo, Duplikovat, Smazat, Vybrat všechny body a Zrušit výběr |
| GIS | {{ui:Souřadnice}}, {{ui:Importovat}}, {{ui:Exportovat}}, {{ui:Mapa}} | Nastavit souřadnicový systém, importovat a exportovat soubory GIS, zobrazit mapové vrstvy pod půdorysem |
| Pohled | {{ui:Výběr}}, {{ui:Přizpůsobit}}, {{ui:3D}} | Vybírat a přesouvat; zoom na zobrazení všeho; zobrazit staveniště ve 3D ([Zobrazení staveniště ve 3D](topic:site-3d)) |

Kreslicí nástroj zůstává stisknutý, dokud je aktivní. Opětovným kliknutím na něj, stiskem {{key:Esc}} nebo {{key:V}} se vrátíte k {{ui:Výběr}}. {{ui:Zpět}}, {{ui:Znovu}}, {{ui:Kopírovat}} a položky v {{ui:Více}} jsou zašedlé, když nemohou působit; popisek říká proč (například „Nejdřív vyberte body zaměření“). Každé tlačítko je uvedeno v tématu [Přehled panelu nástrojů](topic:toolbar).

V úzkém okně se panel nástrojů posouvá do stran.

## Levý panel

### Staveniště

- **Název**: název projektu. Pojmenuje každý soubor, který uložíte nebo exportujete, a tiskne se v záhlaví PDF.
- **Jednotky**: {{ui:americké stopy}} nebo {{ui:Metry}}. Říká, co čísla znamenají. Jeho změna souřadnice **nepřevádí**; viz [Jednotky, staničení a formáty čísel](topic:units-and-stations).

### Body

Prázdný říká, jak otevřít soubor bodů. S body ukazuje název souboru, počet bodů a kolik z nich má výšku, a potom tabulku **skupin bodů**: jeden řádek na první slovo popisu (GRD, FL, TBS …), s počtem a volbou **Povrch**:

- {{ui:Body}}: body jdou do povrchu (výchozí pro každou skupinu).
- {{ui:Lomová hrana}}: body skupiny se spojí v pořadí čísel bodů do jedné lomové hrany.
- {{ui:Vynecháno}}: skupina se povrchu nedotýká.

### Povrch

Údaje o stávajícím terénu: body, trojúhelníky, nejnižší a nejvyšší výška, průměrná výška, plocha 2D a 3D, lomové hrany a zda je hranice. Pod údaji rámeček uvádí vše, co tvůrce povrchu musel opravit nebo nezvládl. Potom:

- **Nejdelší vnější hrana**: 0 ponechá všechny vnější trojúhelníky; číslo odřízne dlouhé tenké trojúhelníky zvenčí.
- Odkazy, které se objeví, když platí: {{ui:Odebrat hranici}}, {{ui:Odebrat nakreslené lomové hrany}} a pro povrch načtený z LandXML {{ui:Obnovit povrch z bodů}}.

### Zobrazení

- **Povrch**: {{ui:Stávající terén}} nebo {{ui:Navrhovaný (urovnaný)}}. Druhý je k dispozici, jakmile plošina nebo koridor upravuje terén bez problémů.
- **Vrstevnice po**, **Hlavní po** a **Pásma** (počet barevných pásem).
- Zaškrtávací pole: {{ui:Vrstevnice}}, {{ui:Popisky vrstevnic}}, {{ui:Trojúhelníky}}, {{ui:Pásma výšek}}, {{ui:Šipky sklonu}}, {{ui:Body}}, {{ui:Popisky bodů}}, {{ui:Lomové hrany}}, {{ui:Okraj povrchu}}, {{ui:Potrubí}}.
- Legenda výšek pásem se objeví, když jsou pásma zapnutá.

Nastavení zobrazení se ukládá s projektem, ale nejsou to kroky zpět: {{key:Mod+Z}} nikdy nevrátí zaškrtávací pole.

## Půdorys

Půdorys ukazuje body, povrch a vše, co navrhnete, v půdorysném pohledu se severem nahoře. Kolečkem přibližujete u ukazatele, tažením prázdného místa posouváte. Úplný seznam je v tématu [Klávesy a myš](topic:keyboard).

- Na prázdném projektu rámeček **Začněte zaměřovacími body** uvádí první kroky a nabízí {{ui:Otevřít ukázkové staveniště}}.
- Dokud je aktivní kreslicí nástroj, nápověda nahoře na půdorysu říká, kam kliknout a jak skončit.
- Přetažení souboru nad půdorys zobrazí „Přetáhněte soubor bodů, LandXML nebo projekt“.
- Vybrané věci jsou zvýrazněny. Vybraná osa trasy nebo plošina ukazuje čtvercové úchopy na svých PI nebo rozích; vybraný objekt ukazuje jeden úchop. Přetažením úchopu jej přesunete.
- Vybrané body zaměření mají kroužek. {{key:Shift}} a kliknutí přidá nebo odebere bod; {{key:Shift}} a tažení nakreslí rámeček (nebo, taženo kolem nich, laso), který přidá body uvnitř. Viz [Výběr, kopírování a vkládání bodů zaměření](topic:copy-paste-points).

## Podélný profil

Stiskem {{key:R}} nebo kliknutím na {{ui:Profil}} jej otevřete pod půdorysem. Jeho lišta má:

- seznam os tras (povolen, jsou-li dvě nebo více os)
- {{ui:Přidat PVI}}: dokud je stisknuto, kliknutí v profilu přidá PVI ({{key:I}} je přepíná)
- údaj o staničení, terénu, návrhové výšce, spádu a výkopu nebo násypu pod ukazatelem
- tlačítko zavřít

Profil ukazuje stávající terén, návrhový profil, spády na každé tečně, staničení a výšku každého PVI, L a K každého svislého oblouku s jeho BVC a EVC, vysoké a nízké body a svislé převýšení. Vždy přizpůsobí celou osu trasy: nezoomuje ani neposouvá. Pohyb ukazatele po něm umístí tečku na osu trasy v půdorysu.

## Pravý panel: Vlastnosti

Jeho nadpis říká, co zobrazuje.

- **Projekt** (nic nevybráno): osy tras a plošiny jako odkazy, blok **Zemní práce** a blok **Síť potrubí** s jeho pravidly a problémy.
- **Osa trasy**: název, počáteční staničení, délka, tabulka PI, oblouky, tabulka PVI návrhového profilu a údaje a nastavení **Koridoru**.
- **Plošina**: název, výška, sklony výkopu a násypu, plocha, údaje o hranici úprav a zemní práce.
- **Objekt** nebo **Potrubí**: rozměry, poklopy, dna, sklon, krytí a případné problémy.
- **Bod** a jeho číslo: souřadnice bodu, výška, popis a skupina (jen pro čtení).

Pole se projeví po stisku {{key:Enter}} nebo opuštění pole. Hodnota, která není přijata, se označí jako neplatná a nic se nezmění.

## Stavový řádek

- **E** a **N**: východní a severní souřadnice pod ukazatelem.
- Výška **Terénu** tam (a **Upraveno**, kde ji změnila plošina nebo koridor), nebo „Mimo povrch“.
- Nejbližší osa trasy (nebo vybraná) se **Sta** a odsazením (**L** nebo **R**) pod ukazatelem.
- Vpravo zprávy: co se právě stalo, nebo proč bylo něco odmítnuto. Zpráva po několika sekundách zmizí.

## Dialogy

- **Importovat body**: otevře se při každém souboru bodů. Viz [Import zaměřených bodů](topic:import-points).
- **Vykreslit půdorys do PDF**: viz [Vykreslení půdorysu do PDF](topic:plot-pdf).
- **Neuložené změny**: zeptá se, než {{ui:Nový}} nebo otevření projektu či souboru LandXML zahodí neuloženou práci. {{ui:Uložit kopii}} nejprve stáhne projekt.

## Malé obrazovky

Do šířky 760 pixelů, například na telefonu, si půdorys ponechává obrazovku: panel nástrojů je jeden řádek posouvaný do stran a panely se otevírají jako listy z lišty dole. {{ui:Nástroje}} skryje panel nástrojů a {{ui:Přesunout}} jej přesune dolů.
