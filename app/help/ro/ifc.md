---
title: Export și import IFC
summary: Salvați întregul proiect într-un singur fișier IFC în IFC 4.3, IFC4 sau IFC2x3 (aliniamente, drumuri, terasamente, suprafețe, ziduri, conducte) și deschideți fișiere IFC pentru aliniamentele și suprafețele lor.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, aliniament, ifcalignment, drum, ifcroad, terasamente, tin, livrabil, achiziții, export ifc, import ifc
from: 6b998bcf
---

IFC este formatul deschis de schimb pe care mulți clienți publici îl cer ca livrabil. CivilCraft scrie întregul proiect într-un singur fișier IFC și citește înapoi aliniamentele și suprafețele din fișiere IFC.

## Export

1. Faceți clic pe {{ui:IFC}} din grupul **Export** (în stilurile panglicii: {{ui:Ieșire}} › {{ui:Export}} › {{ui:IFC}}).
2. Alegeți schema. **IFC 4.3 ADD2** este prima și cea implicită: este ediția cu aliniamente, drumuri și terasamente. Alegeți IFC4 sau IFC2x3 doar când programul destinatarului nu poate citi 4.3.
3. Caseta de dialog spune ce va conține fișierul și ce lasă afară schema aleasă. Faceți clic pe {{ui:Export IFC}}.
   Fișierul se descarcă drept "*numele proiectului*-ifc4x3.ifc", "-ifc4.ifc" sau "-ifc2x3.ifc". CivilCraft reține schema aleasă ultima dată.

## Ce conține fiecare schemă

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Aliniamente | IfcAlignment cu traseele sale orizontale (linii, arce de cerc, spirale clotoide) și verticale (pante, curbe parabolice), curbele lor (IfcCompositeCurve, IfcGradientCurve), pichetul de start și evenimentele de dever | O polilinie 3D pe un element civil | O polilinie 3D pe un proxy |
| Coridoare | IfcRoad cu părți de drum; benzi, acostamente, rigole și trotuare ca IfcPavement, borduri ca IfcKerb, fâșii plantate; fiecare strat al îmbrăcăminții ca IfcCourse cu grosimea, materialul și volumul său; taluzele laterale ca IfcEarthworksCut și IfcEarthworksFill cu volumele de debleu și rambleu; viteza de proiectare și clasa | Elemente civile denumite după ce sunt, grupate pe drum | Proxy-uri, grupate pe drum |
| Suprafețe | IfcGeographicElement TERRAIN cu o rețea triangulată neregulată | Seturi de fețe triangulate | Modele de suprafață pe fețe (fișiere mai mari) |
| Platforme și ziduri | Partea de sus a platformei, pantele ei ca terasamente, zidurile de sprijin ca IfcWall RETAININGWALL | Identic, zidul ca tip de perete definit de utilizator | Identic, tipul zidului în ObjectType |
| Rețele de conducte | IfcPipeSegment și IfcDistributionChamberElement într-un IfcDistributionSystem | Identic | IfcFlowSegment și camere într-un IfcSystem |
| Georeferențiere | IfcProjectedCRS și IfcMapConversion | Identic | ePSet_ProjectedCRS și ePSet_MapConversion pe amplasament |

O **cale ferată** (un aliniament cu Cale ferată activată) intră în IFC 4.3 ca IfcRailway: tranzițiile ei ca tipuri proprii (clotoidă, parabolă cubică, Bloss, Helmert, semiundă sinusoidală ca curbă cosinus, sinus), devezul ei ca IfcAlignmentCant, iar linia ca șine, traverse și patul de balast, cu subbalastul dedesubt. IFC4 și IFC2x3 primesc aceleași părți ca elemente civile sau proxy-uri. Deschiderea unei căi ferate IFC 4.3 aduce înapoi tranzițiile și devezul.

Fiecare fișier conține și parcele (amprente), plantele și amenajările dure din spațiul de lucru Peisagistică și volumele clădirilor (fiecare ca IfcBuilding cu etajele sale), toate pe un singur amplasament. Seturile de proprietăți conțin ce ați proiectat: pichetele, ansamblul, pantele de debleu și rambleu, lățimea și numărul benzilor, cotele radierelor și ale capacelor, înălțimile zidurilor; cantitățile (lungimi, arii, volume) sunt seturi IfcElementQuantity.

## Unități și coordonate

Fișierul este în unitatea de lungime a proiectului (metri sau picioare US survey); ariile și volumele sunt în metri pătrați și metri cubi. Cu un sistem de coordonate (GIS › Coordonate) fișierul se așază pe hartă: coordonatele Y (Est) și X (Nord) ale originii sale, precum și rotația și scara unui sistem local (de teren), sunt în conversia la hartă. Fără unul, fișierul înregistrează originea locală într-un set de proprietăți și nu este așezat pe o hartă.

## Import

Deschideți un fișier .ifc cu {{ui:Deschidere}} sau trageți-l pe plan. Caseta de dialog de import spune ce conține fișierul:

- **Aliniamente** din IFC 4.3 (traseele orizontale și verticale) și curbele de aliniament din IFC 4x1 devin aliniamente CivilCraft, cu PI-urile, razele, lungimile spiralelor și PVI-urile lor. Un aliniament pe care modelul de PI al CivilCraft nu-l poate reține (curbe compuse, spirale între două curbe, unul care începe sau se termină într-o curbă) nu este importat, iar caseta de dialog spune de ce.
- **Suprafețe**: alegeți-o pe cea care devine terenul natural sau păstrați-l pe cel al proiectului.
- **Orice altceva** (și celelalte suprafețe) poate fi afișat în vederea 3D ca referință. Elementele de referință rămân cât timp proiectul este deschis; nu sunt salvate în fișierul proiectului.

Fișierele scrise de CivilCraft în IFC4 sau IFC2x3 își aduc înapoi aliniamentele exact din seturile lor de proprietăți.

## Încă nerealizat

- Devezul unui drum este scris ca evenimente de dever și în suprafețele drumului (devezul este pentru căile ferate).
- Salvarea elementelor de referință în fișierul proiectului și importul din IFC al rețelelor de conducte sau al platformelor ca obiecte editabile.
