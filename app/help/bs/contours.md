---
title: Čitanje izohipsi, kota i nagiba
summary: Postavite razmak izohipsi i glavne izohipse, prikažite pojaseve kota, strelice nagiba i trouglove te očitajte kote terena ispod pokazivača.
keywords: izohipse, razmak izohipsi, glavne izohipse, oznake, pojasi kota, strelice nagiba, trouglovi, kota tačke, analiza površine, analiza kota, analiza nagiba
from: 585e500a
---

Površina se prikazuje izohipsama čim postoji. Sve što je obuhvaćeno ovom temom podešava se pod **Prikaz** u lijevom panelu. Postavke prikaza mijenjaju samo ono što vidite (i što se izvozi); nisu koraci poništavanja.

## Podesite razmak izohipsi

1. Pod **Prikaz** odaberite vrijednost u **Izohipse svakih**.
   - U stopama: 0.25, 0.5, 1, 2, 5, 10 ili 20 ft.
   - U metrima: 0.1, 0.25, 0.5, 1, 2, 5 ili 10 m.
2. Odaberite **Glavne svakih**: svaku 2., 4., 5. ili 10. izohipsu. Glavne izohipse se crtaju debljim linijama i označene su svojom kotom. Padaju na cjelobrojne višekratnike razmaka glavnih izohipsi (uz izohipse od 1 ft i svaku 5. glavnu: 245, 250, 255 …).
3. Isključite {{ui:Oznake izohipsi}} ako se oznake gomilaju na maloj parceli.

Novi projekat počinje s 1 jedinicom, a svaka 5. izohipsa je glavna. Izohipse se savijaju na linijama prijeloma; ako prolaze ravno preko linije toka ili grebena, ta linija još nije linija prijeloma (vidi [Izgradnja i doterivanje površine](topic:build-surface)).

:::note
Izohipse se crtaju samo ako između najniže i najviše tačke ima najviše 2,000 nivoa. Na terenu s velikom visinskom razlikom i vrlo malim razmakom plan uopšte ne prikazuje izohipse: odaberite veći razmak.
:::

## Zaglađivanje izohipsi

Izohipse se povlače kao ravni dijelovi, po jedan preko svakog trougla površine, pa na svakoj ivici trougla naprave mali ugao. **Zaglađivanje izohipsi** pod **Prikaz** zaobljuje te uglove:

- **Bez (ravni dijelovi)**: linije onako kako su povučene. Ovako se prikazuju novi ili stariji crteži.
- **Lagano**: uglovi malo zaobljeni. Linija se nikad ne pomjeri više od 10% prema sljedećoj izohipsi i nikad dalje od svog ravnog dijela za jednu šestinu dužine tog dijela.
- **Jako**: tečna kriva. Linija se nikad ne pomjeri više od 25% prema sljedećoj izohipsi i nikad dalje od svog ravnog dijela za jednu trećinu dužine tog dijela.

Uz bilo koji izbor, zaglađena izohipsa i dalje prolazi kroz istu tačku na svakoj ivici trougla kao i povučena, ostaje unutar trougla koji svaki dio presijeca i zato nikad ne može presijecati ili dodirnuti drugu izohipsu. Tamo gdje izohipsa presijeca liniju prijeloma ili granicu, zadržava oštar zavoj. Zaglađene linije se crtaju i izvoze (DXF, DWG, PDF, GIS i 3D), i imaju više tačaka od povučenih.

Zaglađivanje mijenja samo nacrtane linije. Kote, zapremine, uzdužni profili i presjeci i dalje se čitaju iz same površine. Izohipsa koja prolazi tačno kroz geodetske tačke (tačka na 250.00 na izohipsi 250) zadržava mali ugao na svakoj takvoj tački.

## Kako nastaje površina iza izohipsi

Izohipse prate površinu, a površina prati **Metodu izrade izohipsi** pod **Površina** u lijevom panelu. Zadana, **Trijangulacija s linearnom interpolacijom**, spaja vaše tačke u trouglove i čuva svaku tačku i liniju prijeloma tačno. Ostale metode prvo prilagode pravilnu mrežu tačkama (kriging, minimalna krivina, prirodni susjed, inverzna udaljenost i druge), što daje zaobljenije izohipse između tačaka, ali ne prolazi tačno kroz svaku tačku; izvještaj o površini pod **Površina** kaže koliko je rezultat udaljen u vašim tačkama.

**ABOS (aproksimacija zasnovana na zaglađivanju)** je jedna od metoda s mrežom. Ima dvije vlastite postavke: **Glatkoća** (0.5 na početku; manje je glađe) i **Tačnost** (1 na početku: površina se dovodi unutar 1% raspona visina lokacije u vašim tačkama; upišite manji broj za tačnije prilagođavanje). Ako ne može postići tačnost na mreži koju ima, izvještaj o površini to kaže: upišite manji **Razmak mreže**.

## Očitajte kotu bilo gdje

Pomjerite pokazivač preko plana. Statusna traka prikazuje:

- **E** i **N** ispod pokazivača
- **Teren** i postojeću kotu terena tamo, interpoliranu na trouglu ispod pokazivača
- **Projektovano** i predloženu kotu, tamo gdje je plato ili koridor promijenio teren
- "Van površine" izvan površine

Da biste tačno očitali geodetsku tačku, odaberite {{ui:Odaberi}} i kliknite tačku: desni panel prikazuje njen broj, istočnu i sjevernu koordinatu, kotu, opis i grupu.

## Prikaz pojaseva kota

1. Označite {{ui:Pojasi kota}}.
   Površina se ispunjava bojom od niske (plavo-zelena) do visoke (ocker-smeđa). Legenda ispod kućica za označavanje navodi raspon kote svakog pojasa.
2. Odaberite koliko pojaseva u **Pojasi**: 5, 8, 10 ili 12. Pojasi dijele raspon od najniže do najviše kote na jednake korake.

Pojasi služe samo za pregled. Ne izvoze se u DXF niti se štampaju u PDF.

## Prikaz strelica nagiba

Označite {{ui:Strelice nagiba}}. Kratka strelica na svakom trouglu dovoljno velikom da je primi pokazuje nizbrdo. Ravni trouglovi nemaju strelicu. Strelice služe za brzu provjeru smjera odvodnje; sama vrijednost nagiba još nije označena.

## Prikaz trouglova, tačaka i ivica

- {{ui:Trouglovi}} crta ivice TIN-a. Uključite ga da provjerite kako površina povezuje tačke, naročito duž linija prijeloma i na vanjskom rubu.
- {{ui:Tačke}} crta svaku geodetsku tačku; {{ui:Oznake tačaka}} dodaje njen broj, kotu i opis (ili manje: vidi **Oznake tačaka** u [Postavkama programa CivilCraft](topic:settings)).
- {{ui:Linije prijeloma}} crta linije prijeloma (i granicu) narandžasto.
- {{ui:Rub površine}} crta obris površine.

## Postojeće ili projektovano

Kad plato ili koridor izravnaju teren bez problema, **Površina** pod **Prikaz** nudi {{ui:Projektovano (nivelisano)}}. Izohipse, pojasi i strelice tada prikazuju izravnatu površinu, pa vidite novi teren i presjek s terenom oko njega. Vratite se na {{ui:Postojeći teren}} da vidite snimak.

## Šta se izvozi

DXF i PDF slijede ove postavke: ono što ste isključili se ne upisuje, a izohipse su one površine koja se prikazuje. Pojasi kota se nikad ne izvoze.
