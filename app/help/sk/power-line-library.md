---
title: Vaša knižnica elektrických vedení
summary: Vytvorte si vlastné vodiče, podzemné káble, podpery, zariadenia a typy ryhy v kategóriách, ktoré pomenujete, a zdieľajte ich ako súbory.
keywords: knižnica, vodič, kábel, stĺp, podpera, traverza, izolátor, armatúra, kotevné lano, lano, transformátor, skriňa, spojka, ryha, kategória, csv, import, export
from: 88733744
---

Časť **Knižnica** pracovného priestoru Elektrické vedenia obsahuje všetky položky, ktoré môže vedenie alebo kábel použiť. Nič v nej nie je viazané na krajinu ani výrobcu: položky si vytvárate sami.

## Tri druhy položiek

| Druh | Kde je uložená | Môžete ju zmeniť? |
|---|---|---|
| **Príklady** | Dodávané s CivilCraft, s všeobecnými číslami, ktoré sme odvodili z vlastností materiálov | Nie: najprv {{ui:Kopírovať do mojej knižnice}} |
| **V projekte** | Prišla so súborom projektu, ktorý ste otvorili | Nie: najprv {{ui:Kopírovať do mojej knižnice}} |
| **Moje** | Vaše vlastné položky, uchovávané v tomto prehliadači | Áno, a zmeny sa uložia okamžite |

Každý projekt si uchováva kópiu každej položky, ktorú používa, takže sa projekt otvorí na ľubovoľnom počítači so svojimi vodičmi a stĺpmi.

:::warning
Vzorové položky sú len príklady: každé číslo overte podľa údajov vášho dodávateľa. Podzemné káble úmyselne nemajú prúdovú zaťažiteľnosť, pretože tá závisí od toho, ako je kábel uložený.
:::

## Vytvorenie položky

1. V **Knižnici** vyberte **Druh** (nadzemné vodiče, podzemné káble, podpery, zariadenia alebo typy ryhy).
2. Kliknite na {{ui:Nová položka}} alebo vyberte príklad a kliknite na {{ui:Kopírovať do mojej knižnice}} alebo {{ui:Duplikovať}}.
3. Vyplňte jej polia. Polia označené `*` sú tie, ktoré kontroly potrebujú; položka, ktorej niektoré chýba, je označená `!` a pri použití vedením je uvedená v **Kontrolách**.
4. Priraďte jej **Kategóriu** s `/` medzi úrovňami: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Strom sa riadi vašimi kategóriami.

Čo potrebuje každý druh:

| Druh | Potrebné pre kontroly |
|---|---|
| Nadzemný vodič | prierez, priemer, hmotnosť na meter, pevnosť v lome, modul pružnosti, tepelná rozťažnosť |
| Podzemný kábel | žily, prierez, napätie, priemer, odpor, prúdová zaťažiteľnosť |
| Podpera | celková dĺžka, menovité zaťaženie (počíta sa v bode pod vrchom), hĺbka v zemi |
| Zariadenie | jeho typ; menovité zaťaženie pre traverzy, armatúry a kotevné lano; fázový rozstup a previsnutie pre traverzy; dĺžka pre izolátory; uhol pre kotevné lano |
| Typ ryhy | hĺbka, šírka, krytie nad káblami |

## Zdieľanie

- {{ui:Uložiť moju knižnicu}} uloží každú vašu položku ako jeden súbor `.cclines.json`; {{ui:Otvoriť knižnicu…}} ho načíta späť (položky s rovnakým kľúčom sa nahradia).
- {{ui:Uložiť ako CSV}} uloží druh, ktorý si prezeráte, ako tabuľku; {{ui:Otvoriť knižnicu…}} načíta späť CSV tohto druhu. Stĺpce môžu byť v ľubovoľnom poradí; súbor oddelený bodkočiarkami môže používať desatinnú čiarku.
