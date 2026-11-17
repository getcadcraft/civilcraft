---
title: Čitanje izohipsa, kota i nagiba
summary: Postavite razmak izohipsa i glavne izohipse, prikažite visinske pojaseve, strelice nagiba i trokute te očitajte kote terena ispod pokazivača.
keywords: izohipse, razmak izohipsa, glavne izohipse, oznake, visinski pojasevi, strelice nagiba, trokuti, visinska kota, analiza terena, analiza kota, analiza nagiba
from: 585e500a
---

Teren se prikazuje izohipsama čim postoji. Sve što je opisano u ovoj temi postavlja se pod **Prikaz** u lijevoj ploči. Postavke prikaza mijenjaju samo ono što vidite (i što izvozite); nisu koraci poništavanja.

## Postavljanje razmaka izohipsa

1. Pod **Prikaz** odaberite vrijednost u **Izohipse svakih**.
   - U stopama: 0.25, 0.5, 1, 2, 5, 10 ili 20 ft.
   - U metrima: 0.1, 0.25, 0.5, 1, 2, 5 ili 10 m.
2. Odaberite **Glavne svakih**: svaku 2., 4., 5. ili 10. izohipsu.
   Glavne izohipse crtaju se debljom linijom i označene su svojom kotom. Padaju na cjelobrojne višekratnike razmaka glavnih izohipsa (uz izohipse od 1 ft i svaku 5. glavnu: 245, 250, 255 …).
3. Isključite {{ui:Contour labels}} ako se oznake gomilaju na malom crtežu.

Novi projekt počinje s 1 jedinicom i svakom 5. izohipsom kao glavnom. Izohipse se lome na prijelomnicama; ako prelaze ravno preko linije toka ili hrpta, ta linija još nije prijelomnica (vidi [Izrada i doradba terena](topic:build-surface)).

:::note
Izohipse se crtaju samo ako ima najviše 2.000 razina između najniže i najviše točke. Na lokaciji s velikim reljefom i vrlo malim razmakom plan uopće ne prikazuje izohipse: odaberite veći razmak.
:::

## Zaglađivanje izohipsa

Izohipse se crtaju kao ravni dijelovi, po jedan preko svakog trokuta terena, pa na svakom bridu trokuta lagano skrenu. **Zaglađivanje izohipsa** pod **Prikaz** zaobljuje te kutove:

- **Nema (ravni dijelovi)**: ucrtane linije kakve jesu. Tako izgledaju novi ili stariji crteži.
- **Slabo**: kutovi malo zaobljeni. Linija se nikad ne pomakne više od 10% puta prema sljedećoj izohipsi i nikad dalje od svog ravnog dijela nego za šestinu duljine tog dijela.
- **Jako**: tekuća krivulja. Linija se nikad ne pomakne više od 25% puta prema sljedećoj izohipsi i nikad dalje od svog ravnog dijela nego za trećinu duljine tog dijela.

Uz bilo koji izbor, zaglađena izohipsa i dalje siječe svaki brid trokuta u istoj točki kao ucrtana, ostaje unutar trokuta kroz koji prolazi svaki dio pa se nikad ne može presjeći ni dotaknuti s drugom izohipsom. Gdje izohipsa siječe prijelomnicu ili granicu, zadržava oštar zavoj. Zaglađene linije su one koje se ucrtavaju i izvoze (DXF, DWG, PDF, GIS i 3D), i imaju više vrhova od ucrtanih linija.

Zaglađivanje mijenja samo ucrtane linije. Kote, volumeni, profili i presjeci i dalje se čitaju iz samog terena. Izohipsa koja točno prolazi kroz geodetske točke (točka na 250.00 na izohipsi 250) zadržava mali kut na svakoj takvoj točki.

## Kako nastaje teren iza izohipsa

Izohipse prate teren, a teren prati **Metodu izrade izohipsa** pod **Teren** u lijevoj ploči. Zadana je **Triangulacija s linearnom interpolacijom**: spaja vaše točke u trokute i zadržava svaku točku i prijelomnicu točno. Ostale metode prvo prilagode mrežu točkama (kriging, minimalna zakrivljenost, prirodni susjed, inverzna udaljenost i druge), što daje zaobljenije izohipse između točaka, ali ne prolazi točno kroz svaku točku; izvješće o terenu pod **Teren** pokazuje koliko je rezultat odmaknut u vašim točkama.

**ABOS (aproksimacija temeljena na zaglađivanju)** jedna je od metoda na mreži. Ima dvije vlastite postavke: **Glatkoća** (početno 0.5; manja vrijednost je glađe) i **Točnost** (početno 1: teren se dovodi unutar 1% raspona visina lokacije u vašim točkama; upišite manji broj za bliže prianjanje). Ako ne može postići točnost na mreži koju ima, izvješće o terenu to kaže: upišite manji **Razmak mreže**.

## Očitavanje kote bilo gdje

Pomaknite pokazivač nad plan. Statusna traka prikazuje:

- **E** i **N** ispod pokazivača
- **Teren** i postojeću kotu terena tu, interpoliranu na trokutu pod pokazivačem
- **Isplanirano** i projektiranu kotu, gdje je plato ili koridor promijenio teren
- „Izvan terena“ izvan terena

Da točno očitate geodetsku točku, odaberite {{ui:Select}} i kliknite točku: desna ploča prikazuje njen broj, istočnu koordinatu (E), sjevernu koordinatu (N), kotu, opis i skupinu.

## Prikaz visinskih pojaseva

1. Označite {{ui:Elevation bands}}.
   Teren se ispunjava bojom od niske (plavozelene) do visoke (oker-smeđe). Legenda ispod kvačica navodi raspon kota svakog pojasa.
2. Odaberite broj pojaseva u **Pojasevi**: 5, 8, 10 ili 12. Pojasevi dijele raspon od najniže do najviše kote na jednake korake.

Pojasevi služe samo za gledanje. Ne izvoze se u DXF niti se ispisuju u PDF.

## Prikaz strelica nagiba

Označite {{ui:Slope arrows}}. Kratka strelica na svakom trokutu dovoljno velikom da je nosi pokazuje nizbrdo. Ravni trokuti nemaju strelicu. Strelice su brza provjera smjera odvodnje; sama vrijednost nagiba još nije označena.

## Prikaz trokuta, točaka i bridova

- {{ui:Triangles}} crta bridove TIN-a. Uključite ga da provjerite kako teren povezuje točke, osobito uz prijelomnice i na vanjskom rubu.
- {{ui:Points}} crta svaku geodetsku točku; {{ui:Point labels}} dodaje njen broj, kotu i opis (ili manje: vidi **Oznake točaka** u [CivilCraft postavkama](topic:settings)).
- {{ui:Breaklines}} crta prijelomnice (i granicu) narančastom bojom.
- {{ui:Surface edge}} crta obris terena.

## Postojeći ili projektirani teren

Kad plato ili koridor izravnaju teren bez problema, **Teren** pod **Prikaz** nudi {{ui:Proposed (graded)}}. Izohipse, pojasevi i strelice tada prikazuju izravnani teren, pa vidite novi teren i nožicu pokosa oko njega. Vratite se na {{ui:Existing ground}} da vidite geodetsku snimku.

## Što se izvozi

DXF i PDF izvoz prate ove postavke: ono što ste isključili ne upisuje se, a izohipse su one prikazanog terena. Visinski pojasevi se nikad ne izvoze.
