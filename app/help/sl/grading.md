---
title: Izravnava gradbene ploščadi
summary: Narišite ravno ploščad, nastavite njeno višino ter rezna in nasipna nagiba, naj CivilCraft določi črto preseka z obstoječim terenom in jo doda predvidenemu površju.
keywords: oporni zid, oporni zidovi, navpična stran, zid namesto brežine, nagib na stran, nasip, izravnava, ploščad, gradbena ploščad, črta preseka, značilna črta, skupina izravnave, rezni nagib, nasipni nagib, končna kota, predvideno površje, izravnava terena
from: 482319a6
---

Ploščad je ravna površina na eni višini. Od njenega roba CivilCraft izravna navzven po vašem reznem nagibu, kjer je teren višji od ploščadi, in po nasipnem nagibu, kjer je nižji, dokler se nagib ne srečata z obstoječim terenom. Ta črta srečanja je črta preseka (daylight line). Ploščad in njeni nagibi nadomestijo obstoječi teren znotraj črte preseka in tvorijo predvideno površje.

## Narišite ploščad

Potrebujete najprej površje obstoječega terena.

1. Pritisnite {{key:G}} ali kliknite {{ui:Ploščad}} v skupini **Zasnova**.
   Namig pravi: „Ploščad: kliknite njene vogale. Enter ali dvojni klik konča, Backspace odstrani zadnjega, Esc prekliče.“
2. Kliknite vogale ploščadi v zaporedju, v katerem koli smeri. Moder obris sledi kazalcu.
3. Za zadnjim vogalom pritisnite {{key:Enter}} (najmanj tri).
   Ploščad je narisana in izbrana. Začne na višini terena na njeni sredini, zaokroženi na 0.1, z reznim nagibom 2 : 1 in nasipnim nagibom 3 : 1. Vrstica stanja pove na primer: „Ploščad 1 na višini 254.3 (teren na sredini), rez 2:1, nasip 3:1. Spremenite jih v Lastnostih.“

:::warning
Zaključite s {{key:Enter}}. Dvojni klik prav tako konča, vendar v tej različici odstrani vogal, na katerem ste dvakrat kliknili. Kliknite zadnji vogal enkrat, nato pritisnite {{key:Enter}}.
:::

Obris ploščadi ne sme sam sebe sekati („Obris ploščadi seka sam sebe.“).

## Nastavite višino in nagibe

Ko je ploščad izbrana, desno podokno prikaže **Ploščad**:

1. **Ime**.
2. **Višina**: ravna višina ploščadi.
3. **Rezni nagib** in **Nasipni nagib**, kot H:V (2 pomeni 2 : 1). Oba morata biti večja od 0.
4. **Površina ploščadi** in **Vogali** sta prikazana za informacijo.

Pritisnite {{key:Enter}} po vsaki vrednosti. Črta preseka, predvideno površje in prostornine se takoj posodobijo.

Pod polji piše na primer: „Črta preseka: 48 črt nagiba (20 v rezu, 28 v nasipu), najbolj oddaljena 31.20 ft ven.“ Načrt prikaže črto preseka in črte nagibov v magenta barvi.

## Kako se določi črta preseka

- Črte nagibov izhajajo iz vsakega roba pravokotno nanj, približno vsako dvajsetino velikosti ploščadi.
- Pri zunanjih vogalih se razprejo na vsakih 10°, tako da nagib obide vogal.
- Pri notranjih vogalih ena črta teče po simetrali, kjer se srečata nagiba z obeh robov.
- Vsaka črta se dvigne po reznem nagibu ali spusti po nasipnem nagibu, dokler ne doseže terena.

## Nagibi po straneh in oporni zidovi

Pod **Stranice in oporni zidovi** v Lastnostih ploščadi, platoja ali nasipa lahko vsako stran izravnate na svoj način. Stran 1 teče od prvega vogala, ki ste ga kliknili, do drugega, stran 2 od drugega do tretjega itd.

