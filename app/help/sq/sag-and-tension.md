---
title: Shtrirja dhe tensioni
summary: Rastet tuaja të ngarkesës (temperatura, era, akulli) dhe kufijtë e tensionit, si llogarit CivilCraft tensionin e çdo seksioni, dhe tabelat e shtrirjes.
keywords: shtrirje, tension, rast ngarkese, temperaturë, erë, akull, akull asimetrik, shtrirje mbizotëruese, shtrirje ekuivalente, ndryshim gjendjeje, katenari, tabelë shtrirjeje, forcë thyerjeje, stres i përditshëm
from: f8876c35
---

## Rastet e ngarkesës dhe kufijtë

{{ui:More}} › {{ui:Load cases and limits…}} redakton rregullat që ndjek çdo linjë në projekt.

- **Load cases**: një temperaturë, një presion ere mbi përçuesin (Pa) dhe akull radial (mm, me densitetin e tij). Rasti i parë është referenca.
- **Tension limits**: një pjesë e forcës së thyerjes së përçuesit, mbi tensionin horizontal ose mbi tensionin më të madh në një mbështetëse, në një rast ngarkese. Ose jepni vetë tensionin horizontal.
- **Clearances**: largësia që përçuesi mban mbi tokë, rrugë, ndërtesë e kështu me radhë. Shtoni, riemërtoni dhe hiqni: janë tuajat. Më poshtë, zgjidhni rregullat për **Landscape plants under a line**, **Landscape walls under a line** dhe **Underground crossings**.
- **Cases the checks use**: cili rast jep shtrirjen më të madhe (të nxehtë), lëvizjen e izolatorit (erë), akullin dhe akullin në një anë të një mbështetjeje.
- **Factors**: faktori i hapësirës së fazave k, lëvizja më e madhe e izolatorit, një faktor mbi ngarkesat e mbështetjeve dhe lidhjeve, këndet e kthesës që bëjnë mbështetëse këndore dhe fundore, mbulesa minimale mbi kabllot e varrosura, dhe rënia më e madhe e tensionit.

## Paketat: rregulla dhe bibliotekë për një vend

Asnjë rregull vendi nuk është i ndërtuar brenda CivilCraft. Një **paketë** mban një grup rregullash dhe një bibliotekë së bashku në një skedar (`.cclinepack.json`), për një vend, një operator rrjeti ose një kompani:

- **Ruaj si paketë…** te {{ui:Load cases and limits…}} shkruan grupin e rregullave të shfaqur dhe bibliotekën tuaj (ose, nëse bibliotekat tuaja janë ende bosh, zërat që përdor ky projekt). Shkruani **Country or region** së pari.
- **Hap një grup rregullash ose paketë…** lexon një paketë, një skedar rregullash ose një skedar biblioteke. Rregullat e një pakete shfaqen në dialog (klikoni **Apply** për t'i përdorur), dhe zërat e saj shkojnë në bibliotekën tuaj.
- Paketat që të tjerët ndajnë listohen në faqen e shtesave nën **Paketat e linjave elektrike**. Dy paketa shembull tregojnë formatin; nuk janë rregullat e ndonjë vendi.

Çdo paketë kontrollohet kur hapet, si çdo skedar. Kontrolloni çdo vlerë kundrejt standardit që zbatohet përpara se të ndërtohet diçka.

Dy grupe shembull rregullash janë aty për t'u nisur: **Example: cold climate** dhe **Example: mild climate**. Numrat e tyre nuk vijnë nga asnjë standard: vendosni vlerat që jep standardi juaj. {{ui:Save rules}} dhe {{ui:Open rules…}} ndajnë një grup rregullash si skedar.

## Si llogaritet tensioni

Për çdo seksion midis mbështetëseve fundore:

1. **Shtrirja mbizotëruese** është √(ΣL³ ÷ ΣL) e shtrirjeve të tij.
2. Çdo kufi kthehet në një tension horizontal në rastin e referencës përmes **ekuacionit të ndryshimit të gjendjes** mbi shtrirjen mbizotëruese: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Ai më kufizuesi cakton tensionin.
3. Tensioni i çdo rasti ngarkese del nga ai, dhe forma e çdo shtrirjeje është **katenari** i saktë që kalon nëpër dy pikat e saj të lidhjes (përfshi shtrirjet në pjerrësi): ulja nga kordha, gjatësia dhe tensioni në çdo skaj.

Ngarkesa për metër në një rast: pesha plus akulli (sipërfaqja e akullit × densiteti × g) vertikalisht; presioni i erës × diametri i mbuluar me akull horizontalisht.

## Tabelat e shtrirjes

{{ui:More}} › {{ui:Stringing tables…}} liston, për çdo seksion, tensionin horizontal dhe ulien e çdo shtrirjeje në çdo temperaturë të grupit të rregullave (nga −5 °C deri në 40 °C, me hap 5 °C për të filluar), në ajër të qetë. Ruajini, dhe tabelën e mbështetëseve, si CSV.

Nuk llogariten: zvarritja e përçuesit me vitet, dhe zgjatja e një përçuesi të ri. Shtojini ato përmes temperaturave në të cilat e shtrini.
