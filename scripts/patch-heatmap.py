#!/usr/bin/env python3
"""
Patch src/lib/site-data.ts with live heatmap weekly changes for ALL 10 indices.

Reads:  src/lib/heatmap-data.json (output of fetch-heatmap.py)
Writes: replaces the heatmap section in site-data.ts (SP500_SECTORS through
        HEATMAP_INDICES export, inclusive).

For each ticker:
  - value  = curated index weight (% of index market cap, hand-tuned)
  - change = WEEKLY change % from Yahoo Finance

Sector aggregates:
  - sector value  = sum of constituent weights
  - sector change = weight-weighted average of constituent week changes
"""

import json
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
DATA = PROJECT / "src" / "lib" / "heatmap-data.json"
MOCK = PROJECT / "src" / "lib" / "site-data.ts"

# ──────────────────────────────────────────────────────────────────────────────
# Index catalogues with (ticker, weight%) tuples
# Weights are hand-estimated — used for tile sizing only.
# ──────────────────────────────────────────────────────────────────────────────

SP500 = {
    "Technology": [("NVDA",7.0),("AAPL",6.5),("MSFT",6.2),("AVGO",2.6),("ORCL",1.6),
                   ("CRM",1.0),("AMD",1.2),("ADBE",1.0),("CSCO",0.9),("ACN",0.9),
                   ("INTC",0.7),("TXN",0.7),("QCOM",0.7),("IBM",0.8),("NOW",0.9),
                   ("INTU",0.8),("AMAT",0.7),("MU",0.6),("ADI",0.5),("LRCX",0.5)],
    "Communication": [("GOOGL",2.2),("GOOG",1.9),("META",2.6),("NFLX",1.2),("DIS",0.6),
                      ("TMUS",0.7),("CMCSA",0.5),("T",0.5),("VZ",0.6)],
    "Consumer Disc.": [("AMZN",3.8),("TSLA",1.8),("HD",1.1),("MCD",0.7),("NKE",0.5),
                       ("LOW",0.6),("SBUX",0.5),("BKNG",0.7),("TJX",0.5),("ORLY",0.4)],
    "Financials": [("BRK.B",1.7),("JPM",1.4),("V",1.1),("MA",0.9),("BAC",0.8),
                   ("WFC",0.7),("GS",0.6),("MS",0.6),("AXP",0.5),("SPGI",0.5),
                   ("BLK",0.5),("C",0.5),("SCHW",0.4)],
    "Healthcare": [("LLY",1.5),("UNH",1.1),("JNJ",0.9),("MRK",0.7),("ABBV",0.9),
                   ("TMO",0.6),("ABT",0.6),("PFE",0.5),("DHR",0.5),("AMGN",0.5),
                   ("ISRG",0.6),("CVS",0.4),("BMY",0.4)],
    "Industrials": [("GE",0.6),("CAT",0.6),("RTX",0.6),("HON",0.5),("UNP",0.5),
                    ("BA",0.5),("LMT",0.4),("DE",0.4),("UPS",0.4),("ETN",0.5),("ADP",0.5)],
    "Consumer Staples": [("WMT",1.0),("PG",0.9),("COST",1.1),("KO",0.8),("PEP",0.7),
                         ("PM",0.6),("MDLZ",0.4),("CL",0.3)],
    "Energy": [("XOM",1.0),("CVX",0.8),("COP",0.4),("SLB",0.3),("EOG",0.3)],
    "Utilities": [("NEE",0.5),("SO",0.4),("DUK",0.4),("CEG",0.4)],
    "Materials": [("LIN",0.6),("SHW",0.3),("FCX",0.3),("NEM",0.2)],
    "Real Estate": [("PLD",0.4),("AMT",0.4),("EQIX",0.4),("WELL",0.3)],
}

