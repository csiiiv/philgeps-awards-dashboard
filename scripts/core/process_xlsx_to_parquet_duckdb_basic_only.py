#!/usr/bin/env python3
"""
Basic XLSX to Parquet Processing Pipeline using DuckDB
Processes ONE XLSX file with exact deduplication, cleaning, and header standardization
No filtering - processes all records
"""

import duckdb
import pandas as pd
import os
import glob
from pathlib import Path
import logging
from datetime import datetime
import warnings
import argparse

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# =============================================================================
# CONFIGURATION - Paths and Settings
# =============================================================================

# Input and Output Paths
XLSX_INPUT_DIR = "data/raw"
PARQUET_OUTPUT_DIR = "data/processed"

# Logging Configuration
LOG_DIR = "logs"
LOG_FILE = "xlsx_basic_processing.log"

# File Names
FINAL_PARQUET_FILENAME = "basic_processed_contracts.parquet"

# Processing Settings
HEADER_ROW_INDEX = 3  # XLSX header is row 3 (0-indexed) - confirmed by pandas analysis

# Setup logging
def setup_logging():
    """Setup logging with organized directory structure"""
    # Create logs directory if it doesn't exist
    log_dir = Path(LOG_DIR)
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Create log file path
    log_file_path = log_dir / LOG_FILE
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file_path),
            logging.StreamHandler()
        ]
    )
    return log_file_path

# Initialize logging
log_file_path = setup_logging()
logger = logging.getLogger(__name__)

