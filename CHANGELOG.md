# Changelog

All notable changes to the PhilGEPS Awards Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.2] - 2025-01-02

### What Changed
- Made it clear that we have 15.5M total records but only 5M are actual awarded contracts worth ₱14.8T
- Added proper attribution for flood control data from "Sumbong sa Pangulo" dataset
- Updated README to distinguish between all procurement data vs awarded contracts only

### Why It Matters
- Users were confused about what data they were looking at
- Financial totals were misleading without context about awarded vs non-awarded contracts
- Data sources weren't properly credited

## [3.0.1] - 2025-01-01

### What Changed
- Added trend charts to drill-down modals showing quarterly/yearly patterns
- Rebuilt complete dataset from 2013-2025 (was 2013-2021) - now 15.5M total records
- Fixed trend charts to use all filtered data, not just current page
- Fixed string concatenation bug in financial calculations
- Cleaned up 1.2GB of redundant quarterly files
- Added comprehensive data pipeline documentation

### Why It Matters
- Users can now see trends for individual contractors/organizations
- More complete dataset with recent years (2022-2025) - 15.5M total records, 5M awarded contracts worth ₱14.8T
- Financial calculations are now accurate
- Better performance with optimized file structure

## [3.0.0] - 2024-12-31

### What Changed
- Initial release of complete PhilGEPS Dashboard
- Data explorer with entity-first analysis
- Advanced search with filters and keyword matching
- Dark/light mode toggle
- Django backend with DuckDB for analytics
- React frontend with TypeScript

### Why It Matters
- First public release of government procurement analytics dashboard
- Covers 2013-2021 data (~8.9M total records, ~3.2M awarded contracts)
- Provides transparency into government spending patterns

---

## Version History

- **v3.0.2** (2025-01-02): Data clarity and documentation improvements
- **v3.0.1** (2025-01-01): Enhanced analytics, complete data rebuild, trend charts
- **v3.0.0** (2024-12-31): Major release with comprehensive features

## Contributing

When adding new features or making changes, please update this changelog following the format above.

### Changelog Format
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

**Last Updated**: January 2, 2025  
