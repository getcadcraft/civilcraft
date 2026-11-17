---
title: Upės vandens paviršiaus profiliai
summary: Modeliuokite upę pagal žemės paviršių ir skaičiuokite stacionarius vandens paviršiaus profilius standartiniu žingsnių metodu: vandens lygius, energiją, greičius, Froude skaičius ir potvynio plotą plane. Laboratorinė funkcija; kiekvienas rezultatas reikalauja inžinieriaus peržiūros.
keywords: pylimas, neveiksminga tėkmės zona, pjūvių redaktorius, upė, hidraulika, vandens paviršiaus profilis, atbulinis tvenkimas, standartinis žingsnis, stacionari tėkmė, 1d, skerspjūviai, manningas, šiurkštumas, pralaidumas, kritinis gylis, normalusis gylis, froude, energijos gradientas, potvynio plotas, užliejama teritorija, užliejimas, krantų stotys, ruožų ilgiai, susiaurėjimas, išsiplėtimas, poskritinė, viršskritinė, mišrus režimas, hidraulinis šuolis
from: fb8bf425
---

CivilCraft skaičiuoja stacionarius, vienmačius vandens paviršiaus profilius išilgai upės: kiekvienam jūsų nurodytam debitui – vandens lygį kiekviename skerspjūvyje, pagal energijos balansą tarp gretimų pjūvių (standartinio žingsnio metodas). Ji yra laboratorinėje zonoje, kol tikrinama.

**Tik projektavimo pagalba.** Vandens lygiais galima remtis tik po kvalifikuoto inžinieriaus peržiūros: vienmatis modelis yra tiek geras, kiek geri jo pjūviai, šiurkštumo reikšmės, ruožų ilgiai ir ribos, ir jis nežino apie tiltus, pralaidas ar tėkmę, išeinančią iš upės.

## Nubrėžkite upę

1. Pirmiausia sukurkite esamą žemės paviršių (taškai, lūžio linijos arba atidarytas TIN).
2. Po **Paviršius** › {{ui:Daugiau}} pasirinkite {{ui:Upė}}.
3. Spauskite palei upės ašį **nuo aukštupio iki žemupio**, tada paspauskite {{key:Enter}} arba dukart spustelėkite.

CivilCraft kerpa pjūvį statmeną ašiai kas 50 m (200 ft), po 100 m (300 ft) į kiekvieną pusę nuo žemės. Upės pikietai matuojami nuo žemupio galo, todėl didėja aukštupio link. Krantai iš pradžių įvertinami 10 m (30 ft) abiejose pusėse nuo kiekvieno pjūvio žemiausio taško.

Norėdami pridėti pjūvį ten, kur upė siaurėja arba yra statinys, pasirinkite upę, spauskite {{ui:Pridėti skerspjūvį}} ir nubrėžkite pjūvio liniją per ją (bet kuria kryptimi: ji pasukama taip, kad eitų iš kairės į dešinę žiūrint pasroviui).

## Nustatykite upę

Pasirinkite upę, kad ją pamatytumėte **Savybėse**:

- **Tėkmės režimas**: poskritinis (įprasta: skaičiuojama aukštupio kryptimi nuo žemupio ribos), viršskritinis (skaičiuojama žemupio kryptimi nuo aukštupio ribos) arba mišrus (abu, tada tas, kurio konkretaus pjūvio savitoji jėga didesnė; peržiūra).
- **Debitų profiliai**: pavadinimas ir debitas kiekvienam (pavyzdžiui, 10 metų ir 100 metų debitas) ir riba žemupio gale (ir aukštupio gale, kai režimas ne poskritinis): **Normalusis gylis** su energijos nuolydžiu (dugno nuolydis – pirmasis įvertinimas), **Žinomas vandens paviršius** su aukščio reikšme arba **Kritinis gylis**.
- **Pjūviai iš žemės**: tarpas, kiek kairėn ir dešinėn, krantų įvertinimas ir dvi Manningo n reikšmės; {{ui:Vėl pjauti pjūvius}} pakeičia pjūvius (vienas anuliavimo žingsnis).
- **Pjūvių lentelė**: kiekvienam pjūviui – kairiojo ir dešiniojo kranto nuokrypiai, kanalo n ir užliejamos dalies n, ruožų ilgiai iki kito pjūvio žemupio (kairioji užliejama dalis, kanalas, dešinioji užliejama dalis; matuojama nuo plano pradžios) ir susiaurėjimo bei išsiplėtimo koeficientai (pradžioje 0.1 ir 0.3: laipsniški perėjimai). {{ui:Redagavimas}} atveria pjūvio redaktorių (kitą skyrių); taškas po jo reiškia, kad pjūvyje yra pylimas arba neveiksminga zona.