class BasicXLSXProcessor:
    def __init__(self, input_dir=None, output_dir=None):
        # Use configuration variables if not provided
        self.xlsx_dir = Path(input_dir) if input_dir else Path(XLSX_INPUT_DIR)
        self.output_dir = Path(output_dir) if output_dir else Path(PARQUET_OUTPUT_DIR)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize DuckDB connection
        self.conn = duckdb.connect()
        try:
            self.conn.execute("INSTALL excel")
            self.conn.execute("LOAD excel")
            logger.info("Excel extension loaded successfully")
        except Exception as e:
            logger.warning(f"Excel extension installation failed: {e}")
            logger.info("Trying alternative Excel support...")
        
        # Load standardized column mapping from JSON file for 100% consistency
        self.column_mapping = self.load_header_mapping()
        
        # Target columns in original order (with unique_reference_id added)
        self.target_columns = [
            'unique_reference_id', 'organization_name', 'reference_id', 'solicitation_number', 'notice_title', 'publish_date',
            'classification', 'notice_type', 'business_category', 'funding_source', 'funding_instrument', 'procurement_mode',
            'trade_agreement', 'approved_budget', 'area_of_delivery', 'contract_duration', 'calendar_type', 'line_item_number',
            'item_name', 'item_description', 'quantity', 'unit_of_measurement', 'item_budget', 'prebid_date', 'closing_date',
            'notice_status', 'award_number', 'award_title', 'award_type', 'unspsc_code', 'unspsc_description', 'awardee_name',
            'contract_amount', 'contract_number', 'award_publish_date', 'award_date', 'notice_to_proceed_date',
            'contract_effectivity_date', 'contract_end_date', 'reason_for_award', 'award_status', 'period', 'source_file'
        ]
    
    def load_header_mapping(self):
        """Load header mapping from JSON file for 100% standardization"""
        try:
            import json
            mapping_file = Path("xlsx_header_mapping.json")
            if mapping_file.exists():
                with open(mapping_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    logger.info(f"Loaded header mapping from {mapping_file}")
                    return data['header_mapping']
            else:
                logger.warning(f"Header mapping file not found: {mapping_file}")
                logger.info("Using fallback hardcoded mapping")
                return self.get_fallback_mapping()
        except Exception as e:
            logger.error(f"Error loading header mapping: {e}")
            logger.info("Using fallback hardcoded mapping")
            return self.get_fallback_mapping()
    
    def get_fallback_mapping(self):
        """Fallback mapping if JSON file is not available"""
        return {
            # Core Contract Information
            'Organization Name': 'organization_name',
            'Reference ID': 'reference_id',
            'Solicitation No.': 'solicitation_number',
            'Notice Title': 'notice_title',
            'Publish Date': 'publish_date',
            
            # Classification & Type
            'Classification': 'classification',
            'Notice Type': 'notice_type',
            'Business Category': 'business_category',
            'Funding Source': 'funding_source',
            'Funding Instrument': 'funding_instrument',
            'Procurement Mode': 'procurement_mode',
            'Trade Agreement': 'trade_agreement',
            
            # Budget & Financial
            'Approved Budget of the Contract': 'approved_budget',
            'Contract Amount': 'contract_amount',
            
            # Delivery & Timeline
            'Area of Delivery': 'area_of_delivery',
            'Contract Duration': 'contract_duration',
            'Calendar Type': 'calendar_type',
            'PreBid Date': 'prebid_date',
            'Closing Date': 'closing_date',
            
            # Item Details
            'Line Item No': 'line_item_number',
            'Item Name': 'item_name',
            'Item Desc': 'item_description',
            'Quantity': 'quantity',
            'Unit of Measurement': 'unit_of_measurement',
            'UOM': 'unit_of_measurement',  # Handle inconsistency: UOM vs Unit of Measurement
            'Item Budget': 'item_budget',
            
            # Award Information
            'Notice Status': 'notice_status',
            'Award No.': 'award_number',
            'Award Title': 'award_title',
            'Award Type': 'award_type',
            'UNSPSC Code': 'unspsc_code',
            'UNSPSC Description': 'unspsc_description',
            'Awardee Corporate Title': 'awardee_name',
            
            # Contract Details
            'Contract No': 'contract_number',
            'Publish Date(Award)': 'award_publish_date',
            'Award Date': 'award_date',
            'Notice to Proceed Date': 'notice_to_proceed_date',
            'Contract Efectivity Date': 'contract_effectivity_date',
            'Contract End Date': 'contract_end_date',
            'Reason for Award': 'reason_for_award',
            'Award Status': 'award_status'
        }
        
        # Target columns in original order (with unique_reference_id added)
        self.target_columns = [
            'unique_reference_id', 'organization_name', 'reference_id', 'solicitation_number', 'notice_title', 'publish_date',
            'classification', 'notice_type', 'business_category', 'funding_source', 'funding_instrument',
            'procurement_mode', 'trade_agreement', 'approved_budget', 'area_of_delivery', 'contract_duration',
            'calendar_type', 'line_item_number', 'item_name', 'item_description', 'quantity',
            'unit_of_measurement', 'item_budget', 'prebid_date', 'closing_date', 'notice_status',
            'award_number', 'award_title', 'award_type', 'unspsc_code', 'unspsc_description',
            'awardee_name', 'contract_amount', 'contract_number', 'award_publish_date', 'award_date',
            'notice_to_proceed_date', 'contract_effectivity_date', 'contract_end_date', 'reason_for_award', 'award_status'
        ]
        
    def find_all_xlsx_files(self):
        """Find all XLSX files for processing"""
        xlsx_files = []
        for pattern in ['**/*.xlsx', '**/*.xls']:
            xlsx_files.extend(self.xlsx_dir.glob(pattern))
        
        if not xlsx_files:
            logger.error("No XLSX files found")
            return []
            
        # Return all files sorted by name
        sorted_files = sorted(xlsx_files)
        logger.info(f"Found {len(sorted_files)} XLSX files to process")
        return sorted_files
    
    def extract_period_from_filename(self, filename):
        """Extract year and quarter from filename like 'Bid Notice and Award Details Apr-Jun 2016.xlsx'"""
        import re
        
        # Remove file extension
        name = filename.replace('.xlsx', '').replace('.xls', '')
        
        # Look for year pattern
        year_match = re.search(r'(\d{4})', name)
        if not year_match:
            return "Unknown"
        
        year = year_match.group(1)
        
        # Look for month patterns to determine quarter
        name_lower = name.lower()
        
        # Q1: Jan, Feb, Mar, Jan-Mar, Jan-March
        if any(month in name_lower for month in ['jan', 'feb', 'mar', 'january', 'february', 'march']):
            return f"{year}-Q1"
        
        # Q2: Apr, May, Jun, Apr-Jun, April-June
        elif any(month in name_lower for month in ['apr', 'may', 'jun', 'april', 'may', 'june']):
            return f"{year}-Q2"
        
        # Q3: Jul, Aug, Sep, Jul-Sep, July-September
        elif any(month in name_lower for month in ['jul', 'aug', 'sep', 'july', 'august', 'september']):
            return f"{year}-Q3"
        
        # Q4: Oct, Nov, Dec, Oct-Dec, October-December
        elif any(month in name_lower for month in ['oct', 'nov', 'dec', 'october', 'november', 'december']):
            return f"{year}-Q4"
        
        # If no month pattern found, try to extract from common patterns
        elif 'q1' in name_lower:
            return f"{year}-Q1"
        elif 'q2' in name_lower:
            return f"{year}-Q2"
        elif 'q3' in name_lower:
            return f"{year}-Q3"
        elif 'q4' in name_lower:
            return f"{year}-Q4"
        
        # Default fallback
        return f"{year}-Unknown"
    
    def detect_data_range(self, file_path):
        """Detect the actual data range using openpyxl read-only mode - fastest and most efficient"""
        logger.info(f"Detecting data range for {file_path.name}")
        
        try:
            import openpyxl
            
            # Use openpyxl in read-only mode for maximum speed and efficiency
            logger.info("  Using openpyxl read-only mode to detect last row...")
            
            # Load workbook in read-only mode - this reads metadata only, not cell data
            workbook = openpyxl.load_workbook(filename=file_path, read_only=True)
            
            # Get the active worksheet
            worksheet = workbook.active
            
            # Get the last row directly from metadata - this is instant
            last_row = worksheet.max_row
            
            # Close the workbook to free memory
            workbook.close()
            
            logger.info(f"  Openpyxl detected last row: {last_row}")
            
            # Add some buffer to be safe (in case there are empty rows at the end)
            buffer = 100
            safe_range = last_row + buffer
            
            logger.info(f"  Using safe range: {safe_range} (last_row + {buffer} buffer)")
            
            return safe_range
            
        except Exception as e:
            logger.error(f"Error detecting data range with openpyxl: {str(e)}")
            logger.warning("Falling back to pandas method...")
            
            try:
                import pandas as pd
                
                # Fallback to pandas method
                logger.info("  Using pandas as fallback...")
                
                # Read without header to get raw data, with error handling for problematic files
                try:
                    # Try with openpyxl engine first
                    df = pd.read_excel(file_path, header=None, engine='openpyxl')
                except Exception as e2:
                    logger.warning(f"  Pandas with openpyxl failed, trying xlrd: {e2}")
                    try:
                        # Try with xlrd engine as fallback
                        df = pd.read_excel(file_path, header=None, engine='xlrd')
                    except Exception as e3:
                        logger.warning(f"  Pandas with xlrd also failed, trying default: {e3}")
                        # Try with default engine (usually openpyxl)
                        df = pd.read_excel(file_path, header=None, dtype=str, na_filter=False)
                
                # Find the last row that has any non-null data
                last_row = df.last_valid_index() + 1  # +1 because pandas is 0-indexed but Excel is 1-indexed
                
                logger.info(f"  Pandas detected last row with data: {last_row}")
                
                # Add some buffer to be safe
                buffer = 100
                safe_range = last_row + buffer
                
                logger.info(f"  Using safe range: {safe_range} (last_row + {buffer} buffer)")
                
                return safe_range
                
            except Exception as e2:
                logger.error(f"Error detecting data range with pandas: {str(e2)}")
                logger.warning("Falling back to DuckDB method...")
                
                # Final fallback: try DuckDB method with binary search
                for test_rows in [50000, 100000, 200000, 300000]:
                    try:
                        test_query = f"SELECT COUNT(*) FROM read_xlsx('{file_path}', range='A3:AN{test_rows}', header=true, all_varchar=true) WHERE \"Reference ID\" IS NOT NULL AND \"Reference ID\" != ''"
                        result = self.conn.execute(test_query).fetchone()
                        if result and result[0] > 0:
                            logger.info(f"Fallback: Using range {test_rows}")
                            return test_rows
                    except:
                        continue
                
                logger.warning("Using final fallback: 100000 rows")
                return 100000

    def analyze_xlsx_structure(self, file_path):
        """Analyze the structure of an XLSX file to understand column mapping"""
        try:
            # Use DuckDB to read XLSX file structure
            # Based on pandas analysis, header row 3 is confirmed to work
            logger.info(f"Analyzing file structure for {file_path.name}")
            
            # Try the confirmed approach: range A3:AN10 with header=true and all_varchar=true
            try:
                query = f"""
                SELECT * FROM read_xlsx('{file_path}', range='A3:AN10', header=true, all_varchar=true)
                LIMIT 3
                """
                
                result = self.conn.execute(query).fetchall()
                
                # Get column names from the result description
                column_names = [desc[0] for desc in self.conn.description]
                
                logger.info(f"  Range A3:AN10: {len(column_names)} columns")
                logger.info(f"  Sample data: {result[0][:5] if result else 'No data'}")
                
                # Check if this looks like the expected data
                if len(column_names) >= 35 and result:
                    logger.info(f"[OK] Confirmed range A3:AN10 with {len(column_names)} columns")
                    return column_names, 3
                else:
                    logger.warning(f"Range A3:AN10 doesn't look right. Found {len(column_names)} columns")
                    
            except Exception as e:
                logger.warning(f"Error with range A3:AN10: {e}")
            
            # Fallback: check other rows if row 3 doesn't work
            logger.info("Trying other header rows as fallback...")
            for header_row in [0, 1, 2, 4, 5]:
                try:
                    query = f"""
                    SELECT * FROM read_xlsx('{file_path}', header={header_row})
                    LIMIT 3
                    """
                    
                    result = self.conn.execute(query).fetchall()
                    columns = self.conn.execute(f"DESCRIBE SELECT * FROM read_xlsx('{file_path}', header={header_row})").fetchall()
                    
                    column_names = [col[0] for col in columns]
                    
                    logger.info(f"  Row {header_row}: {len(column_names)} columns - {column_names[:5]}{'...' if len(column_names) > 5 else ''}")
                    
                    # Check if this looks like a good header row
                    is_good_header = (
                        len(column_names) > 30 and  # At least 30 columns (we expect 40)
                        any(keyword in ' '.join(column_names).upper() for keyword in ['ORGANIZATION', 'REFERENCE', 'NOTICE', 'AWARD', 'CONTRACT'])
                    )
                    
                    if is_good_header:
                        logger.info(f"[OK] Found good header row: {header_row}")
                        return column_names, header_row
                        
                except Exception as e:
                    logger.info(f"  Row {header_row}: Error - {str(e)}")
                    continue
            
            logger.warning(f"Could not find proper header row for {file_path.name}")
            return None, 3
            
        except Exception as e:
            logger.error(f"Error analyzing {file_path}: {str(e)}")
            return None, 3
    
    def process_single_file(self, file_path):
        """Process a single XLSX file using DuckDB"""
        try:
            logger.info(f"Processing file: {file_path.name}")
            
            # Analyze file structure
            xlsx_columns, header_row = self.analyze_xlsx_structure(file_path)
            
            if xlsx_columns is None:
                logger.error(f"Could not analyze file structure for {file_path.name}")
                return None
            
            # Detect the actual data range
            last_row = self.detect_data_range(file_path)
            
            # Build column selection with mapping
            column_selections = []
            mapped_columns = []
            unmapped_columns = []
            
            # First, add the unique_reference_id as a computed column with padding for consistency
            column_selections.append("CONCAT(LPAD(COALESCE(\"Reference ID\", ''), 12, '0'), '-', LPAD(COALESCE(\"Line Item No\", ''), 4, '0')) AS unique_reference_id")
            
            for xlsx_col in xlsx_columns:
                if xlsx_col in self.column_mapping:
                    target_col = self.column_mapping[xlsx_col]
                    column_selections.append(f'"{xlsx_col}" AS {target_col}')
                    mapped_columns.append(xlsx_col)
                else:
                    # Keep unmapped columns as-is with cleaned names
                    clean_name = xlsx_col.lower().replace(' ', '_').replace('.', '').replace('(', '').replace(')', '')
                    column_selections.append(f'"{xlsx_col}" AS {clean_name}')
                    unmapped_columns.append(xlsx_col)
            
            # Add missing target columns as NULL (except unique_reference_id which we already added)
            for target_col in self.target_columns:
                if target_col == 'unique_reference_id':
                    continue  # Already added above
                if target_col not in [self.column_mapping.get(col) for col in xlsx_columns]:
                    column_selections.append(f"NULL AS {target_col}")
            
            # Log mapping results
            logger.info(f"Column mapping results:")
            logger.info(f"  Mapped columns: {len(mapped_columns)}")
            logger.info(f"  Unmapped columns: {len(unmapped_columns)}")
            if unmapped_columns:
                logger.info(f"  Unmapped: {unmapped_columns}")
            
            # Create the SELECT statement
            select_clause = ",\n            ".join(column_selections)
            
            # Extract year and quarter from filename
            period_info = self.extract_period_from_filename(file_path.name)
            
            # Build the main query (NO FILTERING - process all records)
            query = f"""
            WITH raw_data AS (
                SELECT {select_clause}
                FROM read_xlsx('{file_path}', range='A3:AN{last_row}', header=true, all_varchar=true)
            ),
            processed_data AS (
                SELECT *,
                       ROW_NUMBER() OVER() AS row_id,
                       '{period_info}' AS period,
                       '{file_path.name}' AS source_file
                FROM raw_data
            )
            SELECT * FROM processed_data
            """
            
            # Get column info and sample data for logging
            sample_result = self.conn.execute(f"{query} LIMIT 5").fetchall()
            columns = [desc[0] for desc in self.conn.description]
            
            # Get total count for logging
            count_result = self.conn.execute(f"SELECT COUNT(*) FROM ({query})").fetchone()
            total_count = count_result[0] if count_result else 0
            
            # Debug: Log the actual columns returned
            logger.info(f"Columns returned from query: {columns}")
            logger.info(f"First row of data: {sample_result[0][:5] if sample_result else 'No data'}")
            
            # Ensure unique_reference_id is the first column
            if 'unique_reference_id' not in columns:
                logger.warning("unique_reference_id not found in query result columns!")
                columns = ['unique_reference_id'] + columns
            
            logger.info(f"Processed {total_count} records from {file_path.name}")
            
            return query, columns
            
        except Exception as e:
            logger.error(f"Error processing {file_path}: {str(e)}")
            return None, None
    
    def deduplicate_data(self, table_name):
        """Remove exact duplicate records using DuckDB SQL"""
        logger.info("Starting deduplication (exact duplicates only)...")
        
        # Get initial count
        initial_count = self.conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
        
        # Get table columns for the PARTITION BY clause
        table_columns = self.conn.execute(f"PRAGMA table_info({table_name})").fetchall()
        column_names = [col[1] for col in table_columns]
        
        # Find and log ALL exact duplicates before removal
        duplicates_sql = f"""
        WITH duplicate_groups AS (
            SELECT *,
                   COUNT(*) OVER (PARTITION BY {', '.join([f'"{col}"' for col in column_names])}) as duplicate_count
            FROM {table_name}
        )
        SELECT * FROM duplicate_groups 
        WHERE duplicate_count > 1
        ORDER BY duplicate_count DESC
        """
        
        try:
            duplicate_samples = self.conn.execute(duplicates_sql).fetchall()
            if duplicate_samples:
                logger.info(f"Found {len(duplicate_samples)} exact duplicate records (showing ALL):")
                columns = [desc[0] for desc in self.conn.description]
                for i, row in enumerate(duplicate_samples):
                    logger.info(f"  Duplicate {i+1}: {dict(zip(columns, row))}")
            else:
                logger.info("No exact duplicates found")
        except Exception as e:
            logger.warning(f"Could not retrieve duplicate samples: {e}")
        
        # Create deduplicated table (exact duplicates only)
        dedup_table_name = f"{table_name}_dedup"
        
        dedup_sql = f"""
        CREATE TABLE {dedup_table_name} AS
        SELECT DISTINCT * FROM {table_name}
        """
        
        self.conn.execute(dedup_sql)
        
        # Get final count
        final_count = self.conn.execute(f"SELECT COUNT(*) FROM {dedup_table_name}").fetchone()[0]
        exact_dups = initial_count - final_count
        
        logger.info(f"Removed {exact_dups} exact duplicates")
        logger.info(f"Deduplication complete: {initial_count} -> {final_count} records")
        
        # Drop original table and rename
        self.conn.execute(f"DROP TABLE {table_name}")
        self.conn.execute(f"ALTER TABLE {dedup_table_name} RENAME TO {table_name}")
        
        return table_name
    
    def clean_data(self, table_name):
        """Clean data for better quality using DuckDB SQL"""
        logger.info("Starting data cleaning...")
        
        # Create cleaned table
        clean_table_name = f"{table_name}_clean"
        
        clean_sql = f"""
        CREATE TABLE {clean_table_name} AS
        SELECT 
            -- String fields with trimming and NULL handling
            CASE WHEN reference_id = 'nan' OR reference_id = 'None' OR reference_id = '' THEN NULL ELSE TRIM(reference_id) END as reference_id,
            CASE WHEN organization_name = 'nan' OR organization_name = 'None' OR organization_name = '' THEN NULL ELSE TRIM(organization_name) END as organization_name,
            CASE WHEN notice_title = 'nan' OR notice_title = 'None' OR notice_title = '' THEN NULL ELSE TRIM(notice_title) END as notice_title,
            CASE WHEN awardee_name = 'nan' OR awardee_name = 'None' OR awardee_name = '' THEN NULL ELSE TRIM(awardee_name) END as awardee_name,
            CASE WHEN award_title = 'nan' OR award_title = 'None' OR award_title = '' THEN NULL ELSE TRIM(award_title) END as award_title,
            
            -- All other string fields with cleaning
            CASE WHEN classification = 'nan' OR classification = 'None' OR classification = '' THEN NULL ELSE TRIM(classification) END as classification,
            CASE WHEN notice_type = 'nan' OR notice_type = 'None' OR notice_type = '' THEN NULL ELSE TRIM(notice_type) END as notice_type,
            CASE WHEN business_category = 'nan' OR business_category = 'None' OR business_category = '' THEN NULL ELSE TRIM(business_category) END as business_category,
            CASE WHEN funding_source = 'nan' OR funding_source = 'None' OR funding_source = '' THEN NULL ELSE TRIM(funding_source) END as funding_source,
            CASE WHEN funding_instrument = 'nan' OR funding_instrument = 'None' OR funding_instrument = '' THEN NULL ELSE TRIM(funding_instrument) END as funding_instrument,
            CASE WHEN procurement_mode = 'nan' OR procurement_mode = 'None' OR procurement_mode = '' THEN NULL ELSE TRIM(procurement_mode) END as procurement_mode,
            CASE WHEN trade_agreement = 'nan' OR trade_agreement = 'None' OR trade_agreement = '' THEN NULL ELSE TRIM(trade_agreement) END as trade_agreement,
            CASE WHEN area_of_delivery = 'nan' OR area_of_delivery = 'None' OR area_of_delivery = '' THEN NULL ELSE TRIM(area_of_delivery) END as area_of_delivery,
            CASE WHEN contract_duration = 'nan' OR contract_duration = 'None' OR contract_duration = '' THEN NULL ELSE TRIM(contract_duration) END as contract_duration,
            CASE WHEN calendar_type = 'nan' OR calendar_type = 'None' OR calendar_type = '' THEN NULL ELSE TRIM(calendar_type) END as calendar_type,
            CASE WHEN notice_status = 'nan' OR notice_status = 'None' OR notice_status = '' THEN NULL ELSE TRIM(notice_status) END as notice_status,
            CASE WHEN award_number = 'nan' OR award_number = 'None' OR award_number = '' THEN NULL ELSE TRIM(award_number) END as award_number,
            CASE WHEN award_type = 'nan' OR award_type = 'None' OR award_type = '' THEN NULL ELSE TRIM(award_type) END as award_type,
            CASE WHEN unspsc_code = 'nan' OR unspsc_code = 'None' OR unspsc_code = '' THEN NULL ELSE TRIM(unspsc_code) END as unspsc_code,
            CASE WHEN unspsc_description = 'nan' OR unspsc_description = 'None' OR unspsc_description = '' THEN NULL ELSE TRIM(unspsc_description) END as unspsc_description,
            CASE WHEN contract_number = 'nan' OR contract_number = 'None' OR contract_number = '' THEN NULL ELSE TRIM(contract_number) END as contract_number,
            CASE WHEN reason_for_award = 'nan' OR reason_for_award = 'None' OR reason_for_award = '' THEN NULL ELSE TRIM(reason_for_award) END as reason_for_award,
            CASE WHEN award_status = 'nan' OR award_status = 'None' OR award_status = '' THEN NULL ELSE TRIM(award_status) END as award_status,
            CASE WHEN solicitation_number = 'nan' OR solicitation_number = 'None' OR solicitation_number = '' THEN NULL ELSE TRIM(solicitation_number) END as solicitation_number,
            CASE WHEN item_name = 'nan' OR item_name = 'None' OR item_name = '' THEN NULL ELSE TRIM(item_name) END as item_name,
            CASE WHEN item_description = 'nan' OR item_description = 'None' OR item_description = '' THEN NULL ELSE TRIM(item_description) END as item_description,
            CASE WHEN unit_of_measurement = 'nan' OR unit_of_measurement = 'None' OR unit_of_measurement = '' THEN NULL ELSE TRIM(unit_of_measurement) END as unit_of_measurement,
            
            -- Keep all other fields as-is (dates, numbers, etc.)
            unique_reference_id,  -- Keep the computed unique_reference_id
            publish_date, prebid_date, closing_date, award_publish_date, award_date,
            notice_to_proceed_date, contract_effectivity_date, contract_end_date,
            approved_budget, contract_amount, item_budget, quantity, line_item_number,
            row_id, period, source_file  -- Keep metadata columns
        FROM {table_name}
        """
        
        self.conn.execute(clean_sql)
        
        # Drop original table and rename
        self.conn.execute(f"DROP TABLE {table_name}")
        self.conn.execute(f"ALTER TABLE {clean_table_name} RENAME TO {table_name}")
        
        logger.info("Data cleaning complete")
        return table_name
    
    def process_single_file_to_parquet(self, file_path, output_filename):
        """Process a single XLSX file to parquet"""
        logger.info(f"Processing single file: {file_path.name}")
        
        try:
            # Process the file
            query, columns = self.process_single_file(file_path)
            
            if query is None:
                logger.error("No data processed successfully")
                return None
            
            # Create temporary table
            temp_table_name = "temp_single_file_data"
            create_table_sql = f"CREATE TABLE {temp_table_name} AS {query}"
            
            self.conn.execute(create_table_sql)
            logger.info(f"Created table {temp_table_name}")
            
            # Deduplicate
            temp_table_name = self.deduplicate_data(temp_table_name)
            
            # Clean data
            temp_table_name = self.clean_data(temp_table_name)
            
            # Save final result
            final_path = self.output_dir / output_filename
            self.conn.execute(f"COPY {temp_table_name} TO '{final_path}' (FORMAT PARQUET)")
            
            # Get final count
            final_count = self.conn.execute(f"SELECT COUNT(*) FROM {temp_table_name}").fetchone()[0]
            
            logger.info(f"Single file processing complete! Dataset saved to {final_path}")
            logger.info(f"Final record count: {final_count}")
            
            # Generate summary statistics
            self.generate_summary(temp_table_name)
            
            # Clean up temporary table
            self.conn.execute(f"DROP TABLE {temp_table_name}")
            
            return final_path
            
        except Exception as e:
            logger.error(f"Error processing single file {file_path.name}: {e}")
            return None

    def run_basic_pipeline(self, output_filename=None):
        """Run the basic processing pipeline using DuckDB - process ALL XLSX files"""
        logger.info("Starting basic XLSX to Parquet processing pipeline (ALL FILES)")
        
        # Use provided filename or default
        output_file = output_filename or FINAL_PARQUET_FILENAME
        
        # Find all XLSX files
        xlsx_files = self.find_all_xlsx_files()
        if not xlsx_files:
            logger.error("No XLSX files found to process")
            return None
        
        logger.info(f"Processing {len(xlsx_files)} XLSX files...")
        
        # Create the main combined table
        temp_table_name = "temp_combined_data"
        
        # Process each file and combine into single table
        all_queries = []
        total_records = 0
        
        for i, file_path in enumerate(xlsx_files, 1):
            logger.info(f"Processing file {i}/{len(xlsx_files)}: {file_path.name}")
            
            try:
                # Process the file
                query, columns = self.process_single_file(file_path)
                
                if query is None:
                    logger.warning(f"Failed to process {file_path.name}, skipping...")
                    continue
                
                # Add to combined query
                all_queries.append(f"({query})")
                
                # Get count for this file
                count_result = self.conn.execute(f"SELECT COUNT(*) FROM ({query})").fetchone()
                file_count = count_result[0] if count_result else 0
                total_records += file_count
                
                logger.info(f"  Added {file_count} records from {file_path.name}")
                
            except Exception as e:
                logger.error(f"Error processing {file_path.name}: {e}")
                continue
        
        if not all_queries:
            logger.error("No files processed successfully")
            return None
        
        # Create combined table using UNION ALL
        logger.info(f"Creating combined table with {len(all_queries)} file queries...")
        
        combined_query = " UNION ALL ".join(all_queries)
        create_table_sql = f"""
        CREATE TABLE {temp_table_name} AS
        {combined_query}
        """
        
        try:
            self.conn.execute(create_table_sql)
            logger.info(f"Created combined table {temp_table_name} with {total_records} total records")
            
        except Exception as e:
            logger.error(f"Failed to create combined table: {e}")
            raise
        
        # Deduplicate across all files
        temp_table_name = self.deduplicate_data(temp_table_name)
        
        # Clean data
        temp_table_name = self.clean_data(temp_table_name)
        
        # Save final result
        final_path = self.output_dir / output_file
        self.conn.execute(f"COPY {temp_table_name} TO '{final_path}' (FORMAT PARQUET)")
        
        # Get final count
        final_count = self.conn.execute(f"SELECT COUNT(*) FROM {temp_table_name}").fetchone()[0]
        
        logger.info(f"Basic pipeline complete! Final dataset saved to {final_path}")
        logger.info(f"Final record count: {final_count}")
        logger.info(f"Processed {len(xlsx_files)} files successfully")
        
        # Generate summary statistics
        self.generate_summary(temp_table_name)
        
        # Clean up temporary table
        self.conn.execute(f"DROP TABLE {temp_table_name}")
        
        return final_path
    
    def generate_summary(self, table_name):
        """Generate summary statistics using DuckDB SQL"""
        try:
            # Get basic counts
            total_records = self.conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
            
            # Column information
            columns_info = self.conn.execute(f"DESCRIBE {table_name}").fetchall()
            
            logger.info("Summary Statistics:")
            logger.info(f"  Total records: {total_records}")
            logger.info(f"  Total columns: {len(columns_info)}")
            logger.info(f"  Columns: {[col[0] for col in columns_info]}")
            
            # Period statistics
            period_stats = self.conn.execute(f"""
                SELECT period, COUNT(*) as record_count, COUNT(DISTINCT source_file) as file_count
                FROM {table_name}
                GROUP BY period
                ORDER BY period
            """).fetchall()
            
            logger.info("Period Statistics:")
            for period, count, files in period_stats:
                logger.info(f"  {period}: {count:,} records from {files} file(s)")
            
            # Sample data
            sample_data = self.conn.execute(f"SELECT * FROM {table_name} LIMIT 3").fetchall()
            if sample_data:
                logger.info("Sample records:")
                for i, row in enumerate(sample_data):
                    logger.info(f"  Record {i+1}: {dict(zip([col[0] for col in columns_info], row))}")
                
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Process XLSX files to Parquet using DuckDB",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process all XLSX files (default behavior)
  python process_xlsx_to_parquet_duckdb_basic_only.py
  
  # Process specific file
  python process_xlsx_to_parquet_duckdb_basic_only.py -f "Bid Notice and Award Details Apr-Jun 2016.xlsx"
  
  # Process specific file with custom output
  python process_xlsx_to_parquet_duckdb_basic_only.py -f "Bid Notice and Award Details Apr-Jun 2016.xlsx" -o "2016_q2_contracts.parquet"
  
  # Process all files with custom output
  python process_xlsx_to_parquet_duckdb_basic_only.py -o "all_contracts.parquet"
        """
    )
    
    parser.add_argument(
        '-f', '--file',
        type=str,
        help='Specific XLSX file to process (if not provided, processes all files)'
    )
    
    parser.add_argument(
        '-o', '--output',
        type=str,
        help='Output parquet filename (default: basic_processed_contracts.parquet)'
    )
    
    parser.add_argument(
        '--input-dir',
        type=str,
        default=str(XLSX_INPUT_DIR),
        help=f'Input directory (default: {XLSX_INPUT_DIR})'
    )
    
    parser.add_argument(
        '--output-dir',
        type=str,
        default=str(PARQUET_OUTPUT_DIR),
        help=f'Output directory (default: {PARQUET_OUTPUT_DIR})'
    )
    
    return parser.parse_args()

def main():
    """Main execution function with CLI support"""
    args = parse_arguments()
    
    # Set output filename
    output_filename = args.output or FINAL_PARQUET_FILENAME
    
    print(f"[START] Starting Basic XLSX to Parquet processing pipeline (DuckDB)")
    print(f"[INPUT] Input directory: {args.input_dir}")
    print(f"[OUTPUT] Output directory: {args.output_dir}")
    print(f"[FILE] Output file: {output_filename}")
    print(f"[LOG] Log file: {log_file_path}")
    print("=" * 60)
    
    # Create processor with custom directories
    processor = BasicXLSXProcessor(
        input_dir=Path(args.input_dir),
        output_dir=Path(args.output_dir)
    )
    
    try:
        if args.file:
            # Process specific file
            print(f"[TARGET] Processing specific file: {args.file}")
            file_path = Path(args.input_dir) / args.file
            if not file_path.exists():
                print(f"[ERROR] File not found: {file_path}")
                return
            
            result_path = processor.process_single_file_to_parquet(file_path, output_filename)
        else:
            # Process all files
            print(f"[ALL] Processing all XLSX files...")
            result_path = processor.run_basic_pipeline(output_filename)
        
        if result_path is not None:
            print(f"\n[SUCCESS] Processing complete!")
            print(f"[OUTPUT] Output saved to: {result_path}")
            print(f"[LOG] Log file: {log_file_path}")
        else:
            print("[ERROR] Processing failed!")
            print(f"[LOG] Check log file for details: {log_file_path}")
            
    except Exception as e:
        print(f"[ERROR] Processing failed with error: {str(e)}")
        print(f"[LOG] Check log file for details: {log_file_path}")
        
    finally:
        # Close DuckDB connection
        processor.conn.close()

if __name__ == "__main__":
    main()
