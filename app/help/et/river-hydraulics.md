---
title: Jõe veepinna profiilid
summary: Modelleeri jõgi maapinna järgi ja arvuta püsivad veepinna profiilid standardse sammumeetodiga: veetasemed, energia, kiirused, Froude'i arvud ja üleujutuse ulatus plaanil. Laborifunktsioon; iga tulemus vajab insenerilt läbivaatust.
keywords: tamm, ebaefektiivne voolupind, lõigete redaktor, jõgi, hüdraulika, veepinna profiil, tagasipaisutus, standardne samm, püsivool, 1D, ristlõiked, Manning, karedus, kandevõime, kriitiline sügavus, normaalsügavus, Froude, energiajoon, üleujutuse ulatus, üleujutusala, üleujutus, kaldapiirid, lõigu pikkused, kokkutõmbumine, laienemine, allkriitiline, ülekriitiline, segarežiim, hüdrauliline hüpe
from: fb8bf425
---

CivilCraft arvutab püsiva, ühemõõtmelise veepinna profiili mööda jõge: iga sisestatud voolu kohta veetaseme igas ristlõikes, naaberlõikude energiabilansist (standardse sammu meetod). Funktsioon on laboris, kuni seda kontrollitakse.

**Ainult abivahend.** Veetasemeid ei tohi keegi usaldada enne, kui kvalifitseeritud insener on need läbi vaadanud: 1D-mudel on sama hea kui tema lõiked, karedusväärtused, lõigu pikkused ja piirtingimused ning ta ei tea sildadest, truupidest ega jõest välja voolavast veest.

## Joonista jõgi

1. Koosta kõigepealt olemasolev maapind (punktid, murdejooned või avatud TIN).
2. Vali **Pind** › {{ui:More}} ja vali {{ui:River}}.
3. Klõpsa mööda jõe keskjoont **ülesvoolu kuni allavoolu**, seejärel vajuta {{key:Enter}} või tee topeltklõps.

CivilCraft lõikab keskjoonega risti lõigu iga 50 m (200 ft) järel, 100 m (300 ft) mõlemale poole maapinnast. Jõe pikettid mõõdetakse allavoolu otsast, nii et need kasvavad ülesvoolu. Kaldad on algul oletuslikult 10 m (30 ft) kummalgi pool iga lõigu madalaimat punkti.

Lõigu lisamiseks kohta, kus jõgi kitseneb või asub rajatis, vali jõgi, klõpsa {{ui:Add a section}} ja joonista sellest üle lõikejoon (kumbki suund: see pööratakse nii, et see kulgeb allavoolu vaadates vasakult paremale).

## Seadista jõgi

Vali jõgi, et näha seda **Omadustes**:

- **Voolurežiim**: allkriitiline (tavaline juhtum: arvutatakse ülesvoolu allavoolu piirtingimusest), ülekriitiline (arvutatakse allavoolu ülesvoolu piirtingimusest) või segarežiim (mõlemad; seejärel see, millel on igal lõigul suurem erijõud; eelvaade).
- **Voolu profiilid**: nimi ja vool kummagi kohta (näiteks 10-aastane ja 100-aastane vool) ning piirtingimus allavoolu otsas (ja ülesvoolu otsas, kui režiim ei ole allkriitiline): **Normaalsügavus** koos energiakaldega (põhja kalle on esialgne hinnang), **Teadaolev veepinna** kõrgus või **Kriitiline sügavus**.
- **Lõiked maapinnast**: samm, kui kaugele vasakule ja paremale, kaldaoletus ning kaks Manningi n väärtust; {{ui:Cut sections again}} asendab lõigud (üks tagasivõtmise samm).
- **Lõigete tabel**: iga lõigu kohta vasaku ja parema kalda nihked, kanali n ja üleujutusala n, lõigu pikkused järgmise lõiguni allavoolu (vasak üleujutusala, kanal, parem üleujutusala; mõõdetud plaanilt alates) ning kokkutõmbumise ja laienemise koefitsiendid (algul 0.1 ja 0.3: sujuvad üleminekud). {{ui:Edit}} avab lõigete redaktori (järgmine); punkt selle järel tähendab, et lõigul on tamm või ebaefektiivne ala.

Iga muudatus on üks tagasivõtmise samm ({{key:Mod+Z}}).

## Lõigu redigeerimine: kaldad, tammid ja ebaefektiivsed alad

{{ui:Edit}} lõigul joonistab selle maapinna ja laseb sul lohistada, mida lahendaja loeb: **vasak ja parem kallas** (need jagavad lõigu vasakuks üleujutusalaks, peakanaliks ja paremaks üleujutusalaks), **tamm** kummalgi pool ning **ebaefektiivsed voolualad**. Iga käepidet saab liigutada ka nooleklahvidega ning iga arvu saab sisestada graafiku kõrvale. {{ui:Apply}} on üks tagasivõtmise samm.

