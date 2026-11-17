---
title: Klávesy a myš
summary: Každá klávesová skratka a každá akcia myšou, touchpadom a dotykom v CivilCraft, zoskupené, s rozdielmi prehliadača a platformy.
keywords: klávesnica, skratky, klávesové skratky, klávesy, myš, touchpad, dotyk, posun, zväčšenie, zovretie prstov, koliesko, pravé tlačidlo, mac, klávesa command
from: a9756f46
---

Klávesy s jedným písmenom fungujú, keď nepíšete do poľa. Skratky s {{key:Mod}} používajú Command na Macu a Ctrl inde. Pozri aj [Klávesy v prehliadači](common:keys).

## Súbory a úpravy

| Klávesa | Akcia |
|---|---|
| {{key:Mod+O}} | Otvoriť súbor bodov, LandXML alebo projekt |
| {{key:Mod+S}} | Uložiť projekt (stiahne súbor `.civilcraft.json`) |
| {{key:Mod+P}} | Vykresliť pôdorys do PDF (otvorí dialóg vykreslenia, nie tlač prehliadača) |
| {{key:Mod+Z}} | Späť |
| {{key:Mod+Y}} | Znova |
| {{key:Delete}} | Zmazať vybrané body, os trasy, plošinu, objekt, potrubie alebo PVI |
| {{key:Mod+C}} | Kopírovať vybrané body (aj ako riadky bodov pre tabuľku) |
| {{key:Mod+X}} | Vystrihnúť vybrané body |
| {{key:Mod+V}} | Prilepiť body: idú za ukazovateľom, kliknite, kam patria |
| {{key:Mod+Shift+V}} | Prilepiť na rovnaké miesto: na vlastné súradnice bodov |
| {{key:Mod+D}} | Duplikovať vybrané body: kópia ide za ukazovateľom |
| {{key:Mod+A}} | Vybrať všetky body |
| {{key:Esc}} | Zrušiť výber (a zrušiť prilepenie) |

{{key:Mod+S}}, {{key:Mod+O}} a {{key:Mod+P}} fungujú aj vtedy, keď píšete do poľa. {{key:Mod+Z}} a {{key:Mod+Y}} v textovom poli vrátia späť vaše písanie, ako obvykle, rovnako {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} a {{key:Mod+A}}: v poli kopírujú, vystrihujú, vkladajú a označujú jeho text. Keď je text na stránke označený (v paneli), {{key:Mod+C}} skopíruje tento text. {{key:Mod+Shift+Z}} v CivilCraft nerobí nič: použite {{key:Mod+Y}} alebo tlačidlo {{ui:Znova}}.

:::mac
Kláves na Macu označený **delete** je pre prehliadač {{key:Backspace}}. Na zmazanie výberu stlačte {{key:Delete}} (Fn a delete) alebo zvoľte {{ui:Zmazať}} na paneli nástrojov v ponuke {{ui:Viac}}.
:::

## Nástroje

| Klávesa | Nástroj |
|---|---|
| {{key:V}} | {{ui:Výber}} |
| {{key:M}} | {{ui:Meranie}}: vzdialenosti, plochy a sklony na pôdoryse ([Meranie](topic:measure)) |
| {{key:A}} | {{ui:Os trasy}} |
| {{key:G}} | {{ui:Plošina}} |
| {{key:P}} | {{ui:Potrubia}} |
| {{key:B}} | {{ui:Hrana zlomu}} |
| {{key:O}} | {{ui:Hranica}} |
| {{key:R}} | Zobraziť alebo skryť pohľad na profil |
| {{key:I}} | Zapnúť alebo vypnúť {{ui:Pridať PVI}} (otvorí pohľad na profil, ak je zatvorený) |
| {{key:F}} | {{ui:Prispôsobiť}}: zobraziť všetko |
| {{key:D}} | {{ui:3D}}: zobraziť pozemok v 3D, alebo sa vrátiť na pôdorys |
| {{key:E}} | Zobraziť alebo skryť sklony a výšky pozdĺž každej charakteristickej čiary (len na obrazovke) |

Keď znova stlačíte kláves aktívneho nástroja, vrátite sa na {{ui:Výber}}. Písmená so {{key:Shift}} nerobia nič.

## Počas kreslenia

| Klávesa | Akcia |
|---|---|
| {{key:Enter}} | Dokončiť os trasy, plošinu, beh potrubia, hranu zlomu alebo hranicu |
| {{key:Backspace}} | Odstrániť posledný kliknutý bod |
| {{key:C}} | Charakteristická čiara: zapnúť alebo vypnúť oblúky (po vrchole kliknite na bod krivky, potom na jej koniec) |
| {{key:Esc}} | Zrušiť kreslenie (alebo prilepenie); pri opätovnom stlačení (alebo keď nič nie je nakreslené) sa vrátite na {{ui:Výber}} a zrušíte výber |

## Pohľad na pôdorys

