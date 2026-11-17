---
title: Zobrazenie lokality v 3D
summary: Otvorte 3D zobrazenie, otáčajte, posúvajte a približujte, nastavte zvislé zväčšenie a farby, vyberte, čo sa zobrazí, a kliknutím vyberte osi trasy, plošiny, charakteristické čiary, hrany zlomu, potrubia, objekty a body.
keywords: popisky, 3D popisky, billboard, popisky otočené ku kamere, popisky staníc, popisky vrstevníc, popisky bodov, obalenie, letecký pohľad, mapové vrstvy na povrchu, 3D, trojrozmerné, 3D zobrazenie, kocka pohľadu, kompas, otáčanie, perspektíva, paralelné, izometria, izo, zvislé zväčšenie, terén, model, model lokality, preletieť okolo, vizualizácia, vykreslenie, potrubia v 3D, objekty, šachty, 3D koridor, cesta v 3D, povrch vozovky, pruhy, obrubníky, chodníky, rastliny v 3D, stromy v 3D, kríky, živé ploty, krajina v 3D, rampy v 3D, schody, múry, dlažba, spevnené plochy 3D
from: a16bafe1
---

3D zobrazenie ukazuje lokalitu ako jeden model: jestvujúci terén a zarovnaný povrch, vrstevnice na nich obalené, hrany zlomu a okraj povrchu, každú os trasy na jej návrhovom profile s značkami staníc, charakteristické čiary koridoru a samotnú cestu (jazdné pruhy, krajnice, odvodňovacie žľaby, obrubníky, pásy a chodníky, každý vo vlastnej farbe), plošiny s ich napojeniami na terén, sieť potrubí s potrubiami a objektmi na ich skutočných výškach a z pracovného priestoru Krajinná úprava rastliny, dlažbu, chodníky, múry, obrubníky, rampy a schody. Číta ten istý projekt ako pôdorys, takže každá úprava sa zobrazí v oboch.

## Otvorenie 3D zobrazenia

1. Otvorte geodetické body (alebo súbor LandXML či projekt), aby existoval povrch. Samotné rastliny, dlažba alebo rampy na jeho otvorenie tiež stačia.
2. Stlačte {{key:D}} alebo kliknite na {{ui:3D}} v skupine {{ui:Zobrazenie}} na paneli nástrojov.
   3D zobrazenie sa otvorí nad pôdorysom a pozerá na celú lokalitu z juhovýchodu. Prvýkrát chvíľu trvá, kým sa načíta.
3. Stlačte {{key:D}} znova alebo kliknite znova na {{ui:3D}}, aby ste sa vrátili k pôdorysu. Výber nástroja na kreslenie, napríklad {{ui:Os trasy}} alebo {{ui:Plošina}}, tiež vráti k pôdorysu, pretože kreslenie sa deje tam.

## Pohyb

| Na | Postup |
|---|---|
| Otáčať | Potiahnite ľavým alebo prostredným tlačidlom |
| Posunúť | Potiahnite pravým tlačidlom alebo {{key:Shift}} a potiahnite |
| Zväčšiť (zoom) | Otočte koliesko; zväčšuje smerom k ukazovateľu |
| Otáčať na touchpade | Potiahnite dvoma prstami ({{key:Shift}} a potiahnutie posúva) |
| Zväčšiť na touchpade | Roztiahnite prsty |
| Dotyk | Jeden prst otáča; dva prsty roztiahnutím priblížia a posunom posúvajú |
| Klávesy (zobrazenie má zameranie) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} otáčajú, s {{key:Shift}} posúvajú; {{key:Plus}} a {{key:Minus}} zväčšujú |

Lišta nad zobrazením obsahuje ostatné:

- Zoznam pohľadov: **Izo**, **Zhora**, **Zdola**, **Spredu** (pohľad na sever), **Zozadu**, **Vľavo**, **Vpravo**.
- {{ui:Perspektíva}}: stlačené je perspektívny pohľad; kliknutím na ňu získate paralelné premietanie (bez skrátenia).
- {{ui:Rozsah}}: znova zobrazí všetko. {{key:F}} robí to isté, kým je 3D zobrazenie otvorené.

