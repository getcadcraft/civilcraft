---
title: Njësitë gjatë importit: një skedar deklaron njësitë e tij, ose pyetesh së pari
summary: Kur një vizatim ose rrjet që sjell në një projekt deklaron njësitë e tij, CivilCraft e konverton dhe e thotë këtë. Kur nuk e deklaron, CivilCraft pyet përpara se ta lexojë dhe mban mend përgjigjen për atë skedar.
keywords: njësi, import, DWG, DXF, STL, OBJ, rilevim, këmbë, këmbë rilevimi amerikan, metra, milimetra, shkallë, madhësi e gabuar, shumë i madh, shumë i vogël, pyet, mbahet mend, INSUNITS, njësitë e vizatimit
from: 60921963
---

## Çfarë do të bësh

Sjell një skedar në një projekt dhe sigurohu që hyn me madhësinë e duhur.

## Hapat

1. Hap skedarin si zakonisht: {{ui:Hap}}, hidhe mbi plan, ose komanda e vizatimit CAD.
2. Nëse skedari deklaron njësitë e tij, asgjë nuk pyetet: dialogu i importit i shfaq ato si **Ashtu siç thotë vizatimi**.
3. Nëse jo, një dialog pyet **Njësitë e** skedarit përpara se të hapet dialogu i importit. Zgjidh çfarë është një njësi në skedar dhe kliko {{ui:Përdor këto njësi}}.
4. {{ui:Anulo}} (ose {{key:Esc}}) e kalon skedarin. Asgjë nga ai nuk lexohet në projekt.

## Cilat skedarë deklarojnë njësitë e tyre

- **DWG dhe DXF**: njësitë e futjes së vizatimit (`$INSUNITS`). Një skedar pa to pyetet. Lista **Njësitë e vizatimit** në dialogun e importit fillon me përgjigjen tënde dhe mund ta ndryshosh edhe më pas.
- **STL dhe OBJ** (forma të lira të terrenit): nuk deklarojnë kurrë njësi. Pyetesh.
- **Lista pikash** (CSV, TXT) dhe lista matjesh rilevimi të progresit: një listë që deklaron njësinë e saj në rreshtat e parë konvertohet, dhe rreshti i statusit e thotë këtë. Një listë që nuk deklaron asnjërën pyetet kur shtyp {{ui:Importo}}, para se pikat të hyjnë. Kolonat e gjerësisë dhe gjatësisë gjeografike kalojnë përmes sistemit të koordinatave.
- **Shtojca Point clouds**: pyet kur ndërton një re pikash, skedari i të cilës nuk deklaron njësi, dhe e etiketon numrat e renë në njësinë që mban.
- **IFC dhe LandXML**: deklarojnë të tyren; konvertohen në njësitë e projektit.
- **LAS, LAZ dhe rastrat e lartësisë**: vendosen sipas sistemit të tyre të koordinatave; dialogu i terrenit pyet për njësinë e lartësisë kur skedari nuk e thotë.

## Gjëra për të ditur

- Përgjigja mbahet mend për atë skedar në këtë kompjuter, në çdo aplikacion CadCraft. Herën tjetër që hyn, nuk pyetesh.
- Për të pyetur përsëri: paleta e komandave ({{key:Mod+K}}) › **Pyet përsëri për njësitë e skedarëve të importuar**.
- Një njësi që një listë e deklaron lexohet nga tetë rreshtat e parë: një rresh si `units: ft`, ose kokat e kolonave që të gjitha mbajnë të njëjtën njësi në kllapa, si `Elevation (m)`.
