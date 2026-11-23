---
title: Navrhnite zvislý profil
summary: Otvorte pohľad na profil, začnite projektový profil od terénu, pridávajte a ťahajte PVI, nastavte dĺžky zvislých oblúkov a čítajte sklony, hodnoty K a najvyššie a najnižšie body.
keywords: profil, zvislé vedenie, pvi, zvislý oblúk, sklon, hodnota k, vrchol, údol, bvc, evc, pohľad na profil, konečný spád, fg, profil existujúceho terénu, charakteristické čiary v profile, križovania, premietnuté, obrubník, priekopa, popisky
from: dbb1f32d
---

Každá os trasy má jeden projektový profil: zoznam PVI (staničenie a výška) spojených priamymi sklonmi, s symetrickým parabolickým zvislým oblúkom na každom vnútornom PVI, ktoré má dĺžku. Profil existujúceho terénu sa za vás odoberie z povrchu.

## Otvorenie pohľadu na profil

1. Vyberte os trasy (kliknite na ňu s {{ui:Výber}}).
2. Stlačte {{key:R}}, alebo kliknite na {{ui:Pozdĺžny profil}} na paneli nástrojov, alebo na {{ui:Pohľad na profil}} v spodnej časti pravého panela.
   Pohľad na profil sa otvorí pod pôdorysom s terénom pozdĺž osi trasy. Pri dvoch alebo viacerých osiach trás vyberte jednu v zozname vľavo na lište profilu.

Pohľad sa spustí zobrazením celej osi trasy a natiahnutím výšok na výplň panela; zveličenie je vypísané v ľavom dolnom rohu, napríklad "Zvislé zveličenie 10×".

## Priblíženie a posun profilu

- **Priblíženie:** otáčajte kolieskom myši (alebo štipnite na touchpade) a pohľad sa priblíži k ukazovateľu. Podržte {{key:Shift}} pre priblíženie iba staníc, alebo {{key:Alt}} pre priblíženie iba výšok (to mení zveličenie). Ak je pohľad na profil zameraný, klávesy plus a mínus priblížia od stredu.
- **Posun:** ťahajte pravým alebo stredným tlačidlom myši, alebo potiahnite dvoma prstami na touchpade.
- **Prispôsobiť:** dvojklikom na profil alebo stlačením {{key:F}} znova zobrazíte celú os trasy.

Úprava PVI zachová priblíženie, ktoré ste zvolili; neskočí späť na prispôsobenie.

Pohybujte ukazovateľom pozdĺž profilu: lišta ukazuje staničenie, výšky terénu a návrhu, sklon a výkop alebo násyp v tom mieste a bodka sa pohybuje po osi trasy v pôdoryse.

## Začiatok projektového profilu

1. V pravom paneli v časti **Projektový profil** kliknite na {{ui:Začať z terénu}}.
   Dva PVI sa umiestnia na teréne na oboch koncoch osi trasy, spojené jedným priamym sklonom. Stavový riadok hovorí: "Projektový profil začatý z terénu na oboch koncoch. Zapnite Pridať PVI a klikaním pridajte zlomy sklonu; v tabuľke im zadajte dĺžku zvislého oblúka."

Ak os trasy nepretína povrch, zobrazí sa: "Táto os trasy nemá pod sebou terén, od ktorého by sa dalo začať." Potom pridajte PVI klikaním (ďalšia časť).

## Pridanie PVI

1. Stlačte {{key:I}}, alebo kliknite na {{ui:Pridať PVI}} na lište profilu. Zostane stlačené.
2. Kliknite do profilu tam, kde chcete zlom sklonu. PVI sa pridá na toto staničenie a výšku, zaokrúhlené na 0.01, a označí sa.
3. Pridajte toľko, koľko potrebujete, potom znova stlačte {{key:I}}, aby ste prestali pridávať.

Kliknutie tam, kde už je PVI, sa odmietne ("Na mieste … už je PVI"). PVI sa vždy držia v poradí staníc.

## Prichytávanie pri pridávaní alebo ťahaní

Tlačidlo **Prichytávanie** na lište profilu je na začiatku zapnuté. Keď je zapnuté, PVI, ktoré pridávate alebo ťaháte, sa umiestni na najbližší PVI, bod terénu, staničenie PVI alebo čiaru terénu, a popisok pri značke povie, ktorý. Podržte {{key:Alt}} pre voľný bod kdekoľvek.

## Úprava PVI

