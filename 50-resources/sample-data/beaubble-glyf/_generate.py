"""
뷰블(Beaubble) — GLYF 브랜드 (6/3 부트캠프) 데모용 더미데이터 생성기.

페르소나: 서희경 (Co-founder, 미국 시장·Brand & Product Development).
실제 업무: 매주 월요일 사내 툴·틱톡샵·브랜드팀 대시보드를 확인 →
매출 급등 원인을 "콘텐츠 유형" 수준까지 파악 → 다음 주 액션·콘텐츠 방향을 노션에 정리.

산출:
  glyf_sales.csv               GLYF 주문 트랜잭션 (채널·SKU·일자, 콘텐츠 스파이크 반영)
  glyf_product_master.csv      GLYF 상품 마스터 (채널별 판매가·수수료·원가·마진·재고)
  glyf_content_performance.csv 인스타·틱톡·유튜브 콘텐츠 성과 (콘텐츠 유형 4종 분류)
  glyf_competitor.csv          동일 카테고리 경쟁사 + GLYF 자사 비교

규칙: utf-8-sig, random.seed 고정, 현실 패턴(주말·콘텐츠 스파이크·채널 차이) 반영.
콘텐츠 유형 4종은 서희경 제안서 단계4 기준: 단기 프로모션 / 시딩·IP 협업 / 신제품 런칭 / 정기 콘텐츠.
※ shade·가격은 데모용. 실제 GLYF 라인업 톤을 반영하되 세부 색상명은 데모 값.
"""

import csv
import random
from datetime import date, timedelta
from pathlib import Path

random.seed(20260603)
OUT = Path(__file__).parent

# ───────────────────────────────────────────────────────────────
# 1. GLYF 상품 마스터
#    (sku, 상품명, 카테고리, shade, 원가, 정가)
#    정가는 전 채널 동일(뷰티 가격 패리티). 채널은 수수료로 마진이 갈림.
# ───────────────────────────────────────────────────────────────

PRODUCTS = [
    # 글루 글로스 — 8색 (시그니처, 글루 보틀 패키징. 색상명 = 감정/상태 단어)
    ("GLF-GG-01", "글루 글로스 / 01 츄이 버블",     "립", "푸시아핑크",   3200, 16000),
    ("GLF-GG-02", "글루 글로스 / 02 소미 허니",     "립", "발레핑크",     3200, 16000),
    ("GLF-GG-03", "글루 글로스 / 03 체리 구",       "립", "체리레드",     3200, 16000),
    ("GLF-GG-04", "글루 글로스 / 04 피치 우즈",     "립", "피치",         3200, 16000),
    ("GLF-GG-05", "글루 글로스 / 05 메이플 글레이즈","립", "토프",         3200, 16000),
    ("GLF-GG-06", "글루 글로스 / 06 밍글루",        "립", "믹스베리",     3200, 16000),
    ("GLF-GG-07", "글루 글로스 / 07 모브 구미",     "립", "모브핑크",     3200, 16000),
    ("GLF-GG-08", "글루 글로스 / 08 스파이시 신",   "립", "블러드레드",   3200, 16000),
    # 글루 립라이너 — 3색
    ("GLF-LL-01", "글루 립라이너 / 01 로지 그립",   "립", "로즈베이지",   2600, 16000),
    ("GLF-LL-02", "글루 립라이너 / 02 스틱 어 피치","립", "웜피치",       2600, 16000),
    ("GLF-LL-03", "글루 립라이너 / 03 머드 허그",   "립", "누드",         2600, 16000),
    # 휴 스프레드 스틱 — 7색 (멀티 스틱: 입술·볼·코)
    ("GLF-HS-01", "휴 스프레드 스틱 / 01 코이코이", "멀티", "코이핑크",   3600, 18000),
    ("GLF-HS-02", "휴 스프레드 스틱 / 02 러스트",   "멀티", "뮤트핑크",   3600, 18000),
    ("GLF-HS-03", "휴 스프레드 스틱 / 03 티어링",   "멀티", "라이트바이올렛",3600, 18000),
    ("GLF-HS-04", "휴 스프레드 스틱 / 04 아우취",   "멀티", "오렌지브라운",3600, 18000),
    ("GLF-HS-05", "휴 스프레드 스틱 / 05 칠",       "멀티", "칠링레드",   3600, 18000),
    ("GLF-HS-06", "휴 스프레드 스틱 / 06 정크",     "멀티", "더스티모브", 3600, 18000),
    ("GLF-HS-07", "휴 스프레드 스틱 / 07 몰트",     "멀티", "모카베이지", 3600, 18000),
    # 일루에뜨 하이라이터 — 팔레트 / 미니 / 싱글 (5월 신제품)
    ("GLF-IL-PL", "일루에뜨 하이라이터 팔레트 4구",  "베이스", "4색팔레트", 9800, 43000),
    ("GLF-IL-MN", "일루에뜨 하이라이터 미니",        "베이스", "4색미니",   5400, 27000),
    ("GLF-IL-SG", "일루에뜨 하이라이터 싱글 / 트랄라라","베이스", "핑크빔",  2400, 12000),
    # 버블 이레이저 — 립 전용 버블 폼 클렌저
    ("GLF-BE-01", "버블 이레이저 립 클렌저",        "클렌저", "단일",     2900, 14000),
    # 피플 패치 — 하이드로콜로이드 스팟 패치 32매
    ("GLF-PP-01", "피플 패치 32매",                 "패치",   "단일",     1600, 8000),
]

