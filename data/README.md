# Data Directory

This directory contains the project's data files and structures.

## 📁 Directory Structure

```
data/
├── parquet/          # Optimized Parquet data files for analytics
└── README.md         # This file
```

## 📊 Data Overview

### Parquet Files (`parquet/`)
- **Purpose**: Optimized columnar data storage for fast analytics
- **Format**: Apache Parquet format for efficient querying
- **Usage**: Used by the Django backend for real-time data processing
- **Size**: ~2.6GB consolidated dataset
- **Records**: 5M+ awarded contracts from 2013-2025

### Data Sources
- **Primary**: PhilGEPS contract data (XLSX/CSV files)
- **Extended**: Sumbong sa Pangulo flood control projects (2022-2025)
- **Coverage**: 13+ years of Philippine government procurement data

### Data Pipeline
The data processing pipeline is documented in [`scripts/DATA_PIPELINE.md`](../scripts/DATA_PIPELINE.md).

## 🔧 Configuration

### Environment Variables
- `PARQUET_DIR`: Path to parquet data directory (default: `/data/parquet` in containers)

### Docker Integration
- **Development**: Data is mounted as volume for live updates
- **Production**: Data can be baked into container image or mounted

## 📈 Statistics
- **Contract Value**: ₱14.8T+ across all contracts
- **Entities**: 119K+ contractors, 23K+ government organizations
- **Coverage**: 542+ delivery areas across the Philippines
- **Timeline**: 2013-2025 (13 years of procurement data)

## 🔍 Data Quality
- **Awarded Contracts Only**: No duplicate counting
- **Data Validation**: Automated quality checks
- **Standardization**: Consistent data formats
- **Deduplication**: Removed exact duplicates

---

*For detailed data processing information, see the [Data Pipeline Documentation](../scripts/DATA_PIPELINE.md).*