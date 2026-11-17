---
title: Novinky vo verzii 0.9
summary: Šablóny koridorov a terénu, prichytávanie a tlačidlá Vybrať bod pri kreslení, analýza GIS s tabuľkou atribútov, štúdie tieňa, výnosu energie, pohodlia a vetra pre stavenisko, 3D pohľad Vykreslenie a doplnky Bodové mračná a WaterCraft.
keywords: novinky, 0.9, poznámky k vydaniu, šablóny koridorov, šablóny terénu, editor šablón, typický rez, viac koridorov, prichytávanie, uchopenie, vybrať bod, presun, kopírovanie, otočenie, dotyčnica, vykreslenie, 3d vykreslenie, analýza gis, pufer, prekrytie, priestorové spojenie, tabuľka atribútov, štýl podľa atribútu, štúdia tieňa, výnos solárnej energie, utci, vonkajšie pohodlie, štúdia vetra, openfoam, bodové mračná, las, laz, watercraft, požiarny prietok, hydrant, vek vody, chlór, odbery, popisky, rozloženie, novinky, poznámky k vydaniu, zmeny, 0.8, 0.8.1, verzia, nové funkcie, dážď, dažďová kanalizácia, zaplavovanie, presahovanie, zemné práce, bilancia, výkop a násyp, odvoz, najlepšia trasa, najmenšie náklady, trasa, retenčná nádrž, odtok, pokles hladiny, voľná výška, postup, meranie, dron, zásobník, adresa na stavenisko, parcela, pôda, povodeň, stabilita svahu, bishop, sadanie, križovatka, značenie, značky, rozhľad, vyrovnanie, metóda najmenších štvorcov, polygónový ťah, povrchová baňa, blokový model, rádiový spoj, fresnelova zóna, výhybka, križovatka koľají, jazyky, problémy, live, dwg
from: d7ac5b14
---

Toto sa zmenilo v CivilCraft 0.9 oproti verzii 0.8.1. CivilCraft 0.9 je súčasťou CadCraft Studio 0.9 a jeho ôsmich aplikácií. Veľké časti sú šablóny koridorov a terénu, prichytávanie pri kreslení, analýza GIS, štúdie slnka, výnosu solárnej energie, pohodlia a vetra na stavenisku a dva doplnky: Bodové mračná a WaterCraft.

## Nové

### Šablóny koridorov a terénu

