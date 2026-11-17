---
title: Izrisovanje vodoravne trase
summary: Narišite trasu po njenih lomnih točkah (PI), nastavite polmere lokov in začetno stacionažo, premaknite lomne točke ter preberite podatke lokov, stacionažo in odmik.
keywords: trasa, ni rešitve, lok ne ustreza, največji polmer, najmanjši polmer, najmanjši projektni polmer, projektna hitrost, prekrivanje, središnica, PI, vodoravni lok, polmer, stacionaža, tangenta, nova trasa, razporeditev trase, PC, PT, odmik stacionaže
from: 8c5df4aa
---

Trasa v CivilCraftu je veriga tangent skozi lomne točke (PI), pri čemer ima vsaka notranja lomna točka, ki ima polmer, krožni lok. Stacionaža se začne pri začetni stacionaži, ki jo izberete. Projekt lahko vsebuje več tras.

## Izris trase

1. Pritisnite {{key:A}} ali kliknite {{ui:Trasa}} v skupini Načrtovanje.
   Namig pravi: „Trasa: kliknite lomne točke po vrsti. Enter ali dvojni klik konča, Backspace odstrani zadnjo, Esc prekliče.“
2. Kliknite prvo lomno točko (začetek trase).
3. Kliknite vsako naslednjo lomno točko po vrsti. Rdeča črta sledi kazalcu in prikazuje dolžino ter smer tangente, ki jo rišete, na primer „212.40 ft  N 63°12'05" E“.
4. Kliknite zadnjo lomno točko (konec trase).
5. Pritisnite {{key:Enter}}.
   Trasa je narisana s stacionažo in je izbrana. Vrstica stanja pove na primer „Trasa 1: 386.36 ft, loki s polmerom 100 ft, kjer ustrezajo. Polmere uredite v Lastnostih; Vzdolžni profil (R) za oblikovanje njenega naklona.“

Med risanjem: {{key:Backspace}} odstrani zadnjo lomno točko, {{key:Esc}} prekliče, povlek po prazni površini pa pomika pogled brez dodajanja lomne točke.

:::warning
Končajte s tipko {{key:Enter}}. Dvojni klik sicer tudi konča, vendar v tej različici odstrani lomno točko, na katero ste dvakrat kliknili. Enkrat kliknite zadnjo lomno točko, nato pritisnite {{key:Enter}}.
:::

Vsaka notranja lomna točka dobi lok s polmerom 100 ft (30 m v projektu z metri) ali največji celi polmer, ki se prilega v polovici vsake tangente, če 100 ft ne ustreza. Zelo ostre lomne točke ali tiste, kjer trasa poteka naravnost, ne dobijo loka.

## Nastavitev polmerov in koordinat

Ko je trasa izbrana, desni panel prikazuje **Trasa**:

1. **Ime** in **Začetna stacionaža**. Stacionažo vpišite kot `10+00` (čevlji) ali `0+500` (metri) ali kot navadno število. Glejte [Enote, stacionaže in zapis števil](topic:units-and-stations).
2. **Dolžina** in **Končna stacionaža** se izračunata samodejno.
3. Tabela **Lomne točke (PI)** navaja **Vzhodno (E)** in **Severno (N)** koordinato vsake lomne točke ter **Polmer** za vsako notranjo lomno točko. Vpišite novo vrednost in pritisnite {{key:Enter}}.
   - Polmer 0 naredi kotno točko brez loka.
   - Prva in zadnja lomna točka nikoli nimata polmera.
   - Majhen x na koncu vrstice odstrani tisto lomno točko (trasa ohrani vsaj dve).
4. Preberite seznam **Loki**: za vsak lok njegove stacionaže PC in PT, polmer R, odklon Δ in smer (levo ali desno), dolžino L, tangento T, zunanjo razdaljo E in tetivo.
5. Vrstica pod loki navaja smer prve tangente.

## Ko lok ne ustreza

Če loki potrebujejo več tangente, kot je je na voljo med njihovimi lomnimi točkami, trasa nima rešitve: ni pravilno narisana, dokler je ne popravite, in je izpuščena iz izvoza LandXML. Rdeče polje v številkah pove, zakaj, in ponudi, kaj bi se prilegalo:

