---
title: Pinna koostamine ja täpsustamine
summary: Kuidas CivilCraft trianguleerib olemasoleva maapinna ning kuidas seda kujundada murdejoonte rühmade, joonistatud murdejoonte, välispiiri ja pikima välisserva abil.
keywords: TIN, pind, triangulatsioon, murdejoon, piirjoon, olemasolev maapind, loo pind, Delaunay, kolmnurgad, maksimaalne serv, väline piirjoon
from: b9eea3f3
---

CivilCraftil on projekti kohta üks olemasolev maapinna pind. See on TIN (kolmnurgastatud ebaregulaarne võrk) sinu punktidest ja see koostatakse automaatselt uuesti iga kord, kui mõni sisend muutub. Puudub „koosta uuesti“ käsk ning pole vananenud pinda.

## Mis pinda läheb

- Iga kõrgusega punkt rühmas, mis on seatud {{ui:Punktid}}-iks.
- Iga rühm, mis on seatud {{ui:Murdejoon}}-iks, ühendatud punktinumbri järjekorras.
- Iga murdejoon, mille joonistad {{ui:Murdejoon}} tööriistaga.
- Väline piirjoon, kui joonistad selle.
- Seade **Pikima välisserva pikkus**.

Kolmnurgad ei ületa kunagi murdejoont: pind sunnitakse seda järgima ja seejärel tehakse see võimalikult ühtlaseks selle ümber (muidu Delaunay).

## Muuda koodiga jooned murdejoonteks

1. Vasakpoolses paneelis rubriigis **Punktid** leia rühm (näiteks FL).
2. Sea selle **Pind**-valikuks {{ui:Murdejoon}}.
   Pind koostatakse uuesti, joon joonistatakse oranžina (kui {{ui:Murdejooned}} on rubriigis **Kuva** sisse lülitatud) ja **Murdejooned** pinna faktides suureneb ühe võrra.
3. Kontrolli joont plaanil. See peab kulgema punktist punkti selles järjekorras, milles joon mõõdeti. Kui see siksakib, sisaldab rühm rohkem kui ühte joont või punkte pole numbrite järjekorras: sea rühm tagasi {{ui:Punktid}}-iks ja joonista jooned käsitsi (järgmine jagu).

## Joonista murdejoon läbi punktide

1. Vajuta {{key:B}} või klõpsa rühmas **Pind** nupule {{ui:Murdejoon}}.
   Vihje ütleb: „Murdejoon: klõpsa mõõdistuspunkte järjekorras (see võtab nende kõrgused). Enter lõpetab.“
2. Liiguta kursor punkti lähedale. Väike oranž ruut märgib punkti, mida see võtab.
3. Klõpsa joone punkte ükshaaval. Iga klõps nimetab punkti ja selle kõrguse olekuribal.
4. Lõpeta vajutusega {{key:Enter}}.
   Olekuribal on „Murdejoon 1 lisatud; pind koostati uuesti.“

Klõps peab tabama mõõdistuspunkti, millel on kõrgus; mujale klõpsamine lükatakse tagasi teatega „Klõpsa mõõdistuspunkti, millel on kõrgus: murdejoon võtab punktide kõrgused.“ {{key:Backspace}} eemaldab viimase punkti; {{key:Esc}} tühistab kogu joone.

:::warning
Lõpeta klahviga {{key:Enter}}. Topeltklõps lõpetab ka, kuid selles versioonis eemaldab topeltklõpsatud punkti. Klõpsa viimasel punktil üks kord ja vajuta seejärel {{key:Enter}}.
:::

Kõigi joonistatud murdejoonte korraga eemaldamiseks klõpsa rubriigis **Pind** nupule {{ui:Eemalda joonistatud murdejooned}}. Ainult viimase eemaldamiseks kasuta {{key:Mod+Z}}. Joonistatud murdejooni ei saa veel ükshaaval valida ega muuta.

## Joonista väline piirjoon

