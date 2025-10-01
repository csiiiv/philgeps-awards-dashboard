#!/usr/bin/env python3
"""
Configuration file for data generation scripts
Centralizes all hardcoded values and makes them configurable
"""

# Chunk Generation Configuration
CHUNK_SIZE = 200
MAX_CATEGORIES = 169
MAX_CONTRACTORS = 200

# Data Limits for Preprocessing
CATEGORIES_LIMIT = 3000
CONTRACTORS_LIMIT = 3000
DETAILED_CONTRACTS_LIMIT = 10000

# Subdata Limits (for enriching chunks)
ORGANIZATIONS_LIMIT = 1000
AREAS_LIMIT = 1000
CONTRACTS_LIMIT = 1000

# Time Range Configuration
DEFAULT_YEARS = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
QUARTERLY_YEARS = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]
DEFAULT_QUARTERS = [1, 2, 3, 4]

# File Paths - Sprint 24 Unified Parquet Architecture
DATA_SOURCE = "data/processed/clean_awarded_contracts_complete.parquet"
OUTPUT_DIR = "data"
PARQUET_DIR = "data/parquet"
GENERATED_DIR = "data/generated"

# Parquet Directories
YEARLY_PARQUET_DIR = "data/parquet/yearly"
QUARTERLY_PARQUET_DIR = "data/parquet/quarterly"

# Frontend Data Directory
FRONTEND_DATA_DIR = "frontend/public"

def get_chunk_ranges(max_items, chunk_size):
    """Generate chunk ranges for given max items and chunk size"""
    ranges = []
    for start in range(1, max_items + 1, chunk_size):
        end = min(start + chunk_size - 1, max_items)
        ranges.append((start, end))
    return ranges

def get_yearly_ranges(years, max_contractors, chunk_size):
    """Generate yearly chunk ranges"""
    ranges = []
    for year in years:
        for start, end in get_chunk_ranges(max_contractors, chunk_size):
            ranges.append((year, start, end))
    return ranges

def get_quarterly_ranges(years, quarters, max_contractors, chunk_size):
    """Generate quarterly chunk ranges"""
    ranges = []
    for year in years:
        for quarter in quarters:
            for start, end in get_chunk_ranges(max_contractors, chunk_size):
                ranges.append((year, quarter, start, end))
    return ranges