## Kocka pohľadu

Kocka pohľadu v pravom hornom rohu sa otáča s pohľadom. Kliknite na stranu, hranu alebo roh, aby ste sa na lokalitu pozreli z tohto miesta (kamera sa otočí plynulo, pokiaľ váš systém nežiada zníženú animáciu). Potiahnite kocku na otáčanie. Kruh kompasu pod ňou ukazuje sever (sieťový sever, +Y): potiahnite kruh na otočenie lokality okolo zvislice alebo kliknite na N, E, S alebo W, aby ste sa pozreli z tejto strany. {{ui:Domov}}, malý domček v ľavom hornom rohu, vráti do izo pohľadu na celú lokalitu. Klávesnicou: {{key:Tab}} na kocku, šípky vyberajú stranu, hranu alebo roh, {{key:Enter}} sa pozrie odtiaľ.

V pôdoryse táto kocka ukazuje hornú stranu. Kliknite na ľubovoľnú inú stranu, hranu alebo roh (alebo ju potiahnite), aby ste otvorili 3D zobrazenie s pohľadom z tohto miesta: je to najrýchlejší spôsob, ako sa dostať do 3D z daného smeru. Ak chcete kocku nahradiť malou ikonou osí alebo ju skryť, pozrite si **Indikátor rohu** v [Nastaveniach CivilCraft](topic:settings).

## Zväčšenie výšok

Lokality bývajú zvyčajne oveľa širšie ako vysoké, takže výšky sú na začiatku natiahnuté **2×**. Vyberte **1×**, **2×**, **3×**, **5×** alebo **10×** v zozname na lište, alebo pod **Zvislé zväčšenie v 3D** v [Nastaveniach CivilCraft](topic:settings) (obe sú jedno nastavenie). Mení sa iba zobrazenie: objemy, profily a exporty zostávajú v pravej mierke.

## Farebné označenie povrchov

- **Pásy výšok**: rovnaké pásy a farby ako pásy výšok v pôdoryse (počet pásov sa nastavuje pod **Zobrazenie** na ľavom paneli). Každá hrana pásu je presne vyrezaná vo svojej výške.
- **Jedna farba**: jestvujúci terén a zarovnaný povrch, každý v jednofarebnej farbe.
- **Mapové vrstvy**: mapové vrstvy zobrazené pod pôdorysom (georeferencovaný obrázok, mapové dlaždice alebo mapová služba; pozri [Mapové vrstvy](topic:map-layers)) položené cez povrchy ako list, takže leteckú fotografiu vidno na kopcoch. Obrázky, ktoré ešte prichádzajú, sa dopĺňajú postupne. Keď nie je zobrazená žiadna mapová vrstva, povrchy si ponechajú pásy výšok a zobrazenie to uvedie. Obrázok je pre obrazovku: exporty GLB a OBJ ho neobsahujú.

Keď sú zobrazené oba povrchy, jestvujúci terén je priesvitný nad zarovnaným povrchom, takže vidíte výkop (terén nad návrhom) a násyp.

## Výber zobrazených prvkov

Kliknite na {{ui:Zobraziť}} na lište a začiarknite alebo odznačte:

