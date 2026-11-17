---
title: မြစ်ရေမျက်နှာ ပရိုဖိုင်များ
summary: မြေမျက်နှာပြင်မှ မြစ်ကို မော်ဒယ်လုပ်ပြီး standard step method ဖြင့် steady water surface profiles ကို တွက်ချက်ရန်: ရေအဆင့်များ၊ energy၊ အမြန်နှုန်းများ၊ Froude numbers နှင့် plan ပေါ်ရှိ ရေလွှမ်းမိုးမှု ဧရိယာ။ Lab feature ဖြစ်ပြီး ရလဒ်တိုင်းကို အင်ဂျင်နီယာ၏ သုံးသပ်ချက် လိုအပ်သည်။
keywords: levee, ineffective flow area, section editor, river, hydraulics, water surface profile, backwater, standard step, steady flow, 1d, cross sections, manning, roughness, conveyance, critical depth, normal depth, froude, energy grade line, flood extent, floodplain, inundation, bank stations, reach lengths, contraction, expansion, subcritical, supercritical, mixed regime, hydraulic jump, မြစ်, ရေလွှမ်းမိုးမှု, ရေမျက်နှာ, ဖြတ်ကျော်အပိုင်း
from: fb8bf425
---

CivilCraft သည် မြစ်တလျှောက် steady၊ တစ်ဖက်မြင် ရေမျက်နှာ ပရိုဖိုင်များကို တွက်ချက်သည်: သင်ပေးသော flow တစ်ခုစီအတွက် cross section တိုင်းရှိ ရေအဆင့်ကို၊ neighboring sections များကြား energy balance မှ (standard step method)။ စစ်ဆေးနေစဉ် lab တွင် ရှိသည်။

**Design aid only.** ရေအဆင့်များကို မယုံကြည်မီ အရည်အချင်းပြည့်မီ အင်ဂျင်နီယာ၏ သုံးသပ်ချက် လိုအပ်သည်: 1D မော်ဒယ်သည် ၎င်း၏ sections၊ roughness တန်ဖိုးများ၊ reach အလျားများနှင့် နယ်နိမိတ်များ ကောင်းသလောက်သာ ကောင်းပြီး ၎င်းသည် တံတား၊ culvert သို့မဟုတ် မြစ်မှ ထွက်ပြေးသော flow ကို မသိပါ။

## မြစ်ကို ဆွဲရန်

1. ရှိပြီးသား မြေမျက်နှာပြင်ကို အရင်တည်ဆောက်ပါ (points၊ breaklines၊ သို့မဟုတ် ဖွင့်ထားသော TIN)။
2. **Surface** › {{ui:More}} အောက်တွင် {{ui:River}} ကို ရွေးပါ။
3. မြစ်၏ centerline တလျှောက် **upstream မှ downstream သို့** နှိပ်ပါ၊ ပြီးလျှင် {{key:Enter}} ကို နှိပ်ပါ သို့မဟုတ် နှစ်ကြိမ် နှိပ်ပါ။

CivilCraft သည် centerline နှင့် ထောင့်ဖြတ် ပေ 50 m (200 ft) တိုင်း ဖြတ်ပြီး ဘယ်ညာဘက်တစ်ဖက်စီ 100 m (300 ft) မြေပြင်မှ။ မြစ် stations များကို downstream အဆုံးမှ တိုင်းသည်၊ ထို့ကြောင့် upstream သို့ တိုးလာသည်။ ဘေးကမ်းများသည် section တစ်ခုစီ၏ အနိမ့်ဆုံးအမှတ်၏ ဘယ်ညာဘက် 10 m (30 ft) တွင် ခန့်မှန်းချက်အဖြစ် စတင်သည်။

မြစ် ကျဉ်းသွားသော နေရာ သို့မဟုတ် structure တစ်ခု ရှိသော နေရာတွင် section ထည့်ရန်၊ မြစ်ကို ရွေးပြီး {{ui:Add a section}} ကို နှိပ်ကာ ၎င်းကို ဖြတ်သော cut line ကို ဆွဲပါ (မည်သည့်ဘက်မဆို: downstream ကြည့်သည့်အခါ ဘယ်မှ ညာသို့ သွားရန် လှည့်ပေးသည်)။

