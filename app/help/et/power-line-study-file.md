---
title: Uuringufailid teise liiniprogrammi jaoks (.DON)
summary: Salvesta üks õhuliin .DON-uuringufailina või loe ühe toed uude liini. Pole testitud programmiga, mis neid loeb.
keywords: don, .don, uuringufail, xml, eksport, import, õhuliini programm, paigaldus, kanton
from: 1abc4d07
---

Mõned õhuliinide programmid hoiavad uuringut `.DON`-failis (XML-tekst). CivilCraft saab kirjutada ühe liini sellisesse faili ja lugeda ühe toed.

:::warning
**Testimata.** Koostasime selle formaadi väljanimede loendi järgi, mille kasutaja jagas, mitte päris faili põhjal, ega ole oma faile avanud programmis, mis neid loeb. Ava fail seal ja kontrolli iga väärtust enne, kui sellele toetud. Kui saad jagada `.DON`-faili (kliendi andmed eemaldatud), aitab see meil asja õigeks teha.
:::

## Salvesta uuringufail

1. Anna liinile juht ja veendu, et tal on tulemused (omadustes pole „ei ole arvutatud“).
2. {{ui:Veel}} › {{ui:Salvesta uuringufail (.DON)…}}, vali liin, lisa kirjeldus ja töönumber.
3. {{ui:Salvesta uuringufail}}.

Fail sisaldab liini toesid (koordinaadid, maapind, kõrgused, rollid, traavers, toe jätmine või soovitus, koormused koormusjuhtude kaupa, vundament), iga lõik ankurdusotste vahel eraldi (juht, pinge, määrav vahemik, vahemikud, pinge ja ripplahenduse parameeter, suurim pinge koormusjuhu kohta) ning paigaldustabelid. Pikkused on meetrites ja jõud daN-des; tekst kirjutatakse Latin-1 kodeeringus, nii et selle väline märk muutub `?`-ks.

## Loe uuringufail

{{ui:Veel}} › {{ui:Ava uuringufail (.DON)…}} loeb toed uude liini. Juht, toed ja traaversid seostatakse teegiga nime järgi; mida ei leita, jäetakse sinu valida omadustes.
