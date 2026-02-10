#!/usr/bin/env python
import csv
import json
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
from meteostat import Point, normals, stations

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

AIRPORTS_URL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat"
ROUTES_URL = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat"

AIRPORTS_FILE = DATA_DIR / "airports.dat"
ROUTES_FILE = DATA_DIR / "routes.dat"
CACHE_FILE = DATA_DIR / "climate_cache.json"

MONTHS = [1, 4, 7, 10]
REQUIRED_COLUMNS = ["temp", "prcp", "pres"]
MAX_AIRPORTS = 100


def download_file(url: str, path: Path) -> None:
    if path.exists():
        return
    import urllib.request

    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request) as response, path.open("wb") as file_handle:
        file_handle.write(response.read())


def load_airports(path: Path) -> Dict[str, Tuple[float, float]]:
    airports = {}
    with path.open("r", encoding="utf-8") as file_handle:
        reader = csv.reader(file_handle)
        for row in reader:
            if len(row) < 8:
                continue
            iata = row[4].strip().upper()
            if len(iata) != 3 or iata == "\\N":
                continue
            try:
                lat = float(row[6])
                lon = float(row[7])
            except ValueError:
                continue
            airports[iata] = (lat, lon)
    return airports


def load_routes(path: Path) -> Tuple[List[Tuple[str, str]], Dict[str, int]]:
    pairs = set()
    counts: Dict[str, int] = {}
    with path.open("r", encoding="utf-8") as file_handle:
        reader = csv.reader(file_handle)
        for row in reader:
            if len(row) < 9:
                continue
            source = row[2].strip().upper()
            dest = row[4].strip().upper()
            stops = row[7].strip()
            if stops != "0":
                continue
            if len(source) != 3 or len(dest) != 3:
                continue
            if source == "\\N" or dest == "\\N":
                continue
            pair = tuple(sorted((source, dest)))
            pairs.add(pair)
            counts[source] = counts.get(source, 0) + 1
            counts[dest] = counts.get(dest, 0) + 1
    return list(pairs), counts


def load_cache() -> Dict[str, Dict[str, List[float]]]:
    if not CACHE_FILE.exists():
        return {}
    with CACHE_FILE.open("r", encoding="utf-8") as file_handle:
        return json.load(file_handle)


def save_cache(cache: Dict[str, Dict[str, List[float]]]) -> None:
    with CACHE_FILE.open("w", encoding="utf-8") as file_handle:
        json.dump(cache, file_handle)


def get_climate_vectors(
    airport: str,
    coords: Tuple[float, float],
    cache: Dict[str, Dict[str, List[float]]],
) -> Dict[int, np.ndarray]:
    if airport in cache:
        return {int(month): np.array(values, dtype=float) for month, values in cache[airport].items()}

    point = Point(coords[0], coords[1])
    nearby = stations.nearby(point)
    if nearby.empty:
        return {}
    station_id = nearby.index[0]
    normals_series = normals(station_id, start=1991, end=2020)
    normals_df = normals_series.fetch()
    if normals_df is None or normals_df.empty:
        return {}

    vectors = {}
    for month in MONTHS:
        if month not in normals_df.index:
            continue
        row = normals_df.loc[month]
        if any(col not in normals_df.columns for col in REQUIRED_COLUMNS):
            return {}
        if any(pd.isna(row[col]) for col in REQUIRED_COLUMNS):
            continue
        vector = row[REQUIRED_COLUMNS].astype(float).to_numpy()
        vectors[month] = vector

    if vectors:
        cache[airport] = {str(month): vector.tolist() for month, vector in vectors.items()}
    return vectors


def cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return 1.0 - float(np.dot(a, b) / denom)


if __name__ == "__main__":

    download_file(AIRPORTS_URL, AIRPORTS_FILE)
    download_file(ROUTES_URL, ROUTES_FILE)

    airports = load_airports(AIRPORTS_FILE)
    routes, route_counts = load_routes(ROUTES_FILE)

    cache = load_cache()

    airports_in_routes = {
        airport for airport, _ in sorted(route_counts.items(), key=lambda item: item[1], reverse=True)[:MAX_AIRPORTS]
    }

    climate_vectors = {}
    for airport in sorted(airports_in_routes):
        coords = airports.get(airport)
        if not coords:
            continue
        vectors = get_climate_vectors(airport, coords, cache)
        if vectors:
            climate_vectors[airport] = vectors

    save_cache(cache)

    best = {month: (None, None, -1.0) for month in MONTHS}

    for source, dest in routes:
        if source not in airports_in_routes or dest not in airports_in_routes:
            continue
        source_vectors = climate_vectors.get(source)
        dest_vectors = climate_vectors.get(dest)
        if not source_vectors or not dest_vectors:
            continue
        for month in MONTHS:
            if month not in source_vectors or month not in dest_vectors:
                continue
            distance = cosine_distance(source_vectors[month], dest_vectors[month])
            current = best[month]
            if distance > current[2]:
                best[month] = (source, dest, distance)

    print(f"Evaluated top {len(airports_in_routes)} airports by route count.")
    print("Top climate differences by month (cosine distance):")
    for month in MONTHS:
        source, dest, distance = best[month]
        print(f"Month {month}: {source}-{dest} -> {distance:.4f}")

    overall = max(best.items(), key=lambda item: item[1][2])
    month, (source, dest, distance) = overall
    print("\nOverall max:")
    print(f"{source}-{dest} in month {month} -> {distance:.4f}")
