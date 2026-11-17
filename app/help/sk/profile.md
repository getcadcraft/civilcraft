---
title: Návrh pozdĺžneho profilu
summary: Otvorte pohľad na profil, začnite návrhový profil od terénu, pridávajte a ťahajte PVI, nastavujte dĺžky zvislých oblúkov a čítajte sklony, hodnoty K a najvyššie a najnižšie body.
keywords: profil, pozdĺžny profil, pvi, zvislý oblúk, sklon, hodnota K, hrebeň, prepad, bvc, evc, pohľad na profil, konečný terén, fg, profil existujúceho terénu, charakteristické čiary v profile, križovania, premietnuté, obrubník, priekopa, popisky
from: e9182bfa
---

Každá os trasy má jeden návrhový profil: zoznam PVI (staničenie a výška) spojených priamymi sklonmi, so symetrickým parabolickým zvislým oblúkom v každom vnútornom PVI, ktoré má dĺžku. Profil existujúceho terénu sa za vás odoberie z povrchu.

## Otvorenie pohľadu na profil

1. Vyberte os trasy (kliknite na ňu nástrojom {{ui:Výber}}).
2. Stlačte {{key:R}}, alebo kliknite na {{ui:Pozdĺžny profil}} na paneli nástrojov, alebo na {{ui:Pohľad na profil}} v dolnej časti pravého panela.
   Pohľad na profil sa otvorí pod pôdorysom s existujúcim terénom pozdĺž osi trasy. Pri dvoch alebo viacerých osiach vyberte jednu v zozname na ľavej strane lišty profilu.

Pohľad vždy zobrazuje celú os trasy a roztiahne výšky tak, aby vyplnili panel; zveličenie sa vypíše v ľavom dolnom rohu, napríklad "Zveličenie vo zvislom smere 10×". Nedá sa v ňom zväčšovať ani posúvať.

Pohybujte kurzorom pozdĺž profilu: lišta zobrazí staničenie, výšky terénu a návrhu, sklon a výkop alebo násyp v danom mieste a bodka sa v pôdoryse pohybuje po osi trasy.

## Začiatok návrhového profilu

1. V pravom paneli v časti **Návrhový profil** kliknite na {{ui:Začať z terénu}}.
   Dva PVI sa umiestnia na terén na oba konce osi trasy a spoja sa jedným priamym sklonom. Stavový riadok hlási: "Návrhový profil začatý od terénu na oboch koncoch. Zapnite Pridať PVI a kliknutím pridajte zlomy sklonu; v tabuľke im priraďte dĺžku oblúka."

Ak os trasy nekríži povrch, zobrazí sa: "Táto os trasy nemá pod sebou terén, od ktorého by sa dalo začať." Potom pridajte PVI kliknutím (ďalšia časť).

## Pridanie PVI

1. Stlačte {{key:I}} alebo kliknite na {{ui:Pridať PVI}} na lište profilu. Tlačidlo ostane stlačené.
2. Kliknite v profile tam, kde chcete zlom sklonu. PVI sa pridá v tomto staničení a výške, zaokrúhlené na 0.01, a vyberie sa.
3. Pridajte toľko, koľko potrebujete, a potom znova stlačte {{key:I}}, aby ste pridávanie ukončili.

Kliknutie tam, kde už PVI je, sa odmietne ("Na mieste … už je PVI."). PVI vždy zostávajú v poradí staničení.

## Úprava PVI

- **Ťahajte** PVI v profile, aby ste ho presunuli. Nemôže prejsť cez svojich susedov. Presun je jeden krok späť.
- **Zadajte** presné hodnoty do tabuľky PVI v pravom paneli: **Staničenie**, **Výška** a **Oblúk L** (dĺžka zvislého oblúka). Po každej stlačte {{key:Enter}}.
- **Odstráňte** PVI tlačidlom x na konci jeho riadku alebo ho vyberte (kliknite naň) a stlačte {{key:Delete}}. Keď má pohľad na profil zameranie, {{key:Backspace}} ho tiež odstráni.

Prvé a posledné PVI nikdy nedostanú oblúk.

## Zvislé oblúky

1. Zadajte dĺžku do **Oblúk L** pre vnútorné PVI, napríklad 200.
2. Oblúk sa nakreslí so stredom na PVI. Profil a pravý panel zobrazia jeho druh (hrebeň alebo prepad), L a K, staničenia a výšky BVC a EVC a jeho najvyšší alebo najnižší bod, ak sa v oblúku nachádza.

K sa vypočíta z L (K = L delené algebraickým rozdielom sklonov v percentách). Zadávate L; zadávanie K priamo zatiaľ nie je k dispozícii.

Ak zvislý oblúk nevyhovuje, červený rámik vysvetlí prečo: zasahuje späť do predchádzajúceho PVI alebo oblúka, alebo za ďalšie PVI, a aké je na tej strane miesto (oblúk potrebuje polovicu svojej dĺžky na každú stranu svojho PVI). Jeho tlačidlo nastaví **najdlhší oblúk, ktorý sa zmestí**, spolu s jeho K, ako jeden krok ({{key:Mod+Z}} to vráti späť). Alebo PVI od seba oddiaľte.

## Čítanie údajov

Pod tabuľkou PVI zoznam uvádza každý sklon v percentách ("Sklon 1: +1.25%") a každý oblúk, napríklad "Hrebeň pri 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", potom "Najvyšší bod 1+62.40, 254.12".

Ak PVI nedosahujú na oba konce osi trasy, poznámka to uvedie. Koridor sa vytvorí len tam, kde sa profil a os trasy prekrývajú.

## Charakteristické čiary v profile

Charakteristické čiary sa zobrazujú aj v pohľade na profil, takže vidíte obrubník, priekopu alebo hranu múra oproti profilu cesty.

- Kde charakteristická čiara **križuje** os trasy, profil zobrazí malý kosoštvorec v tomto staničení a výške, s popiskom názvu čiary a jej výšky v tom mieste (vlastná výška čiary, vypočítaná pozdĺž úseku, ktorý križuje).
- Zadajte vzdialenosť do {{ui:Popri v rozsahu}}, aby sa nakreslili aj charakteristické čiary, ktoré **idú popri** osi trasy v tejto vzdialenosti, ako prerušované čiary vo svojich výškach. Prázdne pole alebo 0 zobrazí len križovania.
- Značky a popisky sledujú každú zmenu: keď presuniete vrchol, zadáte sklon alebo zdvihnete čiaru, profil ihneď zobrazí nové výšky.
- Kliknutím na kosoštvorec križovania vyberiete danú charakteristickú čiaru; vybraná čiara sa kreslí zvýraznenou farbou.
- {{ui:Charakteristické čiary}} na lište profilu všetky skryje alebo zobrazí. Obe nastavenia sa uložia spolu s projektom.

Pozrite [Charakteristické čiary](topic:feature-lines).

## Ďalej

- [Vytvorte koridor cesty](topic:corridor) pozdĺž osi trasy a tohto profilu.
- Profil sa zapisuje do LandXML spolu s osou trasy; pozrite [Výmena LandXML](topic:landxml).
