/* UK Airshow Guide: door to show journey planner (6 Nov 2026).
   One file for the Public Transport page and every feature show page.
   Put <div class="ukag-jp" data-show="clacton"></div> where it should go and load this script.
   data-show="" (or "pick") shows a show picker. data-sync="fShow" follows another <select> on the page.

   How it works: the visitor's town or postcode is found with postcodes.io (free, no key).
   The rail map below is the main lines and the lines into every featured show, with typical
   journey times. It finds the likely route and the changes, then hands over to National Rail
   for the exact times and tickets, and to Google Maps for the bit from the front door.
   Times are typical, not a timetable. Edit STA, LINES and SHOWS below; nothing else needs changing. */
(function () {
  'use strict';
  if (window.UKAG_JP) return;

  /* ---------- operators: brand colour, text colour ---------- */
  var OP = {
    'Greater Anglia': ['#D70428', '#fff'], 'c2c': ['#B7007C', '#fff'], 'LNER': ['#CE0E2D', '#fff'],
    'Avanti West Coast': ['#004354', '#fff'], 'GWR': ['#0A493E', '#fff'], 'CrossCountry': ['#660F21', '#fff'],
    'TransPennine Express': ['#1C4C9C', '#fff'], 'Northern': ['#262262', '#fff'], 'East Midlands Railway': ['#713563', '#fff'],
    'Thameslink': ['#E9438D', '#fff'], 'Great Northern': ['#2A6EBB', '#fff'], 'Southern': ['#5C9E2E', '#fff'],
    'Southeastern': ['#0B8FCF', '#fff'], 'South Western Railway': ['#24398C', '#fff'], 'Chiltern Railways': ['#0099C4', '#fff'],
    'West Midlands Railway': ['#E07709', '#fff'], 'Transport for Wales': ['#C8102E', '#fff'], 'Merseyrail': ['#FFD600', '#13293C'],
    'ScotRail': ['#1E467D', '#fff'], 'Elizabeth line': ['#6950A1', '#fff'], 'Stansted Express': ['#6B4C9A', '#fff'],
    'London Northwestern Railway': ['#00A651', '#fff'], 'Tube': ['#13293C', '#fff'], 'Walk': ['#6B7C89', '#fff']
  };

  /* ---------- stations: CRS code: [name, lat, lon] ---------- */
  var STA = {
    KGX: ['London Kings Cross', 51.5320, -0.1233], STP: ['London St Pancras', 51.5308, -0.1260], EUS: ['London Euston', 51.5282, -0.1337],
    PAD: ['London Paddington', 51.5154, -0.1755], LST: ['London Liverpool Street', 51.5178, -0.0817], FST: ['London Fenchurch Street', 51.5115, -0.0784],
    VIC: ['London Victoria', 51.4952, -0.1441], WAT: ['London Waterloo', 51.5031, -0.1132], LBG: ['London Bridge', 51.5050, -0.0860],
    CHX: ['London Charing Cross', 51.5080, -0.1247], MYB: ['London Marylebone', 51.5225, -0.1631], BFR: ['London Blackfriars', 51.5116, -0.1035],
    ZFD: ['Farringdon', 51.5203, -0.1053], CLJ: ['Clapham Junction', 51.4642, -0.1703], SRA: ['Stratford', 51.5416, -0.0034],
    SFA: ['Stratford International', 51.5448, -0.0087], TOM: ['Tottenham Hale', 51.5882, -0.0601], FPK: ['Finsbury Park', 51.5643, -0.1065],
    ECR: ['East Croydon', 51.3755, -0.0927], BKG: ['Barking', 51.5396, 0.0809], UPM: ['Upminster', 51.5590, 0.2510],
    BEF: ['Benfleet', 51.5442, 0.5617], LES: ['Leigh-on-Sea', 51.5414, 0.6503], SOC: ['Southend Central', 51.5374, 0.7116],
    WIC: ['Wickford', 51.6088, 0.5194], RLG: ['Rayleigh', 51.5876, 0.6025], SOV: ['Southend Victoria', 51.5415, 0.7115],
    SNF: ['Shenfield', 51.6309, 0.3297], CHM: ['Chelmsford', 51.7364, 0.4686], WTM: ['Witham', 51.8059, 0.6390],
    COL: ['Colchester', 51.9007, 0.8925], MNG: ['Manningtree', 51.9490, 1.0453], IPS: ['Ipswich', 52.0507, 1.1446],
    SMK: ['Stowmarket', 52.1900, 1.0000], DIS: ['Diss', 52.3740, 1.1235], NRW: ['Norwich', 52.6270, 1.3068],
    TLS: ['Thorpe-le-Soken', 51.8475, 1.1612], CLT: ['Clacton-on-Sea', 51.7940, 1.1543],
    HWN: ['Harlow Town', 51.7810, 0.0950], BIS: ['Bishops Stortford', 51.8667, 0.1647], SSD: ['Stansted Airport', 51.8888, 0.2610],
    AUD: ['Audley End', 52.0045, 0.2073], WLF: ['Whittlesford Parkway', 52.1036, 0.1659], CBG: ['Cambridge', 52.1943, 0.1374],
    NMK: ['Newmarket', 52.2378, 0.4061], BSE: ['Bury St Edmunds', 52.2537, 0.7130], ELY: ['Ely', 52.3913, 0.2669],
    TTF: ['Thetford', 52.4198, 0.7458], KLN: ['Kings Lynn', 52.7539, 0.4035], GYM: ['Great Yarmouth', 52.6122, 1.7206],
    LWT: ['Lowestoft', 52.4745, 1.7497],
    SVG: ['Stevenage', 51.9017, -0.2071], HIT: ['Hitchin', 51.9535, -0.2633], LET: ['Letchworth Garden City', 51.9800, -0.2295],
    RYS: ['Royston', 52.0533, -0.0269], BIW: ['Biggleswade', 52.0847, -0.2613], SDY: ['Sandy', 52.1249, -0.2810],
    SNO: ['St Neots', 52.2316, -0.2474], HUN: ['Huntingdon', 52.3285, -0.1918], PBO: ['Peterborough', 52.5748, -0.2502],
    SAC: ['St Albans City', 51.7504, -0.3277], LTN: ['Luton Airport Parkway', 51.8724, -0.3956], BDM: ['Bedford', 52.1362, -0.4793],
    KET: ['Kettering', 52.3935, -0.7311], MHR: ['Market Harborough', 52.4800, -0.9091], LEI: ['Leicester', 52.6314, -1.1253],
    LBO: ['Loughborough', 52.7790, -1.1960], DBY: ['Derby', 52.9165, -1.4632], CHD: ['Chesterfield', 53.2381, -1.4199],
    SHF: ['Sheffield', 53.3784, -1.4620], NOT: ['Nottingham', 52.9471, -1.1463],
    BTN: ['Brighton', 50.8290, -0.1413], HHE: ['Haywards Heath', 51.0053, -0.1053], GTW: ['Gatwick Airport', 51.1565, -0.1610],
    LWS: ['Lewes', 50.8706, 0.0113], EBN: ['Eastbourne', 50.7695, 0.2813], BEX: ['Bexhill', 50.8410, 0.4769],
    HGS: ['Hastings', 50.8577, 0.5761], WRH: ['Worthing', 50.8183, -0.3762], CCH: ['Chichester', 50.8320, -0.7817],
    HAV: ['Havant', 50.8545, -0.9816], SOU: ['Southampton Central', 50.9075, -1.4140], BMH: ['Bournemouth', 50.7272, -1.8645],
    PMH: ['Portsmouth Harbour', 50.7969, -1.1080], GLD: ['Guildford', 51.2370, -0.5800], WOK: ['Woking', 51.3185, -0.5569],
    BSK: ['Basingstoke', 51.2685, -1.0873], WIN: ['Winchester', 51.0672, -1.3197], ADV: ['Andover', 51.2115, -1.4920],
    SAL: ['Salisbury', 51.0705, -1.8064],
    SEV: ['Sevenoaks', 51.2766, 0.1817], TON: ['Tonbridge', 51.1913, 0.2709], PDW: ['Paddock Wood', 51.1824, 0.3891],
    MRN: ['Marden', 51.1715, 0.4930], SPU: ['Staplehurst', 51.1712, 0.5503], HCN: ['Headcorn', 51.1659, 0.6274],
    PLC: ['Pluckley', 51.1567, 0.7473], AFK: ['Ashford International', 51.1435, 0.8752], TBW: ['Tunbridge Wells', 51.1302, 0.2627],
    EBD: ['Ebbsfleet International', 51.4429, 0.3207], CBW: ['Canterbury West', 51.2843, 1.0752], RAM: ['Ramsgate', 51.3410, 1.4064],
    BMS: ['Bromley South', 51.4000, 0.0175], CTM: ['Chatham', 51.3803, 0.5210], FAV: ['Faversham', 51.3125, 0.8910],
    CBE: ['Canterbury East', 51.2741, 1.0767], DVP: ['Dover Priory', 51.1257, 1.3051],
    RDG: ['Reading', 51.4588, -0.9719], DID: ['Didcot Parkway', 51.6110, -1.2425], OXF: ['Oxford', 51.7535, -1.2700],
    SWI: ['Swindon', 51.5655, -1.7855], CPM: ['Chippenham', 51.4625, -2.1153], BTH: ['Bath Spa', 51.3776, -2.3571],
    BRI: ['Bristol Temple Meads', 51.4491, -2.5813], BPW: ['Bristol Parkway', 51.5137, -2.5420], NWP: ['Newport', 51.5888, -3.0002],
    CDF: ['Cardiff Central', 51.4760, -3.1791], BGN: ['Bridgend', 51.5070, -3.5753], PTA: ['Port Talbot Parkway', 51.5916, -3.7808],
    NTH: ['Neath', 51.6624, -3.8073], SWA: ['Swansea', 51.6253, -3.9415], LLE: ['Llanelli', 51.6739, -4.1612],
    CMN: ['Carmarthen', 51.8531, -4.3058], TAU: ['Taunton', 51.0234, -3.1026], EXD: ['Exeter St Davids', 50.7293, -3.5434],
    NTA: ['Newton Abbot', 50.5296, -3.5992], PLY: ['Plymouth', 50.3778, -4.1434], BOD: ['Bodmin Parkway', 50.4459, -4.6631],
    TRU: ['Truro', 50.2638, -5.0647], PNZ: ['Penzance', 50.1218, -5.5326], KEM: ['Kemble', 51.6767, -2.0222],
    STD: ['Stroud', 51.7445, -2.2193], GCR: ['Gloucester', 51.8655, -2.2387], CNM: ['Cheltenham Spa', 51.8973, -2.0993],
    HWY: ['High Wycombe', 51.6295, -0.7451], BIT: ['Bicester Village', 51.8935, -1.1488], BAN: ['Banbury', 52.0601, -1.3283],
    LMS: ['Leamington Spa', 52.2846, -1.5361], BMO: ['Birmingham Moor Street', 52.4791, -1.8924], BHM: ['Birmingham New Street', 52.4778, -1.8990],
    BHI: ['Birmingham International', 52.4508, -1.7258], COV: ['Coventry', 52.4006, -1.5134], RUG: ['Rugby', 52.3790, -1.2502],
    MKC: ['Milton Keynes Central', 52.0342, -0.7741], NMP: ['Northampton', 52.2378, -0.9068], NUN: ['Nuneaton', 52.5265, -1.4642],
    WVH: ['Wolverhampton', 52.5879, -2.1195], COS: ['Cosford', 52.6403, -2.3054], TFC: ['Telford Central', 52.6807, -2.4407],
    SHR: ['Shrewsbury', 52.7119, -2.7495], STA: ['Stafford', 52.8040, -2.1219], SOT: ['Stoke-on-Trent', 53.0080, -2.1808],
    MAC: ['Macclesfield', 53.2593, -2.1215], SPT: ['Stockport', 53.4055, -2.1626], MAN: ['Manchester Piccadilly', 53.4774, -2.2309],
    CRE: ['Crewe', 53.0896, -2.4329], RUN: ['Runcorn', 53.3387, -2.7392], LIV: ['Liverpool Lime Street', 53.4076, -2.9772],
    LVC: ['Liverpool Central', 53.4045, -2.9790], WBQ: ['Warrington Bank Quay', 53.3920, -2.6040], WGN: ['Wigan North Western', 53.5435, -2.6333],
    WGW: ['Wigan Wallgate', 53.5448, -2.6330], PRE: ['Preston', 53.7563, -2.7083], BON: ['Bolton', 53.5740, -2.4256],
    KKM: ['Kirkham and Wesham', 53.7870, -2.8818], BPN: ['Blackpool North', 53.8216, -3.0490], BPB: ['Blackpool Pleasure Beach', 53.7869, -3.0533],
    BPS: ['Blackpool South', 53.7986, -3.0493], FBY: ['Formby', 53.5531, -3.0710], SOP: ['Southport', 53.6466, -3.0024],
    LAN: ['Lancaster', 54.0486, -2.8075], OXN: ['Oxenholme Lake District', 54.3053, -2.7220], PNR: ['Penrith', 54.6618, -2.7586],
    CAR: ['Carlisle', 54.8906, -2.9335], LOC: ['Lockerbie', 55.1229, -3.3532], GLC: ['Glasgow Central', 55.8589, -4.2580],
    GLQ: ['Glasgow Queen Street', 55.8622, -4.2510], EDB: ['Edinburgh Waverley', 55.9520, -3.1890], HYM: ['Haymarket', 55.9459, -3.2184],
    PYG: ['Paisley Gilmour Street', 55.8472, -4.4243], KWN: ['Kilwinning', 55.6526, -4.7097], IRV: ['Irvine', 55.6110, -4.6750],
    TRN: ['Troon', 55.5429, -4.6553], PRA: ['Prestwick Airport', 55.5091, -4.6141], NOA: ['Newton-on-Ayr', 55.4733, -4.6249],
    AYR: ['Ayr', 55.4579, -4.6266], KMK: ['Kilmarnock', 55.6117, -4.4989], DMF: ['Dumfries', 55.0726, -3.6044],
    STG: ['Stirling', 56.1196, -3.9356], PTH: ['Perth', 56.3920, -3.4392], INV: ['Inverness', 57.4800, -4.2232],
    KDY: ['Kirkcaldy', 56.1123, -3.1673], DEE: ['Dundee', 56.4566, -2.9714], ABD: ['Aberdeen', 57.1435, -2.0985],
    LDS: ['Leeds', 53.7951, -1.5476], WKF: ['Wakefield Westgate', 53.6834, -1.5072], DON: ['Doncaster', 53.5222, -1.1400],
    RET: ['Retford', 53.3150, -0.9475], NNG: ['Newark North Gate', 53.0817, -0.7998], GRA: ['Grantham', 52.9063, -0.6420],
    YRK: ['York', 53.9577, -1.0932], DAR: ['Darlington', 54.5203, -1.5474], DHM: ['Durham', 54.7794, -1.5818],
    NCL: ['Newcastle', 54.9684, -1.6174], BWK: ['Berwick-upon-Tweed', 55.7743, -2.0107], HUD: ['Huddersfield', 53.6485, -1.7845],
    HUL: ['Hull', 53.7442, -0.3459], SBY: ['Selby', 53.7826, -1.0636], MBR: ['Middlesbrough', 54.5791, -1.2346],
    HEX: ['Hexham', 54.9733, -2.0947], HFX: ['Halifax', 53.7209, -1.8536], BBN: ['Blackburn', 53.7465, -2.4793],
    BYM: ['Burnley Manchester Road', 53.7856, -2.2491], BDI: ['Bradford Interchange', 53.7915, -1.7495], LCN: ['Lincoln', 53.2264, -0.5398],
    CTR: ['Chester', 53.1966, -2.8800], WRX: ['Wrexham General', 53.0503, -3.0021], RHL: ['Rhyl', 53.3184, -3.4891],
    LLJ: ['Llandudno Junction', 53.2837, -3.8092], BNG: ['Bangor', 53.2223, -4.1357], HHD: ['Holyhead', 53.3078, -4.6309],
    HFD: ['Hereford', 52.0612, -2.7084], AGV: ['Abergavenny', 51.8168, -3.0096], WOF: ['Worcester Foregate Street', 52.1956, -2.2216],
    GMV: ['Great Malvern', 52.1090, -2.3180], MCN: ['Machynlleth', 52.5951, -3.8547], AYW: ['Aberystwyth', 52.4140, -4.0817],
    UNI: ['University (Birmingham)', 52.4511, -1.9365], RDC: ['Redditch', 52.3060, -1.9450],
    SUN: ['Sunderland', 54.9054, -1.3826], HPL: ['Hartlepool', 54.6863, -1.2069], SCA: ['Scarborough', 54.2798, -0.4059],
    MDE: ['Maidstone East', 51.2779, 0.5213], MIA: ['Manchester Airport', 53.3650, -2.2730],
    SWF: ['South Woodham Ferrers', 51.6493, 0.6064], BUC: ['Burnham-on-Crouch', 51.6334, 0.8142], SMN: ['Southminster', 51.6607, 0.8350],
    BTR: ['Braintree', 51.8754, 0.5568], MKT: ['Marks Tey', 51.8810, 0.7832], KEL: ['Kelvedon', 51.8406, 0.7026], SUY: ['Sudbury', 52.0362, 0.7357],
    WON: ['Walton-on-the-Naze', 51.8460, 1.2675], FRI: ['Frinton-on-Sea', 51.8380, 1.2433], HPQ: ['Harwich International', 51.9474, 1.2554], HWC: ['Harwich Town', 51.9441, 1.2866],
    FLX: ['Felixstowe', 51.9670, 1.3505], CMR: ['Cromer', 52.9302, 1.2928], SHM: ['Sheringham', 52.9413, 1.2097], NWA: ['North Walsham', 52.8170, 1.3843],
    BXB: ['Broxbourne', 51.7466, -0.0110], WAR: ['Ware', 51.8079, -0.0287], HFE: ['Hertford East', 51.7990, -0.0730]
  };

  /* ---------- lines: [operator, line name, [code, minutes from start], ...] typical times ---------- */
  var LINES = [
    ['Greater Anglia', 'Liverpool Street to Norwich', [['LST', 0], ['SNF', 25], ['CHM', 35], ['WTM', 45], ['COL', 55], ['MNG', 65], ['IPS', 72], ['SMK', 84], ['DIS', 95], ['NRW', 112]]],
    ['Greater Anglia', 'Liverpool Street to Clacton-on-Sea', [['LST', 0], ['SNF', 25], ['CHM', 35], ['WTM', 45], ['COL', 57], ['TLS', 74], ['CLT', 86]]],
    ['Greater Anglia', 'Liverpool Street to Southend Victoria', [['LST', 0], ['SRA', 7], ['SNF', 25], ['WIC', 36], ['RLG', 43], ['SOV', 55]]],
    ['Greater Anglia', 'Liverpool Street to Cambridge', [['LST', 0], ['TOM', 12], ['HWN', 30], ['BIS', 40], ['AUD', 55], ['WLF', 63], ['CBG', 75]]],
    ['Stansted Express', 'Liverpool Street to Stansted Airport', [['LST', 0], ['TOM', 15], ['BIS', 38], ['SSD', 48]]],
    ['Greater Anglia', 'Cambridge to Ipswich', [['CBG', 0], ['NMK', 22], ['BSE', 42], ['SMK', 58], ['IPS', 72]]],
    ['Greater Anglia', 'Cambridge to Norwich', [['CBG', 0], ['ELY', 15], ['TTF', 40], ['NRW', 80]]],
    ['Greater Anglia', 'Norwich to Great Yarmouth', [['NRW', 0], ['GYM', 33]]],
    ['Greater Anglia', 'Norwich to Lowestoft', [['NRW', 0], ['LWT', 40]]],
    ['Greater Anglia', 'East Suffolk line', [['IPS', 0], ['LWT', 90]]],
    ['c2c', 'Fenchurch Street to Southend', [['FST', 0], ['BKG', 12], ['UPM', 21], ['BEF', 36], ['LES', 43], ['SOC', 50]]],
    ['Great Northern', 'Kings Cross to Cambridge', [['KGX', 0], ['FPK', 6], ['SVG', 25], ['HIT', 32], ['LET', 37], ['RYS', 47], ['CBG', 60]]],
    ['Great Northern', 'Cambridge to Kings Lynn', [['CBG', 0], ['ELY', 15], ['KLN', 45]]],
    ['Thameslink', 'Brighton to Bedford', [['BTN', 0], ['HHE', 15], ['GTW', 30], ['ECR', 45], ['LBG', 60], ['BFR', 64], ['ZFD', 68], ['STP', 72], ['SAC', 90], ['LTN', 100], ['BDM', 125]]],
    ['Thameslink', 'Horsham to Peterborough', [['GTW', 0], ['ECR', 15], ['LBG', 30], ['BFR', 34], ['ZFD', 38], ['STP', 42], ['FPK', 50], ['SVG', 70], ['HIT', 77], ['BIW', 88], ['SDY', 92], ['SNO', 100], ['HUN', 108], ['PBO', 122]]],
    ['LNER', 'East Coast main line', [['KGX', 0], ['SVG', 20], ['PBO', 45], ['GRA', 65], ['NNG', 78], ['RET', 92], ['DON', 100], ['YRK', 120], ['DAR', 150], ['DHM', 167], ['NCL', 180], ['BWK', 225], ['EDB', 270]]],
    ['LNER', 'Kings Cross to Leeds', [['KGX', 0], ['SVG', 20], ['PBO', 45], ['GRA', 65], ['NNG', 78], ['DON', 100], ['WKF', 118], ['LDS', 133]]],
    ['LNER', 'Newark to Lincoln', [['NNG', 0], ['LCN', 25]]],
    ['ScotRail', 'Edinburgh to Aberdeen', [['EDB', 0], ['HYM', 4], ['KDY', 35], ['DEE', 80], ['ABD', 145]]],
    ['ScotRail', 'Glasgow to Inverness', [['GLQ', 0], ['STG', 30], ['PTH', 62], ['INV', 210]]],
    ['ScotRail', 'Edinburgh to Glasgow Queen Street', [['EDB', 0], ['HYM', 4], ['GLQ', 50]]],
    ['ScotRail', 'Glasgow Central to Ayr', [['GLC', 0], ['PYG', 10], ['KWN', 30], ['IRV', 35], ['TRN', 42], ['PRA', 46], ['NOA', 52], ['AYR', 55]]],
    ['ScotRail', 'Carlisle to Glasgow via Kilmarnock', [['CAR', 0], ['DMF', 35], ['KMK', 110], ['GLC', 150]]],
    ['Avanti West Coast', 'Euston to Glasgow', [['EUS', 0], ['MKC', 32], ['RUG', 50], ['CRE', 95], ['WBQ', 115], ['WGN', 125], ['PRE', 140], ['LAN', 155], ['OXN', 170], ['PNR', 195], ['CAR', 210], ['GLC', 285]]],
    ['Avanti West Coast', 'Euston to Birmingham and Wolverhampton', [['EUS', 0], ['MKC', 32], ['RUG', 50], ['COV', 60], ['BHI', 70], ['BHM', 82], ['WVH', 102]]],
    ['Avanti West Coast', 'Euston to Manchester', [['EUS', 0], ['MKC', 32], ['SOT', 85], ['MAC', 100], ['SPT', 112], ['MAN', 125]]],
    ['Avanti West Coast', 'Euston to Liverpool', [['EUS', 0], ['MKC', 32], ['STA', 75], ['CRE', 95], ['RUN', 110], ['LIV', 130]]],
    ['Avanti West Coast', 'Euston to Blackpool North', [['EUS', 0], ['MKC', 32], ['CRE', 95], ['WGN', 125], ['PRE', 140], ['KKM', 152], ['BPN', 165]]],
    ['Avanti West Coast', 'Birmingham to Edinburgh', [['BHM', 0], ['WVH', 18], ['CRE', 55], ['PRE', 105], ['LAN', 120], ['OXN', 135], ['PNR', 160], ['CAR', 175], ['LOC', 195], ['EDB', 250]]],
    ['Avanti West Coast', 'Birmingham to Glasgow', [['BHM', 0], ['WVH', 18], ['CRE', 55], ['PRE', 105], ['LAN', 120], ['OXN', 135], ['PNR', 160], ['CAR', 175], ['GLC', 245]]],
    ['East Midlands Railway', 'Norwich to Liverpool', [['NRW', 0], ['TTF', 30], ['ELY', 55], ['PBO', 85], ['GRA', 110], ['NOT', 145], ['SHF', 195], ['SPT', 245], ['MAN', 255], ['LIV', 310]]],
    ['TransPennine Express', 'Manchester to Scotland', [['MAN', 0], ['BON', 15], ['PRE', 45], ['LAN', 60], ['OXN', 75], ['PNR', 100], ['CAR', 115], ['LOC', 135], ['EDB', 195]]],
    ['TransPennine Express', 'Newcastle to Liverpool', [['NCL', 0], ['DHM', 15], ['DAR', 33], ['YRK', 65], ['LDS', 90], ['HUD', 110], ['MAN', 140], ['LIV', 180]]],
    ['TransPennine Express', 'Leeds to Hull', [['LDS', 0], ['SBY', 30], ['HUL', 60]]],
    ['TransPennine Express', 'Manchester to Sheffield', [['MAN', 0], ['SHF', 52]]],
    ['Northern', 'Manchester to Blackpool North', [['MAN', 0], ['BON', 17], ['PRE', 50], ['KKM', 62], ['BPN', 75]]],
    ['Northern', 'Preston to Blackpool South', [['PRE', 0], ['KKM', 12], ['BPB', 28], ['BPS', 33]]],
    ['Northern', 'York to Blackpool North', [['YRK', 0], ['LDS', 25], ['BDI', 45], ['HFX', 57], ['BYM', 85], ['BBN', 100], ['PRE', 118], ['KKM', 128], ['BPN', 140]]],
    ['Northern', 'Manchester to Southport', [['MAN', 0], ['BON', 20], ['WGW', 40], ['SOP', 78]]],
    ['Northern', 'Newcastle to Carlisle', [['NCL', 0], ['HEX', 30], ['CAR', 85]]],
    ['Northern', 'Darlington to Middlesbrough', [['DAR', 0], ['MBR', 28]]],
    ['Northern', 'Sheffield to Leeds', [['SHF', 0], ['LDS', 45]]],
    ['Merseyrail', 'Northern line to Southport', [['LVC', 0], ['FBY', 30], ['SOP', 45]]],
    ['CrossCountry', 'North East to South West', [['EDB', 0], ['BWK', 40], ['NCL', 90], ['DHM', 105], ['DAR', 122], ['YRK', 150], ['LDS', 175], ['SHF', 215], ['DBY', 245], ['BHM', 285], ['CNM', 325], ['BPW', 355], ['BRI', 368], ['TAU', 400], ['EXD', 430], ['NTA', 450], ['PLY', 485], ['BOD', 515], ['TRU', 545], ['PNZ', 590]]],
    ['CrossCountry', 'Manchester to Birmingham', [['MAN', 0], ['SPT', 10], ['MAC', 22], ['SOT', 40], ['STA', 58], ['WVH', 72], ['BHM', 90]]],
    ['CrossCountry', 'Birmingham to Bournemouth', [['BHM', 0], ['LMS', 30], ['BAN', 50], ['OXF', 72], ['RDG', 98], ['BSK', 115], ['WIN', 132], ['SOU', 145], ['BMH', 180]]],
    ['CrossCountry', 'Birmingham to Stansted Airport', [['BHM', 0], ['NUN', 25], ['LEI', 55], ['PBO', 110], ['ELY', 140], ['CBG', 155], ['SSD', 185]]],
    ['East Midlands Railway', 'St Pancras to Sheffield', [['STP', 0], ['LTN', 25], ['BDM', 40], ['KET', 55], ['MHR', 65], ['LEI', 75], ['LBO', 86], ['DBY', 100], ['CHD', 120], ['SHF', 135]]],
    ['East Midlands Railway', 'St Pancras to Nottingham', [['STP', 0], ['LTN', 25], ['BDM', 40], ['KET', 55], ['MHR', 65], ['LEI', 75], ['NOT', 100]]],
    ['GWR', 'Paddington to Bristol', [['PAD', 0], ['RDG', 25], ['DID', 40], ['SWI', 55], ['CPM', 70], ['BTH', 82], ['BRI', 97]]],
    ['GWR', 'Paddington to Swansea', [['PAD', 0], ['RDG', 25], ['DID', 40], ['SWI', 55], ['BPW', 80], ['NWP', 98], ['CDF', 112], ['BGN', 132], ['PTA', 147], ['NTH', 155], ['SWA', 170]]],
    ['GWR', 'Paddington to Penzance', [['PAD', 0], ['RDG', 25], ['TAU', 105], ['EXD', 125], ['NTA', 145], ['PLY', 180], ['BOD', 215], ['TRU', 250], ['PNZ', 295]]],
    ['GWR', 'Paddington to Cheltenham', [['PAD', 0], ['RDG', 25], ['DID', 40], ['SWI', 55], ['KEM', 75], ['STD', 92], ['GCR', 108], ['CNM', 120]]],
    ['GWR', 'Paddington to Oxford', [['PAD', 0], ['RDG', 25], ['DID', 40], ['OXF', 55]]],
    ['GWR', 'Bristol to Exeter', [['BRI', 0], ['TAU', 35], ['EXD', 60]]],
    ['GWR', 'Cardiff to Portsmouth', [['CDF', 0], ['NWP', 15], ['BRI', 50], ['BTH', 65], ['SAL', 120], ['SOU', 155], ['PMH', 200]]],
    ['Transport for Wales', 'Manchester to South Wales', [['MAN', 0], ['CRE', 35], ['SHR', 70], ['HFD', 125], ['AGV', 150], ['NWP', 172], ['CDF', 187], ['BGN', 210], ['NTH', 238], ['SWA', 250]]],
    ['Transport for Wales', 'Holyhead to Cardiff', [['HHD', 0], ['BNG', 30], ['LLJ', 50], ['RHL', 65], ['CTR', 100], ['WRX', 115], ['SHR', 150], ['HFD', 205], ['AGV', 230], ['NWP', 252], ['CDF', 267]]],
    ['Transport for Wales', 'Chester to Crewe', [['CTR', 0], ['CRE', 25]]],
    ['Transport for Wales', 'Swansea to Carmarthen', [['SWA', 0], ['LLE', 15], ['CMN', 45]]],
    ['Transport for Wales', 'Cambrian line', [['BHI', 0], ['BHM', 12], ['WVH', 32], ['TFC', 52], ['SHR', 72], ['MCN', 150], ['AYW', 185]]],
    ['West Midlands Railway', 'Birmingham to Shrewsbury via Cosford', [['BHM', 0], ['WVH', 18], ['COS', 33], ['TFC', 43], ['SHR', 62]]],
    ['West Midlands Railway', 'Cross City line to Redditch', [['BHM', 0], ['UNI', 7], ['RDC', 35]]],
    ['West Midlands Railway', 'Birmingham to Worcester and Hereford', [['BMO', 0], ['WOF', 45], ['GMV', 60], ['HFD', 85]]],
    ['Chiltern Railways', 'Marylebone to Birmingham', [['MYB', 0], ['HWY', 25], ['BIT', 50], ['BAN', 62], ['LMS', 77], ['BMO', 105]]],
    ['Chiltern Railways', 'Marylebone to Oxford', [['MYB', 0], ['HWY', 25], ['BIT', 50], ['OXF', 65]]],
    ['Southern', 'Victoria to Eastbourne', [['VIC', 0], ['CLJ', 7], ['ECR', 17], ['GTW', 32], ['HHE', 45], ['LWS', 63], ['EBN', 86]]],
    ['Southern', 'Brighton to Hastings', [['BTN', 0], ['LWS', 15], ['EBN', 35], ['BEX', 50], ['HGS', 62]]],
    ['Southern', 'Ashford to Brighton via Hastings (Marshlink)', [['AFK', 0], ['HGS', 40], ['BEX', 52], ['EBN', 65], ['LWS', 85], ['BTN', 100]]],
    ['Southern', 'Brighton to Southampton', [['BTN', 0], ['WRH', 20], ['CCH', 50], ['HAV', 63], ['SOU', 105]]],
    ['Southern', 'Victoria to Brighton', [['VIC', 0], ['CLJ', 7], ['ECR', 17], ['GTW', 32], ['HHE', 45], ['BTN', 60]]],
    ['South Western Railway', 'Waterloo to Bournemouth', [['WAT', 0], ['CLJ', 7], ['WOK', 25], ['BSK', 45], ['WIN', 60], ['SOU', 75], ['BMH', 110]]],
    ['South Western Railway', 'Waterloo to Portsmouth', [['WAT', 0], ['CLJ', 7], ['WOK', 25], ['GLD', 35], ['HAV', 80], ['PMH', 95]]],
    ['South Western Railway', 'Waterloo to Exeter', [['WAT', 0], ['CLJ', 7], ['WOK', 25], ['BSK', 45], ['ADV', 65], ['SAL', 85], ['EXD', 200]]],
    ['Southeastern', 'Charing Cross to Ashford via Headcorn', [['CHX', 0], ['LBG', 7], ['SEV', 30], ['TON', 40], ['PDW', 47], ['MRN', 52], ['SPU', 56], ['HCN', 60], ['PLC', 66], ['AFK', 78]]],
    ['Southeastern', 'Charing Cross to Hastings', [['CHX', 0], ['LBG', 7], ['SEV', 30], ['TON', 40], ['TBW', 52], ['HGS', 95]]],
    ['Southeastern', 'High Speed to Ashford', [['STP', 0], ['SFA', 7], ['EBD', 17], ['AFK', 37]]],
    ['Southeastern', 'Ashford to Ramsgate', [['AFK', 0], ['CBW', 18], ['RAM', 42]]],
    ['Southeastern', 'Victoria to Dover', [['VIC', 0], ['BMS', 15], ['CTM', 40], ['FAV', 60], ['CBE', 70], ['DVP', 92]]],
    ['London Northwestern Railway', 'Euston to Birmingham via Northampton', [['EUS', 0], ['MKC', 35], ['NMP', 55], ['RUG', 75], ['COV', 88], ['BHI', 98], ['BHM', 110]]],
    ['Greater Anglia', 'Wickford to Southminster', [['WIC', 0], ['SWF', 8], ['BUC', 22], ['SMN', 28]]],
    ['Greater Anglia', 'Liverpool Street to Braintree', [['LST', 0], ['SRA', 7], ['SNF', 25], ['CHM', 35], ['WTM', 45], ['BTR', 62]]],
    ['Greater Anglia', 'Liverpool Street to Colchester (stopping)', [['LST', 0], ['SRA', 7], ['SNF', 25], ['CHM', 37], ['WTM', 48], ['KEL', 55], ['MKT', 61], ['COL', 68]]],
    ['Greater Anglia', 'Marks Tey to Sudbury', [['MKT', 0], ['SUY', 19]]],
    ['Greater Anglia', 'Colchester to Walton-on-the-Naze', [['COL', 0], ['TLS', 15], ['FRI', 24], ['WON', 28]]],
    ['Greater Anglia', 'Manningtree to Harwich Town', [['MNG', 0], ['HPQ', 13], ['HWC', 20]]],
    ['Greater Anglia', 'Ipswich to Felixstowe', [['IPS', 0], ['FLX', 26]]],
    ['Greater Anglia', 'Norwich to Sheringham', [['NRW', 0], ['NWA', 22], ['CMR', 45], ['SHM', 58]]],
    ['Greater Anglia', 'Liverpool Street to Hertford East', [['LST', 0], ['TOM', 13], ['BXB', 33], ['WAR', 47], ['HFE', 54]]],
    ['ScotRail', 'Glasgow to Aberdeen', [['GLQ', 0], ['STG', 28], ['PTH', 60], ['DEE', 85], ['ABD', 160]]],
    ['ScotRail', 'Edinburgh to Inverness', [['EDB', 0], ['HYM', 4], ['PTH', 75], ['INV', 215]]],
    ['ScotRail', 'Edinburgh to Stirling', [['EDB', 0], ['HYM', 4], ['STG', 50]]],
    ['Northern', 'Newcastle to Middlesbrough via Sunderland', [['NCL', 0], ['SUN', 20], ['HPL', 45], ['MBR', 70]]],
    ['TransPennine Express', 'York to Scarborough', [['YRK', 0], ['SCA', 50]]],
    ['TransPennine Express', 'Manchester Airport to Manchester', [['MIA', 0], ['MAN', 18]]],
    ['Northern', 'Liverpool to Blackpool North', [['LIV', 0], ['WGN', 35], ['PRE', 55], ['KKM', 68], ['BPN', 82]]],
    ['LNER', 'Kings Cross to Hull', [['KGX', 0], ['SVG', 20], ['PBO', 45], ['GRA', 65], ['NNG', 78], ['RET', 92], ['DON', 100], ['SBY', 125], ['HUL', 160]]],
    ['Southeastern', 'Victoria to Ashford via Maidstone East', [['VIC', 0], ['BMS', 15], ['MDE', 58], ['AFK', 88]]],
    ['Elizabeth line', 'Elizabeth line', [['PAD', 0], ['ZFD', 9], ['LST', 12], ['SRA', 20], ['SNF', 45]]],
    /* links between stations: walks and the Tube across London */
    ['Tube', 'Across London', [['KGX', 0], ['LST', 15]]], ['Tube', 'Across London', [['KGX', 0], ['VIC', 18]]],
    ['Tube', 'Across London', [['KGX', 0], ['WAT', 22]]], ['Tube', 'Across London', [['KGX', 0], ['PAD', 22]]],
    ['Tube', 'Across London', [['EUS', 0], ['VIC', 15]]], ['Tube', 'Across London', [['EUS', 0], ['WAT', 15]]],
    ['Tube', 'Across London', [['EUS', 0], ['LST', 20]]], ['Tube', 'Across London', [['EUS', 0], ['LBG', 18]]],
    ['Tube', 'Across London', [['LST', 0], ['VIC', 22]]], ['Tube', 'Across London', [['LST', 0], ['LBG', 15]]],
    ['Tube', 'Across London', [['LST', 0], ['WAT', 20]]], ['Tube', 'Across London', [['WAT', 0], ['LBG', 12]]],
    ['Tube', 'Across London', [['VIC', 0], ['WAT', 15]]], ['Tube', 'Across London', [['VIC', 0], ['PAD', 20]]],
    ['Tube', 'Across London', [['PAD', 0], ['WAT', 20]]], ['Tube', 'Across London', [['MYB', 0], ['PAD', 15]]],
    ['Tube', 'Across London', [['MYB', 0], ['KGX', 15]]], ['Tube', 'Across London', [['FST', 0], ['LBG', 15]]],
    ['Tube', 'Across London', [['CHX', 0], ['VIC', 12]]], ['Tube', 'Across London', [['STP', 0], ['LST', 15]]],
    ['Walk', 'Short walk', [['KGX', 0], ['STP', 6]]], ['Walk', 'Short walk', [['KGX', 0], ['EUS', 12]]],
    ['Walk', 'Short walk', [['LST', 0], ['FST', 10]]], ['Walk', 'Short walk', [['WAT', 0], ['CHX', 10]]],
    ['Walk', 'Short walk', [['SRA', 0], ['SFA', 10]]], ['Walk', 'Short walk', [['LIV', 0], ['LVC', 8]]],
    ['Walk', 'Short walk', [['GLQ', 0], ['GLC', 10]]], ['Walk', 'Short walk', [['BHM', 0], ['BMO', 6]]],
    ['Walk', 'Short walk', [['WGN', 0], ['WGW', 4]]], ['Walk', 'Short walk', [['BPN', 0], ['BPS', 40]]]
  ];

  /* ---------- the shows: arrival stations and the last leg ---------- */
  var SITE = 'https://www.ukairshowguide.co.uk/';
  var SHOWS = {
    cosford: { name: 'RAF Cosford Air Show', page: 'cosfordairshow', train: 'train-to-cosford', dest: [52.6402, -2.3076], pc: 'TF11 8UP', time: '09:00',
      arr: [{ c: 'COS', m: 5, how: 'walk', t: 'Cosford station is under 300 metres from the entrance. It really is a few minutes on foot, so this is the easy one.' }] },
    midlands: { name: 'Midlands Air Festival', page: 'midlandsairfestival', train: 'train-to-midlands', dest: [52.1990, -1.8980], pc: 'B49 5NJ', time: '10:00',
      arr: [{ c: 'RDC', m: 30, how: 'bus', t: 'From Redditch station take the Diamond 247 bus, which stops right by the Ragley Hall main entrance. There is no Sunday service, so on a Sunday I would book a taxi from the station.' }] },
    eastbourne: { name: 'Eastbourne Airshow', page: 'eastbourneairshow', train: 'train-to-eastbourne', dest: [50.7615, 0.2830], time: '10:00',
      arr: [{ c: 'EBN', m: 15, how: 'walk', t: 'From Eastbourne station it is about 10 to 15 minutes on foot to the Western Lawns. If you want a shorter walk, the number 3 bus goes from stop R1 down towards Meads.' }] },
    clacton: { name: 'Clacton Air Show', page: 'clactonairshow', train: 'train-to-clacton', dest: [51.7860, 1.1400], time: '10:00',
      arr: [{ c: 'CLT', m: 15, how: 'walk', t: 'From Clacton-on-Sea station it is about a 15 minute walk down to the seafront and the West Greensward.' },
            { c: 'COL', m: 65, how: 'bus', t: 'If you are coming through Colchester, the Central Connect 74, 74B and 76 buses run into Clacton, or stay on the train to Clacton-on-Sea.' }] },
    wales: { name: 'Wales National Airshow', page: 'walesairshow', train: 'train-to-swansea', dest: [51.6150, -3.9550], time: '10:00',
      arr: [{ c: 'SWA', m: 25, how: 'bus', t: 'From Swansea station the local buses run into town and towards the seafront, and they were free at weekends in 2026. Please read the road closures on the show page first, as stops can move on Airshow weekend.' }] },
    duxford: { name: 'Duxford Air Shows', page: 'duxfordairshows', train: 'train-to-duxford', dest: [52.0950, 0.1320], pc: 'CB22 4QR', time: '09:00',
      arr: [{ c: 'CBG', m: 30, how: 'shuttle', t: 'For the big Air Shows there is a free shuttle bus from Cambridge station, stand 5, taking about 30 minutes. This is the one I would use.' },
            { c: 'WLF', m: 10, how: 'taxi', t: 'Whittlesford Parkway is the nearest station. It is about 30 minutes on foot, or about 5 minutes in a taxi.' }] },
    shuttleworth: { name: 'Shuttleworth Air Shows', page: 'shuttleworthairshows', train: 'train-to-shuttleworth', dest: [52.0880, -0.3180], pc: 'SG18 9DT', time: '09:00',
      arr: [{ c: 'BIW', m: 15, how: 'shuttle', t: 'On show days the Shuttleworth shuttle bus runs from Biggleswade station, £10 return, and you book it with your tickets.' },
            { c: 'BDM', m: 25, how: 'taxi', t: 'Bedford is about 9.5 miles away, roughly 20 minutes by taxi. I would book it before you go.' }] },
    gransden: { name: 'Little Gransden Air & Car Show', page: 'little-gransden-air-and-car-show', train: 'train-to-little-gransden', dest: [52.1660, -0.1540], pc: 'SG19 3BP', time: '10:00',
      arr: [{ c: 'SNO', m: 20, how: 'taxi', t: 'St Neots is about 6 miles from the airfield, around 15 to 20 minutes by taxi. The Whippet 18 runs on weekdays and Saturdays only, so for a Sunday I would book a taxi or share a lift.' }] },
    headcorn: { name: 'Headcorn Airshow', page: 'headcorn-air-show', train: 'train-to-headcorn', dest: [51.1570, 0.6820], time: '10:00',
      arr: [{ c: 'HCN', m: 35, how: 'walk', t: 'Headcorn station is about a mile and a half from the aerodrome, along country lanes. I would think about a taxi for that last stretch, especially with children.' }] },
    southport: { name: 'Southport Air Show', page: 'southport-air-show', train: 'train-to-southport', dest: [53.6510, -3.0100], pc: 'PR8 1RY', time: '10:00',
      arr: [{ c: 'SOP', m: 10, how: 'walk', t: 'From Southport station it is about 10 minutes on foot to the seafront.' }] },
    blackpool: { name: 'Blackpool Air Show', page: 'blackpool-air-show', train: 'train-to-blackpool', dest: [53.8100, -3.0560], pc: 'FY1 4BJ', time: '10:00',
      arr: [{ c: 'BPN', m: 25, how: 'walk', t: 'From Blackpool North it is about 15 minutes to the Tower and a bit further to Central Pier. The trams along the front are handy if you have little legs with you.' },
            { c: 'BPS', m: 20, how: 'walk', t: 'Blackpool South and Pleasure Beach get trains from Preston, hourly on Saturdays and every two hours on Sundays, then it is a walk or tram up the front.' }] },
    ayr: { name: 'International Ayr Show', page: 'international-ayr-show', train: 'train-to-ayr', dest: [55.4630, -4.6340], pc: 'KA7 2UP', time: '10:00',
      arr: [{ c: 'AYR', m: 20, how: 'walk', t: 'From Ayr station it is about 15 to 20 minutes on foot to the Low Green.' }] },
    riat: { name: 'Royal International Air Tattoo', page: 'riat', dest: [51.1520, -1.7470], time: '08:00', soon: true,
      arr: [{ c: 'SAL', m: 30, how: 'taxi', t: 'RIAT moves to MOD Boscombe Down for 2027 and the travel plan isn’t out yet. Salisbury is the nearest big station, so I have planned to there for now. I will add the shuttles and Park and Ride as soon as they are announced.' }] }
  };
  var ORDER = ['riat', 'cosford', 'midlands', 'eastbourne', 'clacton', 'wales', 'duxford', 'shuttleworth', 'gransden', 'headcorn', 'southport', 'blackpool', 'ayr'];
  /* ---------- every major station, by region: [name shown, [station codes]] ---------- */
  var HUBS = [
    ['Big cities', [['London', ['KGX', 'STP', 'EUS', 'PAD', 'LST', 'FST', 'VIC', 'WAT', 'LBG', 'CHX', 'MYB']], ['Birmingham', ['BHM', 'BMO']], ['Manchester', ['MAN']], ['Liverpool', ['LIV']], ['Leeds', ['LDS']], ['Sheffield', ['SHF']], ['Newcastle', ['NCL']], ['Glasgow', ['GLC', 'GLQ']], ['Edinburgh', ['EDB']], ['Bristol', ['BRI']], ['Cardiff', ['CDF']], ['Nottingham', ['NOT']]]],
    ['London and the South East', [['London', ['KGX', 'STP', 'EUS', 'PAD', 'LST', 'FST', 'VIC', 'WAT', 'LBG', 'CHX', 'MYB']], ['Southend', ['SOC', 'SOV']], ['Chelmsford', ['CHM']], ['Brighton', ['BTN']], ['Gatwick Airport', ['GTW']], ['Ashford', ['AFK']], ['Maidstone', ['MDE']], ['Canterbury', ['CBW', 'CBE']], ['Dover', ['DVP']], ['Ramsgate', ['RAM']], ['Hastings', ['HGS']], ['Reading', ['RDG']], ['Oxford', ['OXF']], ['Guildford', ['GLD']], ['Portsmouth', ['PMH']], ['Southampton', ['SOU']], ['Milton Keynes', ['MKC']], ['Luton', ['LTN']]]],
    ['East of England', [['Cambridge', ['CBG']], ['Colchester', ['COL']], ['Ipswich', ['IPS']], ['Norwich', ['NRW']], ['Peterborough', ['PBO']], ['Ely', ['ELY']], ['Kings Lynn', ['KLN']], ['Bury St Edmunds', ['BSE']], ['Lowestoft', ['LWT']], ['Great Yarmouth', ['GYM']], ['Stansted Airport', ['SSD']], ['Bedford', ['BDM']], ['Stevenage', ['SVG']],
      ['Southend Victoria', ['SOV']], ['Southminster', ['SMN']], ['Braintree', ['BTR']], ['Sudbury', ['SUY']], ['Clacton-on-Sea', ['CLT']], ['Walton-on-the-Naze', ['WON']], ['Harwich Town', ['HWC']], ['Felixstowe', ['FLX']], ['Sheringham', ['SHM']], ['Hertford East', ['HFE']]]],
    ['South West', [['Penzance', ['PNZ']], ['Truro', ['TRU']], ['Plymouth', ['PLY']], ['Exeter', ['EXD']], ['Taunton', ['TAU']], ['Bristol', ['BRI']], ['Bath', ['BTH']], ['Swindon', ['SWI']], ['Gloucester', ['GCR']], ['Cheltenham', ['CNM']], ['Salisbury', ['SAL']], ['Bournemouth', ['BMH']]]],
    ['Wales', [['Cardiff', ['CDF']], ['Newport', ['NWP']], ['Swansea', ['SWA']], ['Carmarthen', ['CMN']], ['Aberystwyth', ['AYW']], ['Abergavenny', ['AGV']], ['Wrexham', ['WRX']], ['Llandudno Junction', ['LLJ']], ['Bangor', ['BNG']], ['Holyhead', ['HHD']]]],
    ['Midlands', [['Birmingham', ['BHM', 'BMO']], ['Coventry', ['COV']], ['Wolverhampton', ['WVH']], ['Leicester', ['LEI']], ['Nottingham', ['NOT']], ['Derby', ['DBY']], ['Stoke-on-Trent', ['SOT']], ['Stafford', ['STA']], ['Shrewsbury', ['SHR']], ['Telford', ['TFC']], ['Hereford', ['HFD']], ['Worcester', ['WOF']], ['Northampton', ['NMP']], ['Lincoln', ['LCN']]]],
    ['North West', [['Manchester', ['MAN']], ['Manchester Airport', ['MIA']], ['Liverpool', ['LIV']], ['Preston', ['PRE']], ['Blackpool', ['BPN']], ['Wigan', ['WGN']], ['Bolton', ['BON']], ['Lancaster', ['LAN']], ['Carlisle', ['CAR']], ['Chester', ['CTR']], ['Crewe', ['CRE']], ['Warrington', ['WBQ']]]],
    ['Yorkshire and the North East', [['Leeds', ['LDS']], ['Sheffield', ['SHF']], ['York', ['YRK']], ['Bradford', ['BDI']], ['Huddersfield', ['HUD']], ['Doncaster', ['DON']], ['Hull', ['HUL']], ['Scarborough', ['SCA']], ['Darlington', ['DAR']], ['Middlesbrough', ['MBR']], ['Durham', ['DHM']], ['Newcastle', ['NCL']], ['Sunderland', ['SUN']]]],
    ['Scotland', [['Glasgow', ['GLC', 'GLQ']], ['Edinburgh', ['EDB']], ['Stirling', ['STG']], ['Perth', ['PTH']], ['Dundee', ['DEE']], ['Aberdeen', ['ABD']], ['Inverness', ['INV']], ['Kirkcaldy', ['KDY']], ['Kilmarnock', ['KMK']], ['Dumfries', ['DMF']]]]
  ];

  /* ---------- graph ---------- */
  var ADJ = {}, SERVES = {}; // ADJ['CRS|li'] = [[CRS, li, mins]]
  LINES.forEach(function (L, li) {
    var st = L[2];
    for (var i = 0; i < st.length; i++) {
      (SERVES[st[i][0]] = SERVES[st[i][0]] || []).push(li);
      if (i) {
        var a = st[i - 1][0], b = st[i][0], d = Math.max(2, st[i][1] - st[i - 1][1]);
        (ADJ[a + '|' + li] = ADJ[a + '|' + li] || []).push([b, li, d]);
        (ADJ[b + '|' + li] = ADJ[b + '|' + li] || []).push([a, li, d]);
      }
    }
  });
  var isLink = function (li) { return LINES[li][0] === 'Tube' || LINES[li][0] === 'Walk'; };
  function route(from, to) {
    if (from === to) return { mins: 0, legs: [] };
    var dist = {}, prev = {}, Q = [];
    (SERVES[from] || []).forEach(function (li) { var k = from + '|' + li; dist[k] = 0; Q.push([0, k]); });
    var push = function (it) { Q.push(it); var i = Q.length - 1; while (i) { var j = (i - 1) >> 1; if (Q[j][0] <= Q[i][0]) break; var t = Q[i]; Q[i] = Q[j]; Q[j] = t; i = j; } };
    var pop = function () { var top = Q[0], last = Q.pop(); if (Q.length) { Q[0] = last; var i = 0; for (;;) { var a = 2 * i + 1, b = a + 1, m = i; if (a < Q.length && Q[a][0] < Q[m][0]) m = a; if (b < Q.length && Q[b][0] < Q[m][0]) m = b; if (m === i) break; var t = Q[i]; Q[i] = Q[m]; Q[m] = t; i = m; } } return top; };
    Q.sort(function (x, y) { return x[0] - y[0]; });
    while (Q.length) {
      var cur = pop(), d = cur[0], k = cur[1];
      if (d > dist[k]) continue;
      var p = k.split('|'), s = p[0], li = +p[1];
      if (s === to) {
        var legs = [], kk = k;
        while (kk) { legs.unshift(kk); kk = prev[kk]; }
        var out = [], seg = null;
        legs.forEach(function (x) {
          var q = x.split('|'), c = q[0], l = +q[1];
          if (!seg || seg.li !== l) { if (seg && seg.to !== seg.from) out.push(seg); seg = { li: l, from: c, to: c, stops: 0, mins: 0, t0: dist[x] }; }
          else { seg.to = c; seg.stops++; seg.mins = dist[x] - seg.t0; }
        });
        if (seg && seg.to !== seg.from) out.push(seg);
        return { mins: d, legs: out };
      }
      (ADJ[k] || []).forEach(function (e) {
        var nk = e[0] + '|' + e[1], nd = d + e[2];
        if (dist[nk] === undefined || nd < dist[nk]) { dist[nk] = nd; prev[nk] = k; push([nd, nk]); }
      });
      (SERVES[s] || []).forEach(function (l2) {
        if (l2 === li) return;
        var pen = (isLink(li) || isLink(l2)) ? 2 : 12;
        if (LINES[l2][1] === LINES[li][1] && LINES[l2][0] === LINES[li][0]) pen = 1;
        var nk = s + '|' + l2, nd = d + pen;
        if (dist[nk] === undefined || nd < dist[nk]) { dist[nk] = nd; prev[nk] = k; push([nd, nk]); }
      });
    }
    return null;
  }

  /* ---------- helpers ---------- */
  function miles(a, b, c, d) {
    var R = 3958.8, r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r;
    var h = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(a * r) * Math.cos(c * r) * Math.sin(y / 2) * Math.sin(y / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hm(m) { m = Math.round(m / 5) * 5; var h = Math.floor(m / 60), r = m % 60; return h ? (h + (h === 1 ? ' hour' : ' hours') + (r ? ' ' + r + ' min' : '')) : (r + ' min'); }
  function nearest(lat, lon, n) {
    return Object.keys(STA).map(function (c) { return [c, miles(lat, lon, STA[c][1], STA[c][2])]; })
      .sort(function (a, b) { return a[1] - b[1]; }).slice(0, n);
  }
  function access(mi) { return mi < 1 ? Math.max(5, Math.round(mi * 20)) : Math.round(10 + mi * 2.6); }
  function gmaps(o, d) { return 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(o) + '&destination=' + encodeURIComponent(d) + '&travelmode=transit'; }
  function nrLink(o, d, date, hhmm) {
    var u = 'https://www.nationalrail.co.uk/journey-planner/?type=single&origin=' + o + '&destination=' + d + '&adults=1&extraTime=0';
    if (date && hhmm) {
      var p = date.split('-'); var t = hhmm.split(':');
      u += '&leavingType=departing&leavingDate=' + p[2] + p[1] + p[0].slice(2) + '&leavingHour=' + t[0] + '&leavingMin=' + t[1];
    }
    return u + '#O';
  }
  function live(c) { return 'https://www.nationalrail.co.uk/live-trains/departures/' + c + '/'; }
  function minus(hhmm, m) {
    var t = hhmm.split(':'), x = (+t[0]) * 60 + (+t[1]) - m; if (x < 300) x = 300;
    x = Math.floor(x / 15) * 15; return ('0' + Math.floor(x / 60)).slice(-2) + ':' + ('0' + x % 60).slice(-2);
  }

  /* best train link from a big station (or a group, like all the London terminals) to a show */
  var HUBC = {};
  function hubRoute(codes, show) {
    var key = codes.join(',') + '>' + show; if (HUBC[key] !== undefined) return HUBC[key];
    var S = SHOWS[show], best = null;
    codes.forEach(function (c) {
      S.arr.forEach(function (a) {
        var r = route(c, a.c); if (!r) return;
        var t = r.mins + a.m;
        if (!best || t < best.t) best = { r: r, a: a, t: t, from: c };
      });
    });
    if (best) {
      var tr = best.r.legs.filter(function (l) { return !isLink(l.li); });
      if (tr.length && tr[0].from !== best.from && best.r.legs[0] && isLink(best.r.legs[0].li) && codes.indexOf(tr[0].from) >= 0) {
        best.from = tr[0].from; best.r = { mins: best.r.mins - best.r.legs[0].mins, legs: best.r.legs.slice(1) };
      }
    }
    return (HUBC[key] = best);
  }

  /* best plans from a point to a show */
  function plan(lat, lon, show) {
    var S = SHOWS[show], cands = nearest(lat, lon, 6).filter(function (x) { return x[1] < 70; }), res = [];
    var direct = miles(lat, lon, S.dest[0], S.dest[1]);
    cands.forEach(function (c) {
      S.arr.forEach(function (a) {
        var r = route(c[0], a.c); if (!r) return;
        var acc = access(c[1]);
        res.push({ start: c[0], startMi: c[1], acc: acc, arr: a, rail: r, total: acc + r.mins + a.m });
      });
    });
    res.sort(function (a, b) { return a.total - b.total; });
    var seen = {}, out = [];
    res.forEach(function (r) {
      var key = r.rail.legs.map(function (l) { return LINES[l.li][0] + l.from + l.to; }).join('/') + r.arr.c;
      if (!seen[key] && out.length < 3) { seen[key] = 1; out.push(r); }
    });
    return { plans: out, direct: direct };
  }


  /* ---------- live times: the public National Rail live departure boards, same feed as the train route pages ---------- */
  var LIVE_HOSTS = ['https://huxley2.azurewebsites.net', 'https://national-rail-api.davwheat.dev'];
  var LIVE = {}, LIVEQ = {};
  function liveBoard(from, to, cb) {
    var key = from + '>' + to, L = LIVE[key];
    if (L && Date.now() - L.at < 55000) return cb(L);
    (LIVEQ[key] = LIVEQ[key] || []).push(cb); if (LIVEQ[key].length > 1) return;
    var done = function (r) { r.at = Date.now(); LIVE[key] = r; var q = LIVEQ[key]; LIVEQ[key] = []; q.forEach(function (f) { f(r); }); };
    (function attempt(h) {
      if (h >= LIVE_HOSTS.length || !window.fetch) return done({ ok: false });
      fetch(LIVE_HOSTS[h] + '/departures/' + from + '/to/' + to + '/6').then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (js) { done({ ok: true, js: js }); }).catch(function () { attempt(h + 1); });
    })(0);
  }
  function liveHTML(legs) {
    var trains = legs.filter(function (l) { return !isLink(l.li); });
    return trains.map(function (l, i) {
      var L = LINES[l.li], c = OP[L[0]] || OP.Walk;
      return '<div class="jq-lb2" data-f="' + l.from + '" data-t="' + l.to + '" style="--c:' + c[0] + '"><div class="jq-lbh"><span class="jq-lbn">' + (i + 1) + '</span><div><b>' + esc(STA[l.from][0]) + ' to ' + esc(STA[l.to][0]) + '</b><small>' + esc(L[0]) + (i ? ', your connection' : ', your first train') + '</small></div><span class="jq-pulse"><i></i>Live</span></div><div class="jq-lbb"><p class="jq-lbm">Checking the live board…</p></div>'
        + '<a class="jq-lbl" href="' + live(l.from) + '" target="_blank" rel="noopener">Full live board for ' + esc(STA[l.from][0]) + ' <span aria-hidden="true">↗</span></a></div>';
    }).join('');
  }
  function fillLive(root, after) {
    [].forEach.call(root.querySelectorAll('.jq-lb2'), function (bx) {
      var f = bx.getAttribute('data-f'), t = bx.getAttribute('data-t'), body = bx.querySelector('.jq-lbb');
      liveBoard(f, t, function (r) {
        if (!r.ok) { body.innerHTML = '<p class="jq-lbm">Live times can’t be reached right now. Tap the full live board below, or Times, to see them on National Rail.</p>'; bx.classList.add('jq-off'); return after && after(); }
        var list = (r.js.trainServices || []).slice(0, 4);
        if (!list.length) { body.innerHTML = '<p class="jq-lbm">No trains on the live board just yet. Trains show here a couple of hours before they leave, so early in the morning or late at night it can be empty.</p>'; return after && after(); }
        body.innerHTML = '<table><tbody>' + list.map(function (sv) {
          var e = sv.etd, bad = sv.isCancelled || (e !== 'On time'), st = sv.isCancelled ? 'Cancelled' : e === 'On time' ? 'On time' : e === 'Delayed' ? 'Delayed' : 'Expected ' + e;
          var dest = ((sv.destination || [{}])[0].locationName || '').replace(/\s*\(.*?\)/, '');
          return '<tr><td class="jq-lt">' + esc(sv.std) + '</td><td>' + esc(dest) + '<small>' + esc(sv.operator || '') + '</small></td><td class="jq-lp">' + (sv.platform ? 'Plat ' + esc(sv.platform) : '') + '</td><td class="jq-ls' + (bad ? ' jq-late' : '') + '">' + st + '</td></tr>';
        }).join('') + '</tbody></table>';
        after && after();
      });
    });
  }
  /* ---------- styles ---------- */
  var CSS = '.ukag-jp{--n:#13293C;--t:#32B4AF;--p:#6950A1;--r:#D74949;--g:#F2F4F5;--l:#DCE3E9;--s:#5B6B78;font-family:Barlow,sans-serif;color:var(--n);margin:28px auto;max-width:1200px;box-sizing:border-box;padding:0 20px}'
    + '.ukag-jp *{box-sizing:border-box}.ukag-jp .jp{background:#fff;box-shadow:0 18px 40px -26px rgba(19,41,60,.55)}'
    + '.ukag-jp .jq-jp-h{background:var(--p);color:#fff;padding:22px 26px 20px;display:grid;grid-template-columns:52px 1fr;gap:16px;align-items:center;border-bottom:5px solid #4E3A7E}'
    + '.ukag-jp .jq-jp-h .jq-ic{width:52px;height:52px;border-radius:50%;background:#fff;color:var(--p);display:grid;place-items:center}'
    + '.ukag-jp .jq-jp-h h2{margin:0;font:700 28px/1.05 Barlow,sans-serif;letter-spacing:.01em;text-transform:uppercase}'
    + '.ukag-jp .jq-jp-h p{margin:6px 0 0;color:#E6DFF5;font-size:16px;line-height:1.45;max-width:760px}'
    + '.ukag-jp form{display:grid;grid-template-columns:1.5fr 1.1fr .8fr .7fr auto;gap:14px;padding:20px 26px;background:#fff;align-items:end}'
    + '.ukag-jp form.jq-noshow{grid-template-columns:1.8fr .8fr .7fr auto}'
    + '.ukag-jp form>*{min-width:0}.ukag-jp .jq-inp{min-width:0;width:100%}.ukag-jp input[type=date],.ukag-jp input[type=time]{width:100%}.ukag-jp label{display:block;font-weight:700;font-size:15px;margin:0 0 6px}'
    + '.ukag-jp .jq-inp{display:flex;align-items:center;background:#F3F5F8;border-bottom:2px solid #D3DCE4;transition:background .25s,border-color .25s,box-shadow .25s}'
    + '.ukag-jp .jq-inp:focus-within{background:#fff;border-bottom-color:var(--p);box-shadow:0 6px 18px -12px rgba(105,80,161,.6)}'
    + '.ukag-jp input,.ukag-jp select{flex:1;min-width:0;border:0;background:transparent;font:500 16px Barlow,sans-serif;color:var(--n);padding:12px}'
    + '.ukag-jp input:focus,.ukag-jp select:focus{outline:none}'
    + '.ukag-jp .jq-loc{border:0;background:none;color:var(--p);font:700 14px Barlow,sans-serif;padding:0 12px;cursor:pointer;white-space:nowrap}'
    + '.ukag-jp .jq-go{border:0;background:var(--p);color:#fff;font:700 17px Barlow,sans-serif;padding:13px 22px;cursor:pointer;transition:background .25s,transform .25s}'
    + '.ukag-jp .jq-go:hover{background:#56408A;transform:translateY(-2px)}'
    + '.ukag-jp .jq-msg{padding:0 26px 18px;font-size:15.5px;color:var(--s)}.ukag-jp .jq-msg b{color:var(--r)}'
    + '.ukag-jp .jq-out{padding:0 26px 26px}'
    + '.ukag-jp .jq-tabs{display:flex;gap:0;background:#F1F4F6;border-bottom:3px solid var(--p);margin-top:6px;flex-wrap:wrap}'
    + '.ukag-jp .jq-tabs button{border:1px solid var(--l);border-bottom:0;background:#fff;margin:8px 6px 0 0;padding:10px 16px;border-radius:12px 12px 0 0;font:700 15.5px Barlow,sans-serif;color:var(--n);cursor:pointer;transition:background .25s,color .25s}'
    + '.ukag-jp .jq-tabs button small{display:block;font-weight:500;font-size:13.5px;color:var(--s)}'
    + '.ukag-jp .jq-tabs button[aria-selected="true"]{background:var(--p);color:#fff;border-color:var(--p)}.ukag-jp .jq-tabs button[aria-selected="true"] small{color:#E6DFF5}'
    + '.ukag-jp .jq-sum{display:flex;flex-wrap:wrap;gap:10px 26px;align-items:baseline;background:var(--n);color:#fff;padding:16px 20px;border-top:4px solid var(--t)}'
    + '.ukag-jp .jq-sum b{font:700 30px/1 Barlow,sans-serif}.ukag-jp .jq-sum span{color:#C9D6E0;font-size:15.5px}.ukag-jp .jq-sum i{font-style:normal;color:#fff;font-weight:700}'
    + '.ukag-jp ol{list-style:none;margin:0;padding:18px 0 4px}'
    + '.ukag-jp li{position:relative;display:grid;grid-template-columns:44px 1fr;gap:14px;padding-bottom:16px}'
    + '.ukag-jp li:before{content:"";position:absolute;left:20px;top:40px;bottom:-2px;width:4px;background:var(--c)}'
    + '.ukag-jp li.jq-dash:before{background:repeating-linear-gradient(var(--c) 0 6px,transparent 6px 11px)}.ukag-jp li:last-child:before{display:none}'
    + '.ukag-jp .jq-rd{width:40px;height:40px;border-radius:50%;background:var(--c);color:var(--k,#fff);display:grid;place-items:center;box-shadow:0 0 0 3px #fff inset,0 0 0 2px var(--c);font:700 14px Barlow,sans-serif;position:relative;z-index:1}'
    + '.ukag-jp .jq-bx{padding:10px 14px 12px;border-left:3px solid var(--c);background:linear-gradient(90deg,color-mix(in srgb,var(--c) 10%,#fff),#fff 70%);transition:background .3s}'
    + '.ukag-jp .jq-bx:hover{background:linear-gradient(90deg,color-mix(in srgb,var(--c) 18%,#fff),#fff 80%)}'
    + '.ukag-jp .jq-lb{display:inline-block;font:700 13.5px Barlow,sans-serif;background:var(--c);color:var(--k,#fff);padding:2px 8px;margin-bottom:5px}'
    + '.ukag-jp .jq-bx b{display:block;font-size:17.5px;line-height:1.3}.ukag-jp .jq-bx p{margin:4px 0 0;font-size:15.5px;line-height:1.5;color:#2C3E4C}'
    + '.ukag-jp .jq-chg{display:block;margin-top:6px;font:700 13.5px Barlow,sans-serif;color:var(--p)}'
    + '.ukag-jp .jq-acts{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0 4px}'
    + '.ukag-jp .jq-acts a{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font:700 15.5px Barlow,sans-serif;padding:11px 16px;background:var(--n);color:#fff;border-bottom:3px solid var(--t);transition:transform .25s,background .25s}'
    + '.ukag-jp .jq-acts a:hover{transform:translateY(-2px);background:#1D63B7}.ukag-jp .jq-acts a.jq-alt{background:#fff;color:var(--n);border:1px solid var(--l);border-bottom:3px solid var(--p)}.ukag-jp .jq-acts a.jq-alt:hover{background:#F3F0FA}'
    + '.ukag-jp .jq-note{margin:14px 0 0;padding:12px 16px;border-left:4px solid var(--p);background:#F6F4FB;font-size:15.5px;line-height:1.5}'
    + '.ukag-jp .jq-lines{padding:22px 26px 26px;background:var(--g)}'
    + '.ukag-jp .jq-lines h3{margin:0 0 4px;font:700 24px/1.1 Barlow,sans-serif;text-transform:uppercase;color:var(--r);padding-left:12px;border-left:4px solid var(--r)}'
    + '.ukag-jp .jq-lines>p{margin:6px 0 14px;color:#2C3E4C;font-size:15.5px}'
    + '.ukag-jp .jq-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}'
    + '.ukag-jp .jq-chip{display:inline-flex;align-items:center;gap:8px;background:#fff;padding:7px 12px 7px 8px;font-size:15px;box-shadow:0 4px 12px -8px rgba(19,41,60,.5)}'
    + '.ukag-jp .jq-chip i{width:14px;height:14px;border-radius:50%;background:var(--c);flex:none}'
    + '.ukag-jp table{width:100%;border-collapse:collapse;background:#fff;font-size:15.5px}'
    + '.ukag-jp th{text-align:left;background:var(--n);color:#fff;font-weight:700;padding:10px 12px}'
    + '.ukag-jp td{padding:10px 12px;border-top:1px solid #E5EAEE;vertical-align:top}.ukag-jp td b{font-weight:700}'
    + '.ukag-jp tr:hover td{background:#F6F4FB}.ukag-jp td .jq-dots{display:inline-flex;gap:4px;margin-right:6px;vertical-align:middle}.ukag-jp td .jq-dots i{width:10px;height:10px;border-radius:50%;background:var(--c)}'
    + '.ukag-jp td a{color:var(--p);font-weight:700}'
    + '.ukag-jp .jq-hubbar{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:space-between;border-bottom:3px solid var(--p);margin-bottom:14px}'
    + '.ukag-jp .jq-rg{display:flex;flex-wrap:wrap;gap:6px 6px}'
    + '.ukag-jp .jq-rg button{border:1px solid var(--l);border-bottom:0;background:#fff;padding:9px 14px;border-radius:12px 12px 0 0;font:700 15px Barlow,sans-serif;color:var(--n);cursor:pointer;transition:background .25s,color .25s,box-shadow .25s}'
    + '.ukag-jp .jq-rg button:hover{box-shadow:0 -6px 14px -10px rgba(105,80,161,.9);color:var(--p)}'
    + '.ukag-jp .jq-rg button[aria-selected="true"]{background:var(--p);border-color:var(--p);color:#fff}'
    + '.ukag-jp .jq-hs{flex:0 1 300px;margin-bottom:8px;background:#fff}'
    + '.ukag-jp .jq-hubs{display:grid;gap:8px}'
    + '.ukag-jp .jq-hub{display:grid;grid-template-columns:170px 1fr 150px auto;gap:14px 18px;align-items:center;background:#fff;padding:14px 16px;border-left:5px solid var(--p);box-shadow:0 6px 16px -14px rgba(19,41,60,.7);transition:transform .25s,box-shadow .25s}'
    + '.ukag-jp .jq-hub:hover{transform:translateX(3px);box-shadow:0 10px 22px -14px rgba(19,41,60,.8)}'
    + '.ukag-jp .jq-hn b{display:block;font:700 21px/1.05 Barlow,sans-serif;text-transform:uppercase}.ukag-jp .jq-hub small{display:block;color:var(--s);font-size:14px;margin-top:3px}'
    + '.ukag-jp .jq-legs{display:flex;flex-wrap:wrap;gap:6px 4px;align-items:center}'
    + '.ukag-jp .jq-leg{display:inline-flex;align-items:center;font-size:14.5px;line-height:1.2;background:color-mix(in srgb,var(--c) 9%,#fff);border:1px solid color-mix(in srgb,var(--c) 30%,#fff);padding:0 9px 0 0}'
    + '.ukag-jp .jq-leg i{font-style:normal;font-weight:700;background:var(--c);color:var(--k);padding:4px 8px;margin-right:7px;font-size:13.5px}'
    + '.ukag-jp .jq-leg+.jq-leg:before{content:"›";margin:0 6px 0 -4px;color:var(--s);display:none}'
    + '.ukag-jp .jq-leg.jq-x{--c:#6B7C89;--k:#fff;border-style:dashed}'
    + '.ukag-jp .jq-there{font-weight:700;color:#0E5F5B}'
    + '.ukag-jp .jq-ht b{display:block;font:700 19px/1.1 Barlow,sans-serif;color:var(--n)}'
    + '.ukag-jp .jq-ha{display:flex;gap:8px;align-items:center;justify-content:flex-end}'
    + '.ukag-jp .jq-ha a{color:var(--p);font-weight:700;text-decoration:none;white-space:nowrap}.ukag-jp .jq-ha a:hover{text-decoration:underline}'
    + '.ukag-jp .jq-ha button{border:0;background:var(--n);color:#fff;font:700 14.5px Barlow,sans-serif;padding:9px 13px;cursor:pointer;white-space:nowrap;border-bottom:3px solid var(--t);transition:background .25s,transform .25s}'
    + '.ukag-jp .jq-ha button:hover{background:#1D63B7;transform:translateY(-2px)}'
    + '.ukag-jp .jq-none{background:#fff;padding:16px;margin:0}'
    + '@media(max-width:900px){.ukag-jp .jq-hub{grid-template-columns:1fr auto}.ukag-jp .jq-hc{grid-column:1/-1;grid-row:2}.ukag-jp .jq-ha{grid-column:1/-1;justify-content:flex-start}.ukag-jp .jq-ht{text-align:right}.ukag-jp .jq-hs{flex:1 1 100%}}'
    + '.ukag-jp .jq-lvb{background:#fff!important;color:#1C7A3E!important;border:1px solid #BFE3CB!important;border-bottom:3px solid #22C55E!important;display:inline-flex;align-items:center;gap:7px}'
    + '.ukag-jp .jq-lvb i,.ukag-jp .jq-pulse i{width:9px;height:9px;border-radius:50%;background:#22C55E;animation:jqpulse 1.8s ease-out infinite;flex:none}'
    + '.ukag-jp .jq-lvb[aria-expanded="true"]{background:#0F2E1B!important;color:#7CF0A6!important}'
    + '@keyframes jqpulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}100%{box-shadow:0 0 0 8px rgba(34,197,94,0)}}'
    + '.ukag-jp .jq-lvp{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:10px;padding-top:4px}'
    + '.ukag-jp .jq-lvp[hidden]{display:none}'
    + '.ukag-jp .jq-lb2{background:var(--n);color:#fff;border-top:4px solid var(--c);display:flex;flex-direction:column}'
    + '.ukag-jp .jq-lbh{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.12)}'
    + '.ukag-jp .jq-lbn{width:28px;height:28px;background:var(--c);color:#fff;display:grid;place-items:center;font-weight:700;font-size:14px}'
    + '.ukag-jp .jq-lbh b{display:block;font-size:15.5px;line-height:1.25}.ukag-jp .jq-lbh small{display:block;color:#C9D6E0;font-size:13.5px}'
    + '.ukag-jp .jq-pulse{display:inline-flex;align-items:center;gap:6px;background:#0F2E1B;color:#7CF0A6;border:1px solid #1F7A43;font-weight:700;font-size:12.5px;padding:3px 7px}'
    + '.ukag-jp .jq-off .jq-pulse{background:#2A3742;color:#C9D6E0;border-color:#4A5A66}.ukag-jp .jq-off .jq-pulse i{background:#8A97A2;animation:none}'
    + '.ukag-jp .jq-lbb{padding:4px 12px 6px;flex:1}.ukag-jp .jq-lbb table{background:transparent;font-size:14.5px}'
    + '.ukag-jp .jq-lbb td{border-top:1px solid rgba(255,255,255,.1);padding:7px 6px 7px 0;color:#fff;vertical-align:middle}.ukag-jp .jq-lbb tr:first-child td{border-top:0}.ukag-jp .jq-lbb tr:hover td{background:rgba(255,255,255,.04)}'
    + '.ukag-jp .jq-lbb td small{display:block;color:#9FB2C2;font-size:12.5px}'
    + '.ukag-jp .jq-lt{font:700 17px/1 Barlow,sans-serif;color:#FFC94A;width:52px;font-variant-numeric:tabular-nums}'
    + '.ukag-jp .jq-lp{color:#C9D6E0!important;white-space:nowrap;font-size:13.5px}.ukag-jp .jq-ls{text-align:right;color:#7CF0A6!important;font-weight:700;font-size:13.5px;line-height:1.2}.ukag-jp .jq-ls.jq-late{color:#FF8A8A!important}'
    + '.ukag-jp .jq-lbm{margin:8px 0;color:#C9D6E0;font-size:14.5px;line-height:1.45}'
    + '.ukag-jp .jq-lbl{display:block;padding:9px 12px;color:#7FD9D5!important;font-weight:700;font-size:14px;text-decoration:none;border-top:1px solid rgba(255,255,255,.12)}.ukag-jp .jq-lbl:hover{color:#fff!important;background:rgba(255,255,255,.05)}'
    + '.ukag-jp .jq-lvc{margin:6px 0 14px;display:flex;flex-wrap:wrap;gap:10px}.ukag-jp .jq-lvc .jq-lb2{flex:1 1 320px;min-width:0}'
    + '.ukag-jp .jq-lvc h4{flex:1 1 100%;margin:6px 0 0;display:flex;align-items:center;gap:10px;font:700 21px/1.1 Barlow,sans-serif;text-transform:uppercase;color:var(--n)}'
    + '.ukag-jp .jq-lvc>p{flex:1 1 100%;margin:0 0 4px;font-size:15px;color:#2C3E4C}'
    + '@media(max-width:560px){.ukag-jp .jq-ha{flex-wrap:wrap}.ukag-jp .jq-lp{display:none}}'
    + '@media(max-width:900px){.ukag-jp form,.ukag-jp form.jq-noshow{grid-template-columns:1fr 1fr}.ukag-jp .jq-f-from{grid-column:1/-1}.ukag-jp .jq-go{grid-column:1/-1}}'
    + '@media(max-width:560px){.ukag-jp{padding:0 12px}.ukag-jp form,.ukag-jp form.jq-noshow{grid-template-columns:1fr}.ukag-jp .jq-acts a{width:100%;justify-content:space-between}.ukag-jp .jq-jp-h{grid-template-columns:40px 1fr;padding:18px}.ukag-jp .jq-jp-h .jq-ic{width:40px;height:40px}.ukag-jp .jq-jp-h h2{font-size:23px}.ukag-jp form,.ukag-jp .jq-out,.ukag-jp .jq-lines{padding-left:16px;padding-right:16px}.ukag-jp .jq-msg{padding:0 16px 16px}.ukag-jp table .jq-hm{display:none}}'
    + '@media(prefers-reduced-motion:reduce){.ukag-jp *{transition:none!important;animation:none!important}}';

  var ICON = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><circle cx="6" cy="6" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="18" r="2.5" fill="#D74949"/><path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/></svg>';
  var SYM = { train: '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="3" width="12" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 10h12M9 20l-2 2M15 20l2 2M9 13h.01M15 13h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    walk: '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="13" cy="4" r="2" fill="currentColor"/><path d="M10 21l2-6 3 3v3M12 15l-1-5 4 2 2 3M11 10l-3 2-1 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bus: '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="4" y="3" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 11h16M8 21v-4M16 21v-4" stroke="currentColor" stroke-width="2"/></svg>',
    plane: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M21 15v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8l-8 5v2l8-2.5V18l-2 1.5V21l3.5-1 3.5 1v-1.5L13 18v-5.5z" fill="currentColor"/></svg>' };

  /* ---------- render ---------- */
  function mount(el) {
    var fixed = el.getAttribute('data-show'); if (fixed === 'pick') fixed = '';
    if (fixed && !SHOWS[fixed]) return;
    var st = { show: fixed || ORDER[1], o: null, plans: null, sel: 0 };
    try { var sv = JSON.parse(localStorage.getItem('ukagJP') || 'null'); if (sv) { st.saved = sv; } } catch (e) {}
    var today = new Date(); var iso = today.toISOString().slice(0, 10);
    var opts = ORDER.map(function (k) { return '<option value="' + k + '">' + esc(SHOWS[k].name) + '</option>'; }).join('');
    el.innerHTML = '<div class="jp">'
      + '<div class="jq-jp-h"><span class="jq-ic">' + ICON + '</span><div><h2>Plan from your door</h2><p>' + (fixed
        ? 'Type your town or postcode and I will show you the trains, where to change and the last bit to ' + esc(SHOWS[fixed].name) + '. Then you can check the exact times and tickets in one tap.'
        : 'Wherever you live in the UK, type your town or postcode, pick your show and I will show you the trains, where to change and the last bit to the showground.') + '</p></div></div>'
      + '<form class="' + (fixed ? 'jq-noshow' : '') + '" onsubmit="return false">'
      + '<div class="jq-f-from"><label for="jpF' + uid + '">Starting from</label><div class="jq-inp"><input id="jpF' + uid + '" type="search" placeholder="Town or postcode, for example Canvey Island" autocomplete="postal-code"><button type="button" class="jq-loc">Use my location</button></div></div>'
      + (fixed ? '' : '<div><label for="jpS' + uid + '">Going to</label><div class="jq-inp"><select id="jpS' + uid + '">' + opts + '</select></div></div>')
      + '<div><label for="jpD' + uid + '">Date</label><div class="jq-inp"><input id="jpD' + uid + '" type="date" min="' + iso + '"></div></div>'
      + '<div><label for="jpT' + uid + '">Arrive by</label><div class="jq-inp"><input id="jpT' + uid + '" type="time" value="' + SHOWS[st.show].time + '"></div></div>'
      + '<button type="submit" class="jq-go">Plan my journey <span aria-hidden="true">→</span></button></form>'
      + '<div class="jq-msg" aria-live="polite"></div><div class="jq-out" aria-live="polite"></div>'
      + '<div class="jq-lines"></div></div>';
    var q = function (s) { return el.querySelector(s); };
    var fF = q('#jpF' + uid), fS = q('#jpS' + uid), fD = q('#jpD' + uid), fT = q('#jpT' + uid), msg = q('.jq-msg'), out = q('.jq-out'), lines = q('.jq-lines');
    uid++;
    if (fS) fS.value = st.show;
    if (st.saved && st.saved.q) fF.value = st.saved.q;
    var sync = el.getAttribute('data-sync') && document.getElementById(el.getAttribute('data-sync'));
    function setShow(k) { if (!SHOWS[k]) return; st.show = k; if (fS) fS.value = k; fT.value = SHOWS[k].time; drawLines(); if (st.o) go(true); else out.innerHTML = ''; }
    if (fS) fS.addEventListener('change', function () { setShow(fS.value); });
    if (sync && !fixed) { if (SHOWS[sync.value]) setShow(sync.value); sync.addEventListener('change', function () { setShow(sync.value); }); }

    function say(h) { msg.innerHTML = h; resize(); }
    function find(text) {
      text = (text || '').trim(); if (!text) return Promise.reject('empty');
      var pc = text.replace(/\s+/g, '').toUpperCase();
      if (/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(pc)) {
        return fetch('https://api.postcodes.io/postcodes/' + pc).then(function (r) { return r.json(); }).then(function (j) {
          if (!j.result) throw 'nf'; return { lat: j.result.latitude, lon: j.result.longitude, label: j.result.postcode + (j.result.admin_district ? ', ' + j.result.admin_district : '') };
        });
      }
      if (/^[A-Z]{1,2}\d[A-Z\d]?$/.test(pc)) {
        return fetch('https://api.postcodes.io/outcodes/' + pc).then(function (r) { return r.json(); }).then(function (j) {
          if (!j.result) throw 'nf'; return { lat: j.result.latitude, lon: j.result.longitude, label: j.result.outcode };
        });
      }
      var low = text.toLowerCase(), hit = Object.keys(STA).filter(function (c) { return STA[c][0].toLowerCase() === low || STA[c][0].toLowerCase().replace(/^london /, '') === low; })[0];
      return fetch('https://api.postcodes.io/places?limit=10&q=' + encodeURIComponent(text)).then(function (r) { return r.json(); }).then(function (j) {
        var r = (j.result || []).filter(function (p) { return /City|Town|Village|Hamlet|Suburban|Other Settlement/.test(p.local_type || ''); });
        r.sort(function (a, b) { var ea = a.name_1.toLowerCase() === low ? 0 : 1, eb = b.name_1.toLowerCase() === low ? 0 : 1; if (ea !== eb) return ea - eb; var w = { City: 0, Town: 1, Village: 2 }; return (w[a.local_type] == null ? 3 : w[a.local_type]) - (w[b.local_type] == null ? 3 : w[b.local_type]); });
        if (!r.length) { if (hit) return { lat: STA[hit][1], lon: STA[hit][2], label: STA[hit][0] }; throw 'nf'; }
        var p = r[0]; return { lat: p.latitude, lon: p.longitude, label: p.name_1 + (p.county_unitary ? ', ' + p.county_unitary : (p.region ? ', ' + p.region : '')) };
      }, function () { if (hit) return { lat: STA[hit][1], lon: STA[hit][2], label: STA[hit][0] }; throw 'net'; });
    }
    function go(keep) {
      var text = fF.value;
      if (keep && st.o) return draw();
      say('Finding ' + esc(text) + '…');
      find(text).then(function (o) {
        st.o = o; st.o.q = text; st.sel = 0;
        try { localStorage.setItem('ukagJP', JSON.stringify({ q: text })); } catch (e) {}
        say(''); draw();
      }, function (e) {
        say(e === 'empty' ? '<b>Please type a town or postcode first.</b>'
          : e === 'net' ? '<b>I couldn’t look that up just now.</b> Try typing the name of your nearest train station instead, for example Colchester.'
          : '<b>I couldn’t find that one.</b> Try a full postcode, or the name of your town or nearest station.');
      });
    }
    function draw() {
      var S = SHOWS[st.show], o = st.o, P = plan(o.lat, o.lon, st.show);
      if (!P.plans.length) { out.innerHTML = '<p class="jq-note">I couldn’t find a train route from there. The show page has buses, coaches and parking that may suit you better.</p>'; return resize(); }
      var h = '';
      if (P.direct < 8) h += '<p class="jq-note">You are only about ' + Math.max(1, Math.round(P.direct)) + ' miles from the showground, so the local buses, Park and Ride or a taxi on the show page may well be easier than the train. I have still put the train option below.</p>';
      if (P.plans.length > 1) h += '<div class="jq-tabs" role="tablist">' + P.plans.map(function (p, i) {
        var ch = p.rail.legs.filter(function (l) { return !isLink(l.li); }).length - 1;
        return '<button type="button" role="tab" data-i="' + i + '" aria-selected="' + (i === st.sel) + '">Option ' + (i + 1) + '<small>About ' + hm(p.total) + ', ' + (ch < 1 ? 'no changes' : ch + (ch === 1 ? ' change' : ' changes')) + '</small></button>';
      }).join('') + '</div>';
      h += card(P.plans[st.sel] || P.plans[0], S, o);
      out.innerHTML = h;
      [].forEach.call(out.querySelectorAll('.jq-tabs button'), function (b) { b.addEventListener('click', function () { st.sel = +b.getAttribute('data-i'); draw(); }); });
      var lvc = out.querySelector('.jq-lvc');
      if (lvc) { fillLive(lvc, resize); clearInterval(st.lt); st.lt = setInterval(function () { if (!document.body.contains(lvc)) return clearInterval(st.lt); fillLive(lvc, resize); }, 60000); }
      resize();
    }
    function card(p, S, o) {
      var trains = p.rail.legs.filter(function (l) { return !isLink(l.li); });
      var ops = []; trains.forEach(function (l) { if (ops.indexOf(LINES[l.li][0]) < 0) ops.push(LINES[l.li][0]); });
      var ch = Math.max(0, trains.length - 1), sn = STA[p.start][0], an = STA[p.arr.c][0];
      var tt = fT.value ? fT.value.split(':') : null, early = tt && ((+tt[0]) * 60 + (+tt[1]) - p.total - 15) < 330;
      var dep = fD.value && fT.value && !early ? minus(fT.value, p.total + 15) : '';
      var h = '<div class="jq-sum"><b>About ' + hm(p.total) + '</b><span>door to show, ' + (ch ? '<i>' + ch + (ch === 1 ? ' change' : ' changes') + '</i>' : '<i>no changes</i>') + ' on the train</span><span>' + esc(ops.join(', ')) + '</span>' + (dep ? '<span>Leave home by about <i>' + dep + '</i></span>' : '') + '</div><ol>';
      var accTxt = p.startMi < 1 ? 'About ' + p.acc + ' minutes on foot from ' + esc(o.label) + '.' : 'About ' + Math.round(p.startMi) + ' miles from ' + esc(o.label) + '. A local bus, a lift or a short drive will get you there, and Google Maps will show you the best way from your front door.';
      h += step('#6B7C89', '#fff', SYM.home, 'Start', 'Get to ' + esc(sn) + ' station', accTxt, true);
      p.rail.legs.forEach(function (l, i) {
        var L = LINES[l.li], c = OP[L[0]] || OP.Walk;
        if (isLink(l.li)) {
          h += step(c[0], c[1], L[0] === 'Walk' ? SYM.walk : 'U', L[0] === 'Walk' ? 'Walk' : 'Across London', (L[0] === 'Walk' ? 'Walk to ' : 'Tube to ') + esc(STA[l.to][0]), L[0] === 'Walk' ? 'About ' + l.mins + ' minutes between the stations.' : 'Allow about ' + l.mins + ' minutes on the Underground. I would give yourself a little extra here, as it gets busy with bags.', L[0] === 'Walk');
          return;
        }
        var next = p.rail.legs[i + 1];
        h += step(c[0], c[1], SYM.train, L[0], esc(STA[l.from][0]) + ' to ' + esc(STA[l.to][0]),
          'About ' + hm(l.mins) + (l.stops > 1 ? ', ' + l.stops + ' stops' : '') + '. Look for trains on the ' + esc(L[1]) + ' route.' + (next ? '<span class="jq-chg">' + (isLink(next.li) ? 'Get off here' : 'Change here at ' + esc(STA[l.to][0])) + '</span>' : ''), false);
      });
      var last = { walk: ['#6B7C89', SYM.walk, 'Walk'], bus: ['#00A6E2', SYM.bus, 'Bus'], shuttle: ['#32B4AF', SYM.bus, 'Shuttle'], taxi: ['#13293C', SYM.bus, 'Taxi'] }[p.arr.how];
      h += step(last[0], '#fff', last[1], last[2], esc(an) + ' to the showground', esc(p.arr.t), p.arr.how === 'walk');
      h += step('#D74949', '#fff', SYM.plane, 'Arrive', esc(S.name), 'Try to arrive about an hour before the flying starts if you want a good spot on the crowd line. Visit the toilet before the displays begin, as the queues build quickly.', false);
      if (early) h += '</ol><p class="jq-note">This is a long journey to get there for ' + esc(fT.value) + '. I would think about travelling the day before and staying nearby, as the first trains of the day may not get you there in time. The show page has places to stay.</p><ol style="display:none">';
      h += '</ol><div class="jq-lvc"><h4><span class="jq-pulse"><i></i>Live</span>Live times for your trains today</h4><p>These come straight from the National Rail live boards and update every minute. They show today’s trains, so on show day open this page on the morning you travel.</p>' + liveHTML(p.rail.legs) + '</div><div class="jq-acts">'
        + '<a href="' + nrLink(p.start, p.arr.c, fD.value, dep) + '" target="_blank" rel="noopener">Exact times and tickets <span aria-hidden="true">↗</span></a>'
        + '<a class="jq-alt" href="' + gmaps(o.q || o.label, sn + ' station') + '" target="_blank" rel="noopener">From my door to ' + esc(sn) + ' <span aria-hidden="true">↗</span></a>'
        + '<a class="jq-alt" href="' + live(p.start) + '" target="_blank" rel="noopener">Live departures, ' + esc(sn) + ' <span aria-hidden="true">↗</span></a>'
        + (S.train ? '<a class="jq-alt" href="' + SITE + S.train + '" target="_top">Train route page for this show <span aria-hidden="true">→</span></a>' : '')
        + '<a class="jq-alt" href="' + SITE + S.page + '" target="_top">Full show guide <span aria-hidden="true">→</span></a></div>'
        + '<p class="jq-note">' + (S.soon ? '<b>Please hold off booking for RIAT</b> until the new travel plan is out. ' : '')
        + 'These are typical journey times, not a timetable, so I would always check the exact trains on National Rail before you book. Weekend engineering works can add a bus replacement, and summer 2027 timetables come out in the spring. Check your last train home before you set off, and take a screenshot of it.</p>';
      return h;
    }
    function step(c, k, sym, label, title, text, dash) {
      return '<li' + (dash ? ' class="jq-dash"' : '') + ' style="--c:' + c + ';--k:' + k + '"><span class="jq-rd">' + sym + '</span><div class="jq-bx"><span class="jq-lb">' + esc(label) + '</span><b>' + title + '</b><p>' + text + '</p></div></li>';
    }
    function drawLines() {
      var S = SHOWS[st.show], seen = {}, chips = '';
      S.arr.forEach(function (a) {
        (SERVES[a.c] || []).forEach(function (li) {
          var L = LINES[li]; if (isLink(li)) return; var key = L[0] + L[1]; if (seen[key]) return; seen[key] = 1;
          var c = OP[L[0]]; chips += '<span class="jq-chip" style="--c:' + c[0] + '"><i></i><span><b>' + esc(L[0]) + '</b>, ' + esc(L[1]) + ' (calls at ' + esc(STA[a.c][0]) + ')</span></span>';
        });
      });
      var reg = st.rg || 0, hubTxt = st.hq || '';
      lines.innerHTML = '<h3>Trains from every major station</h3><p>Find your nearest big station below and I will show you how it links up with ' + esc(S.name) + ', which train companies you need and where to change. The time is the train part only, to ' + esc(S.arr.map(function (a) { return STA[a.c][0]; }).join(' or ')) + ', before the last leg to the showground.</p>'
        + '<div class="jq-chips">' + chips + '</div>'
        + '<div class="jq-hubbar"><div class="jq-rg" role="tablist" aria-label="Choose a region">' + HUBS.map(function (R, i) { return '<button type="button" role="tab" data-r="' + i + '" aria-selected="' + (i === reg && !hubTxt) + '">' + esc(R[0]) + '</button>'; }).join('') + '</div>'
        + '<div class="jq-inp jq-hs"><input type="search" aria-label="Find your station" placeholder="Find your station, for example Truro" value="' + esc(hubTxt) + '"></div></div>'
        + '<div class="jq-hubs" aria-live="polite"></div>'
        + '<p class="jq-note">These are typical journey times with sensible changes. Some routes have quicker or slower trains at different times of day, and on Sundays the first trains run later, so I would always tap Times to check the real trains before you book.' + (S.soon ? ' <b>Please hold off booking for RIAT</b> until the Boscombe Down travel plan is out.' : '') + '</p>';
      var box = lines.querySelector('.jq-hubs'), hs = lines.querySelector('.jq-hs input');
      function hubRow(H) {
        var b = hubRoute(H[1], st.show);
        if (!b) return '';
        var legs = b.r.legs, html = '', tr = legs.filter(function (l) { return !isLink(l.li); }), ch = Math.max(0, tr.length - 1), chg = [];
        if (!legs.length) html = '<span class="jq-there">You are already there, this is the station for the show</span>';
        for (var i = 0; i < legs.length; i++) {
          var l = legs[i], L = LINES[l.li];
          if (isLink(l.li)) {
            var to = l.to; while (legs[i + 1] && isLink(legs[i + 1].li)) { i++; to = legs[i].to; }
            html += '<span class="jq-leg jq-x"><i>' + (L[0] === 'Walk' ? 'Walk' : 'Tube') + '</i>to ' + esc(STA[to][0]) + '</span>';
            continue;
          }
          var c = OP[L[0]] || OP.Walk;
          html += '<span class="jq-leg" style="--c:' + c[0] + ';--k:' + c[1] + '"><i>' + esc(L[0]) + '</i>to ' + esc(STA[l.to][0]) + '</span>';
          if (tr.indexOf(l) < tr.length - 1) chg.push(STA[l.to][0]);
        }
        return '<div class="jq-hub"><div class="jq-hn"><b>' + esc(H[0]) + '</b><small>From ' + esc(STA[b.from][0]) + '</small></div>'
          + '<div class="jq-hc"><div class="jq-legs">' + html + '</div>' + (chg.length ? '<small>Change at ' + esc(chg.join(', then ')) + '</small>' : (legs.length ? '<small>A direct train, no changes</small>' : '')) + '</div>'
          + '<div class="jq-ht"><b>' + (legs.length ? 'About ' + hm(b.r.mins) : 'No train needed') + '</b><small>' + (legs.length ? (ch ? ch + (ch === 1 ? ' change' : ' changes') : 'No changes') : esc(STA[b.a.c][0])) + '</small></div>'
          + '<div class="jq-ha">' + (legs.length ? '<button type="button" class="jq-lvb" aria-expanded="false"><i></i>Live times</button><a href="' + nrLink(b.from, b.a.c) + '" target="_blank" rel="noopener">Times <span aria-hidden="true">↗</span></a>' : '') + '<button type="button" data-st="' + esc(STA[b.from][0]) + '">Plan from here</button></div>'
          + (legs.length ? '<div class="jq-lvp" hidden>' + liveHTML(legs) + '</div>' : '') + '</div>';
      }
      function drawHubs() {
        var t = (hs.value || '').trim().toLowerCase(), list = [];
        if (t) {
          var seen2 = {};
          HUBS.forEach(function (R) { R[1].forEach(function (H) { if (seen2[H[0]]) return; var m = H[0].toLowerCase().indexOf(t) >= 0 || H[1].some(function (c) { return STA[c][0].toLowerCase().indexOf(t) >= 0; }); if (m) { seen2[H[0]] = 1; list.push(H); } }); });
        } else list = HUBS[reg][1];
        var h = list.map(hubRow).join('');
        box.innerHTML = h || '<p class="jq-none">I haven’t got that station on the board yet. Type your town or postcode into the planner above and it will find your nearest big station for you.</p>';
        [].forEach.call(box.querySelectorAll('.jq-lvb'), function (bt) {
          bt.addEventListener('click', function () {
            var pn = bt.closest('.jq-hub').querySelector('.jq-lvp'), open = pn.hidden;
            pn.hidden = !open; bt.setAttribute('aria-expanded', open);
            if (open) { fillLive(pn, resize); clearInterval(pn._t); pn._t = setInterval(function () { if (pn.hidden || !document.body.contains(pn)) return clearInterval(pn._t); fillLive(pn, resize); }, 60000); }
            resize();
          });
        });
        [].forEach.call(box.querySelectorAll('button[data-st]'), function (bt) {
          bt.addEventListener('click', function () {
            fF.value = bt.getAttribute('data-st'); st.sel = 0; go(false);
            try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { el.scrollIntoView(); }
          });
        });
        resize();
      }
      [].forEach.call(lines.querySelectorAll('.jq-rg button'), function (bt) {
        bt.addEventListener('click', function () {
          reg = st.rg = +bt.getAttribute('data-r'); hs.value = st.hq = '';
          [].forEach.call(lines.querySelectorAll('.jq-rg button'), function (x) { x.setAttribute('aria-selected', x === bt); });
          drawHubs();
        });
      });
      hs.addEventListener('input', function () {
        st.hq = hs.value;
        [].forEach.call(lines.querySelectorAll('.jq-rg button'), function (x) { x.setAttribute('aria-selected', !hs.value.trim() && +x.getAttribute('data-r') === reg); });
        drawHubs();
      });
      drawHubs();
      resize();
    }
    q('form').addEventListener('submit', function () { go(false); });
    q('.jq-loc').addEventListener('click', function () {
      if (!navigator.geolocation) return say('<b>Your browser can’t share your location here.</b> Please type your town or postcode instead.');
      say('Finding where you are…');
      navigator.geolocation.getCurrentPosition(function (p) {
        var la = p.coords.latitude, lo = p.coords.longitude;
        fetch('https://api.postcodes.io/postcodes?lat=' + la + '&lon=' + lo + '&limit=1').then(function (r) { return r.json(); }).then(function (j) {
          var lab = j.result && j.result[0] ? j.result[0].postcode : 'your location'; fF.value = lab;
          st.o = { lat: la, lon: lo, label: lab, q: la + ',' + lo }; say(''); draw();
        }, function () { st.o = { lat: la, lon: lo, label: 'your location', q: la + ',' + lo }; say(''); draw(); });
      }, function () { say('<b>I couldn’t get your location.</b> Inside the website box your phone may not allow it, so please type your town or postcode instead.'); }, { timeout: 10000 });
    });
    fD.addEventListener('change', function () { if (st.o) draw(); });
    fT.addEventListener('change', function () { if (st.o) draw(); });
    drawLines();
    if (st.saved && st.saved.q && fixed) go(false);
  }
  var uid = 0;
  function resize() { try { window.dispatchEvent(new Event('resize')); if (window.parent !== window) window.parent.postMessage({ type: 'ukag-height', h: document.documentElement.scrollHeight }, '*'); } catch (e) {} }
  function init() {
    if (!document.getElementById('ukag-jp-css')) { var s = document.createElement('style'); s.id = 'ukag-jp-css'; s.textContent = CSS; document.head.appendChild(s); }
    [].forEach.call(document.querySelectorAll('.ukag-jp:not([data-on])'), function (el) { el.setAttribute('data-on', '1'); mount(el); });
  }
  window.UKAG_JP = { init: init, route: route, plan: plan, hubRoute: hubRoute, HUBS: HUBS, STA: STA, LINES: LINES, SHOWS: SHOWS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  /* the Wix page element can add the guide after this script has run, so watch for new boxes too */
  try {
    var mo = new MutationObserver(function () { if (document.querySelector('.ukag-jp:not([data-on])')) init(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 120000);
  } catch (e) {}
})();