| Klávesa alebo akcia | Výsledok |
|---|---|
| Koliesko | Zväčšiť alebo zmenšiť pri ukazovateli |
| Ťahanie po prázdnom priestore | Posun (v každom nástroji; krátke kliknutie stále klikne; keď držíte {{key:Shift}}, nakreslí výberový rámček) |
| Ťahanie stredným tlačidlom | Posun |
| Ťahanie pravým tlačidlom | Posun (nič sa neotvorí) |
| {{key:Space}} a ťahanie | Posun |
| Kliknutie | Vybrať (s {{ui:Výber}}), alebo umiestniť bod (s nástrojom kreslenia) |
| {{key:Shift}} a kliknutie | Pridať zameraný bod do výberu alebo ho z výberu odobrať |
| {{key:Shift}} a ťahanie | Nakresliť rámček: body v ňom sa pridajú do výberu. Ťahajte okolo nich pre [lasso](topic:lasso-selection) |
| {{key:Space}} počas kreslenia lasa | Okno, potom prekríženie, potom ohrada |
| Kliknutie pri prilepovaní | Umiestni prilepené body tam ({{key:Enter}} ich umiestni na ich vlastné súradnice) |
| Ťahanie úchytu | Presunúť PI, roh plošiny alebo objekt (jeden krok späť) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Posun, keď má pôdorys zameranie (najprv naň kliknite) |
| {{key:Plus}} a {{key:Minus}} | Zväčšiť a zmenšiť v strede, keď má pôdorys zameranie |

Klávesa = približuje ako {{key:Plus}}, takže {{key:Shift}} nepotrebujete.

## Pohľad na profil

| Akcia | Výsledok |
|---|---|
| Kliknutie s zapnutým {{ui:Pridať PVI}} | Pridať PVI tam |
| Kliknutie na PVI | Vybrať ho |
| Ťahanie PVI | Presunúť ho (jeden krok späť) |
| {{key:Delete}} alebo {{key:Backspace}} | Odstrániť vybrané PVI ({{key:Backspace}} len vtedy, keď má pohľad na profil zameranie) |

Pohľad na profil sa nezväčšuje ani neposúva.

## Obrazovka a pomocník

| Klávesa | Akcia |
|---|---|
| {{key:F1}} | Otvoriť alebo zavrieť túto pomoc (bočný panel); {{ui:Pomocník}} v paneli aplikácie robí to isté |
| {{key:Esc}} | Zavrieť panel pomocníka, keď je otvorený |
| {{key:Ctrl+Shift+F}} | Prepínať režimy obrazovky: celá obrazovka, celá obrazovka so skrytými lištami, normálny |
| {{key:Esc}} | Ukončiť celú obrazovku (vlastná klávesa prehliadača) |

{{key:F1}} sa dostane k pomocníkovi skôr, než ho CivilCraft uvidí, takže funguje v každom nástroji. Na väčšine klávesníc Mac stlačte fn s F1 alebo kliknite na {{ui:Pomocník}}. {{key:Ctrl+Shift+F}} používa kláves Control na každej platforme vrátane Macu. Pozri [Používanie pomocníka](common:help), kde nájdete, ako v tejto pomoci hľadať.

## Myš, touchpad a dotyk

:::mouse
- Koliesko zväčšuje pri ukazovateli. Myš s voľne sa otáčajúcim kolieskom zväčšuje rýchlo: otáčajte krátko.
- Posúvajte ľubovoľným ťahaním po prázdnom priestore, stredným tlačidlom, pravým tlačidlom alebo {{key:Space}} a ťahaním.
:::

:::mac
Na touchpade Mac:

- Posúvanie dvoma prstami **zväčšuje** (neposúva) a zovretie prstov tiež zväčšuje.
- Na posun stlačte a ťahajte jedným prstom po prázdnom priestore, alebo držte {{key:Space}} a ťahajte.
- Kliknutie dvoma prstami (pravé tlačidlo) neotvorí žiadnu ponuku a samo nič nerobí.
:::

:::touch
Na dotykovej obrazovke:

- Prvý dotyk zväčší tlačidlá a riadky ponuky na veľkosť prsta.
- Klepnutím vyberte alebo umiestnite bod; jeden prst ťahaný po prázdnom priestore posúva. Klepnutie sa môže trochu chvieť: posúva sa až vtedy, keď sa prst pohne asi o 10 pixelov.
- Dva prsty zovretím zväčšujú a spoločným pohybom posúvajú.
- Ťahajte úchyt alebo PVI jedným prstom. Úchyty majú okolo seba priestor o šírke prsta.
- Keď kreslíte os trasy, plošinu, hranu zlomu, hranicu, beh potrubia, charakteristickú čiaru alebo parcelu, nad pôdorysom sa zobrazí lišta s {{ui:Dokončiť}} ({{key:Enter}}), {{ui:Späť o bod}} ({{key:Backspace}}) a {{ui:Zrušiť}} ({{key:Esc}}). Dlhé stlačenie (pol sekundy bez pohybu) tiež dokončí.
- V {{ui:Výber}} dlhé stlačenie na zameranom bode ho pridá do výberu alebo z neho odobere, ako to robí kliknutie s {{key:Shift}}.
- V 3D zobrazení jeden prst obieha, dva zovretím približujú a posúvajú a klepnutie vyberá.
- Dotyk nemá nájazd kurzora, takže údaje v stavovom riadku sa aktualizujú len vtedy, keď je prst na obrazovke.
:::

## Klávesy, ktoré majú prednosť v prehliadači

Niektoré klávesy patria prehliadaču a nikdy sa nedostanú k CivilCraft, napríklad {{key:Mod+W}} (zavrieť kartu), {{key:Mod+T}} (nová karta), {{key:Mod+N}} (nové okno) a {{key:F11}} (celá obrazovka v prehliadačoch pre Windows a Linux). CivilCraft ich nepoužíva. Ak skratka namiesto toho otvorí niečo v prehliadači, raz kliknite na pôdorys, aby stránka mala zameranie, a skúste znova.

## Kde sa nachádza Presunúť

Príkaz Presunúť neexistuje: zvoľte {{ui:Výber}} a ťahajte bod alebo vrchol, alebo upravte jeho súradnice v {{ui:Vlastnosti}}. Pozri [Úprava bodov](topic:edit-points).
