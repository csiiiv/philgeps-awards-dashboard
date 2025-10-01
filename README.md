# PhilGEPS Dashboard

[![Version](https://img.shields.io/badge/version-3.0.2-blue.svg)](https://github.com/csiiiv/philgeps-awards-dashboard)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Data](https://img.shields.io/badge/data-15.5M%20records-orange.svg)](data/)
[![Coverage](https://img.shields.io/badge/coverage-2013--2025-brightgreen.svg)](data/)

A comprehensive government procurement analytics dashboard for the Philippines Government Electronic Procurement System (PhilGEPS). This application provides detailed insights into government contracts, spending patterns, and procurement analytics.

## 📊 **Data Overview**

- **📈 Total Records**: 15.5M+ government procurement records (all notices + awards)
- **💰 Awarded Contracts**: 5.0M+ contracts with financial values (₱14.8T+ total value)
- **📋 Data Types**: Procurement notices, contract awards, and bidding information
- **📅 Time Coverage**: 2013-2025 (13 years of data)
- **🏢 Data Sources**: PhilGEPS XLSX (2013-2020) + CSV (2021-2025) + Flood Control
- **📁 File Size**: 2.6GB consolidated dataset with 50 columns
- **🔍 Search Capability**: Full-text search across all contract details
- **📊 Analytics**: Real-time aggregations and trend analysis

## ✨ Recent Updates

### **v3.0.2 - Data Clarity & Documentation (January 2025)**
- **📈 Trend Charts**: Added interactive quarterly/yearly trend charts in drill-down modals
- **🔄 Complete Data Rebuild**: Consolidated 2013-2025 dataset with 15.5M+ records
- **📊 Enhanced Analytics**: Individual entity trend analysis with complete dataset processing
- **🛠️ Data Pipeline**: Comprehensive processing scripts with full documentation
- **📁 File Structure**: 225+ optimized parquet files for fast analytics
- **🔧 Maintenance**: Automated cleanup and optimization scripts

### **Key Improvements**
- **Data Clarity**: Clear distinction between all records (15.5M) and awarded contracts (5.0M)
- **Financial Transparency**: Added ₱14.8T+ total value tracking for awarded contracts
- **Data Coverage**: Extended from 2013-2021 to 2013-2025 (13 years)
- **Performance**: Optimized search and analytics with DuckDB integration
- **User Experience**: Enhanced drill-down modals with embedded trend charts
- **Documentation**: Complete data pipeline documentation and maintenance guides
- **Code Quality**: Cleaned up scripts directory and improved code organization

## 🚀 Features

### 📊 Data Explorer
- **Entity-First Analysis**: Explore data by contractors, organizations, areas, or business categories
- **Interactive Filters**: Dynamic filtering based on selected dimension
- **Real-time Search**: Search and filter entities with autocomplete
- **Summary Statistics**: Quick overview of total contracts, values, and averages

### 🔍 Advanced Search
- **Comprehensive Filtering**: Multi-dimensional search across all data fields
- **Keyword Search**: AND logic for precise keyword matching
- **Date Range Filtering**: Flexible time period selection (2013-2025)
- **Export Capabilities**: CSV export with rank range selection
- **Filter Presets**: Save, load, and manage custom filter configurations

### 📈 Analytics
- **Contract Analysis**: Detailed breakdown by various dimensions
- **Trend Analysis**: Quarterly and yearly trend visualization with interactive charts
- **Drill-down Capabilities**: Nested modals with embedded trend charts for granular data exploration
- **Performance Metrics**: Contract value, count, and efficiency analysis
- **Entity Trends**: Individual contractor/organization trend analysis with complete dataset processing

### 🎨 User Experience
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Optimized**: Lazy loading and efficient rendering

## 🏗️ Architecture

### Backend (Django)
- **Django REST Framework**: RESTful API endpoints
- **DuckDB Integration**: High-performance analytics queries
- **Parquet Data Processing**: Efficient data storage and retrieval
- **CORS Support**: Cross-origin resource sharing for frontend

### Frontend (React + Vite)
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Styled Components**: CSS-in-JS styling
- **Vite**: Fast build tool and development server

## 📁 Project Structure

```
production1/
├── backend/                 # Django backend
│   ├── django/             # Django application
│   │   ├── contracts/      # Contract models and API
│   │   ├── data_processing/ # Data processing utilities
│   │   └── philgeps_data_explorer/ # Django settings
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json        # Node.js dependencies
├── data/                   # Data files and documentation
│   ├── parquet/           # Parquet data files (225+ files)
│   ├── processed/         # Processed data (consolidated files)
│   └── raw/               # Raw data sources (XLSX/CSV)
├── docs/                   # Project documentation
│   ├── DASHBOARD_DOCUMENTATION.md
│   └── ACTIVE_API_DOCUMENTATION.md
├── scripts/                # Data processing scripts
│   ├── core/              # Core processing utilities
│   ├── archive/           # Legacy scripts (archived)
│   ├── DATA_PIPELINE.md   # Complete pipeline documentation
│   └── README.md          # Scripts guide
├── setup_env.sh           # Environment configuration script
├── run_local.sh           # Unified run script (Linux)
├── run_local.bat          # Unified run script (Windows)
├── run_local.ps1          # Unified run script (PowerShell)
└── logs/                   # Application logs
```

## 📥 Data Download

The dataset is too large for GitHub and is stored in a Google Drive archive:

**[📁 Download Data Archive](https://drive.google.com/drive/u/0/folders/1kBxTNTOKLqjabYJz00qOz4tacha8Ot4P)**

### Setup Instructions
1. Download the data archive from Google Drive
2. Extract the contents to the `data/` directory
3. Follow the setup instructions below

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git
- Data files (see [Data Download](#-data-download) above)

### Automated Setup (Recommended)

#### 1. Environment Configuration
First, configure your environment using the setup script:

```bash
# For development (default)
./setup_env.sh

# For production
./setup_env.sh production

# Show help
./setup_env.sh help
```

This script will:
- Create backend `.env` file with Django configuration
- Create frontend `.env` file with React configuration
- Configure API sources, domains, and security settings
- Set up CORS and allowed hosts properly

#### 2. Start the Application
Use the unified run script for easy deployment:

```bash
# Start both frontend and backend (recommended)
./run_local.sh

# Start only backend
./run_local.sh start-backend

# Start only frontend
./run_local.sh start-frontend

# Show help
./run_local.sh help
```

#### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3200
- **Admin Panel**: http://localhost:3200/admin (user: admin, pass: admin)

### Manual Setup (Alternative)

#### Backend Setup
```bash
# Create virtual environment
python -m venv venv-linux
source venv-linux/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
cd backend
python manage.py migrate

# Start development server
python manage.py runserver
```

#### Frontend Setup
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Setup Script

The `setup_env.sh` script automatically creates the necessary `.env` files:

#### Configuration Options
Edit the configuration section at the top of `setup_env.sh`:

```bash
# Development Settings
DEV_SECRET_KEY="django-insecure-dev-key-change-in-production"
DEV_DEBUG="True"
DEV_FRONTEND_DOMAIN="https://philgeps.simple-systems.dev"
DEV_API_DOMAIN="philgeps-api.simple-systems.dev"

# Production Settings
PROD_SECRET_KEY="CHANGE-THIS-TO-A-SECURE-SECRET-KEY-IN-PRODUCTION"
PROD_DEBUG="False"
PROD_FRONTEND_DOMAIN="philgeps.simple-systems.dev"
PROD_API_DOMAIN="philgeps-api.simple-systems.dev"

# API Source Selection (1-3)
API_SOURCE_OPTION=1  # 1=Public API, 2=Local, 3=Custom

# Port Configuration
BACKEND_PORT="3200"
FRONTEND_PORT="3000"
```

#### Generated Files

**Backend (.env)**
```
# Django Settings - DEVELOPMENT/PRODUCTION
SECRET_KEY=your-configured-secret-key
DEBUG=True/False
ALLOWED_HOSTS=configured-domains
CORS_ALLOWED_ORIGINS=configured-frontend-domains
```

**Frontend (.env)**
```
# Frontend Environment Variables
VITE_API_URL=http://localhost:3200  # or configured API URL
```

### Manual Configuration (Alternative)

If you prefer manual setup, create `.env` files manually:

**Backend (.env)**
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3200/api
VITE_APP_TITLE=PhilGEPS Dashboard
```

## 📊 Data Sources

### PhilGEPS Dataset (2013-2025)
- **2013-2020**: XLSX files with 44 columns (~8.9M records)
- **2021-2025**: CSV files with 47 columns (~2.2M records)
- **Contract Records**: Government procurement contracts and notices
- **Contractor Information**: Business entity details and contact information
- **Organization Data**: Government agencies and departments
- **Geographic Data**: Regional and provincial information
- **Enhanced Fields**: Additional columns for contact persons, bidders, and reference IDs

### Sumbong sa Pangulo Dataset
- **Flood Control Projects**: Infrastructure and flood management contracts
- **Specialized Analytics**: Dedicated metrics for flood control projects
- **Integrated Processing**: Seamlessly integrated with main dataset

### Data Processing Pipeline
- **Consolidated Dataset**: 15.5M+ records in unified format (all procurement data)
- **Clean Awarded Contracts**: 5.0M+ contracts with financial values (₱14.8T+ total)
- **Real-time Aggregations**: 225+ parquet files for fast analytics
- **Optimized Search**: Full-text search across all contract details

## 🔄 Data Pipeline

The application includes a comprehensive data processing pipeline:

### **Processing Scripts** (`scripts/`)
- **`rebuild_step_by_step.py`**: Complete data rebuild from raw sources
- **`fix_date_formats.py`**: Fix Excel serial date formatting issues
- **`generate_clean_awarded_contracts.py`**: Generate clean awarded contracts dataset
- **`generate_unified_parquet_data.py`**: Generate all aggregation files
- **`regenerate_optimized_files.py`**: Regenerate optimized files for dashboard

### **Data Flow**
```
Raw Data (XLSX/CSV) → Processing Scripts → Consolidated Data → Aggregations → API/Dashboard
```

### **File Structure**
- **Consolidated**: `all_contracts_consolidated.parquet` (2.6GB, 50 columns, 15.5M records)
- **Clean Awarded**: `clean_awarded_contracts_complete.parquet` (1.1GB, 5.0M records, ₱14.8T+ value)
- **Aggregations**: `data/parquet/` with yearly/quarterly breakdowns
- **Documentation**: Complete pipeline documentation in `scripts/DATA_PIPELINE.md`

## 🛠️ Development

### Available Scripts

#### Unified Run Script (`run_local.sh`)

**Main Commands**
- `./run_local.sh` - Start both frontend and backend (default)
- `./run_local.sh start-backend` - Start only Django backend
- `./run_local.sh start-frontend` - Start only React frontend
- `./run_local.sh stop` - Stop all running services
- `./run_local.sh restart` - Stop and restart all services
- `./run_local.sh status` - Show service status and health
- `./run_local.sh logs` - Tail the service logs
- `./run_local.sh config` - Show loaded configuration
- `./run_local.sh help` - Show detailed help

**Options**
- `--skip-build` - Skip frontend build
- `--skip-migrate` - Skip Django migrations
- `--run-only` - Shortcut for --skip-build and --skip-migrate
- `--force` - Kill any process using ports before start
- `--debug` - Enable verbose debug output

#### Environment Setup Script (`setup_env.sh`)

**Commands**
- `./setup_env.sh` - Set up development environment (default)
- `./setup_env.sh production` - Set up production environment
- `./setup_env.sh help` - Show help and configuration options

#### Individual Service Scripts

**Frontend**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend**
- `python manage.py runserver` - Start development server
- `python manage.py migrate` - Run database migrations
- `python manage.py collectstatic` - Collect static files

### Code Style
- **Python**: PEP 8 compliance
- **TypeScript**: ESLint + Prettier
- **React**: Functional components with hooks
- **Styling**: Styled Components with theme system

## 📈 Performance

### Optimizations
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **Efficient Queries**: Optimized database queries
- **Caching**: Strategic data caching
- **Bundle Splitting**: Code splitting for faster loads

### Monitoring
- **Performance Tracking**: Built-in performance monitoring
- **Error Boundaries**: Graceful error handling

## 🔒 Security

### Data Protection
- **Input Validation**: Comprehensive input sanitization
- **CORS Configuration**: Proper cross-origin setup
- **Environment Variables**: Secure configuration management
- **HTTPS Ready**: Production-ready security headers

## 📚 Documentation

- [Dashboard Documentation](docs/DASHBOARD_DOCUMENTATION.md) - Comprehensive user guide
- [API Documentation](docs/ACTIVE_API_DOCUMENTATION.md) - Complete API reference
- [Data Pipeline](scripts/DATA_PIPELINE.md) - Complete data processing pipeline documentation
- [Data Structure](data/README.md) - Data format and organization
- [Component Documentation](frontend/src/components/README.md) - Frontend components
- [Scripts Documentation](scripts/README.md) - Data processing scripts guide
- [Changelog](CHANGELOG.md) - Complete version history and changes
- [GitHub Setup Guide](GITHUB_SETUP.md) - Repository setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PhilGEPS**: For providing the procurement data
- **Django Community**: For the excellent web framework
- **React Team**: For the powerful frontend library
- **Open Source Contributors**: For the amazing tools and libraries

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `docs/` folder
- Run `./run_local.sh help` for runtime assistance
- Run `./setup_env.sh help` for configuration help

---

**Built with ❤️ for transparent government procurement**