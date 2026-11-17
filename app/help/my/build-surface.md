---
title: Surface ဖန်တီးပြီး ပြင်ဆင်ခြင်း
summary: CivilCraft သည် ရှိပြီးသား မြေပြင်ကို ဘယ်လို triangle ခွဲသလဲ၊ breakline group များ၊ ဆွဲထားသော breakline များ၊ outer boundary နှင့် အပြင်ဘက် အရှည်ဆုံးအစွန်းဖြင့် ဘယ်လို ပုံဖော်သလဲ။
keywords: tin, surface, triangulation, breakline, boundary, existing ground, eg, create surface, delaunay, triangles, max edge, outer boundary
from: b9eea3f3
---

CivilCraft တွင် ပရောဂျက်တစ်ခုလျှင် ရှိပြီးသား မြေပြင် surface တစ်ခုသာ ရှိသည်။ ၎င်းသည် သင့် point များမှ တည်ဆောက်ထားသော TIN (triangulated irregular network) ဖြစ်ပြီး input တစ်ခုပြောင်းတိုင်း အလိုအလျောက် ပြန်တည်ဆောက်သည်။ "rebuild" command မရှိပြီး သက်တမ်းကုန်သော surface လည်း မရှိပါ။

## Surface ထဲ ဘာဝင်သလဲ

- {{ui:Points}} သို့ သတ်မှတ်ထားသော group ထဲရှိ elevation ပါသော point တိုင်း။
- {{ui:Breakline}} သို့ သတ်မှတ်ထားသော group တိုင်း၊ point နံပါတ်အစဉ်လိုက် ချိတ်ဆက်ထားသည်။
- {{ui:Breakline}} ကိရိယာဖြင့် သင်ဆွဲထားသော breakline တိုင်း။
- Outer boundary (ဆွဲထားလျှင်)။
- **Longest outside edge** ဆက်တင်။

Triangle များသည် breakline ကို ဖြတ်မကျော်ပါ: surface သည် ၎င်းကို လိုက်ရန် အတင်းအကျပ် ပြုလုပ်ပြီး ပတ်ပတ်လည်တွင် တတ်နိုင်သမျှ ညီညာအောင် ပြုလုပ်သည် (ကျန်နေရာများတွင် Delaunay)။

## ကုဒ်ပေးထားသော မျဉ်းများကို breakline ဖြစ်အောင် ပြုလုပ်ခြင်း

1. ဘယ်ဘက် panel ၏ **Points** အောက်တွင် group ကို ရှာပါ (ဥပမာ FL)။
2. ၎င်း၏ **Surface** ရွေးချယ်မှုကို {{ui:Breakline}} သို့ သတ်မှတ်ပါ။
   Surface ပြန်တည်ဆောက်ပြီး မျဉ်းကို လိမ္မော်ရောင်ဖြင့် ဆွဲသည် (**Display** အောက်တွင် {{ui:Breaklines}} ဖွင့်ထားလျှင်)၊ ထို့အပြင် surface အချက်အလက်ထဲရှိ **Breaklines** တန်ဖိုးသည် တစ်တိုး၏။
3. Plan ပေါ်တွင် မျဉ်းကို စစ်ပါ။ မျဉ်းသည် တိုင်းထားသော အစီအစဉ်အတိုင်း point မှ point သို့ သွားရမည်။ ကွင်းလိုက်ပြီး ယိုင်နေပါက group တွင် မျဉ်းတစ်ခုထက်ပို၍ ပါဝင်နေသည်၊ သို့မဟုတ် point များ အစဉ်လိုက် နံပါတ်မတပ်ထားပါ: group ကို {{ui:Points}} သို့ ပြန်ထားပြီး မျဉ်းများကို လက်ဖြင့် ဆွဲပါ (နောက်ပိုင်း အပိုင်း)။

## Point များကို ဖြတ်၍ breakline ဆွဲခြင်း

1. {{key:B}} ကို နှိပ်ပါ၊ သို့မဟုတ် **Surface** အုပ်စုရှိ {{ui:Breakline}} ကို click ပါ။
   အကြံပြုစာသည် "Breakline: click survey points in order (it takes their elevations). Enter finishes." ဟု ပြသည်။
