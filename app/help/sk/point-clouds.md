---
title: Oblaky bodov z dronu alebo skenera
summary: Pomocou doplnku Oblaky bodov otvorte súbor LAS alebo LAZ s miliónmi bodov, pozrite si ho celý, vyčistite ho, roztriedte na terén, vegetáciu a budovy a z neho vytvorte terén, vrstevnice a objemy.
keywords: oblak bodov, las, laz, dron, fotogrametria, recap, lidar, skenovanie, terén, klasifikácia, šum, násyp, objem, výkop a násyp, vrstevnice, hrana zlomu, eye-dome, ortomozaika, ortofoto, premietnutie, vrstva mapy, export las, export laz, komprimovať
from: e4a4901f
---

Väčšina ľudí to nepotrebuje, preto ide o doplnok. Zapnite {{ui:Oblaky bodov}} v Nastaveniach › Doplnky; na pravom paneli sa objaví karta {{ui:Oblaky bodov}}. Súbor sa načíta vo vašom prehliadači a rozdelí sa na dlaždice, ktoré sa uložia do úložiska vášho prehliadača (alebo do priečinka, ktorý zvolíte). **Nič sa nenahráva.**

:::warning
Všetko, čo táto karta uvádza, je číslo z vašich údajov, nie certifikát. Bolo otestované na zmyslenom stavbisku, zatiaľ nie na skutočnom prieskume dronom: prvé výsledky čítajte opatrne a dajte nám vedieť, čo zistíte. Autorizovaný odborník rozhoduje o tom, akú hodnotu majú terén, vrstevnice a objemy.
:::

## Otvoriť oblak

V časti {{ui:Otvoriť oblak}} vyberte súbor LAS alebo LAZ. Karta uvedie, koľko bodov obsahuje, jeho súradnicový systém a jednotky a koľko miesta vytvorenie potrebuje; stlačte {{ui:Vytvoriť oblak}}. Vytváranie možno zastaviť a pokračovať v ňom tlačidlom {{ui:Pokračovať}} (vyberte znova ten istý súbor). Súbor sa nikdy nemení. Súbor so 100 miliónmi bodov sa na pracovnej stanici vytvorí za niekoľko minút a potrebuje približne rovnaké miesto ako samotný súbor.

V časti {{ui:Oblaky v tomto počítači}} môžete oblak otvoriť alebo odstrániť. {{ui:Ukladať oblaky do priečinka…}} (Chrome, Edge a aplikácia Studio) ukladá dlaždice do priečinka, ktorý vyberiete, napríklad do priečinka oblakov CadCraft v Dokumentoch, takže 10 GB oblak sa nemusí zmestiť do úložiska prehliadača; oblaky vytvorené skôr zostávajú tam, kde boli vytvorené. Prehliadač po reštarte znova požiada o povolenie: stlačte {{ui:Znova použiť priečinok …}}.

## Pozrieť si ho

{{ui:Zobraziť v 3D}} vykreslí oblak z hrubých dlaždíc a pri približovaní ho spresňuje, nikdy však naraz nie viac ako {{ui:Najviac vykreslených bodov}} (2.5 milióna; 500 tisíc na telefóne). Farbu určte podľa farby zo súboru, výšky, triedy, intenzity alebo {{ui:Reziduál}}. {{ui:Osvetlenie hrán podľa hĺbky}} tieni hrany podľa hĺbky, takže tvar je čitateľný aj bez normál (na telefóne vypnuté); {{ui:Body sa so vzdialenosťou zmenšujú}} zmenší vzdialené body a bližšie zväčší; {{ui:Veľkosť bodu}} nastaví veľkosť. Pôdorys zobrazuje oblak ako rastrovú vrstvu pod vaším výkresom a **pri priblížení** sa spresňuje pre danú časť.

## Vyčistiť

V časti {{ui:Vyčistiť}} nakreslite v pôdoryse laso, obdĺžnik alebo mnohouholník (alebo v 3D z pohľadu zhora: v 3D sa obrys premieta priamo nadol, takže je presný len zhora). Karta pred použitím zobrazí, koľko bodov je vnútri **pred** použitím: {{ui:Zmazať tieto body}}, {{ui:Zmeniť ich triedu}}, {{ui:Obnoviť zmazané body}} alebo {{ui:Orezať na túto hranicu}}. {{ui:Späť}} a {{ui:Znova}} prechádzajú záznamom úprav; samotný súbor sa nikdy nemení. {{ui:Filter šumu…}} označí rozptýlené body ako nízke body (trieda 7) alebo vysoký šum (trieda 18).

## Roztriediť

{{ui:Nájsť terén}} pracuje po dlaždiciach a označí terén (trieda 2) a nízke body; tolerancia je 0.15 m, alebo 0.08 m s prepínačom geodetickej presnosti. Hlási spoje dlaždíc, ktoré sa nezhodujú. {{ui:Klasifikovať vegetáciu a budovy}} potom označí nízku, strednú a vysokú vegetáciu a budovy podľa výšky nad terénom a podľa toho, aké rovné je okolie. Strojové učenie sa nepoužíva, takže prístrešok s plochou strechou pod stromami môže byť označený nesprávne: pozrite sa na to.

