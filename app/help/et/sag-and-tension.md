---
title: Rippe ja pinge
summary: Sinu koormusjuhud (temperatuur, tuul, jää) ja pingepiirangud, kuidas CivilCraft arvutab iga lõigu pinge ning paigaldustabelid.
keywords: rippe, pinge, koormusjuht, temperatuur, tuul, jää, asümmeetriline jää, arvutuslik ava, ekvivalentne ava, olekumuutus, ahelkõver, paigaldustabel, purunemistugevus, igapäevane pinge
from: f8876c35
---

## Koormusjuhud ja piirangud

{{ui:More}} › {{ui:Load cases and limits…}} muudab reegleid, mida järgib kõik projekti liinid.

- **Koormusjuhud**: temperatuur, tuulesurve juhtmele (Pa) ja radiaalne jää (mm, koos tihedusega). Esimene juhtum on lähtekohaks.
- **Pingepiirangud**: osa juhtme purunemistugevusest, horisontaalsele pingele või suurimale pingele toel ühes koormusjuhus. Või sisesta horisontaalne pinge ise.
- **Vabaruumid**: vaba ruum, mida juhe hoiab maapinna, tee, hoone jm kohal. Lisa, nimeta ümber ja eemalda need: need on sinu omad. Nende all vali reeglid **Juhtme all olevad haljastustaimed**, **Juhtme all olevad aiamüürid** ja **Maa-alused ületused**.
- **Juhtumid, mida kontrollid kasutavad**: milline juhtum annab suurima rippe (kuum), isolaatori kõikumise (tuul), jää ning jää ühel pool toetust.
- **Tegurid**: faasivahe tegur k, suurim isolaatori kõikumine, tegur toe- ja kinnituskoormustele, pöördenurgad, mis teevad nurga- ja lõpptoed, väikseim kate maa-aluste kaablite kohal ning suurim pingelang.

## Paketid: reeglid ja teek riigi jaoks

Ühtegi riigi reegleid ei ole CivilCraftisse sisse ehitatud. **Pakett** hoiab reeglite komplekti ja teeki koos ühes failis (`.cclinepack.json`) riigi, võrguoperaatori või ettevõtte jaoks:

- **Salvesta paketina…** aknas {{ui:Load cases and limits…}} kirjutab näidatud reeglite komplekti ja sinu teeki (või, kui sinu teegis pole veel midagi, selle projekti kasutatavad üksused). Sisesta esmalt **Riik või piirkond**.
- **Ava reeglikomplekt või pakett…** loeb paketi, reeglifaili või teegifaili. Paketi reeglid näidatakse dialoogis (klõpsa **Rakenda**, et neid kasutada) ja selle üksused lähevad sinu teeki.
- Teistega jagatud paketid on lisandmoodulite lehel loetletud jaotises **Elektriliini paketid**. Kaks näidispaketti näitavad vormingut; need ei ole ühegi riigi reeglid.

Iga pakett kontrollitakse avamisel nagu iga fail. Kontrolli iga väärtust enne ehitamist vastava standardiga.

Kaks näidisreeglikomplekti on alustamiseks: **Näide: külm kliima** ja **Näide: mõõdukas kliima**. Nende arvud ei pärine ühestki standardist: sisesta väärtused, mida sinu standard annab. {{ui:Save rules}} ja {{ui:Open rules…}} jagavad reeglikomplekti failina.

## Kuidas pinget arvutatakse

Iga lõigu kohta pinnalõikude vahel:

1. **Arvutuslik ava** on √(ΣL³ ÷ ΣL) tema avadest.
2. Iga piirang muudetakse horisontaalseks pingeks lähtejuhtumis **olekumuutuse võrrandi** kaudu arvutuslikul avalt: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Kõige piiravam määrab pinge.
3. Iga koormusjuhu pinge tuleneb sellest ühest ning iga ava kuju on täpne **ahelkõver** läbi selle kahe kinnituspunkti (ka kaldega avad): rippe kõõdust, pikkus ja pinge kummaski otsas.

Koormus meetri kohta juhtumis: kaal pluss jää (jää pindala × tihedus × g) vertikaalselt; tuulesurve × jääga kaetud läbimõõt horisontaalselt.

## Paigaldustabelid

{{ui:More}} › {{ui:Stringing tables…}} loetleb iga lõigu kohta horisontaalse pinge ja iga ava rippe igal reeglikomplekti temperatuuril (algul −5 °C kuni 40 °C 5 °C sammuga), paigalseisvas õhus. Salvesta need ja toetuste tabel CSV-na.

Ei arvestata: juhtme ajas toimuvat roomet ja uue juhtme venivust. Lisa need läbi temperatuuride, mille juures paigaldad.
