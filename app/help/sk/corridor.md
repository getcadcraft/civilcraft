---
title: Vytvorenie cestného koridoru ťahaním profilu
summary: Zapnite koridor pre os trasy, nastavte hodnoty jazdného pruhu, krajnice a bočného sklonu a čítajte rezy, čiary napojenia na terén a zemné práce, ktoré vzniknú.
keywords: prevýšenie, super, sklon v oblúku, prechodnica, nábeh, tabuľka sklonov, priečny sklon, otočenie, koridor, zostava, subzostava, priečny profil, cesta, jazdný pruh, krajnica, priečny sklon, bočný sklon, napojenie na terén, zárez, násyp, rezy, cieľ, ciele, cieľ šírky, cieľ výšky, cieľ odsadenia, rozšírenie, hrana vozovky, nasledovať iný koridor
from: 91303189
---

Koridor ťahá jeden jednoduchý typický priečny profil (zostavu) pozdĺž osi trasy a jej návrhového profilu, upraví ho podľa jestvujúceho terénu a výsledok pridá do navrhovaného povrchu. Os trasy môže niesť viac koridorov na rôznych rozsahoch staničenia a koridor sa dá zostaviť zo znovupoužiteľných šablón podľa staničenia ([Šablóny koridorov](topic:corridor-templates)). Jednoduchá zostava nižšie je na oboch stranách rovnaká; ak chcete, aby mala každá strana vlastné časti, pozri [Zostavenie každej strany z častí](topic:corridor#build-each-side-from-parts).

## Zostava

Od osi trasy smerom von, na každej strane:

1. **jazdný pruh** zadanej šírky, klesajúci od hrebeňa vozovky pri **sklone jazdného pruhu**
2. **krajnica** zadanej šírky so **sklonom krajnice**
3. **bočný sklon** od hrany krajnice až po miesto, kde sa napája na terén: **sklon zárezu** tam, kde je terén nad ním, a **sklon násypu** tam, kde je pod ním

Východiskové hodnoty sú zástupné, nie projektová norma:

| Hodnota | US stopy | Metre |
|---|---|---|
| Šírka jazdného pruhu | 12 ft | 3.6 m |
| Sklon jazdného pruhu | 2 % | 2 % |
| Šírka krajnice | 4 ft | 1.2 m |
| Sklon krajnice | 4 % | 4 % |
| Sklon zárezu | 2 : 1 | 2 : 1 |
| Sklon násypu | 3 : 1 | 3 : 1 |
| Rez po každých | 10 ft | 5 m |

Sklony bočných svahov sú vodorovne ku zvislým (H:V): 3 : 1 znamená 3 vodorovne na 1 zvislo.

## Zostavenie koridoru

Potrebujete os trasy bez chýb a návrhový profil s aspoň dvoma PVI a bez chýb.

1. Vyberte os trasy.
2. V pravom paneli pod **Koridor** zaškrtnite **Ťahať zostavu pozdĺž návrhového profilu**.
   Polia sa zobrazia a koridor sa hneď zostaví. Pôdorys zobrazuje hrany jazdného pruhu a krajnice a čiary napojenia na terén; ak pod **Zobrazenie** zvolíte {{ui:Navrhovaný (upravený)}}, vrstevnice zobrazia nový terén.
3. Zmeňte ľubovoľnú hodnotu: **Šírka jazdného pruhu**, **Sklon jazdného pruhu**, **Šírka krajnice**, **Sklon krajnice**, **Sklon zárezu**, **Sklon násypu**, **Rez po každých**. Po každej stlačte {{key:Enter}}. Sklony zárezu, násypu a rozstup rezov musia byť väčšie ako 0.
4. Prečítajte riadok pod poľami, napríklad "39 rezov od 0+00.00 do 3+86.36; výkop 240.2 cu yd, násyp 556.0 cu yd."

Rezy sa vedú v každom kroku **Rez po každých**, na koncoch a na začiatku a konci každého horizontálneho a vertikálneho oblúka. Každý rez a čiary cez ne (os trasy, hrany jazdného pruhu a krajnice, napojenie na terén) sa stanú hranami zlomu navrhovaného povrchu.

Koridor vypnete tak, že zrušíte zaškrtnutie políčka. Jeho hodnoty sa uchovajú na nabudúce.

## Keď sa nezostaví

Červené políčko pod poľami uvádza dôvod:

| Správa | Čo robiť |
|---|---|
| "Koridor potrebuje návrhový profil bez chýb." | Pridajte PVI alebo opravte prekrývajúce sa vertikálne oblúky (pozri [Návrh vertikálneho profilu](topic:profile)). |
| "Návrhový profil sa neprekrýva s osou trasy." | Presuňte PVI na rozsah staničenia osi trasy. |
| "Koridor potrebuje aspoň dva rezy na povrchu." | Väčšina koridoru je mimo jestvujúceho terénu. |
| "4 bočné sklony sa dostanú mimo povrchu skôr, ako sa napoja na terén." | Pri okraji povrchu sklon nemôže dosiahnuť terén. Udržte cestu mimo okraja alebo tam znížte výšku násypu či zárezu. |
| "Čiary napojenia koridoru na terén sa križujú (rezy sa prekrývajú, napríklad na vnútornej strane tesného oblúka). Použite väčší polomer alebo užšiu zostavu." | Rezy na vnútornej strane ostrého oblúka sa prekrývajú. Zväčšite polomer alebo zúžte zostavu. |

Koridor s problémom sa nezapracuje do úpravy terénu a nezapočíta sa do zemných prác.

## Koridory a plošiny spolu

Navrhovaný povrch sa zostavuje v poradí: najprv každý koridor, potom každá plošina. Tam, kde úprava plošiny prekrýva koridor, má prednosť plošina. Objemy sa počítajú vo vnútri všetkých čiar napojenia na terén spolu; pozri [Objemy zemných prác](topic:volumes).

## Prevýšenie v oblúku

Cez oblúk môže byť cesta naklonená smerom dovnútra, takže doprava sa tlačí menej smerom von. V **Vlastnostiach** osi trasy zaškrtnite **Prevýšiť oblúky** pod **Prevýšenie v oblúku**:

- Každý kruhový oblúk dostane sadzbu **e** z tabuľky sadzieb: prvý riadok, ktorého polomer oblúk dosiahne (riadok s prázdnou sadzbou ponechá bežný hrebeň). Tabuľka a **Najväčší relatívny sklon** (na začiatku 0.5 %) sú zástupné hodnoty, nie norma: nastavte ich podľa vlastných návrhových kritérií. Riadky pridávajte alebo odstraňujte podľa potreby.
- Jazdné pruhy sa otáčajú okolo osi trasy. Pred oblúkom sa vonkajší pruh vyrovnáva cez **nábeh** (bežný hrebeň ÷ e × prechodnica), potom cez **prechodnicu** (šírka pruhu × e ÷ sklon) sa vonkajší pruh ďalej otáča, až kým celá cesta nepadá sklonom e smerom dovnútra; dve tretiny prechodnice ležia pred oblúkom a jedna tretina na ňom. Za oblúkom sa deje to isté v opačnom poradí.
- Krajnica na nižšej strane nikdy nie je plochšia než jej pruh; na vyššej strane si zachová vlastný sklon (prevalí sa).
- Tabuľka pod ním uvádza polomer, sadzbu, prechodnicu a nábeh každého oblúka a kde plné prevýšenie začína a končí. **Diagram prevýšenia** kreslí priečne sklony oboch pruhov pozdĺž staničenia (ľavý pruh plnou čiarou, pravý prerušovanou).
- Oblúk, ktorý je príliš krátky na dosiahnutie plného prevýšenia, alebo dva oblúky, ktorých prechody sa prekrývajú, sa uvedie v políčku nad tabuľkou.

Rezy, objemy, 3D zobrazenie a listy zobrazujú naklonenú cestu. Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť.

## Ciele

Cieľ presunie jeden bod jednej strany cesty na čiaru: **Hranu vozovky** alebo **Hranu krajnice**, na **ľavej** alebo na **pravej** strane. Každý rez stretáva čiaru kolmo na os trasy a ide smerom von iba na tej strane, takže cieľ na pravej strane nikdy nepresunie ľavú stranu.

| Nastavuje | Čo sa stane, kde rez stretne čiaru |
|---|---|
| **Šírku** | Bod leží na čiare: jazdný pruh (alebo krajnica) sa k nej rozšíri alebo zúži a zachová svoj priečny sklon. |
| **Výšku** | Bod tam prevezme výšku čiary pri vlastnom odsadení: priečny sklon pruhu (alebo krajnice) sa podľa toho prispôsobí. |

Čiarou môže byť charakteristická čiara (nech je jej **Použitie** akékoľvek) alebo čiara iného koridoru: jeho os trasy, hrany vozovky, hrany krajnice alebo čiary napojenia na terén. Čiara koridoru nasleduje tento koridor: zmeníte druhú cestu a táto sa podľa nej prispôsobí. CivilCraft zostaví najskôr druhý koridor; dva koridory, ktoré by sa navzájom cielili v slučke, sa na jednej strane odmietnu a tabuľka uvedie, ktorá.

1. Vyberte os trasy a zapnite jej koridor.
2. Pod **Ciele** kliknite na {{ui:Pridať cieľ}}.
3. Vyberte **Stranu**, **Bod**, čo **Nastavuje** a **Na čiaru**. Každá zmena je jeden krok späť.

**Výsledok** uvádza, pri koľkých rezoch sa čiara dosiahla. Rezy, ktoré ju nedosiahnu (za jej koncami alebo tam, kde je za osou trasy), si ponechajú hodnoty zostavy. Ak sa čiara zmaže, koridor zostane taký, aký bol pred cieľom, a tabuľka to uvedie. Jedna strana môže mať jeden cieľ šírky a jeden cieľ výšky pre každý bod.

## Zostavenie každej strany z častí

Pod nastaveniami koridoru zapnite **Zostaviť každú stranu z častí**. Každá strana potom má vlastný zoznam od osi trasy smerom von: jazdné pruhy, krajnicu, žľab, obrubník, pás zelene, chodník a nakoniec bočný sklon k terénu (s vlastnými pomermi zárezu a násypu). Začnite od {{ui:Vidiecka cesta}} alebo {{ui:Mestská ulica}}, pridávajte a odstraňujte časti, presúvajte ich šípkami a {{ui:Kopírovať}} jednu stranu na druhú. Každá zmena je jeden krok späť.

Priečny sklon je pokles smerom od cesty, takže chodník, ktorý odvodňuje ku ceste, má záporný sklon. Obrubník je stena zadanej výšky, horná plocha zadanej šírky a voliteľný spád na zadnej strane. Prevýšenie otáča každý pruh v prvom riadku; žľab, obrubník, pás a chodník visia od hrany pruhov podľa toho, ako boli zostavené. Ciele stále presúvajú koniec pruhov a poslednú časť. Priečne rezy označujú dno žľabu, hornú a zadnú hranu obrubníka a ostatné. Pri oblúku so špirálami je prechodnica špirála: rovný hrebeň v TS, plné prevýšenie v SC.

## Vrstvy vozovky

Jazdný pruh, krajnica, žľab, pás zelene alebo chodník môže niesť svoju skladbu: pod časťou {{ui:Pridať vrstvu}} pridá vrstvu s názvom, materiálom, hrúbkou a druhom (povrchová, spojovacia, podkladová, podložná, zemná pláň alebo iná), zhora nadol. Vrstvy nemenia povrch cesty (jeho horná plocha je navrhovaný povrch); každá leží pod svojou časťou a jej hĺbka sa meria priamo nadol. Priečne rezy kreslia spodok každej vrstvy prerušovanou čiarou a {{ui:Vrstvy vozovky: množstvá}} uvádza plochu v pôdoryse a objem každej vrstvy (plocha pozdĺž koridoru z jeho rezov, objem = plocha × hrúbka). Export IFC zapisuje každú vrstvu ako vlastný prvok s jej hrúbkou a materiálom (pozri [Export a import IFC](topic:ifc)). Hrúbku, ktorú zadáte, určujete vy: CivilCraft nenavrhuje rozmery vozoviek.

## Čo ešte nie je hotové

Ciele pre sklon napojenia na terén zatiaľ nie sú k dispozícii. Pre koridor, ktorý sa mení pozdĺž cesty, s oddelenou ľavou a pravou stranou, použite [Šablóny koridorov](topic:corridor-templates). Pozri [Ešte nie je hotové](topic:not-built-yet).
