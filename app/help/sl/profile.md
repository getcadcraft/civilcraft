---
title: Oblikovanje vertikalnega profila
summary: Odprite pogled profila, začnite projektni profil iz terena, dodajajte in vlecite PVI, nastavite dolžine vertikalnih krivin ter preberite nakline, vrednosti K ter visoke in nizke točke.
keywords: profil, vertikalna trasa, pvi, vertikalna krivina, naklon, vrednost k, vrh, dno, bvc, evc, pogled profila, končni naklon, fg, profil obstoječega terena, karakteristične črte v profilu, preseki, projekcija, robnik, jarek, oznake
from: dbb1f32d
---

Vsaka trasa ima en projektni profil: seznam PVI (stacionaža in višina), povezanih z ravnimi nakloni, pri čemer ima vsaka notranja PVI z dolžino simetrično parabolično vertikalno krivino. Profil obstoječega terena vam iz površja vzorči samodejno.

## Odprtje pogleda profila

1. Izberite traso (kliknite jo z {{ui:Izberi}}).
2. Pritisnite {{key:R}}, kliknite {{ui:Vzdolžni profil}} v orodni vrstici ali {{ui:Pogled profila}} na dnu desnega podokna.
   Pogled profila se odpre pod načrtom z obstoječim terenom vzdolž trase. Če je tras več, izberite eno s seznama na levi strani vrstice profila.

Pogled na začetku prikaže celotno traso in raztegne višine, da zapolnijo podokno; povečava je izpisana v spodnjem levem kotu, na primer „Navpična povečava 10×“.

## Povečava in pomik profila

- **Povečava:** zavrtite kolešček miške (ali stisnite z dvema prstoma na sledilni ploščici) in pogled se poveča okoli kazalca. Držite {{key:Shift}}, da povečate samo stacionaže, ali {{key:Alt}}, da povečate samo višine (to spremeni povečavo). Ko je pogled profila v fokusu, tipki plus in minus povečata okoli sredine.
- **Pomik:** povlecite z desnim ali srednjim gumbom miške ali podrsajte z dvema prstoma na sledilni ploščici.
- **Prilagodi:** dvakrat kliknite profil ali pritisnite {{key:F}}, da znova prikažete celotno traso.

Urejanje PVI ohrani izbrano povečavo; pogled ne skoči nazaj na prilagoditev.

Premaknite kazalec vzdolž profila: vrstica prikazuje stacionažo, višine terena in projekta, naklon ter izkop ali nasip tam, pika pa sledi po trasi v načrtu.

## Začetek projektnega profila

1. V desnem podoknu pod **Projektni profil** kliknite {{ui:Začni s terena}}.
   Dve PVI sta postavljeni na teren na obeh koncih trase, povezani z enim ravnim naklonom. Vrstica stanja pravi „Projektni profil začet na terenu na obeh koncih. Vklopite Dodaj lomne točke in kliknite, da dodate lomne točke naklona; v tabeli jim dajte dolžino krivine.“

Če trasa ne seka površja, dobite „Ta trasa nima terena, od katerega bi se začelo.“ Nato dodajte PVI s klikanjem (naslednji razdelek).

## Dodajanje PVI

1. Pritisnite {{key:I}} ali kliknite {{ui:Dodaj lomne točke}} v vrstici profila. Gumb ostane pritisnjen.
2. Kliknite v profil, kjer želite lomno točko naklona. PVI se doda na tej stacionaži in višini, zaokroženi na 0.01, in se izbere.
3. Dodajte toliko, kot potrebujete, nato znova pritisnite {{key:I}}, da prenehate dodajati.

Klik, kjer je PVI že, je zavrnjen („Na mestu … je že PVI.“). PVI so vedno v vrstnem redu stacionaž.

## Lovljenje med dodajanjem ali vlečenjem

Gumb **Lovljenje** v vrstici profila je na začetku vklopljen. Dokler je vklopljen, PVI, ki ga dodate ali povlečete, pristane na najbližji PVI, točki terena, stacionaži PVI ali črti terena, oznaka ob oznaki pa pove, katera. Držite {{key:Alt}} za prosto točko, kjerkoli.

## Prilagajanje PVI

