---
title: Vytvorenie a spresnenie povrchu
summary: Ako CivilCraft trianguluje jestvujúci terén a ako ho tvarovať skupinami hrán zlomu, nakreslenými hranami zlomu, vonkajšou hranicou a najdlhšou vonkajšou hranou.
keywords: tin, povrch, triangulácia, hrana zlomu, hranica, jestvujúci terén, jt, vytvoriť povrch, delaunay, trojuholníky, najväčšia hrana, vonkajšia hranica
from: b9eea3f3
---

CivilCraft má jeden jestvujúci povrch terénu na projekt. Je to TIN (triangulovaná nepravidelná sieť) postavená z vašich bodov a pri každej zmene vstupu sa sama prebuduje. Neexistuje príkaz „prebudovať“ ani zastaraný povrch.

## Čo vstupuje do povrchu

- Každý bod s výškou v skupine nastavenej na {{ui:Body}}.
- Každá skupina nastavená na {{ui:Hrana zlomu}}, spojená v poradí čísel bodov.
- Každá hrana zlomu, ktorú nakreslíte nástrojom {{ui:Hrana zlomu}}.
- Vonkajšia hranica, ak ju nakreslíte.
- Nastavenie **Najdlhšia vonkajšia hrana**.

Trojuholníky nikdy neprechádzajú cez hranu zlomu: povrch je k nej vynútený a potom čo najrovnomernejšie rozložený okolo nej (inde Delaunay).

## Zmena kódovaných čiar na hrany zlomu

1. V ľavom paneli pod **Body** nájdite skupinu (napríklad FL).
2. Nastavte jej voľbu **Povrch** na {{ui:Hrana zlomu}}.
   Povrch sa prebuduje, čiara sa vykreslí oranžovo (keď máte zapnuté {{ui:Hrany zlomu}} pod **Zobrazenie**) a **Hrany zlomu** v údajoch povrchu sa zvýši o jeden.
3. Skontrolujte čiaru v pôdoryse. Musí prechádzať bod po bode v poradí, v akom bola zameraná. Ak je klikatá, skupina obsahuje viac čiar alebo body nie sú očíslované v poradí: nastavte skupinu späť na {{ui:Body}} a nakreslite čiary ručne (ďalšia časť).

## Nakreslenie hrany zlomu cez body

1. Stlačte {{key:B}}, alebo kliknite na {{ui:Hrana zlomu}} v skupine **Povrch**.
   Nápoveda hovorí "Hrana zlomu: klikajte na geodetické body v poradí (prevezme ich výšky). Enter dokončí."
2. Presuňte ukazovateľ blízko bodu. Malý oranžový štvorček označí bod, ktorý sa prevezme.
3. Klikajte na body čiary jeden za druhým. Každé kliknutie pomenuje bod a jeho výšku v stavovom riadku.
4. Stlačte {{key:Enter}} na dokončenie.
   Stavový riadok hovorí "Hrana zlomu 1 pridaná; povrch bol prebudovaný."

Kliknutia musia dopadnúť na geodetický bod s výškou; kliknutie inde sa odmietne s hlásením "Kliknite na geodetický bod s výškou: hrana zlomu prevezme výšky bodov." {{key:Backspace}} odstráni posledný bod; {{key:Esc}} zruší celú čiaru.

:::warning
Dokončite stlačením {{key:Enter}}. Dvojklik tiež dokončí, ale v tejto verzii odstráni bod, na ktorý ste dvakrát klikli. Raz kliknite na posledný bod a potom stlačte {{key:Enter}}.
:::

Ak chcete odstrániť naraz všetky nakreslené hrany zlomu, kliknite na {{ui:Odstrániť nakreslené hrany zlomu}} v časti **Povrch**. Ak chcete odstrániť iba poslednú, použite {{key:Mod+Z}}. Nakreslené hrany zlomu zatiaľ nie je možné označiť ani upraviť jednotlivo.

## Nakreslenie vonkajšej hranice