2. Pointer ကို point တစ်ခု အနီးရောက်အောင် ရွှေ့ပါ။ လိမ္မော်စတုရန်းငယ်တစ်ခုက ယူမည့် point ကို ပြသည်။
3. မျဉ်း၏ point များကို တစ်ခုပြီးတစ်ခု click ပါ။ Click တိုင်းသည် status bar တွင် point နှင့် ၎င်း၏ elevation ကို ပြသည်။
4. {{key:Enter}} ကို နှိပ်ပြီး ပြီးဆုံးပါ။
   Status bar က "Breakline 1 added; the surface was rebuilt." ဟု ပြသည်။

Click များသည် elevation ရှိသော survey point ပေါ်တွင် ကျရမည်; အခြားနေရာ click ကို "Click a survey point with an elevation: a breakline takes the points' elevations." ဖြင့် ငြင်းပယ်သည်။ {{key:Backspace}} သည် နောက်ဆုံး point ကို ဖယ်ပေးသည်; {{key:Esc}} သည် မျဉ်းတစ်ခုလုံးကို ပယ်ဖျက်သည်။

:::warning
{{key:Enter}} ဖြင့် ပြီးဆုံးပါ။ Double-click ဖြင့်လည်း ပြီးဆုံးသော်လည်း ဤ build တွင် double-click လုပ်ထားသော point ကို ချန်လှပ်သွားသည်။ နောက်ဆုံး point ကို တစ်ကြိမ် click ပြီးမှ {{key:Enter}} ကို နှိပ်ပါ။
:::

ဆွဲထားသော breakline အားလုံးကို တစ်ပြိုင်နက် ဖယ်ရန် **Surface** အပိုင်းရှိ {{ui:Remove drawn breaklines}} ကို click ပါ။ နောက်ဆုံးတစ်ခုတည်းကိုသာ ဖယ်ရန် {{key:Mod+Z}} ကို သုံးပါ။ ဆွဲထားသော breakline များကို တစ်ခုချင်းစီ ရွေး သို့မဟုတ် ပြင်ခြင်း မရှိသေးပါ။

## Outer boundary ဆွဲခြင်း

Boundary သည် surface ကို သင်ယုံကြည်သော ဧရိယာသို့ ဖြတ်ပေးသည်၊ ဥပမာ survey ကန့်သတ်ချက်များ၊ ထို့ကြောင့် survey မလုပ်ရသေးသော ထောင့်များပေါ်ရှိ ရှည်လျားသော triangle များ ပျောက်သွားသည်။

1. {{key:O}} ကို နှိပ်ပါ၊ သို့မဟုတ် {{ui:Boundary}} ကို click ပါ။
2. ဧရိယာပတ်လည်ရှိ ထောင့်များကို အစဉ်လိုက် click ပါ။ အစင်းမျဉ်းဖြင့် ပုံသဏ္ဍာန်ကို ပြသည်။
3. {{key:Enter}} ကို နှိပ်ပါ။
   Status bar က "Boundary set; triangles outside it are gone." ဟု ပြသည်။ Surface အချက်အလက်ထဲရှိ **Boundary** က "Yes" နှင့် ထောင့်အရေအတွက်ကို ပြသည်။

သိထားရန်:

- Boundary တစ်ခုသာ ရှိသည်။ နောက်တစ်ခုဆွဲလျှင် ယခုအရာကို အစားထိုးသည်။ {{ui:Remove the boundary}} ဖြင့် ဖယ်နိုင်သည်။
- ဖြတ်ခြင်းသာ လုပ်နိုင်သည်: point များကို ကျော်သွားသော boundary ကို ၎င်းတို့၏ အပြင်ပန်းပုံသို့ ပြန်ဖြတ်ပြီး "The boundary reaches past the points; it was cut back to their outline." ဟု မှတ်စုပြသည်။
- ၎င်း၏ ထောင့်များသည် surface မှ elevation ယူသဖြင့် အစွန်းသည် မြေပြင်ကို တိတိကျကျ လိုက်သည်။
- ဝှက်ထားသော (inner) boundary များကို မရနိုင်သေးပါ။

## အပြင်ဘက် ရှည်သော triangle များ ဖြတ်ခြင်း

