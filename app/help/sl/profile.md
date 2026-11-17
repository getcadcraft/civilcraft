---
title: Zasnova vzdolžnega profila
summary: Odprite pogled profila, začnite načrtovani profil s terena, dodajajte in vlecite lomne točke PVI, nastavljajte dolžine vertikalnih krivin ter preberite nagibe, vrednosti K in najvišje ter najnižje točke.
keywords: profil, vzdolžna trasa, pvi, vertikalna krivina, nagib, vrednost k, vrh, dno, bvc, evc, pogled profila, končni nagib, fg, obstoječi profil terena, karakteristične črte v profilu, križanja, projicirano, robnik, jarek, oznake
from: e9182bfa
---

Vsaka trasa ima en načrtovani vzdolžni profil: seznam PVI (stacionaža in višina), povezanih z ravnimi nagibi, pri vsaki notranji PVI, ki ima dolžino, pa simetrična parabolična vertikalna krivina. Obstoječi profil terena se za vas vzorči iz površja.

## Odprtje pogleda profila

1. Izberite traso (kliknite jo z {{ui:Izberi}}).
2. Pritisnite {{key:R}}, kliknite {{ui:Vzdolžni profil}} v orodni vrstici ali {{ui:Pogled profila}} na dnu desne plošče.
   Pogled profila se odpre pod tlorisom z obstoječim terenom vzdolž trase. Pri dveh ali več trasah izberite eno na seznamu na levi strani vrstice profila.

Pogled vedno prikaže celotno traso in raztegne višine, da zapolnijo podokno; vertikalna pretiranost je natisnjena v spodnjem levem kotu, na primer „Vertikalna pretiranost 10×“. Ne povečuje in ne pomika.

Premaknite kazalec vzdolž profila: vrstica prikaže stacionažo, višine terena in načrtovane višine, nagib ter izkop ali nasip na tem mestu, v tlorisu pa se po trasi premika pika.

## Začetek načrtovanega profila

1. V desni plošči pod **Načrtovani profil** kliknite {{ui:Začni s terena}}.
   Dve PVI se postavita na teren na obeh koncih trase, povezani z enim ravnim nagibom. Vrstica stanja pravi: „Načrtovani profil se je začel na terenu na obeh koncih. Vklopite Dodaj lomne točke in kliknite, da dodate lomne točke nagiba; v tabeli jim dajte dolžino krivine.“

Če trasa ne seka površja, se prikaže: „Pod to traso ni terena, od koder bi lahko začeli.“ Nato namesto tega dodajte PVI s klikanjem (naslednji razdelek).

## Dodajanje PVI

1. Pritisnite {{key:I}} ali kliknite {{ui:Dodaj lomne točke}} v vrstici profila. Gumb ostane pritisnjen.
2. Kliknite v profil, kjer želite lomno točko nagiba. PVI se doda na tej stacionaži in višini, zaokrožena na 0.01, in je izbrana.
3. Dodajte jih, kolikor potrebujete, nato spet pritisnite {{key:I}}, da prenehate z dodajanjem.

Klik, kjer je že PVI, je zavrnjen („Na tem mestu je že PVI pri …“). PVI so vedno urejene po vrstnem redu stacionaže.

## Prilagajanje PVI

- **Povlecite** PVI v profilu, da jo premaknete. Ne more preiti svojih sosedov. Premik je en korak razveljavitve.
- **Vnesite** natančne vrednosti v tabelo PVI v desni plošči: **Stacionaža**, **Višina** in **Dolžina krivine L** (dolžina vertikalne krivine). Po vsaki pritisnite {{key:Enter}}.
- **Odstranite** PVI z x na koncu njene vrstice ali jo izberite (kliknite nanjo) in pritisnite {{key:Delete}}. Ko ima pogled profila fokus, jo odstrani tudi {{key:Backspace}}.

Prva in zadnja PVI nikoli ne dobita krivine.

## Vertikalne krivine

1. Za notranjo PVI vnesite dolžino v **Dolžina krivine L**, na primer 200.
2. Krivina se nariše središčno na PVI. Profil in desna plošča prikažeta njeno vrsto (konveksna ali konkavna), L in K, stacionaže in višine BVC in EVC ter njeno najvišjo ali najnižjo točko, če je ta znotraj krivine.

K se izračuna iz L (K = L deljeno z algebrajsko razliko nagibov v odstotkih). Vnesete L; vnos K neposredno še ni na voljo.

Če vertikalna krivina ne ustreza, rdeče polje pove zakaj: sega nazaj v PVI ali krivino pred njo ali čez naslednjo PVI, in koliko prostora je na tej strani (krivina potrebuje polovico svoje dolžine na vsaki strani svoje PVI). Njen gumb nastavi **najdaljšo krivino, ki ustreza**, skupaj z njeno K, kot en korak ({{key:Mod+Z}} to razveljavi). Ali pa razmaknite PVI.

## Preberite podatke

Pod tabelo PVI seznam navaja vsak nagib v odstotkih („Nagib 1: +1.25%“) in vsako krivino, na primer „Vrh pri 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, nato „Najvišja točka 1+62.40, 254.12“.

Če PVI ne segajo do obeh koncev trase, to pove opomba. Koridor se zgradi le tam, kjer se profil in trasa prekrivata.

## Karakteristične črte v profilu

Karakteristične črte se prikažejo tudi v pogledu profila, da lahko vidite robnik, jarek ali vrh zidu glede na profil ceste.

- Kjer karakteristična črta **seka** traso, profil na tej stacionaži in višini prikaže majhen romb, označen z imenom črte in njeno višino tam (lastna višina črte, izračunana vzdolž odseka, ki seka).
- V {{ui:Ob njej v razdalji}} vnesite razdaljo, da narišete tudi karakteristične črte, ki **potekajo ob** trasi v tej razdalji, kot črtkane črte na njihovih lastnih višinah. Prazno ali 0 prikaže le križanja.
- Oznake in napisi sledijo vsaki spremembi: premaknite oglišče, vnesite nagib ali dvignite črto, profil pa takoj prikaže nove višine.
- Kliknite romb križanja, da izberete to karakteristično črto; izbrana črta se nariše v barvi poudarka.
- {{ui:Karakteristične črte}} v vrstici profila jih vse skrije ali pokaže. Obe nastavitvi se shranita z projektom.

Glejte [Karakteristične črte](topic:feature-lines).

## Naprej

- [Izdelajte cestni koridor](topic:corridor) vzdolž trase in tega profila.
- Profil se zapiše v LandXML skupaj s trasom; glejte [Izmenjava LandXML](topic:landxml).
