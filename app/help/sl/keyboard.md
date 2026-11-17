---
title: Tipke in miška
summary: Vsaka bližnjica na tipkovnici ter dejanje z miško, sledilno ploščico in dotikom v CivilCraft, razvrščeno v skupine, z razlikami med brskalniki in platformami.
keywords: tipkovnica, bližnjice, hitre tipke, tipke, miška, sledilna ploščica, dotik, pomik, povečava, stisk, kolešček, desni klik, mac, tipka command
from: a9756f46
---

Posamezne tipke delujejo, kadar ne vpisujete v okno. Bližnjice z {{key:Mod}} uporabljajo Command na Macu in Ctrl drugje. Glejte tudi [Tipke v brskalniku](common:keys).

## Datoteke in urejanje

| Tipka | Dejanje |
|---|---|
| {{key:Mod+O}} | Odpri datoteko točk, LandXML ali projekt |
| {{key:Mod+S}} | Shrani projekt (prenese datoteko `.civilcraft.json`) |
| {{key:Mod+P}} | Izriši tloris v PDF (odpre pogovorno okno za izris, ne brskalnikovega tiskanja) |
| {{key:Mod+Z}} | Razveljavi |
| {{key:Mod+Y}} | Uveljavi |
| {{key:Delete}} | Izbriši izbrane točke, trase, ploščad, objekt, cev ali PVI |
| {{key:Mod+C}} | Kopiraj izbrane točke (tudi kot vrstice točk za preglednico) |
| {{key:Mod+X}} | Izreži izbrane točke |
| {{key:Mod+V}} | Prilepi točke: sledijo kazalcu, kliknite, kamor naj gredo |
| {{key:Mod+Shift+V}} | Prilepi na isto mesto: na lastnih koordinatah točk |
| {{key:Mod+D}} | Podvoji izbrane točke: kopija sledi kazalcu |
| {{key:Mod+A}} | Izberi vse točke |
| {{key:Esc}} | Prekliči izbor (in prekliči lepljenje) |

{{key:Mod+S}}, {{key:Mod+O}} in {{key:Mod+P}} delujejo tudi med vpisovanjem v okno. {{key:Mod+Z}} in {{key:Mod+Y}} v besedilnem polju razveljavita vaše vpisovanje, kot običajno, prav tako {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} in {{key:Mod+A}}: v oknu kopirajo, režejo, lepijo in izberejo njegovo besedilo. Če je besedilo na strani izbrano (v podoknu), {{key:Mod+C}} kopira to besedilo. {{key:Mod+Shift+Z}} v CivilCraft ne naredi ničesar: uporabite {{key:Mod+Y}} ali gumb {{ui:Uveljavi}}.

:::mac
Tipka na Macu z napisom **delete** je v brskalniku {{key:Backspace}}. Za brisanje izbora pritisnite {{key:Delete}} (Fn in delete) ali izberite {{ui:Izbriši}} v orodni vrstici, v meniju {{ui:Več}}.
:::

## Orodja

| Tipka | Orodje |
|---|---|
| {{key:V}} | {{ui:Izberi}} |
| {{key:M}} | {{ui:Meri}}: razdalje, površine in nakline na tlorisu ([Meri](topic:measure)) |
| {{key:A}} | {{ui:Trasa}} |
| {{key:G}} | {{ui:Ploščad}} |
| {{key:P}} | {{ui:Cevi}} |
| {{key:B}} | {{ui:Prelomnica}} |
| {{key:O}} | {{ui:Meja}} |
| {{key:R}} | Pokaži ali skrij pogled profila |
| {{key:I}} | Vklopi ali izklopi {{ui:Dodaj lomne točke}} (odpre pogled profila, če je zaprt) |
| {{key:F}} | {{ui:Prilagodi}}: pokaži vse |
| {{key:D}} | {{ui:3D}}: pokaži lokacijo v 3D ali se vrnite na tloris |
| {{key:E}} | Pokaži ali skrij nagibe in višine vzdolž vsake karakteristične črte (samo na zaslonu) |

Ponovni pritisk tipke aktivnega orodja vas vrne na {{ui:Izberi}}. Črke s Shift ne naredijo ničesar.

## Med risanjem

| Tipka | Dejanje |
|---|---|
| {{key:Enter}} | Zaključi risanje trase, ploščadi, poteka cevi, prelomnice ali meje |
| {{key:Backspace}} | Odstrani zadnjo kliknjeno točko |
| {{key:C}} | Karakteristična črta: vklopi ali izklopi loke (po vozlišču kliknite točko na krivulji, nato njen konec) |
| {{key:Esc}} | Prekliči risanje (ali lepljenje); če pritisnete znova (ali če ni nič narisano), se vrnete na {{ui:Izberi}} in počistite izbor |

## Pogled na tloris