Kiekvienas pakeitimas yra vienas anuliavimo žingsnis ({{key:Mod+Z}}).

## Redaguokite pjūvį: krantai, pylimai ir neveiksmingos zonos

{{ui:Redagavimas}} pjūvyje nubraižo jo žemę ir leidžia vilkti tai, ką skaičiuoklė nuskaito: **kairįjį ir dešinįjį krantą** (jie padalija pjūvį į kairiąją užliejamą dalį, pagrindinį kanalą ir dešiniąją užliejamą dalį), **pylimą** abiejose pusėse ir **neveiksmingas tėkmės zonas**. Kiekvieną rankeną galima perkelti rodyklių klavišais, o kiekvieną skaičių galima įvesti šalia grafiko. {{ui:Taikyti}} yra vienas anuliavimo žingsnis.

- **Pylimas** turi vietą (nuokrypį) ir viršūnės aukštį. Žemė už jo, nutolusi nuo upės, atskiriama nuo upės, kol vandens paviršius žemiau viršūnės: jos plotas, šlapias perimetras ir pralaidumas neįskaičiuojami. Virš viršūnės visas pjūvis vėl skaičiuojamas. Pylimas stovi išorėje kranto, kurį saugo; jei jis yra krantų viduje, jis pažymimas.
- **Neveiksminga tėkmės zona** talpina vandenį, bet neneša tėkmės (įdubimas už pylimo, negyvas vanduo šalia tilto privažiavimo). Nurodykite jos du nuokrypius ir, jei norite, vandens lygį, žemiau kurio zona neveiksminga ({{ui:visada}}, kai tuščia): virš šio lygio ji teka kaip ir kita dalis. Zona, dengianti dalį pagrindinio kanalo, pažymima.
- Tarp dviejų pjūvių potvynio plotas palieka sausą žemę už pylimo, kurį turi abu pjūviai, kol vandens paviršius ten žemiau viršūnės (tiesė tarp dviejų viršūnių yra tiesi).

## Skaičiuokite ir skaitykite rezultatus

Spauskite {{ui:Vandens paviršiaus profiliai}}. Pasirinktam profiliui gausite:

- **brėžinį** išilgai upės (tėkmė iš kairės į dešinę): kanalo dugną, krantus, vandens paviršių, energijos gradientą ir kritinį vandens paviršių; pjūviai, laikomi kritiniame gylyje, apibrėžiami apskritimu;
- **lentelę** kiekvienam pjūviui: upės pikietas, debitas, kanalo dugnas, vandens paviršius, kritinis vandens paviršius, energijos gradientas, gylis, greitis kanale ir bendras, kanalo Froude skaičius, tėkmės plotas, viršutinis plotis, tėkmė kiekvienoje užliejamoje dalyje ir kanale, energijos nuolydis ir įspėjimai;
- **įspėjimus** paprastais žodžiais, pavyzdžiui: pjūvis nustatytas kritiniame gylyje, vanduo virš pjūvio galų arba didelis pralaidumo pokytis tarp dviejų pjūvių (pridėkite pjūvių tarp jų).

{{ui:Lentelė (CSV)}}, {{ui:Ataskaita}} (paprastas tekstas su metodu, ribomis ir kiekviena lentele) ir {{ui:Brėžinys (SVG)}} įrašomi į jūsų atsisiuntimus. Kiekviename yra peržiūros eilutė.