- **Vse strani**: **Nagnjeno** uporabi zgornja rezna in nasipna nagiba na vsaki strani; **Navpično: oporni zidovi** postavi zid na vsako stran.
- Po strani: **Nagibi zgoraj**, **Lastni nagibi** (vpišete rezni in nasipni nagib za to stran) ali **Navpično (oporni zid)**.
- Nagib vpišete kot `3` ali `3:1` (vodoravno proti 1 navpično), `33%` ali `18.4°`; prikazan je kot H:1. Lastna polja ploščadi **Rezni nagib** in **Nasipni nagib** sprejmejo enako.
- Navpična stran nima nasipa: oporni zid teče vzdolž roba, od ploščadi navzdol do obstoječega terena (v nasipu) ali od terena navzdol do ploščadi (v rezu). **Debelina zidu** (na začetku 0.3 m ali 1 ft) je, za koliko se teren stopi od roba ploščadi do obstoječega terena. Prostornine reza in nasipa izpustijo nasip, ki ga ta stran ne potrebuje več.
- Kjer zid sreča nagnjeno stran, se nagib ovije okoli konca zidu; dva zidova se srečata v zaporu (miter).
- Pod polji: dolžina zidov, izpostavljena ploskev (višina × dolžina), najvišja in povprečna višina.

Načrt nariše zunanjo ploskev vsakega zidu s kratkimi zarezami čez njo ter njegovo višino na obeh koncih in na najvišjem mestu (na sloju opornih zidov, ki gre tudi v DXF in DWG). 3D-pogled prikaže zidove kot telesa (Prikaz › Oporni zidovi), izvozi GLB, OBJ in USD pa jih vključujejo. Prerezi čez rob pokažejo stopnico.

**Opozorila** (v Lastnostih in v podoknu Težave): zid, višji od **Opozori nad višino zidu** (na začetku 1.0 m ali 3.3 ft), „lahko potrebuje inženirski zid ali dovoljenje; preverite lokalne predpise“, in ko vpišete **Najstrmejši nagib, ki ga tla prenesejo**, vsaka stran, katere rezni ali nasipni nagib je strmejši od tega. To so opozorila: izravnava se kljub temu zgradi. Vsaka sprememba je en korak za {{key:Mod+Z}}.

## Premikanje vogalov

Izberite ploščad in povlecite kvadraten prijemalnik na vogalu. Vsak vlek je en korak razveljavitve. Dodajanje ali odstranjevanje vogalov še ni na voljo: izbrišite ploščad in jo narišite znova.

## Kadar ne izravna

Rdeče polje pod **Zemeljska dela** navede ploščad in težavo:

| Sporočilo | Kaj storite |
|---|---|
| „3 črte nagiba zapustijo površje, preden se srečajo z njim: ploščad je preblizu roba površja ali previsoko/prenizko.“ | Premaknite ploščad od roba površja ali približajte njeno višino terenu. |
| „Črta preseka seka sama sebe (črte nagibov z različnih strani ploščadi trčijo druga v drugo). Spremenite obliko ploščadi ali nagibe.“ | Značilno pri ozkih ali L-oblikih ploščadi v globokem rezu ali visokem nasipu. Ploščad razširite, razliko zmanjšajte ali nagibe naredite strmejše. |
| „Obris ploščadi seka sam sebe.“ | Vogale ponovno narišite v zaporedju okoli ploščadi. |

Ploščad s težavo je izpuščena iz predvidenega površja in prostornin, dokler ni popravljena.

## Poglejte rezultat

1. Pod **Prikaz** nastavite **Površje** na {{ui:Predvideno (izravnano)}}. Plastnice zdaj tečejo ravno čez ploščad in sledijo nagibom do črte preseka.
2. Premaknite kazalec nad ploščad: vrstica stanja prikaže višine **Tla** in **Izravnano**.
3. Preberite rez in nasip pod **Zemeljska dela**; glejte [Prostornine zemeljskih del](topic:volumes).

Ploščade se izravnajo za koridorji, v vrstnem redu, v katerem so bile narisane. Kasnejša ploščad nadomesti vse, kar je bilo prej znotraj njene lastne črte preseka.

## Izbrišite ploščad

Izberite jo in pritisnite {{key:Delete}} (na Macu Fn in delete) ali kliknite {{ui:Izbriši}}.

## Še ni izdelano

Ploščadi so ravne: nagnjene ploščadi, značilne črte s spreminjajočim se naklonom, berme in izravnava do razdalje ali ciljne višine še niso na voljo. Glejte [Še ni izdelano](topic:not-built-yet).
