---
title: Teikna loftlínu
summary: Settu stoðvirki á grunnmynd, láttu CivilCraft reikna út hlutverk hvers stoðvirkis og kaflana á milli endastoða, og færðu stoðvirki á grunnmynd eða á langsniði línunnar.
keywords: loftlína, stoðvirki, staur, spönn, kafli, endastoð, horn, burðarstoð, langsnið, hæð, þverbiti, stag, akkeri
from: b8e5e272
---

## Teiknaðu hana

1. Hafðu yfirborð: landið undir línunni kemur úr því ([Byggja yfirborð](topic:build-surface)). Stoðvirki án lands undir sér er skráð undir **Athuganir**; sláðu inn **Landhæð** þess í Eiginleikum í staðinn.
2. Smelltu á {{ui:Lína}} í hópnum **Háspennulínur** og smelltu á hvert stoðvirki á grunnmynd.
3. Tvísmelltu á það síðasta, eða ýttu á {{key:Enter}}.

Línan fær leiðarann, stoðvirkið og búnaðinn sem þú notaðir síðast á þessari tölvu (í fyrsta skipti: dæmi úr safninu). Breyttu þeim í Eiginleikum.

## Línan í Eiginleikum

Veldu línuna (smelltu á spönn) til að stilla **Leiðara**, **Leiðara á hverja rás**, **Rásir**, **Spennu**, **Bilsregluna** sem hún þarf að halda yfir landinu, og búnaðinn **Á hverju stoðvirki** (þverbita, einangrara, tengihluti). Taflan listar **kafla** hennar með viðmiðunarspönn hvers þeirra, venjulegri strekkjaspennu og álagstilvikinu sem stjórnar honum.

## Stoðvirki

Smelltu á stoðvirki til að velja það. Í Eiginleikum:

- **Stoðvirki**: safnatriði þess. Þegar það er of veikt setur {{ui:Nota …}} minnsta stoðvirkið af sama efni í safninu þínu sem ber álagið.
- **Hlutverk**: Sjálfvirkt, Burðarstoð, Hornstoð eða Endastoð. Sjálfvirkt þýðir: fyrsta og síðasta stoðvirki eru endastoðir; beygja yfir reglubundnu horni verður hornstoðvirki, og stærri beygja verður endastoð.
- **Hæð yfir landi**: autt tekur hana úr safnatriðinu (lengd þess mínus dýptin í jörðinni).
- **Á þessu stoðvirki líka**: aukabúnaður, eins og **stag** (akkeri). Stoðvirki með stagi flytur tog línunnar yfir á stagið.
- **Stoðvirki sem fyrir er**: það er athugað eins og hin en er ekki talið í magntölum.

{{ui:Stoðvirki}} bætir stoðvirki við spönnina næst smellinum þínum. Dragðu stoðvirki á grunnmynd til að færa það. {{ui:Eyða}} fjarlægir það (lína heldur að minnsta kosti tveimur).

Kaflar ganga á milli endastoða: innan kafla liggur leiðarinn frjálslega í gegnum burðarklemmurnar, svo ein strekkjaspenna gildir fyrir allan kaflann.

## Langsnið línunnar

Smelltu á {{ui:Langsnið}} (eða **Langsnið** í Eiginleikum línunnar). Spjaldið undir grunnmyndinni sýnir landið meðfram línunni, hvert stoðvirki frá landi upp á topp, lægsta fasa leiðarans við **Álagstilvik** sem þú velur, og bilið sem línan þarf að halda sem brotna línu. Spönn sem fellur er rauð; talan undir hverri spönn er lægsta bil hennar.

- **Lína** velur loftlínuna sem á að sýna. Að velja aðra línu, eða eitt af stoðvirkjum hennar, á grunnmynd skiptir langsniðinu yfir í hana.
- Færðu bendilinn yfir langsniðið: leiðarlína fylgir honum, og merkingin sýnir fjarlægðina eftir línunni, landið, leiðarann og bilið þar (og segir þegar bilið er undir reglu línunnar).
- {{ui:Mæla}} í stiku langsniðsins: smelltu á tvo punkta til að fá lárétta fjarlægð á milli þeirra, hæðarmismun, beina fjarlægð og halla. Smellur nálægt landinu, leiðaranum eða toppi stoðvirkis festist þar. Smelltu aftur á {{ui:Mæla}} til að hætta.
- Hindranir sem línan fer yfir rísa upp úr landinu: teiknaðar sem stikur, plöntur í landslagi sem krónur sínar, veggir sem stikur (sjá [Athuganir á háspennulínum](topic:power-line-checks#clearances)). Kapalleiðir og lagnir sem línan fer yfir eru merktar undir landinu við toppinn, með heiti sínu.

- Dragðu stoðvirki til hliðar til að færa það eftir línunni.
- Dragðu toppinn upp eða niður til að stilla hæð þess yfir landinu.