Pažymėkite {{ui:Rodyti potvynio plotą}} **Savybėse**, kad pasirinkto profilio šlapia zona plane būtų nuspalvinta, o vandens linija pažymėta ten, kur gylis nulinis. Tarp pjūvių vandens paviršius skersai upės yra lygus ir kinta tiesiškai pagal upės pikietą. Žemė už pylimo lieka sausa, kol vanduo po jo viršūne. Kita žema vietovė upės koridoriuje, kurios vanduo nepasiekia (pavyzdžiui, už kelio pylimo), vis tiek nuspalvinama: patikrinkite ją.

## Brėžinyje ir Problemose

Upės linijos patenka į planą, PDF ir DWG savo sluoksniuose: **C-WATR-CNTR** (ašis), **C-WATR-SCTN** (kiekviena pjūvio linija su jos upės pikietu) ir **C-WATR-FLOD** (potvynio ploto vandens linija, kai profiliui pažymėtas {{ui:Rodyti potvynio plotą}}). Upės įspėjimai (pjūvis nustatytas kritiniame gylyje, vanduo virš pjūvio galų, pralaidumo pokytis, reikalaujantis daugiau pjūvių, energijos balansas, kuris neuždarytas, pylimas krantų viduje) taip pat patenka į **Problemos** skydelį, apie upę ir pažymėti pjūvyje, iš kurio jie kilę.

## Kaip skaičiuojama

- Energija tarp dviejų pjūvių: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Pralaidumas pagal padalijimą: kiekviena užliejama dalis padalijama ten, kur keičiasi jos n, K = Σ (1/n)·A·R^(2/3) (1.486/n JAV vienetais); kanalas yra viena dalis, su sudėtiniu n, kai keičiasi jo n. α gaunamas iš to, kaip padalijamas pralaidumas.
- Trinties nuolydis pagal vidutinį pralaidumą, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², per debitu svertą ruožo ilgį.
- Susiaurėjimo koeficientas, kai tėkmė žemupio kryptimi greitėja, išsiplėtimo – kai lėtėja.
- Kritinis gylis = mažiausia savitoji energija. Kiekvienas vandens lygis sprendžiamas intervale, todėl niekada nešokinėja į neteisingą kritinio pusę; kai atsakymo nėra, jis nustatomas kritiniame gylyje ir pažymimas.

Programa patikrinta pagal Manningo normalųjį gylį, kritinį gylį stačiakampiame kanale ir Chow atbulinio tvenkimo pavyzdį (*Open-Channel Hydraulics*, 1959, 10 skyrius), integruotą nepriklausomai. Tą patį metodą naudoja įprastos vienmatės upių programos, todėl rankiniai skaičiavimai ar studento užrašai atitinka.

## Pralaidos ir tiltai

Upės **Savybėse**, skyriuje **Pralaidos ir tiltai**, {{ui:Pridėti pralaidą}} arba {{ui:Pridėti tiltą}} įdeda vieną tarp dviejų pjūvių (kiekvienas ruožas išlaiko bent du pjūvius). Profilis žemiau jo nepakinta; vandens paviršius tiesiai virš jo ateina iš konstrukcijos, o profilis tęsiasi aukštupio kryptimi nuo ten. **Rezultatai** prideda kiekvienos konstrukcijos lentelę: žemupio lygį, aukštupio lygį, kuri valdymo rūšis lemia, tėkmę per angą ir tėkmę per kelią ar denginį. Tik poskritinė tėkmė.

- **Pralaida** (dėžinė arba apvali, viena ar daugiau vienodų vamzdžių). Įtekėjimo valdymas yra pylimo tėkmė, kol įėjimas laisvas, ir angos tėkmė, kai jis paskendęs, sumaišyta tarp aukštupio lygio, lygaus vienam ar vienam su puse aukščio. Išėjimo valdymas yra energijos balansas: įėjimo nuostoliai, trintis ir išėjimo greičio galva, virš didesnio iš žemupio lygio ir kritinio gylio vidurio bei viršūnės, atėmus nuolydį palei vamzdį. Aukštupio lygis yra didesnis iš dviejų. Pažymėkite **Vanduo gali tekėti per kelią** ir kelio pylimo tėkmė dalijasi debitu su vamzdžiais.
- **Tiltas.** Anga yra pjūvis po tiltu, pjautas ties atramomis, kiekvienas stulpas yra zona, kuri neneša tėkmės. Vandens paviršius angoje ateina iš apatinio pjūvio (išsiplėtimo koeficientas), o pjūvis virš jos – iš angos (susiaurėjimo koeficientas). Jei anga negali praleisti tėkmės esant tam žemupio lygiui, ji teka kritiniame gylyje, o tiltas pažymimas kaip užsikemšantis. Jei vanduo pasiekia apatinę sijų liniją, tėkmė yra slėginė (sklendės tipo, kol žemupio lygis žemiau apatinės sijos, paskendęs virš jos), o vanduo per denginį prideda pylimo tėkmę; aukštupio lygis yra tas, kuriame jie susumuojami į tėkmę.

