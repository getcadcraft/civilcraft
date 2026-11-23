---
title: Novinky vo verzii 0.9 (staršie)
summary: Šablóny koridorov a terénu, prichytávanie a tlačidlá Zvoliť pri kreslení, analýza GIS s tabuľkou atribútov, tieň, solárny výnos, komfort a štúdie vetra pre lokalitu, 3D pohľad Vykreslenie a doplnky Oblaky bodov a WaterCraft.
keywords: novinky 0.9, staršie vydanie, novinky, 0.9, poznámky k vydaniu, šablóny koridorov, šablóny terénu, editor šablón, priečny rez, viac koridorov, prichytávanie, zachytenie, zvoliť, presunúť, kopírovať, otočiť, dotyčnica, vykreslenie, 3d vykreslenie, analýza gis, nárazník, prekrytie, priestorové spojenie, tabuľka atribútov, štýlovanie podľa atribútu, štúdia tieňa, solárny výnos, utci, vonkajší komfort, štúdia vetra, openfoam, oblaky bodov, las, laz, watercraft, požiarny prietok, hydrant, vek vody, chlór, odbery, popisky, rozloženie, novinky, zmeny, 0.8, 0.8.1, verzia, nové funkcie, dážď, odvodnenie, zadržiavanie vody, pretekanie, zemné práce, bilancia, výkop a násyp, prevoz, najlepšia trasa, najmenšie náklady, os trasy, retenčná nádrž, odtok, pokles hladiny, voľný bok, postup, prieskum, dron, skládka, adresa na lokalitu, parcela, pôda, záplava, stabilita svahu, bishop, sadanie, križovatka, vodorovné značenie, dopravné značky, rozhľadová vzdialenosť, vyrovnanie, metóda najmenších štvorcov, traverz, povrchová baňa, blokový model, rádiový spoj, fresnel, výhybka
from: 4664522c
---

Toto sa zmenilo v CivilCraft 0.9 oproti 0.8.1. CivilCraft 0.9 je súčasťou CadCraft Studio 0.9 a jeho ôsmich aplikácií. Hlavné časti sú šablóny koridorov a terénu, prichytávanie pri kreslení, analýza GIS, štúdie slnka, solárneho výnosu, komfortu a vetra na lokalite a dva doplnky: Oblaky bodov a WaterCraft.

## Nové

### Šablóny koridorov a terénu

- **Šablóny koridorov.** Otvorte {{ui:Povrch}} › {{ui:Viac}} › {{ui:Šablóny koridorov…}} (alebo napíšte {{cmd:TEMPLATES}}). Šablóna je malý priečny rez s časťami, odsadeniami, sklonmi, materiálmi a kódmi bodov. Uchovajte ich v projekte, v {{ui:Moja knižnica}} alebo ako súbor `.cctemplates.json`. Editor šablón zobrazuje kresbu v skutočnej mierke a pri písaní uvádza problémy.
- **Zostavenie zo šablón podľa staničenia.** Vyberte os trasy a zapnite {{ui:Stavať zo šablón podľa staničenia}} vo jej Vlastnostiach. Každá strana každého regiónu má vlastný zoznam vozoviek a vlastnú koncovú podmienku. {{ui:Pridať koridor}} pod {{ui:Koridory na tejto osi trasy}} umiestni na jednu os trasy viac koridorov.
- **Šablóny terénu.** {{ui:Povrch}} › {{ui:Viac}} › {{ui:Šablóny terénu…}} (alebo napíšte {{cmd:TERRAINTEMPLATES}}) nanesie vrstvené materiály, ako ornica alebo vozovka a podklad, na terén, s plochou a objemom na každú vrstvu. Pozri [Šablóny koridorov a šablóny terénu](topic:corridor-templates).

### Kreslenie

- **Prichytávanie.** Nástroje Os trasy, Plošina, Parcela, Hmota, Charakteristická čiara, Meranie, Hranica a Povodie sa prichytávajú k zameraným bodom, PI, rohom, vrcholom a konštrukciám, so popiskom pri značke. Podržte {{key:Alt}} pre voľný bod.
- **Tlačidlá Zvoliť, dotyčnica a presun, kopírovanie, otočenie.** Rohy plošiny, parcely a charakteristickej čiary majú polia pre zadané súradnice Východ a Sever a tlačidlo Zvoliť s krížikom. Vlastnosti tiež obsahujú {{ui:Dotyčnica z dvoch bodov}} pre osi trasy a {{ui:Presun, kopírovanie a otočenie}} pre osi trasy, plošiny, parcely a charakteristické čiary. Pozri [Kreslenie s prichytávaním, zvolenými rohmi a presunom, kopírovaním, otočením](topic:draft-with-snaps).
- **3D pohľad s vykreslením.** Tlačidlo {{ui:Vykreslenie}} na paneli 3D kreslí terén s prirodzenými farbami, oblohu, opar a jemné tiene. Model nemení. Ponuka {{ui:Slnko}} má teraz tlačidlá {{ui:Použiť}} a {{ui:Zavrieť}}. Pozri [Zobraziť lokalitu v 3D](topic:site-3d).
- **Panely sa otvárajú po jednej časti.** Ľavý panel a panel Vlastnosti otvoria jednu časť a ostatné zatvoria; dlaždice pásu Krajina, ktoré držia viac nástrojov, sú rozdelené tlačidlá.

