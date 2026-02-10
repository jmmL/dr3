# Climate difference search result (sampled)

Method summary:
- Direct flight segments from OpenFlights routes dataset.
- Airport coordinates from OpenFlights airports dataset.
- Climate normals (1991–2020) from Meteostat via nearest weather station.
- Climate vector per month: temperature, precipitation, pressure.
- Cosine distance computed between vectors for Jan/Apr/Jul/Oct.
- Search limited to top 100 airports by route count to keep runtime reasonable.

Result (max cosine distance in sampled set):
- JED–KUL in April.

Per-month maxima (sampled set):
- January: KUL–PEK
- April: JED–KUL
- July: CAN–JED
- October: JED–KUL