# 채널: 서희경(미국)·Mia 데이터 소스(틱톡샵) + 확인된 실제 리테일 채널
# (code, name, 수수료율, 매출가중치)  ※ 올리브영 입점 미확인 → 제외, ZALORA(동남아) 반영
CHANNELS = [
    ("DTC",  "자사몰",         0.034, 0.30),   # beaubble.com, PG 수수료만
    ("TIKT", "틱톡샵(US)",     0.060, 0.26),   # 서희경 미국 시장·Mia 데이터 소스
    ("MUSI", "무신사",         0.250, 0.24),
    ("ZLR",  "ZALORA(동남아)", 0.220, 0.20),
]

# 콘텐츠 스파이크 — (날짜, 채널, 대상SKU, 배수, 콘텐츠유형)
# 서희경 업무의 핵심: "매출 급등 = 어떤 콘텐츠 때문인가"가 데이터로 드러나야 함.
CONTENT_SPIKES = {
    date(2026, 5, 9):  ("TIKT", "GLF-GG-03", 3.4, "시딩·IP 협업"),   # 틱톡 시딩 → 체리 구 급등
    date(2026, 5, 10): ("TIKT", "GLF-GG-03", 2.6, "시딩·IP 협업"),
    date(2026, 5, 16): ("DTC",  "GLF-IL-PL", 2.8, "신제품 런칭"),     # 하이라이터 팔레트 런칭
    date(2026, 5, 17): ("DTC",  "GLF-IL-PL", 2.2, "신제품 런칭"),
    date(2026, 5, 23): ("MUSI", None,         2.7, "단기 프로모션"),  # 무신사 뷰티 세일 (전 SKU)
    date(2026, 5, 24): ("MUSI", None,         2.4, "단기 프로모션"),
    date(2026, 5, 27): ("TIKT", "GLF-GG-02", 3.4, "시딩·IP 협업"),   # 전소미 IP 콘텐츠 → 소미 허니
}


def _discount(channel, spike_type):
    if spike_type == "단기 프로모션":
        return random.choice([0.15, 0.20, 0.20, 0.25])
    if channel == "DTC":  return random.choice([0, 0, 0, 0.10])
    if channel == "TIKT": return random.choice([0, 0.05, 0.10, 0.10])
    if channel == "MUSI": return random.choice([0, 0.05, 0.10])
    return random.choice([0, 0, 0.05])  # 올리브영


