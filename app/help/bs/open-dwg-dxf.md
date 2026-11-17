---
title: Otvorite DWG ili DXF kao linije
summary: Otvorite linije crteža na planu, sloj po sloj, koristite njegove izohipse, 3D polilinije i zatvorene obrise za površ, te pretvorite njegove blokove tačaka u geodetske tačke.
keywords: provjera snimanja, kote teksta, dwg, dxf, cad, crtež, linije, izohipse, linije loma, granica, polilinija, 3D polilinija, slojevi, osnovna karta, topo, geodetski crtež, blokovi, reference blokova, geodetske tačke iz blokova, atributi, tačke blokova, tačka umetanja
from: da0f4c58
---

Topografsko snimanje često stiže kao crtež: izohipse kao polilinije na svojoj koti, linije loma kao 3D polilinije, granica lokacije kao zatvorena polilinija. CivilCraft otvara **prostor modela** crteža kao slojeve na planu i može te linije pretvoriti direktno u površ.

## Otvorite crtež

1. Kliknite {{ui:Linije}} u grupi **Površina** (ili {{ui:Otvori}}, ili prevucite datoteku na plan) i izaberite datoteku `.dwg` ili `.dxf`. Crtež se čita na ovom računaru; ništa se ne otprema. Čitaju se DWG od 2000. do 2018. i ASCII DXF.
2. Dijalog **Linije** navodi slojeve crteža koji sadrže linije, zatvorene oblike ili tačke, i da li imaju **kote**. Slojevi koji su isključeni u crtežu počinju neoznačeni. Tekst, šrafure, kote i drugi objekti koji nisu linije se broje i izostavljaju (dijalog kaže koji).
3. Provjerite **Jedinice crteža**. Kad crtež navodi svoje jedinice, CivilCraft ih pretvara u jedinice projekta (milimetre u metre, metre u stope, inče u stope). Crtež u stopama se čita kao američke geodetske stope bez skaliranja: razlikuju se za 2 dijela na milion, a skaliranje koordinata State Plane bi ih pomjerilo za stope. Kad crtež ne navodi svoje jedinice, njegovi brojevi se čitaju u jedinicama projekta; izaberite ispravne jedinice u listi ako nisu.
4. U **Koristi za površinu** izaberite šta svaki sloj daje površi (ili ostavite **Samo prikaži**). Slojevi nazvani kao izohipse (TOPO, CONT, CNTR) koji imaju kote počinju kao linije loma.
5. Kliknite {{ui:Dodaj}}. Slojevi se pojavljuju pod **GIS slojevi** u lijevom panelu; svaka upotreba se ubacuje u površ. Svaki dio je zaseban korak: {{key:Mod+Z}} ih vraća jedan po jedan.

## Šta svaka vrsta sloja može dati

| Sloj sadrži | Koristi za površ |
|---|---|
| Izohipse (polilinije na koti) | Linije loma na koti same linije, ili na polju ELEV |
| 3D polilinije | Linije loma na njihovim vlastitim kotama |
| Zatvoren obris | Granica površi (najveći zatvoreni oblik, ili onaj koji ste odabrali) |
| Tačke s kotom | Geodetske tačke, opisane imenom sloja |
| Linije na koti 0 (linije plana) | Ništa: ostaje na planu kao osnovni crtež |

Crtež koji je napisao CivilCraft čuva svoje karakteristične linije kao 3D polilinije koje pamte svoje lukove. Dijalog tada pokazuje **Karakteristične linije**: ostavite označeno da ih vratite kao karakteristične linije s lukovima i upotrebama (jedan korak poništavanja), ili odznačite da ih čitate kao linije kao bilo koji drugi sloj.

Kasnije koristite {{ui:Koristi za površinu}} u meniju sloja pod **GIS slojevi** da isto uradite za sloj koji ste samo prikazali.

## Geodetske tačke iz blokova

Geodetski crteži često nose svoje tačke kao blokove: mali simbol na svakom snimanju, s atributima za broj tačke, opis i kotu. Kad crtež ima reference blokova, dijalog ima odjeljak **Geodetske tačke iz blokova**:

1. Označite blokove za uzimanje (tabela kaže koliko referenci ima svaki, na kojim slojevima i koje atribute), ili označite slojeve da uzmete svaku referencu bloka na njima.
2. Izaberite odakle dolaze **broj**, **opis** i **kota** svake tačke: iz atributa, iz imena bloka ili sloja, iz sljedećih slobodnih brojeva, ili iz Z tačke umetanja. CivilCraft počinje s vjerovatnim atributima (PT, DESC, ELEV i slični), a kotu uzima iz atributa samo kad su blokovi na nuli.
3. Odznačite slojeve linija ako želite samo tačke, zatim kliknite {{ui:Dodaj}}.

Svaka referenca postaje jednom geodetskom tačkom na svojoj tački umetanja. Računaju se samo reference postavljene u prostoru modela; blokovi ugniježđeni unutar drugih blokova se ne računaju. Brojevi koji su već u projektu, ili koji su dvaput upotrijebljeni u crtežu, dobijaju nove brojeve nakon najvećeg, a atribut kote koji nije broj ostavlja tu tačku bez kote; statusna linija broji oba. Crtež se nikad ne mijenja, a svaka tačka pamti svoj blok: njena Svojstva pokazuju **Iz bloka** s blokom, slojem i oznakom (handle). Dodavanje tačaka je jedan korak, pa {{key:Mod+Z}} ih sve uklanja.

## Kote napisane tekstom, i provjera

Kote napisane kao tekst (ili u atributu bloka koji nije blok geodetske tačke) nisu linije. Odjeljak **Geodetske kote i provjera** ih može uzeti kao geodetske tačke, i navodi šta izgleda pogrešno u crtežu: jedinice, koordinatni sistem, udaljenost od nule, ravne izohipse, neobične kote, dvostruke tačke. Pogledajte [Provjera geodetskog crteža pri uvozu](topic:survey-check).

## Kako se crtež čita

- Lukovi, krugovi, elipse, zaobljeni segmenti polilinije i splajnovi postaju kratki pravi komadi (najviše na svakih 5°).
- Reference blokova se crtaju tamo gdje su postavljene, uključujući i ugniježđene blokove; ono što blok ima na sloju 0 uzima sloj reference.
- Objekti nacrtani u drugoj ravni (drugačiji smjer ekstruzije) postavljaju se u svjetske koordinate.
- Svaki objekat dobija tri polja: LAYER, TYPE (vrsta objekta) i ELEV (njegova kota kad sve njegove tačke dijele jednu).
- Koordinate se uzimaju kako jesu: crtež mora koristiti iste koordinate kao projekat (na primjer, istu zonu State Plane). Povezani crteži (xref) se ne otvaraju: otvorite ih zasebno.

:::tip
Crtež izohipsi daje najbolju površ uz nekoliko kota tačaka na vrhovima brda i u udubljenjima, gdje izohipse same ostavljaju ravne trouglove. Dodajte ih kao geodetske tačke, ili iz sloja tačaka u crtežu.
:::
