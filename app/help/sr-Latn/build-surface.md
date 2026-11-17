---
title: Izgradite i doradite površinu
summary: Kako CivilCraft trijangulira postojeći teren i kako ga oblikujete grupama linija loma, nacrtanim linijama loma, spoljnom granicom i najdužom spoljnom ivicom.
keywords: tin, površina, trijangulacija, linija loma, granica, postojeći teren, eg, kreiraj površinu, delaunay, trouglovi, najveća ivica, spoljna granica
from: b9eea3f3
---

CivilCraft ima jednu površinu postojećeg terena po projektu. To je TIN (trijangulisana nepravilna mreža) izgrađena od vaših tačaka, i sama se ponovo izgrađuje svaki put kada se neki ulaz promeni. Nema komande „ponovo izgradi“ i nema zastarele površine.

## Šta ulazi u površinu

- Svaka tačka sa kotom u grupi postavljenoj na {{ui:Tačke}}.
- Svaka grupa postavljena na {{ui:Linija loma}}, spojena po rednom broju tačke.
- Svaka linija loma koju nacrtate alatom {{ui:Linija loma}}.
- Spoljna granica, ako je nacrtate.
- Podešavanje **Najduža spoljna ivica**.

Trouglovi nikada ne seku liniju loma: površina je primorana da je prati, pa se što ravnomernije raspoređuje oko nje (Delaunay svuda drugde).

## Pretvaranje kodiranih linija u linije loma

1. U levom panelu pod **Tačke** pronađite grupu (na primer FL).
2. Postavite njen izbor **Površina** na {{ui:Linija loma}}.
   Površina se ponovo izgradi, linija se crta narandžasto (sa uključenim {{ui:Linije loma}} pod **Prikaz**), a **Linije loma** u podacima o površini se povećava za jedan.
3. Proverite liniju na planu. Ona mora ići tačku po tačku, redom kojim je snimljena. Ako cik-cak ide, grupa sadrži više od jedne linije, ili tačke nisu numerisane redom: vratite grupu na {{ui:Tačke}} i nacrtajte linije ručno (sledeći odeljak).

## Crtanje linije loma kroz tačke

1. Pritisnite {{key:B}}, ili kliknite {{ui:Linija loma}} u grupi **Površina**.
   Savet kaže „Linija loma: kliknite geodetske tačke redom (uzima njihove kote). Enter završava.“
2. Pomerite pokazivač blizu tačke. Mali narandžasti kvadrat označava tačku koju će uzeti.
3. Kliknite tačke linije jednu za drugom. Svaki klik imenuje tačku i njenu kotu u statusnoj traci.
4. Pritisnite {{key:Enter}} da završite.
   Statusna traka kaže „Linija loma 1 dodata; površina je ponovo izgrađena.“

Klikovi moraju da padnu na geodetsku tačku koja ima kotu; klik na drugom mestu se odbija porukom „Kliknite geodetsku tačku sa kotom: linija loma uzima kote tačaka.“ {{key:Backspace}} briše poslednju tačku; {{key:Esc}} otkazuje celu liniju.

:::warning
Završite sa {{key:Enter}}. Dvoklik takođe završava, ali u ovoj verziji briše tačku na koju ste dvaput kliknuli. Kliknite poslednju tačku jednom, pa pritisnite {{key:Enter}}.
:::

Da biste uklonili sve nacrtane linije loma odjednom, kliknite {{ui:Ukloni nacrtane linije loma}} u odeljku **Površina**. Da uklonite samo poslednju, upotrebite {{key:Mod+Z}}. Nacrtane linije loma još se ne mogu birati ni menjati pojedinačno.

## Crtanje spoljne granice

Granica sužava površinu na područje kome verujete, na primer granice geodetskog snimanja, tako da dugi trouglovi preko nesnimljenih uglova nestanu.

1. Pritisnite {{key:O}}, ili kliknite {{ui:Granica}}.
2. Kliknite temena redom oko područja. Isprekidana linija prikazuje oblik.
3. Pritisnite {{key:Enter}}.
   Statusna traka kaže „Granica postavljena; trouglovi van nje su uklonjeni.“ **Granica** u podacima o površini kaže „Da“ i broj temena.

Šta treba znati:

- Postoji jedna granica. Crtanje nove zamenjuje staru. {{ui:Ukloni granicu}} je uklanja.
- Ona samo može da oduzima: granica koja ide preko tačaka seče se do njihovog obrisa, uz napomenu „Granica ide preko tačaka; sečena je do njihovog obrisa.“
- Njena temena uzimaju kote iz površine, pa ivica tačno prati teren.
- Skrivene (unutrašnje) granice još nisu dostupne.

## Skraćivanje dugih spoljnih trouglova

Bez granice, površina popunjava ceo obris tačaka, uključujući duge tanke trouglove preko konkavnih ivica.

1. U **Površina**, upišite dužinu u **Najduža spoljna ivica** i pritisnite {{key:Enter}}. Počnite sa oko dva do tri puta vašim uobičajenim razmakom snimanja.
2. Spoljni trouglovi čija je spoljna ivica duža od toga se uklanjaju, postepeno ka unutra, dok svaka spoljna ivica ne bude dovoljno kratka. Ivica koja je linija loma se nikada ne skida.
3. Upišite 0 da ponovo zadržite svaki trougao.

## Čitanje izveštaja o površini

Ispod podataka o površini, okvir navodi šta je graditelj uradio. Sa okerom trakom sa leve strane to je obaveštenje; sa crvenom trakom sadrži grešku i površine nema.

| Poruka | Značenje |
|---|---|
| „3 tačke su bile na istom mestu kao neka druga i spojile su se sa njom.“ | Tačke bliže od 0.0001 u planu postale su jedno teme (prvo zadržano). |
| „2 mesta imaju dve različite kote …“ | Tačke jedna iznad druge, ili linije loma koje se seku, ne slažu se u visini. Kota linije loma pobeđuje, pa prva. |
| „1 deo linije loma nije mogao da se utisne u površinu.“ | Vrlo kratak ili skoro preklopljen deo linije loma nije stao; proverite to mesto. |
| „Površina treba najmanje tri tačke sa kotama.“ | Premalo tačaka: proverite redosled kolona i grupe. |
| „Sve tačke su na jednoj liniji: nema trouglova.“ | Tačke nemaju širinu, na primer jedna linija poligonskog vlaka. |
| „Granica se ne preklapa sa tačkama.“ | Granica je negde drugde, često pomešane jedinice ili koordinate. |
| „Unutar granice nema preostalih trouglova.“ | Granica je premala ili pogrešno postavljena. |

## Površina učitana iz LandXML-a

Kada otvorite LandXML, njegova prva TIN površina se koristi kako jeste: naslov **Površina** kaže „Površina (iz LandXML-a)“, a **Najduža spoljna ivica** je zasivljena. Dok je ta površina u upotrebi, grupe linija loma, nacrtane linije loma i nova granica je ne menjaju. Da biste izgradili površinu iz tačaka fajla, kliknite {{ui:Ponovo izgradi površinu iz tačaka}}. {{key:Mod+Z}} vraća površinu iz LandXML-a.

## Povezano

- [Pročitajte konture, kote i nagibe](topic:contours).
- [Uvezite geodetske tačke](topic:import-points).