def gen_sales():
    rows = []
    seq = {c[0]: 0 for c in CHANNELS}
    cur, end = date(2026, 5, 1), date(2026, 5, 31)
    # 시간대 가중치 (점심·저녁·심야 틱톡)
    hour_w = [2,1,1,1,1,1,2,3,4,5,6,7,7,6,6,6,7,8,9,11,12,10,7,4]
    while cur <= end:
        dow = cur.weekday()
        weekend = 1.2 if dow >= 5 else 1.0
        spike = CONTENT_SPIKES.get(cur)
        base = 78
        # 콘텐츠 스파이크일: 주문 수 자체를 끌어올려 일 총매출도 분명히 튀게
        day_factor = 1.0
        jitter = random.uniform(0.9, 1.1)
        if spike:
            day_factor = 1.45 + (spike[2] - 1) * 0.22   # 하한 +45%, RNG 변동 흡수해도 +30%↑ 보장
            jitter = random.uniform(0.95, 1.08)
        n_orders = int(base * weekend * day_factor * jitter)
        # 채널 가중: 스파이크일엔 해당 채널로 주문이 쏠림
        ch_weights = [c[3] for c in CHANNELS]
        if spike:
            ch_weights = [w * (2.5 if c[0] == spike[0] else 1.0)
                          for c, w in zip(CHANNELS, ch_weights)]
        for _ in range(n_orders):
            ch = random.choices([c[0] for c in CHANNELS], weights=ch_weights)[0]
            ch_info = next(c for c in CHANNELS if c[0] == ch)
            # 콘텐츠 스파이크: 해당 채널 주문 증폭
            spike_type = ""
            if spike and spike[0] == ch:
                spike_type = spike[3]
                if random.random() < (spike[2] - 1) / spike[2]:
                    pass  # 증폭은 아래 대상 SKU 가중으로 반영
            seq[ch] += 1
            oid = f"{ch}-{cur.strftime('%y%m%d')}-{seq[ch]:04d}"
            hour = random.choices(range(24), weights=hour_w)[0]
            # 배송지역·주문상태는 주문 단위로 1회 결정 (라인마다 달라지지 않게)
            # 채널 지리 반영: 틱톡샵=미국, ZALORA=동남아, 자사몰·무신사=국내
            if ch == "TIKT":
                region = random.choice(["US-CA","US-NY","US-TX","US-WA","US-FL"])
            elif ch == "ZLR":
                region = random.choices(["싱가포르","말레이시아","필리핀"], weights=[4,3,3])[0]
            else:
                region = random.choices(
                    ["서울","경기","인천","부산","대구","기타"],
                    weights=[34,28,9,8,6,15])[0]
            status = random.choices(
                ["배송완료","배송중","교환","반품"], weights=[82,10,4,4])[0]
            n_items = random.choices([1, 2, 3], weights=[0.58, 0.32, 0.10])[0]
            for _ in range(n_items):
                # 스파이크 대상 SKU 가중
                if spike and spike[0] == ch and spike[1] and random.random() < 0.55:
                    sku = spike[1]
                    prod = next(p for p in PRODUCTS if p[0] == sku)
                elif spike and spike[0] == ch and spike[1] is None and random.random() < 0.3:
                    prod = random.choice(PRODUCTS)
                else:
                    # 글루 글로스가 평소 베스트셀러
                    prod = random.choices(
                        PRODUCTS,
                        weights=[3.0 if p[0].startswith("GLF-GG") else 1.0 for p in PRODUCTS]
                    )[0]
                sku, name, cat, shade, cost, lp = prod
                disc = _discount(ch, spike_type)
                unit = round(lp * (1 - disc) / 100) * 100
                qty = random.choices([1, 1, 1, 2], weights=[0.82, 0.06, 0.06, 0.06])[0]
                rows.append({
                    "order_id": oid,
                    "order_date": cur.isoformat(),
                    "order_hour": f"{hour:02d}:00",
                    "channel_code": ch,
                    "channel_name": ch_info[1],
                    "sku": sku,
                    "product_name": name,
                    "category": cat,
                    "list_price": lp,
                    "unit_price": unit,
                    "discount_rate": disc,
                    "qty": qty,
                    "amount": unit * qty,
                    "commission_rate": ch_info[2],
                    "region": region,
                    "order_status": status,
                })
        cur += timedelta(days=1)
    _write("glyf_sales.csv", rows)


