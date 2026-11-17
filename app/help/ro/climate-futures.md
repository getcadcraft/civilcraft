---
title: "Climă viitoare: inundații, căldură și incendii forestiere în 2050 și 2080"
summary: În De la adresă la amplasament, ridicați nivelul de inundație al amplasamentului pentru un climat viitor, evaluați expunerea la incendii forestiere și modificați un fișier meteo, prezentat alături de cel viitor, dintr-un pachet de date climatice (SSP2-4.5 și SSP5-8.5, 2050 și 2080).
keywords: climă, schimbări climatice, viitor, 2050, 2080, ssp, cmip6, scenariu, nivelul mării, inundație, cotă de inundație de bază, bfe, fema, căldură, fișier meteo, epw, morfare, incendiu, incendiu forestier
from: b0d2ee38
---

Cifrele climatice vin dintr-un **pachet de date**, nu din aplicație. Activați suplimentul {{ui:Scenarii climatice}} în Setări › Suplimente, sau încărcați un fișier de pachet propriu în blocul {{ui:Climă viitoare}}.

:::warning
Pachetul care vine cu suplimentul este un **eșantion**: trei locuri (Denver, Miami, Johannesburg), un model climatic și cinci ani din fiecare perioadă de 20 de ani. Este acolo ca să încercați instrumentele, **nu pentru proiectare**. Un pachet complet se construiește cu `tools/climate/build-pack.mjs` din datele NEX-GDDP-CMIP6 ale NASA.
:::

## Unde se află

Suprafață › Mai multe › De la adresă la amplasament. Setați punctul, adăugați straturile (un strat FEMA de inundație dă cota de inundație de bază) și apăsați butonul care citește amplasamentul. Sub rândurile amplasamentului se află blocul {{ui:Climă viitoare}}: alegeți un **Scenariu** (SSP2-4.5 sau SSP5-8.5) și un **An** (2050 = 2041-2060, 2080 = 2071-2090, ambele față de 1995-2014). Se folosește locul din pachet cel mai apropiat de punct sau cel pe care îl alegeți; departe de orice loc se folosesc schimbările medii globale, iar panoul spune asta.

## Nivelul de proiectare al inundației

Nivelul actual este cota de inundație de bază a FEMA, atunci când stratul de inundație a avut una (picioare, NAVD 88); altfel introduceți una proprie. Alegeți tipul de inundație (costieră, fluvială sau ploi torențiale, ori ambele), adâncimea inundației la amplasament pentru partea de ploaie și o rezervă de siguranță (freeboard), dacă doriți una. {{ui:Ridicarea nivelului de inundație}} arată nivelul actual și cel viitor unul lângă altul, părțile legate de nivelul mării și de ploaie și ipotezele: întreaga creștere a nivelului mării se adaugă la un nivel costier; debitul fluvial crește unu la unu cu ploaia din cea mai udă zi, iar adâncimea urmează debitul la puterea 0.6 (Manning, albie largă); părțile se adună.

:::warning
O evaluare a schimbării, nu un studiu de inundații. Nivelul de proiectare al inundației aparține autorității sau inginerului responsabil.
:::

## Expunerea la incendii forestiere (doar evaluare)

Vegetația cea mai apropiată, panta urcătoare de la ea și distanța dau o bandă de la foarte scăzută la extremă, prezentă și viitoare (cea viitoare înmulțește cu schimbarea din pachet a indexului meteo de incendiu). **Doar evaluare:** o scară proprie, relativă, ca să aflați dacă un amplasament are nevoie de o evaluare reală a riscului de incendii forestiere; nu este o clasificare de cod.

## Căldură: un fișier meteo viitor

Alegeți un fișier `.epw` din prezent și apăsați {{ui:Crearea fișierului meteo viitor}}: este modificat prin metoda publicată de deplasare și întindere (Belcher, Hacker și Powell 2005), iar căldura este comparată (temperatura medie și cea mai ridicată, temperaturi de proiectare, ore peste 30 °C și 35 °C, grade-zile). {{ui:Salvare fișier meteo viitor}} îl salvează pentru panoul Mediu, pentru verificarea energetică a BimCraft sau pentru propriile instrumente.

## De unde vin cifrele

NASA NEX-GDDP-CMIP6 (ieșirea modelelor CMIP6 reduse la scară, CC BY 4.0 pentru fiecare model) pentru temperatură, umiditate, insolație, ploaie și indicele meteo de incendiu; media globală IPCC AR6 pentru creșterea nivelului mării, dacă pachetul nu are cifre locale. Panoul arată sursa, licența și data pachetului.