- **Šablóny koridorov.** Otvorte {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (alebo napíšte {{cmd:TEMPLATES}}). Šablóna je malý priečny rez s komponentmi, odsadeniami, sklonmi, materiálmi a kódmi bodov. Uchovávajte ich v projekte, v {{ui:My library}} alebo ako súbor `.cctemplates.json`. Editor šablón zobrazuje výkres v skutočnej mierke a pri písaní vypisuje problémy.
- **Stavanie zo šablón podľa staničenia.** Vyberte trasu a zapnite {{ui:Build from templates by station}} v jej Vlastnostiach. Každá strana každého regiónu má vlastný zoznam vozovky a vlastný koncový stav. {{ui:Add a corridor}} pod {{ui:Corridors on this alignment}} umiestni na jednu trasu viac koridorov.
- **Šablóny terénu.** {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (alebo napíšte {{cmd:TERRAINTEMPLATES}}) prekryje terén vrstvenými materiálmi, napríklad ornicou alebo vozovkou a podkladom, s plochou a objemom pre každú vrstvu. Pozri [Šablóny koridorov a šablóny terénu](topic:corridor-templates).

### Kreslenie

- **Prichytávanie.** Nástroje Trasa, Podložka, Parcela, Hmota, Čiara prvku, Meranie, Hranica a Povodie sa prichytávajú k bodom zamerania, PI, rohom, vrcholom a stavbám, so štítkom pri značke. Podržte {{key:Alt}} pre voľný bod.
- **Tlačidlá Vybrať bod, dotyčnica a presun, kopírovanie, otočenie.** Rohy podložky, parcely a čiary prvku majú políčka pre Východ a Sever zadané číslom a tlačidlo Vybrať bod so zameriavacím krížom. Vlastnosti majú tiež {{ui:Tangent from two points}} pre trasy a {{ui:Move, copy and rotate}} pre trasy, podložky, parcely a čiary prvku. Pozri [Kreslenie s prichytávaním, vybranými rohmi a presunom, kopírovaním, otočením](topic:draft-with-snaps).
- **3D pohľad Vykreslenie.** Tlačidlo {{ui:Render}} na paneli 3D kreslí krajinu s prirodzenými farbami, oblohou, oparom a jemnými tieňmi. Model nemení. Ponuka {{ui:Sun}} má teraz tlačidlá {{ui:Apply}} a {{ui:Close}}. Pozri [Pohľad na stavenisko v 3D](topic:site-3d).
- **Panely sa otvárajú po jednej časti.** Ľavý panel a panel Vlastností otvoria jednu časť a ostatné zavrú; a dlaždice pásu Krajina, ktoré obsahujú viac nástrojov, sú rozdelené tlačidlá.

### Analýza GIS

- **Analyzovať.** {{ui:Surface}} › {{ui:More}} › {{ui:Analyze}} ponúka pufer, prekrytie, priestorové spojenie, výber podľa atribútu alebo tvaru a meranie. Každý nástroj vytvorí novú vrstvu v jednom kroku späť.
- **Tabuľka atribútov.** Ponuka troch bodiek pri vrstve obsahuje {{ui:Attribute table…}} a {{ui:Style by attribute…}}. Pozri [Analýza vrstiev GIS](topic:gis-analysis) a [Práca s tabuľkou atribútov vrstvy](topic:gis-table).

### Stavenisko: slnko, solárna energia, pohodlie a vietor

- **Časť Prostredie.** Vyberte hmotu: časť {{ui:Environment}} je pod {{ui:Sun hours}} v jej Vlastnostiach. Má štúdiu tieňa (mapa, tabuľka, animácia, CSV), výnos solárnej energie z súboru typického roka počasia (.epw) a vonkajšie pohodlie (UTCI).
- **Vietor, iba na orientačné posúdenie.** {{ui:Run wind study}} vyfarbí zem od sedenia po nepohodlie pre každý smer vetra v súbore počasia. Nie je overený a panel to hovorí.
- **Doplnok Vietor pre chodcov (OpenFOAM).** Vypnutý, kým ho nezapnete v {{ui:Settings}} › {{ui:Add-ons}}. OpenFOAM je softvér, ktorý nainštalujete sami. Pozri [Tieň, výnos solárnej energie a vonkajšie pohodlie](topic:environment).

### Bodové mračná (doplnok)

- Zapnite {{ui:Point clouds}} v {{ui:Settings}} › {{ui:Add-ons}}; v pravom paneli sa objaví karta Bodové mračná. Otvorte súbor LAS alebo LAZ, vyčistite ho, roztriedte na zem, vegetáciu a budovy, vytvorte zem, vrstevnice a objemy a exportujte LAS alebo LAZ. Pozri [Bodové mračná z dronu alebo skenera](topic:point-clouds).

### WaterCraft (doplnok)

- Zapnite {{ui:WaterCraft (rozvod vody)}} v {{ui:Settings}} › {{ui:Add-ons}}; objaví sa karta WaterCraft. Má odbery od odberateľov, požiarny prietok pri každom hydrante, ktorý výpadok potrubia je najdôležitejší, a vek vody a chlór, každé uložené ako CSV. Pozri [WaterCraft: odbery, požiarny prietok, výpadky a vek vody](topic:watercraft).

### Spoločná práca

- V relácii Live vidíte kurzory a mená ostatných v pláne. Knižničné rastliny: CivilCraft Krajina začína od svojej predvolenej zbierky knižnice, {{ui:CivilCraft krajina}}.

## Vo všetkých aplikáciách

- Nápovedy sa zobrazujú ako tooltipy Bootstrap a úvodný tip sa dá zavrieť.
- Pás kariet panela, ktorý sa nezmestí, sa posúva namiesto toho, aby bol orezaný.
- Názvy kariet prehliadača znejú `<dokument> - CivilCraft | CadCraft`.
- {{ui:Settings}} má časť Rozloženie, kde sú rozloženia rozbaľovací zoznam dvojriadkových možností.
- Jednotky hmotnosti a teploty sú v {{ui:Settings}} › {{ui:Global}} › {{ui:Units}}.
- Zoznam jazykov ukazuje jazyky, pre ktoré má zostava súbory. Jazyky iné ako angličtina sú strojové koncepty.

## Opravené

- Doplnky vyhľadávania adries a kontroly EnergyPlus sa nedali zapnúť; teraz sa dajú.
- Pomocník teraz hovorí, že doplnok Bodové mračná zapisuje vyčistený mrak ako LAS 1.4 alebo LAZ.
- Kliknutie na vlastný úchyt vybraného objektu už nespúšťa ťahanie úchytu, ktoré zastavilo čakajúci Vybrať bod.

## Čestné obmedzenia

- Príkladové šablóny koridorov sú zástupné bez štandardu; inžinier ich musí skontrolovať. Šablóny terénu nepridávajú žiadny povrch a nekreslia sa v 3D ani v pohľade rezu. Druhý koridor na trase nie je v exporte IFC. Medzi dvoma šablónami podľa staničenia nie je zúženie.
- Bodové mračná boli testované na vymyslených súboroch, nie na skutočnom prieskume dronom. Číta sa iba LAS a LAZ.
- Analýza GIS bola testovaná na vymyslených vrstvách.
- Tieň, slnko a pohodlie sú odhady pre plánovanie; vietor je neoverené orientačné posúdenie. Nič z toho nie je návrhová hodnota.
- WaterCraft je pomôcka na výpočty overená na vymyslených sieťach. Vodohospodársky inžinier rozhodne, aké hodnoty majú.
- Jazyky okrem angličtiny sú strojové koncepty.
- Inštalátory pre Windows nie sú podpísané kódom a obraz disku pre macOS nie je notarizovaný.

## Staršie: 0.8 a 0.8.1

Toto sa zmenilo v CivilCraft 0.8 (2026-11-01) a 0.8.1 (2026-11-02) oproti verzii 0.7. Veľké nové časti sú nástroje, ktoré testujú vaše úpravy terénu a stavenisko (dážď, zemné práce, trasy, nádrže, postup), a šesť výpočtových okien pre terén, cesty, meranie, bane, spoje a železnicu.

### Nové

**Otestujte svoje úpravy terénu**

- **Spustiť dážď.** {{ui:Make it rain…}} (pod {{ui:Surface}}) spustí búrku na upravený terén. Sledujete, ako voda steká z podložiek, zadržiava sa v nízkych rohoch a preteká cez nádrže, ktoré sú príliš malé. Beh je animovaný a dáva objemy, špičkový odtok a CSV každej nádrže. Predvolená bunka je hrubá, takže prvý pohľad je rýchly; jemnejšia bunka je pomalšia. Nádrže, ktoré pretekajú, sa tiež objavia v paneli Problémy.
- **Vyrovnanie zemných prác.** {{ui:Earthwork balancer…}} zdvihne alebo spustí podložku, kým výkop nebude rovný násypu, a zobrazí tabuľku odvozu medzi nimi.
- **Najlepšia trasa.** {{ui:Best route…}}: vyberte začiatok a koniec a CivilCraft nájde najlacnejšiu cestu cez terén, ktorá dodržiava vaše limity sklonu a oblúka, a potom z nej vytvorí trasu.
- **Retenčné nádrže.** {{ui:Detention ponds…}} vypočíta stupeň a akumuláciu z vášho terénu, prijme výpustné zariadenia (clona, prepad, V-výrez, priepust), prevedie búrku cez nádrž a skontroluje zadržaný špičkový prietok, čas poklesu hladiny a voľnú výšku.
- **Postup z meraní.** {{ui:Progress from surveys…}} porovnáva povrchy z dronov alebo skenov z rôznych dátumov s terénom, aký bol, a s návrhom: percento dokončenia podľa objemu, oblasti s prekopaním a preplnením, zásobníky a kedy sa práca skončí pri tomto tempe (označené ako odhad).

**Poznajte stavenisko**

- **Adresa na stavenisko.** {{ui:Address to site…}} zarovná otvorené údaje o parcele, budove, zónovaní, pôde, povodni a teréne na jednom stavenisku. Stavenisko môžete uchovať v projektovom súbore: zadanú adresu, každý zdroj s dňom, kedy bol získaný, a jeho licenciu, a to, čo sa vrátilo. Keď projekt znova otvoríte alebo zdieľate, stavenisko tam stále je, bez nového získavania. Môžete ho uložiť aj ako súbor staveniska alebo poslať do BimCraft. Pozri [Adresa na stavenisko](topic:address-to-site).

**Terén, cesty, meranie, bane, spoje a železnica**

- **Pôdy a svahy.** {{ui:Soils and slopes…}} kreslí profil pôdy medzi vrtmi, ktoré zadáte. Bishopova metóda potom hľadá kritickú kružnicu na vašom teréne s hladinou podzemnej vody, prídavným zaťažením a koeficientom zemetrasenia; sadanie základu získa konsolidáciu, okamžité sadanie a čas.
- **Križovatky a značenie.** {{ui:Junctions and striping…}} spája ramená s obrubníkovými oblúkmi (jeden polomer na rameno alebo trojstredové oblúky), rozhľad pre návrhovú rýchlosť, kontrolu rozhľadových trojuholníkov, priechody pre chodcov, zastavovacie čiary, značenie a dopravné značky s rozpisom značiek. Kreslia sa na pláne a ukladajú ako .dxf s pomenovanými vrstvami.
- **Vyrovnanie merania.** {{ui:Survey adjustment…}} spúšťa vyrovnanie polygónového ťahu alebo siete metódou najmenších štvorcov: vyrovnané súradnice, elipsy chýb, test chí-kvadrát a označenie merania, ktoré nezodpovedá. Sú zahrnuté voľné siete, uzatváranie ťahu kompasovým pravidlom a RW5, súbory GSI, JobXML alebo CSV z terénu, a vyrovnané body sa ukladajú ako CSV.
- **Povrchové bane.** {{ui:Open pits…}} mení vrtné vzorky na blokový model a konečnú baňu v rámci vášho uhla svahu, s pomerom odkryvu, tabuľkou podľa etáž a krivkou obsahu a tonáže. Vnorené bane podľa faktora výnosu a výrobný plán s diskontovaným peňažným tokom sú tiež.
- **Rádiové spoje.** {{ui:Radio links…}} kontroluje viditeľnosť cez váš terén s vyklenutím zeme, prvou Fresnelovou zónou, rozpočtom spoja, rezervou na únik a výpadkom spôsobeným viacnásobnou cestou, a dá výšku stožiara, ktorá by vyčistila trasu. Robí aj rozpočty strát optických vlákien, množstvá trasy a vietor na veži.
- **Železničné výhybky.** {{ui:Rail turnouts…}} vytvorí výhybku z jej čísla srdcovky, križovatky medzi rovnobežnými koľajami a konštrukčný profil naklonený prevýšením a rozšírený v oblúku. Výhybka môže byť v stanici trasy.

Pozri [Terén, cesty, meranie, bane, spoje a výhybky](topic:soils-roads-survey-mines-links).

### Vo všetkých aplikáciách

- **Jazyky.** 54 jazykov, desať z nich nových. Jazyky iné ako angličtina sú strojové koncepty, kým ich neprečíta rodený hovorca. Témy pomocníka sú zatiaľ väčšinou v angličtine.
- **Riadky panela nástrojov.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Zalomiť (ako predtým), 2 riadky alebo 1 riadok. Pás CivilCraft zobrazuje najpoužívanejší nástroj veľký, ďalšie malé a zvyšok za šípkou názvu skupiny.
- **Vstupné zariadenia.** Touchpad, pero, 3D myš, ovládač a MIDI môžu ovládať aplikácie.
- **Problémy.** Panel Problémy, ktorý varuje vo všetkých aplikáciách, s kontrolami, ktoré čítajú balíky predpisov.
- **Live.** Zobrazenie, kto je kde v relácii Live.
- **Doplnky.** Zoznam doplnkov, vrátane doplnkov osvetlenia.
- **Pripojte svoju AI.** Akýkoľvek asistent, ktorého pripojíte, môže ovládať nástroje CivilCraft. Obsahuje poznámku, že jedno-klikové pripojenie v CadCraft Studio a hostované konektory ešte nie sú pripravené. Pozri [Nechajte AI asistenta pracovať s vaším staveniskom](topic:assistants).

### Opravené v 0.8.1

- **Sekcia tried DWG.** Bola čítaná ako zlý typ (GitHub cadcraft#5). Opravené v CivilCraft spolu s CadCraft, BimCraft, ModelCraft a TakeoffCraft.
- **Prepínanie jazyka počas behu.** CadCraft Studio a balené vydania môžu meniť jazyk za behu. Predtým boli iba v angličtine. Ešte netestované na každej platforme: dajte nám vedieť, ak sa jazyk nezmení.

### Ešte nie je v tejto verzii

- **Toto sú výpočtové pomôcky.** Každý výsledok v nových oknách potrebuje kontrolu inžiniera. Pevnosti pôdy začínajú od typických hodnôt pre skupinu pôd a okno to hovorí.
- **Spustiť dážď.** Beh na vzorovom stavenisku môže v prehliadači trvať viac ako dve minúty pri jemnej bunke. Bol overený voči ručným prípadom a V-tvarovému povodiu, zatiaľ nie na skutočnom upravenom stavenisku.
- **Adresa na stavenisko.** Číta otvorené dátové súbory, ktoré prinesiete, a bola testovaná iba na našich vlastných súboroch. Stromy nie sú zdroj. Získavanie zdrojov za vás čaká na znenie o ochrane súkromia.
- **Postup z meraní.** Testované iba na vymyslených prieskumoch. Postup na listoch a poznámkach (MarkupCraft) a porovnanie skenu s modelom (BimCraft) nie sú postavené.
- **Pôdy a svahy.** Iba kruhové plochy: žiadne klinové ani blokové hľadanie a žiadna trhlina v ťahu.
- **Križovatky.** Jeden polomer na rameno, žiadne zametacie dráhy nákladných vozidiel a zatiaľ sa nedostávajú do koridoru.
- **Súbory z terénu.** Čítačky boli napísané z verejných popisov formátov a vyskúšané na súboroch, ktoré sme vytvorili. Hľadajú sa skutočné súbory z prístrojov.
- **Spoje a železnica.** Rádiové spoje: iba strata v voľnom priestore a viacnásobná cesta (žiadny únik dažďom ani smerové charakteristiky antén) a žiadny železničný štandard: každý železničný limit je zástupný, s návrhovými číslami, ktoré nikto z železničných inžinierov nekontroloval.
- **Windows a macOS.** 0.8 nie je podpísaná kódom. Windows môže varovať a macOS žiada pravé tlačidlo, potom Otvoriť.

Všetko ostatné je v [Ešte nie je hotové](topic:not-built-yet). Pre predchádzajúce vydanie pozri [Novinky vo verzii 0.7](topic:whats-new-0-7).