## မြစ်ကို သတ်မှတ်ရန်

မြစ်ကို ရွေးပြီး **Properties** တွင် ကြည့်ပါ:

- **Flow regime**: subcritical (အသုံးများဆုံး: downstream နယ်နိမိတ်မှ upstream သို့ တွက်သည်)၊ supercritical (upstream နယ်နိမိတ်မှ downstream သို့ တွက်သည်) သို့မဟုတ် mixed (နှစ်ခုလုံး၊ ထို့နောက် section တိုင်းတွင် specific force ပိုကြီးသော တစ်ခု၊ preview)။
- **Flow profiles**: တစ်ခုစီအတွက် အမည်နှင့် flow (ဥပမာ 10-year နှင့် 100-year flow)၊ နှင့် downstream အဆုံး နယ်နိမိတ် (regime မ subcritical ဖြစ်လျှင် upstream အဆုံးပါ): energy slope ပါသော **Normal depth** (bed slope သည် ပထမ ခန့်မှန်းချက်)၊ **Known water surface** elevation၊ သို့မဟုတ် **Critical depth**။
- **Sections from the ground**: အကွာအဝေး၊ ဘယ်ညာ ဘယ်လောက်၊ ကမ်းခန့်မှန်းချက်နှင့် Manning's n တန်ဖိုးနှစ်ခု; {{ui:Cut sections again}} သည် sections များကို အစားထိုးသည် (undo တစ်ကြိမ်)။
- **The sections table**: section တိုင်းအတွက် ဘယ်ညာ ကမ်း offset များ၊ channel n နှင့် overbank n၊ အောက်ဘက် နောက် section သို့ reach အလျားများ (ဘယ် overbank၊ channel၊ ညာ overbank; plan မှ တိုင်းသည်) နှင့် contraction နှင့် expansion coefficients (စတင်ရန် 0.1 နှင့် 0.3: အဆင်ပြေသော အကူးအပြောင်း)။ {{ui:Edit}} သည် section editor ကို ဖွင့်သည် (နောက်တွင်); နောက်ကပ် အစက်တစ်ခုသည် section တွင် levee သို့မဟုတ် ineffective area ရှိကြောင်း ဖော်ပြသည်။

ပြောင်းလဲမှု တစ်ခုစီသည် undo တစ်ကြိမ် ဖြစ်သည် ({{key:Mod+Z}})။

## Section တစ်ခုကို တည်းဖြတ်ခြင်း: ကမ်းများ၊ levees နှင့် ineffective areas

Section ပေါ်ရှိ {{ui:Edit}} သည် ၎င်း၏ မြေပြင်ကို ဆွဲပြပြီး solver ဖတ်မည့်အရာများကို ဆွဲရွှေ့ခွင့်ပေးသည်: **left and right bank** (ဤသည် section ကို left overbank၊ main channel နှင့် right overbank အဖြစ် ခွဲသည်)၊ ဘက်တစ်ဖက်စီပေါ်ရှိ **levee** နှင့် **ineffective flow areas**။ Handle တိုင်းကို arrow keys ဖြင့်လည်း ရွှေ့နိုင်ပြီး နံပါတ်တိုင်းကို plot ဘေးတွင် ရိုက်ထည့်နိုင်သည်။ {{ui:Apply}} သည် undo တစ်ကြိမ် ဖြစ်သည်။

