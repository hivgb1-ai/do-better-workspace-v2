// 노션 개인 페이지 그리드 아래에 붙이는 날씨 카드 (서울 성동구, 실시간).
// 노션 HTML 블록은 바깥 데이터 요청을 막아서, 이 페이지를 노션 "임베드" 블록으로 붙여 쓴다.
// 대시보드 레이아웃(상단 메뉴)이 끼지 않도록 페이지가 아니라 HTML을 그대로 돌려주는 라우트로 만든다.

const HTML = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>성동구 날씨</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@200;300&family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+KR:wght@400;700&display=swap">
<style>
:root{--b:#fafaf8;--k:#151515;--g:#80807c;--l:#151515;--num:"Outfit","Noto Sans KR",sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace}
*{box-sizing:border-box}
html,body{margin:0;background:var(--b);color:var(--k);font-family:"Noto Sans KR",-apple-system,"Segoe UI",sans-serif}
a{color:inherit;text-decoration:none}
.pg{border:1px solid var(--l);display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
.c{border-right:1px solid var(--l);padding:14px 16px 16px;min-width:0;display:flex;flex-direction:column;gap:6px}
.c:last-child{border-right:0}
.lab{font-family:var(--mono);font-size:14px;font-weight:600;letter-spacing:.01em}
.v{font-family:var(--num);font-weight:200;font-size:40px;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap}
.s{font-family:var(--mono);font-size:11.5px;color:var(--g)}
.hr{display:flex;gap:0;margin-top:2px}
.hr div{flex:1;text-align:center;font-family:var(--mono);font-size:11px;color:var(--g);border-left:1px dashed #c9c9c5;padding:0 2px}
.hr div:first-child{border-left:0}
.hr b{display:block;font-family:var(--num);font-weight:300;font-size:17px;color:var(--k);margin:2px 0}
@media (max-width:640px){.pg{grid-template-columns:repeat(2,minmax(0,1fr))}.c:nth-child(2){border-right:0}.c:nth-child(-n+2){border-bottom:1px solid var(--l)}}
</style>
</head>
<body>
<div class="pg">
  <a class="c" href="https://search.naver.com/search.naver?query=%EC%84%B1%EB%8F%99%EA%B5%AC+%EB%82%A0%EC%94%A8" target="_blank" rel="noopener">
    <div class="lab" id="ic">🌤️ weather · 성동구</div><div class="v" id="t">–</div><div class="s" id="cd">불러오는 중…</div>
  </a>
  <div class="c"><div class="lab">🌡️ high / low</div><div class="v" id="hl">–</div><div class="s" id="fl"></div></div>
  <div class="c"><div class="lab">☔ rain</div><div class="v" id="rp">–</div><div class="s" id="rs"></div></div>
  <div class="c"><div class="lab">🕒 next hours</div><div class="hr" id="hr"></div><div class="s" id="up"></div></div>
</div>
<script>
const WX={0:["맑음","☀️"],1:["대체로 맑음","🌤️"],2:["구름 조금","⛅"],3:["흐림","☁️"],45:["안개","🌫️"],48:["안개","🌫️"],51:["이슬비","🌦️"],53:["이슬비","🌦️"],55:["이슬비","🌦️"],56:["어는 이슬비","🌧️"],57:["어는 이슬비","🌧️"],61:["비","🌧️"],63:["비","🌧️"],65:["강한 비","🌧️"],66:["어는 비","🌧️"],67:["어는 비","🌧️"],71:["눈","🌨️"],73:["눈","🌨️"],75:["많은 눈","❄️"],77:["싸락눈","🌨️"],80:["소나기","🌦️"],81:["소나기","🌦️"],82:["강한 소나기","⛈️"],85:["눈 소나기","🌨️"],86:["눈 소나기","🌨️"],95:["뇌우","⛈️"],96:["뇌우","⛈️"],99:["뇌우","⛈️"]};
const $=id=>document.getElementById(id),r=Math.round,pad=n=>String(n).padStart(2,"0");
async function load(){
  try{
    const u="https://api.open-meteo.com/v1/forecast?latitude=37.5634&longitude=127.0369"
      +"&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code"
      +"&hourly=temperature_2m,weather_code,precipitation_probability"
      +"&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum"
      +"&timezone=Asia%2FSeoul&forecast_days=2";
    const res=await fetch(u);if(!res.ok)throw new Error(res.status);
    const j=await res.json(),c=j.current,w=WX[c.weather_code]||["",""];
    $("ic").textContent=(w[1]||"🌤️")+" weather · 성동구";
    $("t").textContent=r(c.temperature_2m)+"°";
    $("cd").textContent=w[0]+" · 체감 "+r(c.apparent_temperature)+"° · 습도 "+r(c.relative_humidity_2m)+"%";
    $("hl").textContent=r(j.daily.temperature_2m_max[0])+"° / "+r(j.daily.temperature_2m_min[0])+"°";
    $("fl").textContent="내일 "+r(j.daily.temperature_2m_max[1])+"° / "+r(j.daily.temperature_2m_min[1])+"°";
    $("rp").textContent=(j.daily.precipitation_probability_max[0]??0)+"%";
    const mm=j.daily.precipitation_sum[0]||0;
    $("rs").textContent=mm>0?"오늘 강수 "+mm.toFixed(1)+"mm":"오늘 강수 없음";
    // 지금 이후 3시간 간격 4칸
    const now=c.time.slice(0,13),i0=j.hourly.time.findIndex(t=>t.slice(0,13)>=now);
    let h="";for(let k=1;k<=4;k++){const i=i0+k*3;if(i>=j.hourly.time.length)break;
      const ww=WX[j.hourly.weather_code[i]]||["",""];
      h+="<div>"+j.hourly.time[i].slice(11,13)+"시<b>"+r(j.hourly.temperature_2m[i])+"°</b>"+ww[1]+"</div>";}
    $("hr").innerHTML=h;
    const d=new Date();$("up").textContent="갱신 "+pad(d.getHours())+":"+pad(d.getMinutes())+" · open-meteo";
  }catch(e){$("cd").textContent="날씨를 불러오지 못했어요 · 눌러서 네이버 날씨"}
}
load();setInterval(load,15*60*1000);
</script>
</body>
</html>`;

export function GET() {
  return new Response(HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
