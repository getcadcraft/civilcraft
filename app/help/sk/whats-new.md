---
title: Novinky vo verziách 0.8 a 0.8.1
summary: CivilCraft 0.8 pridáva Spustiť dážď (búrkový prechod cez vaše terénne úpravy), vyrovnanie zemných prác, hľadač najlepšej trasy, retenčné nádrže, postup z meraní, import adries na stavenisko, ktorý drží stavenisko v projekte, a okná pre pôdy a svahy, križovatky a značenie, vyrovnanie merania, povrchové bane, rádiové spoje a železničné výhybky. Verzia 0.8.1 opravuje čítanie súborov DWG.
keywords: novinky, čo je nové, poznámky k vydaniu, changelog, zmeny, 0.8, 0.8.1, verzia, nové funkcie, dážď, búrka, zadržiavanie vody, pretekanie, zemné práce, bilancia, výkop a násyp, odvoz, najlepšia trasa, najnižšia cena, os trasy, retenčná nádrž, výtok, pokles hladiny, voľná výška, postup, meranie, dron, skládka, adresa na stavenisko, parcela, pôda, povodeň, stabilita svahu, Bishop, sadanie, križovatka, značenie, dopravné značky, zrakový dosah, vyrovnanie, najmenšie štvorce, polygónový ťah, povrchová baňa, blokový model, rádiový spoj, Fresnel, výhybka, krížová spojka, jazyky, problémy, naživo, dwg
from: b0932cf0
---

Toto sa zmenilo v CivilCraft 0.8 (2026-11-01) a 0.8.1 (2026-11-02) v porovnaní s verziou 0.7. Veľké nové časti sú nástroje na testovanie vašich terénnych úprav a staviska (dážď, zemné práce, trasy, nádrže, postup) a šesť výpočtových okien pre terén, cesty, merania, bane, spoje a železnicu.

## Novinky

### Otestujte svoje terénne úpravy

- **Spustiť dážď.** {{ui:Spustiť dážď…}} (pod {{ui:Povrch}}) pustí búrku na upravený terén. Sledujete, ako voda steká z plôch, zadržiava sa v nízkych rohoch a preteká cez nádrže, ktoré sú príliš malé. Priebeh je animovaný a dáva objemy, špičkový odtok a CSV súbor každej nádrže. Predvolená bunka je hrubá, aby prvý pohľad bol rýchly; jemnejšia bunka je pomalšia. Nádrže, ktoré pretekajú, sa zobrazia aj v paneli Problémy.
- **Vyrovnanie zemných prác.** {{ui:Vyrovnanie zemných prác…}} zdvihne alebo zníži plochu, kým výkop nebude rovný násypu, a zobrazí tabuľku odvozu medzi nimi.
- **Najlepšia trasa.** {{ui:Najlepšia trasa…}}: vyberte začiatok a koniec a CivilCraft nájde najlacnejšiu cestu terénom, ktorá dodrží vaše limity sklonu a oblúka, a potom z nej vytvorí os trasy.
- **Retenčné nádrže.** {{ui:Retenčné nádrže…}} určí výšku hladiny a objem akumulácie z vášho terénu, prijme výtokové zariadenia (otvor, prepad, V-výrez, priepust), prevedie búrku cez nádrž a skontroluje zadržaný špičkový prietok, čas poklesu hladiny a voľnú výšku.
- **Postup z meraní.** {{ui:Postup z meraní…}} porovnáva povrchy z dronov alebo skenov z rôznych dátumov s terénom, aký bol, a s projektom: percento hotovo podľa objemu, oblasti s nadmerným výkopom a nadmerným násypom, skládky a kedy práca skončí pri tomto tempe (označené ako odhad).

### Spoznajte stavenisko

- **Adresa na stavenisko.** {{ui:Adresa na stavenisko…}} spojí otvorené údaje o parcele, budove, územnom pláne, pôde, povodni a teréne na jednom stavenisku. Stavenisko môžete uchovať v súbore projektu: zadanú adresu, každý zdroj s dňom, kedy ste ho stiahli, a jeho licenciu, a čo sa vrátilo. Keď projekt znova otvoríte alebo zdieľate, stavenisko tam stále je a nič sa nestiahne znova. Môžete ho uložiť aj ako súbor staviska alebo poslať do BimCraft. Pozri [Adresa na stavenisko](topic:address-to-site).

### Terén, cesty, merania, bane, spoje a železnica

