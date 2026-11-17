---
title: Reljefas iš horizontalių linijų
summary: Sukurti esamą paviršių iš horizontalių žemėlapio: pasirinkti linijų sluoksnius, nurodyti, iš kur ima kiekvienos linijos aukštis, patikrinti susikirtimus ir dublikatus bei kurti. Horizontalės tampa lūžio linijomis, o plokšti trikampiai kalnagūbriuose ir slėniuose ištaisomi. Žemėlapis, nubrėžtas pagal paveikslėlį ar PDF, gali būti pamastelintas ir sulygiuotas pagal du žinomus taškus.
keywords: horizontalės, horizontalių linijos, reljefas iš horizontalių, paviršius iš horizontalių, topografinis žemėlapis, geodezinis žemėlapis, be koordinačių, lūžio linijos, plokšti trikampiai, kalnagūbris, slėnis, kalvos viršūnė, susikertančios horizontalės, dublikuotos horizontalės, horizontalių intervalas, žemėlapio mastelis, du taškai, žemėlapio padėtis, DXF, DWG, shapefile
from: e6161653
---

Geodezistas kartais atsiunčia horizontalių žemėlapį: linijas su aukščiais, bet be taškų. CivilCraft iš tų linijų sukuria esamą gruntą.

## Įkelti horizontales

Atidarykite žemėlapį kaip linijinę grafiką: DXF ar DWG brėžinį, shapefile ar GeoJSON (**GIS** › {{ui:Import}}, arba nuleiskite failą ant plano). Linijos patenka kaip **žemėlapio sluoksniai**. Po **Paviršius** › {{ui:More}} pasirinkite {{ui:Terrain from contours}}.

## Nurodyti, iš kur ima kiekvienas aukštis

Pažymėkite sluoksnius, kuriuose yra horizontalės, tada pasirinkite **Aukštis iš**:

- {{ui:The lines' own elevations}}: linija, kurios visos viršūnės turi tą patį aukštį (3D polilinija arba polilinija su aukščiu). Linija 0 aukštyje yra plano linijinė grafika ir aukščio neturi.
- **Skaitinį lauką** sluoksnio (pavyzdžiui, ELEV), jei žemėlapis buvo atėjęs su tokiu.
- {{ui:A start and an interval, in the order the lines are listed}}: linijoms, kurios neturi jokio aukščio. Pirmoji išvardinta linija gauna **Pirmosios linijos aukštį**, kita – tą patį plius **Horizontalių intervalą**, ir taip toliau. Išvardinkite linijas nuo žemiausios aukštyn (arba pertvarkykite jas sluoksnyje).

## Patikrinti, tada kurti

{{ui:Check}} išvardija, kas neteisinga, žodžiais, prieš ką nors keičiant:

- linija be **aukščio** arba su mažiau nei dviem taškais;
- **dublikatas** – ta pati forma du kartus, net jei nubrėžta atvirkščiai;
- dvi linijos, kurios **susikerta**, skirtinguose aukščiuose arba tame pačiame (linija, kuri kerta pati save, taip pat), nurodant vietą;
- aukštis, kuris **nėra intervalo kartotinis** (rašymo klaida, pavyzdžiui, 105.5 1 m žemėlapyje).

Pažymėkite {{ui:Leave out lines that cross another}}, kad būtų išmesta linija, kertanti daugiausia kitų (ir taip toliau, kol nieko nekerta): klaidinga linija, kuri kerta kiekvieną horizontalę, yra ta, kuri pašalinama, o ne horizontalės. **Supaprastinti linijas per** sumažina viršūnes, kurios yra arčiau tiesios atkarpos nei tas atstumas.

{{ui:Build the ground}} prideda linijas prie esamo grunto kaip lūžio linijas (vienas anuliavimo žingsnis), todėl paviršius tiksliai eina per kiekvieną horizontalę. Pažymėjus {{ui:Fix flat triangles on ridges, valleys and hilltops}} ir nurodžius intervalą, CivilCraft taip pat prideda tašką į kiekvieną plokštų trikampį (trikampį, kurio visi kampai guli ant vienos horizontalės) į aukštį, kurį tęsia gretimas šlaitas, bet ne daugiau kaip per pusę intervalo nuo horizontalės. Be to, kitaip kalnagūbrių viršūnės, slėnių dugnai ir kalvų viršūnės išeitų kaip plokšti plotai. Bandomojoje kalvoje paklaida, lyginant su tikru paviršiumi, sumažėjo ketvirtadaliu; ant kalnagūbrio – 40 %.

## Žemėlapis be koordinačių

Horizontalių žemėlapiui, nubrėžtam pagal paveikslėlį ar PDF, atidarykite **Pamastelinti ir sulygiuoti sluoksnius pagal du žinomus taškus**. Nurodykite du žemėlapio taškus ir tikrąją jų vietą; pažymėti sluoksniai pamastelinami, pasukami ir perkeliami, kad atitiktų (vienas anuliavimo žingsnis; aukščiai nekeičiami). Tie patys du taškai nustato mastelį (rodomą pranešime) ir pasukimą.

Paviršius yra tiek geras, kiek geras žemėlapis: tarp dviejų horizontalių jis yra plokštuma, todėl tikras gruntas tarp jų nežinomas. Prieš pasikliaudami rezultatu, patikrinkite jį su taškiniais aukščiais.
