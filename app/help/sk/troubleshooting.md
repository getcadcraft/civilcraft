---
title: Riešenie problémov
summary: Príznaky, príčiny a riešenia problémov, s ktorými sa ľudia stretnú v CivilCraft, s presnými hláseniami, ktoré aplikácia zobrazuje.
keywords: problémy, chyby, nefunguje, oprava, pomocník, hlásenia, riešenie problémov, odmietnuté, chýbajúce, nesprávne, zamenené, vrstevnice chýbajú
from: a9f7dedc
---

Hlásenia sa zobrazujú v stavovom riadku v pravom dolnom rohu, v boxoch v ľavom a pravom paneli a v dialógoch. Sú tu citované tak, ako ich aplikácia zobrazuje.

## Otváranie súborov

**"Tento súbor má viac ako 200 MB; CivilCraft zatiaľ neotvára také veľké súbory."**
Rozdeľte súbor s bodmi alebo pred otvorením zredukujte údaje.

**"Nepodarilo sa otvoriť site.json: Toto nie je súbor projektu CivilCraft."**
Súbor končí na `.json` alebo začína znakom `{`, ale nie je projektom CivilCraft. Súbory bodov nesmú začínať znakom `{`.

**"Nepodarilo sa otvoriť … Tento súbor projektu je z novšieho CivilCraft (verzia 2)."**
Projekt uložilo novšie zostavenie. Otvorte ho tam, alebo z neho exportujte LandXML.

**"Nepodarilo sa otvoriť … Toto je XML, ale nie LandXML (jeho koreňový prvok je <…>)."**
Súbor je iný druh XML. Exportujte LandXML z iného programu.

**"… neobsahuje body, povrchy TIN ani osi trás, ktoré CivilCraft dokáže prečítať."**
Všetko v súbore je niečo, čo CivilCraft preskakuje (napríklad len mriežkové povrchy alebo len špirálové osi trás). Zvyšok hlásenia hovorí, čo tam bolo. Pozri [LandXML: čo sa číta a zapisuje](topic:landxml-reference).

**"Vzorku sa nepodarilo načítať: …"**
{{ui:Otvoriť ukážkovú lokalitu}} načíta súbor z webu CadCraft. Bez pripojenia funguje len vtedy, ak bol CivilCraft uložený na offline použitie (tlačidlo v hlavnom paneli zobrazuje {{ui:Pripravené offline}}). Pripojte sa na internet, kliknite na {{ui:Uložiť na offline použitie}} a odvtedy funguje aj offline. Pozri [Offline](common:offline).

**{{ui:Uložiť na offline použitie}} zobrazuje {{ui:Nepodarilo sa uložiť}}.**
Niektoré súbory sa nestiahli. Skontrolujte pripojenie a kliknite na tlačidlo znova.

**{{ui:Uložiť na offline použitie}} zobrazuje {{ui:Offline nie je k dispozícii}}.**
Toto okno prehliadača nedokáže uchovať offline kópiu, zvyčajne preto, že ide o súkromné okno alebo je počítač spravovaný. Otvorte CivilCraft v bežnom okne.

**Offline sa aplikácia vôbec neotvorí.**
V tomto prehliadači nebola uložená na offline použitie, alebo prehliadač vymazal jej údaje stránky (Safari to robí pri stránkach, ktoré sa niekoľko týždňov nenavštívili). Pripojte sa na internet, otvorte CivilCraft a kliknite na {{ui:Uložiť na offline použitie}}.

**Offline kópia je staršie zostavenie.**
Kliknite na {{ui:Pripravené offline}} a potom na {{ui:Uložiť znova (získať najnovšiu verziu)}} počas pripojenia na internet.

**Súbor je v okne otvorenia sivý.**
Okno zobrazuje len súbory bodov, LandXML a súbory projektov podľa ich prípon. Presuňte súbor na plán, alebo ho premenujte na `.txt`.

## Import bodov

**"Z tohto súboru sa nepodarilo načítať žiadne body."**
Ručne vyberte poradie stĺpcov v časti **Stĺpce**. Ak nič nefunguje, otvorte súbor v textovom editore a skontrolujte, že je na každom riadku jeden bod a sú v ňom čísla.

**Lokalita vyzerá zrkadlovo, otočene alebo natiahnuto do čiary.**
Súradnice Y a X sú zamenené. Zhrnutie hlásilo "odhadnuté podľa počtu stĺpcov". Vyberte PENZD namiesto PNEZD (alebo naopak) v **Stĺpce**, alebo importujte znova.

**Body ďaleko od ostatných a plán priblížený na bodku.**
Riadok má preklep v súradnici, alebo súbor mieša súradnicové systémy. Nájdite bod (kliknutím naň zobrazíte jeho číslo) a opravte súbor.