### Analýza GIS

- **Analyzovať.** {{ui:Povrch}} › {{ui:Viac}} › {{ui:Analyzovať}} ponúka nárazník, prekrytie, priestorové spojenie, výber podľa atribútu alebo tvaru a meranie. Každý nástroj vytvorí novú vrstvu v jednom kroku späť.
- **Tabuľka atribútov.** Ponuka s tromi bodkami vrstvy má {{ui:Tabuľka atribútov…}} a {{ui:Štýlovať podľa atribútu…}}. Pozri [Analýza vrstiev GIS](topic:gis-analysis) a [Práca s tabuľkou atribútov vrstvy](topic:gis-table).

### Lokalita: slnko, solár, komfort a vietor

- **Sekcia prostredia.** Vyberte hmotu: sekcia {{ui:Prostredie}} je pod {{ui:Hodiny slnka}} vo jej Vlastnostiach. Má štúdiu tieňa (mapa, tabuľka, animácia, CSV), solárny výnos zo súboru počasia typického roka (.epw) a vonkajší komfort (UTCI).
- **Vietor, iba orientačne.** {{ui:Spustiť štúdiu vetra}} farbí terén od vhodného na sedenie po nepohodlné pre každý smer vetra v súbore počasia. Nie je overené a panel to hovorí.
- **Doplnok Vietor pre chodcov (OpenFOAM).** Vypnutý, kým ho nezapnete v {{ui:Nastavenia}} › {{ui:Doplnky}}. OpenFOAM je softvér, ktorý nainštalujete sami. Pozri [Tieň, solárny výnos a vonkajší komfort](topic:environment).

### Oblaky bodov (doplnok)

- Zapnite {{ui:Oblaky bodov}} v {{ui:Nastavenia}} › {{ui:Doplnky}}; objaví sa karta Oblaky bodov. Otvorte súbor LAS alebo LAZ, vyčistite ho, roztrieďte na zem, vegetáciu a budovy, vytvorte terén, vrstevnice a objemy a exportujte LAS alebo LAZ. Pozri [Oblaky bodov z dronu alebo skenera](topic:point-clouds).

### WaterCraft (doplnok)

- Zapnite {{ui:WaterCraft (distribúcia vody)}} v {{ui:Nastavenia}} › {{ui:Doplnky}}; objaví sa karta WaterCraft. Obsahuje odbery od zákazníkov, požiarny prietok pri každom hydrante, výpadok potrubia, na ktorom najviac záleží, a vek vody a chlór, každé uložené ako CSV. Pozri [WaterCraft: odbery, požiarny prietok, výpadky a vek vody](topic:watercraft).

### Spoločná práca

- V relácii Naživo vidíte kurzory a mená ostatných v pôdoryse. Rastliny z knižnice: krajina CivilCraft začína z predvolenej kolekcie knižnice, {{ui:Krajina CivilCraft}}.

## V každej aplikácii

- Nápovedy sa zobrazujú ako bublinové tipy Bootstrap a tip pri spustení sa dá zavrieť.
- Pás kariet panela, ktorý sa nezmestí, sa posúva namiesto orezania.
- Názvy kariet prehliadača sú v tvare `<dokument> - CivilCraft | CadCraft`.
- {{ui:Nastavenia}} má časť Rozloženie, kde sú rozloženia rozbaľovacím zoznamom dvojriadkových volieb.
- Jednotky hmotnosti a teploty sú v {{ui:Nastavenia}} › {{ui:Globálne}} › {{ui:Jednotky}}.
- Zoznam jazykov ukazuje jazyky, pre ktoré má zostava súbory. Jazyky iné ako angličtina sú strojové koncepty.

## Opravené

- Doplnky na vyhľadávanie adries a kontrolu EnergyPlus sa nedali zapnúť; teraz sa dajú.
- Nápoveda teraz hovorí, že doplnok Oblaky bodov zapisuje vyčistený oblak ako LAS 1.4 alebo LAZ.
- Kliknutie na úchyt vlastného vybraného objektu už nespúšťa ťahanie úchytu, ktoré zastavilo čakajúce Zvoliť.