- **Levee** တွင် နေရာ (offset) နှင့် crest elevation ရှိသည်။ မြစ်မှ အဝေးဘက်ရှိ မြေသည် ရေမျက်နှာသည် crest အောက်တွင် ရှိနေစဉ် မြစ်မှ ဖြတ်တောက်ခံရသည်: ၎င်း၏ ဧရိယာ၊ wetted perimeter နှင့် conveyance ကို ချန်ထားသည်။ Crest အထက်တွင် section တစ်ခုလုံး ပြန်ရေတွက်သည်။ Levee သည် ကာကွယ်သော ကမ်း၏ အပြင်ဘက်တွင် ရပ်သည်; ကမ်းအတွင်းရှိတစ်ခုကို အလံတင်ထားသည်။
- **Ineffective flow area** တွင် ရေ ထိန်းထားသော်လည်း flow မသယ်ပါ (embankment နောက်ရှိ အိတ်၊ တံတားချဉ်းကပ်လမ်းဘေး သေနေသော ရေ)။ ၎င်း၏ offset နှစ်ခုကို ပေးပြီး လိုလျှင် ရေအဆင့်တစ်ခုကို ပေးပါ၊ ၎င်းအောက်တွင် ineffective ဖြစ်သည် (ဗလာဖြစ်လျှင် {{ui:always}})၊ ထိုအဆင့်အထက်တွင် ကျန်တာများကဲ့သို့ စီးသည်။ Main channel ၏ အစိတ်အပိုင်းကို ဖုံးသော တစ်ခုကို အလံတင်ထားသည်။
- Sections နှစ်ခုကြား ရေလွှမ်းမိုးမှု ဧရိယာသည် sections နှစ်ခုစလုံးမှ ရှိသော levee နောက်ရှိ မြေကို ခြောက်သွေ့ထားသည်၊ ထိုနေရာရှိ ရေမျက်နှာသည် crest အောက်တွင် ရှိစဉ် (crest နှစ်ခုကြား မျဉ်းသည် ဖဲဖြောင့်သည်)။

## တွက်ချက်ပြီး ရလဒ်ကို ဖတ်ရန်

{{ui:Water surface profiles}} ကို နှိပ်ပါ။ သင်ရွေးသော ပရိုဖိုင်အတွက် အောက်ပါတို့ကို ရရှိသည်:

- မြစ်တလျှောက် **plot** (flow ဘယ်မှ ညာ): channel အောက်ခြေ၊ ကမ်းများ၊ ရေမျက်နှာ၊ energy grade line နှင့် critical water surface; critical depth တွင် ထားသော sections များကို စက်ဝိုင်းဖြင့် ပတ်ထားသည်;
- section တစ်ခုစီအတွက် **table**: river station၊ flow၊ channel အောက်ခြေ၊ ရေမျက်နှာ၊ critical water surface၊ energy grade line၊ အနက်၊ channel နှင့် အကြမ်းဖျင်း အမြန်နှုန်း၊ channel Froude number၊ flow area၊ top width၊ overbank တစ်ခုစီနှင့် channel ရှိ flow၊ energy slope နှင့် warnings;
- **warnings** ကို ရိုးရိုးစကားဖြင့်၊ ဥပမာ section တစ်ခုကို critical depth သတ်မှတ်ထားခြင်း၊ section အဆုံးများထက် ရေမြင့်ခြင်း၊ sections နှစ်ခုကြား conveyance ကြီးကြီး ပြောင်းလဲခြင်း (ကြားထဲတွင် section ထပ်ထည့်ပါ)။

{{ui:Table (CSV)}}၊ {{ui:Report}} (နည်းလမ်း၊ နယ်နိမိတ်များနှင့် ဇယားတိုင်းပါသော plain text) နှင့် {{ui:Plot (SVG)}} တို့သည် သင့် downloads သို့ သိမ်းသည်။ တစ်ခုစီတွင် သုံးသပ်ချက် လိုင်းပါသည်။

ပရိုဖိုင်အတွက် ရေလွှမ်းမိုးမှု ဧရိယာကို plan ပေါ်တွင် အရိပ်ပြရန် **Properties** တွင် {{ui:Show the flood extent}} ကို အမှန်ခြစ်ပါ၊ အနက်သုည ဖြစ်သော နေရာတွင် waterline ကို ဆွဲသည်။ Sections များကြားတွင် ရေမျက်နှာသည် မြစ်ဖြတ်ကျော်တလျှောက် ညီညာပြီး river station နှင့်အတူ မျဉ်းဖြောင့်စွာ ပြောင်းသည်။ ရေသည် crest အောက်တွင် ရှိနေစဉ် levee နောက်ရှိ မြေကို ခြောက်သွေ့ထားသည်။ ရေမရောက်နိုင်သော မြစ် corridor အတွင်းရှိ အခြား နိမ့်သော မြေ (ဥပမာ လမ်း embankment နောက်) သည်လည်း အရိပ်ပြသည်: စစ်ဆေးပါ။