| Položka | Čo to je |
|---|---|
| Jestvujúci terén | Povrch vytvorený z geodetických bodov (alebo načítaný z LandXML) |
| Zarovnaný povrch | Jestvujúci terén so zarovnanými koridormi a plošinami (iba keď nejaké sú) |
| Hrany trojuholníkov | Každá hrana TIN ako čiary |
| Vrstevnice | Vedľajšie a hlavné vrstevnice každého zobrazeného povrchu v intervale pôdorysu |
| Okraj povrchu | Vonkajší okraj každého zobrazeného povrchu vo svojich výškach |
| Hrany zlomu | Každá hrana zlomu vo svojich výškach |
| Osi trás a staničenia | Každá os trasy na návrhovom profile (na teréne, ak profil nie je), so značkami každých 50 ft alebo 20 m |
| Charakteristické čiary koridoru | Okraj vozovky, krajnica a napojenie na terén na oboch stranách |
| Povrchy cesty | Cesta, ktorú každý koridor vytvára zo svojho priečneho usporiadania: jazdné pruhy, krajnice, odvodňovacie žľaby, obrubníky, pásy a chodníky, každý vo vlastnej farbe, na zarovnanom povrchu |
| Rastliny | Každá rastlina a rastliny v záhonoch a živých plotoch ako jednoduché tvary podľa veľkosti zo zoznamu rastlín: strom je kmeň s okrúhlou korunou (kužeľ pre ihličnan, trs na vysokom kmeni pre palmu), kríky, živé plotové rastliny, trvalky a krycie rastliny sú kupoly, trávy trsy, popínavé rastliny tenké stĺpy. Stoja na zarovnanom povrchu (alebo jestvujúcom teréne) vo veľkosti, ktorú ukazuje pôdorys: dospelé alebo v čase výsadby |
| Spevnené plochy | Dlažba a chodníky so spádmi, múry, obrubníky, schody a rampy, ktoré stúpajú v úsekoch s rovnými podestami medzi nimi |
| Plošiny a napojenia na terén | Obrys každej plošiny vo svojej výške a jeho napojenie na terén |
| Potrubia a objekty | Potrubia ako okrúhle rúry medzi ich dnami, objekty od hrany po kalovú jamu |
| Geodetické body | Bod v každom bode s výškou (spočiatku vypnuté) |
| Hladiny GIS | Hladiny GIS zobrazené v pôdoryse, vo svojich farbách: čiary a obrysy vo svojich výškach, ostatné položené na jestvujúcom teréne (presne ho sledujú); body ako malé krížiky. Tvary bez výšok mimo povrchu sa vynechajú a zobrazenie uvedie, koľko ich bolo |
| Popisky | Názvy a hodnoty, ktoré sú vždy otočené k vám: názov každej osi trasy na jej začiatku a jej staničenia každých 100 ft (alebo 100 m), výška každej hlavnej vrstevnice, plošiny, charakteristické čiary a objekty podľa názvu a so začiarknutými **Geodetickými bodmi** číslo a výška každého bodu |

Popisky zostávajú rovnako veľké a vzpriamené bez ohľadu na to, ako otáčate alebo priblížite, a kopec pred popiskom ho zakryje. Tam, kde by sa tlačili, zobrazujú sa najdôležitejšie a ostatné čakajú, kým priblížite: najprv osi tras, potom objekty, plošiny, charakteristické čiary, staničenia, vrstevnice a body, bližšie najprv. Sú len na obrazovke; exporty a výstupy ich vynechávajú.

Vaše voľby, zväčšenie a farebné označenie sa pamätajú v tomto prehliadači.

Cesta sa vytvára na jestvujúcom teréne. Keď máte os trasy a koridor, ale ešte žiadne geodetické body ani povrch, cesta sa zobrazí na zástupnom rovnom teréne: na priemernej výške jej návrhového profilu, alebo rovne vo výške 0, keď profil nie je. Upozornenie v dolnej časti 3D zobrazenia a vo vlastnostiach koridoru to hovorí. Je to iba obrázok: z neho nevychádzajú žiadne objemy ani rezy. Otvorte geodetické body alebo povrch a cesta sa sama presunie na skutočný terén.

Zvislé zväčšenie natiahne terén, nie rastliny: stoja na zväčšenom teréne vo svojej skutočnej výške a rozpätí, takže strom vyzerá ako strom pri akomkoľvek nastavení. Rastliny sú jednoduché tvary, nie podrobné modely: tisíce z nich zostávajú rýchle na otáčanie a približovanie.

## Potrubia a objekty

