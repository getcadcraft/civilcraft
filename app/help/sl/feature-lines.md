---
title: Karakteristične črte
summary: Narišite 3D črte, ki jih oblikujete oglišče za ogliščem, naredite stopničaste odmike od njih in jih uporabite kot prelomnice terena ali kot nagnjene platoje v zasnovi.
keywords: lok, krivulja, polmer, 3D lok, vijačnica, ukrivljen robnik, prekrivanje naklona, prekrivanje kote, puščice naklona, karakteristična črta, naklon, kota, stopničasti odmik, odmik, prelomnica, robnik, jarek, bankina, nagnjen plato, izkop in nasip, zemeljska dela, 3D polilinija
from: d55b25fb
---

Karakteristična črta je črta z koto v vsakem oglišču: robnik, črta toka v jarku, vrh bankine, rob nagnjenega platoja. Kote nastavite s številko ali z naklonom, kopirate jo vstran s korakom navzgor ali navzdol ter izberete, kaj naj površja naredijo z njo.

## Narišite eno

1. Izberite **Površje** › {{ui:Več}} › {{ui:Karakteristična črta}} ali pritisnite {{key:L}}.
2. Kliknite njena oglišča v tlorisu. Klik na geodetsko točko prevzame položaj in koto točke; kjerkoli drugje oglišče prevzame kote obstoječega terena na tistem mestu.
3. Pritisnite {{key:Enter}}, da končate odprto črto, ali znova kliknite prvo oglišče, da jo zaprete.

Nova črta je izbrana in začne kot prelomnica obstoječega terena, ležeča na terenu.

## Loki

Odsek je lahko lok v tlorisu, katerega konca sta na različnih kotah: zavijanje robnika, ukrivljen jarek, rampa, ki zavija. Njen naklon teče enakomerno vzdolž loka, dolžina pa se meri vzdolž krivulje.

- **Med risanjem:** pritisnite {{key:C}} (na zaslonu na dotik {{ui:Lok}} v vrstici nad tlorisom), da vklopite loke. Za ogliščem kliknite točko na krivulji, nato kliknite, kje lok konča. Za ravne odseke ponovno pritisnite {{key:C}}. {{key:Backspace}} najprej odstrani točko na krivulji.
- **Pozneje:** v **Lastnostih** vnesite polmer in smer zavijanja v polje **Lok** oglišča, na primer `50 L` ali `50 R` (levo ali desno, ko hodite po črti), in pritisnite {{key:Enter}}. Če polje izpraznite, je odsek spet raven. Polmer, manjši od polovice odseka, je zavrnjen.

Izbrana črta prikaže polmer vsakega loka ob njegovem naklonu. **Dolžina** je vzdolž lokov v tlorisu; **3D dolžina** šteje tudi dvig in spust. Stopničasti odmiki ohranijo loke: lok na zunanji strani ovinka se povečuje, na notranji se krči, odmik čez središče loka pa je zavrnjen.

Površja, 3D pogled ter DXF in DWG vsak lok vzamejo kot kratke ravne odseke, ki ostanejo znotraj 0.01 od krivulje. LandXML jih ohrani kot loke (glejte spodaj **Loki v drugih datotekah**).

## Nastavite kote in naklone

**Lastnosti** navajajo oglišča z razdaljo vzdolž črte, njihovo **Koto** in **Naklon do naslednjega** (v odstotkih). Vnesite eno od obeh in pritisnite {{key:Enter}}:

- Kota premakne samo to oglišče.
- Naklon nastavi koto na drugem koncu svojega odseka; oglišča za njim ostanejo na mestu, zato se naklon naslednjega odseka spremeni.

Prav tako v **Lastnostih**:

| Dejanje | Kaj naredi |
|---|---|
| **Dvigni ali spusti vse za** | Vsakemu oglišču doda višino, ki jo vnesete. |
| {{ui:Višine iz terena}} | Vsako oglišče spet postavi na obstoječi teren (oglišča zunaj površja ohranijo svojo koto in so navedena). |
| {{ui:En naklon, od prvega do zadnjega}} | Ohrani prvo in zadnjo koto ter postavi vmesna oglišča na en enakomeren naklon. |

