---
title: Nuolinkis ir įtempimas
summary: Jūsų apkrovų atvejai (temperatūra, vėjas, ledas) ir įtempimo ribos, kaip CivilCraft apskaičiuoja kiekvieno pjūvio įtempimą, ir montavimo lentelės.
keywords: nuolinkis, įtempimas, apkrovos atvejis, temperatūra, vėjas, ledas, nesimetriškas ledas, lemiamas tarpatramis, ekvivalentinis tarpatramis, būsenos pokytis, grandinėlės kreivė, katenara, montavimo lentelė, gniuždymo stipris, kasdienis įtempimas
from: f8876c35
---

## Apkrovų atvejai ir ribos

{{ui:Daugiau}} › {{ui:Apkrovų atvejai ir ribos…}} redaguoja taisykles, kurių laikosi kiekviena projekto linija.

- **Apkrovų atvejai**: temperatūra, vėjo slėgis ant laidininko (Pa) ir radialinis ledas (mm, su jo tankiu). Pirmasis atvejis yra atskaitos.
- **Įtempimo ribos**: laidininko gniuždymo stiprio dalis, horizontaliam įtempimui arba didžiausiam įtempimui ties atrama, viename apkrovos atvejyje. Arba nurodykite horizontalų įtempimą patys.
- **Atstumai**: atstumas, kurį laidininkas išlaiko virš žemės, kelio, pastato ir t. t. Pridėkite, pervadinkite ir pašalinkite juos: jie yra jūsų. Žemiau jų pasirinkite taisykles **Augalija po linija**, **Sienos po linija** ir **Požeminės kirtimo vietos**.
- **Atvejai, kuriuos naudoja patikros**: kuris atvejis duoda didžiausią nuolinkį (karštis), izoliatoriaus nuokrypį (vėjas), ledą ir ledą vienoje atramos pusėje.
- **Koeficientai**: fazių atstumo koeficientas k, didžiausias izoliatoriaus nuokrypis, koeficientas atramų ir jungčių apkrovoms, posūkio kampai, kurie daro kampines ir galines atramas, mažiausias gaubtas virš palaidotų kabelių ir didžiausias įtampos nuostolis.

## Paketai: taisyklės ir biblioteka šaliai

Jokios šalies taisyklės nėra įdiegtos CivilCraft. **Paketas** saugo taisyklių rinkinį ir biblioteką viename faile (`.cclinepack.json`), šaliai, tinklo operatoriui ar įmonei:

- **Įrašyti kaip paketą…** lange {{ui:Apkrovų atvejai ir ribos…}} įrašo rodomą taisyklių rinkinį ir jūsų biblioteką (arba, jei jūsų bibliotekoje dar nieko nėra, šiame projekte naudojamus elementus). Pirmiausia įveskite **Šalis arba regionas**.
- **Atidaryti taisyklių rinkinį arba paketą…** nuskaito paketą, taisyklių failą arba bibliotekos failą. Paketo taisyklės rodomos dialogo lange (spauskite **Taikyti**, kad jas naudotumėte), o jo elementai patenka į jūsų biblioteką.
- Paketai, kuriais dalijasi kiti, išvardijami priedų puslapyje skyriuje **Elektros linijų paketai**. Du pavyzdiniai paketai rodo formatą; jie nėra jokios šalies taisyklės.

Kiekvienas paketas tikrinamas atidarant, kaip ir bet kuris failas. Prieš ką nors sukurdami patikrinkite kiekvieną reikšmę pagal taikomą standartą.

Du pavyzdiniai taisyklių rinkiniai, iš kurių galima pradėti: **Pavyzdys: šaltas klimatas** ir **Pavyzdys: švelnus klimatas**. Jų skaičiai nėra iš jokio standarto: nustatykite reikšmes, kurias duoda jūsų standartas. {{ui:Įrašyti taisykles}} ir {{ui:Atidaryti taisykles…}} bendrina taisyklių rinkinį kaip failą.

## Kaip apskaičiuojamas įtempimas

Kiekvienam pjūviui tarp galinių atramų:

1. **Lemiamas tarpatramis** yra √(ΣL³ ÷ ΣL) jo tarpatramių.
2. Kiekviena riba paverčiama horizontaliu įtempimu atskaitos atveju per **būsenos pokyčio lygtį** lemiamame tarpatramyje: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Griežčiausia nustato įtempimą.
3. Kiekvieno apkrovos atvejo įtempimas seka iš to, o kiekvieno tarpatramio forma yra tiksli **katenara** per jo du tvirtinimo taškus (įskaitant tarpatramius ant nuolydžio): nuolinkis nuo styginio, ilgis ir įtempimas kiekviename gale.

Apkrova metrui atvejyje: svoris plius ledas (ledo plotas × tankis × g) vertikaliai; vėjo slėgis × apledėjęs skersmuo horizontaliai.

## Montavimo lentelės

{{ui:Daugiau}} › {{ui:Montavimo lentelės…}} rodo kiekvienam pjūviui horizontalų įtempimą ir kiekvieno tarpatramio nuolinkį kiekvienoje taisyklių rinkinio temperatūroje (pradžioje nuo −5 °C iki 40 °C, po 5 °C), ramiame ore. Įrašykite jas ir atramų lentelę kaip CSV.

Neįskaičiuota: laidininko ilgalaikis tekėjimas per metus ir naujo laidininko išsitempimas. Pridėkite juos per temperatūras, kuriomis montuojate.