| Tipka ali dejanje | Rezultat |
|---|---|
| Kolešček | Povečaj ali pomanjšaj pri kazalcu |
| Vlečenje po prazni površini | Pomik (v katerem koli orodju; kratek klik še vedno klikne; ob držanju {{key:Shift}} nariše okvir izbora) |
| Vlečenje s srednjim gumbom | Pomik |
| Vlečenje z desnim gumbom | Pomik (meni se ne odpre) |
| {{key:Space}} in vlečenje | Pomik |
| Klik | Izberi (z {{ui:Izberi}}) ali postavi točko (z orodjem za risanje) |
| {{key:Shift}} in klik | Dodaj točko k izboru ali jo odstrani iz njega |
| {{key:Shift}} in vlečenje | Nariši okvir: točke znotraj njega se dodajo v izbor. Potegnite okoli njih za [lasso](topic:lasso-selection) |
| {{key:Space}} med risanjem laza | Okno, nato sekanje, nato ograja |
| Klik med lepljenjem | Postavi prilepljene točke tam ({{key:Enter}} jih postavi na njihove lastne koordinate) |
| Vlečenje ročice | Premakni PI, vogal ploščadi ali objekt (en korak razveljavitve) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Pomik, kadar ima tloris fokus (najprej kliknite nanj) |
| {{key:Plus}} in {{key:Minus}} | Povečaj in pomanjšaj v sredini, kadar ima tloris fokus |

Tipka = povečuje kot {{key:Plus}}, zato Shift ni potreben.

## Pogled profila

| Dejanje | Rezultat |
|---|---|
| Klik z vklopljenim {{ui:Dodaj lomne točke}} | Dodaj tam PVI |
| Klik na PVI | Izberi ga |
| Vlečenje PVI | Premakni ga (en korak razveljavitve) |
| {{key:Delete}} ali {{key:Backspace}} | Odstrani izbrani PVI ({{key:Backspace}} samo, kadar ima pogled profila fokus) |

Pogled profila se ne povečuje in ne pomika.

## Zaslon in pomoč

| Tipka | Dejanje |
|---|---|
| {{key:F1}} | Odpri ali zapri to pomoč (stranski panel); {{ui:Pomoč}} v vrstici aplikacije naredi isto |
| {{key:Esc}} | Zapre podokno pomoči, kadar je odprto |
| {{key:Ctrl+Shift+F}} | Preklapljajte načine zaslona: celozaslonski, celozaslonski s skritimi vrsticami, običajni |
| {{key:Esc}} | Zapusti celozaslonski način (lastna tipka brskalnika) |

{{key:F1}} doseže pomoč, preden jo CivilCraft zazna, zato deluje v vsakem orodju. Na večini tipkovnic Mac pritisnite fn s {{key:F1}} ali kliknite {{ui:Pomoč}}. {{key:Ctrl+Shift+F}} uporablja tipko Control na vseh platformah, tudi na Macu. Glejte [Uporaba pomoči](common:help), kako iskati po tej pomoči.

## Miška, sledilna ploščica in dotik

:::mouse
- Kolešček povečuje pri kazalcu. Miška s prosto vrtečim se kolescem se povečuje hitro: zavrtite ga na kratko.
- Pomik z vlečenjem po prazni površini, s srednjim gumbom, z desnim gumbom ali s {{key:Space}} in vlečenjem.
:::

:::mac
Na sledilni ploščici Mac:

- Pomikanje z dvema prstoma **povečuje** (ne pomika), prav tako stisk za povečavo.
- Za pomik pritisnite in povlecite po prazni površini z enim prstom ali držite {{key:Space}} in vlecite.
- Klik z dvema prstoma (desni klik) ne odpre menija in sam po sebi ne naredi ničesar.
:::

:::touch
Na zaslonu na dotik:

- Prvi dotik naredi gumbe in vrstice menija velike kot prst.
- Tapnite za izbor ali postavitev točke; en prst, povlečen po prazni površini, pomika. Tap se lahko malo tresi: pomik se začne šele, ko se prst premakne za približno 10 slikovnih točk.
- Dva prsta s stiskom povečujeta, skupno premikanje pa pomika.
- Povlecite ročico ali PVI z enim prstom. Ročice imajo okoli sebe prostor, širok kot prst.
- Med risanjem trase, ploščadi, prelomnice, meje, poteka cevi, karakteristične črte ali parcele se nad tlorisom prikaže vrstica z {{ui:Končaj}} ({{key:Enter}}), {{ui:Razveljavi točko}} ({{key:Backspace}}) in {{ui:Prekliči}} ({{key:Esc}}). Dolg pritisk (pol sekunde brez premikanja) prav tako zaključi.
- V {{ui:Izberi}} dolg pritisk na točki jo doda k izboru ali odstrani iz njega, kot to naredi {{key:Shift}}+klik.
- V 3D pogledu en prst vrti pogled, dva stiskata in pomikata, tap pa izbere.
- Pri dotiku ni lebdenja, zato se odčitki v vrstici stanja osvežijo samo, medtem ko je prst na zaslonu.
:::

## Tipke brskalnika, ki imajo prednost

Nekatere tipke pripadajo brskalniku in nikoli ne dosežejo CivilCraft, na primer {{key:Mod+W}} (zapre zavihek), {{key:Mod+T}} (nov zavihek), {{key:Mod+N}} (novo okno) in {{key:F11}} (celozaslonski način v brskalnikih za Windows in Linux). CivilCraft jih ne uporablja. Če bližnjica v brskalniku odpre nekaj drugega, enkrat kliknite na tloris, da stran dobi fokus, in poskusite znova.

## Kje je ukaz Premakni

Ukaza Premakni ni: izberite {{ui:Izberi}} in povlecite točko ali oglišče ali uredite njene koordinate v {{ui:Lastnosti}}. Glejte [Urejanje točk](topic:edit-points).