def gen_product_master():
    rows = []
    launch = {  # 신제품(런칭일) 표시 — 하이라이터 팔레트가 5월 신상
        "GLF-IL-PL": "2026-05-16", "GLF-IL-MN": "2026-05-16", "GLF-IL-SG": "2026-05-16",
    }
    monthly = {}  # 마스터 월평균은 대략값
    for sku, name, cat, shade, cost, lp in PRODUCTS:
        if sku.startswith("GLF-GG"):   base = 900
        elif sku.startswith("GLF-LL"): base = 320
        elif sku.startswith("GLF-HS"): base = 280
        elif sku.startswith("GLF-IL"): base = 200
        else:                          base = 240   # 클렌저·패치
        monthly[sku] = int(base * random.uniform(0.8, 1.2))
    for sku, name, cat, shade, cost, lp in PRODUCTS:
        # 재고: 신제품·베스트셀러 일부 임박
        if sku in ("GLF-GG-03", "GLF-IL-PL", "GLF-GG-02"):
            stock = random.randint(120, 280)
        elif sku.startswith("GLF-LL"):
            stock = random.randint(900, 1600)  # 라이너 과재고 경향
        else:
            stock = random.randint(420, 980)
        rows.append({
            "sku": sku, "product_name": name, "category": cat, "shade": shade,
            "cost": cost, "list_price": lp,
            "dtc_price": lp, "tiktok_price": lp, "musinsa_price": lp, "zalora_price": lp,
            "dtc_pg_fee": 0.034, "tiktok_fee": 0.060, "musinsa_fee": 0.250, "zalora_fee": 0.220,
            "gross_margin_rate": round((lp - cost) / lp, 3),
            "stock_qty": stock,
            "monthly_avg_units": monthly[sku],
            "launch_date": launch.get(sku, "2026-02-01"),
            "is_new": "Y" if sku in launch else "N",
        })
    _write("glyf_product_master.csv", rows)


def gen_content_performance():
    """인스타·틱톡·유튜브 콘텐츠 성과. 콘텐츠 유형 4종 분류 + 매출 스파이크 날짜 연동."""
    rows = []
    plat_fmt = {
        "틱톡":  ["틱톡영상"],
        "인스타": ["릴스", "캐러셀", "피드", "스토리"],
        "유튜브": ["숏츠", "롱폼"],
    }
    types = ["단기 프로모션", "시딩·IP 협업", "신제품 런칭", "정기 콘텐츠"]
    # 매출 스파이크와 연동될 핵심 콘텐츠(고성과)
    anchored = [
        ("2026-05-08", "틱톡", "틱톡영상", "시딩·IP 협업", "GLF-GG-03", True),
        ("2026-05-09", "인스타", "릴스",   "시딩·IP 협업", "GLF-GG-03", True),
        ("2026-05-15", "인스타", "캐러셀", "신제품 런칭",  "GLF-IL-PL", True),
        ("2026-05-16", "틱톡", "틱톡영상", "신제품 런칭",  "GLF-IL-PL", True),
        ("2026-05-22", "인스타", "피드",   "단기 프로모션", None,        True),
        ("2026-05-26", "틱톡", "틱톡영상", "시딩·IP 협업", "GLF-GG-02", True),
        ("2026-05-27", "유튜브", "숏츠",   "시딩·IP 협업", "GLF-GG-02", True),
    ]
    sku_name = {p[0]: p[1] for p in PRODUCTS}
    cid = 0
    for d, plat, fmt, ctype, sku, hot in anchored:
        cid += 1
        reach = random.randint(45000, 120000) if hot else random.randint(3000, 15000)
        like_rate = random.uniform(0.06, 0.13)
        likes = int(reach * like_rate)
        saves = int(likes * random.uniform(0.15, 0.4))
        comments = int(likes * random.uniform(0.03, 0.09))
        clicks = int(reach * random.uniform(0.02, 0.06))
        rows.append({
            "content_id": f"C{cid:03d}", "post_date": d, "platform": plat, "format": fmt,
            "content_type": ctype, "focus_sku": sku or "",
            "focus_product": sku_name.get(sku, "전상품") if sku else "전상품",
            "reach": reach, "likes": likes, "saves": saves, "comments": comments,
            "engagement_rate": round((likes + saves + comments) / reach, 3),
            "link_clicks": clicks,
        })
    # 나머지 일반 콘텐츠 (정기 위주) — 하루 1~2건, 채널 다양
    cur, end = date(2026, 5, 1), date(2026, 5, 31)
    while cur <= end and cid < 50:
        n_today = random.choices([0, 1, 2], weights=[0.18, 0.55, 0.27])[0]
        for _ in range(n_today):
            if cid >= 50:
                break
            cid += 1
            plat = random.choices(["인스타","틱톡","유튜브"], weights=[5,4,1])[0]
            fmt = random.choice(plat_fmt[plat])
            ctype = random.choices(types, weights=[2,2,1,5])[0]
            sku = random.choice([p[0] for p in PRODUCTS]) if random.random() < 0.7 else None
            reach = random.randint(2500, 22000)
            like_rate = random.uniform(0.04, 0.11)
            likes = int(reach * like_rate)
            saves = int(likes * random.uniform(0.1, 0.35))
            comments = int(likes * random.uniform(0.02, 0.08))
            clicks = int(reach * random.uniform(0.01, 0.045))
            rows.append({
                "content_id": f"C{cid:03d}", "post_date": cur.isoformat(),
                "platform": plat, "format": fmt, "content_type": ctype,
                "focus_sku": sku or "", "focus_product": sku_name.get(sku, "전상품") if sku else "전상품",
                "reach": reach, "likes": likes, "saves": saves, "comments": comments,
                "engagement_rate": round((likes + saves + comments) / reach, 3),
                "link_clicks": clicks,
            })
        cur += timedelta(days=1)
    rows.sort(key=lambda r: r["post_date"])
    _write("glyf_content_performance.csv", rows)


