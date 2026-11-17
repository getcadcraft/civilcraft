---
title: Hoos-u-dhac iyo tension
summary: Xaaladaha culeyska (heerkulka, dabaysha, barafka) iyo xaddidaadda tension-ka, sida CivilCraft u xisaabiyo tension-ka qayb kasta, iyo miisaska isku-xirka.
keywords: sag, tension, xaalad culeys, heerkulka, dabaysha, barafka, barafka dhinac-kaliya, ruling span, equivalent span, isbedelka xaaladda, catenary, miiska isku-xirka, xoogga jabinta, xoogga caadiga ah
from: f8876c35
---

## Xaaladaha culeyska iyo xaddidaadda

{{ui:More}} › {{ui:Load cases and limits…}} wuxuu tafatiraa xeerarka uu mid kasta oo mashruuca ku jira raacayo.

- **Load cases**: heer (temperature), cadaadis dabaysha ee conductor-ka (Pa), iyo barafka radial-ka (mm, iyo cufnaanteeda). Kiiska koowaad waa tixraaca.
- **Tension limits**: qayb ka mid ah xoogga jabinta ee conductor-ka, tension-ka dhexe ama tension-ka ugu weyn ee tiirka, hal xaalad culeys. Ama siiso tension-ka dhexe adigu.
- **Clearances**: masaafada ay conductor-ku ka hayso dhulka, waddada, dhismaha iwm. Ku dar, magac beddel, ka saar: kuwaagu waa kaaga. Hoosta, dooro xeerarka **Landscape plants under a line**, **Landscape walls under a line** iyo **Underground crossings**.
- **Cases the checks use**: kiiska ku bixiya hoos-u-dhaca ugu weyn (kulul), beddelka insulator-ka (dabaysha), barafka, iyo barafka dhinac kasta oo tiir ah.
- **Factors**: factor-ka fogaanshaha phase k, beddelka insulator-ka ugu weyn, factor culeyska tiirka iyo fittings, xagasha leexashada ee tiirka xagasha iyo dead-end, daboolka ugu yar ee kaablooyinka hoosta, iyo hoos-u-dhaca voltage-ka ugu weyn.

## Packs: xeerarka iyo maktabad dal ah

Waxba xeerar dal ah lagu dhisin CivilCraft ma jiraan. **Pack** wuxuu hayaa xeer-jeeg iyo maktabad isku fayl ah (`.cclinepack.json`), dal, shirkad hawlgal ama shirkad:

- **Kaydi sida pack…** {{ui:Load cases and limits…}} hoosta wuxuu qoraa xeer-jeeggii la muujiyay iyo maktabaddaada (ama, haddii maktabaddaadu weli madhan tahay, shayada mashruucan isticmaalo). Marka hore qor **Dal ama gobol**.
- **Fur xeer-jeeg ama pack…** wuxuu akhrinayaa pack, fayl xeer, ama fayl maktabad. Xeerarka pack-ka waa la muujiyaa wada-hadalka (riix **Codso** si aad u isticmaasho), shayadiisana waxay galaan maktabaddaada.
- Packs-ka kuwa kale la wadaagaan waxaa lagu liistaa bogga kordhinta hoose ee **Power line packs**. Laba pack oo tusaale ah ayaa qaabka tusaaya; ma aha xeerarka dal kasta.

Pack kasta waa la hubiyaa marka la furo, sida fayl kasta. Qiime kasta ka hubi heerka khuseeya ka hor intaadan wax dhisin.

Laba xeer-jeeg oo tusaale ah ayaa jira si aad uga bilaabato: **Tusaale: cimilada qaboow** iyo **Tusaale: cimilada dhexdhexaad**. Tirooyinkoodu ma ka iman heer kasta: dejiso qiyamka heerkaaga siiyo. {{ui:Save rules}} iyo {{ui:Open rules…}} waxay la wadaagaan xeer-jeeg fayl ahaan.

## Sida tension-ka loo xisaabiyo

Qayb kasta oo u dhexeeya dead-end-ka:

1. **Ruling span** waa √(ΣL³ ÷ ΣL) ee bannaanadiisa.
2. Xad kasta waxaa loo beddelaa tension dhexe oo kiiska tixraaca ah, isla-miisaan isbedelka xaaladda ee ruling span-ka: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Kan ugu adag ayaa dejiya tension-ka.
3. Tension-ka kiis kasta culeys wuxuu raacaa kaas, bannaan kasta qaabkeeda waa catenary sax ah oo mara labada barta lagu xiro (bannaanada buuraha ku jira ayaa la daba-galay): hoos-u-dhaca laga qaaday chord-ka, dhererka, iyo tension-ka labada dhamaadba.

Culeyska mitir kasta kiis kasta: miisaanka iyo barafka (aagga barafka × cufnaanta × g) si toosan; cadaadiska dabaysha × dhexroorka barafka si siman.

## Miisaska isku-xirka

{{ui:More}} › {{ui:Stringing tables…}} wuxuu liistaa, qayb kasta, tension-ka dhexe iyo hoos-u-dhaca bannaan kasta heerkulka kasta ee xeerarka (−5 °C ilaa 40 °C, 5 °C kasta marka laga bilaabo), hawada aan dhaqdhaqaaqin. Keydi, iyo miiska tiirarka, CSV ahaan.

Lama xisaabin: creep-ka conductor-ka sanadaha, iyo fidinta conductor cusub. Ku dar iyagoo heerkulka kaga dhex mara meelaha aad ku xidhayso.
