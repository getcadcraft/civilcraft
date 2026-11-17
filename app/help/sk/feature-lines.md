---
title: Charakteristické čiary
summary: Kreslite 3D čiary, ktorým nastavujete sklon bod po bode, vytvárajte z nich schodovité odsadenia a používajte ich ako hrany zlomu terénu alebo ako svahované plošiny v návrhu.
keywords: oblúk, krivka, polomer, 3D oblúk, špirála, zakrivený obrubník, prekryv sklonu, prekryv výšok, šípky sklonu, charakteristická čiara, sklon, výška, schodovité odsadenie, odsadenie, hrana zlomu, obrubník, priekopa, banket, svahovaná plošina, zarezanie, terénne úpravy, 3D lomená čiara
from: d55b25fb
---

Charakteristická čiara je čiara s výškou v každom vrchole: obrubník, prúdnica priekopy, hrana banketu, hrana svahovanej plošiny. Výšky nastavujete číslom alebo sklonom, kopírujete ju do strany so stúpaním alebo klesaním a volíte, čo s ňou povrchy robia.

## Nakreslenie

1. Vyberte **Povrch** › {{ui:Viac}} › {{ui:Charakteristická čiara}}, alebo stlačte {{key:L}}.
2. Kliknite na jej vrcholy v pôdoryse. Kliknutie na zamerený bod prevezme jeho polohu a výšku; inde vrchol prevezme výšku jestvujúceho terénu na tom mieste.
3. Stlačte {{key:Enter}}, aby ste dokončili otvorenú čiaru, alebo kliknite znova na prvý vrchol, aby sa čiara uzavrela.

Nová čiara je vybraná a začína ako hrana zlomu jestvujúceho terénu, ležiaca na teréne.

## Oblúky

Úsek môže byť v pôdoryse oblúk, ktorého konce sú v rôznych výškach: zaoblenie obrubníka, zakrivená priekopa, rampa, ktorá sa stáča. Jej sklon ide rovnomerne po oblúku a jeho dĺžka sa meria po krivke.

- **Pri kreslení:** stlačte {{key:C}} (na dotykovej obrazovke {{ui:Oblúk}} na paneli nad pôdorysom), aby sa oblúky zapli. Po vrchole kliknite na bod na krivke, potom kliknite na miesto, kde oblúk končí. Stlačením {{key:C}} znova prejdete na rovné úseky. {{key:Backspace}} najprv zruší bod na krivke.
- **Potom:** v **Vlastnostiach** zadajte polomer a smer otáčania do poľa **Oblúk** vrcholu, napríklad `50 L` alebo `50 R` (vľavo alebo vpravo, keď kráčate po čiare), a stlačte {{key:Enter}}. Vyprázdnením poľa úsek znova narovnáte. Polomer menší ako polovica úseku sa odmietne.

Vybraná čiara zobrazuje polomer každého oblúka vedľa jeho sklonu. **Dĺžka** je pozdĺž oblúkov v pôdoryse; **3D dĺžka** počíta aj stúpanie a klesanie. Schodovité odsadenia zachovávajú oblúky: oblúk na vonkajšej strane zákruty sa zväčšuje, na vnútornej sa zmenšuje, a odsadenie za stredom oblúka sa odmietne.

Povrchy, 3D pohľad, DXF a DWG berú každý oblúk ako krátke rovné kúsky, ktoré zostávajú do 0.01 od krivky. LandXML ich uchováva ako oblúky (pozri **Oblúky v iných súboroch** nižšie).

## Nastavenie výšok a sklonov

**Vlastnosti** uvádzajú vrcholy s ich vzdialenosťou pozdĺž čiary, ich **Výšku** a **Sklon k ďalšiemu** (v percentách). Zadajte jedno z nich a stlačte {{key:Enter}}:

- Výška pohne len týmto vrcholom.
- Sklon nastaví výšku na vzdialenom konci jeho úseku; vrcholy za ním zostanú, kde sú, takže sa zmení sklon ďalšieho úseku.

Tiež vo **Vlastnostiach**:

| Akcia | Čo robí |
|---|---|
| **Zdvihnúť alebo znížiť všetky o** | Pripočíta výšku, ktorú zadáte, ku každému vrcholu. |
| {{ui:Výšky z terénu}} | Vráti každý vrchol na jestvujúci terén (vrcholy mimo povrchu si ponechajú svoju výšku a sú vypísané). |
| {{ui:Jeden sklon, od prvého po posledný}} | Ponechá prvú a poslednú výšku a vrcholy medzi nimi dá na jeden rovnomerný sklon. |