- **Tamm** on asukoht (nihe) ja harja kõrgus. Jõest eemal asuv maa tammi taga eraldatakse jõest, kui veepind on harja all: selle pindala, märgitud piirjoon ja neeldumisvõime jäetakse välja. Harja kohal loetakse kogu lõik uuesti. Tamm asub kaitstava kalda väljaspool; kalda sees olev tamm märgitakse.
- **Ebaefektiivne voolu ala** hoiab vett, kuid ei kanna voolu (tammi taga olev madal ala, sillapealse kõrval seisev vesi). Anna selle kaks nihet ja, kui soovid, veetase, mille all ala on ebaefektiivne ({{ui:always}}, kui tühi): sellest kõrgemal voolab see nagu ülejäänu. Ala, mis katab osa peakanalist, märgitakse.
- Kahe lõigu vahel jääb üleujutuse ulatuses kuivaks maa, mis asub tammi taga, mida mõlemad lõigud omavad, kui veepind seal on harja all (joon kahe harja vahel on sirge).

## Arvuta ja loe tulemusi

Klõpsa {{ui:Water surface profiles}}. Valitud profiili kohta saad:

- **graafiku** mööda jõge (vool vasakult paremale): kanali põhi, kaldad, veepind, energiajoon ja kriitiline veepind; kriitilisel sügavusel hoitud lõigud on ringitud;
- **tabeli** iga lõigu kohta: jõe pikett, vool, kanali põhi, veepind, kriitiline veepind, energiajoon, sügavus, kiirus kanalis ja üldine, kanali Froude'i arv, voolupindala, laius ülevalt, vool igas üleujutusalas ja kanalis, energiakalle ning hoiatused;
- **hoiatused** lihtsas keeles, näiteks lõik on seatud kriitilisele sügavusele, vesi on lõigu otstest kõrgemal või kandevõimes on suur muutus kahe lõigu vahel (lisa vahele lõigud).

{{ui:Table (CSV)}}, {{ui:Report}} (lihttekst meetodi, piirtingimuste ja iga tabeliga) ja {{ui:Plot (SVG)}} salvestavad allalaadimiste kausta. Igaühel on ülevaatuse rida.

Märgi {{ui:Show the flood extent}} **Omadustes**, et varjutada märg ala plaanil valitud profiili jaoks; veepiir joonistatakse sinna, kus sügavus on null. Lõikude vahel on veepind üle jõe ühtlane ja muutub lineaarselt jõe pikettidega. Tamme taha jäävat maad hoitakse kuivana, kui vesi on harja all. Muu madal maa jõe koridoris, kuhu vesi ei pääse (näiteks teetammi taga), on siiski varjutatud: kontrolli seda.

## Joonistusel ja probleemides

Jõe jooned lähevad plaanile, PDF-ile ja DWG-le omaette kihtidel: **C-WATR-CNTR** (keskjoon), **C-WATR-SCTN** (iga lõikejoon koos jõe pikettiga) ja **C-WATR-FLOD** (üleujutuse ulatuse veepiir, kui {{ui:Show the flood extent}} on profiili jaoks märgitud). Jõe hoiatused (lõik kriitilisel sügavusel, vesi lõigu otstest kõrgemal, kandevõime muutus, mis nõuab rohkem lõike, energiabilanss, mis ei sulgunud, tamm kalda sees) lähevad ka **Probleemide** paneeli, seotuna jõega ja paigutatuna lõigule, millest need pärinevad.

## Kuidas arvutatakse

- Energia kahe lõigu vahel: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Kandevõime alajaotuse teel: iga üleujutusala jagatakse seal, kus tema n muutub, K = Σ (1/n)·A·R^(2/3) (1.486/n USA ühikutes); kanal on üks tükk, koos liitkaredusega, kui tema n muutub. α tuleneb sellest, kuidas kandevõime jaguneb.
- Hõõrdekalle keskmise kandevõime järgi, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², voolu kaaluga lõigu pikkusel.
- Kokkutõmbumise koefitsient, kui vool allavoolu kiireneb; laienemise koefitsient, kui see aeglustub.
- Kriitiline sügavus = väikseim erienergia. Iga veetase lahendatakse piirkonnas, nii et see ei hüppa kriitilise vale poole; kui vastust ei ole, seatakse see kriitilisele sügavusele ja märgitakse.

Programmi kontrollitakse Manningi normaalsügavuse, ristkülikukujulise kanali kriitilise sügavuse ja Chow' tagasipaisutuse näitega (*Open-Channel Hydraulics*, 1959, 10. peatükk), mida on integreeritud sõltumatult. Sama meetodit kasutavad levinud 1D-jõeprogrammid, nii et käsitsi arvutus või üliõpilase märkmed sobivad.

## Truubid ja sillad

