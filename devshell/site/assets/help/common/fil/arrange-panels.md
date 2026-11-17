---
title: Ayusin ang mga panel at gumamit ng pangalawang monitor
summary: I-dock ang mga side panel sa kaliwa, kanan o ibaba, i-stack ang mga ito, pagsamahin bilang tab, i-pin o itago, ilutang sa ibabaw ng drawing, gawing mas siksik ang layout, piliin kung ilang linya ang gagamitin ng toolbar, o ilipat ang mga ito sa sarili nilang window sa ibang screen.
keywords: panels, dock, float, ilipat ang panel, drag, layout, tabs, tab group, stack, pin, auto-hide, itago ang panel, isara ang panel, compact, density ng layout, siksik, toolbar rows, wrap, 1 row, 2 rows, linya ng toolbar, pangalawang monitor, dalawang screen, dual monitor, maraming monitor, window, pop-up, i-reset ang layout
from: 49530239
---

Maaaring ilipat ang mga panel sa tabi ng drawing. Ilagay ang mga ito kung saan bagay sa iyo, o bigyan ng sariling window sa pangalawang monitor para buong una ang magamit ng drawing.

:::note
Bawat panel ay may title bar: manipis na bar na may pangalan ng panel, isang {{ui:⋯}} menu, pin at close button sa itaas ng panel. Ang mga bersyon bago ang 0.7 ay may pangalan at {{ui:⋯}} menu lang.
:::

## Ilipat ang panel sa window

1. I-drag ang panel sa pamamagitan ng pangalan nito sa itaas.
2. Habang dina-drag mo, lalabas ang mga naka-outline na lugar sa kaliwa, kanan at ibaba ng drawing. Bitawan ang panel sa isa sa mga ito para i-dock doon. Didilim ang lugar na kinaroroonan mo.
3. Bitawan ito kahit saan sa ibabaw ng drawing para lumutang.

Puwedeng magsama ang mga panel sa iisang gilid: nagsa-stack sila, at bawat linya sa pagitan ng dalawa ay puwedeng i-drag para pagsaluhan ang espasyo (kapag naka-focus ang isang linya, inililipat ito ng arrow keys, at ang double-click dito ay naghahati nang pantay ng espasyo). I-drag ang panloob na gilid ng naka-dock na gilid para gawin itong mas malapad o mas makitid; i-double-click ang gilid para ibalik ito.

Mananatili ang lumulutang na panel sa ibabaw ng drawing. Ilipat ito sa pamamagitan ng pangalan nito, at baguhin ang laki sa pag-drag sa ibabang kanang sulok nito (o mag-tab papunta sa sulok at gamitin ang arrow keys). I-double-click ang pangalan nito para i-dock ulit sa dating lugar.

:::touch
I-drag gamit ang isang daliri sa pangalan ng panel. I-drag gamit ang isang daliri ang ibabang kanang sulok ng lumulutang na panel para baguhin ang laki nito, at ganoon din ang mga gilid sa pagitan ng mga naka-dock na panel. Para lumutang o i-dock nang walang pag-drag, gamitin ang {{ui:⋯}} menu.
:::

## Pagsamahin ang mga panel bilang tab

Puwedeng magbahagi ng iisang frame ang dalawang panel at isa-isang ipakita. I-drag ang panel sa pamamagitan ng pangalan nito papunta sa title bar ng ibang panel (naka-outline ang bar habang nasa ibabaw ka nito) at bitawan: may tab na ang frame para sa bawat panel, sa title bar nito. I-click ang tab para ipakita ang panel na iyon. Kapag naka-focus ang isang tab, lumilipat ang mga tab gamit ang {{key:Left}} at {{key:Right}}, at pumupunta sa una at huli ang {{key:Home}} at {{key:End}}.

Para ilabas ang panel sa grupo, piliin ang {{ui:Ilabas sa tab group}} sa menu nito, o i-drag ito sa ibang lugar. Piliin ang {{ui:I-tab kasama ang}} at ang pangalan ng panel para pagsamahin ang mga ito nang walang pag-drag.

## I-pin, itago at ibalik

