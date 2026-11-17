---
title: Očitavanje izohipsi, kota i nagiba
summary: Podesi interval izohipsi i glavne izohipse, prikaži pojaseve kota, strelice nagiba i trouglove i očitaj visine terena ispod pokazivača.
keywords: izohipse, interval izohipsi, glavne izohipse, oznake, pojasevi kota, strelice nagiba, trouglovi, tačkasta kota, analiza površi, analiza kota, analiza nagiba
from: 585e500a
---

Površ se prikazuje sa izohipsama čim postoji. Sve u ovoj temi podešava se pod **Prikaz** u levom panelu. Podešavanja prikaza menjaju samo ono što vidiš (i što se izvozi); ona nisu koraci za opozivanje.

## Podešavanje intervala izohipsi

1. U **Prikaz** izaberi vrednost u polju **Izohipse na svakih**.
   - U stopama: 0.25, 0.5, 1, 2, 5, 10 ili 20 ft.
   - U metrima: 0.1, 0.25, 0.5, 1, 2, 5 ili 10 m.
2. Izaberi **Glavne na svakih**: svaka 2., 4., 5. ili 10. izohipsa.
   Glavne izohipse se crtaju debljom linijom i obeležavaju se visinskom kotom. Postavljaju se na cele umnoške razmaka glavnih izohipsi (uz izohipse od 1 ft i svaku 5. glavnu: 245, 250, 255 …).
3. Isključi {{ui:Oznake izohipsi}} ako se oznake gomilaju na malom planu.

Novi projekat počinje sa 1 jedinicom i svakom 5. izohipsom glavnom. Izohipse se savijaju na linijama loma; ako seku pravo preko linije toka ili grebena, ta linija još nije linija loma (videti [Izgradnja i doterivanje površi](topic:build-surface)).

:::note
Izohipse se crtaju samo ako između najniže i najviše tačke ima najviše 2.000 nivoa. Na terenu sa velikom visinskom razlikom i vrlo malim intervalom plan ne prikazuje nijednu izohipsu: izaberi veći interval.
:::

## Zaglađivanje izohipsi

Izohipse se ucrtavaju kao prave deonice, po jedna preko svakog trougla površi, pa na svakoj ivici trougla naprave mali ugao. **Zaglađivanje izohipsi** pod **Prikaz** zaokružuje te uglove:

- **Bez (prave deonice)**: ucrtane linije kakve jesu. Ovako izgledaju novi ili stariji crteži.
- **Slabo**: uglovi su malo zaobljeni. Linija se nikad ne pomera više od 10% puta ka sledećoj izohipsi i nikad dalje od svoje prave deonice od jedne šestine dužine te deonice.
- **Jako**: tečna kriva. Linija se nikad ne pomera više od 25% puta ka sledećoj izohipsi i nikad dalje od svoje prave deonice od jedne trećine dužine te deonice.

Uz bilo koji izbor, zaglađena izohipsa i dalje seče svaku ivicu trougla u istoj tački kao ucrtana, ostaje unutar trougla koji svaka deonica seče, pa ne može nikad da seče ili dodirne drugu izohipsu. Tamo gde izohipsa seče liniju loma ili granicu, zadržava oštar ugao. Zaglađene linije su one koje se ucrtavaju i izvoze (DXF, DWG, PDF, GIS i 3D), i imaju više temena od ucrtanih linija.

Zaglađivanje menja samo ucrtane linije. Kote, zapremine, podužni profili i preseci i dalje se očitavaju sa same površi. Izohipsa koja prolazi tačno kroz geodetske tačke (tačka na 250.00 na izohipsi 250) zadržava mali ugao u svakoj takvoj tački.

## Kako se pravi površ iza izohipsi

Izohipse prate površ, a površ prati **Metod izohipsi** pod **Površ** u levom panelu. Podrazumevana, **Triangulacija sa linearnom interpolacijom**, povezuje tačke u trouglove i čuva svaku tačku i liniju loma tačno. Ostale metode prvo postavljaju pravilnu mrežu preko tačaka (kriging, minimalna krivina, prirodni susedi, inverzna udaljenost i druge), što daje zaobljenije izohipse između tačaka, ali ne prolazi tačno kroz svaku tačku; izveštaj o površi pod **Površ** kaže koliko je rezultat odstupio u tvojim tačkama.

**ABOS (aproksimacija zasnovana na zaglađivanju)** je jedna od metoda zasnovanih na mreži. Ima dva sopstvena podešavanja: **Glatkoća** (na početku 0.5; manja vrednost je glađe) i **Tačnost** (na početku 1: površ se dovodi unutar 1% visinskog raspona terena u tvojim tačkama; unesi manji broj za tačnije poklapanje). Ako ne može da postigne tačnost na mreži koju ima, izveštaj o površi to kaže: unesi manji **Razmak mreže**.

## Očitavanje kote bilo gde

Pomeri pokazivač preko plana. Statusna traka prikazuje:

- **E** i **N** ispod pokazivača
- **Teren** i postojeću visinsku kotu terena na tom mestu, interpolisanu na trouglu ispod pokazivača
- **Nivelisano** i predloženu kotu, tamo gde je plato ili koridor promenio teren
- „Van površi“ izvan površi

Da očitaš geodetsku tačku tačno, izaberi {{ui:Izaberi}} i klikni na tačku: desni panel prikazuje njen broj, istok, sever, kotu, opis i grupu.

## Prikaz pojaseva kota

1. Štikliraj {{ui:Pojasevi kota}}.
   Površ se boji od niskih (plavo-zelena) do visokih (oker-smeđa) kota. Legenda ispod polja za štikliranje navodi opseg kota svakog pojasa.
2. Izaberi koliko pojaseva u **Pojasevi**: 5, 8, 10 ili 12. Pojasevi dele opseg od najniže do najviše kote na jednake korake.

Pojasevi služe samo za gledanje. Ne izvoze se u DXF i ne iscrtavaju se u PDF.

## Prikaz strelica nagiba

Štikliraj {{ui:Strelice nagiba}}. Kratka strelica na svakom trouglu dovoljno velikom da je primi pokazuje nizbrdo. Ravni trouglovi nemaju strelicu. Strelice služe za brzu proveru smera odvodnjavanja; sama vrednost nagiba još nije označena.

## Prikaz trouglova, tačaka i ivica

- {{ui:Trouglovi}} crta ivice TIN-a. Uključi ga da proveriš kako površ povezuje tačke, naročito duž linija loma i spolja.
- {{ui:Tačke}} crta svaku geodetsku tačku; {{ui:Oznake tačaka}} dodaje njen broj, kotu i opis (ili manje: videti **Oznake tačaka** u [podešavanjima CivilCraft-a](topic:settings)).
- {{ui:Linije loma}} crta linije loma (i granicu) narandžasto.
- {{ui:Ivica površine}} crta obris površi.

## Postojeći ili predloženi teren

Kad plato ili koridor nivelišu bez problema, **Površ** pod **Prikaz** nudi {{ui:Predloženo (sa nagibom)}}. Izohipse, pojasevi i strelice tada prikazuju nivelisanu površ, pa vidiš novi teren i linije preseka sa terenom oko njega. Vrati se na {{ui:Postojeći teren}} da vidiš snimak.

## Šta se izvozi

Izlaz u DXF i PDF prati ova podešavanja: ono što si isključio ne upisuje se, a izohipse su one sa prikazane površi. Pojasevi kota se nikad ne izvoze.