- Potrubie sa kreslí s dnom vnútri vo výškach dna, ktoré nastavíte, a jeho horná časť (temeno) o jeden vnútorný priemer vyššie. Priemery sú v palcoch v projekte v stopách a v milimetroch v metrickom projekte, ako v pravom paneli.
- Objekt siaha od svojej hrany (zadanej alebo z povrchu) dolu k svojej kalovej jame (najnižšie dno mínus hĺbka kalovej jamy). Bez akéhokoľvek dna sa kreslí do hĺbky 5 ft (1.5 m).
- Potrubia a objekty s problémom (pozri kontrolu siete v pravom paneli) sú kreslené červeno.
- Potrubie bez kóty dna sa nekreslí; poznámka v dolnej časti zobrazenia uvedie, koľko ich je.

## Výber z 3D zobrazenia

Kliknite na os trasy (alebo jej cestu), plošinu, charakteristickú čiaru, potrubie, objekt, geodetický bod, rastlinu, rampu alebo iné spevnené prvky. Vyberie sa rovnako, ako keď kliknete na ňu v pôdoryse: jej vlastnosti sa otvoria v pravom paneli, kde ich môžete upraviť, a je zvýraznená vo farbe výberu navrchu všetkého v 3D. Čokoľvek vyberiete v pôdoryse, je zvýraznené aj v 3D. Tip vedľa ukazovateľa označí, na čo ste klikli, s jeho východom, severom a výškou. Potrubia a objekty sa dajú kliknúť aj tam, kde sú pod zemou; čiara skrytá za kopcom sa cez neho kliknúť nedá.

Kliknutím na hranu zlomu zistíte, o ktorú ide: zvýrazní sa a stavový riadok ju pomenuje (hrany zlomu nemajú vlastné vlastnosti).

Kliknutím na terén v tipe odčítate východ, sever a výšku v tom mieste.

## Jazda pozdĺž osi trasy

Kliknite na **Jazda** na lište 3D a vyberte os trasy. Pohľad sa presunie na sedadlo vodiča: 3.5 ft (1.07 m) nad cestou, na jej návrhovom profile (na jestvujúcom teréne pozdĺž osi, keď ho ešte nemá), pozerajúc dopredu pozdĺž nej.

- **Prehrať** alebo {{key:Space}} jazdí rýchlosťou, ktorú vyberiete (10 až 65 mph, alebo 15 až 100 km/h); {{key:Space}} znova pozastaví. Na konci zastaví; **Prehrať** potom začne znova od začiatku.
- Posúvač skočí na ľubovoľné staničenie; {{key:Left}} a {{key:Right}} posúvajú o 10 ft (5 m) dozadu a dopredu.
- Ťahanie v zobrazení pozastaví jazdu a umožní sa rozhliadnuť.
- **Zastaviť** alebo {{key:Esc}} vráti pohľad tam, kde bol.

Zvislé zväčšenie platí aj počas jazdy: nastavte 1×, aby ste videli cestu tak, ako bude.

## Svetlo zo slnka

Otvorte **Slnko** na lište 3D a začiarknite **Svetlo zo slnka**. Zadajte dátum, čas a jeho časové pásmo (odstup od UTC: v lete letný čas) a zemepisnú šírku a dĺžku lokality. Keď projekt má súradnicový systém, vyplnia sa z neho.

Lokalita je potom osvetlená z miesta, kde je slnko, s **Tieňmi** cez terén, koridor a plošiny; ponuka uvádza azimut slnka a jeho výšku alebo že je pod obzorom. Polohy pochádzajú zo slnečných rovníc NOAA. Tiene padajú správnym smerom pri akomkoľvek zväčšení, ale končia na okraji lokality: kopce a budovy za ňou žiadne nevrhajú.

## Export 3D zobrazenia

Kliknite na {{ui:GLB}} alebo {{ui:OBJ}} na lište. Zobrazené sa uloží v skutočnej mierke (bez zväčšenia), v metroch, s osou Y nahor. Podrobnosti: [Export lokality do 3D](topic:export-3d).
