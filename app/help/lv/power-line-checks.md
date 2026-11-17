---
title: Elektrolīniju pārbaudes
summary: Ko CivilCraft pārbauda katrā līnijā un kabelī, vienmēr atjaunots: atstatumus, fāzu izvietojumu, nobīdi, pacelšanos, balstu slodzes un izmērus, armatūru, stiepes, pamatus, trūkstošus datus, savienojumus, pārslodzes un sprieguma zudumu.
keywords: pārbaudes, atstatums, atstatums līdz terēnam, šķērslis, krustojums, fāzu atstatums, izolatora nobīde, pacelšanās, balsta slodze, nominālā slodze, izmērs, pamats, stiepe, vanta, armatūra, šķērssija, sprieguma zudums, pārslodze, trūkstoši dati, atvienots
from: e6a0da47
---

**Pārbaudes** sadaļā Elektrolīnijas uzskaita visas problēmas: sarkanā krāsā tās, kas neizpildās, un dzeltenā krāsā brīdinājumus. Noklikšķiniet uz vienas, lai atlasītu līniju, balstu, kabeli vai iekārtu, uz ko tā attiecas; neizpildītie balsti un posmi plānā ir apvilkti sarkanā krāsā, kamēr darbvieta ir atvērta.

:::warning
Projektēšanas palīglīdzeklis: tās ir jūsu projekta pārbaudes pret jūsu pašu noteikumiem, nevis sertifikācija.
:::

## Atstatumi

Vadītāja zemākā fāze tiek sekota pa katru posmu katrā slodzes gadījumā. Tās zemākajam atstatumam virs terēna jāsasniedz līnijas **Atstatuma noteikums**. Ja posms šķērso **šķērsli** (zīmēts ar {{ui:Šķērslis}}: punkts vai līnija ar tās augstumu virs terēna un savu atstatuma noteikumu), atstatums virs šķēršļa augšas tiek pārbaudīts tāpat.

**Ainavu darbvietā novietotais virs terēna arī tiek ņemts vērā.** Atsevišķi augi (to vainags pieaugušā izplatībā un augstumā), dzīvžogi un stādījumi (augstākā suga tajos) un sienas (to augša) ir šķēršļi zem līnijas, bez atkārtotas zīmēšanas. Tiem paliek noteikumi, kas iestatīti sadaļā {{ui:Slodžu gadījumi un ierobežojumi…}}: **Ainavas augi zem līnijas** (paraugkopās izmantots *Koki un augi*, 3 m) un **Ainavas sienas zem līnijas** (*Ēka*); izvēlieties **Nav pārbaudīts**, lai tos izslēgtu. Atstatums tiek mērīts taisni uz augšu no auga vai sienas augšas līdz vadītājam vietā, kur posms to šķērso; attālums sānis līdz vainagam blakus līnijai netiek pārbaudīts. Koka pārvietošana vai sienas paaugstināšana uzreiz maina pārbaudes.

Jūsu atstatumu noteikumi ir jūsu paši: atveriet tos ar **Noteikumi…** blakus katram **Atstatuma noteikumam** (vai sadaļā {{ui:Slodžu gadījumi un ierobežojumi…}}), lai pievienotu, pārdēvētu, mainītu vai noņemtu.

## Fāzu atstatumi un nobīde

- **Nepieciešamais fāzu atstatums**: k·√(izliece + izolatora garums) + U/150, ar karstās slodzes izlieci un spriegumu U kV (izplatīta forma; k ir jūsu noteikumu kopas). Salīdzina ar šķērssijas fāzu atstatumu.
- **Izolatora nobīde** piekaramajos balstos vēja gadījumā: atan(šķērsslodze ÷ vertikālā slodze), salīdzinot ar noteikumu kopas lielāko nobīdi.
- **Pacelšanās**: piekaramais balsts, kas zemāks par kaimiņiem, aukstumā var tikt pacelts; tas tiek atzīmēts.

## Balstu slodzes un izmēri

Katram balstam un slodzes gadījumam, ar visiem līnijas vadītājiem:

- **Šķērsvirziena**: vējš uz metru × vēja posms (divu posmu puse), plus 2·H·sin(pagrieziena ÷ 2) pagriezienā.
- **Pa līniju**: divu pušu spriegumu starpība stūrī vai leņķī; piekaramā balstā tikai ledus vienā pusē (katrs posms aprēķināts atsevišķi, kas ir drošības pusē).
- **Vertikālā**: vertikālā slodze uz metru × svara posms (starp zemākajiem punktiem abās pusēs) plus iekārtas.

Horizontālā slodze tiek pārnesta uz balsta nominālo punktu (ekvivalentā slodze = slodze × stiprinājuma augstums ÷ nominālā punkta augstums) un salīdzināta ar tā **nominālo slodzi** × noteikumu kopas koeficients. Ja tas ir par vājš, tiek ieteikts mazākais tā paša materiāla balsts jūsu bibliotēkā, kas to notur. Balsts ar **stiepi** nodod horizontālo slodzi stiepei, kas notur slodzi ÷ sin(stiepes leņķis) un tiek pārbaudīta pret savu novērtējumu.

Armatūra (skavas, izolatori, šķērssijas) tiek pārbaudīta pret savu novērtēto slodzi: enkurojošā armatūra notur vadītāja spriegumu, piekaramā armatūra — savu daļu no vertikālās un šķērsvirziena slodzes. Rādītais **pamats** ir balsta dziļums zemē un bedre, kas nedaudz platāka par tā pamatni.

## Dati, savienojumi un strāva

- Vienums ar tukšu nepieciešamu lauku vai atslēgu, kas nav bibliotēkā.
- Kabeļa maršruta gals vai iekārta, kas nav savienota ar neko.
- **Sprieguma zudums** un **strāva** no katra avota (iekārta, kas atzīmēta kā avots) līdz slodzēm (kW un jaudas koeficients iekārtām) pa gaisvadu posmiem un kabeļiem: √3·I·L·(R cos φ + X sin φ), ar R 20 °C. Ja tā pārsniedz kabeļa strāvas vērtību vai zudums ir lielāks par noteikumu kopā atļauto, tas tiek atzīmēts.