def gen_competitor():
    """동일 색조 카테고리 경쟁 + GLYF 자사(동일 포맷 비교 가능)."""
    data = [
        # (brand, 상품명, 카테고리, 가격, 대표채널, 월판매추정, 평점, 리뷰수)
        ("롬앤",     "글래스팅 워터 글로스", "립", 12000, "올리브영", 38000, 4.7, 24800),
        ("롬앤",     "쥬시 래스팅 틴트",     "립", 12000, "올리브영", 52000, 4.8, 61200),
        ("페리페라",  "잉크 무드 글로이 틴트","립", 11000, "올리브영", 41000, 4.6, 33500),
        ("페리페라",  "잉크 더 벨벳",         "립", 10000, "올리브영", 47000, 4.7, 58900),
        ("클리오",    "멜팅 듀 틴트",         "립", 14000, "올리브영", 22000, 4.6, 12400),
        ("어뮤즈",    "듀 틴트",              "립", 16000, "자사몰",   18000, 4.7, 8900),
        ("힌스",      "글로우 밤",            "립", 21000, "무신사",   9500,  4.5, 4200),
        ("롬앤",     "베러 댄 치크",         "베이스", 14000, "올리브영", 16000, 4.6, 9800),
        ("페리페라",  "슈가 트윙클 하이라이터","베이스", 13000, "올리브영", 11000, 4.5, 5100),
        ("클리오",    "프리즘 에어 하이라이터","베이스", 22000, "올리브영", 8800,  4.6, 6700),
        ("어뮤즈",    "쿠션 하이라이터",      "베이스", 24000, "자사몰",   6200,  4.5, 2400),
        # ── GLYF 자사 (비교용, 동일 포맷) ──
        ("GLYF",     "글루 글로스",          "립", 16000, "자사몰",   14500, 4.7, 3200),
        ("GLYF",     "글루 립라이너",        "립", 16000, "자사몰",   4800,  4.5, 980),
        ("GLYF",     "휴 스프레드 스틱",     "베이스", 18000, "자사몰", 5600,  4.6, 1450),
        ("GLYF",     "일루에뜨 하이라이터 팔레트","베이스", 43000, "자사몰", 2400, 4.8, 410),
        ("GLYF",     "버블 이레이저 립 클렌저","클렌저", 14000, "자사몰", 3100, 4.4, 720),
    ]
    rows = []
    for brand, name, cat, price, ch, vol, rating, rv in data:
        rows.append({
            "brand": brand, "product_name": name, "category": cat,
            "price": price, "main_channel": ch,
            "monthly_sales_est": vol, "rating": rating, "review_count": rv,
            "is_own": "Y" if brand == "GLYF" else "N",
        })
    _write("glyf_competitor.csv", rows)


def _write(fname, rows):
    with open(OUT / fname, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"{fname}: {len(rows)}건")


if __name__ == "__main__":
    gen_sales()
    gen_product_master()
    gen_content_performance()
    gen_competitor()
    print("\nAll GLYF CSVs generated.")
