---
title: Pracovný priestor Elektrické vedenia
summary: Nadzemné vedenia a podzemné káble na vašom stavbisku s vlastnými knižnicami, previsnutím a napnutím podľa vašich zaťažovacích stavov, kontrolami odstupov a pevnosti, tabuľkami vešania, množstvami, listami a exportom do GIS.
keywords: elektrické vedenie, nadzemné vedenie, elektrina, distribúcia, stĺpy, podpery, vodič, previsnutie, napnutie, vešanie, odstup, podzemný kábel, ryha, pracovný priestor, prevádzkovateľ siete
from: 638dd856
---

Pracovný priestor Elektrické vedenia umiestňuje nadzemné vedenia a podzemné káble na stavenisko CivilCraft, ktoré už máte: rovnaké body zamerania, rovnaký terén, rovnaký súbor projektu.

:::warning
Pomôcka pri návrhu. Pracovný priestor počíta previsnutie, napnutie, odstupy a zaťaženia z **vašich** zaťažovacích stavov a limitov; nie je v ňom zabudovaná norma žiadnej krajiny. Inžinier overí každý výsledok voči platnej norme predtým, než sa čokoľvek postaví.
:::

## Otvorenie

Vyberte {{ui:Povrch}} › {{ui:Viac}} › {{ui:Pracovný priestor Elektrické vedenia}}, alebo **Elektrické vedenia** v časti Pracovný priestor. Panel nástrojov potom zobrazí skupinu **Elektrické vedenia**; skupiny Návrh a GIS ustúpia. Ak sa chcete vrátiť, vyberte v časti Pracovný priestor **Civil**. CivilCraft si na tomto počítači zapamätá pracovný priestor, ktorý ste použili naposledy.

Ľavý panel získa na vrchu dve časti:

- **Elektrické vedenia**: vaše zaťažovacie stavy a limity, vedenia a káble v projekte a **Kontroly**, vždy aktuálne. Kliknutím na kontrolu vyberiete, čoho sa týka.
- **Knižnica**: vaše vlastné vodiče, káble, podpery, zariadenia a typy ryhy. Pozrite [Vaša knižnica elektrických vedení](topic:power-line-library).

## Čo je v skupine Elektrické vedenia

| Nástroj | Čo robí | Téma |
|---|---|---|
| **Vedenie** | Nadzemné vedenie: kliknite na každú podperu | [Kreslenie nadzemného vedenia](topic:overhead-line) |
| **Podpera** | Pridá podperu na úsek | [Kreslenie nadzemného vedenia](topic:overhead-line) |
| **Kábel** | Trasa podzemného kábla v ryhe | [Podzemné káble](topic:underground-cables) |
| **Zariadenie** | Skriňa, transformátor, spojka alebo zdroj, z ktorého je sieť napájaná | [Podzemné káble](topic:underground-cables) |
| **Prekážka** | Niečo, čo vedenie križuje: cesta, budova, iné vedenie | [Kontroly](topic:power-line-checks) |
| **Pozdĺžny profil** | Profil vedenia: terén, podpery a vodič pri každom zaťažovacom stave | [Kreslenie nadzemného vedenia](topic:overhead-line#the-line-profile) |
| **Viac** | Zaťažovacie stavy a limity, tabuľky vešania, množstvá, listy a správa, GIS, súbory štúdií | [Previsnutie a napnutie](topic:sag-and-tension), [Výstupy](topic:power-line-outputs), [Súbory štúdií](topic:power-line-study-file) |

Všetko, čo pridáte, je jeden krok späť, uloží sa do súboru projektu a kreslí sa v pôdoryse na hladinách s názvom `C-POWR-…`, takže ho prenesú aj exporty DXF, DWG a PDF.