NDX = {
    "Technology": [("NVDA",9.0),("AAPL",8.5),("MSFT",8.0),("AVGO",4.5),("ADBE",1.5),
                   ("CSCO",1.4),("AMD",1.8),("INTC",1.2),("QCOM",1.1),("TXN",1.0),
                   ("INTU",1.3),("AMAT",1.0),("MU",0.9),("ADI",0.8),("LRCX",0.8),
                   ("KLAC",0.8),("MRVL",0.6),("NXPI",0.5),("MCHP",0.4),("FTNT",0.6),
                   ("CDNS",1.0),("SNPS",0.9),("CRWD",0.9),("PANW",1.0),("ASML",1.2),
                   ("PYPL",0.4),("TEAM",0.3),("DDOG",0.4),("WDAY",0.5),("ADSK",0.5),("ANSS",0.3)],
    "Communication": [("META",4.5),("GOOGL",2.5),("GOOG",2.3),("NFLX",2.0),("CMCSA",1.0),
                      ("TMUS",1.4),("CHTR",0.4),("ROKU",0.1)],
    "Consumer Disc.": [("AMZN",5.5),("TSLA",2.8),("BKNG",1.2),("MAR",0.5),("ABNB",0.5),
                       ("MELI",0.5),("ROST",0.4),("ORLY",0.7),("LULU",0.3),("EBAY",0.2)],
    "Healthcare": [("AMGN",1.4),("GILD",1.0),("REGN",0.8),("VRTX",1.1),("ISRG",1.4),
                   ("IDXX",0.4),("ILMN",0.2),("DXCM",0.3),("MRNA",0.2),("ZTS",0.6)],
    "Consumer Staples": [("COST",2.5),("PEP",1.5),("MNST",0.5),("KDP",0.4),("KHC",0.3),("MDLZ",0.8)],
    "Industrials": [("HON",1.2),("ADP",1.0),("PAYX",0.4),("CSX",0.6),("PCAR",0.4),
                    ("ODFL",0.3),("FAST",0.3),("CTAS",0.5)],
    "Utilities": [("AEP",0.4),("EXC",0.3),("XEL",0.3)],
}

TSX = {
    "Financials": [("RY",7.0),("TD",6.0),("BMO",4.0),("BNS",3.8),("CM",2.8),
                   ("BN",3.5),("MFC",2.6),("SLF",2.2),("NA",2.0),("IFC",1.6),
                   ("FFH",1.8),("GWO",1.4),("POW",1.2)],
    "Energy": [("ENB",5.5),("CNQ",4.5),("SU",3.0),("TRP",2.8),("CVE",2.0),
               ("IMO",1.6),("TOU",1.4),("PPL",1.2),("ARX",1.0)],
    "Materials": [("AEM",3.2),("WPM",2.4),("NTR",2.2),("ABX",2.0),("FNV",1.8),
                  ("TECK",1.6),("FM",1.2),("NGT",1.0),("K",0.9)],
    "Industrials": [("CP",4.8),("CNR",4.5),("WCN",2.6),("GIB.A",1.8),("TFII",1.2),("TIH",1.0)],
    "Technology": [("SHOP",4.0),("CSU",3.5),("OTEX",0.9),("DSG",0.7)],
    "Consumer": [("ATD",3.4),("QSR",2.2),("DOL",2.0),("L",1.8),("WN",1.2),("MRU",1.0)],
    "Telecom": [("BCE",1.6),("T",1.4),("RCI.B",1.2)],
    "Utilities": [("FTS",1.4),("H",1.0),("EMA",0.8),("AQN",0.6)],
    "Real Estate": [("CAR.UN",0.6),("REI.UN",0.5)],
}

