---
title: Nastavení CivilCraft
summary: Zvolte pořadí sloupců pro kopírované a vložené řádky bodů a pro odhad sloupců souboru, jak se číslují vložené body, co ukazují popisky bodů, indikátor rohu, svislé zvětšení 3D, jak se zobrazuje zeměpisná šířka a délka a zda mapové vrstvy pocházejí z internetu.
keywords: nastavení, předvolby, pnezd, penzd, pořadí sloupců, řádky bodů, přečíslování, čísla bodů, počáteční číslo, popisky bodů, popisky, popis, výška, kostka pohledu, ikona os, indikátor rohu, kompas, svislé zvětšení, 3D, zeměpisná šířka, zeměpisná délka, DMS, desetinné stupně, mapové vrstvy, internet, soukromí
from: 64b9cb92
---

Otevřete {{ui:Nastavení}} ikonou ozubeného kola v liště aplikace nebo {{key:Mod+,}}. První karta, {{ui:CivilCraft}}, obsahuje nastavení, která patří této aplikaci; {{ui:Obecné}} obsahuje ta, která sdílejí všechny aplikace CadCraft (motiv, panel nástrojů, panely). Nastavení CivilCraft existují jen v aplikaci: měníte je zde a tento prohlížeč si je pamatuje. {{ui:Obnovit nastavení CivilCraft}} vrátí každé nastavení na výchozí hodnotu.

## Řádky bodů

**P, N, E, Z, D** (výchozí) nebo **P, E, N, Z, D**: bod, sever (N), východ (E), výška (Z), popis (D), nebo východ před severem. Používá se na třech místech:

- **Kopírovat**: řádky, které CivilCraft vloží do schránky systému pro tabulkový procesor.
- **Vložit**: řádky vložené z tabulkového procesoru nebo textového souboru, které nemají řádek záhlaví.
- **Import**: odhad v dialogu **Importovat body**, když soubor nemá řádek záhlaví (soubor se čtyřmi sloupci se čte jako PENZ, se třemi jako ENZ). Viz [Formáty souborů s body](topic:point-file-formats).

Řádek záhlaví, který pojmenovává své sloupce, má vždy přednost, stejně jako volba v seznamu **Sloupce** v dialogu importu.

## Čísla pro vložené body

- **Zachovat volná čísla** (výchozí): vložený bod si ponechá své číslo, když ho žádný bod nemá; jen kolidující body dostanou nová čísla.
- **Vždy nová čísla**: každý vložený bod dostane nové číslo, i když jeho vlastní číslo je volné.

**Nová čísla začínají od**: nechte prázdné, aby se počítalo od o jedna víc než nejvyšší používané číslo. Napište číslo, například 5000, aby nové body dostaly čísla od 5000 nahoru; čísla již používaná se přeskočí. Žádné dva body nikdy nesdílejí číslo, ať tak či onak. Viz [Výběr, kopírování a vkládání zaměřených bodů](topic:copy-paste-points#point-numbers-never-clash).

## Popisky bodů

Co popisek bodu ukazuje, když je {{ui:Popisky bodů}} zapnuto v **Zobrazení**: **Číslo**, **Číslo a výška**, nebo **Číslo, výška a popis** (výchozí). Exporty DXF, DWG a PDF ukazují stejné popisky jako obrazovka.

## Indikátor rohu

Co sedí v rohu půdorysu a 3D pohledu: **Kostka pohledu** (výchozí), **Ikona os** nebo **Žádný**.

- **Kostka pohledu** (vpravo nahoře). V půdorysu ukazuje horní stranu s kruhem kompasu: N je mřížkový sever (nahoru v půdorysu). Klikněte na kteroukoli jinou stranu, hranu nebo roh kostky, nebo ji táhněte, a [3D pohled](topic:site-3d) se otevře s pohledem odtud. {{ui:Domů}} na kostce půdorysu přizpůsobí půdorys.
- Ve 3D pohledu se kostka otáčí s pohledem: klikněte na stranu, hranu nebo roh, abyste se dívali odtud; táhněte kostku pro oběh, táhněte kruh kompasu pro otočení kolem svislé osy; klikněte na písmeno, abyste se dívali z té strany; a použijte {{ui:Domů}} pro izometrický pohled na celé staveniště. Při pohledu přímo na stranu malé šipky přeskočí na další stranu a zakřivené šipky otočí pohled o čtvrt otáčky.
- **Ikona os** (vlevo dole): malá značka X (východ) a Y (sever) v půdorysu, X, Y a Z (nahoru) ve 3D.

## Svislé zvětšení ve 3D

Kolik 3D pohled natahuje výšky: **1×**, **2×** (výchozí), **3×**, **5×** nebo **10×**. Seznam na liště 3D pohledu je totéž nastavení, takže změna jednoho změní obojí. Objemy, profily a 3D exporty zůstávají ve skutečném měřítku.

## Zeměpisná šířka a délka

Jak stavový řádek ukazuje zeměpisnou šířku a délku ukazatele, když má projekt souřadnicový systém: **stupně, minuty a vteřiny** (výchozí, například `30°18′00.00″ N`), nebo **desetinné stupně** (`30.300000° N`). Viz [Nastavení souřadnicového systému projektu](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Mapové vrstvy z internetu

**Vypnuto** (výchozí) nebo **Zapnuto**. Když je zapnuto, CivilCraft žádá mapové servery, které přidáte, o snímky oblasti na obrazovce. Váš výkres zůstává v tomto počítači; server vidí oblast a vaši internetovou adresu. Dokud je to vypnuto, žádný mapový server se nic nedotazuje, ani když projekt, který otevřete, nějaký jmenuje; georeferencovaný obrázek ze souboru funguje tak či tak. Viz [Zobrazení mapových vrstev pod půdorysem](topic:map-layers).

## Asistenti

**Povolit AI asistentům a skriptům používat CivilCraft** (na začátku vypnuto) umožní asistentovi ve vašem počítači dosáhnout na otevřené staveniště přes CadCraft Studio: **Číst** popíše staveniště a dá body, výšky povrchu, staničení, profily, objemy a parcely; **Úpravy** mu dovolí vybrat a přidat body měření; **Uložit** a **Export** mu dovolí uložit projekt a zapsat LandXML nebo DWG. **Složky, které smí používat** (ve Studiu) jsou místa, kam smí ukládat a exportovat. **Aktivita** vypisuje jeho volání. Viz [Nechte AI asistenta pracovat s vaším staveništěm](topic:assistants).
