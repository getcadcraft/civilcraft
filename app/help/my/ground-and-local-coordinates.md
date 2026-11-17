---
title: Ground နှင့် local coordinate များ
summary: ရိုက်ထည့်သော သို့မဟုတ် အမှတ်တစ်ခုတွင် တွက်ချက်သော ပေါင်းစပ် scale factor ဖြင့် grid မှ scale လုပ်ထားသော ground (မျက်နှာပြင်) coordinate များ၊ သို့မဟုတ် စနစ်နှင့် control point နှစ်ခုဖြင့် ချိတ်ဆက်ထားသော ယူဆထားသည့် site grid တွင် လုပ်ဆောင်ခြင်း။
keywords: ground coordinate များ, surface coordinate များ, grid မှ ground, combined scale factor, csf, ပေါင်းစပ်အချက်, grid factor, elevation factor, sea level factor, convergence, mapping angle, scale factor, ယူဆထားသော coordinate များ, local coordinate များ, site grid, 5000 5000, control point များ, localization, calibration, နှစ်ချက်, misclosure
from: 3d7453de
---

State plane နှင့် UTM coordinate များသည် **grid** coordinate များ ဖြစ်ပြီး မြေပုံ projection က အကွာအဝေးများကို အနည်းငယ် ဆန့်သည် သို့မဟုတ် ချုံ့သည် (parts per million ဆယ်ဂဏန်းခန့်)၊ နေရာမြင့်လေ တိုင်းထားသော မြေပြင်အကွာအဝေးသည် grid အကွာအဝေးနှင့် ပိုကွာလေ ဖြစ်သည်။ ထို့ကြောင့် survey အများအပြားက **ground** coordinate များကို ပေးသည်၊ plan အကွာအဝေးများသည် မြေပြင်ပေါ်တွင် တိုင်းထားသော အကွာအဝေးနှင့် ညီစေရန် scale လုပ်ထားသည်၊ သို့မဟုတ် **ယူဆထားသော** site grid (control point တွင် 5000, 5000)။ CivilCraft သည် သင်၏ ကိန်းဂဏန်းများကို ရှိသည့်အတိုင်း ထားပြီး ၎င်းတို့သည် grid နှင့် ဘယ်လို ဆက်စပ်သည်ကို မှတ်ထားသည်၊ ထို့ကြောင့် latitude နှင့် longitude၊ GIS ဖိုင်များနှင့် မြေပုံအလွှာများသည် မှန်ကန်သော နေရာသို့ ရောက်သည်။

**GIS** အုပ်စုရှိ {{ui:Coordinates}} ကို ဖွင့်ပါ၊ စနစ်ကို ရွေး (သို့မဟုတ် ထားပါ)၊ ထို့နောက် **Grid, ground or local coordinates** အောက်တွင် ရွေးပါ:

| ရွေးချယ်ချက် | သင့် coordinate များသည် | grid နှင့် ဆက်စပ်ပုံ |
|---|---|---|
| {{ui:Grid}} | စနစ်၏ ကိုယ်ပိုင် (စတင်ချက်) | ကိန်းဂဏန်း အတူတူ |
| {{ui:Ground}} | မြေပြင်အကွာအဝေးသို့ scale လုပ်ထား | grid = base + combined factor × (ground − base) |
| {{ui:Local}} | ယူဆထားသည့် site grid | control point နှစ်ခုဖြင့် grid သို့ ရွှေ့၊ လှည့်၊ scale လုပ်ထား |

ရွေးထားသည်များကို ပရောဂျက်နှင့်အတူ သိမ်းပြီး undo အဆင့်တစ်ခု ဖြစ်သည်; ဘာမျှ မရွှေ့ပါ။

## Ground coordinate များ

1. {{ui:Ground}} ကို ရွေးပါ။
2. survey မှ **Combined scale factor** ကို ရိုက်ထည့်ပါ (ဥပမာ `0.99987`)၊ သို့မဟုတ် တွက်ပါ:
   1. **Compute the factor at a point** အောက်တွင် အမှတ်သည် ပရောဂျက်အလယ်မှ စတင်သည်။ {{ui:Pick a point on the plan}} ကို ရွေးပြီး နေရာကို နှိပ်ပါ (survey အမှတ်အနီး နှိပ်လျှင် ထိုအမှတ်ကို ယူသည်)၊ သို့မဟုတ် E နှင့် N ကို ရိုက်ပါ။
   2. elevation ကို ထိုနေရာ၏ မျက်နှာပြင်မှ ယူသည်; လိုအပ်လျှင် အခြားတစ်ခု ရိုက်ထည့်ပါ။
   3. {{ui:Compute}} ကို ရွေးပါ။ CivilCraft က ပြသည်:
      - **Grid scale factor k**: ထိုနေရာတွင် မြေပုံ projection က အကွာအဝေးကို ဘယ်လောက် ဆန့်သည်။
      - **Elevation factor**: ထိုအမြင့်တွင် ellipsoid ပေါ်ရှိ အကွာအဝေးသည် ဘယ်လောက် တိုသည်။
      - **Combined factor** = k × elevation factor: grid အကွာအဝေး = ground အကွာအဝေး × ဤတန်ဖိုး။
      - **Convergence**: ထိုနေရာတွင် grid မြောက်မှ အမှန်မြောက်အထိ ထောင့် (geodetic azimuth = grid azimuth + convergence)။
   4. ကိန်းဂဏန်းများအောက်ရှိ {{ui:Use}} ခလုတ်ကို ရွေးပြီး combined factor ကို အကွက်ထဲ ထည့်ပါ။