Jõe **Omaduste** all **Truubid ja sillad** lisab {{ui:Add a culvert}} või {{ui:Add a bridge}} ühe kahe lõigu vahele (iga lõik säilitab vähemalt kaks). Sellest allpool olev profiil ei muutu; selle kohal olev veepind tuleb rajatisest ning profiil jätkub ülesvoolu sealt. **Tulemused** lisab iga rajatise kohta tabeli: allvoolu veetase, ülesvoolu veetase, milline juhtimine määrab, ava kaudu voolav vool ja tee või tekiga üle voolav vool. Ainult allkriitiline vool.

- **Truup** (kast või ümmargune, üks või mitu võrdset toru). Sisselaske juhtimine on pais-voolus, kui sisend on vaba, ja avavoolus, kui see on üle ujutatud, segatuna ülesvoolu veetaseme vahemikus ühest kuni poolteist korda tõusu kõrguseni. Väljavoolu juhtimine on energiabilanss: sisselaskekadu, hõõrdumine ja väljumiskiiruse kõrgus, üle kõrgema seest allvoolu veetaseme ja kriitilise sügavuse keskkõrguse ning laega, miinus langus mööda toru. Ülesvoolu veetase on suurem neist kahest. Märgi **Vesi võib minna üle tee**, siis jagab tee pais-vool toruga voolu.
- **Sild.** Ava on lõik silla all, lõigatuna tugisammaste kohalt; iga sammas on pindala, mis ei kanna voolu. Veepind avas tuleb allpool asuvast lõigust (laienemise koefitsient) ja ülal asuv lõik avast (kokkutõmbumise koefitsient). Kui ava ei suuda sellel allvoolu veetasemel voolu läbi lasta, jookseb see kriitilisel sügavusel ja sild märgitakse ummistuvana. Kui vesi jõuab madala talani, on vool survevool (lukutüüpi, kui allvoolu veetase on madala talast allpool, üle ujutatud, kui kõrgemal), ja tekil olev vesi lisab pais-voolu; ülesvoolu tase on see, mille juures need liituvad voolu väärtuseni.

Koefitsiendid (läbilaskevõime, sisselaskekadu, pais) on ümmargused vaikeväärtused. Muuda neid oma projekti järgi. Need ei ole sobitatud kaardid, mida truupide projekteerimise käsiraamatud trükivad, seega käsitle truubi ülesvoolu veetaset selle piiri lähedal hinnanguna. Vesi üle tee või tekki, uputatud sisend, ummistunud ava ja kiire vool torus on näidatud **Probleemides**.

## Mittestatsionaarne vool

{{ui:Unsteady flow…}} jõe **Omadustes** suunab üleujutuse hüdrogrammi mööda lõike. Sisesta sissevool tundidena ja vooludena, üks paar rea kohta, allvoolu kalle (normaalsügavus) ning kui kaua käitada. See algab püsivast veepinnast esimesel voolul ja lahendab täieliku ühemõõtmelise võrrandi (kaalutud neljapunkti implitsiitne skeem, aja kaal 0.6). Saad iga lõigu tippveetaseme ja voolu koos tunniga, millal see toimub, graafiku mõlema otsa voolude kohta ning mahukontrolli (sisse, välja ja salvestatud muutus). Seda kontrollitakse selle järgi, et püsivool jääb püsivaks, sissevoolu samm lõpeb uue voolu püsiva profiiliga, maht sulgub ja üleujutuslaine kiirus võrreldakse kinemaatilise lainega. Ainult allkriitiline vool, üks lõik, ilma külgsissevooluta ning ilma truupide ega siltadeta käigu sees.

## Ühinemised

Lõigud, mis ühinevad ühe väljavooluni: vood liituvad, ja allvoolu lõigu algusel olev veepind kantakse üles ühinevate lõikude otsteni (sama veepind ristumiskohal; lihtne meetod, kus nurka ega impulssi ei arvestata, seega sobib see madalatele Froude'i arvudele). Mudel ja testid on paigas (`river-structures.js`); paneel kahe jõe ühendamiseks plaanil ei ole veel valmis.

## Veel pole valmis

Pais ja väravad omaette rajatistena, ühinemiste paneel, rajatised mittestatsionaarses käigus ja ülekriitiline mittestatsionaarne vool. Segarežiimi käik märgib hüdraulilise hüppe kahe lõigu vahel, kuid ei paiguta seda.

**Kus jõed ühinevad.** Jõe **Omadustes** nimetab „Voolab sisse“ jõe, kuhu see ühineb. Ühinevad jõed lahendatakse koos: jõgi, kuhu nad voolavad, kannab nende voolude summat ja iga neist lõpeb selle jõe esimese lõigu veepinna juures (võrdse veepinna meetod; see jätab välja voolude nurga ja impulsi). Peajõe ja oja ühendamiseks joonista ühinemiskohast allapoole lühike jõgi ja lase mõlemal sinna voolata. Tulemused näitavad ühinemise tabelit. Nende tulemuste vaikeväärtused (kokkutõmbumine 0.1, laienemine 0.3, üheosaline kanal liitkaredusega, segarežiim erijõu järgi) jäävad alles, kuni insener need üle vaatab, ja tulemused ütlevad seda.
