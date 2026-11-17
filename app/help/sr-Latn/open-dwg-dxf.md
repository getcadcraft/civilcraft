---
title: Otvori DWG ili DXF kao linije
summary: Otvori linije crteža na planu, sloj po sloj, koristi njegove izohipse, 3D polilinije i zatvorene obrise za površ, i pretvori njegove tačke blokova u geodetske tačke.
keywords: kontrola snimanja, kote teksta, dwg, dxf, cad, crtež, linije, izohipse, linije loma, granica, polilinija, 3D polilinija, slojevi, osnovna mapa, topo, geodetski crtež, blokovi, referenca bloka, geodetske tačke iz blokova, atributi, tačke blokova, tačka umetanja
from: da0f4c58
---

Topografski snimak često stiže kao crtež: izohipse kao polilinije na njihovoj koti, linije loma kao 3D polilinije, granica lokacije kao zatvorena polilinija. CivilCraft otvara **modelni prostor** crteža kao slojeve na planu i može te linije direktno pretvoriti u površ.

## Otvori crtež

1. Klikni {{ui:Linije}} u grupi **Površ** (ili {{ui:Otvori}}, ili prevuci datoteku na plan) i izaberi `.dwg` ili `.dxf` datoteku. Crtež se čita na ovom računaru; ništa se ne otprema. Čitaju se DWG od 2000 do 2018 i ASCII DXF.
2. Dijalog **Linije** navodi slojeve crteža koji sadrže linije, zatvorene oblike ili tačke, i da li imaju **kote**. Slojevi koji su isključeni u crtežu počinju neobeleženi. Tekst, šrafure, kote i drugi objekti koji nisu linije se broje i izostavljaju (dijalog kaže koji).
3. Proveri **Jedinice crteža**. Kada crtež kaže svoje jedinice, CivilCraft ih pretvara u jedinice projekta (milimetri u metre, metri u stope, inči u stope). Crtež u stopama se čita kao američke geodetske stope bez skaliranja: razlika je 2 dela na milion, a skaliranje koordinata državne ravni bi ih pomerilo za stope. Kada crtež ne kaže svoje jedinice, njegovi brojevi se čitaju u jedinicama projekta; izaberi tačne jedinice u listi ako nisu.
4. U **Koristi za površinu**, izaberi šta svaki sloj daje površi (ili ostavi **Samo prikaži**). Slojevi nazvani kao izohipse (TOPO, CONT, CNTR) koji imaju kote počinju kao linije loma.
5. Klikni {{ui:Dodaj}}. Slojevi se pojavljuju pod **GIS slojevi** u levom panelu; svaka upotreba se stavlja u površ. Svaki deo je zaseban korak: {{key:Mod+Z}} ih vraća jedan po jedan.

## Šta svaka vrsta sloja može dati

| Sloj sadrži | Koristi za površinu |
|---|---|
| Izohipse (polilinije na koti) | Linije loma na sopstvenoj koti linija, ili na polju ELEV |
| 3D polilinije | Linije loma na njihovim sopstvenim kotama |
| Zatvoreni obris | Granica površi (najveći zatvoreni oblik, ili onaj koji si izabrao) |
| Tačke sa kotom | Geodetske tačke, opisane imenom sloja |
| Linije na koti 0 (linije na planu) | Ništa: ostaje na planu kao osnovni crtež |

Crtež koji je napisao CivilCraft sadrži karakteristične linije kao 3D polilinije koje pamte svoje lukove. Dijalog tada prikazuje **Karakteristične linije**: ostavi ga štiklirano da ih vrati kao karakteristične linije sa lukovima i upotrebama (jedan korak poništavanja), ili ga odštikliraj da ih pročita kao obične linije.

Kasnije, koristi {{ui:Koristi za površinu}} u meniju sloja pod **GIS slojevi** da uradiš isto za sloj koji si samo prikazao.

## Geodetske tačke iz blokova

Geodetski crteži često nose tačke kao blokove: mali simbol na svakom snimku, sa atributima za broj tačke, opis i kotu. Kada crtež ima reference blokova, dijalog ima odeljak **Geodetske tačke iz blokova**:

1. Štikliraj blokove koje uzimaš (tabela kaže koliko referenci ima svaki, na kojim slojevima i kojim atributima), ili štikliraj slojeve da uzmeš svaku referencu bloka na njima.
2. Izaberi odakle dolaze **broj**, **opis** i **kota** svake tačke: iz atributa, iz imena bloka ili sloja, iz sledećih slobodnih brojeva, ili iz Z tačke umetanja. CivilCraft počinje od verovatnih atributa (PT, DESC, ELEV i slični), i uzima kotu iz atributa samo kada su blokovi na nuli.
3. Odštikliraj slojeve linija ako želiš samo tačke, pa klikni {{ui:Dodaj}}.

Svaka referenca postaje jedna geodetska tačka u svojoj tački umetanja. Računaju se samo reference postavljene u modelnom prostoru; blokovi ugnježdeni u drugim blokovima ne. Brojevi koji već postoje u projektu, ili su upotrebljeni dvaput u crtežu, dobijaju nove brojeve posle najvećeg, a atribut kote koji nije broj ostavlja tu tačku bez kote; statusna linija broji oba. Crtež se nikad ne menja, a svaka tačka pamti svoj blok: njena Svojstva prikazuju **Iz bloka** sa blokom, slojem i oznakom (handle). Dodavanje tačaka je jedan korak, pa {{key:Mod+Z}} ih sve uklanja.

## Kote zapisane kao tekst, i provera

Kote zapisane kao tekst (ili u atributu bloka koji nije blok geodetske tačke) nisu linije. Odeljak **Geodetske kote i provera** ih može uzeti kao geodetske tačke, i navodi šta izgleda pogrešno u crtežu: jedinice, koordinatni sistem, udaljenost od nule, ravne izohipse, neobične kote, dupli tačke. Vidi [Proveri geodetski crtež pri uvozu](topic:survey-check).

## Kako se crtež čita

- Lukovi, krugovi, elipse, zaobljeni segmenti polilinija i splajnovi postaju kratki pravi delovi (najviše na svakih 5°).
- Reference blokova se crtaju tamo gde su postavljene, uključujući i ugnježdene blokove; ono što blok ima na sloju 0 preuzima sloj reference.
- Objekti nacrtani u drugoj ravni (drugačiji smer istiskivanja) postavljaju se u svetske koordinate.
- Svaki objekat dobija tri polja: LAYER, TYPE (vrsta objekta) i ELEV (njegova kota kada sve njegove tačke dele jednu).
- Koordinate se uzimaju kakve jesu: crtež mora koristiti iste koordinate kao projekat (na primer istu zonu državne ravni). Povezani crteži (xref) se ne otvaraju: otvori ih zasebno.

:::tip
Crtež izohipsi daje najbolju površ uz nekoliko tačaka kota na vrhovima i u udubljenjima, gde izohipse same ostavljaju ravne trouglove. Dodaj ih kao geodetske tačke, ili iz sloja tačaka u crtežu.
:::
