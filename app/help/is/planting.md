---
title: Gróðursetningaráætlanir og listar
summary: Settu inn stakar plöntur, gróðursetningarbeð fyllt eftir bili plantnanna með blönduðum plöntum eftir hundraðshluta, og limgerði; merktu þau; teldu þau í plöntulista fyrir töflureikni eða TakeoffCraft.
keywords: gróðursetningaráætlun, plöntulisti, gróðursetningarbeð, massagróðursetning, limgerði, tré, runni, þekjugróður, bil, þríhyrningsbil, plöntutalning, magn, merkingar, krónuþak, plöntutákn, ifc, magntaka
from: ab49eab5
---

## Settu inn plöntur

1. Veldu plöntu í **Plöntur** vinstra megin.
2. Smelltu á {{ui:Planta}}, smelltu síðan á grunnmyndina: hver smellur setur inn eina plöntu. Ýttu á {{key:Esc}} til að hætta.

Plöntutákn er teiknað í útbreiðslu hennar við fullan vöxt; Meira › {{ui:Sýna í gróðursetningarstærð}} teiknar hverja plöntu í þeirri stærð sem hún er gróðursett í. Tré standa á jörðinni undir sér: þegar þú mótar svæðið síðar fylgja þau því. Til að festa plöntu í kóta í staðinn, skrifaðu hann í **Kóti** í Eiginleikum.

## Gróðursetningarbeð

1. Veldu aðalplöntuna, smelltu á {{ui:Beð}} og smelltu á horn beðsins. Ýttu á {{key:Enter}} (eða smelltu aftur á fyrsta hornið) til að loka því.
2. Beðið fyllist af þeirri plöntu í sínu bili, í **þríhyrningsmynstri** (það algenga: hver planta í sömu fjarlægð frá sex öðrum), hálfu bili inn frá jaðrinum.
3. Í Eiginleikum blandar **Bæta við plöntu** inn plöntunni sem valin er vinstra megin. Stilltu **Hlutdeild %** hverrar plöntu: beðið tekur nákvæmlega það hlutfall af hverri, dreift um það. **Blanda aftur** hristir til hvar þær eru.

**Bil** tómt notar bil plantnanna sjálfra (vegið eftir hlutdeild þeirra); skrifaðu eitt til að nota það fyrir allar plöntur. **Mynstur** getur verið **ferkantað**, og **Raðir við** snýr röðunum.

## Limgerði

Veldu limgerðisplöntuna, smelltu á {{ui:Limgerði}}, smelltu eftir limgerðinu og ýttu á {{key:Enter}}. Plönturnar fara eftir línunni í sínu bili, miðjaðar svo báðir endar hafi sama jaðar. Limgerði getur verið **tvær raðir, í skákmynstri**, í ákveðinni fjarlægð hvor frá annarri.

## Merkingar

Stakar plöntur eru merktar með merkingarstillingunni (`{name}` sjálfgefið); skrifaðu þína eigin merkingu fyrir eina plöntu í Eiginleikum. Beð eru merkt með talningu hverrar plöntu, limgerði með sinni. Meira › {{ui:Gróðurtextar}} kveikir og slekkur á merkingum. Reitir merkinga: `{name}`, `{botanical}`, `{size}` (ílátið), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Plöntulistinn

Meira › {{ui:Plöntulisti…}} telur hverja plöntu eftir tegund, úr stökum plöntum, beðum og limgerðum saman, með sinni gróðursetningarstærð. Vistaðu hann sem **CSV** eða **XLSX**, eða **Senda til TakeoffCraft**: magnskrá sem TakeoffCraft opnar til að verðleggja plönturnar (með harðfrágangs- og áveitumagni við hliðina).

## IFC

Meira › {{ui:Flytja út landslags-IFC}} vistar landslagið sem IFC-skrá (IFC 4.3) sem BIM-líkan getur geymt: hver planta er `IfcGeographicElement` af gerðinni VEGETATION, flokkuð eftir tegund með eiginleikum plöntunnar (grasafræðiheiti, stærðir, harðgerði, vatn, birta), og hvert beð og limgerði er eitt element með sínum tölum, á lóðinni. BimCraft opnar það við hlið byggingarinnar.