## Drawing နှင့် Problems ပေါ်တွင်

မြစ်၏ လိုင်းများသည် plan၊ PDF နှင့် DWG သို့ သူ့ကိုယ်ပိုင် layers များပေါ်တွင် သွားသည်: **C-WATR-CNTR** (centerline)၊ **C-WATR-SCTN** (cut line တစ်ခုစီ၊ river station ပါ) နှင့် **C-WATR-FLOD** (ရေလွှမ်းမိုးမှု ဧရိယာ၏ waterline၊ ပရိုဖိုင်အတွက် {{ui:Show the flood extent}} ကို အမှန်ခြစ်ထားသည့်အခါ)။ မြစ်၏ warnings များ (critical depth သတ်မှတ်ထားသော section၊ section အဆုံးများထက် ရေမြင့်ခြင်း၊ sections ပိုထည့်ရန် တောင်းဆိုသော conveyance ပြောင်းလဲမှု၊ မပိတ်နိုင်သော energy balance၊ ကမ်းအတွင်း levee) သည်လည်း **Problems** panel သို့ သွားသည်၊ မြစ်အကြောင်းဖြစ်ပြီး ၎င်းတို့ လာသော section တွင် ချထားသည်။

## တွက်ချက်ပုံ

- Sections နှစ်ခုကြား energy: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|။
- Subdivision ဖြင့် conveyance: overbank တစ်ခုစီကို n ပြောင်းသည့်နေရာတွင် ခွဲသည်၊ K = Σ (1/n)·A·R^(2/3) (US ယူနစ်တွင် 1.486/n); channel သည် အတုံးတစ်ခု ဖြစ်ပြီး n ပြောင်းလျှင် composite n ဖြင့်။ α သည် conveyance ခွဲပုံမှ ထွက်လာသည်။
- Friction slope ကို average conveyance ဖြင့်၊ Sf = ((Q₁ + Q₂)/(K₁ + K₂))²၊ flow-weighted reach အလျားပေါ်တွင်။
- Flow သည် အောက်ဘက်သို့ အရှိန်မြှင့်သောအခါ contraction coefficient၊ နှေးသောအခါ expansion။
- Critical depth = အနည်းဆုံး specific energy။ ရေအဆင့်တိုင်းကို bracket ပေါ်တွင် ဖြေရှင်းသည်၊ ထို့ကြောင့် critical ၏ မှားသော ဘက်သို့ ဘယ်တော့မှ မခုန်ပါ; အဖြေမရှိသောအခါ critical depth သတ်မှတ်ပြီး အလံတင်သည်။

ပရိုဂရမ်ကို Manning's normal depth၊ rectangular channel ရှိ critical depth နှင့် Chow ၏ backwater ဥပမာ (*Open-Channel Hydraulics*၊ 1959၊ chapter 10) ကို လွတ်လပ်စွာ ပေါင်းပြီး စစ်ဆေးထားသည်။ နည်းလမ်းတူကို အများသုံး 1D မြစ်ပရိုဂရမ်များက သုံးသည်၊ ထို့ကြောင့် လက်တွက်ခြင်း သို့မဟုတ် ကျောင်းသား မှတ်စုများ ရွှေ့ပြောင်းနိုင်သည်။

## Culverts နှင့် တံတားများ

