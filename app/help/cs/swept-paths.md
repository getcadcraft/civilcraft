---
title: Obalové dráhy vozidel
summary: Veďte vozidlo s až třemi přívěsy po lomové čáře nebo ose, vpřed nebo couváním, a zjistěte plochu, kterou zamete, stopy kol, řízení a místo, kde se složí v kloubu.
keywords: obalová dráha, dráha při otáčení, sledování vozidla, šablona otáčení, návrhové vozidlo, nákladní vozidlo, autobus, přívěs, návěs, couvání, složení, kloub, zámek řízení, odsazení stopy, stopa kola, nakládací rampa, poloměr otáčení
from: 8caafb8a
---

Obalová dráha vede vozidlo po čáře a ukazuje terén, přes který přejíždí jeho karoserie. Použijte ji ke kontrole, že nákladní auto zvládne zatáčku, dosáhne na nakládací rampu nebo zacouvá přívěs na místo, aniž by sjelo z dlažby.

## Vedení vozidla po čáře

1. Nakreslete čáru, kterou vozidlo sleduje, ve směru jízdy: lomovou čáru (oblouky jsou v pořádku: při kreslení stiskněte {{key:C}}, viz [Lomové čáry](topic:feature-lines)), nebo osu.
2. Vyberte ji a klikněte na {{ui:Dráha vozidla…}} v jejích **Vlastnostech**.
3. Pod **Začít od** vyberte vozidlo a nastavte jeho rozměry podle vlastního návrhového vozidla: šířku, přečnívání vpředu, rozvor, přečnívání vzadu, rozchod a **Zámek řízení**. Přidejte až tři přívěsy, každý s místem připojení, délkou od připojení k nápravě, svými přečnívání a **Největším úhlem kloubu**.
4. Zvolte **Jízda**: vpřed, nebo couváním. Klikněte na {{ui:Projet}}.

:::warning
Vozidla, ze kterých se začíná, jsou zástupné hodnoty, ne norma. Nastavte rozměry podle návrhového vozidla, které váš projekt používá.
:::

## Vpřed a couváním

| Jízda | Co sleduje čáru | Co CivilCraft spočítá |
|---|---|---|
| **Vpřed** | Střed přední nápravy | Kam pojede zadní náprava a každá přívěsová jednotka, úhel řízení a úhel kloubu |
| **Couváním** | Střed poslední nápravy (zadní konec přívěsu) | Kam pojede každá jednotka před ním a řízení, které kabina potřebuje, aby tam přívěs dostala |

Couvání se kontroluje tak, že řeknete, kam má přívěs jet, a CivilCraft řekne, zda na to kabina stačí.

## Čtení výsledku

Obalová dráha je v půdorysu nakreslena oranžově: její obrys a čárkovaně stopy nejvzdálenějších kol. Vyberte ji (klikněte dovnitř), abyste ve **Vlastnostech** viděli:

- **Ujetou délku**, největší úhel **Řízení** a **Kloubu** proti jejich mezím a **Plochu zametení**.
- Jakýkoli problém podél čáry s jeho vzdáleností: řízení za zámkem, nebo přívěs, který přesáhne mez kloubu (složí se).
- **Vozidlo podél čáry**: posunutím jezdce uvidíte vozidlo v libovolném bodě se jeho řízením a kloubem tam.

Změníte-li čáru, obalová dráha ji následuje. {{ui:Upravit vozidlo…}} mění rozměry; **Jízda** přepíná mezi vpřed a couváním. Každá změna je jeden krok: {{key:Mod+Z}} ji vrátí zpět. {{key:Delete}} smaže vybranou obalovou dráhu (čára zůstane).

Obrys a stopy kol se exportují do PDF, DXF a DWG na vrstvu C-ROAD-SWPT.

## Jak se to počítá

Každá jednotka se otáčí kolem přímky své zadní nápravy a je tažena bodem před ní (přední nápravou nebo připojením), což je model při nízké rychlosti bez prokluzu, který kontroly obalových drah používají. Plocha zametení je všechny obrysy karoserie ve všech polohách dohromady. Neuvažuje rychlost, prokluz pneumatik, dobu, kterou řízení potřebuje k otočení, řízené přívěsy ani světlou výšku pod karoserií.