Izbrana črta v tlorisu prikaže svoje kote v ogliščih in svoje naklone vzdolž odsekov. Oglišče premaknete tako, da ga z {{ui:Izberi}} povlečete; njegova kota ostane.

## Stopničasti odmiki

Pod **Stopničasti odmik** vnesite **Razdaljo** (pozitivno desno od smeri črte, negativno levo), nato višino (za koliko navzgor ali navzdol) ali naklon v odstotkih, in kliknite {{ui:Naredi odmaknjeno črto}}. Kopija je nova karakteristična črta: na primer hrbet robnika 0.5 ft vstran in 0.5 ft više ali rob jarka 6 ft ven pri 2 %. Razdalja, ki bi kopijo prepognila čez samo sebe na ostrem ovinku, je zavrnjena.

## Nakloni in kote na zaslonu

Pritisnite {{key:E}} ali označite **Nakloni in kote na karakterističnih črtah** pod **Prikaz**, da vidite naklon vsake karakteristične črte vzdolž vsakega odseka (z majhno puščico, ki kaže navzdol) in njeno koto v ogliščih. Prikazani so samo na zaslonu: v risbo se ne doda nič, PDF, DXF in DWG ostanejo, kakršni so. Kratki odseki in gosta oglišča brez oznak, dokler ne povečate. Izbrana črta vedno prikaže svoje naklone in kote.

## V pogledu profila

Karakteristična črta, ki seka traso, se prikaže v pogledu profila te trase, z imenom in koto na križišču; prikažejo se lahko tudi črte, ki potekajo ob njej. Glejte [Zasnova vzdolžnega profila](topic:profile).

## Kaj naredijo površja z njo

Izberite **Uporaba**:

| Uporaba | Kaj se zgodi |
|---|---|
| Prelomnica obstoječega terena | Obstoječi teren poteka skozi črto na njenih kotah, kot narisana prelomnica. |
| Izravnano v zasnovo | **Zaprta** črta postane nagnjen plato: načrtovano površje znotraj nje je izravnano do njenega roba. Vklopite **Izkop in nasip do terena**, da od njenega roba do terena potekajo brežine izkopa in nasipa (vodoravno proti 1 navpično), kot pri platoju; vsaka brežina se tam začne na lastni koti roba. |
| Samo narisano | Ostane v tlorisu in gre v DXF, DWG in PDF (sloj C-GRAD-FEAT, 3D polilinije), vendar jo površja ignorirajo. |

Prostornine, prerezi in 3D pogled vključujejo karakteristične črte, izravnane v zasnovo, kot platoje. Vsaka sprememba je en korak: {{key:Mod+Z}} jo razveljavi.

## Deljenje črt z ekipo

V risbi, odprti iz vaših datotek v oblaku v CadCraft Studio, pri ekipnem načrtu ima **Lastnosti** projekta (nič izbrano) razdelek **Ekipa** z {{ui:Ekipne črte…}}: črte, ki jih je vaša ekipa delila, vsaka s svojo revizijo, brez predhodnega izbora karakteristične črte. Izberite črto, da jo delite, objavite novo revizijo, prevzamete ekipno ali prenehate deliti. Zunaj te nastavitve razdelek pove, kaj potrebuje.

## Loki v drugih datotekah

| Datoteka | Kaj se zgodi s karakteristično črto z loki |
|---|---|
| Projekt CivilCraft | Ohrani se natančno. |
| LandXML | Zapiše se kot načrtovani element črt in lokov z njihovimi kotami ter se prebere nazaj z lokoma. Karakteristična črta iz drugega programa pride kot **Samo narisano**: izberite njeno **Uporabo**, da jo postavite v površje. |
| DWG in DXF | 3D polilinija ne more imeti loka, zato se črta zapiše kot kratki odseki znotraj 0.01 od vsakega loka. CivilCraft v risbi tudi zabeleži, kateri odseki so bili loki: ko odprete risbo kot črte, {{ui:Karakteristične črte}} vrne črte nazaj kot karakteristične črte z lokoma. Drugi programi vidijo navadno 3D polilinijo. |