မြစ်၏ **Properties** တွင် **Culverts and bridges** အောက်၌ {{ui:Add a culvert}} သို့မဟုတ် {{ui:Add a bridge}} သည် sections နှစ်ခုကြား တစ်ခုကို ထည့်သည် (အပိုင်းတိုင်းတွင် အနည်းဆုံး နှစ်ခု ရှိသည်)။ ၎င်းအောက်ရှိ ပရိုဖိုင်သည် မပြောင်းပါ; ၎င်းအထက်ရှိ ရေမျက်နှာကို structure မှ ယူသည်၊ ပရိုဖိုင်သည် ထိုမှ upstream သို့ ဆက်သွားသည်။ **Results** တွင် structure တစ်ခုစီအတွက် ဇယား ထပ်ထည့်သည်: tailwater၊ headwater အဆင့်၊ ဘယ် control က အုပ်ချုပ်သလဲ၊ opening မှ flow နှင့် လမ်း သို့မဟုတ် deck အပေါ်မှ flow။ Subcritical flow သာ။

- **Culvert** (box သို့မဟုတ် round၊ တူညီသော barrel တစ်ခု သို့မဟုတ် ပိုများ)။ Entrance control သည် entrance လွတ်နေစဉ် weir flow ဖြစ်ပြီး ရေနစ်သောအခါ orifice flow ဖြစ်သည်၊ rise ၏ တစ်နှင့် တစ်ဝက်ဆ headwater အကြား ရောစပ်သည်။ Outlet control သည် energy balance ဖြစ်သည်: entrance loss၊ friction နှင့် exit velocity head၊ tailwater နှင့် critical depth ၏ အလယ်အမြင့် နှင့် crown ထဲမှ ပိုမြင့်သည်ထက်၊ barrel တလျှောက် fall ကို နှုတ်ပြီး။ Headwater သည် နှစ်ခုထဲမှ ကြီးသည်။ **Water can go over the road** ကို အမှန်ခြစ်လျှင် လမ်း၏ weir flow သည် barrels နှင့် flow ကို မျှသည်။
- **Bridge.** Opening သည် တံတားအောက်ရှိ section ဖြစ်ပြီး abutments တွင် ဖြတ်သည်၊ pier တစ်ခုစီကို flow မသယ်သော ဧရိယာအဖြစ် ထားသည်။ Opening ရှိ ရေမျက်နှာသည် အောက်ရှိ section (expansion coefficient) မှ ယူပြီး အထက်ရှိ section သည် opening (contraction coefficient) မှ ယူသည်။ Opening က ထို tailwater တွင် flow မပို့နိုင်လျှင် critical depth တွင် လည်ပတ်ပြီး တံတားကို choking ဟု အလံတင်သည်။ ရေသည် low chord သို့ ရောက်လျှင် flow သည် pressure flow ဖြစ်သည် (tailwater သည် low chord အောက်တွင် ရှိစဉ် sluice type၊ အထက်တွင် ရေနစ်သည်)၊ deck အပေါ်ရေသည် weir flow ထည့်သည်; အထက်ရေအဆင့်သည် ၎င်းတို့ flow နှင့် ညီသော အဆင့်ဖြစ်သည်။

Coefficients များ (discharge၊ entrance loss၊ weir) သည် အပြည့်ဂဏန်းပုံမှန် ပုံသေများဖြစ်သည်။ သင့်ဒီဇိုင်းအတွက် ပြောင်းပါ။ ၎င်းတို့သည် culvert ဒီဇိုင်းကျမ်းများ ပုံနှိပ်ထားသော fitted chart များ မဟုတ်ပါ၊ ထို့ကြောင့် ကန့်သတ်ချက်နားရှိ culvert ၏ headwater ကို ခန့်မှန်းချက်အဖြစ် ဆက်ဆံပါ။ လမ်း သို့မဟုတ် deck အပေါ်ရေ၊ ရေနစ်သော entrance၊ choked opening နှင့် barrel ထဲ အမြန် flow တို့ကို **Problems** တွင် ပြသည်။

## Unsteady flow

