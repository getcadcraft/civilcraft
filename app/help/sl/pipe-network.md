---
title: Zasnujte mrežo gravitacijskih cevi
summary: Narišite padavinske ali fekalne cevne odseke objekt za objektom, nastavite pravila za naklon, zasutje in padec, naj CivilCraft nastavi dna cevi, ter odpravite težave, ki jih navede.
keywords: gradnik objektov, vrsta objekta, pravokoten objekt, lovilnik, okvir, pokrov, debelina stene, element knjižnice, mreža cevi, padavinsko, fekalno, kanalizacija, objekti, jaški, vtoki, dna cevi, zasutje, naklon, padec, rob, usedalnik, gravitacijske cevi
from: 10a3c14d
---

Projekt ima eno mrežo gravitacijskih cevi, padavinsko ali fekalno. Sestavljajo jo objekti (jaški, vtoki) in ravne cevi med njimi. Tok teče v smeri, v kateri rišete. CivilCraft preveri vsako cev in objekt glede na tri pravila, ki jih nastavite, in lahko nastavi vsa dna cevi iz teh pravil.

## Narišite odsek

Cevi lahko rišete brez površja, vendar robovi, zasutje in samodejna dna cevi površje potrebujejo.

1. Pritisnite {{key:P}} ali kliknite {{ui:Cevi}} v skupini **Načrtovanje**.
   Namig pravi: „Cevi: kliknite objekte od vrha odseka navzdol (kliknite obstoječega, da se priključite). Enter konča.“
2. Kliknite, kjer gre zgornji objekt. Objekt je postavljen.
3. Kliknite vsak naslednji objekt navzdol po toku. Da se priključite na objekt, ki že obstaja, kliknite nanj: vrstica stanja pravi „Pridruženo: S3.“
4. Pritisnite {{key:Enter}}.
   Cevi so narisane, njihova dna so nastavljena po pravilih, vrstica stanja pa pravi na primer: „Narisanih cevi: 3, dna nastavljena po pravilih: 12; vsa preverjanja so uspešna.“

Novi objekti se imenujejo S1, S2 … s premerom 48 in (1200 mm). Nove cevi se imenujejo P1, P2 … s premerom 12 in (300 mm). Premeri so v palcih v projektu v čevljih in v milimetrih v projektu v metrih.

Končajte s {{key:Enter}}. Dvojni klik tudi deluje, vendar kadar dvakrat kliknete na obstoječ objekt, da odsek tam končate, se priključitev opusti: kliknite ga enkrat, nato pritisnite {{key:Enter}}.

## Nastavite svoja pravila

Ko nič ni izbrano, desno podokno (**Projekt**) ima blok **Mreža cevi**:

| Nastavitev | Začetna vrednost | Pomen |
|---|---|---|
| Vrsta | Padavinsko | {{ui:Padavinsko}} ali {{ui:Fekalna}}; zapisano v LandXML |
| Najmanjši naklon | 0.50% | Vsaka cev mora padati vsaj toliko |
| Najmanjše zasutje | 2 ft (0.6 m) | Od terena do temena cevi, po vsej dolžini cevi |
| Padec v objektih | 0.10 ft (0.03 m) | Dno iztoka mora biti vsaj toliko pod vsakim dnom vtoka |

**Te začetne vrednosti so zgolj zamenjave, ne standard.** Nastavite vrednosti, ki jih zahteva vaša agencija ali projekt. Zasutje merimo od terena do temena (dno plus notranji premer); debelina stene se ne šteje. Kjer so ploščadi ali koridorji zravnani, je zravnana površina teren.

## Naj CivilCraft nastavi dna cevi

- {{ui:Nastavi vsa dna cevi po pravilih}} (v bloku **Mreža cevi**) nastavi vse cevi.
- {{ui:Nastavi njena dna po pravilih}} (z izbrano eno cevjo) nastavi samo to cev.

Po toku vsak odsek na svojem zgornjem objektu začne vsaj na zasutju, pade vsaj za najmanjši naklon, pade vsaj za padec skozi vsak objekt in gre globlje, kjerkoli bi teren ob cevi pustil manj kot najmanjše zasutje. Dna se zaokrožijo navzdol na 0.01, nikoli navzgor. Vrstica stanja pravi „Dna nastavljena: najmanjše zasutje na vrhu vsakega odseka, vsaj najmanjši naklon, vsaj padec v vsakem objektu.“ ali pove, česa ni mogla narediti.

## Urejanje objektov in cevi

Kliknite objekt ali cev z {{ui:Izberi}}, da ju vidite v desnem podoknu.

**Objekt**: **Ime**, **Rob**, **Globina usedalnika**, **Premer**, nato **Uporabljen rob**, **Usedalnik**, **Vzhodna (E)** in **Severna (N)** ter cevi na vstopu in izstopu z njihovimi dnu.

- Pustite **Rob** prazen, da se vzame iz površja; polje nato v sivi barvi prikaže vrednost površja. Vnesite vrednost, da rob fiksirate.
- Premaknite objekt tako, da na tlorisu povlečete njegovo ročico. Njegove cevi sledijo; njihova dna ostanejo, kakršna so bila, zato težave preverite kasneje.

