/* Train and bus times for the feature show pages (camping-layout/<show>.html).
   Each page's "Getting there" topics call UKAG_TT.render(show, topicId) and show the tables here
   inside that topic. Edit only the data below: one entry per show, keyed by the page's topic id,
   each a list of tables {title, rows:[[time, service, details]], note, source:[name, url]}.
   "checked" is the date the times were last checked. Text rules: no dashes, 24 hour times.
   The weekly "Feature page checker" scheduled task keeps this file up to date. */
(function(){
var DATA = {
 "riat": {
  "checked": "2026-10-29",
  "rail": [
   {
    "title": "Getting there on Saturday and Sunday",
    "rows": [
     [
      "Saturday",
      "London Paddington 07:00, at Swindon 07:54",
      "GWR, about 55 minutes"
     ],
     [
      "Saturday",
      "London Paddington 08:00, at Swindon 08:54",
      "GWR, then every 15 to 30 minutes"
     ],
     [
      "Saturday",
      "Bristol Temple Meads 07:30, at Swindon 08:08",
      "GWR, about 40 minutes"
     ],
     [
      "Saturday",
      "Bristol Temple Meads 08:30, at Swindon 09:08",
      "GWR, then about every 30 minutes"
     ],
     [
      "Sunday",
      "London Paddington 07:59, at Swindon 08:55",
      "GWR, first fast train of the day"
     ],
     [
      "Sunday",
      "London Paddington 08:33, at Swindon 09:29",
      "GWR"
     ],
     [
      "Sunday",
      "London Paddington 09:35, at Swindon 10:28",
      "GWR"
     ],
     [
      "Sunday",
      "Bristol Temple Meads 07:45, at Swindon 08:23",
      "GWR"
     ],
     [
      "Sunday",
      "Bristol Temple Meads 09:00, at Swindon 09:38",
      "GWR"
     ],
     [
      "Shuttle",
      "Swindon Bus Interchange, Stop N",
      "Every 20 minutes from 06:45 until 12:00, about 30 minutes"
     ]
    ],
    "note": "From the GWR timetable valid 17 May to 12 December 2026. The July 2027 show falls in the May 2027 timetable, so check again nearer the time. Sunday trains start later than Saturday ones.",
    "source": [
     "GWR timetable BL, London Paddington, Swindon and Bristol",
     "https://www.gwr.com/-/media/gwr-sc-website/files/timetables/may-26-december-26/BL-train-times-17-May-to-12-December-2026-v3.pdf"
    ]
   },
   {
    "title": "Trains home on Saturday",
    "rows": [
     [
      "Shuttle",
      "Back to Swindon from 14:00",
      "Every 20 minutes, last shuttle 19:30, about 30 minutes"
     ],
     [
      "18:40",
      "Swindon to London Paddington",
      "GWR, arrives 19:35"
     ],
     [
      "19:41",
      "Swindon to London Paddington",
      "GWR, arrives 20:35"
     ],
     [
      "20:10",
      "Swindon to London Paddington",
      "GWR, arrives 21:08"
     ],
     [
      "Then",
      "About every 20 to 30 minutes",
      "Last train to London 23:15, arrives 00:24"
     ],
     [
      "19:41",
      "Swindon to Bristol Temple Meads",
      "GWR, arrives 20:27"
     ],
     [
      "20:22",
      "Swindon to Bristol Temple Meads",
      "GWR, arrives 21:02"
     ],
     [
      "Then",
      "About every 30 minutes",
      "Last train to Bristol Temple Meads 23:26, arrives 00:03"
     ]
    ],
    "note": "From the GWR timetable valid 17 May to 12 December 2026. Shuttle times may be from an earlier year. Allow plenty of time for the shuttle queue.",
    "source": [
     "GWR timetable BL, London Paddington, Swindon and Bristol",
     "https://www.gwr.com/-/media/gwr-sc-website/files/timetables/may-26-december-26/BL-train-times-17-May-to-12-December-2026-v3.pdf"
    ]
   },
   {
    "title": "Trains home on Sunday",
    "rows": [
     [
      "19:19",
      "Swindon to London Paddington",
      "GWR, arrives 20:09"
     ],
     [
      "19:50",
      "Swindon to London Paddington",
      "GWR, arrives 20:51"
     ],
     [
      "20:10",
      "Swindon to London Paddington",
      "GWR, arrives 21:09"
     ],
     [
      "21:19",
      "Swindon to London Paddington",
      "GWR, arrives 22:14"
     ],
     [
      "Then",
      "About every 30 to 60 minutes",
      "Last train to London 23:08, arrives 00:15"
     ],
     [
      "20:25",
      "Swindon to Bristol Temple Meads",
      "GWR, arrives 21:02"
     ],
     [
      "21:22",
      "Swindon to Bristol Temple Meads",
      "GWR, arrives 21:58"
     ],
     [
      "Then",
      "About every 30 to 60 minutes",
      "Last train to Bristol Temple Meads 23:10, arrives 23:47"
     ]
    ],
    "note": "From the GWR timetable valid 17 May to 12 December 2026. Sunday is the usual day for engineering work, so check before you travel.",
    "source": [
     "GWR timetable BL, London Paddington, Swindon and Bristol",
     "https://www.gwr.com/-/media/gwr-sc-website/files/timetables/may-26-december-26/BL-train-times-17-May-to-12-December-2026-v3.pdf"
    ]
   }
  ]
 },
 "cosford": {
  "checked": "2026-10-29",
  "rail": [
   {
    "title": "Getting there on show day",
    "rows": [
     [
      "08:25",
      "Birmingham New Street to Cosford",
      "West Midlands Railway, at Cosford 09:02"
     ],
     [
      "08:56",
      "Birmingham New Street to Cosford",
      "West Midlands Railway, at Cosford 09:30"
     ],
     [
      "09:56",
      "Birmingham New Street to Cosford",
      "West Midlands Railway, at Cosford 10:32"
     ],
     [
      "10:23",
      "Wolverhampton to Cosford",
      "West Midlands Railway extra, at Cosford 10:41"
     ],
     [
      "10:22",
      "Birmingham New Street to Cosford",
      "Transport for Wales, at Cosford 10:52"
     ],
     [
      "08:40",
      "Shrewsbury to Cosford",
      "West Midlands Railway, at Cosford 09:12"
     ],
     [
      "09:17",
      "Shrewsbury to Cosford",
      "Transport for Wales, at Cosford 09:46"
     ],
     [
      "09:40",
      "Shrewsbury to Cosford",
      "West Midlands Railway, at Cosford 10:13"
     ],
     [
      "10:40",
      "Shrewsbury to Cosford",
      "West Midlands Railway, at Cosford 11:12"
     ]
    ],
    "note": "From the West Midlands Railway show day timetable for Sunday 14 June 2026, with extra trains and extra Transport for Wales stops at Cosford. Times for the 2027 show will be published nearer the date. Wolverhampton is about 18 minutes from Cosford.",
    "source": [
     "West Midlands Railway Cosford Air Show timetable 2026",
     "https://cosfordairshow.co.uk/wp-content/uploads/2026/04/WMR-Cosford-Air-Show-Timetable-Poster-2026-V1.pdf"
    ]
   },
   {
    "title": "Trains home towards Wolverhampton and Birmingham",
    "rows": [
     [
      "16:12",
      "Cosford to Birmingham New Street",
      "West Midlands Railway, Wolverhampton 16:31, Birmingham 16:51"
     ],
     [
      "16:59",
      "Cosford to Birmingham New Street",
      "Transport for Wales, Wolverhampton 17:11, Birmingham 17:31"
     ],
     [
      "17:07",
      "Cosford to Wolverhampton",
      "Show extra, arrives 17:25"
     ],
     [
      "17:12",
      "Cosford to Birmingham New Street",
      "West Midlands Railway, Wolverhampton 17:30, Birmingham 17:51"
     ],
     [
      "17:29",
      "Cosford to Wolverhampton",
      "Show extra, arrives 17:48"
     ],
     [
      "17:59",
      "Cosford to Birmingham New Street",
      "Transport for Wales, Wolverhampton 18:11, Birmingham 18:31"
     ],
     [
      "18:44",
      "Cosford to Birmingham New Street",
      "West Midlands Railway, Wolverhampton 19:03, Birmingham 19:21"
     ],
     [
      "Then",
      "Hourly at 12 minutes past",
      "19:12, 20:12 and 21:12, about 40 minutes to Birmingham"
     ],
     [
      "22:25",
      "Cosford to Birmingham New Street",
      "Last train to Birmingham, arrives 23:04"
     ],
     [
      "22:56",
      "Cosford to Wolverhampton",
      "Last train of the night, arrives 23:14"
     ]
    ],
    "note": "From the West Midlands Railway show day timetable for Sunday 14 June 2026. On a normal Sunday trains are hourly. Flying usually ends about 17:00, so the 17:00 to 18:30 trains are the busiest.",
    "source": [
     "West Midlands Railway Cosford Air Show timetable 2026",
     "https://cosfordairshow.co.uk/wp-content/uploads/2026/04/WMR-Cosford-Air-Show-Timetable-Poster-2026-V1.pdf"
    ]
   },
   {
    "title": "Trains home towards Telford and Shrewsbury",
    "rows": [
     [
      "16:32",
      "Cosford to Shrewsbury",
      "West Midlands Railway, Telford Central 16:42, Shrewsbury 17:05"
     ],
     [
      "17:32",
      "Cosford to Shrewsbury",
      "West Midlands Railway, arrives 18:05"
     ],
     [
      "17:53",
      "Cosford to Shrewsbury",
      "Transport for Wales, arrives 18:26"
     ],
     [
      "18:12",
      "Cosford to Shrewsbury",
      "Show extra, arrives 18:44"
     ],
     [
      "18:53",
      "Cosford to Shrewsbury",
      "Transport for Wales, arrives 19:22"
     ],
     [
      "Then",
      "Hourly at 32 minutes past",
      "19:32, 20:32 and 21:32, about 33 minutes"
     ],
     [
      "22:46",
      "Cosford to Shrewsbury",
      "Arrives 23:18"
     ],
     [
      "00:05",
      "Cosford to Shrewsbury",
      "Last train, arrives 00:40"
     ]
    ],
    "note": "From the West Midlands Railway show day timetable for Sunday 14 June 2026. Telford Central is about 10 minutes from Cosford.",
    "source": [
     "West Midlands Railway Cosford Air Show timetable 2026",
     "https://cosfordairshow.co.uk/wp-content/uploads/2026/04/WMR-Cosford-Air-Show-Timetable-Poster-2026-V1.pdf"
    ]
   }
  ],
  "rail-change": [
   {
    "title": "From London on a Sunday, changing at Wolverhampton",
    "rows": [
     [
      "07:48",
      "London Euston to Wolverhampton",
      "Avanti West Coast, arrives 10:29"
     ],
     [
      "10:41",
      "Wolverhampton to Cosford",
      "Show day train, at Cosford 10:52"
     ],
     [
      "08:50",
      "London Euston to Wolverhampton",
      "Avanti West Coast, arrives 11:29"
     ],
     [
      "11:41",
      "Wolverhampton to Cosford",
      "Show day train, at Cosford 11:52"
     ]
    ],
    "note": "Avanti times from the timetable valid 17 May to 12 December 2026, Sunday trains to Wolverhampton are hourly and take about 2 hours 40 minutes. Cosford times from the 2026 show day timetable.",
    "source": [
     "Avanti West Coast timetable book, 17 May to 12 December 2026",
     "https://www.avantiwestcoast.co.uk/-/media/avanti-pdfs/avanti-timetables/2026/timetable-books/17-may---12-december-2026-timetable-book.pdf"
    ]
   },
   {
    "title": "Back to London on a Sunday",
    "rows": [
     [
      "17:12",
      "Cosford to Wolverhampton, arrives 17:30",
      "Then Avanti 17:45, London Euston 19:39"
     ],
     [
      "18:12",
      "Cosford to Wolverhampton, arrives 18:31",
      "Then Avanti 18:45, London Euston 20:37"
     ],
     [
      "19:12",
      "Cosford to Wolverhampton, arrives 19:31",
      "Then Avanti 19:45, London Euston 22:09"
     ],
     [
      "20:12",
      "Cosford to Wolverhampton, arrives 20:31",
      "Then Avanti 20:45, London Euston 23:25"
     ],
     [
      "21:12",
      "Cosford to Wolverhampton, arrives 21:31",
      "Then Avanti 22:05, London Euston 00:28"
     ],
     [
      "Then",
      "Avanti from Wolverhampton hourly",
      "Last train to London 22:32, arrives 01:04"
     ]
    ],
    "note": "Avanti times from the timetable valid 17 May to 12 December 2026. Cosford times from the 2026 show day timetable. Allow for crowds on the platform at Cosford.",
    "source": [
     "Avanti West Coast timetable book, 17 May to 12 December 2026",
     "https://www.avantiwestcoast.co.uk/-/media/avanti-pdfs/avanti-timetables/2026/timetable-books/17-may---12-december-2026-timetable-book.pdf"
    ]
   }
  ],
  "bus": [
   {
    "title": "Banga Buses 891, Wolverhampton to Telford",
    "rows": [
     [
      "Route",
      "891, Wolverhampton, Albrighton, Cosford, Shifnal, Telford",
      "Banga Buses"
     ],
     [
      "Stop",
      "Cosford garage",
      "Nearest timed stop to the airfield"
     ],
     [
      "Sunday",
      "No service",
      "No Sunday or bank holiday buses, so not for show day"
     ],
     [
      "Saturday",
      "Wolverhampton 07:30, 09:25, 11:15, 13:25, 15:35",
      "Cosford about 22 minutes later"
     ],
     [
      "Saturday",
      "Last bus from Cosford 17:02",
      "To Wolverhampton, arrives 17:30"
     ],
     [
      "Weekdays",
      "About hourly, 07:30 to 16:35 from Wolverhampton",
      "Last bus from Cosford 18:01"
     ]
    ],
    "note": "From the Banga Buses timetable starting 29 March 2026. The show is on a Sunday, so the train is the only public transport option on the day.",
    "source": [
     "Banga Buses timetables",
     "https://bangabuses.co.uk/bus-timetables/"
    ]
   }
  ]
 },
 "midlands": {
  "checked": "2026-10-29",
  "rail-red": [
   {
    "title": "Linking with the 247 bus at Redditch",
    "rows": [
     [
      "Bus",
      "Redditch Bus Station, Stand H",
      "Diamond 247 to Ragley Hall, about 45 minutes"
     ],
     [
      "Saturday",
      "Buses leave Redditch 09:30, 12:40, 15:50",
      "Last bus back reaches Redditch 18:54"
     ],
     [
      "Friday",
      "Buses leave Redditch through the day",
      "Last bus back reaches Redditch 18:54"
     ],
     [
      "Sunday",
      "No 247 shown",
      "No Sunday bus in the current timetable"
     ]
    ],
    "note": "I could not read the current West Midlands Railway Cross City timetable for Redditch, so train times are not shown. Please check National Rail. The last buses back leave well before the Friday Nightfire and the evening balloons.",
    "source": [
     "Diamond Bus 247 timetable",
     "https://www.diamondbuses.com/bus-services/ww/ww247-redditch/"
    ]
   }
  ],
  "bus-247": [
   {
    "title": "Saturday",
    "rows": [
     [
      "09:30",
      "Redditch Bus Station to Ragley Hall",
      "At Arrow, Worcester Road 10:12"
     ],
     [
      "12:40",
      "Redditch Bus Station to Ragley Hall",
      "At Arrow, Worcester Road 13:22"
     ],
     [
      "15:50",
      "Redditch Bus Station to Ragley Hall",
      "At Arrow, Worcester Road 16:32"
     ],
     [
      "11:44",
      "Ragley Hall to Redditch",
      "Arrives 12:34"
     ],
     [
      "14:54",
      "Ragley Hall to Redditch",
      "Arrives 15:44"
     ],
     [
      "18:04",
      "Ragley Hall to Redditch",
      "Last bus, arrives 18:54"
     ]
    ],
    "note": "Diamond Bus, current timetable checked October 2026. Three buses each way on Saturdays. The Ragley Hall stop is not timed, so times shown are for Arrow, Worcester Road, the next stop along. Be at the stop a few minutes early.",
    "source": [
     "Diamond Bus 247 timetable",
     "https://www.diamondbuses.com/bus-services/ww/ww247-redditch/"
    ]
   },
   {
    "title": "Friday and Sunday",
    "rows": [
     [
      "Friday",
      "Redditch Bus Station 06:00 to 17:00",
      "Roughly every 1 to 2 hours, about 42 minutes to Arrow"
     ],
     [
      "Friday",
      "Leaves Redditch 10:50, 12:40, 14:00, 15:50",
      "At Arrow, Worcester Road 11:32, 13:22, 14:42, 16:32"
     ],
     [
      "Friday",
      "Back towards Redditch 13:04, 14:54, 16:04, 18:04",
      "From Arrow, Worcester Road. Last bus arrives Redditch 18:54"
     ],
     [
      "Sunday",
      "No service",
      "No Sunday timetable is shown for the 247"
     ]
    ],
    "note": "Diamond Bus, current Monday to Friday timetable. Some journeys run only on school days or only in school holidays, so check the day you travel. No bank holiday service. There is no bus back after the Friday Nightfire.",
    "source": [
     "Diamond Bus 247 timetable",
     "https://www.diamondbuses.com/bus-services/ww/ww247-redditch/"
    ]
   }
  ]
 },
 "duxford": {
  "checked": "2026-10-29",
  "bus-local": [
   {
    "title": "Bus 132 on Sundays",
    "rows": [
     [
      "10:12",
      "Cambridge station to IWM Duxford, arrives 10:40",
      "Leaves Drummer Street at 10:05"
     ],
     [
      "12:22",
      "Cambridge station to IWM Duxford, arrives 12:50",
      "Leaves Drummer Street at 12:15"
     ],
     [
      "14:22",
      "Cambridge station to IWM Duxford, arrives 14:50",
      "Leaves Drummer Street at 14:15"
     ],
     [
      "16:27",
      "Cambridge station to IWM Duxford, arrives 16:55",
      "Leaves Drummer Street at 16:20"
     ],
     [
      "13:36",
      "IWM Duxford to Cambridge station, arrives 13:56",
      "Continues to Drummer Street"
     ],
     [
      "15:41",
      "IWM Duxford to Cambridge station, arrives 16:02",
      "Continues to Drummer Street"
     ],
     [
      "17:41",
      "IWM Duxford to Cambridge station, arrives 18:02",
      "Last bus of the day"
     ],
     [
      "Every 2 hours",
      "Sundays only",
      "About 30 minutes from Cambridge station, stop at IWM Hangar 1 on Whittlesford Road"
     ]
    ],
    "note": "From Traveline journey planner data for Sunday 10 January 2027, the same as November 2026. Traveline lists A2B Bus and Coach as the operator, not Myall's. There is no 132 on Saturdays, and the 7A runs on weekdays only with a few journeys that do not call at the museum.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   }
  ]
 },
 "shuttleworth": {
  "checked": "2026-10-29",
  "rail-shuttle": [
   {
    "title": "Saturday trains to catch the shuttle",
    "rows": [
     [
      "07:46",
      "St Pancras to Biggleswade, arrives 08:31",
      "Thameslink, for the 09:00 shuttle"
     ],
     [
      "08:46",
      "St Pancras to Biggleswade, arrives 09:31",
      "Thameslink, for the 10:00 shuttle"
     ],
     [
      "09:46",
      "St Pancras to Biggleswade, arrives 10:31",
      "Thameslink, for the 11:00 shuttle"
     ],
     [
      "10:46",
      "St Pancras to Biggleswade, arrives 11:31",
      "Thameslink, for the 12:00 shuttle"
     ],
     [
      "07:53",
      "Peterborough to Biggleswade, arrives 08:30",
      "Thameslink, for the 09:00 shuttle"
     ],
     [
      "08:53",
      "Peterborough to Biggleswade, arrives 09:28",
      "Thameslink, for the 10:00 shuttle"
     ],
     [
      "Every 30 min",
      "From London and from Peterborough",
      "About 45 minutes from St Pancras, 37 from Peterborough"
     ]
    ],
    "note": "From Traveline journey planner data for the December 2026 timetable (valid from 13 December 2026), checked against Saturday 9 and Sunday 10 January 2027; the pattern matches the current timetable. The May 2027 timetable will change some times, so please check National Rail before you travel.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   },
   {
    "title": "Saturday trains home after the shuttle",
    "rows": [
     [
      "Every 30 min",
      "Biggleswade to St Pancras at :00 and :30",
      "Thameslink, about 44 minutes"
     ],
     [
      "22:30",
      "Last train to St Pancras",
      "Arrives 23:14"
     ],
     [
      "23:00",
      "Biggleswade to London King's Cross",
      "Arrives 23:43, handy after the Flying Proms"
     ],
     [
      "23:31",
      "Biggleswade to London King's Cross",
      "Arrives 00:17"
     ],
     [
      "23:53",
      "Last train to London King's Cross",
      "Arrives 00:46"
     ],
     [
      "Every 30 min",
      "Biggleswade to Peterborough at :01 and :31",
      "Thameslink, about 36 minutes"
     ],
     [
      "23:31",
      "Last train to Peterborough",
      "Arrives 00:08"
     ]
    ],
    "note": "From Traveline journey planner data for the December 2026 timetable (valid from 13 December 2026), checked against Saturday 9 and Sunday 10 January 2027; the pattern matches the current timetable. The May 2027 timetable will change some times, so please check National Rail before you travel.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   },
   {
    "title": "Sunday shows",
    "rows": [
     [
      "08:11",
      "King's Cross to Biggleswade, arrives 08:55",
      "Thameslink, for the 09:00 shuttle, a tight change"
     ],
     [
      "09:11",
      "King's Cross to Biggleswade, arrives 09:55",
      "Thameslink, for the 10:00 shuttle"
     ],
     [
      "10:11",
      "King's Cross to Biggleswade, arrives 10:55",
      "Thameslink, for the 11:00 shuttle"
     ],
     [
      "11:11",
      "King's Cross to Biggleswade, arrives 11:55",
      "Thameslink, for the 12:00 shuttle"
     ],
     [
      "Hourly",
      "Biggleswade to King's Cross at :14",
      "Thameslink, about 45 minutes, last at 22:14 then 23:30"
     ],
     [
      "23:30",
      "Last train to King's Cross",
      "Arrives 00:13"
     ],
     [
      "Hourly",
      "Biggleswade to Peterborough at :55",
      "About 35 minutes, plus Great Northern at 17:30, 18:30 and 19:30"
     ],
     [
      "23:55",
      "Last train to Peterborough",
      "Arrives 00:32"
     ]
    ],
    "note": "For the Season Premiere on Sunday 9 May and the Festival of Flight on Sunday 27 June. From Traveline journey planner data for the December 2026 timetable (valid from 13 December 2026), checked against Saturday 9 and Sunday 10 January 2027; the pattern matches the current timetable. The May 2027 timetable will change some times, so please check National Rail before you travel.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   }
  ],
  "rail-big": [
   {
    "title": "Saturday trains",
    "rows": [
     [
      "Every 30 min",
      "St Pancras to Biggleswade at :16 and :46",
      "Thameslink, about 45 minutes, calls at :01 and :31"
     ],
     [
      "Every 30 min",
      "Peterborough to Biggleswade at :23 and :53",
      "Thameslink, about 37 minutes, plus Great Northern at 08:05, 09:03 and 10:05"
     ],
     [
      "Every 30 min",
      "Biggleswade to St Pancras at :00 and :30",
      "Thameslink, about 44 minutes"
     ],
     [
      "22:30",
      "Last train to St Pancras",
      "Arrives 23:14, then 23:00, 23:31 and 23:53 to King's Cross"
     ],
     [
      "23:53",
      "Last train to London King's Cross",
      "Arrives 00:46"
     ],
     [
      "Every 30 min",
      "Biggleswade to Peterborough at :01 and :31",
      "About 36 minutes, plus Great Northern at 17:18, 18:18 and 19:18"
     ],
     [
      "23:31",
      "Last train to Peterborough",
      "Arrives 00:08"
     ]
    ],
    "note": "From Traveline journey planner data for the December 2026 timetable (valid from 13 December 2026), checked against Saturday 9 and Sunday 10 January 2027; the pattern matches the current timetable. The May 2027 timetable will change some times, so please check National Rail before you travel.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   },
   {
    "title": "Sunday trains",
    "rows": [
     [
      "Hourly",
      "King's Cross to Biggleswade at :11",
      "Thameslink, about 44 minutes, first useful train 08:11 arriving 08:55"
     ],
     [
      "Hourly",
      "Peterborough to Biggleswade",
      "Thameslink at :40 arriving :14, and Great Northern at :00 arriving :38"
     ],
     [
      "Hourly",
      "Biggleswade to King's Cross at :14",
      "Thameslink, about 45 minutes, 16:14 to 22:14"
     ],
     [
      "23:30",
      "Last train to King's Cross",
      "Arrives 00:13"
     ],
     [
      "Hourly",
      "Biggleswade to Peterborough at :55",
      "About 35 minutes, plus Great Northern at 17:30, 18:30 and 19:30"
     ],
     [
      "23:55",
      "Last train to Peterborough",
      "Arrives 00:32"
     ]
    ],
    "note": "From Traveline journey planner data for the December 2026 timetable (valid from 13 December 2026), checked against Saturday 9 and Sunday 10 January 2027; the pattern matches the current timetable. The May 2027 timetable will change some times, so please check National Rail before you travel.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   }
  ],
  "rail-bed": [
   {
    "title": "Saturday trains",
    "rows": [
     [
      "07:15",
      "St Pancras to Bedford, arrives 07:55",
      "East Midlands Railway, then every 30 minutes at :15 and :45, about 40 minutes"
     ],
     [
      "07:43",
      "St Pancras to Bedford, arrives 08:47",
      "Thameslink, four an hour, about 64 minutes"
     ],
     [
      "07:40",
      "Corby to Bedford, arrives 08:10",
      "East Midlands Railway via Kettering (07:48), every 30 minutes"
     ],
     [
      "Every 30 min",
      "Bedford to St Pancras at :10 and :40",
      "East Midlands Railway, about 42 minutes, last 22:10 arrives 22:52"
     ],
     [
      "Every 15 min",
      "Bedford to St Pancras at :01, :16, :31 and :46",
      "Thameslink, about 61 minutes"
     ],
     [
      "23:36",
      "Last Thameslink to St Pancras",
      "Arrives 00:53"
     ],
     [
      "Every 30 min",
      "Bedford to Kettering and Corby at :26 and :56",
      "East Midlands Railway, Corby in about 29 minutes"
     ],
     [
      "22:28",
      "Last train to Corby",
      "Arrives 22:57, last to Kettering 23:16 arriving 23:36"
     ]
    ],
    "note": "From Traveline journey planner data for the December 2026 timetable (valid from 13 December 2026), checked against Saturday 9 and Sunday 10 January 2027; the pattern matches the current timetable. The May 2027 timetable will change some times, so please check National Rail before you travel.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   },
   {
    "title": "Sunday trains",
    "rows": [
     [
      "09:00",
      "St Pancras to Bedford, arrives 09:41",
      "East Midlands Railway, then 09:30, 10:05 and 10:34"
     ],
     [
      "08:33",
      "St Pancras to Bedford, arrives 09:50",
      "Thameslink, then about every 15 minutes"
     ],
     [
      "08:53",
      "Kettering to Bedford, arrives 09:13",
      "East Midlands Railway, then 09:17 and 09:50"
     ],
     [
      "Every 30 min",
      "Bedford to St Pancras at :10 and :40",
      "East Midlands Railway, about 42 minutes"
     ],
     [
      "22:27",
      "Last East Midlands Railway train to St Pancras",
      "Arrives 23:07"
     ],
     [
      "Every 15 min",
      "Bedford to St Pancras at :02, :16, :32 and :46",
      "Thameslink, about 62 minutes, last 23:42 arrives 00:51"
     ],
     [
      "Every 30 min",
      "Bedford to Kettering and Corby at :25 and :55",
      "East Midlands Railway, last to Corby 22:55"
     ],
     [
      "23:37",
      "Last train to Kettering and Leicester",
      "East Midlands Railway, Leicester 00:21"
     ]
    ],
    "note": "From Traveline journey planner data for the December 2026 timetable (valid from 13 December 2026), checked against Saturday 9 and Sunday 10 January 2027; the pattern matches the current timetable. The May 2027 timetable will change some times, so please check National Rail before you travel.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   }
  ],
  "bus-74": [
   {
    "title": "Saturday buses to Ickwell",
    "rows": [
     [
      "07:45",
      "Bedford Bus Station to Ickwell Green, arrives 08:06",
      "Then 08:40 and hourly at :40, about 21 minutes"
     ],
     [
      "16:40",
      "Last useful bus from Bedford",
      "Arrives Ickwell Green 17:01"
     ],
     [
      "07:47",
      "Biggleswade Bus Station (Stop A) to Ickwell Green, arrives 07:57",
      "Then 08:32, 09:32, 10:27 and hourly at :27"
     ],
     [
      "Sunday",
      "No service",
      "No buses on Sundays or bank holidays"
     ]
    ],
    "note": "From the Grant Palmer route 74 timetable on Traveline, valid from 7 June 2026 until further notice. During the Hitchin Street closure in Biggleswade, buses do not serve the railway station stops.",
    "source": [
     "Central Bedfordshire Council, route 74",
     "https://www.centralbedfordshire.gov.uk/bus-timetables/route-74-grant-palmer"
    ]
   },
   {
    "title": "Saturday buses home",
    "rows": [
     [
      "15:42",
      "Ickwell Green to Bedford Bus Station, arrives 16:07",
      "Hourly"
     ],
     [
      "16:37",
      "Ickwell Green to Bedford Bus Station, arrives 17:02",
      ""
     ],
     [
      "17:37",
      "Last bus to Bedford",
      "Arrives 18:02"
     ],
     [
      "16:01",
      "Ickwell Green to Biggleswade Bus Station, arrives 16:18",
      "Continues to Henlow"
     ],
     [
      "17:01",
      "Ickwell Green to Biggleswade Bus Station, arrives 17:18",
      ""
     ],
     [
      "18:16",
      "Last bus to Biggleswade",
      "Arrives 18:33, before most shows finish"
     ]
    ],
    "note": "From the Grant Palmer route 74 timetable on Traveline, valid from 7 June 2026 until further notice. Times may change by 2027.",
    "source": [
     "Central Bedfordshire Council, route 74",
     "https://www.centralbedfordshire.gov.uk/bus-timetables/route-74-grant-palmer"
    ]
   }
  ]
 },
 "gransden": {
  "checked": "2026-10-29",
  "rail-stneots": [
   {
    "title": "Sunday trains to St Neots",
    "rows": [
     [
      "08:11",
      "King's Cross to St Neots, arrives 09:06",
      "Thameslink, about 55 minutes"
     ],
     [
      "09:11",
      "King's Cross to St Neots, arrives 10:06",
      "Thameslink"
     ],
     [
      "10:11",
      "King's Cross to St Neots, arrives 11:06",
      "Thameslink"
     ],
     [
      "11:11",
      "King's Cross to St Neots, arrives 12:06",
      "Thameslink, hourly"
     ],
     [
      "09:00",
      "Peterborough to St Neots, arrives 09:26",
      "Great Northern, then 10:00 arriving 10:26"
     ],
     [
      "09:40",
      "Peterborough to St Neots, arrives 10:02",
      "Thameslink, then 10:40 arriving 11:02"
     ]
    ],
    "note": "From Traveline journey planner data for the December 2026 timetable (valid from 13 December 2026), checked against Sunday 10 January 2027 and Sunday 20 December 2026. Sunday 29 August 2027 is a bank holiday weekend, when engineering work is common, so please check National Rail before you travel.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   },
   {
    "title": "Sunday trains home",
    "rows": [
     [
      "Hourly",
      "St Neots to King's Cross at :02",
      "Thameslink, about 57 minutes, 16:02 to 22:02"
     ],
     [
      "23:18",
      "Last train to King's Cross",
      "Arrives 00:13"
     ],
     [
      "Hourly",
      "St Neots to Peterborough at :06",
      "Thameslink, about 24 minutes"
     ],
     [
      "17:40",
      "St Neots to Peterborough, arrives 18:03",
      "Great Northern, also 18:40 and 19:40"
     ],
     [
      "00:06",
      "Last train to Peterborough",
      "Arrives 00:32"
     ]
    ],
    "note": "From Traveline journey planner data for the December 2026 timetable (valid from 13 December 2026), checked against Sunday 10 January 2027 and Sunday 20 December 2026. Sunday 29 August 2027 is a bank holiday weekend, when engineering work is common, so please check National Rail before you travel.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   }
  ],
  "rail-sandy": [
   {
    "title": "Sunday trains",
    "rows": [
     [
      "08:11",
      "King's Cross to Sandy, arrives 08:59",
      "Thameslink, about 48 minutes, then hourly"
     ],
     [
      "09:11",
      "King's Cross to Sandy, arrives 09:59",
      "Thameslink"
     ],
     [
      "10:11",
      "King's Cross to Sandy, arrives 10:59",
      "Thameslink"
     ],
     [
      "09:40",
      "Peterborough to Sandy, arrives 10:10",
      "Thameslink, then 10:40 arriving 11:10"
     ],
     [
      "Hourly",
      "Sandy to King's Cross at :10",
      "Thameslink, about 49 minutes, 16:10 to 22:10"
     ],
     [
      "23:25",
      "Last train to King's Cross",
      "Arrives 00:13"
     ],
     [
      "Hourly",
      "Sandy to Peterborough at :59",
      "Thameslink, about 31 minutes"
     ],
     [
      "23:59",
      "Last train to Peterborough",
      "Arrives 00:32"
     ]
    ],
    "note": "From Traveline journey planner data for the December 2026 timetable (valid from 13 December 2026), checked against Sunday 10 January 2027 and Sunday 20 December 2026. Sunday 29 August 2027 is a bank holiday weekend, when engineering work is common, so please check National Rail before you travel.",
    "source": [
     "Traveline journey planner",
     "https://www.traveline.info/"
    ]
   }
  ],
  "bus-local": [
   {
    "title": "Buses on show day",
    "rows": [
     [
      "Sunday",
      "Whippet 18, no service",
      "Route 18 does not run on Sundays or public holidays"
     ],
     [
      "Saturday",
      "Whippet 18 via Great Gransden",
      "Only a few journeys call at Great Gransden"
     ],
     [
      "Route 28",
      "No timetable found",
      "Not listed on the Whippet website"
     ]
    ],
    "note": "From the Whippet route 18 timetable. The show is on a Sunday, so a taxi from the station is the only practical option.",
    "source": [
     "Whippet route 18",
     "https://www.whippetbus.co.uk/times/1818a/18/"
    ]
   }
  ]
 },
 "eastbourne": {
  "checked": "2026-10-29",
  "rail": [
   {
    "title": "Getting there, Thursday to Saturday",
    "rows": [
     [
      "07:24",
      "London Victoria to Eastbourne",
      "Southern, arrives 08:49 (08:51 Thursday and Friday)"
     ],
     [
      "08:24",
      "London Victoria to Eastbourne",
      "Southern, via Gatwick Airport 08:56, arrives 09:53"
     ],
     [
      "09:24",
      "London Victoria to Eastbourne",
      "Southern, arrives 10:51"
     ],
     [
      "10:24",
      "London Victoria to Eastbourne",
      "Southern, arrives 11:51, late for Saturday's 11:45 start"
     ],
     [
      "08:26",
      "Brighton to Eastbourne",
      "Southern, arrives 09:04"
     ],
     [
      "09:26",
      "Brighton to Eastbourne",
      "Southern, arrives 10:04"
     ],
     [
      "09:25",
      "Hastings to Eastbourne",
      "Southern, arrives 09:59"
     ],
     [
      "Every 30 min",
      "From London Victoria and Brighton",
      "About 1 hour 25 minutes from Victoria, 40 minutes from Brighton"
     ]
    ],
    "note": "From the National Rail timetable valid 17 May to 12 December 2026. The May 2027 timetable that covers the show is due out around March 2027, so check again nearer the time. Times shown are Saturday; Thursday and Friday trains run at the same times, give or take a couple of minutes. Flying starts at 13:00 on Thursday and Friday and 11:45 on Saturday.",
    "source": [
     "Network Rail timetable, Table 176",
     "https://www.networkrail.co.uk/industry-and-commercial/the-timetable/electronic-national-rail-timetable/"
    ]
   },
   {
    "title": "Trains home, Thursday to Saturday",
    "rows": [
     [
      "17:05",
      "Eastbourne to London Victoria",
      "Southern, via Gatwick Airport 17:58, arrives 18:36"
     ],
     [
      "17:33",
      "Eastbourne to London Victoria",
      "Southern, arrives 19:06"
     ],
     [
      "Then",
      "Every 30 minutes to Victoria",
      "At 05 and 33 minutes past the hour"
     ],
     [
      "22:05",
      "Last direct train to Victoria",
      "Arrives 23:36"
     ],
     [
      "17:30",
      "Eastbourne to Brighton",
      "Southern, arrives 18:09"
     ],
     [
      "Then",
      "Every 30 minutes to Brighton",
      "At 30 and 55 minutes past the hour, about 40 minutes"
     ],
     [
      "23:14",
      "Last train to Brighton",
      "Arrives 23:54 (23:12 on Thursday and Friday)"
     ],
     [
      "17:08",
      "Eastbourne to Hastings",
      "Southern, arrives 17:37, then up to four an hour"
     ],
     [
      "23:24",
      "Last train to Hastings",
      "Arrives 23:58 (23:23 on Thursday and Friday)"
     ]
    ],
    "note": "From the National Rail timetable valid 17 May to 12 December 2026. The May 2027 timetable that covers the show is due out around March 2027, so check again nearer the time. Flying ends at about 17:00 and the station gets very busy straight after.",
    "source": [
     "Network Rail timetable, Table 176",
     "https://www.networkrail.co.uk/industry-and-commercial/the-timetable/electronic-national-rail-timetable/"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "08:46",
      "London Victoria to Eastbourne",
      "Southern, arrives 10:11"
     ],
     [
      "09:46",
      "London Victoria to Eastbourne",
      "Southern, arrives 11:11"
     ],
     [
      "10:46",
      "London Victoria to Eastbourne",
      "Southern, arrives 12:11, hourly on Sundays"
     ],
     [
      "09:58",
      "Brighton to Eastbourne",
      "Southern, arrives 10:39, hourly direct"
     ],
     [
      "10:19",
      "Hastings to Eastbourne",
      "Southern, arrives 10:54, two an hour"
     ],
     [
      "17:00",
      "Eastbourne to London Victoria",
      "Southern, arrives 18:33, then hourly"
     ],
     [
      "21:00",
      "Last direct train to Victoria",
      "Arrives 22:33"
     ],
     [
      "17:44",
      "Eastbourne to Brighton",
      "Southern, arrives 18:25, hourly direct, last 23:00"
     ],
     [
      "17:17",
      "Eastbourne to Hastings",
      "Southern, arrives 17:53, two an hour, last 23:17"
     ]
    ],
    "note": "From the National Rail timetable valid 17 May to 12 December 2026. The May 2027 timetable that covers the show is due out around March 2027, so check again nearer the time. Sunday trains are less frequent than on the other show days.",
    "source": [
     "Network Rail timetable, Table 176",
     "https://www.networkrail.co.uk/industry-and-commercial/the-timetable/electronic-national-rail-timetable/"
    ]
   }
  ],
  "bus-station": [
   {
    "title": "Stagecoach route 3, station to the seafront",
    "rows": [
     [
      "09:55",
      "Railway Station to Winter Garden",
      "Route 3, about 5 minutes, Thursday to Saturday"
     ],
     [
      "Then",
      "Twice an hour",
      "At 15 and 55 minutes past the hour, Thursday to Saturday"
     ],
     [
      "09:20",
      "Railway Station to Winter Garden",
      "Sunday, then hourly at 20 minutes past"
     ],
     [
      "17:03",
      "Grand Hotel to Gildredge Road",
      "Route 3 back towards the station, Thursday to Saturday"
     ],
     [
      "17:43",
      "Last bus back, Thursday to Saturday",
      "Grand Hotel to Gildredge Road"
     ],
     [
      "18:52",
      "Last bus back on Sunday",
      "Grand Hotel to Gildredge Road, hourly before that"
     ]
    ],
    "note": "Operator timetable data published through the Bus Open Data Service on 22 October 2026, which is the winter timetable. Summer and show week times can differ, and stops move during the show. Route 3 evening journeys were withdrawn in April 2026. With the seafront closed during the show, route 3 is likely to be diverted, so it may not reach the Winter Garden.",
    "source": [
     "Bus Open Data Service, Department for Transport",
     "https://www.bus-data.dft.gov.uk/"
    ]
   }
  ],
  "bus-brighton": [
   {
    "title": "Thursday to Saturday",
    "rows": [
     [
      "08:35",
      "12X Brighton Station to Eastbourne",
      "Arrives Eastbourne station 09:44 (Saturday)"
     ],
     [
      "09:05",
      "12X Brighton Station to Eastbourne",
      "Arrives 10:15 (Saturday)"
     ],
     [
      "08:27",
      "12 Brighton Station to Eastbourne",
      "Arrives 09:56, slower coast road (Saturday)"
     ],
     [
      "Every 15 min",
      "12X",
      "Up to every 12 minutes on Thursday and Friday, about 1 hour 10 minutes"
     ],
     [
      "Every 30 min",
      "12 to and from Eastbourne",
      "About 1 hour 30 minutes"
     ],
     [
      "17:03",
      "12X Cornfield Road to Brighton",
      "Arrives 18:23 (Saturday)"
     ],
     [
      "22:00",
      "Last 12X to Brighton",
      "Arrives 23:02"
     ],
     [
      "23:50",
      "Last 12 to Brighton",
      "Arrives about 01:03, then the N12 hourly overnight"
     ]
    ],
    "note": "Operator timetable data published through the Bus Open Data Service on 22 October 2026, which is the winter timetable. Summer and show week times can differ, and stops move during the show. Data runs to 20 December 2026. The 12X does not run on Sundays. Out of town buses use different stops during the show.",
    "source": [
     "Bus Open Data Service, Department for Transport",
     "https://www.bus-data.dft.gov.uk/"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "08:30",
      "12 Brighton Station to Eastbourne",
      "Arrives Eastbourne station 09:57"
     ],
     [
      "08:45",
      "13X Brighton Station via Beachy Head",
      "Arrives Eastbourne station 10:14"
     ],
     [
      "09:15",
      "13X Brighton Station via Beachy Head",
      "Arrives 10:45"
     ],
     [
      "Every 20 min",
      "12 and 13X",
      "Each route about every 20 minutes through the day"
     ],
     [
      "17:08",
      "13X Cornfield Road to Brighton",
      "Arrives 18:42"
     ],
     [
      "19:10",
      "Last 13X to Brighton",
      "Arrives 20:36"
     ],
     [
      "17:18",
      "12 Cornfield Road to Brighton",
      "Arrives 18:56"
     ],
     [
      "23:50",
      "Last 12 to Brighton",
      "Every 20 to 30 minutes in the evening"
     ]
    ],
    "note": "Operator timetable data published through the Bus Open Data Service on 22 October 2026, which is the winter timetable. Summer and show week times can differ, and stops move during the show. Brighton & Hove says the summer 13X runs every 15 minutes on Sundays and bank holidays, hourly on Saturdays and five times a day Monday to Friday.",
    "source": [
     "Bus Open Data Service, Department for Transport",
     "https://www.bus-data.dft.gov.uk/"
    ]
   }
  ],
  "bus-beachy": [
   {
    "title": "13X between Beachy Head and town",
    "rows": [
     [
      "10:01",
      "Beachy Head Centre to Eastbourne",
      "13X, arrives Eastbourne station 10:14 (Sunday)"
     ],
     [
      "Then",
      "Every 20 minutes",
      "Sunday, about 14 minutes into town"
     ],
     [
      "17:08",
      "Cornfield Road to Beachy Head Centre",
      "13X, arrives 17:25 (Sunday)"
     ],
     [
      "19:10",
      "Last 13X to Beachy Head",
      "Arrives 19:27 (Sunday)"
     ],
     [
      "Summer",
      "Thursday to Saturday",
      "Five journeys a day Monday to Friday and hourly on Saturdays"
     ]
    ],
    "note": "Operator timetable data published through the Bus Open Data Service on 22 October 2026, which is the winter timetable. Summer and show week times can differ, and stops move during the show. In the current winter timetable the 13X runs on Sundays only. The summer 13X times come from Brighton & Hove's service changes page. No timetable was found for the open top sightseeing bus.",
    "source": [
     "Bus Open Data Service, Department for Transport",
     "https://www.bus-data.dft.gov.uk/"
    ]
   }
  ],
  "bus-east": [
   {
    "title": "Stagecoach 99 from Hastings and Bexhill",
    "rows": [
     [
      "08:30",
      "99 Hastings station to Eastbourne",
      "Arrives Memorial Roundabout 09:53, Thursday to Saturday"
     ],
     [
      "09:10",
      "99 Hastings station to Eastbourne",
      "Arrives 10:32, Thursday to Saturday"
     ],
     [
      "Every 20 min",
      "Thursday to Saturday",
      "About 1 hour 20 minutes, every 30 minutes on Sundays"
     ],
     [
      "09:50",
      "99 Hastings station to Eastbourne",
      "Arrives 11:12, Sunday (first bus 08:20)"
     ],
     [
      "17:00",
      "99 Cornfield Road to Hastings",
      "Arrives Robertson Street 18:17, Thursday to Saturday"
     ],
     [
      "22:25",
      "Last bus to Hastings, Thursday to Saturday",
      "99E, arrives 23:33"
     ],
     [
      "19:40",
      "Last bus to Hastings on Sunday",
      "Arrives 20:44"
     ]
    ],
    "note": "Operator timetable data published through the Bus Open Data Service on 22 October 2026, which is the winter timetable. Summer and show week times can differ, and stops move during the show. Stagecoach data runs to 1 August 2027. The page says the 99 ends in Gildredge Road during the show.",
    "source": [
     "Bus Open Data Service, Department for Transport",
     "https://www.bus-data.dft.gov.uk/"
    ]
   },
   {
    "title": "Cuckmere Buses 25 from Lewes",
    "rows": [
     [
      "10:30",
      "25 Lewes station to Eastbourne",
      "Arrives Cornfield Road 11:41, via Firle and Berwick"
     ],
     [
      "13:30",
      "25 Lewes station to Eastbourne",
      "Arrives 14:41, via Alfriston"
     ],
     [
      "15:00",
      "25 Gildredge Road to Lewes station",
      "Arrives 16:11, before the flying ends"
     ],
     [
      "18:00",
      "25 Gildredge Road to Berwick station",
      "Arrives 18:38, last bus"
     ],
     [
      "Days",
      "Tuesday, Thursday and Saturday only",
      "No service on Friday or Sunday"
     ]
    ],
    "note": "Operator timetable data published through the Bus Open Data Service on 22 October 2026, which is the winter timetable. Summer and show week times can differ, and stops move during the show. East Sussex County Council lists the 25 as a Cuckmere Buses route on Tuesdays, Thursdays and Saturdays, so it serves the Thursday and Saturday of the show. No Compass 125 journeys to Eastbourne appear in the current data.",
    "source": [
     "East Sussex County Council bus changes",
     "https://www.eastsussex.gov.uk/roads-transport/public/journeyplan/changes-to-bus-services/eastbourne-borough-bus-service-changes"
    ]
   }
  ]
 },
 "clacton": {
  "checked": "2026-10-29",
  "rail": [
   {
    "title": "Getting there, Thursday and Friday",
    "rows": [
     [
      "08:16",
      "London Liverpool Street to Clacton",
      "Greater Anglia, arrives 09:44"
     ],
     [
      "09:18",
      "London Liverpool Street to Clacton",
      "Greater Anglia, arrives 10:44"
     ],
     [
      "10:18",
      "London Liverpool Street to Clacton",
      "Greater Anglia, arrives 11:44"
     ],
     [
      "11:18",
      "London Liverpool Street to Clacton",
      "Greater Anglia, arrives 12:44"
     ],
     [
      "10:15",
      "Colchester to Clacton",
      "Same train, arrives 10:44"
     ],
     [
      "Hourly",
      "Direct from London",
      "About 1 hour 26 minutes, 29 minutes from Colchester"
     ]
    ],
    "note": "From the National Rail timetable valid 17 May to 12 December 2026 (Monday to Friday). The May 2027 timetable that covers the show is due out around March 2027. Greater Anglia usually adds extra trains on airshow days. Flying starts at about 13:45 on Thursday and 13:00 on Friday.",
    "source": [
     "Network Rail timetable, Table 006",
     "https://www.networkrail.co.uk/industry-and-commercial/the-timetable/electronic-national-rail-timetable/"
    ]
   },
   {
    "title": "Trains home, Thursday and Friday",
    "rows": [
     [
      "17:04",
      "Clacton to London Liverpool Street",
      "Greater Anglia, Colchester 17:32, arrives 18:30"
     ],
     [
      "18:05",
      "Clacton to London Liverpool Street",
      "Colchester 18:33, arrives 19:31"
     ],
     [
      "19:05",
      "Clacton to London Liverpool Street",
      "Colchester 19:33, arrives 20:31"
     ],
     [
      "Then",
      "Hourly",
      "At 5 minutes past the hour"
     ],
     [
      "21:05",
      "Clacton to London Liverpool Street",
      "Arrives 22:31, leaves before the twilight display ends"
     ],
     [
      "22:05",
      "Last direct train to London",
      "Colchester 22:33, arrives Liverpool Street 23:31"
     ],
     [
      "23:05",
      "Last train to Colchester",
      "Arrives 23:38, no train on to London after it"
     ]
    ],
    "note": "From the National Rail timetable valid 17 May to 12 December 2026. On the Thursday the twilight display ran until about 21:15 in 2025, so the 22:05 is the last train to London. Extra trains are usually added on airshow days.",
    "source": [
     "Network Rail timetable, Table 006",
     "https://www.networkrail.co.uk/industry-and-commercial/the-timetable/electronic-national-rail-timetable/"
    ]
   }
  ],
  "bus-colchester": [
   {
    "title": "Thursday and Friday",
    "rows": [
     [
      "09:05",
      "74 Colchester Head Street to Clacton",
      "Arrives Pier Avenue 10:13"
     ],
     [
      "09:35",
      "76 Colchester Head Street to Clacton",
      "Arrives Pier Avenue 10:43"
     ],
     [
      "10:05",
      "74 Colchester Head Street to Clacton",
      "Arrives Pier Avenue 11:13"
     ],
     [
      "Every 30 min",
      "74 and 76 alternate",
      "About 1 hour 10 minutes, first bus 07:35"
     ],
     [
      "16:22",
      "74 Pier Avenue to Colchester",
      "Arrives St John's Street 17:27"
     ],
     [
      "16:53",
      "76 Pier Avenue to Colchester",
      "Arrives Osborne Street 17:59"
     ],
     [
      "Then",
      "Every 30 minutes",
      "74 and 76 to 18:53, then 74B and 76"
     ],
     [
      "21:45",
      "Last 76 to Colchester",
      "Arrives Osborne Street 22:38"
     ],
     [
      "22:15",
      "Last bus to Colchester",
      "74B, arrives Greyfriars 23:03"
     ]
    ],
    "note": "Operator timetable data published through the Bus Open Data Service on 22 October 2026, which is the winter timetable. Summer and show week times can differ, and stops move during the show. Data runs to 22 July 2027. The routes are registered to Hedingham & Chambers and run as Central Connect. Stops near the seafront can move during the show.",
    "source": [
     "Bus Open Data Service, Department for Transport",
     "https://www.bus-data.dft.gov.uk/"
    ]
   }
  ],
  "bus-local": [
   {
    "title": "Getting there, Thursday and Friday",
    "rows": [
     [
      "Every 15 min",
      "4 Jaywick circular",
      "From Pier Avenue, about 40 minutes round"
     ],
     [
      "Every 30 min",
      "7 from Walton, The Naze",
      "About 35 minutes to Clacton station"
     ],
     [
      "Hourly",
      "9 from Walton via Frinton",
      "Arrives Marine Parade West at 10 minutes past"
     ],
     [
      "Hourly",
      "6 from Point Clear and St Osyth",
      "Arrives Clacton station at 30 minutes past"
     ],
     [
      "Hourly",
      "3 from Harwich",
      "About 50 minutes"
     ],
     [
      "Every 2 hours",
      "78 from Brightlingsea",
      "Arrives 09:57, 11:57 and 13:57"
     ]
    ],
    "note": "Operator timetable data published through the Bus Open Data Service on 22 October 2026, which is the winter timetable. Summer and show week times can differ, and stops move during the show. Data runs to 22 July 2027.",
    "source": [
     "Bus Open Data Service, Department for Transport",
     "https://www.bus-data.dft.gov.uk/"
    ]
   },
   {
    "title": "Last buses home, Thursday and Friday",
    "rows": [
     [
      "22:33",
      "9A to Walton",
      "Every 30 minutes from 19:33 after the 7 stops at 18:48"
     ],
     [
      "21:53",
      "98A to Walton, The Naze",
      "Also 20:18"
     ],
     [
      "18:31",
      "9 to Walton via Frinton",
      "Hourly until then"
     ],
     [
      "21:10",
      "3 to Harwich",
      "Hourly, arrives Harwich Town station 22:02"
     ],
     [
      "22:17",
      "2 to Manningtree and Mistley",
      "Also 17:37 and 19:57"
     ],
     [
      "22:52",
      "6A to St Osyth and Point Clear",
      "6 hourly to 17:39, then 19:52, 20:52 and 21:52"
     ],
     [
      "21:57",
      "4 Jaywick circular",
      "Every 30 minutes to 19:00, then hourly"
     ],
     [
      "20:23",
      "78 to Brightlingsea",
      "Every 2 hours, arrives 21:12"
     ]
    ],
    "note": "Operator timetable data published through the Bus Open Data Service on 22 October 2026, which is the winter timetable. Summer and show week times can differ, and stops move during the show. Times are from Clacton town centre or the station.",
    "source": [
     "Bus Open Data Service, Department for Transport",
     "https://www.bus-data.dft.gov.uk/"
    ]
   }
  ]
 },
 "southport": {
  "checked": "2026-10-29",
  "rail": [
   {
    "title": "Getting there from Liverpool",
    "rows": [
     [
      "Every 15 min",
      "Liverpool Central to Southport",
      "Merseyrail, at 02, 17, 32 and 47 past the hour on Saturdays, about 47 minutes"
     ],
     [
      "08:02",
      "Liverpool Central to Southport",
      "Arrives 08:49"
     ],
     [
      "08:32",
      "Liverpool Central to Southport",
      "Arrives 09:19"
     ],
     [
      "09:02",
      "Liverpool Central to Southport",
      "Arrives 09:49"
     ],
     [
      "09:32",
      "Liverpool Central to Southport",
      "Arrives 10:19"
     ],
     [
      "Sunday",
      "Every 30 min",
      "Liverpool Central at 02 and 32 past the hour, first 08:02 arriving 08:49"
     ]
    ],
    "note": "From the Merseytravel Northern Line booklet valid from 17 May 2026. The 2027 show will fall in the May 2027 timetable, so treat these as a guide. From Hunts Cross, change at Liverpool Central.",
    "source": [
     "Merseytravel Northern Line timetable booklet",
     "https://www.merseytravel.gov.uk/timetables/rail/northern-line/"
    ]
   },
   {
    "title": "Trains home to Liverpool",
    "rows": [
     [
      "Every 15 min",
      "Southport to Liverpool Central",
      "Saturdays, at 06, 21, 36 and 51 past the hour, about 47 minutes"
     ],
     [
      "17:06",
      "Southport to Liverpool Central",
      "Arrives 17:53"
     ],
     [
      "17:21",
      "Southport to Liverpool Central",
      "Arrives 18:08"
     ],
     [
      "23:08",
      "Southport to Liverpool Central",
      "Arrives 23:55"
     ],
     [
      "23:18",
      "Last train on Saturday",
      "Arrives Liverpool Central 00:05"
     ],
     [
      "Sunday",
      "Every 30 min",
      "Southport at 06 and 36 past the hour, about 46 minutes"
     ],
     [
      "23:18",
      "Last train on Sunday",
      "Arrives Liverpool Central 00:04"
     ]
    ],
    "note": "From the Merseytravel Northern Line booklet valid from 17 May 2026. The 2027 show will fall in the May 2027 timetable, so treat these as a guide. Change at Liverpool Central for Hunts Cross.",
    "source": [
     "Merseytravel Northern Line timetable booklet",
     "https://www.merseytravel.gov.uk/timetables/rail/northern-line/"
    ]
   }
  ],
  "rail-manc": [
   {
    "title": "Getting there on Saturday",
    "rows": [
     [
      "08:09",
      "Manchester Victoria to Southport",
      "Via Atherton and Wigan Wallgate, arrives 09:25"
     ],
     [
      "08:27",
      "Manchester Oxford Road to Southport",
      "Via Bolton and Wigan Wallgate, arrives 09:43"
     ],
     [
      "09:09",
      "Manchester Victoria to Southport",
      "Arrives 10:30"
     ],
     [
      "09:27",
      "Manchester Oxford Road to Southport",
      "Arrives 10:43"
     ],
     [
      "10:09",
      "Manchester Victoria to Southport",
      "Arrives 11:25"
     ],
     [
      "10:27",
      "Manchester Oxford Road to Southport",
      "Arrives 11:43"
     ],
     [
      "Frequency",
      "Two trains an hour",
      "One via Atherton and one via Bolton, about 1 hour 15 minutes"
     ]
    ],
    "note": "From the Northern timetable valid 17 May to 12 December 2026. The 2027 show will fall in the May 2027 timetable, so treat these as a guide.",
    "source": [
     "Northern timetable N14, Manchester to Southport",
     "https://www.northernrailway.co.uk/sites/default/files/templates/N14/2026-05-17-to-2026-12-12-1775569236.pdf"
    ]
   },
   {
    "title": "Trains home on Saturday",
    "rows": [
     [
      "17:03",
      "Southport to Manchester Oxford Road",
      "Via Bolton, arrives 18:18"
     ],
     [
      "17:24",
      "Southport to Manchester Victoria",
      "Via Atherton, arrives 18:49"
     ],
     [
      "18:03",
      "Southport to Manchester Oxford Road",
      "Arrives 19:15"
     ],
     [
      "18:30",
      "Southport to Manchester Victoria",
      "Arrives 19:49"
     ],
     [
      "Then",
      "About every 30 min",
      "19:02, 19:30 and 19:56"
     ],
     [
      "21:03",
      "Southport to Manchester Oxford Road",
      "Arrives 22:15"
     ],
     [
      "22:25",
      "Last train to Manchester",
      "Arrives Manchester Victoria 23:48"
     ],
     [
      "23:10",
      "Southport to Wigan Wallgate",
      "Last train of the night, arrives 23:43"
     ]
    ],
    "note": "From the Northern timetable valid 17 May to 12 December 2026. The 2027 show will fall in the May 2027 timetable, so treat these as a guide.",
    "source": [
     "Northern timetable N14, Manchester to Southport",
     "https://www.northernrailway.co.uk/sites/default/files/templates/N14/2026-05-17-to-2026-12-12-1775569236.pdf"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "09:26",
      "Manchester Victoria to Southport",
      "Arrives 10:44"
     ],
     [
      "11:25",
      "Manchester Victoria to Southport",
      "Arrives 12:44"
     ],
     [
      "Every 2 hours",
      "Direct trains on Sundays",
      "Via Atherton, about 1 hour 20 minutes"
     ],
     [
      "15:38",
      "Southport to Manchester Victoria",
      "Arrives 16:57"
     ],
     [
      "17:38",
      "Southport to Manchester Victoria",
      "Arrives 18:57"
     ],
     [
      "19:38",
      "Southport to Manchester Victoria",
      "Arrives 20:57"
     ],
     [
      "21:38",
      "Last train to Manchester",
      "Arrives Manchester Victoria 22:58"
     ],
     [
      "22:54",
      "Southport to Wigan Wallgate",
      "Last train, arrives 23:26"
     ]
    ],
    "note": "From the Northern timetable valid 17 May to 12 December 2026. The 2027 show will fall in the May 2027 timetable, so treat these as a guide. On Sundays the Bolton to Wigan Wallgate leg is shown as a bus in this timetable. The show is on the bank holiday weekend, so check for engineering work.",
    "source": [
     "Northern timetable N14, Manchester to Southport",
     "https://www.northernrailway.co.uk/sites/default/files/templates/N14/2026-05-17-to-2026-12-12-1775569236.pdf"
    ]
   }
  ],
  "bus-liverpool": [
   {
    "title": "Saturday",
    "rows": [
     [
      "08:49",
      "Stagecoach X2, Liverpool Queen Square to Southport",
      "Arrives Duke Street 10:02"
     ],
     [
      "09:19",
      "Stagecoach X2, Liverpool Queen Square to Southport",
      "Arrives 10:32, then every 30 min"
     ],
     [
      "08:46",
      "Arriva 300, Liverpool Queen Square to Southport",
      "Via Maghull, arrives Leicester Street 10:02"
     ],
     [
      "09:16",
      "Arriva 300, Liverpool Queen Square to Southport",
      "Arrives 10:32, then every 30 min"
     ],
     [
      "17:17",
      "X2, Southport Wellington Street to Liverpool",
      "Arrives 18:35"
     ],
     [
      "18:12",
      "X2, Southport to Liverpool",
      "Arrives 19:20"
     ],
     [
      "20:19",
      "Last X2 to Liverpool",
      "Arrives 21:20"
     ],
     [
      "17:48",
      "300, Southport Union Street to Liverpool",
      "Arrives 19:10"
     ],
     [
      "18:48",
      "Last 300 to Liverpool",
      "Arrives 20:06"
     ]
    ],
    "note": "From the current Lancashire County Council timetable, checked 29 October 2026. Summer 2027 times may change. Some evening X2 journeys run only as far as Formby.",
    "source": [
     "Lancashire County Council bus timetable, X2",
     "https://www.lancashire.gov.uk/roads-parking-and-travel/public-transport/bus-timetables/bus-timetable-service/?service=LAEX002"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "Hourly",
      "X2 and 300 both run on Sundays",
      "About an hour to 1 hour 20 minutes"
     ],
     [
      "09:25",
      "X2, Liverpool Queen Square to Southport",
      "Arrives Duke Street 10:29"
     ],
     [
      "10:25",
      "X2, Liverpool Queen Square to Southport",
      "Arrives 11:29"
     ],
     [
      "09:25",
      "300, Liverpool Queen Square to Southport",
      "Arrives Leicester Street 10:36"
     ],
     [
      "17:08",
      "X2, Southport Wellington Street to Liverpool",
      "Arrives 18:13"
     ],
     [
      "18:08",
      "Last X2 to Liverpool",
      "Arrives 19:10"
     ],
     [
      "16:51",
      "300, Southport Union Street to Liverpool",
      "Arrives 18:12"
     ],
     [
      "17:51",
      "Last 300 to Liverpool",
      "Arrives 19:11"
     ]
    ],
    "note": "From the current Lancashire County Council timetable, checked 29 October 2026. Summer 2027 times may change. Arriva 47 and 44 times were not available from an official source.",
    "source": [
     "Lancashire County Council bus timetable, 300",
     "https://www.lancashire.gov.uk/roads-parking-and-travel/public-transport/bus-timetables/bus-timetable-service/?service=LAAO300"
    ]
   }
  ],
  "bus-preston": [
   {
    "title": "Saturday",
    "rows": [
     [
      "08:15",
      "Stagecoach X2, Preston bus station to Southport",
      "Arrives Wellington Street 09:09"
     ],
     [
      "08:45",
      "X2, Preston to Southport",
      "Arrives 09:41, then every 30 min"
     ],
     [
      "09:00",
      "Stagecoach 2, Preston to Southport",
      "Via Hesketh Bank, arrives 10:18, hourly"
     ],
     [
      "10:20",
      "347, Chorley bus station to Southport",
      "Arrives 11:50, every 2 hours"
     ],
     [
      "17:18",
      "X2, Southport Duke Street to Preston",
      "Arrives 18:11, every 30 min"
     ],
     [
      "22:35",
      "Last X2 to Preston",
      "Arrives 23:21"
     ],
     [
      "17:30",
      "2, Southport Duke Street to Preston",
      "Arrives 18:47, then about hourly"
     ],
     [
      "23:09",
      "Last 2 to Preston",
      "Arrives 00:13"
     ],
     [
      "18:00",
      "Last 347 to Chorley",
      "Arrives 19:21"
     ]
    ],
    "note": "From the current Lancashire County Council timetable, checked 29 October 2026. Summer 2027 times may change.",
    "source": [
     "Lancashire County Council bus timetable, X2",
     "https://www.lancashire.gov.uk/roads-parking-and-travel/public-transport/bus-timetables/bus-timetable-service/?service=LAEX002"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "09:10",
      "X2, Preston to Southport",
      "Arrives 10:01, hourly"
     ],
     [
      "09:45",
      "2, Preston to Southport",
      "Arrives 10:58, hourly"
     ],
     [
      "16:49",
      "X2, Southport Duke Street to Preston",
      "Arrives 17:40, hourly"
     ],
     [
      "20:27",
      "Last X2 to Preston",
      "Arrives 21:11"
     ],
     [
      "17:07",
      "2, Southport Duke Street to Preston",
      "Arrives 18:20, hourly"
     ],
     [
      "21:40",
      "Last 2 to Preston",
      "Arrives 22:45"
     ],
     [
      "No service",
      "347 from Chorley",
      "Does not reach Southport on Sundays"
     ]
    ],
    "note": "From the current Lancashire County Council timetable, checked 29 October 2026. Summer 2027 times may change.",
    "source": [
     "Lancashire County Council bus timetable, service 2",
     "https://www.lancashire.gov.uk/roads-parking-and-travel/public-transport/bus-timetables/bus-timetable-service/?service=LACO002"
    ]
   }
  ],
  "bus-other": [
   {
    "title": "Saturday",
    "rows": [
     [
      "08:43",
      "Arriva 375, Wigan bus station to Southport",
      "Via Ormskirk, arrives Wellington Street 10:30, hourly"
     ],
     [
      "09:13",
      "Arriva 385, Wigan bus station to Southport",
      "Via Ormskirk, arrives 10:58, hourly"
     ],
     [
      "17:07",
      "375, Southport Duke Street to Wigan",
      "Arrives 19:01"
     ],
     [
      "17:50",
      "Last 385 to Wigan",
      "Arrives 19:39"
     ],
     [
      "18:50",
      "375, Southport to Wigan",
      "Arrives 20:22"
     ],
     [
      "20:50",
      "Last 375 to Wigan",
      "Arrives 22:19, Ormskirk about 21:22"
     ],
     [
      "19:00",
      "X37, Southport Union Street to St Helens",
      "Arrives 20:00, the only X37 listed from Southport"
     ]
    ],
    "note": "From the current Lancashire County Council timetable, checked 29 October 2026. Summer 2027 times may change.",
    "source": [
     "Lancashire County Council bus timetable, 375",
     "https://www.lancashire.gov.uk/roads-parking-and-travel/public-transport/bus-timetables/bus-timetable-service/?service=LACO375"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "08:44",
      "375, Wigan bus station to Southport",
      "Arrives Wellington Street 10:39, hourly"
     ],
     [
      "09:44",
      "375, Wigan to Southport",
      "Arrives 11:40"
     ],
     [
      "17:50",
      "375, Southport Duke Street to Wigan",
      "Arrives 19:35"
     ],
     [
      "20:50",
      "Last 375 to Wigan",
      "Arrives 22:19"
     ],
     [
      "No service",
      "385 and X37",
      "Do not run to Southport on Sundays"
     ]
    ],
    "note": "From the current Lancashire County Council timetable, checked 29 October 2026. Summer 2027 times may change.",
    "source": [
     "Lancashire County Council bus timetable, 375",
     "https://www.lancashire.gov.uk/roads-parking-and-travel/public-transport/bus-timetables/bus-timetable-service/?service=LACO375"
    ]
   }
  ]
 },
 "blackpool": {
  "checked": "2026-10-29",
  "rail": [
   {
    "title": "Getting there on Saturday",
    "rows": [
     [
      "09:02",
      "Manchester Piccadilly to Blackpool North",
      "Northern, arrives 10:24"
     ],
     [
      "09:33",
      "Manchester Piccadilly to Blackpool North",
      "Arrives 10:51"
     ],
     [
      "10:02",
      "Manchester Piccadilly to Blackpool North",
      "Arrives 11:23, then every 30 min"
     ],
     [
      "09:39",
      "Liverpool Lime Street to Blackpool North",
      "Arrives 10:57, hourly"
     ],
     [
      "10:39",
      "Liverpool Lime Street to Blackpool North",
      "Arrives 11:57"
     ],
     [
      "From Preston",
      "About 4 trains an hour",
      "About 25 minutes, e.g. 10:28 arriving 10:51"
     ]
    ],
    "note": "From the Northern timetable valid 17 May to 12 December 2026. The 2027 show will fall in the May 2027 timetable, so treat these as a guide.",
    "source": [
     "Northern timetable N27, Blackpool North to Manchester",
     "https://www.northernrailway.co.uk/sites/default/files/templates/N27/2026-05-17-to-2026-12-12-1775569905.pdf"
    ]
   },
   {
    "title": "Trains home on Saturday",
    "rows": [
     [
      "17:56",
      "Blackpool North to Manchester Piccadilly",
      "Arrives 19:16"
     ],
     [
      "18:22",
      "Blackpool North to Manchester Piccadilly",
      "Arrives 19:45"
     ],
     [
      "Then",
      "Every 30 min to Manchester",
      "At about 22 and 58 past the hour"
     ],
     [
      "23:07",
      "Last train to Manchester",
      "Saturdays only, arrives Piccadilly 00:26"
     ],
     [
      "18:05",
      "Blackpool North to Liverpool Lime Street",
      "Arrives 19:18, hourly"
     ],
     [
      "20:05",
      "Blackpool North to Liverpool Lime Street",
      "Arrives 21:20"
     ],
     [
      "22:20",
      "Last train to Liverpool",
      "Arrives 23:49"
     ],
     [
      "23:07",
      "Last train to Preston",
      "Arrives 23:33"
     ]
    ],
    "note": "From the Northern timetable valid 17 May to 12 December 2026. The 2027 show will fall in the May 2027 timetable, so treat these as a guide. After the show the station gets very busy, so a later train can be easier.",
    "source": [
     "Northern timetable N27, Blackpool North to Manchester",
     "https://www.northernrailway.co.uk/sites/default/files/templates/N27/2026-05-17-to-2026-12-12-1775569905.pdf"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "09:02",
      "Manchester Piccadilly to Blackpool North",
      "Arrives 10:24"
     ],
     [
      "08:29",
      "Liverpool Lime Street to Blackpool North",
      "Arrives 10:00"
     ],
     [
      "10:15",
      "Liverpool Lime Street to Blackpool North",
      "Arrives 11:45"
     ],
     [
      "17:54",
      "Blackpool North to Manchester Piccadilly",
      "Arrives 19:19"
     ],
     [
      "18:54",
      "Blackpool North to Manchester Piccadilly",
      "Arrives 20:19, next direct 20:54"
     ],
     [
      "22:24",
      "Last train to Manchester",
      "Arrives Piccadilly 23:46"
     ],
     [
      "18:37",
      "Blackpool North to Liverpool Lime Street",
      "Arrives 20:07"
     ],
     [
      "22:02",
      "Last train to Liverpool",
      "Arrives 23:32"
     ],
     [
      "23:11",
      "Last train to Preston",
      "Arrives 23:35"
     ]
    ],
    "note": "From the Northern timetable valid 17 May to 12 December 2026. The 2027 show will fall in the May 2027 timetable, so treat these as a guide. Direct Sunday trains to Manchester are roughly hourly with some gaps; you can also change at Preston.",
    "source": [
     "Northern timetable N27, Blackpool North to Manchester",
     "https://www.northernrailway.co.uk/sites/default/files/templates/N27/2026-05-17-to-2026-12-12-1775569905.pdf"
    ]
   }
  ],
  "rail-south": [
   {
    "title": "Saturday",
    "rows": [
     [
      "Hourly",
      "Preston to Blackpool Pleasure Beach and Blackpool South",
      "Northern, about 33 minutes"
     ],
     [
      "09:49",
      "Preston to Blackpool Pleasure Beach",
      "Arrives 10:22, Blackpool South 10:25"
     ],
     [
      "10:49",
      "Preston to Blackpool Pleasure Beach",
      "Arrives 11:22"
     ],
     [
      "11:49",
      "Preston to Blackpool Pleasure Beach",
      "Arrives 12:22"
     ],
     [
      "17:32",
      "Blackpool Pleasure Beach to Preston",
      "Arrives 18:11, leaves Blackpool South 17:30"
     ],
     [
      "18:32",
      "Blackpool Pleasure Beach to Preston",
      "Arrives 19:08, then hourly"
     ],
     [
      "23:29",
      "Last train to Preston",
      "Arrives 00:06"
     ]
    ],
    "note": "From the Northern timetable valid 17 May to 12 December 2026. The 2027 show will fall in the May 2027 timetable, so treat these as a guide.",
    "source": [
     "Northern timetable N13, Preston to Blackpool",
     "https://www.northernrailway.co.uk/sites/default/files/templates/N13/2026-05-17-to-2026-12-12-1775569182.pdf"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "Every 2 hours",
      "Sunday service on the South Fylde line",
      "Not hourly on Sundays"
     ],
     [
      "08:35",
      "Preston to Blackpool Pleasure Beach",
      "Arrives 09:08"
     ],
     [
      "10:35",
      "Preston to Blackpool Pleasure Beach",
      "Arrives 11:08"
     ],
     [
      "12:35",
      "Preston to Blackpool Pleasure Beach",
      "Arrives 13:08"
     ],
     [
      "17:18",
      "Blackpool Pleasure Beach to Preston",
      "Arrives 17:54"
     ],
     [
      "19:18",
      "Blackpool Pleasure Beach to Preston",
      "Arrives 19:54"
     ],
     [
      "21:20",
      "Last train to Preston",
      "Arrives 21:57"
     ]
    ],
    "note": "From the Northern timetable valid 17 May to 12 December 2026. The 2027 show will fall in the May 2027 timetable, so treat these as a guide.",
    "source": [
     "Northern timetable N13, Preston to Blackpool",
     "https://www.northernrailway.co.uk/sites/default/files/templates/N13/2026-05-17-to-2026-12-12-1775569182.pdf"
    ]
   }
  ],
  "bus": [
   {
    "title": "Saturday",
    "rows": [
     [
      "09:55",
      "Stagecoach 61, Preston bus station to Blackpool",
      "Via Kirkham, arrives Corporation Street 11:13, every 30 min"
     ],
     [
      "09:30",
      "Stagecoach 68, Preston bus station to Blackpool",
      "Via Warton, arrives Market Street 11:02, every 20 min"
     ],
     [
      "09:20",
      "Stagecoach 42, Lancaster bus station to Blackpool",
      "Via Garstang, arrives Abingdon Street 11:02, hourly"
     ],
     [
      "18:30",
      "61, Corporation Street to Preston",
      "Arrives 19:35, then hourly"
     ],
     [
      "23:15",
      "Last 61 to Preston",
      "Arrives 00:15"
     ],
     [
      "18:10",
      "68, Market Street to Preston",
      "Arrives 19:38, then every 30 min to 20:00"
     ],
     [
      "23:00",
      "Last 68 to Preston",
      "Arrives 00:15"
     ],
     [
      "19:15",
      "42, Abingdon Street to Lancaster",
      "Arrives 20:36"
     ],
     [
      "23:00",
      "Last 42 to Lancaster",
      "Arrives 00:21"
     ]
    ],
    "note": "From the current Lancashire County Council timetable, checked 29 October 2026. Summer 2027 times may change. Buses were diverted away from the promenade on the 2026 show days.",
    "source": [
     "Lancashire County Council bus timetable, 61",
     "https://www.lancashire.gov.uk/roads-parking-and-travel/public-transport/bus-timetables/bus-timetable-service/?service=LAAO061"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "10:10",
      "61, Preston to Blackpool",
      "Arrives Corporation Street 11:24, hourly"
     ],
     [
      "10:20",
      "68, Preston to Blackpool",
      "Arrives Market Street 11:50, every 30 min"
     ],
     [
      "10:30",
      "42, Lancaster to Blackpool",
      "Arrives Abingdon Street 12:12, hourly"
     ],
     [
      "19:27",
      "Last 61 to Preston",
      "Arrives 20:35"
     ],
     [
      "18:55",
      "68, Market Street to Preston",
      "Arrives 20:20"
     ],
     [
      "20:15",
      "Last 68 to Preston",
      "Arrives 21:29"
     ],
     [
      "20:15",
      "Last 42 to Lancaster",
      "Arrives 21:16"
     ],
     [
      "Every 30 min",
      "Blackpool Transport 11 from Lytham",
      "Sundays, about 50 minutes to Market Street"
     ]
    ],
    "note": "From the current Lancashire County Council timetable, checked 29 October 2026. Summer 2027 times may change.",
    "source": [
     "Lancashire County Council bus timetable, 68",
     "https://www.lancashire.gov.uk/roads-parking-and-travel/public-transport/bus-timetables/bus-timetable-service/?service=LADO068"
    ]
   },
   {
    "title": "Trams on show days",
    "rows": [
     [
      "Every 12 min",
      "Starr Gate to Manchester Square",
      "2026 show days, split service"
     ],
     [
      "Every 7 min",
      "Little Bispham to North Station",
      "Extra trams on the 2026 show days"
     ],
     [
      "Split",
      "North Pier to Fleetwood",
      "No trams at the Tower or Central Pier"
     ],
     [
      "10:30 to 19:00",
      "Promenade closed to traffic",
      "Both days in 2026"
     ]
    ],
    "note": "From Blackpool Transport's 2026 air show plans, published 29 July 2026. Arrangements for 2027 will be announced nearer the show.",
    "source": [
     "Blackpool Transport sets out airshow plans",
     "https://www.blackpooltransport.com/blackpool-transport-sets-out-airshow-plans"
    ]
   }
  ]
 },
 "ayr": {
  "checked": "2026-10-29",
  "rail": [
   {
    "title": "Show Saturday in 2026",
    "rows": [
     [
      "3 an hour",
      "Glasgow Central to Ayr",
      "ScotRail stopping trains on the 2026 show Saturday"
     ],
     [
      "Hourly",
      "Express Glasgow Central to Ayr",
      "Calling only at Paisley Gilmour Street, Johnstone and Kilwinning"
     ],
     [
      "Before and after",
      "Extra Kilwinning to Ayr shuttles",
      "Calling at Irvine, Barassie, Troon, Prestwick and Newton-on-Ayr"
     ],
     [
      "After the show",
      "Queue system at Ayr station",
      "Run by ScotRail in 2026"
     ],
     [
      "All day",
      "Kilmarnock to Ayr",
      "Rail replacement buses in 2026"
     ]
    ],
    "note": "From ScotRail's 2026 Ayr Show travel advice. Extra trains for 2027 will be announced nearer the show.",
    "source": [
     "ScotRail: enhanced timetable for the International Ayr Show",
     "https://www.scotrail.co.uk/about-scotrail/news/scotrail-delivers-enhanced-timetable-international-ayr-show"
    ]
   },
   {
    "title": "Normal service",
    "rows": [
     [
      "Up to 41 a day",
      "Glasgow Central to Ayr",
      "ScotRail, about 54 minutes on average"
     ],
     [
      "00:15",
      "Last train from Glasgow Central",
      "Based on ScotRail's Monday timetable"
     ]
    ],
    "note": "From ScotRail's route page, which is based on a Monday timetable. Weekend and evening times were not available from an official timetable, so please check before the Friday evening show.",
    "source": [
     "ScotRail train times, Glasgow Central to Ayr",
     "https://www.scotrail.co.uk/train-times/glasgow-central-to-ayr"
    ]
   }
  ],
  "rail-north": [
   {
    "title": "Show Saturday in 2026",
    "rows": [
     [
      "Before and after",
      "Extra Kilwinning to Ayr shuttles",
      "Called at Prestwick and Newton-on-Ayr, as well as Irvine, Barassie and Troon"
     ],
     [
      "Hourly",
      "Glasgow Central to Ayr express",
      "Did not call at Prestwick or Newton-on-Ayr"
     ]
    ],
    "note": "From ScotRail's 2026 Ayr Show travel advice. Prestwick here means the station ScotRail names in that advice.",
    "source": [
     "ScotRail: enhanced timetable for the International Ayr Show",
     "https://www.scotrail.co.uk/about-scotrail/news/scotrail-delivers-enhanced-timetable-international-ayr-show"
    ]
   }
  ],
  "bus": [
   {
    "title": "Stagecoach X77",
    "rows": [
     [
      "Every 20 min",
      "Stagecoach X77, Glasgow to Ayr",
      "Via Prestwick and Monkton"
     ],
     [
      "Late buses",
      "Fridays and Saturdays",
      "Stagecoach says late services run on these nights"
     ]
    ],
    "note": "From Stagecoach's X77 page. Exact times and last buses were not available from an official timetable I could open.",
    "source": [
     "Stagecoach: Ayr to Glasgow X77",
     "https://www.stagecoachbus.com/promos-and-offers/west-scotland/ayr-to-glasgow-x77"
    ]
   }
  ]
 },
 "wales": {
  "checked": "2026-10-29",
  "pr": [
   {
    "title": "Park and Ride in 2026",
    "rows": [
     [
      "08:00",
      "Fabian Way car park opens",
      "SA1 8LD, £10 a car in 2026"
     ],
     [
      "Saturday",
      "Buses 09:00 to 22:30",
      "To and from the Civic Centre"
     ],
     [
      "Sunday",
      "Buses 08:30 to 20:00",
      "To and from the Civic Centre"
     ]
    ],
    "note": "These are the official 2026 hours. The 2027 Park and Ride times have not been published yet, and no individual bus times were given.",
    "source": [
     "Visit Swansea Bay: Wales Airshow parking",
     "https://www.visitswanseabay.com/wales-airshow-parking/"
    ]
   }
  ],
  "rail": [
   {
    "title": "Getting there on Saturday",
    "rows": [
     [
      "06:48",
      "London Paddington to Swansea",
      "GWR, arrives 09:31, via Reading, Bristol Parkway and Cardiff"
     ],
     [
      "07:48",
      "London Paddington to Swansea",
      "GWR, arrives 10:30"
     ],
     [
      "08:48",
      "London Paddington to Swansea",
      "GWR, arrives 11:33"
     ],
     [
      "07:26",
      "Cardiff Central to Swansea",
      "Transport for Wales, arrives 08:21"
     ],
     [
      "08:51",
      "Cardiff Central to Swansea",
      "Transport for Wales, arrives 09:59"
     ],
     [
      "10:07",
      "Cardiff Central to Swansea",
      "Transport for Wales, arrives 11:03"
     ],
     [
      "08:30",
      "Carmarthen to Swansea",
      "Transport for Wales, Llanelli 08:59, arrives 09:18"
     ],
     [
      "09:30",
      "Carmarthen to Swansea",
      "GWR, Llanelli 09:58, arrives 10:15"
     ],
     [
      "Frequency",
      "Cardiff and Llanelli to Swansea",
      "Around three trains an hour from Cardiff, about 55 to 70 minutes; London about 2 hours 45 minutes, hourly"
     ]
    ],
    "note": "From the Transport for Wales timetable valid 14 September to 13 December 2026, which includes the GWR trains. The July 2027 show falls in the May 2027 timetable, so check nearer the time. In 2026 there was engineering work on the airshow weekend.",
    "source": [
     "Transport for Wales timetable: West Wales, Swansea and Cardiff",
     "https://tfw.wales/sites/default/files/2026-09/7_West-Wales-Swansea-Cardiff_September-2026_V1.pdf"
    ]
   },
   {
    "title": "Trains home on Saturday",
    "rows": [
     [
      "17:23",
      "Swansea to London Paddington",
      "GWR, Cardiff 18:16, London 20:13"
     ],
     [
      "17:29",
      "Swansea to Cardiff Central",
      "Transport for Wales, arrives 18:38"
     ],
     [
      "17:52",
      "Swansea to Cardiff Central",
      "Transport for Wales, arrives 18:45"
     ],
     [
      "18:23",
      "Swansea to London Paddington",
      "GWR, London 21:12"
     ],
     [
      "19:22",
      "Swansea to London Paddington",
      "GWR, last direct train to London, arrives 22:14"
     ],
     [
      "Then",
      "Two or three trains an hour to Cardiff",
      "Including 20:22 GWR to Bristol Parkway, 20:47 and 21:33"
     ],
     [
      "22:36",
      "Swansea to Cardiff Central",
      "Last train east after the evening show, arrives 23:43"
     ],
     [
      "17:26",
      "Swansea to Carmarthen",
      "Transport for Wales, Llanelli 17:46, Carmarthen 18:21"
     ],
     [
      "Then",
      "Two or three an hour until about 19:00, then about hourly",
      "Including 18:45, 19:46, 20:05, 20:52 and 22:06"
     ],
     [
      "23:44",
      "Swansea to Carmarthen",
      "Last train west, Llanelli 00:02, Carmarthen 00:33; also 22:40 and 23:07"
     ]
    ],
    "note": "From the Transport for Wales timetable valid 14 September to 13 December 2026, which includes the GWR trains. The July 2027 show falls in the May 2027 timetable, so check nearer the time. After the evening show there is no train to London that night.",
    "source": [
     "Transport for Wales timetable: West Wales, Swansea and Cardiff",
     "https://tfw.wales/sites/default/files/2026-09/7_West-Wales-Swansea-Cardiff_September-2026_V1.pdf"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "08:33",
      "London Paddington to Swansea",
      "GWR, arrives 11:22"
     ],
     [
      "08:04",
      "Cardiff Central to Swansea",
      "Transport for Wales, arrives 09:03"
     ],
     [
      "09:53",
      "Cardiff Central to Swansea",
      "Transport for Wales, arrives 10:59"
     ],
     [
      "09:34",
      "Carmarthen to Swansea",
      "Transport for Wales, Llanelli 09:59, arrives 10:17"
     ],
     [
      "17:22",
      "Swansea to London Paddington",
      "GWR, Cardiff 18:17, London 20:09"
     ],
     [
      "17:37",
      "Swansea to Cardiff Central",
      "Transport for Wales, arrives 18:34"
     ],
     [
      "18:23",
      "Swansea to London Paddington",
      "GWR, London 21:14; also 19:24, London 22:14"
     ],
     [
      "20:20",
      "Swansea to London Paddington",
      "GWR, last direct train to London, arrives 23:27"
     ],
     [
      "23:27",
      "Swansea to Cardiff Central",
      "Last train east, arrives 00:30; also 20:37 and 22:05"
     ],
     [
      "17:06",
      "Swansea to Carmarthen",
      "Then 18:44, 19:14, 20:57, 21:19, 22:51 and last 23:34"
     ]
    ],
    "note": "From the Transport for Wales timetable valid 14 September to 13 December 2026, which includes the GWR trains. The July 2027 show falls in the May 2027 timetable, so check nearer the time. Sunday trains are less frequent, roughly hourly in each direction.",
    "source": [
     "Transport for Wales timetable: West Wales, Swansea and Cardiff",
     "https://tfw.wales/sites/default/files/2026-09/7_West-Wales-Swansea-Cardiff_September-2026_V1.pdf"
    ]
   }
  ],
  "bus": [
   {
    "title": "Buses along the bay: 2, 2A and 3A",
    "rows": [
     [
      "Route",
      "First Cymru 2, 2A and 3A",
      "Swansea Bus Station to Mumbles (Oystermouth Square), stops at Swansea Crown Court"
     ],
     [
      "Saturday",
      "3A every 30 minutes, 2 hourly",
      "Mumbles to the city from 07:44, about 25 to 40 minutes"
     ],
     [
      "Sunday",
      "2A and 3A, each hourly",
      "3A from Mumbles 09:53, 2A from Mumbles 10:48"
     ],
     [
      "Sat 17:30",
      "Bus Station to Mumbles",
      "3A at 17:30, 18:00, 18:25, 19:15, 20:55"
     ],
     [
      "Sat 22:30",
      "Last 3A to Mumbles",
      "Arrives Oystermouth Square 23:08; last route 2 at 18:40"
     ],
     [
      "Sun 17:00",
      "Bus Station to Mumbles",
      "3A 17:00, 2A 17:30, 2A 18:30"
     ],
     [
      "Sun 18:40",
      "Last 3A to Mumbles",
      "Last 2A at 18:30"
     ]
    ],
    "note": "From the First Cymru Saturday timetables valid from 28 February 2026 and Sunday timetables valid from 22 February 2026. In 2026 Oystermouth Road was closed for the show, routes 1, 2, 2A and 3A used Sketty Lane instead of Singleton, and 4, 4A and X1 were suspended between the Bus Station and Singleton Hospital. Expect diversions and delays, and check for any late extra buses.",
    "source": [
     "First Cymru timetables",
     "https://www.firstbus.co.uk/south-west-wales/plan-journey/timetables"
    ]
   }
  ]
 },
 "headcorn": {
  "checked": "2026-10-29",
  "rail-headcorn": [
   {
    "title": "Getting there on Saturday",
    "rows": [
     [
      "07:04",
      "London Charing Cross to Headcorn",
      "Southeastern, Headcorn 08:11, via London Bridge, Sevenoaks and Tonbridge"
     ],
     [
      "07:34",
      "London Charing Cross to Headcorn",
      "Headcorn 08:41"
     ],
     [
      "08:04",
      "London Charing Cross to Headcorn",
      "Headcorn 09:11"
     ],
     [
      "08:34",
      "London Charing Cross to Headcorn",
      "Headcorn 09:41"
     ],
     [
      "Every 30 min",
      "At 04 and 34 past from Charing Cross",
      "About 1 hour 7 minutes; Tonbridge to Headcorn about 23 minutes"
     ]
    ],
    "note": "From the Southeastern timetable valid from Saturday 19 December 2026 to 15 May 2027. The June 2027 show falls in the May 2027 timetable, so check nearer the time.",
    "source": [
     "Southeastern timetables, Table 1",
     "https://www.southeasternrailway.co.uk/travel-information/plan-your-journey/timetables"
    ]
   },
   {
    "title": "Trains home on Saturday",
    "rows": [
     [
      "17:13",
      "Headcorn to London Charing Cross",
      "Southeastern, arrives 18:24"
     ],
     [
      "17:43",
      "Headcorn to London Charing Cross",
      "Arrives 18:54"
     ],
     [
      "18:13",
      "Headcorn to London Charing Cross",
      "Arrives 19:24"
     ],
     [
      "Then",
      "Every 30 minutes, at 13 and 43 past",
      "About 1 hour 11 minutes, all via Tonbridge and London Bridge"
     ],
     [
      "22:13",
      "Headcorn to London Charing Cross",
      "Last direct train to London, arrives 23:24"
     ],
     [
      "22:43",
      "Headcorn to Tonbridge",
      "Arrives 23:06, does not go on to London"
     ]
    ],
    "note": "From the Southeastern timetable valid from Saturday 19 December 2026 to 15 May 2027. The June 2027 show falls in the May 2027 timetable, so check nearer the time.",
    "source": [
     "Southeastern timetables, Table 1",
     "https://www.southeasternrailway.co.uk/travel-information/plan-your-journey/timetables"
    ]
   },
   {
    "title": "Sunday",
    "rows": [
     [
      "08:34",
      "London Charing Cross to Headcorn",
      "Southeastern, Headcorn 09:41"
     ],
     [
      "09:34",
      "London Charing Cross to Headcorn",
      "Headcorn 10:41"
     ],
     [
      "10:04",
      "London Charing Cross to Headcorn",
      "Headcorn 11:11, then every 30 minutes"
     ],
     [
      "17:13",
      "Headcorn to London Charing Cross",
      "Arrives 18:21"
     ],
     [
      "17:43",
      "Headcorn to London Charing Cross",
      "Arrives 18:51"
     ],
     [
      "Then",
      "Every 30 minutes until 21:13",
      "Including 18:13, 18:44, 19:13 and 20:44"
     ],
     [
      "22:13",
      "Headcorn to London Charing Cross",
      "Last direct train to London, arrives 23:21"
     ],
     [
      "23:16",
      "Headcorn to Tonbridge",
      "Arrives 23:39"
     ]
    ],
    "note": "From the Southeastern timetable valid from Sunday 13 December 2026 to 9 May 2027. The June 2027 show falls in the May 2027 timetable, so check nearer the time. Before 10:00 trains from London are hourly on Sundays.",
    "source": [
     "Southeastern timetables, Table 1",
     "https://www.southeasternrailway.co.uk/travel-information/plan-your-journey/timetables"
    ]
   }
  ],
  "rail-ashford": [
   {
    "title": "Via Ashford on Saturday",
    "rows": [
     [
      "07:40",
      "St Pancras to Ashford International",
      "Southeastern high speed, arrives 08:18, then 08:30 to Headcorn, arrives 08:43"
     ],
     [
      "08:40",
      "St Pancras to Ashford International",
      "Arrives 09:18, then 09:30 to Headcorn, arrives 09:43"
     ],
     [
      "09:40",
      "St Pancras to Ashford International",
      "Arrives 10:18, then 10:30 to Headcorn, arrives 10:43"
     ],
     [
      "Every 30 min",
      "Ashford to Headcorn",
      "At about 00 and 30 past, 11 to 13 minutes"
     ],
     [
      "17:41",
      "Headcorn to Ashford, arrives 17:56",
      "Then 18:16 high speed to St Pancras, arrives 18:54"
     ],
     [
      "18:11",
      "Headcorn to Ashford, arrives 18:22",
      "Then 18:40 to St Pancras, arrives 19:18"
     ],
     [
      "Then",
      "High speed trains at 16 and 40 past",
      "Ashford to St Pancras about 38 minutes"
     ],
     [
      "22:41",
      "Headcorn to Ashford, arrives 22:56",
      "Then 23:16, the last high speed train, St Pancras 23:54"
     ]
    ],
    "note": "From the Southeastern timetable valid from Saturday 19 December 2026 to 15 May 2027. The June 2027 show falls in the May 2027 timetable, so check nearer the time.",
    "source": [
     "Southeastern timetables, Tables 1 and 8",
     "https://www.southeasternrailway.co.uk/travel-information/plan-your-journey/timetables"
    ]
   },
   {
    "title": "Via Ashford on Sunday",
    "rows": [
     [
      "08:40",
      "St Pancras to Ashford International",
      "Arrives 09:18, then 09:30 to Headcorn, arrives 09:43"
     ],
     [
      "09:40",
      "St Pancras to Ashford International",
      "Arrives 10:18, then 10:30 to Headcorn, arrives 10:43"
     ],
     [
      "17:41",
      "Headcorn to Ashford, arrives 17:56",
      "Then 18:16 to St Pancras, arrives 18:54"
     ],
     [
      "18:11",
      "Headcorn to Ashford, arrives 18:22",
      "Then 18:40 to St Pancras, arrives 19:18"
     ],
     [
      "22:11",
      "Headcorn to Ashford, arrives 22:22",
      "Then 22:40, the last high speed train, St Pancras 23:18"
     ]
    ],
    "note": "From the Southeastern timetable valid from Sunday 13 December 2026 to 9 May 2027. The June 2027 show falls in the May 2027 timetable, so check nearer the time.",
    "source": [
     "Southeastern timetables, Tables 1 and 8",
     "https://www.southeasternrailway.co.uk/travel-information/plan-your-journey/timetables"
    ]
   }
  ]
 }
};

var CSS = '.ttx{margin-top:14px;padding:14px;border-radius:12px;background:#F6F9FC!important;border:1px solid #D6DEE8;display:grid;gap:8px;color:#101A22!important;text-align:left}'
 +'.ttx *{text-transform:none!important;letter-spacing:normal!important}'
 +'.ttx .ttx-head{font-family:Barlow,sans-serif!important;font-size:16px!important;font-weight:700!important;color:#13293C!important;margin:0!important;padding:0!important}'
 +'.ttx details{border:1px solid #D6DEE8!important;border-radius:10px;background:#FFFFFF!important;overflow:hidden;margin:0!important}'
 +'.ttx summary{cursor:pointer;list-style:none;padding:10px 14px!important;font-family:Barlow,sans-serif!important;font-weight:700!important;font-size:15px!important;color:#13293C!important;display:flex;justify-content:space-between;gap:10px;align-items:center;background:none!important}'
 +'.ttx summary::-webkit-details-marker{display:none}'
 +'.ttx summary:after{content:"+";font-size:20px;line-height:1;color:#D74949}'
 +'.ttx details[open] summary:after{content:"\\2212"}'
 +'.ttx .ttx-rows{padding:0 14px 10px}'
 +'.ttx .ttx-row{display:grid;grid-template-columns:96px 1fr;gap:2px 12px;padding:7px 0;border-top:1px solid #E3E9F0;font-size:14px;line-height:1.4}'
 +'.ttx .ttx-row b{font-weight:700!important;color:#13293C!important}'
 +'.ttx .ttx-row span{color:#101A22!important}'
 +'.ttx .ttx-row em{grid-column:2;font-style:normal!important;color:#44535F!important;font-size:13px}'
 +'.ttx .ttx-note,.ttx .ttx-foot{font-size:13px!important;color:#44535F!important;margin:6px 0 0!important;line-height:1.45!important;opacity:1!important;transform:none!important}'
 +'.ttx .ttx-foot{margin:0!important}'
 +'.ttx a{color:#13293C!important;font-weight:600;text-decoration:underline}'
 +'@media (max-width:420px){.ttx{padding:12px}.ttx .ttx-row{grid-template-columns:1fr}.ttx .ttx-row em{grid-column:1}}';

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function css(){ if(document.getElementById('ttx-css')) return; var st=document.createElement('style'); st.id='ttx-css'; st.textContent=CSS; (document.head||document.documentElement).appendChild(st); }
function fmtDate(iso){ var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||''); if(!m) return ''; var mo=['January','February','March','April','May','June','July','August','September','October','November','December'][+m[2]-1]; return (+m[3])+' '+mo+' '+m[1]; }

function render(show, id){
  var s=DATA[show]; if(!s||!s[id]||!s[id].length) return '';
  css();
  var h='<div class="ttx"><p class="ttx-head">Train and bus times</p>';
  s[id].forEach(function(t,i){
    h+='<details'+(i===0?' open':'')+'><summary>'+esc(t.title)+'</summary><div class="ttx-rows">';
    (t.rows||[]).forEach(function(r){ h+='<div class="ttx-row"><b>'+esc(r[0])+'</b><span>'+esc(r[1])+'</span><em>'+esc(r[2])+'</em></div>'; });
    if(t.note||t.source){
      h+='<p class="ttx-note">'+esc(t.note||'');
      if(t.source&&t.source[1]) h+=' Source: <a href="'+esc(t.source[1])+'" target="_blank" rel="noopener">'+esc(t.source[0]||'operator timetable')+'</a>.';
      h+='</p>';
    }
    h+='</div></details>';
  });
  h+='<p class="ttx-foot">Times checked '+esc(fmtDate(s.checked))+'. Timetables change, and the summer 2027 times are usually published in the spring, so I would check with the operator or National Rail before you travel, especially for the journey home.</p></div>';
  return h;
}
window.UKAG_TT={data:DATA,render:render};
})();