မြစ်၏ **Properties** ရှိ {{ui:Unsteady flow…}} သည် flood hydrograph ကို sections တလျှောက် ပို့သည်။ Inflow ကို နာရီနှင့် flow အဖြစ် ရိုက်ထည့်ပါ၊ တစ်ကြောင်းလျှင် တစ်စုံ၊ downstream slope (normal depth) နှင့် ဘယ်လောက်ကြာ run မည်လဲ။ ပထမ flow ရှိ steady ရေမျက်နှာမှ စတင်ပြီး အပြည့်အစုံ တစ်ဖက်မြင် ညီမျှခြင်းများကို ဖြေရှင်းသည် (implicit four-point scheme၊ အချိန်တွင် 0.6 အလေးချိန်)။ Sections တိုင်းတွင် ထိပ်ရေအဆင့်နှင့် flow၊ တစ်ခုစီ ဖြစ်ပေါ်သော နာရီနှင့်အတူ၊ အဆုံးနှစ်ခုရှိ flow ၏ plot နှင့် volume စစ်ဆေးချက် (ဝင်၊ ထွက်နှင့် သိုလှောင်သော ပြောင်းလဲမှု) ကို ရရှိသည်။ Steady flow သည် steady ဆက်နေခြင်း၊ inflow ရှိ အဆင့်တစ်ခုသည် flow အသစ်၏ steady ပရိုဖိုင်တွင် အဆုံးသတ်ခြင်း၊ volume ပိတ်ခြင်းနှင့် kinematic wave နှင့် flood wave ၏ အမြန်နှုန်းတို့ကို စစ်ဆေးထားသည်။ Subcritical flow၊ reach တစ်ခု၊ side inflow မရှိ၊ run အတွင်း culverts သို့မဟုတ် တံတားမရှိ။

## Junctions

Flow ကို outlet တစ်ခုသို့ ပေါင်းသော reaches: flows များပေါင်းသည်၊ ရေမျက်နှာသည် downstream reach ၏ ထိပ်မှ ၎င်းနှင့် ပေါင်းသော reaches များ၏ အဆုံးများအထိ ဆက်သွားသည် (junction တွင် ရေမျက်နှာတူ၊ ရိုးရှင်းသော နည်းလမ်း: angle မရှိ၊ momentum မရှိ၊ ထို့ကြောင့် Froude နံပါတ် နိမ့်သောအခါ သင့်တော်သည်)။ မော်ဒယ်နှင့် စမ်းသပ်ချက်များ ရှိပြီး (`river-structures.js`); plan ပေါ်တွင် မြစ်နှစ်ခုကို ပေါင်းရန် panel သည် မတည်ဆောက်ရသေးပါ။

## ထပ်မတည်ဆောက်ရသေးသောအရာများ

Weirs နှင့် gates ကို သီးခြား structures အဖြစ်၊ junctions အတွက် panel၊ unsteady run အတွင်း structures၊ နှင့် supercritical unsteady flow။ Mixed-regime run သည် sections နှစ်ခုကြား hydraulic jump ကို အလံတင်သော်လည်း နေရာမချပါ။

**Where rivers join.** မြစ်တစ်ခု၏ Properties တွင် "Flows into" သည် ၎င်းပေါင်းသော မြစ်ကို အမည်ပေးသည်။ ပေါင်းသော မြစ်များကို အတူတကွ ဖြေရှင်းသည်: ၎င်းတို့ စီးဝင်သော မြစ်သည် flows များ၏ ပေါင်းလဒ်ကို သယ်သည်၊ ၎င်းတို့ တစ်ခုစီသည် ထိုမြစ်၏ ပထမ section ၏ ရေမျက်နှာတွင် ဆုံးသည် (ရေမျက်နှာ တူညီသော နည်းလမ်း; flows ၏ angle နှင့် momentum ကို ချန်ထားသည်)။ Main river နှင့် creek ကို ပေါင်းရန်၊ junction အောက်တွင် မြစ်တိုတစ်ခု ဆွဲပြီး နှစ်ခုစလုံး ၎င်းထဲသို့ စီးစေပါ။ ဤရလဒ်များတွင် Results သည် junction ဇယားကို ပြသည်။ ဤရလဒ်များ၏ ပုံသေများ (contraction 0.1၊ expansion 0.3၊ composite roughness ပါသော တစ်တုံး channel၊ specific force ဖြင့် mixed regime) သည် အင်ဂျင်နီယာက သုံးသပ်သည်အထိ ရှိနေပြီး Results က ထိုသို့ ပြောသည်။
