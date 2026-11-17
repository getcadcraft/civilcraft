---
title: Branje plastnic, višin in naklonov
summary: Nastavite višinski interval in glavne plastnice, prikažite višinske pasove, puščice naklona in trikotnike ter preberite višine terena pod kazalcem.
keywords: plastnice, višinski interval, glavne plastnice, oznake, višinski pasovi, puščice naklona, trikotniki, višinska kota točke, analiza površja, analiza višin, analiza naklonov
from: 585e500a
---

Površje je prikazano s plastnicami takoj, ko obstaja. Vse v tej temi nastavite pod **Prikaz** v levi plošči. Nastavitve prikaza spreminjajo samo to, kar vidite (in kar izvozite); niso koraki razveljavitve.

## Nastavite višinski interval plastnic

1. Pod **Prikaz** izberite vrednost v polju **Plastnice vsakih**.
   - V čevljih: 0.25, 0.5, 1, 2, 5, 10 ali 20 ft.
   - V metrih: 0.1, 0.25, 0.5, 1, 2, 5 ali 10 m.
2. Izberite **Glavne vsakih**: 2., 4., 5. ali 10. plastnico.
   Glavne plastnice so narisane debelejše in označene z višino. Ležijo na celih večkratnikih razmika glavnih plastnic (pri plastnicah na 1 ft in vsaki 5. glavni: 245, 250, 255 …).
3. Izklopite {{ui:Oznake plastnic}}, če so oznake preveč skupaj na majhnem izrisu.

Nov projekt se začne z 1 enoto, pri čemer je vsaka 5. plastnica glavna. Plastnice se pri prelomnicah lomijo; če ravno sekajo odtočno črto ali greben, ta črta še ni prelomnica (glejte [Izdelava in izboljšava površja](topic:build-surface)).

:::note
Plastnice so narisane le, če je med najnižjo in najvišjo točko največ 2,000 nivojev. Na lokaciji z velikimi višinskimi razlikami in zelo majhnim intervalom načrt ne prikaže nobenih plastnic: izberite večji interval.
:::

## Glajenje plastnic

Plastnice so izrisane kot ravni odseki, po enega čez vsak trikotnik površja, zato se na vsakem robu trikotnika rahlo obrnejo. **Glajenje plastnic** pod **Prikaz** zaobli te vogale:

- **Brez (ravni odseki)**: začrtane črte take, kakršne so. Tako se prikažeta nova ali starejša risba.
- **Rahlo**: vogali so rahlo zaobljeni. Črta se nikoli ne premakne za več kot 10 % proti naslednji plastnici in nikoli dlje od svojega ravnega odseka kot za eno šestino dolžine tega odseka.
- **Močno**: tekoča krivulja. Črta se nikoli ne premakne za več kot 25 % proti naslednji plastnici in nikoli dlje od svojega ravnega odseka kot za eno tretjino dolžine tega odseka.

Pri obeh izbirah zglajena plastnica še vedno seka vsak rob trikotnika v isti točki kot začrtana, ostane znotraj trikotnika, ki ga seka posamezni odsek, zato se nikoli ne križa ali dotika druge plastnice. Kjer plastnica seka prelomnico ali mejo, ohrani ostri zavoj. Zglajene črte so tiste, ki se izrišejo in izvozijo (DXF, DWG, PDF, GIS in 3D), z več oglišči kot začrtane črte.

Glajenje spremeni le izrisane črte. Višine, prostornine, profili in prerezi se še vedno berejo neposredno iz površja. Plastnica, ki gre točno skozi geodetske točke (točka pri 250.00 na plastnici 250), na vsaki taki točki ohrani majhen vogal.

## Kako nastane površje za plastnicami

Plastnice sledijo površju, površje pa sledi **Metodi plastnic** pod **Površje** v levi plošči. Privzeta, **Triangulacija z linearno interpolacijo**, poveže vaše točke v trikotnike in ohrani vsako točko in prelomnico natančno. Druge metode najprej prilagodijo pravilno mrežo točkam (kriging, najmanjša ukrivljenost, naravni sosed, inverzna razdalja in druge), kar da bolj zaobljene plastnice med točkami, vendar ne gre natančno skozi vsako točko; poročilo o površju pod **Površje** pove, kako daleč je rezultat od vaših točk.

**ABOS (približek na podlagi glajenja)** je ena od metod z mrežo. Ima dve lastni nastavitvi: **Gladkost** (na začetku 0.5; nižja je bolj gladka) in **Natančnost** (na začetku 1: površje se prilagodi na 1 % višinskega razpona lokacije v vaših točkah; za natančnejše prileganje vpišite manjšo vrednost). Če na obstoječi mreži ne doseže natančnosti, poročilo o površju to pove: vpišite manjši **Razmik mreže**.

## Preberite višino na kateremkoli mestu

Premaknite kazalec nad načrt. Vrstica stanja prikaže:

- **E** in **N** pod kazalcem
- **Teren** in višino obstoječega terena tam, interpolirano na trikotniku pod kazalcem
- **Izravnano** in predvideno višino tam, kjer je ploščad ali koridor spremenil teren
- "Zunaj površja" zunaj površja

Če želite natančno prebrati geodetsko točko, izberite {{ui:Izberi}} in kliknite točko: desna plošča prikaže njeno številko, vzhodno koordinato (E), severno koordinato (N), višino, opis in skupino.

## Prikaz višinskih pasov

1. Označite {{ui:Višinski pasovi}}.
   Površje je zapolnjeno z barvo od nizkega (modrozeleno) do visokega (okrasto rjavo). Legenda pod potrditvenimi polji navede višinski razpon vsakega pasu.
2. Izberite število pasov v **Pasovi**: 5, 8, 10 ali 12. Pasovi razdelijo razpon od najnižje do najvišje višine na enake korake.

Pasovi so samo za pregled. Ne izvozijo se v DXF in ne izrišejo v PDF.

## Prikaz puščic naklona

Označite {{ui:Puščice naklona}}. Kratka puščica na vsakem trikotniku, dovolj velikem, da jo sprejme, kaže navzdol. Ravni trikotniki nimajo puščice. Puščice so hiter pregled smeri odvodnjavanja; vrednost naklona sama še ni označena.

## Prikaz trikotnikov, točk in robov

- {{ui:Trikotniki}} nariše robove TIN. Vklopite ga, če želite preveriti, kako površje povezuje točke, zlasti ob prelomnicah in na zunanjem robu.
- {{ui:Točke}} nariše vsako geodetsko točko; {{ui:Oznake točk}} doda njeno številko, višino in opis (ali manj: glejte **Oznake točk** v [Nastavitve CivilCraft](topic:settings)).
- {{ui:Prelomnice}} nariše prelomnice (in mejo) oranžno.
- {{ui:Rob površja}} nariše obris površja.

## Obstoječe ali predvideno

Ko ploščad ali koridor brez težav izravna teren, **Površje** pod **Prikaz** ponudi {{ui:Predvideno (izravnano)}}. Plastnice, pasovi in puščice nato prikazujejo izravnano površje, tako da vidite novi teren in dnevno črto okoli njega. Preklopite nazaj na {{ui:Obstoječi teren}}, da vidite geodetsko izmero.

## Kaj se izvozi

Izvoz DXF in PDF upošteva te nastavitve: kar ste izklopili, se ne zapiše, plastnice pa so tiste z določenega površja. Višinski pasovi se nikoli ne izvozijo.