Hranica orezáva povrch na oblasť, ktorej dôverujete, napríklad na hranice zamerania, aby zmizli dlhé trojuholníky cez nezamerané rohy.

1. Stlačte {{key:O}}, alebo kliknite na {{ui:Hranica}}.
2. Klikajte na rohy v poradí okolo oblasti. Čiarkovaná čiara ukazuje tvar.
3. Stlačte {{key:Enter}}.
   Stavový riadok hovorí "Hranica nastavená; trojuholníky mimo nej sú odstránené." **Hranica** v údajoch povrchu hovorí "Áno" a počet rohov.

Treba vedieť:

- Je len jedna hranica. Nakreslenie ďalšej nahradí predchádzajúcu. {{ui:Odstrániť hranicu}} ju odstráni.
- Môže iba uberať: hranica, ktorá siaha za body, sa orezá na ich obrys, s hlásením "Hranica siaha za body; bola orezaná na ich obrys."
- Jej rohy preberajú výšky z povrchu, takže okraj presne sleduje terén.
- Skryté (vnútorné) hranice zatiaľ nie sú dostupné.

## Orezanie dlhých vonkajších trojuholníkov

Bez hranice povrch vyplní celý obrys bodov, vrátane dlhých úzkych trojuholníkov cez konkávne hrany.

1. V **Povrch** zadajte dĺžku do **Najdlhšia vonkajšia hrana** a stlačte {{key:Enter}}. Začnite zhruba dvoj- až trojnásobkom obvyklej vzdialenosti zameraných bodov.
2. Vonkajšie trojuholníky, ktorých vonkajšia hrana je dlhšia, sa odstránia a postupuje sa dovnútra, kým každá vonkajšia hrana nie je dostatočne krátka. Hrana, ktorá je hranou zlomu, sa nikdy neodstráni.
3. Zadajte 0, aby sa všetky trojuholníky znova zachovali.

## Čítanie správy o povrchu

Pod údajmi o povrchu pole vypisuje, čo stavebný nástroj urobil. S okrovým pruhom vľavo je to informácia; s červeným pruhom obsahuje chybu a žiadny povrch nie je.

| Správa | Význam |
|---|---|
| "3 bodov bolo na rovnakom mieste ako iný a pripojilo sa k nemu." | Body bližšie ako 0.0001 v pôdoryse sa stali jedným vrcholom (prvý sa zachová). |
| "2 miesta majú dve rôzne výšky …" | Body jeden na druhom alebo križujúce sa hrany zlomu sa nezhodujú vo výške. Výška hrany zlomu vyhrá, potom prvá. |
| "1 časť hrany zlomu sa nedala vynútiť do povrchu." | Veľmi krátka alebo takmer prekrývajúca sa časť hrany zlomu sa nezmestila; skontrolujte to miesto. |
| "Povrch potrebuje aspoň tri body s výškami." | Príliš málo bodov: skontrolujte poradie stĺpcov a skupiny. |
| "Všetky body sú na jednej čiare: žiadne trojuholníky." | Body nemajú šírku, napríklad jediná čiara polygónového ťahu. |
| "Hranica sa neprekrýva s bodmi." | Hranica je inde, často ide o zámenu jednotiek alebo súradnicového systému. |
| "Vnútri hranice nezostali žiadne trojuholníky." | Hranica je príliš malá alebo zle umiestnená. |

## Povrch načítaný z LandXML

Keď otvoríte LandXML, jeho prvý povrch TIN sa použije tak, ako je: nadpis **Povrch** hovorí "Povrch (z LandXML)" a **Najdlhšia vonkajšia hrana** je zošednutá. Kým je tento povrch v použití, skupiny hrán zlomu, nakreslené hrany zlomu ani nová hranica ho nemenia. Ak chcete povrch postaviť z bodov súboru, kliknite na {{ui:Znova vytvoriť povrch z bodov}}. {{key:Mod+Z}} vráti povrch z LandXML.

## Súvisiace

- [Čítanie vrstevníc, výšok a sklonov](topic:contours).
- [Import geodetických bodov](topic:import-points).