- „Loka pri PI 2 in PI 3 potrebujeta med seboj 240.00 ft tangente (130.00 + 110.00), lomni točki pa sta oddaljeni 180.00 ft.“ — ali, kadar ima lok samo ena od njiju, „Lok pri PI 2 potrebuje 240.00 ft tangente proti PI 1 …“.
- Gumb za vsako lomno točko nastavi **največji polmer, ki se prilega**, pri čemer drugi lok ostane nespremenjen (prilegati se mora tudi drugi tangenti lomne točke). Kjer imata obe lomni točki lok, **Oba** sorazmerno zmanjša oba polmera, da se ravno stakneta.
- Kadar je sam en lok daljši od tangente, okno pove, da pri drugi lomni točki noben lok ne more ustrezati, dokler je tako velik.
- Lomna točka, ki se obrne naravnost nazaj, ne more dobiti loka; okno ponudi **Brez loka pri PI n**.

Vsak gumb je en korak: {{key:Mod+Z}} vrne polmere nazaj. Ponujeni polmeri so zaokroženi navzdol na 0.01, da se vedno prilegajo.

### Najmanjši projektni polmer

Vpišite **Najmanjši projektni polmer** (na primer iz vaše projektne hitrosti), da bo vsak lok preverjen glede nanj; če ga ne želite, polje pustite prazno. Lok, ki je manjši od njega, je naveden z gumbom za **najmanjši polmer, ki izpolnjuje najmanjšo mejo**, če ta polmer ustreza. Če ne ustreza, okno to pove in navede največji polmer, ki ga tangente dopuščajo, da lahko premaknete lomno točko ali znižate najmanjšo vrednost.

## Premikanje lomnih točk na načrtu

1. Ko je aktivno orodje {{ui:Izberi}}, kliknite trasu, da jo izberete. Na njenih lomnih točkah se prikažejo kvadratne ročice.
2. Povlecite ročico. Trasa, njena stacionaža, profil in koridor sledijo.
3. Spustite. Premik je en korak za razveljavitev.

Dodajanje lomne točke med dve obstoječi še ni na voljo: odstranite trasu in jo narišite znova ali vpišite nove koordinate za obstoječe lomne točke.

## Branje stacionaže in odmika

Premaknite kazalec nad načrt. Vrstica stanja prikaže najbližjo trasu (ali izbrano) s stacionažo in odmikom, **L** ali **R**, gledano v smeri naraščajoče stacionaže, na primer „Trasa 1: stac. 2+15.30, odmik 18.42 R“. Če je zunaj katerega od koncev, doda „(zunaj konca)“.

## Kaj je narisano

Na načrtu, v DXF in v PDF: središnica (tangente kot črte, loki kot pravi loki), zareza na vsakih 50 ft (20 m), daljša zareza in oznaka stacionaže na vsakih 100 enot ter oznake PC in PT z njunima stacionažama.

## Izbris trase

Izberite jo in pritisnite {{key:Delete}} ali kliknite {{ui:Izbriši}} na orodni vrstici ali na dnu desnega panela. Z njo gresta tudi njen profil in koridor. {{key:Mod+Z}} jo vrne.

:::mac
Na tipkovnici Mac tipka z oznako **delete** v brskalniku deluje kot Backspace in ne izbriše izbora. Pritisnite {{key:Delete}} (Fn in delete) ali uporabite gumb {{ui:Izbriši}}.
:::

## Naprej

- [Oblikujte vertikalni profil](topic:profile).

## Projektna hitrost in razred

V **Lastnostih** trase se **Projektna hitrost** (km/h ali mph) in **Projektni razred** hranita pri trasi, shranjujeta se v projektu in zapišeta v IFC (Pset_RoadDesignCriteriaCommon). CivilCraft nima tabele, ki bi povezovala hitrost z najmanjšim polmerom, zato se iz njiju nič ne preverja: **najmanjši polmer** nastavite glede na vaš lastni projektni standard.

## Spirale

Lok lahko na vsakem koncu ima klotoidno spiralo: tangenta, spirala, lok, spirala, tangenta. V tabelo lomnih točk za lomno točko s polmerom vpišite dolžino pri **Spirala na vstopu** in **Spirala na izstopu**. Lomna točka ostane, kjer je; lok se pomakne notri, da naredi prostor, zato se razdalja tangente poveča za odmik spirale. Dolžini se lahko razlikujeta, lomna točka z le eno dolžino pa dobi spiralo samo na tistem koncu.

Seznam lokov nato bere TS, SC, CS in ST (tangenta na spiralo, spirala na lok, lok na spiralo, spirala na tangento) s kotom spirale θs, razdaljami tangent in zunanjo razdaljo. Stacionaže tečejo vzdolž spiral kot povsod drugje. Spirale, ki skupaj zavijejo bolj kot lok, so zavrnjene z navedbo lomne točke; spirala, daljša od dovoljene tangente, pomeni prekrivanje, kot pri vsakem loku. Nadvišanje uporablja spiralo kot svoj iztek (glejte [Koridor](topic:corridor)).