3. **Base point** ကို သတ်မှတ်ပါ၊ ထိုနေရာတွင် ground နှင့် grid coordinate များ တူညီသည်။ 0, 0 မှ စသည်: ground coordinate များကို ထုတ်ပြန်သော တရားဝင်နယ်ပယ် အများစုက origin ဝန်းကျင်တွင် scale လုပ်သောကြောင့် ground coordinate များသည် grid နှင့် နီးကပ်စွာ ရှိနေသည်။ အချို့ survey များက ပရောဂျက်၏ control point ဝန်းကျင်တွင် scale လုပ်သည်: survey က ပြောသည်ကို သုံးပါ။
4. {{ui:Apply}} ကို ရွေးပါ။

:::warning
elevation ကို ellipsoid အထက် အမြင့်အဖြစ် ယူသည်။ CivilCraft တွင် geoid model မရှိသောကြောင့် geoid သည် ellipsoid အထက် သို့မဟုတ် အောက် 30 m (100 ft) ရှိသည့်နေရာတွင် elevation factor သည် ~5 ppm ခန့် ကွဲသည်။ survey က combined factor ကို ဖော်ပြထားလျှင် ထိုတန်ဖိုးကို ရိုက်ပါ။
:::

## Local (ယူဆထားသော) coordinate များ

1. {{ui:Local}} ကို ရွေးပါ။
2. **Control point 1** အတွက် survey အမှတ်နံပါတ်ကို ရိုက်ပါ (သို့မဟုတ် {{ui:Pick}} ကို ရွေးပြီး plan ပေါ်တွင် နှိပ်ပါ)။ ၎င်း၏ local coordinate များကို ဘေးတွင် ပြသည်။
3. ၎င်း၏ **grid** E နှင့် N ကို ရိုက်ပါ၊ သို့မဟုတ် တတိယအကွက်တွင် latitude နှင့် longitude (ဥပမာ `30.2672, -97.7431`)။
4. **Control point 2** ကိုလည်း တူညီစွာ လုပ်ပါ၊ ပထမအမှတ်နှင့် တတ်နိုင်သမျှ ဝေးအောင်။
5. CivilCraft က တွေ့ရှိသော **Scale** နှင့် **Rotation** ကို ပြပြီး သတိပေးသည်: **Two points always fit exactly — check a third.** (အမှတ်နှစ်ခုသည် အမြဲ တိတိကျကျ ကိုက်ညီသည် — တတိယတစ်ခုကို စစ်ပါ။)
6. **Check point** ကို တူညီစွာ ပေးပါ။ CivilCraft က ထို fit က ၎င်းကို သင်ရိုက်ထားသော grid coordinate များမှ ဘယ်လောက် ဝေးစေသည်ကို ပြသည် (misclosure၊ ပရောဂျက်ယူနစ်နှင့် parts per million)။ misclosure ကြီးလျှင် အမှား အမှတ်၊ ရိုက်ချက် အမှား သို့မဟုတ် အခြားယူနစ်ရှိ coordinate ဖြစ်ကြောင်း ဆိုလိုသည်။
7. {{ui:Apply}} ကို ရွေးပါ။

scale သည် 1 မှ အလွန်ဝေးလျှင် (0.5 မှ 2 ကျော်) ငြင်းသည်: အမှတ်များနှင့် ၎င်းတို့၏ ယူနစ်များကို စစ်ပါ။

## ဘာတွေ စစ်ဆေးပြီးပြီလဲ

- scale factor နှင့် convergence တို့သည် PROJ (pyproj 3.7.1 နှင့် PROJ 9.5.1)၊ GIS ပရိုဂရမ်အများစု သုံးသော coordinate library နှင့် ဘီလီယံတွင် 1 အစိတ်အပိုင်း အတိအကျ ကိုက်ညီသည်၊ conformal projection ရှိ စနစ် 300 ကျော်ပေါ်တွင် (state plane, UTM, transverse Mercator, Lambert conformal conic)၊ နှင့် browser တွင် plan ပေါ်မှ ရွေးထားသော အမှတ်တွင်။
- Ground နှင့် local အဆင့်များသည် သွားပြန်လာပြန် ဘီလီယံတွင် 1 အစိတ်အပိုင်း ပြောင်းသည်; control point နှစ်ခုသည် ၎င်းတို့ ဖန်တီးချိန်က scale နှင့် rotation ကို ပြန်ပေးသည်; 0.05 ft ကွာသော check point သည် 0.05 ft misclosure ပြသည်။
