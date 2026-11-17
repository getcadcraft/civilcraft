---
title: Teken gebouemassas op 'n terrein
summary: Teken 'n gebouemassa op 'n erf, gee dit verdiepings en 'n verdiepinghoogte, sien sy bruto vloeroppervlakte, kies hoe dit op hellende grond sit, stoot en trek sy hoogte in 3D, en stuur dit na BimCraft of stoor dit as 'n IFC-lêer.
keywords: massa, massering, gebouemassa, volume, voetspoor, verdiepings, verdiepinghoogte, bruto vloeroppervlakte, GFA, helling, sokkel, afgrawing en opvulling, stoot trek, 3D, terreinstudie, vroeë ontwerp, IFC, ontwikkel, BimCraft, A-MASS
from: e5a67c16
---

'n Gebouemassa is 'n voetspoor, 'n getal verdiepings en 'n verdiepinghoogte: die vroeë vraag "hoeveel gebou pas hier, en wat doen dit met die grond". Massas sit op die plan met hulle naam, verdiepingtelling en bruto vloeroppervlakte, gaan in die PDF-plot en die DWG- en DXF-uitvoere op die lae `A-MASS` en `A-MASS-TEXT`, en word in die projeklêer gestoor.

## Teken 'n massa

1. In **Eienskappe**, onder **Gebouemassas**, klik **Teken 'n massa**. (Dit is ook in die nutsbalk se **Meer**-kieslys langs **Oppervlak**.)
2. Klik die hoeke van die voetspoor. 'n Klik naby 'n erfhoek of 'n opmetingspunt neem daardie punt se presiese plek.
3. Klik die eerste hoek weer, of druk {{key:Enter}}, om te voltooi. {{key:Backspace}} neem die laaste hoek terug; {{key:Esc}} stop.

'n Nuwe massa het drie verdiepings en 'n verdiepinghoogte van 12 ft (3.6 m), en behoort aan die erf waarin sy middel val.

## Verdiepings, hoogte en oppervlakte

Klik 'n massa om sy **Naam**, **Gebruik**, **Verdiepings**, **Verdiepinghoogte** en **Erf** te verander. **Hoogte** is verdiepings maal verdiepinghoogte: tik 'n hoogte en die verdiepingtelling word die naaste hele getal verdiepings (nooit minder as een nie). **Voetspoor** en **Bruto vloeroppervlakte** (voetspoor maal verdiepings) word vir jou uitgewerk.

## Op hellende grond

Die grond onder 'n massa word van die oppervlak gelees: bestaande grond, of die gegradeerde grond waar jy **Voorgestelde grond (gegradeer)** gekies het. **Op hellende grond** sê waar die grondverdieping gaan:

- **Trapsgewys**: by die gemiddelde grond onder die voetspoor. Die lae kant word tot daar opgevul en die hoë kant afgegrawe, en die twee kom naby aan balans.
- **Sokkel**: by die hoogste grond. 'n Soliede basis vul die lae kant.
- **Afgrawing**: by die laagste grond. Die hoë kant word in die heuwel weggegrawe.

Eienskappe wys die reeks grond onder die massa, die **Grondverdiepingvlak**, en die volume opvulling en afgrawing tussen die grond en daardie vlak. 'n Plek van die voetspoor wat buite die oppervlak is, word weggelaat, en Eienskappe sê hoeveel.

## In die 3D-aansig

Massas word in die 3D-terreinaansig geteken, met 'n lyn rondom elke verdieping en hulle name oor die dak. **Wys** het 'n merkblokkie vir **Gebouemassas**. Klik een om dit te kies. Met 'n massa gekies:

- sleep sy dak op of af om dit een verdieping op 'n slag te stoot of te trek, of druk {{key:PageUp}} en {{key:PageDown}};
- die hele skuif is een ontdoenstap.

Die straataansig van **Ry** sien die massas ook, en **Son** werp hulle skaduwees op die grond.

## Stuur dit aan

- **Massas as IFC** stoor elke massa as 'n IFC4-lêer: 'n terrein, 'n gebou met sy verdiepings, en die massa as 'n geboue-element met sy getalle in die eiendomstel `CadCraft_SiteMass`. Met 'n koördinaatstelsel op die projek word die lêer op die kaart geplaas en dra dit die terrein se breedte- en lengtegraad; sonder een sê dit niks oor waar dit is nie.
- **Ontwikkel in BimCraft** open BimCraft in 'n nuwe oortjie met die massas. Daar wys die kies van 'n massa sy getalle en **Ontwikkel hierdie massa**, wat mure op elke vlak en 'n vloer onder die gebou uit die voetspoor bou, in een ontdoenstap. Niks word opgelaai nie: die lêer gaan tussen die twee oortjies van hierdie blaaier.

Sien ook **Soneringsbeperkings** en **Sonure**.
