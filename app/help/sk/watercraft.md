---
title: WaterCraft: odbery, požiarny prietok, výpadky a vek vody
summary: S doplnkom WaterCraft premeňte odberateľov na odbery na vašich vodovodných potrubiach, skontrolujte prietok dostupný pri každom hydrante, zistite, ktorý výpadok potrubia najviac škodí, a sledujte vek vody a chlór počas dňa.
keywords: watercraft, rozvod vody, odbery, odberatelia, špičkový súčiniteľ, profil odberu, požiarny prietok, hydrant, zvyškový tlak, kritickosť, výpadok, uzatvárateľný úsek, vek vody, chlór, zvyšok, sledovanie zdroja, slepý koniec, csv, doplnok
from: 76809f01
---

WaterCraft je doplnok, ktorý pracuje so sieťou vodovodu, ktorú ste už nakreslili nástrojmi Vodovodné potrubia. Pridá kartu do pravého panela so štyrmi časťami.

:::warning
Len pomôcka na výpočty. Bola overená voči ručným výsledkom na vymyslených sieťach, nie na skutočnom modeli vodárenskej spoločnosti. Každý výsledok musí skontrolovať vodohospodársky inžinier. Zatiaľ nie sú čerpacie stanice, rozpad chlóru druhého rádu ani scenáre.
:::

## Čo budete robiť

- Umiestnite odberateľov do siete ako odbery.
- Nájdite hydranty, ktorým chýba prietok, ktorý potrebujete.
- Nájdite potrubia, ktorých výpadok je najdôležitejší.
- Nájdite starú vodu a nízky obsah chlóru.

## Postup

1. Otvorte {{ui:Settings}} › {{ui:Add-ons}} a zapnite {{ui:WaterCraft (rozvod vody)}}. V pravom paneli sa objaví karta {{ui:WaterCraft}}.
2. Najprv nakreslite nádrž, uzly a potrubia nástrojmi Vodovodné potrubia (pozri [Vodovodné potrubia](topic:water-mains)). Bez siete karta na to upozorní.
3. V časti {{ui:Demands}} vložte jedného odberateľa na riadok: id, x, y, druh, množstvo. Vyberte {{ui:Peaking factor}} a {{ui:Hourly pattern}} (denný profil pre bývanie, denný profil pre obchod, konštantný profil alebo ponechať profil tak, ako je). Stlačte {{ui:Check}}, aby ste zistili, kde každý odberateľ leží (najbližší uzol), potom stlačte {{ui:Put into the network}}. {{ui:Undo}} odstráni odbery.
4. V časti {{ui:Fire flow}} nastavte potrebný prietok a zvyškový tlak, vyberte, či sa zvyškový tlak drží {{ui:At the hydrant only}} alebo {{ui:Everywhere in the system (stricter)}}, a stlačte {{ui:Run}}. Každý hydrant je uvedený od najhoršieho, ako vyhovujúci alebo nedostatočný.
5. V časti {{ui:Which main matters most}} vyberte {{ui:one pipe at a time}} alebo {{ui:one valved section at a time}} a stlačte {{ui:Run}}. Každý výpadok zobrazí odpojený odber, odpojené uzly, uzly, ktoré novo klesli pod minimálny tlak, a najnižší zvyšný tlak.
6. V časti {{ui:Water age and chlorine}} vyberte, čo sledovať (vek vody, chlór alebo sledovanie zdroja), nastavte hodiny behu a limity, ktoré chcete, a stlačte {{ui:Run}}. Uzly mimo vašich limitov sa vypíšu.
7. Ak chcete ktorúkoľvek tabuľku uchovať, stlačte pod ňou {{ui:Save as CSV}}.

## Poznámky

- Potrebný požiarny prietok a spotreba na domácnosť alebo na acre sú východiskové hodnoty, nie normy. Použite údaje vašej vodárenskej spoločnosti.
- Potrubie, ktoré ventil čiastočne preruší, sa uzavrie celé, takže zobrazený výpadok je mierne horší než skutočný.
- Časť kvality vody nechajte bežať dosť dlho, aby sa denný profil zopakoval, skôr než čítate posledný deň.
- {{ui:Stop}} ukončí dlhý beh skôr; zoznam potom zobrazí iba to, čo sa stihlo.
- Vaša sieť zostane v tomto projekte a na tomto počítači. Nikam sa neposiela.