## Úprimné obmedzenia

- Príkladové šablóny koridorov sú zástupné, bez normy; inžinier ich musí skontrolovať. Šablóny terénu nepridávajú povrch a nekreslia sa v 3D ani v pohľade na rez. Druhý koridor na osi trasy nie je v exporte IFC. Medzi šablónami podľa staničenia nie je zúženie.
- Oblaky bodov boli testované na vymyslených súboroch, nie na skutočnom dronovom prieskume. Číta sa iba LAS a LAZ.
- Analýza GIS bola testovaná na vymyslených vrstvách.
- Tieň, solár a komfort sú odhady pre plánovanie; vietor je neoverené orientačné posúdenie. Nič z toho nie je projektová hodnota.
- WaterCraft je pomôcka na výpočty overená na vymyslených sieťach. O tom, čo čísla stoja, rozhoduje vodohospodársky inžinier.
- Jazyky okrem angličtiny sú strojové koncepty.
- Inštalátory pre Windows nie sú podpísané certifikátom kódu a obraz disku pre macOS nie je notarizovaný.

## Skôr: 0.8 a 0.8.1

Toto sa zmenilo v CivilCraft 0.8 (2026-11-01) a 0.8.1 (2026-11-02) oproti 0.7. Hlavné nové časti sú nástroje, ktoré testujú vaše úpravy terénu a lokalitu (dážď, zemné práce, trasy, nádrže, postup), a šesť okien výpočtov pre terén, cesty, zameranie, bane, spoje a železnicu.

### Nové

**Otestujte úpravu terénu**

- **Spustiť dážď.** {{ui:Spustiť dážď…}} (pod {{ui:Povrch}}) pustí búrku na upravený terén. Vidíte, ako voda steká z plošín, zadržiava sa v nízkych rohoch a preteká nádrže, ktoré sú príliš malé. Beh je animovaný a dáva objemy, špičkový odtok a CSV každej nádrže. Predvolená bunka je hrubá, takže prvý pohľad je rýchly; jemnejšia bunka je pomalšia. Nádrže, ktoré pretekajú, sa zobrazia aj v paneli Problémy.
- **Vyrovnávač zemných prác.** {{ui:Vyrovnávač zemných prác…}} zdvíha alebo spúšťa plošinu, kým sa výkop nerovná násypu, a ukazuje tabuľku prevozov medzi nimi.
- **Najlepšia trasa.** {{ui:Najlepšia trasa…}}: vyberte začiatok a koniec a CivilCraft nájde najlacnejšiu cestu cez terén, ktorá dodržiava vaše limity sklonu a oblúkov, a z nej vytvorí os trasy.
- **Retenčné nádrže.** {{ui:Retenčné nádrže…}} určí výšky hladiny a objem z vášho terénu, prijme výpustné zariadenia (otvor, prepad, V-výrez, prepadová hrana), prevedie búrku nádržou a skontroluje zadržaný špičkový prietok, čas vyprázdnenia a voľný bok.
- **Postup podľa prieskumov.** {{ui:Postup z meraní…}} porovná drónové alebo skenované povrchy z rôznych dátumov so terénom, aký bol, a s návrhom: percento hotovosti podľa objemu, oblasti vykopané nad mieru a zasypané nad mieru, skládky a kedy práca skončí pri tomto tempe (označené ako odhad).

**Poznajte lokalitu**

- **Adresa na lokalitu.** {{ui:Adresa na lokalitu…}} spojí otvorené údaje o parcele, budove, územnom plánovaní, pôde, záplavách a teréne na jednej lokalite. Lokalitu môžete uchovať v projektovom súbore: zadaná adresa, každý zdroj s dňom stiahnutia a jeho licenciou, a to, čo sa vrátilo. Znovu otvorte alebo zdieľajte projekt a lokalita tam stále je, bez nového sťahovania. Môžete ju uložiť aj ako súbor lokality alebo poslať do BimCraft. Pozri [Adresa na lokalitu](topic:address-to-site).

**Terén, cesty, zameranie, bane, spoje a železnica**