Koeficientai (debitas, įėjimo nuostoliai, pylimas) yra įvesti apvalūs numatytieji dydžiai. Pakeiskite juos savo projektui. Jie nėra įdiegti kreivių grafikai, kuriuos spausdina pralaidų projektavimo vadovai, todėl pralaidos aukštupio lygį arti jos ribos laikykite įvertinimu. Vanduo per kelią ar denginį, paskendęs įėjimas, užsikirtusi anga ir greita tėkmė vamzdyje rodomi **Problemos** skydelyje.

## Nestacionari tėkmė

{{ui:Nestacionari tėkmė…}} upės **Savybėse** nukreipia potvynio hidrogramą per pjūvius. Įveskite įtekėjimą kaip valandas ir debitus, po porą kiekvienoje eilutėje, žemupio nuolydį (normalųjį gylį) ir kiek laiko skaičiuoti. Ji pradeda nuo stacionaraus vandens paviršiaus esant pirmam debitui ir sprendžia pilnas vienmates lygtis (implicitinė keturių taškų schema, svoris laike 0.6). Gaunate didžiausią vandens lygį ir debitą kiekviename pjūvyje su valanda, kada tai įvyksta, grafiką dviejų galų debitams ir tūrio patikrinimą (įtekėjęs, ištekėjęs ir sukauptas pokytis). Tikrinama, ar stacionari tėkmė lieka stacionari, įtekėjimo šuolis baigiasi naujo debito stacionariu profiliu, tūris užsidaro, ir potvynio bangos greitis lyginamas su kinematine banga. Poskritinė tėkmė, vienas ruožas, be šoninio įtekėjimo ir be pralaidų ar tiltų paleidimo metu.

## Jungtys

Ruožai, sujungiantys tėkmę į vieną išleidimo vietą: debitai sudedami, o vandens paviršius pradedamo žemutinio ruožo galvutėje perkeliamas iki sujungiančių ruožų galų (tas pats vandens paviršius jungtyje, paprastas metodas: be kampo, be impulso, todėl tinka mažiems Froude skaičiams). Modelis ir testai yra įdiegti (`river-structures.js`); skydelis dviem upėms sujungti plane dar nepadarytas.

## Dar nepadaryta

Pylimai ir sklendės kaip atskiros konstrukcijos, skydelis jungtims, konstrukcijos nestacionarioje paleidime ir viršskritinė nestacionari tėkmė. Mišrus režimas pažymi hidraulinį šuolį tarp dviejų pjūvių, bet jo nededa.

**Kur upės susilieja.** Upės **Savybėse** „Teka į“ nurodo upę, į kurią ji įteka. Susiliejančios upės sprendžiamos kartu: upė, į kurią jos teka, gauna jų debitų sumą, o kiekviena jų baigiasi tos upės pirmojo pjūvio vandens paviršiuje (lygaus vandens paviršiaus metodas; neįskaitomas tekėjimų kampas ir impulsas). Norėdami sujungti pagrindinę upę ir upelį, nubrėžkite trumpą upę žemiau jungties ir leiskite abiem tekėti į ją. Rezultatai rodo jungties lentelę. Šiuose rezultatuose esantys numatytieji dydžiai (susiaurėjimas 0.1, išsiplėtimas 0.3, vienos dalies kanalas su sudėtiniu šiurkštumu, mišrus režimas pagal savitąją jėgą) lieka, kol inžinierius jų neperžiūri, ir Rezultatai tai nurodo.