## Terén, vrstevnice, hrany zlomu

{{ui:Vytvoriť terén}} z bodov terénu vytvorí jestvujúci terén a pridá ho do projektu rovnako ako import LAS (jeden krok späť). Potom s ním porovná body: priemer, RMS, 95. percentil, podiel v rámci tolerancie a desať miest, ktoré sa najviac líšia, pričom každé má {{ui:Prejsť tam}}. Farba podľa {{ui:Reziduál}} zobrazuje, kde sa terén a oblak nezhodujú.

**Hrana zlomu** (obrubník, priekopa alebo hrana svahu) sa vyberá na oblaku: {{ui:Vybrať hranu zlomu na oblaku}} v 3D zobrazení pri každom kliknutí zvolí najbližší vykreslený bod a {{ui:Vybrať hranu zlomu v pôdoryse}} pri každom kliknutí zvolí najbližší bod oblaku (najprv terén); dvojklikom alebo klávesom Enter čiaru ukončíte. Ďalšie {{ui:Vytvoriť terén}} ju použije. {{ui:Zobraziť vrstevnice}} nakreslí vrstevnice nad oblak v malom obrázku a nastaví interval projektu.

## Objemy

{{ui:Objem násypu…}} vypočíta objem plochy nad základňou vnútri hranice, ktorú nakreslíte. Nakreslite hranicu na rovnom teréne okolo hromady a vyberte základňu: najnižší bod hranice, rovinu, hladkú zakrivenú základňu, plochu prechádzajúcu hranicou alebo úroveň, ktorú zadáte. Na svahovitom alebo zakrivenom teréne použite rovinu alebo zakrivenú základňu; najnižší bod vychádza príliš vysoko. Body hranice, ktoré vystupujú nad ostatné (strom na čiare), sa zo základne vynechajú. {{ui:Let na let}} udá výkop a násyp medzi dvoma oblakmi. Obe hodnoty sa dajú uložiť ako CSV.

## Ortomozaika

V časti {{ui:Ortomozaika (obraz zhora)}} vyberte ortomozaiku dronu spolu so svetovým súborom a `.prj`, ak ho má: GeoTIFF, alebo PNG či JPEG. Stane sa **vrstvou mapy** projektu, takže pôdorys ju zobrazí pod vaším výkresom a 3D zobrazenie (farba {{ui:Mapa}}) ju namaľuje na terén, ktorý ste vytvorili, preto najprv použite {{ui:Vytvoriť terén}}. Karta uvedie, akú časť oblaku obraz pokrýva, a upozorní, ak ho nepokrýva vôbec: obvyklou príčinou je iný súradnicový systém, preto k nemu pridajte súbor `.prj`. Ak `.prj` nie je, program sa opýta, kde sú súradnice. Obraz sa uchováva vnútri súboru projektu; GeoTIFF väčší ako 200 MB sa odmietne a veľmi veľká mozaika sa zmenší na 16 megapixelov, preto pri veľkom prieskume najprv orežte mozaiku na stavenisko.

## Export

{{ui:Export}} zapíše vyčistený a klasifikovaný oblak ako nový súbor (všetky body, vyčistené triedy alebo len terén). V časti {{ui:Typ súboru}} vyberte:

- **LAS 1.4 (nekomprimovaný)**: formát bodov 6, alebo 7 s farbou.
- **LAZ (komprimovaný)**: tie isté body komprimované bez straty, takže každý bod sa vráti presne. Zapisuje sa ako formát bodov 0, alebo 2 s farbou, v súbore LAS 1.4. Na zmyslenom stavbisku 300 m bol LAZ približne pätinou veľkosti súboru LAS 1.4. Formáty LAZ 0 a 2 obsahujú len triedy 0 až 31: bod s vyššou triedou sa odmietne so správou, takže taký oblak exportujte ako LAS 1.4.

LAZ zapisuje vlastný kompresor CadCraft, vytvorený podľa uverejnenej špecifikácie LAZ. Overili sme, že náš vlastný čítač a dva nezávislé čítače LAZ (laz-perf, ktorý aplikácia používa na otváranie súborov LAZ, a laspy s lazrs) čítajú každý bod presne späť a že súbory LAZ vytvorené knižnicou laspy sa po opätovnom zápise ich bodov zhodujú bajt po bajte. Iné programy sme zatiaľ neskúšali, takže ak niektorý súbor neotvorí, dajte nám vedieť, ktorý.

Ak prehliadač dokáže zapisovať súbor priebežne, najprv vyberiete súbor a veľmi veľký oblak sa do neho zapisuje po jednej dlaždici namiesto zhromažďovania v pamäti; inak sa súbor zhromaždí a stiahne, čo je v poriadku až do niekoľkých stoviek megabajtov.

## Čo nerobí

Číta len LAS a LAZ (E57, PLY a PCD zatiaľ nie sú v tejto karte pripojené a viacero súborov jedného letu sa nespája), oblak nepremieta do iného systému (predpokladá sa systém projektu a metre), nečíta súbory RCP ani RCS spoločnosti Autodesk, nevytvára povrch z fotografií a sám nenachádza stĺpy, obrubníky ani potrubia.