**Vrsta**: izberite eno od vrst objektov v mreži (spodaj) ali brez, za okrogel objekt s svojim premerom.

**Cev**: **Ime**, objekte, med katerimi teče, **Premer**, **Zgornje dno**, **Spodnje dno**, nato **Dolžina**, **Naklon** in **Najmanjše zasutje**.

Po vsaki vrednosti pritisnite {{key:Enter}}.

## Preberite in odpravite težave

Blok **Mreža cevi** navede vsako težavo (največ 40); kliknite eno, da izberete cev ali objekt. Izbrana cev ali objekt navede svoje. Če ni nobene, piše: „Vsaka cev in objekt sta v skladu s pravili.“

| Sporočilo (primeri) | Kaj storiti |
|---|---|
| „P2 teče navzgor (-0.40%).“ ali „… teče vodoravno …“ | Zamenjajte dna ali jih nastavite po pravilih. |
| „P2 pri 0.30% je bolj položna od najmanjših 0.50%.“ | Znižajte spodnje dno ali dvignite zgornje. |
| „P3 ima vzdolž sebe 1.40 zasutja od 35, manj od najmanjših 2.“ | Znižajte cev; nastavite njena dna po pravilih. |
| „V S3 P4 odteka pri 245.20, manj kot 0.1 pod P3, ki prihaja pri 245.25.“ | Znižajte zgornje dno izstopne cevi. |
| „Teme P1 je nad robom S1.“ | Cev je previsoko za objekt. |
| „S2 ima 2 cevi, ki iz njega izstopata; gravitacijska mreža naj ima en izhod iz vsakega objekta.“ | Odstranite eno odhodno cev ali jo narišite v pravo smer. |
| „Cevi tvorijo zanko; tok se mora končati pri iztoku.“ | Odsek je bil narisan nazaj v samega sebe; izbrišite cev. |
| „S5 je zunaj površja in nima kote roba.“ | Vnesite rob ali premaknite objekt na površje. |
| „P6 deloma teče zunaj površja; zasutje tam ni znano.“ | Razširite površje ali sprejmite, da tam zasutje ni preverjeno. |
| „P7 še nima dna.“ | Vnesite jih ali nastavite po pravilih. |

Težavne cevi in objekti so na tlorisu označeni tudi z rdečo.

## Vrste objektov

Vrsta objekta je objekt, zgrajen iz svojih parametrov: jašek, vtok, revizijski jašek ali iztok, **okrogel** (notranji premer) ali **pravokoten** (notranja širina in dolžina), z **debelino stene**, **talno ploščo**, **usedalnikom** pod najnižjo cevjo in **okvirom in pokrovom** (okrogla ali pravokotna odprtina, višina okvirja). Vrste pripadajo mreži, pod **Vrste objektov** v **Lastnostih** projekta.

1. Kliknite {{ui:Nov tip objekta}}. Pogovorno okno med tipkanjem riše objekt na tlorisu in v prerezu.
2. Kliknite {{ui:Dodaj tip}}.
3. Izberite objekt in pod **Vrsta** izberite tip. Prevzame velikost in usedalnik vrste; lasten usedalnik se še vedno lahko spremeni.

Uredite vrsto in vsi objekti te vrste sledijo njenim velikostim. Odstranite vrsto in njeni objekti ostanejo okrogli objekti iste širine. Vsaka sprememba je en korak: {{key:Mod+Z}} jo razveljavi.

Pravokoten objekt se riše na tlorisu, v DXF, DWG in PDF ter v 3D kot pravokotnik z dolžino vzdolž njegove iztočne cevi; cevi se začnejo pri njegovi steni. LandXML ga zapiše kot pravokotni objekt (`RectStruct`) z debelino stene in ga pri branju vrne kot vrste.

### Deljenje vrste prek knjižnice

{{ui:Shrani kot element knjižnice}} zapiše vrsto kot element knjižnice CadCraft (datoteka `.json`): njen simbol na tlorisu, telo v 3D do tipične globine in vse velikosti. Naložite ga v knjižnico, da ga delite. {{ui:Odpri element knjižnice}} prebere tako shranjen objekt nazaj v mrežo in ga pretvori v enote projekta. Elementi knjižnice, ki niso objekti, narejeni v CivilCraft, so zavrnjeni z razlogom.

## Brisanje

Izberite cev in pritisnite {{key:Delete}}, da jo odstranite. Brisanje objekta odstrani tudi cevi, povezane z njim. Na Macu pritisnite Fn in izbriši ali kliknite {{ui:Izbriši}}.

## Še ni izdelano

Pretoki, velikosti cevi in hidravlična črta so v [Odvodnjavanje padavinskih vod](topic:storm-drainage). Katalogi cevi, nekrožne cevi, cevi v pogledu profila, ukrivljene cevi in več kot ena mreža na projekt še niso na voljo. Glejte [Še ni izdelano](topic:not-built-yet).