- **Pôdy a svahy.** {{ui:Pôdy a svahy…}} nakreslí profil pôdy medzi vrtmi, ktoré zadáte. Bishopova metóda potom hľadá kritickú kružnicu na vašom teréne s hladinou podzemnej vody, prirážkou zaťaženia a koeficientom zemetrasenia; sadanie základu zahŕňa konsolidáciu, okamžité sadanie a čas.
- **Križovatky a značenie.** {{ui:Križovatky a značenie…}} spája vetvy zaoblením obrubníkov (jeden polomer na vetvu alebo trojstredové oblúky), zrakový dosah pre návrhovú rýchlosť, kontrolu trojuholníkov výhľadu, priechody pre chodcov, zastavovacie čiary, značenie a dopravné značky so zoznamom značiek. Nakreslia sa na pôdoryse a uložia sa ako .dxf so pomenovanými hladinami.
- **Vyrovnanie merania.** {{ui:Vyrovnanie merania…}} vykoná vyrovnanie polygónového ťahu alebo siete metódou najmenších štvorcov: vyrovnané súradnice, elipsy chýb, test chi-kvadrát a označenie merania, ktoré nezodpovedá. Sú zahrnuté voľné siete, uzavretie ťahu podľa kompasového pravidla a súbory z terénu RW5, GSI, JobXML alebo CSV; vyrovnané body sa ukladajú ako CSV.
- **Povrchové bane.** {{ui:Povrchové bane…}} premení vrtné vzorky na blokový model a konečnú baňu v rámci vášho uhla svahu, s pomerom odkrývky, tabuľkou podľa etáží a krivkou obsahu a tonáže. Sú tu aj vnorené bane podľa faktora výnosu a harmonogram výroby s diskontovaným peňažným tokom.
- **Rádiové spoje.** {{ui:Rádiové spoje…}} kontroluje priamu viditeľnosť nad vaším terénom s vyklenutím Zeme, prvou Fresnelovou zónou, rozpočtom spoja, rezervou na zoslabenie a výpadkom z viacnásobného šírenia a udá výšku stožiara, ktorá by trasu vyčistila. Robí aj rozpočty strát optických vlákien, množstvá trasy a vietor na veži.
- **Železničné výhybky.** {{ui:Železničné výhybky…}} vytvorí výhybku z jej čísla srdcovky, krížové spojky medzi paralelnými koľajami a prejazdný profil naklonený prevýšením a rozšírený v oblúku. Výhybka môže byť na staničení osi trasy.

Pozri [Pôdy, križovatky, vyrovnanie merania, bane, rádiové spoje a výhybky](topic:soils-roads-survey-mines-links).

## Vo všetkých aplikáciách

- **Jazyky.** 54 jazykov, z toho desať nových. Jazyky iné ako angličtina sú zatiaľ strojové koncepty, kým ich neprekontroluje rodený hovoriaci. Témy pomocníka sú zatiaľ prevažne v angličtine.
- **Riadky panela nástrojov.** {{ui:Nastavenia}} › {{ui:Všeobecné}} › {{ui:Riadky panela nástrojov}}: Zalamovať (ako predtým), 2 riadky alebo 1 riadok. Pás nástrojov CivilCraft zobrazuje najpoužívanejší nástroj veľký, ďalšie malé a zvyšok za šípkou pri názve skupiny.
- **Vstupné zariadenia.** Touchpad, pero, 3D myš, ovládač a MIDI môžu ovládať aplikácie.
- **Problémy.** Panel Problémy, ktorý upozorňuje vo všetkých aplikáciách, s kontrolami, ktoré čítajú balíky predpisov.
- **Naživo.** Zobrazenie, kto je kde v relácii naživo.
- **Doplnky.** Zoznam doplnkov vrátane osvetľovacích doplnkov.
- **Pripojenie AI asistenta.** Ľubovoľný asistent, ktorého pripojíte, môže ovládať nástroje CivilCraft. Obsahuje poznámku, že pripojenie jedným kliknutím v CadCraft Studio a hostovaný konektor ešte nie sú pripravené. Pozri [Nechajte AI asistenta pracovať s vaším staviskom](topic:assistants).

## Opravené vo verzii 0.8.1

- **Sekcia tried DWG.** Bola čítaná ako nesprávny typ (GitHub cadcraft#5). Opravené v CivilCraft spolu s CadCraft, BimCraft, ModelCraft a TakeoffCraft.
- **Prepínanie jazyka za behu.** CadCraft Studio a zabalené vydania môžu meniť jazyk za behu. Predtým boli iba v angličtine. Ešte nie je otestované na všetkých platformách: dajte nám vedieť, ak sa jazyk nezmení.

## Ešte nie je v tejto verzii

- **Ide o pomocné výpočty.** Každý výsledok v nových oknách potrebuje kontrolu inžiniera. Pevnosti pôd vychádzajú z typických hodnôt pre skupinu pôd a okno to uvádza.
- **Spustiť dážď.** Výpočet na vzorovom stavenisku môže v prehliadači trvať viac ako dve minúty pri jemnej bunke. Overené na ručných prípadoch a na tvare V povodia, zatiaľ nie na skutočnom upravenom stavenisku.
- **Adresa na stavenisko.** Číta otvorené dátové súbory, ktoré prinesiete, a bolo testované iba na našich vlastných súboroch. Stromy nie sú zdroj. Získavanie zdrojov za vás čaká na znenie o ochrane súkromia.
- **Postup z meraní.** Testované iba na vymyslených meraniach. Postup na listoch a poznámkach (MarkupCraft) a porovnanie skenu s modelom (BimCraft) nie sú hotové.
- **Pôdy a svahy.** Iba kruhové plochy: bez hľadania klinov a blokov a bez trhliny v ťahu.
- **Križovatky.** Jeden polomer na vetvu, bez zametacích trajektórií nákladných áut a zatiaľ nevstupujú do koridoru.
- **Súbory z terénu.** Čítače boli napísané podľa verejných popisov formátov a vyskúšané na súboroch, ktoré sme vytvorili. Hľadajú sa skutočné súbory z prístrojov.
- **Spoje a železnica.** Rádiové spoje: iba strata v voľnom priestore a viacnásobné šírenie (bez útlmu dažďom a bez vzorov antén) a žiadna železničná norma: každý železničný limit je zástupný, s koncepčnými číslami, ktoré žiadny železničný inžinier neskontroloval.
- **Windows a macOS.** Verzia 0.8 nie je podpísaná kódom. Windows môže zobraziť upozornenie a macOS žiada pravým tlačidlom myši kliknúť a potom Otvoriť.

Všetko ostatné je v [Ešte nie je hotové](topic:not-built-yet). Predchádzajúce vydanie nájdete v [Novinky vo verzii 0.7](topic:whats-new-0-7).
