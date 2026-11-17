---
title: Kontrola exportu IFC voči IDS klienta
summary: Načítajte súbor .ids, ktorý vám dal klient alebo cestný úrad, a v Problémoch uvidíte každý exportovaný prvok, ktorý ho nespĺňa.
keywords: ids, špecifikácia dodania informácií, buildingsmart, požiadavky, dodávka, kontrola, overenie, qa, export ifc, ifc 4.3, os trasy, cesta, verejné obstarávanie
from: 183d9a0e
---

## Čo budete robiť

IDS (Information Delivery Specification, norma buildingSMART) je zoznam toho, čo musí IFC obsahovať. Verejné obstarávanie ho často posiela spolu so zákazkou. CivilCraft skontroluje IFC, ktoré tento projekt exportuje, v takej verzii IFC, akú ste zvolili pre export, voči nemu, a vypíše každý prvok, ktorý nespĺňa požiadavky.

## Postup

1. Otvorte svoj projekt.
2. Kliknite na {{ui:IFC}} v skupine Export na paneli nástrojov. V dialógu zvoľte verziu IFC, ktorú budete dodávať.
3. Kliknite na {{ui:Skontrolovať voči IDS…}}.
4. Kliknite na {{ui:Načítať súbor .ids…}} a vyberte súbor. Nič sa nenahráva.
5. Prečítajte výsledok: každá špecifikácia s {{ui:Vyhovuje}} alebo {{ui:Nevyhovuje}} a koľkých prvkov sa týka.
6. Otvorte Problémy ({{key:Ctrl+Shift+M}}) a kliknutím na zlyhanie označte os trasy, plošinu, potrubie, konštrukciu alebo hmotu budovy, z ktorých pochádza.

## Čo by ste mali vidieť

- Jedno upozornenie na každý exportovaný prvok a požiadavku, ktorú nespĺňa, s názvom špecifikácie, tým, čo IDS žiada, a tým, čo export má.
- Správa o kontrole (v Problémoch) začína IDS: jeho názvom, verziou, autorom a počtami každej špecifikácie.

## Dobré vedieť

- IDS sa ukladá do súboru projektu, takže sa pri otvorení projektu skontroluje znova. Načítanie alebo zabudnutie je jeden krok, ktorý môžete vrátiť.
- Každá zmena sa skontroluje znova o chvíľu. Veľké povrchy sa zapisujú dlhšie, takže kontrola potom čaká o niečo dlhšie medzi behmi.
- Kontrola používa ten istý súbor, ktorý zapisuje export {{ui:IFC}}, vo verzii naposledy zvolenej tam (IFC 4.3, ak ste žiadnu nevybrali).
- Čísla sa porovnávajú v jednotkách SI: projekt v stopách sa najprv prevedie na metre.

- Vzory v IDS sa čítajú ako celá hodnota. `^` na začiatku a `$` na konci sa tiež berú ako „celá hodnota“, ako to väčšina súborov IDS myslí.

## Ďalej

- [Export IFC](topic:ifc)