FTSE = {
    "Energy": [("SHEL",8.0),("BP",4.0)],
    "Pharma": [("AZN",7.5),("GSK",4.0)],
    "Materials": [("RIO",3.5),("BHP",3.0),("AAL",1.5),("GLEN",2.5),("ANTO",0.8),("CRH",2.5)],
    "Financials": [("HSBA",6.0),("LLOY",2.5),("BARC",2.0),("NWG",1.8),("STAN",1.5),
                   ("PRU",2.0),("LSE",2.0),("LGEN",1.0),("AV.",1.2),("III",1.0)],
    "Consumer Staples": [("ULVR",5.0),("DGE",3.0),("BATS",3.0),("IMB",1.2),("RKT",1.5),
                         ("TSCO",2.0),("ABF",1.0),("CPG",1.8)],
    "Industrials": [("BA.",2.5),("RR.",2.5),("EXPN",2.0),("FERG",2.2),("IHG",1.5),("MNG",0.6)],
    "Telecom": [("VOD",1.8),("BT.A",1.0)],
    "Utilities": [("NG.",2.5),("SVT",0.8),("UU.",0.7)],
    "Consumer Disc.": [("NXT",1.2),("JD.",0.8),("WMH",0.5)],
    "Real Estate": [("LAND",0.5),("BLND",0.5),("SGRO",0.7)],
    "Technology": [("SGE",1.0),("AVST",0.4)],
    "Healthcare": [("SN.",0.6),("HIK",0.5)],
}

DAX = {
    "Technology": [("SAP",12.0),("IFX",3.0),("SHL",2.5)],
    "Industrials": [("SIE",8.0),("AIR",4.0),("MTX",2.0),("RHM",1.8),("HEI",1.5),("CON",1.0),("HNR1",1.2)],
    "Consumer Disc.": [("MBG",5.0),("BMW",4.0),("VOW3",3.0),("P911",1.5),("ADS",3.0),("ZAL",0.8)],
    "Financials": [("ALV",7.0),("MUV2",2.5),("DBK",3.0)],
    "Consumer Staples": [("BEI",2.0),("HEN3",2.0),("SY1",1.5)],
    "Healthcare": [("BAYN",3.0),("FRE",1.5),("FME",1.0),("MRK",3.5),("QGEN",0.8),("SRT3",1.0),("BNR",1.5)],
    "Materials": [("BAS",4.0),("EVK",1.0),("1COV",0.8),("SDF",0.5)],
    "Telecom": [("DTE",5.0)],
    "Utilities": [("RWE",2.0),("EOAN",1.5),("ENR",1.5)],
    "Real Estate": [("VNA",1.5)],
    "Logistics": [("DPW",2.5),("DHL",2.0)],
}

CAC = {
    "Luxury": [("MC",11.0),("KER",3.0),("RMS",3.5),("EL",4.0)],
    "Energy": [("TTE",6.0),("ENGI",1.5)],
    "Consumer": [("OR",6.0),("BN",2.0),("RI",2.5),("CA",1.0)],
    "Industrials": [("AIR",4.0),("SAF",4.0),("SU",4.0),("DG",2.5),("ML",2.0),
                    ("VIE",1.5),("STMPA",2.5),("HO",1.8),("LR",2.0),("SGO",2.0)],
    "Healthcare": [("SAN",5.0)],
    "Financials": [("BNP",4.0),("CS",4.0),("GLE",1.5),("ACA",2.0),("AMUN",0.8)],
    "Technology": [("CAP",2.0),("DSY",2.0),("ATO",0.5),("PUB",2.0),("WLN",0.4)],
    "Auto": [("STLAP",2.0),("RNO",1.0)],
    "Materials": [("AI",4.5)],
    "Real Estate": [("URW",0.8)],
    "Telecom": [("ORA",2.0)],
    "Media": [("VIV",1.0)],
}