Piirjoon lõikab pinna alale, mida usaldad, näiteks mõõdistuspiiridele, nii et pikad kolmnurgad mõõdistamata nurkade vahel kaovad.

1. Vajuta {{key:O}} või klõpsa nupule {{ui:Piirjoon}}.
2. Klõpsa nurgad järjekorras ümber ala. Kriipsjoon näitab kuju.
3. Vajuta {{key:Enter}}.
   Olekuribal on „Piirjoon seatud; piirjoonest väljaspool olevad kolmnurgad on kadunud.“ **Piirjoon** pinna faktides ütleb „Jah“ ja nurkade arvu.

Mida tasub teada:

- Piirjooni on üks. Uue joonistamine asendab vana. {{ui:Eemalda piir}} võtab selle ära.
- See ainult lõikab: piirjoon, mis ulatub punktidest kaugemale, lõigatakse tagasi nende piirjooneni koos märkusega „Piirjoon ulatub punktidest kaugemale; see lõigati tagasi nende piirjooneni.“
- Selle nurgad võtavad oma kõrguse pinnalt, nii et serv järgib maapinda täpselt.
- Varjatud (sisemised) piirjooned pole veel saadaval.

## Lõika pikad välised kolmnurgad

Ilma piirjooneta täidab pind kogu punktide kontuuri, kaasa arvatud pikad õhukesed kolmnurgad nõgusate servade vahel.

1. Rubriigis **Pind** sisesta pikkus väljale **Pikima välisserva pikkus** ja vajuta {{key:Enter}}. Alusta umbes kahe kuni kolme korraga oma tavalisest mõõtmisvahest.
2. Välised kolmnurgad, mille väliserv on sellest pikem, eemaldatakse, töötades sissepoole, kuni iga väliserv on piisavalt lühike. Murdejoone serva ei eemaldata kunagi.
3. Sisesta 0, et hoida kõik kolmnurgad jälle alles.

## Loe pinna aruannet

Pinna faktide all on kast, mis loetleb, mida koostaja tegi. Ocher-värvi riba vasakul tähendab teavet; punane riba tähendab viga ja pinda ei ole.

| Teade | Tähendus |
|---|---|
| „3 punkti asusid teise punktiga samas kohas ja liideti sellega.“ | Plaanil alla 0.0001 kaugusel olevad punktid said üheks tipuks (esimene jäi alles). |
| „2 kohal on kaks erinevat kõrgust …“ | Üksteise peal olevad punktid või ristuvad murdejooned erinevad kõrguselt. Murdejoone kõrgus võidab, siis esimene. |
| „1 murdejoone lõiku ei saanud pinda sundida.“ | Väga lühike või peaaegu kattuv murdejoone lõik ei mahtunud; kontrolli seda kohta. |
| „Pind vajab vähemalt kolme kõrgusega punkti.“ | Liiga vähe punkte: kontrolli veergude järjekorda ja rühmi. |
| „Punktid on kõik ühel joonel: kolmnurki pole.“ | Punktidel pole laiust, näiteks üks ühe joone mõõdistus. |
| „Piirjoon ei kattu punktidega.“ | Piirjoon asub mujal, sageli ühikute või koordinaatide segiajamise tõttu. |
| „Piirjoone sees pole ühtegi kolmnurka alles.“ | Piirjoon on liiga väike või vales kohas. |

## Pind LandXML-ist

Kui avad LandXML-i, kasutatakse selle esimest TIN-pinda sellisena, nagu see on: pinna pealkiri ütleb „Pind (LandXML-ist)“ ja **Pikima välisserva pikkus** on hall. Kuni see pind on kasutusel, ei muuda murdejoonte rühmad, joonistatud murdejooned ega uus piirjoon seda. Pinna koostamiseks faili punktidest klõpsa nupule {{ui:Koosta pind uuesti punktidest}}. {{key:Mod+Z}} toob LandXML-i pinna tagasi.

## Seotud

- [Loe kontuure, kõrgusi ja kaldeid](topic:contours).
- [Impordi mõõdistuspunkte](topic:import-points).