- **Pôdy a svahy.** {{ui:Pôdy a svahy…}} nakreslí profil pôdy medzi vrtmi, ktoré zadáte. Bishopova metóda potom hľadá kritickú kružnicu na vašom teréne s hladinou podzemnej vody, prídavným zaťažením a koeficientom zemetrasenia; sadanie základu dostane konsolidáciu, okamžité sadanie a čas.
- **Križovatky a vodorovné značenie.** {{ui:Križovatky a značenie…}} spája vetvy s oblúkmi obrubníkov (jeden polomer na vetvu alebo tri-stredové oblúky), rozhľadovú vzdialenosť pre návrhovú rýchlosť, kontrolu rozhľadových trojuholníkov, priechody pre chodcov, zastavovacie čiary, vodorovné značenie a dopravné značky so zoznamom značiek. Kreslia sa na pôdoryse a ukladajú sa ako .dxf s pomenovanými hladinami.
- **Vyrovnanie merania.** {{ui:Vyrovnanie merania…}} spustí vyrovnanie traverzu alebo siete metódou najmenších štvorcov: vyrovnané súradnice, elipsy chýb, test chí-kvadrát a označenie merania, ktoré nesedí. Voľné siete, uzavretie traverzu kompasovým pravidlom a RW5, súbory terénneho merania GSI, JobXML alebo CSV sú zahrnuté a vyrovnané body sa uložia ako CSV.
- **Povrchové bane.** {{ui:Povrchové bane…}} mení vzorky z vrtov na blokový model a konečnú baňu v rámci vášho uhla svahu, s pomerom jalovín, tabuľkou podľa etáží a krivkou obsahu a tonáže. Vnorené bane podľa koeficientu výnosu a výrobný harmonogram s diskontovaným peňažným tokom sú tiež k dispozícii.
- **Rádiové spoje.** {{ui:Rádiové spoje…}} kontroluje viditeľnosť cez váš terén so zakrivením Zeme, prvou Fresnelovou zónou, rozpočtom spoja, rezervou na únik signálu a výpadkom viacnásobnej cesty a dá výšku stožiara, ktorá by dráhu vyčistila. Robí aj rozpočty strát optického vlákna, množstvá trasy a vietor na veži.
- **Výhybky.** {{ui:Železničné výhybky…}} vytvorí výhybku z jej čísla srdcovky, prepojky medzi rovnobežnými koľajami a prejazdný profil naklonený prevýšením a rozšírený v oblúku. Výhybka môže byť na staničení osi trasy.

Pozri [Pôdy, križovatky, vyrovnanie merania, bane, rádiové spoje a výhybky](topic:soils-roads-survey-mines-links).

### Opravené v 0.8.1

- **Sekcia tried DWG.** Bola čítaná ako nesprávny typ (GitHub cadcraft#5). Opravené v CivilCraft spolu s CadCraft, BimCraft, ModelCraft a TakeoffCraft.
- **Prepínanie jazyka za behu.** CadCraft Studio a balené vydania môžu meniť jazyk za behu. Predtým boli iba v angličtine. Ešte netestované na každej platforme: dajte nám vedieť, ak sa jazyk nezmení.

### Zatiaľ nie v tejto verzii

- **Sú to pomôcky na výpočty.** Každý výsledok nových okien potrebuje kontrolu inžiniera. Pevnosti pôdy začínajú z typických hodnôt pre skupinu pôdy a okno to hovorí.
- **Nech prší.** Beh na vzorkovej lokalite môže v prehliadači trvať viac ako dve minúty pri jemnej bunke. Overené na ručných prípadoch a na V-tvarovom povodí, zatiaľ nie na skutočnej upravenej lokalite.
- **Adresa na lokalitu.** Číta otvorené dátové súbory, ktoré prinesiete, a bola testovaná iba na našich vlastných súboroch. Stromy nie sú zdroj. Získavanie zdrojov za vás čaká na znenie o ochrane súkromia.
- **Postup podľa prieskumov.** Testované iba na vymyslených prieskumoch. Postup na listoch a poznámkach (MarkupCraft) a skenovanie oproti modelu (BimCraft) nie sú zabudované.
- **Pôdy a svahy.** Iba kruhové plochy: žiadne hľadanie klinu alebo bloku a žiadna trhlina od napätia.
- **Križovatky.** Jeden polomer na vetvu, žiadne zametacie trajektórie nákladných áut a zatiaľ nevstupujú do koridoru.
- **Terénne súbory.** Čítačky boli napísané podľa verejných popisov formátov a vyskúšané na súboroch, ktoré sme vytvorili. Potrební sú skutočné súbory z prístrojov.
- **Spoje a železnica.** Rádiové spoje: iba voľný priestor a viacnásobná cesta (bez zoslabenia dažďom alebo vzorov antény), a žiadny železničný štandard: každý limit železnice je zástupný, s návrhovými číslami, ktoré žiaden železničný inžinier neoveril.
- **Windows a macOS.** 0.8 nie je podpísaný. Windows môže varovať a macOS žiada pravý klik a potom Otvoriť.

Všetko ostatné je v [Ešte nie je hotové](topic:not-built-yet). Pre predchádzajúce vydanie pozri [Novinky vo verzii 0.7](topic:whats-new-0-7).
