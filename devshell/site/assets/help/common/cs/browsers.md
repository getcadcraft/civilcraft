---
title: Prohlížeče a počítače
summary: V jakých prohlížečích aplikace běží, v čem se liší a co váš počítač potřebuje.
keywords: chrome, edge, firefox, safari, brave, prohlížeč, mac, windows, linux, ipad, tablet, webgl, požadavky, paměť
from: a11b09b1
---

Aplikace běží ve webovém prohlížeči. Práci provádějí na vašem vlastním počítači: soubory se otevírají tam a nikdy je nám neposílají (viz [Kam jdou vaše soubory](common:your-files)).

## Který prohlížeč

Použijte aktuální verzi některého z těchto:

| Prohlížeč | Jádro | Poznámky |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Nejúplnější: výběr složky, ukládání pro použití offline, obsluha souborů. |
| Firefox | Gecko | Funguje. Otevření celé složky používá jednodušší výběr. Ukládání pro offline nemusí v anonymních oknech fungovat. |
| Safari | WebKit | Funguje na Macu a iPadu. Otevření celé složky používá jednodušší výběr. Safari může smazat offline kopii, kterou jste několik týdnů nepoužili. |

Všechna tři jádra jsou pro běžnou práci v pořádku. Kde aplikace v některém z nich dělá něco jinak, nápověda ukazuje kroky pro váš prohlížeč.

## V čem se prohlížeče liší

- **Otevření složky.** Prohlížeče na bázi Chromium zobrazují skutečný výběr složky a umějí složku číst přímo. Firefox a Safari vás požádají o výběr složky a potom přečtou každý soubor v ní, což u velkých projektových složek trvá déle; přetažení složky do aplikace funguje ve všech třech.
- **Ukládání.** Aplikace ukládají stažením souboru. O tom, kam se stahování ukládá a zda se nejdřív zeptá, rozhoduje váš prohlížeč.

:::chromium
V Chrome nebo Edge zapněte „Před stažením se zeptat, kam se má soubor uložit“ (v Nastavení, v části Stažené soubory), abyste mohli pokaždé zvolit složku.
:::

:::firefox
Ve Firefoxu otevřete Nastavení, potom Obecné, potom Soubory a aplikace a zvolte „Vždy se ptát, kam ukládat soubory“, abyste mohli pokaždé zvolit složku.
:::

:::safari
V Safari otevřete Nastavení, potom Obecné a nastavte „Umístění stažených souborů“ na „Zeptat se při každém stažení“, abyste mohli pokaždé zvolit složku.
:::

## Mac, Windows a Linux

Aplikace jsou na každém počítači stejné. Mění se klávesnice: zkratky se zapisují automaticky podle vašeho počítače. Viz [Klávesy, myši a trackpady](common:keys).

## Tablety a dotykové obrazovky

Některé aplikace přijímají dotyk (jeden prst kreslí nebo vybírá, dva prsty sevřením přiblíží a posouvají). Nápověda každé aplikace uvádí, zda to umí. Na iPadu použijte Safari nebo Chrome. Klávesnice pomáhá u aplikací, které používají psané příkazy.

## Nejstarší prohlížeč a systém

Tyto údaje jsme zjistili z kódu aplikací 0.7, nehádali jsme: každý soubor byl analyzován a každá použitá jazyková funkce byla dohledána ve zveřejněných údajích o kompatibilitě prohlížečů. Pod těmito verzemi aplikace nemohou ani spustit, protože prohlížeč kódu nerozumí.

| | Nejstarší verze, která umí aplikace spustit |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS a iOS 16.4) |

CadCraft Studio má ve Windows vlastní webové jádro, takže vyžaduje Windows 10 nebo 11; na Macu používá systémové, takže vyžaduje macOS 13.3 nebo novější. Nastavení › Aktualizace ve Studiu ukazuje, na čem vaše kopie běží.

Je to nejstarší verze, která se *spustí*, zjištěná z kódu. Není to seznam starých prohlížečů, ve kterých jsme aplikace spouštěli, takže starší prohlížeč, který se spustí, může některou funkci stále postrádat.

## Co váš počítač potřebuje

Jde o plánovaná minima pro aplikace, ne o změřené požadavky:

- 8 GB paměti (pro velké federované modely se doporučuje 16 GB).
- Grafický čip s WebGL 2 pro 3D aplikace. Pokud 3D pohled zůstane prázdný, zkontrolujte, zda je v nastavení prohlížeče zapnuta hardwarová akcelerace.
- Obrazovka široká alespoň 1280 pixelů pro plné panely nástrojů; menší obrazovky je zalomí.

Velmi velké soubory (velké sady výkresů, velké modely) zabírají v kartě prohlížeče hodně paměti. Pokud se aplikace zpomalí, zavřete jiné náročné karty.
