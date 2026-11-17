---
title: Vandamál og BCF
summary: Festu vandamál á grunnmyndina, veglínustöð, yfirborðspunkt eða pípu, gefðu því stöðu og athugasemdir og skiptu vandamálum út sem BCF 2.1 skrám ásamt LandXML skránni.
keywords: vandamál, bcf, athugasemd, merking, galli, vinnusvæði, festa, staða, opið, leyst, lokað, BIM-samvinnusnið, landxml, vandamál
from: e44153b1
---

Vandamál er athugasemd sem er fest á ákveðinn stað í CivilCraft teikningunni þinni, með titli, stöðu og athugasemdum. Notaðu það til að segja starfsfólki á vinnusvæði eða öðru forriti hvað á að skoða, og til að lesa svörin til baka.

## Bæta við vandamáli

1. Opnaðu **Yfirborð, Meira, Vandamál (BCF)...**
2. Skrifaðu titil og það sem er að.
3. Veldu hvar á að festa það: miðju grunnmyndarinnar, yfirborðspunktinn í miðjunni, stöð á völdu veglínunni (skrifaðu stöðina og útfærslu, hægri er jákvætt) eða valda pípu, mannvirki eða einkennislínu.
4. Ýttu á **Bæta við vandamáli**. Festan birtist á grunnmyndinni sem lítill tígull með númerinu sínu.

Smelltu á titil vandamáls til að aðdráttast að því, breyttu stöðu þess í listanum (Opið, Virkt, Leyst, Lokað) og bættu við athugasemdum. Hver breyting er eitt skref í afturköllun og vandamálin eru vistuð í verkskránni.

## Skiptu þeim út sem BCF

- **Flytja út BCF** skrifar BCF 2.1 skrá með einu umfjöllunarefni fyrir hvert vandamál: titil, stöðu, athugasemdir og eitt sjónarhorn með hornréttri grunnmyndarmyndavél og festunni.
- **Flytja inn BCF** les BCF skrá (2.0 og 3.0 skrár eru lesnar eins langt og þær passa við 2.1). Umfjöllunarefni með guid sem þú átt nú þegar uppfærir það vandamál (stöðu, nýjar athugasemdir) í stað þess að bæta við öðru.
- **Úr vandamálum** býr til vandamál úr hverri opinni færslu í vandamálaglugganum sem segir hvar hún er.

BCF ber metra í eigin hnitakerfi þessa verkefnis, án færslu. Hitt forritið verður að vera í sama hnitakerfi og LandXML skráin þín svo að festurnar lendi á réttum stað. Hluturinn sem festan vísar á (veglína, stöð, útfærsla, pípa) berst sem merkimiðar sem byrja á „cc:“, og CivilCraft les þá til baka.

## Það sem er ekki prófað

Festurnar og sjónarhornin voru aðeins prófuð með því að skrifa skrá og lesa hana aftur í CivilCraft. Ekkert annað BIM forrit hefur opnað þær enn, og það hvort BCF „view to world scale“ merkir alla eða hálfa hæð sýnarinnar er mismunandi á milli forrita: CivilCraft skrifar alla hæðina.