- **Ťahajte** PVI v profile, aby ste ho presunuli. Nemôže prejsť svojich susedov. Presun je jeden krok späť.
- **Zadajte** presné hodnoty do tabuľky PVI v pravom paneli: **Staničenie**, **Výška**, **Sklon %** a **Dĺžka oblúka L**. Po každej stlačte {{key:Enter}}.
- **Zvoľte** hodnotu z profilu: malé tlačidlo vedľa staničenia alebo výšky PVI čaká na jedno kliknutie v pohľade na profil a túto hodnotu doplní. Klik sa prichytí ako pri Pridať PVI; podržte {{key:Alt}} pre voľný bod; {{key:Esc}} zruší.
- **Sklon %** je sklon dotyčnice, ktorá začína v tomto PVI a beží k ďalšiemu. Zadaním ho posuniete výšku **ďalšieho** PVI (jeho staničenie sa nikdy nemení). Ak je ďalší PVI uzamknutý, namiesto toho sa posunie výška predchádzajúceho PVI.
- **Uzamknite** PVI visiacim zámkom na konci jeho riadka. Uzamknutý PVI sa neťahá a úprava sklonu ho nepresúva. Ak sú oba konce dotyčnice uzamknuté, jej sklon sa nedá zmeniť: stavový riadok to povie a najprv musíte odomknúť jeden koniec. Zámok sa uloží do súboru.
- **Odstráňte** PVI krížikom na konci jeho riadka, alebo ho vyberte (kliknite na neho) a stlačte {{key:Delete}}. Keď má pohľad na profil zameranie, {{key:Backspace}} ho tiež odstráni.

Prvé a posledné PVI nikdy nedostanú oblúk.

## Zvislé oblúky

1. Zadajte dĺžku do **Dĺžka oblúka L** pre vnútorný PVI, napríklad 200.
2. Oblúk sa nakreslí vycentrovaný na PVI. Profil a pravý panel ukazujú jeho druh (vrchol alebo údol), L a K, staničenia a výšky BVC a EVC a jeho najvyšší alebo najnižší bod, ak ho má vnútri oblúka.

K sa vypočíta z L (K = L delené algebraickým rozdielom sklonov v percentách). Zadávate L; priame zadanie K zatiaľ nie je k dispozícii.

Ak zvislý oblúk nevyjde, červené pole to vysvetlí: zasahuje späť do PVI alebo oblúka pred ním, alebo za ďalší PVI, a uvedie, koľko je miesta na tej strane (oblúk potrebuje polovicu svojej dĺžky na každej strane svojho PVI). Jeho tlačidlo nastaví **najdlhší oblúk, ktorý sa vojde**, s jeho K, ako jeden krok ({{key:Mod+Z}} to vráti). Alebo PVI od seba oddiaľte.

## Čítanie údajov

Pod tabuľkou PVI zoznam uvádza každý sklon v percentách ("Sklon 1: +1.25 %") a každý oblúk, napríklad "Vrchol pri 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", potom "Najvyšší bod 1+62.40, 254.12".

Ak PVI nedosahujú na oba konce osi trasy, poznámka to povie. Koridor sa vytvorí iba tam, kde sa profil a os trasy prekrývajú.

## Charakteristické čiary v profile

Charakteristické čiary sa zobrazujú aj v pohľade na profil, takže vidíte obrubník, priekopu alebo hornú hranu múra oproti profilu cesty.

- Kde charakteristická čiara **križuje** os trasy, profil ukáže malý kosoštvorec na tomto staničení a výške, označený názvom čiary a jej výškou tam (vlastnou výškou čiary, vypočítanou pozdĺž úseku, ktorý križuje).
- Zadajte vzdialenosť do {{ui:Popri v rozsahu}}, aby sa zobrazili aj charakteristické čiary, ktoré **vedú popri** osi trasy v tejto vzdialenosti, ako prerušované čiary v ich vlastných výškach. Prázdne alebo 0 ukazuje iba križovania.
- Značky a popisky sledujú každú zmenu: posuniete vrchol, zadáte sklon alebo zdvihnete čiaru a profil ukáže nové výšky hneď.
- Kliknutím na kosoštvorec križovania vyberte charakteristickú čiaru; vybraná čiara sa kreslí zvýrazňujúcou farbou.
- {{ui:Charakteristické čiary}} na lište profilu skryje alebo zobrazí všetky. Obe nastavenia sa uložia s projektom.

Pozri [Charakteristické čiary](topic:feature-lines).

## Ďalšie

- [Cestný koridor ťahaním po dráhe](topic:corridor) pozdĺž osi trasy a tohto profilu.
- Profil sa zapisuje do LandXML spolu s osou trasy; pozri [Výmena LandXML](topic:landxml).
