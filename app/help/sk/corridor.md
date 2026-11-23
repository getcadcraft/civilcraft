---
title: Cestný koridor ťahaním po dráhe
summary: Zapnite koridor pre os trasy, nastavte hodnoty jazdných pruhov, krajníc a bočných svahov a prečítajte si rezy, čiary napojenia na terén a zemné práce, ktoré vzniknú.
keywords: križovatka, prienik, cesta pri ceste, vedľajšia cesta, T-križovatka, kríženie, úroveň plošiny, napojenie, nadviazanie, prevýšenie v oblúku, super, sklon v oblúku, dĺžka prechodu, dĺžka náběhu, tabuľka sadzieb, priečny spád, otočenie, koridor, zostava, podzostava, typický priečny rez, cesta, jazdný pruh, krajnica, priečny spád, bočný svah, výkop, násyp, rezy, cieľ, ciele, cieľ šírky, cieľ výšky, cieľ odsadenia, rozšírenie, hrana vozovky, nasledovať iný koridor
from: 6dcb92b3
---

Koridor ťahaním po dráhe prevedie jeden jednoduchý typický priečny rez (zostavu) pozdĺž osi trasy a jej projektovaného pozdĺžneho profilu, upraví ho podľa existujúceho terénu a pridá výsledok k navrhovanému povrchu. Jedna os trasy môže niesť viacero koridorov na rôznych úsekoch staničenia a koridor sa dá zostaviť zo znovupoužiteľných šablón podľa staničenia ([Šablóny koridorov](topic:corridor-templates)). Jednoduchá zostava nižšie je na oboch stranách rovnaká. Ak má každá strana vlastné časti, pozrite [Zostavenie každej strany z častí](topic:corridor#build-each-side-from-parts).

## Zostava

Od osi trasy smerom von, na každej strane:

1. **jazdný pruh** danej šírky, klesajúci od hrebeňa vozovky so **sklonom jazdného pruhu**
2. **krajnica** danej šírky so **sklonom krajnice**
3. **bočný svah** od hrany krajnice po miesto, kde sa stretne s terénom: **svah výkopu**, ak je terén nad ním, a **svah násypu**, ak je pod ním

Východiskové hodnoty sú zástupné, nie projektová norma:

| Hodnota | US stopy | Metre |
|---|---|---|
| Šírka jazdného pruhu | 12 ft | 3.6 m |
| Sklon jazdného pruhu | 2 % | 2 % |
| Šírka krajnice | 4 ft | 1.2 m |
| Sklon krajnice | 4 % | 4 % |
| Svah výkopu | 2 : 1 | 2 : 1 |
| Svah násypu | 3 : 1 | 3 : 1 |
| Rez každých | 10 ft | 5 m |

Sklony bočných svahov sú vodorovné ku zvislým (H:V): 3 : 1 znamená 3 jednotky vodorovne na 1 jednotku zvisle.

## Vytvorenie koridoru

Potrebujete os trasy bez chýb a projektový profil s aspoň dvoma PVI a bez chýb.

1. Vyberte os trasy.
2. V pravom paneli v časti **Koridor** zaškrtnite **Ťahať zostavu po projektovom profile**.
   Polia sa zobrazia a koridor sa hneď vytvorí. Pôdorys ukazuje hrany jazdného pruhu a krajnice a čiary napojenia na terén; ak je v časti **Zobrazenie** zvolené {{ui:Navrhovaný (upravený)}}, vrstevnice zobrazujú nový terén.
3. Zmeňte ľubovoľnú hodnotu: **Šírka jazdného pruhu**, **Sklon jazdného pruhu**, **Šírka krajnice**, **Sklon krajnice**, **Svah výkopu**, **Svah násypu**, **Rez každých**. Po každej stlačte {{key:Enter}}. Výkop, násyp a rozstup rezov musia byť väčšie ako 0.
4. Prečítajte si riadok pod poľami, napríklad „39 rezov od 0+00.00 do 3+86.36; výkop 240.2 cu yd, násyp 556.0 cu yd.“

Rezy sa vedú v každom kroku **Rez každých**, na koncoch a na začiatku a konci každého vodorovného a zvislého oblúka. Každý rez a čiary cez ne (os trasy, hrany jazdného pruhu a krajnice, čiara napojenia na terén) sa stanú hranami zlomu navrhovaného povrchu.

Koridor vypnete zrušením zaškrtnutia. Jeho hodnoty sa zachovajú na ďalšie použitie.

## Ak sa nevytvorí

Červené pole pod poľami uvádza dôvod:

| Správa | Čo robiť |
|---|---|
| "Koridor potrebuje projektový profil bez chýb." | Pridajte PVI alebo opravte prekrývajúce sa zvislé oblúky (pozri [Navrhnite zvislý profil](topic:profile)). |
| "Projektový profil sa neprekrýva s osou trasy." | Presuňte PVI do rozsahu staničenia osi trasy. |
| "Koridor potrebuje na povrchu aspoň dva rezy." | Väčšina koridoru je mimo existujúceho terénu. |
| "4 bočné svahy vybiehajú z povrchu skôr, ako sa stretnú s terénom." | Pri okraji povrchu svah nedosiahne terén. Udržte cestu ďalej od okraja alebo tam znížte výšku násypu alebo výkopu. |
| "Čiary napojenia koridoru sa križujú (rezy sa prekrývajú, napríklad na vnútornej strane tesného oblúka). Použite väčší polomer alebo užšiu zostavu." | Rezy na vnútornej strane ostrého oblúka sa prekrývajú. Zväčšite polomer alebo zúžte zostavu. |

Koridor s problémom sa nezapracuje do terénu a nezapočíta sa do zemných prác.

## Koridory a plošiny spolu

Navrhovaný povrch sa vytvára v poradí: najprv všetky koridory, potom všetky plošiny. Tam, kde úprava plošiny prekrýva koridor, má prednosť plošina. Tam, kde neskoršia položka prekrýva cestu, sa nahradí iba tá časť cesty, ktorá leží vnútri čiary napojenia neskoršej položky; zvyšok cesty a každá hrana zlomu terénu, ktorú cesta križuje, si zachová svoj tvar. Objemy sa počítajú vnútri všetkých čiar napojenia spolu; pozri [Objemy zemných prác](topic:volumes).

## Prevýšenie v oblúku

V oblúku môže cesta nakláňať dovnútra, aby sa vodiči menej tlačili smerom von. Zaškrtnite **Prevýšiť oblúky** pod **Prevýšenie** vo **Vlastnostiach** osi trasy:

- Každý kruhový oblúk dostane sadzbu **e** z tabuľky sadzieb: prvý riadok, ktorého polomeru oblúk dosiahne (riadok s prázdnou sadzbou ponechá normálny spád). Tabuľka a **Maximálny relatívny sklon** (0.5 % na začiatku) sú zástupné hodnoty, nie norma: nastavte ich podľa vlastných projektových kritérií. Riadky pridávajte alebo odstraňujte podľa potreby.
- Jazdné pruhy sa otáčajú okolo osi trasy. Pred oblúkom sa vonkajší pruh vyrovná na **dĺžke náběhu** (normálny spád ÷ e × dĺžka prechodu), potom na **dĺžke prechodu** (šírka jazdného pruhu × e ÷ sklon) vonkajší pruh pokračuje v otáčaní, až celá cesta klesá sklonom e smerom dovnútra; dve tretiny dĺžky prechodu ležia pred oblúkom a jedna tretina na ňom. Za oblúkom sa to deje v opačnom poradí.
- Krajnica na nízkej strane nikdy nie je ploššia ako jej jazdný pruh; na vysokej strane si zachová vlastný sklon (prevalí sa).
- Tabuľka pod ním uvádza polomer, sadzbu, dĺžku prechodu a náběhu každého oblúka a miesta, kde začína a končí plné prevýšenie. **Schéma prevýšenia** kreslí priečne sklony oboch pruhov pozdĺž staničení (ľavý pruh plnou čiarou, pravý prerušovanou).
- Oblúk, ktorý je príliš krátky na dosiahnutie plného prevýšenia, alebo dva oblúky, ktorých prechody sa prekrývajú, sa uvedú v poli nad tabuľkou.

Rezy, objemy, 3D pohľad a listy zobrazujú naklonenú cestu. Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť.

## Ciele

Cieľ posunie jeden bod jednej strany cesty na čiaru: **Hrana vozovky** alebo **Hrana krajnice**, na **ľavej** alebo **pravej** strane. Každý rez stretne čiaru kolmo na os trasy a ide smerom von iba na tej strane, takže cieľ vpravo nikdy nepohne ľavou stranou.

| Nastavuje | Čo sa stane tam, kde rez stretne čiaru |
|---|---|
| **Šírku** | Bod leží na čiare: jazdný pruh (alebo krajnica) sa k nej rozšíri alebo zúži a zachová svoj priečny sklon. |
| **Výšku** | Bod tam prevezme výšku čiary vo svojom vlastnom odsadení; priečny sklon jazdného pruhu (alebo krajnice) ho nasleduje. |

Čiara môže byť charakteristická čiara (bez ohľadu na jej **Použitie**) alebo čiara iného koridoru: jeho os trasy, hrany vozovky, hrany krajníc alebo čiary napojenia. Čiara koridoru sleduje tento koridor: zmeníte druhú cestu a táto ju bude nasledovať. CivilCraft najprv vytvorí druhý koridor; dva koridory, ktoré by sa navzájom cieľovali v slučke, sa na jednej strane zamietnu a tabuľka povie, ktorá.

1. Vyberte os trasy a zapnite jej koridor.
2. V časti **Ciele** kliknite na {{ui:Pridať cieľ}}.
3. Zvoľte **Stranu**, **Bod**, čo **Nastavuje** a **Na čiaru**. Každá zmena je jeden krok späť.

**Výsledok** uvádza, pri koľkých rezoch sa čiara dosiahla. Rezy, ktoré čiaru nedosiahnu (za jej koncami alebo tam, kde je za osou trasy), si zachovajú hodnoty zostavy. Ak sa čiara vymaže, koridor zostane taký, aký bol pred cieľom, a tabuľka to uvedie. Jedna strana môže mať jeden cieľ šírky a jeden cieľ výšky pre každý bod.

## Zostavenie každej strany z častí

Zapnite **Zostaviť každú stranu z častí** v nastaveniach koridoru. Každá strana potom má vlastný zoznam, od osi trasy smerom von: jazdné pruhy, krajnicu, odvodňovací žľab, obrubník, zelený pás, chodník a na konci bočný svah k terénu (s vlastnými pomermi výkopu a násypu). Začnite od {{ui:Vidiecka cesta}} alebo {{ui:Mestská ulica}}, pridávajte a odstraňujte časti, presúvajte ich šípkami a {{ui:Kopírovať}} jednu stranu na druhú. Každá zmena je jeden krok späť.

Priečny sklon je spád smerom od cesty, takže chodník, ktorý odvádza vodu k ceste, má záporné hodnoty. Obrubník je plocha s výškou, ktorú zadáte, vrch so šírkou, ktorú zadáte, a voliteľný spád na zadnej strane. Prevýšenie otáča všetky jazdné pruhy v prvom riadku; odvodňovací žľab, obrubník, pás a chodník visia z hrany jazdných pruhov tak, ako sú postavené. Ciele stále posúvajú koniec jazdných pruhov a poslednú časť. Priečne rezy označujú dno odvodňovacieho žľabu, hornú a zadnú hranu obrubníka a ďalšie. Na oblúku s prechodnicami je prechodová dĺžka samotná prechodnica: vodorovný hrebeň v TS, plné prevýšenie v SC.

## Vrstvy vozovky

Jazdný pruh, krajnica, odvodňovací žľab, pás alebo chodník môžu niesť svoju skladbu: pod časťou pridáte vrstvu cez {{ui:Pridať vrstvu}}, s názvom, materiálom, hrúbkou a druhom (povrchová, spojovacia, základová, podkladová, ochranná alebo iná), zhora nadol. Vrstvy nemenia povrch cesty (jej vrch je projektový povrch); každá leží pod svojou časťou a jej hĺbka sa meria kolmo nadol. Priečne rezy kreslia spodok každej vrstvy prerušovanou čiarou a {{ui:Vrstvy vozovky: množstvá}} uvádza pôdorysnú plochu a objem každej vrstvy (plocha pozdĺž koridoru z jeho rezov, objem = plocha × hrúbka). Export IFC zapíše každú vrstvu ako samostatný prvok s hrúbkou a materiálom (pozri [Export a import IFC](topic:ifc)). Hrúbka, ktorú zadáte, je vaša: CivilCraft vozovky nedimenzuje.

## Kde cesty stretávajú cesty, plošiny a chodníky

Pri zapnutom {{ui:Pripojiť k cestám a plošinám, ktoré stretáva}} (zapnuté pri každom koridore) CivilCraft v pôdoryse pripojí koridor k tomu, čo stretáva:

- **Cesta, ktorá končí na inej ceste** (koniec jej osi trasy leží na druhej ceste alebo do približne polovice šírky vlastnej vozovky od jej hrany) je vedľajšou cestou križovatky. Hlavná cesta, na ktorú narazí, otvorí svoju hranu pre vozovku vedľajšej cesty: cez ústie sa krajnica, obrubník, pás a chodník položia na priečny sklon jazdného pruhu a kreslia sa ako vozovka. Vedľajšia cesta sa položí na povrch hlavnej cesty tam, kde sa obe prekrývajú, a pozvoľne sa k nemu zdvihne alebo spustí cez nájazd.
- **Dve cesty, ktoré sa križujú**, sa spoja rovnako na oboch stranách. Cesta uvedená ako prvá v **Osiach trás** je hlavná cesta; druhá sleduje jej povrch cez križovatku.
- **Cesta, ktorá končí na plošine** (vnútri nej alebo do približne polovice šírky vozovky od jej hrany) dosiahne úroveň plošiny a pozvoľne sa k nej prispôsobí cez nájazd.
- **Chodník** (Krajina › Spevnené plochy) sa zastaví na vonkajšej hrane cesty, na úrovni chodníka alebo krajnice tam, namiesto toho aby ležal na ceste. Chodník, ktorý križuje cestu, sa rozdelí na dve časti. Koniec nakreslený kratšie od cesty (do dvojnásobku šírky chodníka) sa predĺži až k jej hrane.

**Vlastnosti** uvádzajú, čo každý koridor spojil, o koľko tam bol zdvihnutý alebo spustený a na akej dĺžke. Táto dĺžka je väčšia z 10 m (30 ft) a dvadsaťnásobku zmeny a nikdy nie viac ako 45 % koridoru. **Projektový profil sa nemení**: pohľad na profil stále ukazuje čiaru spádu, ktorú ste nakreslili, a rezy, navrhovaný povrch, objemy a 3D pohľad zobrazujú cestu tak, ako je spojená. Ak chcete spojenie urobiť presne projektom, presuňte posledné PVI na úroveň, ktorú uvádzajú Vlastnosti.

Vypnutím prepínača na koridore ho ponecháte presne podľa jeho profilu a zostavy; potom sa nezúčastní žiadnej križovatky, ani ako vedľajšia, ani ako hlavná cesta. Cesty, ktoré sa stretajú takmer v priamke (pod asi 20°), zostávajú nedotknuté, rovnako ako poľné cesty.

Čo križovatka zatiaľ nerobí: nie sú tu zaoblenia obrubníkov (rohy sú pravouhlé), nie sú odbočovacie pruhy ani ostrovčeky, koniec vedľajšej cesty sa seká kolmo na jej vlastnú os trasy a koridor zostavený zo šablón otvorí svoju hranu rovnako jednoducho (priekopa alebo múr v jeho koncovej podmienke sa vyrovnajú cez ústie, bez priepustu). Pôdorysné zaoblenia obrubníkov, rozhľadové trojuholníky a vodorovné značenie pozri v [Pôdy, cesty, zameranie, bane a spoje](topic:soils-roads-survey-mines-links).

## Čo ešte nie je hotové

Ciele pre sklon napojenia na terén ešte nie sú k dispozícii. Pre koridor, ktorý sa mení pozdĺž cesty, s ľavou a pravou stranou nastavenými oddelene, použite [Šablóny koridorov](topic:corridor-templates). Pozri [Ešte nie je hotové](topic:not-built-yet).
