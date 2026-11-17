---
title: Nastavenia CivilCraft
summary: Vyberte poradie stĺpcov pre skopírované a prilepené riadky bodov a pre odhad stĺpcov súboru, ako sa číslujú prilepené body, čo zobrazujú popisky bodov, indikátor rohu, zvislé zväčšenie v 3D, ako sa zobrazuje zemepisná šírka a dĺžka a či mapové vrstvy prichádzajú z internetu.
keywords: nastavenia, predvoľby, pnezd, penzd, poradie stĺpcov, riadky bodov, prečíslovanie, čísla bodov, počiatočné číslo, popisky bodov, popisky, popis, výška, kocka pohľadu, ikona osí, indikátor rohu, kompas, zvislé zväčšenie, 3d, zemepisná šírka, zemepisná dĺžka, DMS, desatinné stupne, mapové vrstvy, internet, súkromie
from: 64b9cb92
---

Nastavenia otvoríte ozubeným kolieskom na paneli aplikácie alebo klávesovou skratkou {{key:Mod+,}}. Prvá karta, {{ui:CivilCraft}}, obsahuje nastavenia patriace tejto aplikácii; {{ui:Všeobecné}} obsahuje tie, ktoré zdieľajú všetky aplikácie CadCraft (motív, panel nástrojov, panely). Nastavenia CivilCraft existujú iba v aplikácii: meníte ich tu a tento prehliadač si ich pamätá. {{ui:Obnoviť nastavenia CivilCraft}} vráti každé nastavenie na začiatočnú hodnotu.

## Riadky bodov

**P, N, E, Z, D** (na začiatku) alebo **P, E, N, Z, D**: bod, sever, východ, výška, popis, alebo východ pred severom. Používa sa na troch miestach:

- **Kopírovať**: riadky, ktoré CivilCraft vloží do schránky systému pre tabuľkový procesor.
- **Prilepiť**: riadky vložené z tabuľkového procesora alebo textového súboru, ktoré nemajú riadok hlavičky.
- **Import**: odhad v dialógu **Importovať body**, keď súbor nemá riadok hlavičky (súbor so štyrmi stĺpcami sa číta ako PENZ, s tromi ako ENZ). Pozri [Formáty súborov bodov](topic:point-file-formats).

Riadok hlavičky, ktorý pomenúva stĺpce, má vždy prednosť, rovnako ako voľba v zozname **Stĺpce** dialógu importu.

## Čísla pre prilepené body

- **Zachovať voľné čísla** (na začiatku): prilepený bod si zachová svoje číslo, keď ho žiadny bod nemá; nové čísla dostanú iba body, ktoré sa stretnú.
- **Vždy nové čísla**: každý prilepený bod dostane nové číslo, aj keď jeho vlastné je voľné.

**Nové čísla začínajú od**: nechajte prázdne, aby sa počítalo od o jedna vyššie ako najvyššie používané číslo. Zadajte číslo, napríklad 5000, aby nové body dostali čísla od 5000; čísla, ktoré sa už používajú, sa preskočia. Dva body v žiadnom prípade nezdieľajú číslo. Pozri [Výber, kopírovanie a prilepenie bodov merania](topic:copy-paste-points#point-numbers-never-clash).

## Popisky bodov

Čo zobrazuje popisok bodu, keď je {{ui:Popisky bodov}} zapnuté pod **Zobrazenie**: **Číslo**, **Číslo a výška**, alebo **Číslo, výška a popis** (na začiatku). Exporty DXF, DWG a PDF zobrazujú tie isté popisky ako obrazovka.

## Indikátor rohu

Čo sa nachádza v rohu pôdorysu a 3D zobrazenia: **Kocka pohľadu** (na začiatku), **Ikona osí** alebo **Žiadny**.

- **Kocka pohľadu** (vpravo hore). V pôdoryse ukazuje hornú stranu s kruhom kompasu: N je sieťový sever (hore v pôdoryse). Kliknite na ľubovoľnú inú stranu, hranu alebo roh kocky, alebo ju potiahnite, a [3D zobrazenie](topic:site-3d) sa otvorí s pohľadom z tohto smeru. {{ui:Domov}} na kocke v pôdoryse prispôsobí pôdorys.
- V 3D zobrazení sa kocka otáča s pohľadom: kliknite na stranu, hranu alebo roh, aby ste sa pozreli z tohto miesta, potiahnutím kocky otáčate pohľad, potiahnutím kruhu kompasu otáčate okolo zvislice, kliknutím na písmeno sa pozriete z tejto strany a {{ui:Domov}} dáva izometrický pohľad na celú lokalitu. Keď sa pozeráte priamo na stranu, malé šípky prejdú na ďalšiu stranu a zakrivené šípky otočia pohľad o štvrtinu otáčky.
- **Ikona osí** (vľavo dole): malá značka X (východ) a Y (sever) v pôdoryse, X, Y a Z (nahor) v 3D.

## Zvislé zväčšenie v 3D

Ako veľmi 3D zobrazenie natiahne výšky: **1×**, **2×** (na začiatku), **3×**, **5×** alebo **10×**. Zoznam na lište 3D zobrazenia je to isté nastavenie, takže zmena jedného mení aj druhé. Objemy, profily a 3D exporty zostávajú v pravej mierke.

## Zemepisná šírka a dĺžka

Ako stavový riadok zobrazuje zemepisnú šírku a dĺžku ukazovateľa, keď projekt má súradnicový systém: **stupne, minúty a sekundy** (na začiatku, napríklad `30°18′00.00″ N`) alebo **desatinné stupne** (`30.300000° N`). Pozri [Nastavenie súradnicového systému projektu](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Mapové vrstvy z internetu

**Vypnuté** (na začiatku) alebo **Zapnuté**. Keď je zapnuté, CivilCraft pýta od mapových serverov, ktoré pridáte, obrázky oblasti na obrazovke. Váš výkres zostáva v tomto počítači; server vidí oblasť a vašu internetovú adresu. Kým je vypnuté, žiadny mapový server sa o nič nepýta, ani keď otvorený projekt nejaký uvádza; georeferencovaný obrázok zo súboru funguje tak či tak. Pozri [Zobrazenie mapových vrstiev pod pôdorysom](topic:map-layers).

## Asistenti

**Povoliť AI asistentom a skriptom používať CivilCraft** (na začiatku vypnuté) umožní asistentovi vo vašom počítači dosiahnuť otvorenú lokalitu cez CadCraft Studio: **Čítať** opíše lokalitu a poskytne body, výšky povrchu, staničenia, profily, objemy a parcely; **Upraviť** mu umožní vybrať a pridať geodetické body; **Uložiť** a **Exportovať** mu umožnia uložiť projekt a zapísať LandXML alebo DWG. **Priečinky, ktoré môže použiť** (v Studiu) sú miesta, kam môže ukladať a exportovať. **Činnosť** uvádza jeho volania. Pozri [Nechajte AI asistenta pracovať s vašou lokalitou](topic:assistants).