- Ang pin sa title bar ng panel ay nagpapagana ng **auto-hide**: aalis ang panel sa dock nito at magiging maliit na tab sa gilid na iyon. Ituro ang tab, i-focus o i-click ito, at lalabas ang panel sa ibabaw ng drawing; ilayo ang pointer (o pindutin ang {{key:Esc}}) at babalik ito. Pindutin ulit ang pin, o piliin ang {{ui:Alisin ang pin}}, para i-dock nang tuluyan.
- Ang close button, o ang {{ui:Itago ang panel na ito}} sa menu, ay nagtatago sa panel at nagsasara sa dock nito. Ibabalik ito ng isang dashed na tab sa gilid: i-click ito, o i-focus at pindutin ang {{key:Enter}}.

## Gawing mas siksik ang layout

{{ui:Mga setting}} › {{ui:Pangkalahatan}} › {{ui:Density ng layout}} ay may dalawang pagpipilian. Ang {{ui:Maluwag}} ang default. Pinapaliit ng {{ui:Siksik}} ang taas ng row, padding ng panel, mga toolbar button at teksto ng panel ng app na iyon para mas maraming kasya sa screen. Naka-save ito para sa bawat app. Nananatiling malaki ang mga button ng touch screen sa pareho, at pinapanatili ng phone ang sarili nitong layout. Hindi binabago ng {{ui:I-reset ang layout}} ang density na itinakda mo.

## Piliin kung ilang linya ang gamit ng toolbar

{{ui:Mga setting}} › {{ui:Pangkalahatan}} › {{ui:Mga row ng toolbar}} ay may tatlong pagpipilian. Ang {{ui:Wrap}} ang default: lalabas ang bawat grupo ng tool, sa kasing dami ng linyang kailangan. Pinapanatili ng {{ui:2 row}} ang toolbar sa dalawang linya at ang {{ui:1 row}} sa isa, para mas maraming taas ang drawing; ang mga grupong hindi kasya ay mag-scroll pahalang sa loob ng toolbar (gamitin ang mouse wheel, two-finger swipe, o {{key:Tab}} papunta sa isang tool). Ang toolbar na kasya na sa dalawang linya ay mananatiling ganoon sa {{ui:2 row}}, dahil magpapatangkad lang ang grid. Naka-save ang pagpipilian para sa bawat app. Pinapanatili ng touch screen at phone ang sarili nilang layout. May sariling setting ang CadCraft para sa toolbar nito, sa ilalim ng {{ui:Mga setting}} › {{ui:CadCraft}}.

## Gamitin ang keyboard

Ang {{ui:⋯}} button ng bawat panel ay nagbubukas ng menu: {{ui:I-dock sa kaliwa}}, {{ui:I-dock sa kanan}}, {{ui:I-dock sa ibaba}}, {{ui:Lumutang sa ibabaw ng drawing}}, {{ui:I-pin sa gilid}}, {{ui:Itago ang panel na ito}}, {{ui:I-tab kasama ang}} ibang panel, {{ui:Ilipat sa bagong window}} at {{ui:Ibalik}}. Mag-tab papunta sa button, pindutin ang {{key:Enter}}, galawin gamit ang arrow keys at pindutin ulit ang {{key:Enter}}. Isinasara ng {{key:Esc}} ang menu.

## Ilagay ang mga panel sa pangalawang monitor

1. Piliin ang {{ui:⋯}} sa isang panel, pagkatapos {{ui:Ilipat lahat ng panel sa bagong window}}. Puwede mo ring piliin ang {{ui:Ilipat ang mga panel sa bagong window}} sa {{ui:Mga setting}}.
2. Magbubukas ang maliit na window na may laman na mga panel. I-drag ito sa kabilang monitor at gawin itong kasing laki ng gusto mo.
3. Magpatuloy sa trabaho: gumagana pa rin ang mga panel sa drawing gaya ng dati, at pinupuno ng drawing ang pangunahing window.

Patuloy na gumagana ang mga shortcut habang nasa harap ang panels window: ang mga susi na pipindutin mo roon, maliban sa pag-type sa kahon, ay mapupunta sa drawing. Ang mga tanong at dialog na itinatanong ng app ay bumubukas pa rin sa pangunahing window, kaya tingnan doon kapag may lumitaw. Sumusunod sa pangunahing window ang tema at laki ng teksto ng panel.

:::chromium
Kayang ilagay ng Chrome at Edge ang window sa kabilang screen para sa iyo. Kapag may nakakabit na pangalawang screen, piliin ang {{ui:Ilagay sa kabilang screen ko}} sa panels window (o ang {{ui:Ilagay ang mga panel sa kabilang screen ko}} sa {{ui:⋯}} menu ng panel). Itatanong ng browser nang isang beses kung puwedeng makita ng site na ito ang iyong mga screen; kapag pinayagan mo, bubukas ang panels window sa screen na iyon sa bawat pagkakataon.
:::

