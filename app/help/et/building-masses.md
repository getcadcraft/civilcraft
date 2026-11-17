---
title: Hoonemahtude joonistamine alal
summary: Joonista hoonemaht krundile, anna sellele korrused ja korruse kõrgus, vaata selle brutopinda, vali, kuidas see kaldega maapinnal paigutub, lükka ja tõmba selle kõrgust 3D-s ning saada see BimCraftile või salvesta IFC-failina.
keywords: mass, massimodelleerimine, hoonemaht, maht, jalajälg, korrused, korruse kõrgus, brutopind, GFA, kalle, sokkel, väljakaevamine ja pealekanne, lükkamine tõmbamine, 3D, alauuring, varajane projekteerimine, IFC, arendamine, BimCraft, A-MASS
from: e5a67c16
---

Hoonemaht on jalajälg, korruste arv ja korruse kõrgus: varajane küsimus „kui palju hoonet siia mahub ja mida see teeb maapinnaga“. Mahud asuvad plaanil koos oma nime, korruste arvu ja brutopinnaga, lähevad PDF-plotti ning DWG- ja DXF-ekspordi kihtidele `A-MASS` ja `A-MASS-TEXT` ning salvestatakse projektifaili.

## Joonista mass

1. Rubriigis **Atribuudid**, rubriigis **Hoonemahud**, klõpsa **Joonista mass**. (See on ka tööriistariba menüüs **Veel** kõrval **Pind**-i juures.)
2. Klõpsa jalajälje nurki. Klõps krundi nurga või mõõdistuspunkti lähedal võtab selle punkti täpse koha.
3. Klõpsa esimest nurka uuesti või vajuta {{key:Enter}}, et lõpetada. {{key:Backspace}} võtab viimase nurga tagasi; {{key:Esc}} peatab.

Uus mass on kolme korrusega ja korruse kõrgusega 12 ft (3.6 m) ning kuulub krundile, kuhu tema keskpunkt jääb.

## Korrused, kõrgus ja pindala

Klõpsa massil, et muuta selle **Nimi**, **Kasutus**, **Korrused**, **Korruse kõrgus** ja **Krunt**. **Kõrgus** on korruste arv korda korruse kõrgus: sisesta kõrgus ja korruste arv muutub lähimaks täisarvuks (mitte kunagi vähem kui üks). **Jalajälg** ja **Brutopind** (jalajälg korda korruste arv) arvutatakse sinu eest.

## Kaldega maapinnal

Massi all oleva maapinna loetakse pinnalt: olemasolev maapind või planeeritud maapind, kui valisid **Planeeritud maapind (planeeritud)**. **Kaldega maapinnal** ütleb, kuhu esimene korrus läheb:

- **Astmeline**: jalajälje all oleva keskmise maapinna tasemel. Madal külg täidetakse selle tasemeni ja kõrge külg lõigatakse, need kaks tasakaalustuvad peaaegu.
- **Sokkel**: kõrgeimal maapinnal. Tahke alus täidab madala külje.
- **Lõige**: madalaimal maapinnal. Kõrge külg lõigatakse mäkke ära.

Atribuudid näitavad massi all oleva maapinna ulatust, **Esimese korruse taset** ning täidise ja väljakaevamise mahtu maapinna ja selle taseme vahel. Jalajälje osa, mis on pinnast väljas, jäetakse arvestusest välja ja atribuudid ütlevad, mitu sellist osa on.

## 3D-vaates

Massid joonistatakse 3D-ala vaates, iga korruse ümber joon ja nimed katuse kohal. **Kuva** juures on märkeruut **Hoonemahud**. Klõpsa massil, et see valida. Kui mass on valitud:

- lohista selle katust üles või alla, et lükata või tõmmata seda korruse kaupa, või vajuta {{key:PageUp}} ja {{key:PageDown}};
- kogu liigutus on üks tagasivõtmise samm.

Vaate **Sõit** tänavavaade näeb massegi ja **Päike** heidab nende varjud maapinnale.

## Saada edasi

- **Massid IFC-na** salvestab iga massi IFC4-failina: ala, hoone koos oma korrustega ning mass hoone elemendina, mille numbrid on omaduste kogumis `CadCraft_SiteMass`. Kui projektile on seatud koordinaatsüsteem, paigutatakse fail kaardile ja kannab ala laiuskraadi ja pikkuskraadi; ilma selleta ei ütle see midagi selle asukoha kohta.
- **Arenda BimCraftis** avab BimCraft uuel vahelehel massidega. Seal näitab massi valimine selle numbreid ja nuppu **Arenda seda massi**, mis ehitab jalajälje järgi seinad igale tasandile ja põranda hoone alla, ühe tagasivõtmise sammuna. Midagi ei laadita üles: fail liigub selle brauseri kahe vahelehe vahel.

Vaata ka **Tsoneeringu piirangud** ja **Päikesetunnid**.