- **Povlecite** PVI v profilu, da jo premaknete. Ne more preiti svojih sosedov. Premik je en korak razveljavitve.
- **Vnesite** natančne vrednosti v tabeli PVI v desnem podoknu: **Stacionaža**, **Višina**, **Naklon %** in **Krivina L** (dolžina vertikalne krivine). Po vsaki pritisnite {{key:Enter}}.
- **Izberite** vrednost iz profila: majhen gumb ob stacionaži ali višini PVI čaka na en klik v pogledu profila in vnese to vrednost. Klik se lovi kot pri dodajanju lomnih točk; držite {{key:Alt}} za prosto točko; {{key:Esc}} prekliče.
- **Naklon %** je naklon tangente, ki se začne pri tej PVI in teče do naslednje. Če ga vnesete, se spremeni višina **naslednje** PVI (njena stacionaža se nikoli ne premakne). Če je naslednja PVI zaklenjena, se namesto tega premakne višina prejšnje PVI.
- **Zaklenite** PVI z ključavnico na koncu njene vrstice. Zaklenjene PVI ni mogoče povleči, urejanje naklona je ne premakne. Če sta zaklenjena oba konca tangente, njenega naklona ni mogoče spremeniti: vrstica stanja to pove in najprej odklenete en konec. Zaklep je shranjen v datoteki.
- **Odstranite** PVI z x na koncu njene vrstice ali jo izberite (kliknite) in pritisnite {{key:Delete}}. Ko je pogled profila v fokusu, jo odstrani tudi {{key:Backspace}}.

Prva in zadnja PVI nikoli ne dobita krivine.

## Vertikalne krivine

1. Za notranjo PVI vnesite dolžino v **Krivina L**, na primer 200.
2. Krivina je narisana centrirano na PVI. Profil in desno podokno prikazujeta njeno vrsto (vrh ali dno), L in K, stacionaži in višini BVC in EVC ter njeno najvišjo ali najnižjo točko, če je znotraj krivine.

K se izračuna iz L (K = L deljeno z algebrajsko razliko naklonov, v procentih). Vnesete L; neposredno vnašanje K še ni na voljo.

Če vertikalna krivina ne ustreza, rdeče polje pove, zakaj: sega nazaj v PVI ali krivino pred njo ali čez naslednjo PVI, in koliko prostora je na tisti strani (krivina potrebuje polovico svoje dolžine na vsaki strani svoje PVI). Njen gumb nastavi **najdaljšo krivino, ki ustreza**, z njenim K, kot en korak ({{key:Mod+Z}} ga razveljavi). Ali pa razmaknite PVI.

## Preberite podatke

Pod tabelo PVI seznam navaja vsak naklon v procentih („Naklon 1: +1.25%“) in vsako krivino, na primer „Vrh pri 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)“, nato „Najvišja točka 1+62.40, 254.12“.

Če PVI ne segajo do obeh koncev trase, to pove opomba. Koridor se gradi samo tam, kjer se profil in trasa prekrivata.

## Karakteristične črte v profilu

Karakteristične črte se prikažejo tudi v pogledu profila, zato lahko vidite robnik, jarek ali vrh zidu glede na profil ceste.

- Kjer karakteristična črta **seka** traso, profil na tej stacionaži in višini prikaže majhen romb, označen z imenom črte in njeno višino tam (lastna višina črte, izračunana vzdolž odseka, ki seka).
- Vnesite razdaljo v {{ui:Ob njej v razdalji}}, da narišete tudi karakteristične črte, ki **potekajo ob** trasi v tej razdalji, kot črtkane črte na lastnih višinah. Prazno ali 0 prikaže samo preseke.
- Oznake in napisi sledijo vsaki spremembi: premaknite oglišče, vnesite naklon ali dvignite črto, in profil takoj prikaže nove višine.
- Kliknite romb preseka, da izberete to karakteristično črto; izbrana črta je narisana v barvi poudarka.
- {{ui:Karakteristične črte}} v vrstici profila skrije ali prikaže vse. Obe nastavitvi se shranita s projektom.

Glejte [Karakteristične črte](topic:feature-lines).

## Naprej

- [Cestni koridor s potegom](topic:corridor) vzdolž trase in tega profila.
- Profil se zapiše v LandXML skupaj s traso; glejte [Izmenjava LandXML](topic:landxml).