:::firefox safari
I-drag mo mismo ang panels window sa kabilang monitor. Doon ito magbubukas sa parehong lugar at sa parehong laki sa susunod.
:::

## Higit sa isang panels window

Puwedeng magkaroon ng sariling window ang bawat panel: hanggang apat na panels window, halimbawa isa bawat monitor.

- Sa {{ui:⋯}} menu ng panel, ang {{ui:Ilipat sa bagong window}} ay nagbubukas ng ibang window para sa panel na iyon, at ang {{ui:Ilipat sa panels window 2}} (at iba pa) ay inililipat ito sa isang bukas na window. Ang pangalawang window ay tinatawag na "panels 2".
- I-drag ang panel sa pamamagitan ng pangalan nito mula sa isang window papunta sa iba: bitawan sa pangunahing window para i-dock doon (lumalabas ang naka-outline na lugar habang nasa ibabaw ka nito) o para lumutang, at sa ibang panels window para ilipat doon. Kung saan ka man bumitaw sa iba, mananatili ito sa dating lugar.
- Ang panels window na wala nang panel ay magsasara nang kusa.

Pagkatapos mag-reload, muling iaalok ng app ang iyong mga panels window. Isang window kada click lang ang binubuksan ng mga browser, kaya piliin ang {{ui:Buksan ang susunod}} nang isang beses para sa bawat window.

## Iisang paraan para sa bawat bahagi ng layout

Ang ribbon, toolbox, mga tool row at status bar ay napupunta sa sarili nilang window sa parehong paraan ng panel: buksan ang {{ui:⋯}} menu ng bahagi at piliin ang {{ui:Ilipat sa bagong window}}; ibinabalik ito ng {{ui:Ibalik}} (o ng pagsara ng window) sa bahay. Ang mga susing pipindutin mo sa window na iyon ay umaabot sa app, gaya ng sa panels window. Isa lang ganitong menu ang bawat bahagi.

## Ilipat ang dialog

Puwedeng ilipat ang bawat dialog palayo sa drawing: pindutin at i-drag ang title bar nito. Naaalala ng dialog kung saan mo ito iniwan, bawat dialog nang hiwalay, at bumabalik sa lugar na iyon sa susunod na bubuksan ito. I-double-click ang title bar para ibalik ito sa gitna.

Mula sa keyboard, pindutin ang {{key:Alt}}+{{key:Shift}}+isang arrow key habang nasa loob ng dialog ang focus para ilipat ito ng 16 pixel sa bawat pagkakataon; idagdag ang {{key:Ctrl}} para 64. Ang dialog na napunta sa labas ng screen (pagkatapos ng mas maliit na window o screen) ay ibinabalik.

Sa phone, nananatiling full-width na sheet ang mga dialog at hindi sila nailipat.

Sa CadCraft Studio, ang {{ui:I-plot sa PDF}} dialog ng CadCraft, na puwede mong panatilihing bukas habang nagtatrabaho, ay may button sa title bar nito, ang {{ui:Buksan sa sarili nitong window}}. Lilipat ang dialog sa sarili nitong window na puwede mong ilagay sa ibang monitor. Ang pagsara ng dialog ay nagsasara ng window, at ang pagsara ng window ay nagsasara ng dialog.

## Ibalik ang mga panel

- Piliin ang {{ui:Ibalik ang mga panel}} sa panels window, o isara lang ito. Babalik ang mga panel sa dating lugar.
- Ang pagsara o pag-reload ng pangunahing window ay nagsasara rin sa panels window. Kapag bumukas ulit ang app, sasabihin nitong nasa sarili nilang window ang mga panel mo; piliin ang {{ui:Buksan}} para ibalik ang window, o ang {{ui:Panatilihin dito}}.
- {{ui:Mga setting}} › {{ui:Pangkalahatan}} › {{ui:I-reset ang layout}} ibinabalik ang bawat panel sa lugar kung saan ito nagsimula.

:::tip
Kung walang bumukas kapag inilipat mo ang mga panel sa bagong window, hinarang ng browser ang pop-up. Sasabihin ito ng app at mananatili ang mga panel sa dating lugar. Payagan ang pop-ups para sa getcadcraft.com, pagkatapos subukan ulit.
:::

Naka-save ang layout para sa bawat app sa browser na ito, kasama ng iba mo pang setting.