Vybraná čiara v pôdoryse ukazuje výšky vo vrcholoch a sklony pozdĺž úsekov. Ak chcete vrchol presunúť, potiahnite ho nástrojom {{ui:Výber}}; jeho výška ostane.

## Schodovité odsadenia

V časti **Schodovité odsadenie** zadajte **Vzdialenosť** (kladná napravo od smeru čiary, záporná naľavo), potom výšku (nahor alebo nadol o) alebo sklon v percentách, a kliknite na {{ui:Vytvoriť odsadenú čiaru}}. Kópia je nová charakteristická čiara: napríklad zadná strana obrubníka 0.5 ft bokom a o 0.5 ft vyššie, alebo hrana priekopy 6 ft von so sklonom 2 %. Vzdialenosť, ktorá by kópiu preložila cez seba pri ostrej zákrute, sa odmietne.

## Sklony a výšky na obrazovke

Stlačte {{key:E}} alebo zaškrtnite **Sklony a výšky charakteristických čiar** v časti Zobrazenie, aby ste videli sklon každej charakteristickej čiary pozdĺž každého úseku (s malou šípkou smerujúcou nadol) a jej výšku vo vrcholoch. Zobrazujú sa len na obrazovke: nič sa nepridá do výkresu a PDF, DXF a DWG zostanú nezmenené. Krátke úseky a husté vrcholy zostanú bez popisu, kým nepriblížite. Vybraná čiara vždy zobrazuje svoje vlastné sklony a výšky.

## V pohľade na profil

Charakteristická čiara, ktorá križuje os trasy, sa zobrazí v pohľade na profil tejto trasy, s názvom a výškou v križovatke; čiary, ktoré bežia vedľa nej, sa môžu zobraziť tiež. Pozri [Návrh pozdĺžneho profilu](topic:profile).

## Čo s ňou povrchy robia

Zvoľte **Použitie**:

| Použitie | Čo sa stane |
|---|---|
| Hrana zlomu jestvujúceho terénu | Jestvujúci terén prechádza čiarou vo svojich výškach, ako nakreslená hrana zlomu. |
| Upravené do návrhu | **Uzavretá** čiara sa stane svahovanou plošinou: navrhovaný povrch vnútri nej sa upraví k jej hrane. Zapnite **Zarezanie do terénu**, aby zárezové a násypové svahy (vodorovne k 1 zvislo) viedli od jej hrany k terénu, ako to robí plošina; každý svah začína vo vlastnej výške hrany. |
| Len nakreslené | Ostane v pôdoryse a ide von do DXF, DWG a PDF (hladina C-GRAD-FEAT, 3D lomené čiary), ale povrchy ju ignorujú. |

Objemy, rezy a 3D pohľad zahŕňajú charakteristické čiary upravené do návrhu, rovnako ako plošiny. Každá zmena je jeden krok: {{key:Mod+Z}} ju vráti späť.

## Zdieľanie čiar s tímom

V výkrese otvorenom z vašich cloudových súborov v CadCraft Studio, v tímovom pláne, má vlastnosti projektu (keď nič nie je vybrané) sekciu **Tím** s {{ui:Čiary tímu…}}: čiary, ktoré tím zdieľa, každá s revíziou, bez toho, aby ste najprv vybrali charakteristickú čiaru. Vyberte čiaru, aby ste ju zdieľali, nahrali novú revíziu, stiahli tímovú revíziu alebo zrušili zdieľanie. Mimo tohto nastavenia sekcia uvádza, čo potrebuje.

## Oblúky v iných súboroch

| Súbor | Čo sa stane s charakteristickou čiarou s oblúkmi |
|---|---|
| Projekt CivilCraft | Zachová sa presne. |
| LandXML | Zapíše sa ako prvok pôdorysu s čiarami a oblúkmi a ich výškami a načíta sa späť s oblúkmi. Charakteristická čiara z iného programu sa načíta ako **Len nakreslená**: zvoľte jej **Použitie**, aby sa dostala do povrchu. |
| DWG a DXF | 3D lomená čiara nemôže obsahovať oblúk, takže sa čiara zapíše ako krátke kúsky do 0.01 od každého oblúka. CivilCraft tiež poznačí do výkresu, ktoré kúsky boli oblúky: keď otvoríte výkres ako čiary, {{ui:Charakteristické čiary}} vráti čiary späť ako charakteristické čiary s ich oblúkmi. Ostatné programy vidia obyčajnú 3D lomenú čiaru. |