NIFTY50 = {
    "Financials": [("HDFCBANK",12.0),("ICICIBANK",8.0),("KOTAKBANK",3.5),("SBIN",3.0),
                   ("AXISBANK",3.0),("BAJFINANCE",2.2),("BAJAJFINSV",1.4),
                   ("INDUSINDBK",1.0),("SBILIFE",0.8),("HDFCLIFE",0.8)],
    "IT": [("INFY",5.5),("TCS",4.0),("HCLTECH",1.6),("WIPRO",0.9),("TECHM",0.8),("LTIM",0.6)],
    "Energy": [("RELIANCE",9.5),("NTPC",1.4),("ONGC",1.0),("POWERGRID",1.0),
               ("COALINDIA",1.0),("BPCL",0.5)],
    "Consumer": [("ITC",4.0),("HINDUNILVR",2.4),("TITAN",1.4),("ASIANPAINT",1.2),
                 ("NESTLEIND",0.9),("TATACONSUM",0.7),("BRITANNIA",0.6)],
    "Auto": [("TATAMOTORS",1.8),("MARUTI",1.6),("M&M",1.6),("BAJAJ-AUTO",0.9),
             ("EICHERMOT",0.7),("HEROMOTOCO",0.6)],
    "Materials": [("ULTRACEMCO",1.2),("TATASTEEL",1.2),("JSWSTEEL",1.0),
                  ("HINDALCO",0.9),("GRASIM",0.8),("UPL",0.4)],
    "Pharma": [("SUNPHARMA",1.4),("DRREDDY",0.7),("CIPLA",0.7),("DIVISLAB",0.6),("APOLLOHOSP",0.6)],
    "Industrials": [("LT",3.6),("ADANIPORTS",0.9),("ADANIENT",0.8)],
    "Telecom": [("BHARTIARTL",3.0)],
}

# Nikkei tickers are 4-digit codes
NIKKEI = {
    "Consumer Disc.": [("9983",11.0),("7203",2.0),("7267",1.0),("7270",0.6),("9024",1.2),("3382",0.8)],
    "Technology": [("8035",7.0),("6857",5.0),("6758",2.5),("6861",3.0),("6981",1.5),
                   ("6098",4.0),("6594",1.2),("7974",1.5),("6701",1.0),("4063",2.0),
                   ("6273",1.0),("4519",1.0)],
    "Financials": [("8306",2.5),("8316",1.5),("8411",0.8),("8766",1.2),("8591",0.5),("8053",1.0)],
    "Industrials": [("6367",2.5),("7011",2.0),("6326",1.0),("6503",0.8),("7741",1.5),
                    ("6645",0.8),("7751",0.7)],
    "Healthcare": [("4502",1.0),("4543",0.8)],
    "Telecom": [("9984",5.0),("9433",1.5),("9432",1.5)],
    "Energy": [("5020",0.5),("5108",1.0)],
    "Trading": [("8001",2.5),("8002",1.0),("8058",2.5),("8031",1.5)],
    "Utilities": [("9020",0.5),("9501",0.3)],
}

# Shanghai tickers are 6-digit codes
SSE = {
    "Banks": [("601398",4.0),("601288",3.5),("601988",2.5),("600036",3.5),("601166",1.5),
              ("601658",1.5),("600000",1.2),("601169",0.8),("601229",0.8)],
    "Energy": [("601857",2.5),("600028",2.0),("601088",1.5)],
    "Consumer Staples": [("600519",5.0),("603288",1.0),("600276",1.5),("600887",1.5),("600438",1.0),("600600",0.5)],
    "Insurance": [("601318",3.5),("601628",2.0),("601336",0.8),("601319",1.0)],
    "Industrials": [("601668",1.5),("601800",1.0),("601766",1.5),("600009",0.8)],
    "Materials": [("600585",1.0),("600547",0.5),("603799",0.5),("600188",0.5)],
    "Tech": [("601138",2.0),("600703",0.8),("603501",0.8)],
    "Real Estate": [("600048",0.8),("601155",0.5)],
    "Pharma": [("600196",1.0),("603259",1.2)],
}