Boundary မရှိပါက surface သည် point များ၏ outline တစ်ခုလုံးကို ဖြည့်သည်၊ concave အစွန်းများတစ်လျှောက် ရှည်ပြီး ပိန်သော triangle များအပါအဝင်။

1. **Surface** တွင် **Longest outside edge** ထဲ အရှည်ကို ရိုက်ပြီး {{key:Enter}} ကို နှိပ်ပါ။ သင့်ပုံမှန် survey အကွာအဝေး၏ ၂ ဆ သို့မဟုတ် ၃ ဆ ခန့်မှ စတင်ပါ။
2. အပြင်ဘက်အစွန်း ထိုအရှည်ထက် ရှည်သော အပြင်ဘက် triangle များကို ဖယ်သည်၊ အတွင်းသို့ တစ်ဆင့်ချင်းစီ အစွန်းအားလုံး တိုလာသည်အထိ။ Breakline ဖြစ်သော အစွန်းကို ဘယ်တော့မှ မဖယ်ပါ။
3. 0 ရိုက်ပါက triangle အားလုံးကို ပြန်ထားသည်။

## Surface အစီရင်ခံစာ ဖတ်ခြင်း

Surface အချက်အလက်များအောက်တွင် ဘောက်စ်တစ်ခုက builder ဘာလုပ်သွားသလဲကို ဖော်ပြသည်။ ဘယ်ဘက်တွင် အဝါရောင်ဘားဖြင့် ဆိုလျှင် အချက်အလက်ဖြစ်သည်; အနီဘားဖြင့် ဆိုလျှင် အမှားပါဝင်ပြီး surface မရှိပါ။

| စာသား | အဓိပ္ပာယ် |
|---|---|
| "3 points were at the same place as another and joined it." | Plan ပေါ်တွင် 0.0001 ထက်နီးသော point များသည် vertex တစ်ခုဖြစ်သွားသည် (ပထမတစ်ခုကို ထားသည်)။ |
| "2 places have two different elevations …" | အပေါ်အောက်ထပ်နေသော point များ၊ သို့မဟုတ် ဖြတ်နေသော breakline များသည် အမြင့်ကွဲလွဲနေသည်။ Breakline ၏ elevation နိုင်သည်၊ ထို့နောက် ပထမတစ်ခု။ |
| "1 breakline piece could not be forced into the surface." | အလွန်တိုသော သို့မဟုတ် ထပ်နေသော breakline အပိုင်းတစ်ခု မဝင်နိုင်; ထိုနေရာကို စစ်ပါ။ |
| "A surface needs at least three points with elevations." | Point နည်းလွန်းသည်: column အစီအစဉ်နှင့် group များကို စစ်ပါ။ |
| "The points are all on one line: no triangles." | Point များမှာ အကျယ်မရှိ; ဥပမာ တစ်ကြောင်းတည်းသော traverse မျဉ်း။ |
| "The boundary does not overlap the points." | Boundary က အခြားနေရာတွင် ရှိသည်၊ မကြာခဏ ယူနစ် သို့မဟုတ် coordinate ရောထွေးခြင်း။ |
| "No triangles are left inside the boundary." | Boundary သေးလွန်းသည် သို့မဟုတ် နေရာမှားနေသည်။ |

## LandXML မှ ဖတ်ထားသော surface

LandXML ဖွင့်သောအခါ ၎င်း၏ ပထမ TIN surface ကို ပုံစံအတိုင်း သုံးသည်: **Surface** ခေါင်းစဉ်က "Surface (from LandXML)" ဟု ပြပြီး **Longest outside edge** မှိန်နေသည်။ ထို surface သုံးနေစဉ် breakline group များ၊ ဆွဲထားသော breakline များနှင့် boundary အသစ်တို့သည် ၎င်းကို မပြောင်းပါ။ ဖိုင်၏ point များမှ surface ကို ပြန်တည်ဆောက်ရန် {{ui:Rebuild the surface from the points}} ကို click ပါ။ LandXML surface ကို ပြန်ယူရန် {{key:Mod+Z}} ကို သုံးပါ။

## ဆက်စပ်

- [Contour၊ elevation နှင့် slope များ ဖတ်ခြင်း](topic:contours)။
- [Survey point များ သွင်းခြင်း](topic:import-points)။
