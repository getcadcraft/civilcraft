---
title: Přechod z jiného inženýrského softwaru
summary: Jak známé postupy navrhování inženýrských staveb odpovídají CivilCraftu a rozdíly, které zkušené uživatele potkají v první hodině.
keywords: přechod, migrace, známé, rozdíly, postup, příkazy, mapování, cogo, koridor, úpravy terénu, síť potrubí, styly, příkazový řádek
from: feae37d6
---

Pokud jste pracovali s Civil 3D, už znáte myšlenky v CivilCraftu: body a skupiny bodů, povrchy TIN s lomovými hranami a hranicemi, osy trasy podle PI, profily podle PVI, sestavy vytažené do koridorů, úpravy terénu napojené na stávající terén, gravitační sítě potrubí, LandXML. Liší se skoro všechno kolem nich: není tu soubor výkresu, není příkazový řádek (pokud nevyberete styl nabídek {{ui:Drafting classic}}), nejsou tu styly, žádný Prospector a žádné dialogy nastavení. CivilCraft je malý, zaměřený nástroj v prohlížeči a v této verzi dělá zlomek toho, co plný inženýrský balík. Tato stránka mapuje, co znáte, na to, co tu je.

:::tip
Pokud se Vám líbí pás Civil 3D, zvolte styl nabídek {{ui:Civil ribbon}} v {{ui:Settings}} › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}: karty Domů, Povrchy, Úpravy, Geolokace, Pohled a Výstup, prostřední tlačítko posouvá a {{key:Shift}} s prostředním tlačítkem otáčí 3D pohled. Pokud píšete příkazy, {{ui:Drafting classic}} přidá příkazový řádek (ALIGNMENT, PAD, PROFILE, ZOOM …). Viz [Nabídky, klávesy a myš](topic:menus-keys-and-mouse).
:::

## Mapa postupů

| Co chcete udělat | Známý postup | V CivilCraftu |
|---|---|---|
| Přinést geodetické body | Import bodů ze souboru bodů | {{ui:Open}}, pak zkontrolujte pořadí sloupců v **Import bodů** ([Import geodetických bodů](topic:import-points)) |
| Třídit body | Skupiny bodů, klíče popisu | Automatické skupiny podle prvního slova popisu; žádné klíče popisu |
| Upravit bod | Editor bodů, úchyty | Klikněte na něj a upravte hodnoty ve Vlastnostech, nebo ho přetáhněte ([Úprava geodetického bodu](topic:edit-points)) |
| Sestavit stávající terén | Vytvořit povrch, přidat skupiny bodů jako data | Automaticky: povrch se přepočítá vždy, když se změní jeho vstupy |
| Přidat lomové hrany | Přidat lomové hrany z polylinií nebo charakteristických čar | Nastavte skupinu bodů na {{ui:Breakline}}, nebo klikejte na body nástrojem {{ui:Breakline}} ({{key:B}}) |
| Oříznout povrch | Vnější hranice, skrytá hranice, maximální délka trojúhelníku | {{ui:Boundary}} ({{key:O}}, jen vnější) a **Nejdelší vnější hrana** |
| Zobrazit vrstevnice | Styl povrchu | **Zobrazení** v levém panelu: interval, hlavní každých, popisky, pásy, šipky sklonu |
| Navrhnout osu | Nástroje pro tvorbu osy, nastavení oblouků a přechodnic | {{ui:Alignment}} ({{key:A}}): klikejte na PI, {{key:Enter}}; poloměry a délky přechodnic v tabulce PI |
| Vytvořit pohled na profil | Průvodce pohledem na profil, pásy | {{ui:Profile}} ({{key:R}}): jeden pohled na profil pod půdorysem, vždy přizpůsobený |
| Navrhnout sklon | Nástroje pro návrh podélného profilu | {{ui:Start from the ground}}, {{ui:Add PVIs}} ({{key:I}}), přetáhněte PVI, zadejte **Oblouk L** |
| Postavit silnici | Sestava, podsestavy, koridor, cíle, oblasti | Zaškrtněte **Protáhnout sestavu podél návrhového profilu** pod osou; jízdní pruh, krajnice a boční svah na každé straně, nebo každá strana sestavená z dílů (žlab, obrubník, chodník …) |
| Upravit plošinu | Charakteristické čáry, skupiny úprav terénu, kritéria úprav | {{ui:Pad}} ({{key:G}}): rovná plošina se svahy výkopu a násypu napojenými na terén |
| Spočítat zemní práce | Objemové povrchy, přehled objemů | **Zemní práce** v pravém panelu, metoda mřížky, aktualizuje se živě |
| Navrhnout dešťovou nebo splaškovou kanalizaci | Síť potrubí se seznamem dílů, pravidla | {{ui:Pipes}} ({{key:P}}): klikejte na objekty po proudu; tři pravidla, která nastavíte; automatické kóty den |
| Výměna s ostatními | Import a export LandXML | {{ui:Open}} souboru LandXML; {{ui:LandXML}} pro export ([Výměna LandXML](topic:landxml)) |
| Poslat čáry do CADu | Export do DWG | {{ui:DWG}} (formát 2000 až 2018) nebo {{ui:DXF}} (R12) |
| Vykreslit | Rozvržení, výřezy, sady listů | {{ui:PDF}}: jeden list na šířku s půdorysem ve zvoleném měřítku; listy půdorysu a profilu a listy řezů jako PDF |
| Sdílet práci mezi soubory | Datové zkratky, odkazy | Není k dispozici: jeden projekt na soubor |
| Zpět | Zpět | {{key:Mod+Z}} a {{key:Mod+Y}}, 200 kroků; nastavení zobrazení nejsou kroky zpět |