# TAIEX (TWSE) — 4-digit Taiwanese codes with .TW suffix
# TSMC alone (~35%) dominates; tech sector covers ~60% of index
TWSE = {
    "Semiconductors": [("2330",35.0),("2454",4.0),("2303",1.5),("3034",1.2),
                       ("3711",1.5),("2474",0.8),("6488",0.6),("3661",0.8)],
    "Tech Hardware": [("2317",4.0),("2308",2.5),("2382",2.2),("2357",1.0),
                      ("3008",1.2),("2354",0.6),("2412",2.0)],
    "Financials": [("2881",2.0),("2882",2.0),("2891",1.8),("2885",1.0),
                   ("2884",1.5),("2886",1.4),("2880",0.8),("2883",0.6),
                   ("2887",0.6),("5880",0.6)],
    "Telecom": [("3045",1.0),("4904",0.6)],
    "Materials": [("1301",1.5),("1303",1.2),("2002",0.8),("6505",1.4)],
    "Consumer": [("1216",1.0),("2912",0.8),("2207",1.0),("2105",0.5)],
    "Shipping": [("2603",1.5),("2615",0.6),("2609",0.4)],
}

# KOSPI tickers are 6-digit codes with leading zeros
KOSPI = {
    "Technology": [("005930",22.0),("000660",5.0),("005935",2.0),("034220",0.5),("011070",0.4)],
    "Auto": [("005380",3.0),("000270",1.5),("012330",1.0),("011200",0.5)],
    "Healthcare": [("207940",3.0),("068270",1.5),("068760",0.5)],
    "Financials": [("105560",1.5),("055550",1.2),("086790",1.0),("316140",0.8),("138930",0.4)],
    "Industrials": [("028260",1.5),("042660",1.0),("028050",0.8),("034730",1.2)],
    "Materials": [("005490",1.2),("051910",1.5),("006400",1.2),("003670",0.8),("010130",0.6)],
    "Internet": [("035720",1.5),("035420",1.8)],
    "Telecom": [("017670",0.6),("030200",0.4)],
    "Energy": [("096770",0.8)],
    "Consumer": [("066570",1.0),("003550",0.6),("000810",0.4),("097950",0.4)],
}

# ──────────────────────────────────────────────────────────────────────────────
# Code generation
# ──────────────────────────────────────────────────────────────────────────────
def build_sectors_ts(var_name, catalog, live_data):
    """Generate `const VAR_SECTORS: HeatmapSector[] = [...];` block."""
    lines = [f"const {var_name}_SECTORS: HeatmapSector[] = ["]
    for sector, tickers in catalog.items():
        live_sector = live_data.get(sector, [])
        live_by_ticker = {x["ticker"]: x for x in live_sector}
        children_ts = []
        total_w = 0.0
        weighted = 0.0
        for ticker, weight in tickers:
            live = live_by_ticker.get(ticker, {})
            wk = float(live.get("weekChange", 0.0))
            children_ts.append(
                f'      {{ name: "{ticker}", ticker: "{ticker}", value: {weight}, change: {wk} }}'
            )
            total_w += weight
            weighted += wk * weight
        sector_change = round(weighted / total_w, 2) if total_w > 0 else 0.0
        lines.append("  {")
        lines.append(f'    name: "{sector}",')
        lines.append(f"    value: {round(total_w, 2)},")
        lines.append(f"    change: {sector_change},")
        lines.append("    children: [")
        lines.append(",\n".join(children_ts) + ",")
        lines.append("    ],")
        lines.append("  },")
    lines.append("];")
    return "\n".join(lines)