**Riadky uvedené pod "Rows not read".**
Pozri tabuľku v [Import bodov](topic:import-points#rows-that-are-not-read).

**Moje staré body zmizli.**
Import súboru bodov nahradí všetky body a vymaže krok späť. Otvorte uložený projekt, aby ste ich získali späť.

## Povrch

**"Povrch: Nie je vytvorený" s červeným boxom.**
Box uvádza dôvod: "A surface needs at least three points with elevations.", "The points are all on one line: no triangles.", "No points with elevations.", "The boundary does not overlap the points." alebo "No triangles are left inside the boundary." Skontrolujte poradie stĺpcov, skupiny bodov (nie sú {{ui:Vynechané}}?) a hranicu.

**Vrstevnice presekávajú priekopu alebo hrebeň priamo.**
Táto čiara nie je hrana zlomu. Nastavte jej skupinu na {{ui:Hrana zlomu}}, alebo ju nakreslite nástrojom {{ui:Hrana zlomu}}. Pozri [Vytvorenie a spresnenie povrchu](topic:build-surface).

**Skupina hrany zlomu kreslí zig-zag.**
Skupina obsahuje viac než jednu čiaru, alebo jej body nie sú očíslované pozdĺž čiary. Nastavte skupinu späť na {{ui:Body}} a každú čiaru nakreslite nástrojom {{ui:Hrana zlomu}}.

**Dlhé tenké trojuholníky pozdĺž vonkajšku.**
Nakreslite hranicu ({{key:O}}), alebo nastavte **Najdlhšia vonkajšia hrana**.

**Žiadne vrstevnice, hoci je povrch vytvorený.**
Buď je {{ui:Vrstevnice}} vypnuté v časti **Zobrazenie**, alebo je interval taký malý, že by bolo viac ako 2 000 úrovní vrstevníc. Zvoľte väčší interval.

**Hrany zlomu alebo hranica nič nemenia.**
Povrch pochádza z LandXML ("Surface (from LandXML)"). Používa sa tak, ako je. Kliknite na {{ui:Znova vytvoriť povrch z bodov}}, aby sa namiesto toho vytvoril z bodov.

**"Povrch zatiaľ neexistuje: najskôr otvorte body."**
Hrana zlomu, hranica a plošina potrebujú existujúci povrch terénu. Najskôr importujte body.

**"Kliknite na bod s výškou: hrana zlomu preberá výšky bodov."**
Nástroj {{ui:Hrana zlomu}} vyberá len body. Priblížte a kliknite na bod (oranžový štvorec ukazuje, ktorý sa prevezme).

## Kreslenie

**Môj posledný bod zmizol po dvojitom kliknutí na dokončenie.**
V tejto verzii dvojité kliknutie dokončí os trasy, plošinu, hranu zlomu alebo hranicu, ale zahodí bod, na ktorý sa dvakrát kliklo. Raz kliknite na posledný bod a stlačte {{key:Enter}}. Ak sa to už stalo, použite {{key:Mod+Z}} a nakreslite znova.

**Kresbu na tablete nemôžem dokončiť.**
Dokončenie vyžaduje {{key:Enter}}; zatiaľ nie je tlačidlo na obrazovke. Pripojte klávesnicu. Pozri [Myš, touchpad a dotyk](topic:keyboard#mouse-trackpad-and-touch).

**Ťahanie na umiestnenie bodu namiesto toho posúva plán.**
Ťah väčší ako niekoľko pixelov posúva plán vo všetkých nástrojoch. Kliknite bez pohybu.

**"Os trasy potrebuje aspoň dva body." / "Plošina potrebuje aspoň tri rohy." / "Úsek potrubia potrebuje aspoň dva objekty."**
Stlačili ste {{key:Enter}} príliš skoro. Kresba sa zahodí; začnite znova.

**Klávesy ako A alebo G nerobia nič.**
Textové pole alebo zoznam v paneli má stále fokus, takže písmená idú do neho. Raz kliknite na plán a potom stlačte klávesu. Na Macu zodpovedá kláves delete v prehliadači klávesu Backspace: na zmazanie výberu použite Fn a Delete.

## Osi trás a profily

**"Oblúky v PI 2 a PI 3 sa prekrývajú: … Použite menšie polomery."**
Dva oblúky potrebujú viac dotyčnice, než je medzi ich PI. Znížte jeden alebo oba polomery v tabuľke PI, alebo oddeľte PI od seba.

**"PI 3 sa otáča priamo späť; nemôže mať oblúk."**
Os trasy sa v tomto PI vracia sama na seba. Presuňte alebo odstráňte PI.

**"Táto os trasy nemá pod sebou terén, z ktorého by mohla začať."**
Os trasy je mimo povrchu. Presuňte ju na povrch, alebo pridajte PVI kliknutím pri zapnutom {{ui:Pridať PVI}}.

**"Vertikálny oblúk v PVI 3 (L = …) sa začína skôr, než skončí oblúk alebo PVI pred ním." / "… prechádza za ďalší PVI."**
Skráťte dĺžku oblúka alebo oddeľte PVI od seba.

**"Na … už existuje PVI"**
Na tomto staničení PVI existuje. Kliknite inde, alebo presuňte existujúce.

**Zobrazenie profilu je prázdne: "Draw an alignment to see its profile."**
Žiadna os trasy nie je, alebo vybraná má chyby.

## Koridory a plošiny

**"Koridor potrebuje návrhový profil bez chýb."**
Začnite návrhový profil ({{ui:Začať z terénu}}) a opravte prekrytia oblúkov.

**"… bočné sklony bežia mimo povrchu, skôr než narazia na terén." / "… čiary sklonov bežia mimo povrchu, skôr než ho dosiahnu …"**
Úprava terénu dosiahne okraj povrchu skôr, než narazí na terén. Presuňte návrh od okraja dovnútra, alebo ho priblížte k terénu. Nová plošina nakreslená čiastočne mimo povrchu môže začať na výške 0: zadajte skutočnú výšku.

**"Čiary odkrytia koridoru sa križujú …" / "Čiara odkrytia sa pretína sama so sebou …"**
Sklony z rôznych strán sa stretávajú: tesné oblúky, úzke plošiny, hlboké zárezy alebo vysoké násypy. Použite väčší polomer, užšiu zostavu, širšiu plošinu alebo strmšie sklony.

**"Zatiaľ žiadne objemy: plošina sa musí upraviť bez problémov."**
Opravte problémy uvedené v červenom boxe nad ním.

**{{ui:Navrhovaný (upravený)}} je neaktívne.**
Zatiaľ žiadna plošina ani koridor nie je upravený.

## Potrubia

**"P2 zatiaľ nemá dná."**
Kliknite na {{ui:Nastaviť jeho dná podľa pravidiel}}, alebo zadajte dná.

**"P1: pri S1 nie je terén, z ktorého by sa začalo."**
Horný objekt je mimo povrchu a nemá okraj poklopu. Zadajte pre neho okraj poklopu.

**Každé potrubie je označené po presunutí objektu.**
Presun objektu nemení dná. Kliknite na {{ui:Nastaviť všetky dná podľa pravidiel}}.

Všetky hlásenia siete sú vysvetlené v [Návrh gravitačnej siete potrubí](topic:pipe-network#read-and-fix-problems).

## Ukladanie a export

**"Zatiaľ nič na export." / "Zatiaľ nič na vykreslenie."**
Projekt je prázdny. Najskôr importujte body.

**Uložený súbor nemôžem nájsť.**
Je v sťahovaní prehliadača (zvyčajne v priečinku Stiahnuté). Pozri [Súbory, ktoré môžete otvoriť, uložiť a exportovať](topic:files#where-the-files-go).

**Mierka PDF na papieri je nesprávna.**
Tlačte pri 100 % alebo v skutočnej veľkosti, nie "prispôsobiť na stránku".

**Otázniky v texte PDF.**
Názvy alebo popisy používajú znaky mimo západoeurópskej sady. Stavový riadok ich spočíta. Premenujte ich jednoduchými znakmi.

**Vykreslenie je orezané na okrajoch.**
Mierka je pre list príliš veľká. Zvoľte mierku označenú "(vojde sa)", väčší list, alebo {{ui:Čo je na obrazovke}}.

**{{key:Mod+P}} otvorilo tlačový dialóg prehliadača.**
Stránka nemala fokus. Zavrite dialóg, kliknite na plán a znova stlačte {{key:Mod+P}}, alebo kliknite na {{ui:PDF}}.

## Samotná aplikácia

**Obrazovka je prázdna alebo panel nástrojov nič nerobí.**
Použite aktuálnu verziu prehliadača Chrome, Edge, Firefox alebo Safari a stránku znova načítajte. Pozri [Prehliadače](common:browsers).

**Aplikácia je pomalá pri veľkom súbore bodov.**
Vypnite {{ui:Trojuholníky}}, {{ui:Popisky bodov}} a {{ui:Pásma výšok}} a zvoľte väčší interval vrstevníc. Veľmi veľké povrchy sa po každej zmene chvíľu prebudovávajú.

**Prehliadač sa pýta "Opustiť stránku?"**
Projekt obsahuje neuložené zmeny. Zostaňte na stránke, uložte pomocou {{key:Mod+S}} a potom ju opustite.