## Rozdíly, které lidi potrefí

**Není tu příkazový řádek**, pokud nevyberete styl nabídek {{ui:Drafting classic}}. Nástroje jsou tlačítka na panelu a jednopísmenné klávesy: {{key:A}} osa, {{key:G}} plošina, {{key:P}} potrubí, {{key:B}} lomová hrana, {{key:O}} hranice, {{key:R}} profil, {{key:I}} přidat PVI, {{key:V}} výběr, {{key:F}} přizpůsobit. V ostatních stylech nabídek psaní názvu příkazu nedělá nic. Viz [Klávesy a myš](topic:keyboard).

**Enter dokončí; dvojklik je riskantní.** Klikněte na poslední bod jednou a pak stiskněte {{key:Enter}}. V této verzi dvojklik také dokončí, ale odstraní bod, na který jste dvakrát klikli. Pravé tlačítko nedokončuje ani neopakuje; jen posouvá, když s ním táhnete.

**Všechno je pořád dynamické.** Změníte-li skupinu bodů, poloměr, PVI nebo sklon plošiny, povrch, vrstevnice, koridor, čáry napojení na terén a objemy se okamžitě aktualizují. Nic se nepřepočítává a nic není zastaralé.

**Nic není objekt výkresu.** Půdorys je pohled na návrh, ne výkres, který lze upravovat příkazy CADu. Nemůžete přidávat vlastní čáry nebo text, měnit barvu vrstvy ani nic rozložit. Exportujte do DXF a dokončete výkres v CAD programu.

**Žádné styly.** Barvy, tloušťky čar, velikosti popisků a názvy vrstev jsou pevné (viz [Vrstvy půdorysu](topic:plan-layers)). Papír a Model v liště aplikace přepínají mezi světlou a tmavou obrazovkou.

**Jeden z každého.** Jeden povrch stávajícího terénu, jeden výsledek úprav, jedna síť potrubí na projekt. Mnoho os a plošin je v pořádku.

**Jednotky jsou jen popisky.** Volba {{ui:US feet}} nebo {{ui:Metres}} nic nepřevádí. Měřítko výkresu neexistuje. Souřadnicový systém je volitelný: nastavte jej v {{ui:Coordinates}} a nic se nepohne; jen říká, co čísla znamenají (viz [Nastavení souřadnicového systému projektu](topic:coordinate-systems)). Stopy se při zápisu do LandXML berou jako americké geodetické stopy.

**Skupiny lomových hran se spojují v pořadí čísel bodů.** Skupina nastavená na {{ui:Breakline}} se stane jednou čarou procházející všemi jejími body v pořadí čísel. Sdílené kódy (dvě tokové čáry kódované „FL“) dají jednu klikatou čáru; ty kreslete ručně.

**Staničení vypadá stejně, metry se liší.** Stopy používají staničení po 100 ft (12+34.56); metry používají staničení po 1000 m (1+234.567).

**Mazání na Macu.** Klávesa označená delete je v prohlížeči Backspace. Pro smazání výběru použijte Fn a delete, nebo tlačítko {{ui:Delete}}.

**Soubory se stahují.** {{ui:Save}} stáhne soubor `.civilcraft.json` pokaždé; neexistuje „uložit přes otevřený soubor“. Kopie neuložené práce se uchovává v tomto prohlížeči ([Obnovení neuložené práce](common:recover)). Otevření souboru bodů nahradí body bez dotazu. Viz [Soubory, které lze otevřít, uložit a exportovat](topic:files).

**Pravidla určujete Vy.** Pravidla sítě potrubí a sestava koridoru začínají zástupnými hodnotami, které nejsou žádný standard. Před důvěrou v jakoukoli kontrolu nastavte vlastní.

**Objemy jsou založeny na mřížce.** Výkop a násyp vycházejí z jemné mřížky mezi oběma povrchy, uvnitř čar napojení na terén, bez nabobtnání a smrštění. Jsou blízké, ale ne stejné jako objem mezi TIN a TIN.

## Co chybí

Přechodnice jiné než klotoidní, sestavy, které se mění podél silnice, plošiny se sklonem, kapacita vtoků a retence, katalogy dílů, potrubí v profilu, rozvržení parcel a vymezení parcel, vyrovnání metodou nejmenších čtverců a databáze zaměření, otevírání DWG a další. Úplný seznam s tím, co dělat místo toho, je v [Ještě není hotovo](topic:not-built-yet).