# ──────────────────────────────────────────────────────────────────────────────
# Splice into site-data.ts
# ──────────────────────────────────────────────────────────────────────────────
def main():
    data = json.loads(DATA.read_text())
    live = data["indices"]

    blocks = []
    blocks.append(build_sectors_ts("SP500",   SP500,   live["sp500"]))
    blocks.append(build_sectors_ts("NDX",     NDX,     live["ndx"]))
    blocks.append(build_sectors_ts("TSX",     TSX,     live["tsx"]))
    blocks.append(build_sectors_ts("FTSE",    FTSE,    live["ftse"]))
    blocks.append(build_sectors_ts("DAX",     DAX,     live["dax"]))
    blocks.append(build_sectors_ts("CAC",     CAC,     live["cac"]))
    blocks.append(build_sectors_ts("NIFTY50", NIFTY50, live["nifty50"]))
    blocks.append(build_sectors_ts("NIKKEI",  NIKKEI,  live["nikkei"]))
    blocks.append(build_sectors_ts("SSE",     SSE,     live["sse"]))
    blocks.append(build_sectors_ts("KOSPI",   KOSPI,   live["kospi"]))
    blocks.append(build_sectors_ts("TWSE",    TWSE,    live["twse"]))

    heatmap_indices = """export const HEATMAP_INDICES: HeatmapIndex[] = [
  { id: "sp500",   name: "S&P 500",            flag: "🇺🇸", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: SP500_SECTORS },
  { id: "ndx",     name: "NASDAQ 100",         flag: "🇺🇸", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: NDX_SECTORS },
  { id: "tsx",     name: "S&P/TSX",            flag: "🇨🇦", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: TSX_SECTORS },
  { id: "ftse",    name: "FTSE 100",           flag: "🇬🇧", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: FTSE_SECTORS },
  { id: "dax",     name: "DAX",                flag: "🇩🇪", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: DAX_SECTORS },
  { id: "cac",     name: "CAC 40",             flag: "🇫🇷", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: CAC_SECTORS },
  { id: "nifty50", name: "NIFTY 50",           flag: "🇮🇳", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: NIFTY50_SECTORS },
  { id: "nikkei",  name: "Nikkei 225",         flag: "🇯🇵", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: NIKKEI_SECTORS },
  { id: "sse",     name: "Shanghai Composite", flag: "🇨🇳", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: SSE_SECTORS },
  { id: "kospi",   name: "KOSPI",              flag: "🇰🇷", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: KOSPI_SECTORS },
  { id: "twse",    name: "TAIEX",              flag: "🇹🇼", description: "1-week % change · tile size = market-cap weight · live via Yahoo Finance", sectors: TWSE_SECTORS },
];

// Back-compat default export (S&P 500)
export const HEATMAP_DATA: HeatmapSector[] = SP500_SECTORS;
"""

    header = """// ─────────────────────────────────────────────────────────────────────────────
// HEATMAP CONSTITUENTS — LIVE WEEKLY % CHANGE from Yahoo Finance (yfinance)
//
// 10 indices, ~530 constituents total. Each ticker carries:
//   - value:  curated index weight (% of index market cap)
//   - change: WEEKLY change % (last close vs ~5 trading days ago)
//
// Refresh: npm run fetch:heatmap && npm run patch:heatmap
// ─────────────────────────────────────────────────────────────────────────────
"""

    src = MOCK.read_text()
    start_marker = "const SP500_SECTORS: HeatmapSector[] = ["
    end_marker = "export const HEATMAP_DATA: HeatmapSector[]"
    si = src.find(start_marker)
    ei_match = src.find(end_marker)
    if si == -1 or ei_match == -1:
        raise RuntimeError("could not locate replacement markers in site-data.ts")

    # End at the end of the HEATMAP_DATA line (find next newline after it)
    end_line_end = src.find("\n", ei_match) + 1

    # Strip trailing comment block above start
    pre = src[:si]
    pre_lines = pre.rstrip().splitlines()
    while pre_lines and (pre_lines[-1].lstrip().startswith("//") or pre_lines[-1].strip() == ""):
        pre_lines.pop()
    pre_clean = "\n".join(pre_lines) + "\n\n"

    new_section = header + "\n\n".join(blocks) + "\n\n" + heatmap_indices
    out = pre_clean + new_section + src[end_line_end:]
    MOCK.write_text(out)

    # Report counts
    counts = {k: sum(len(v) for v in idx.values()) for k, idx in live.items()}
    print("✓ patched site-data.ts")
    for k, c in counts.items():
        print(f"  {k:10} {c:>3} tickers")
    print(f"  {'─'*20}")
    print(f"  Total: {sum(counts.values())} constituents across 10 indices")

if __name__ == "__main__":
    main()
