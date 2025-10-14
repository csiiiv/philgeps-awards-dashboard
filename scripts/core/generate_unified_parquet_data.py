#!/usr/bin/env python3
"""
Sprint 24: Unified Parquet Data Generator
Generates all parquet files for the unified parquet architecture
"""

import duckdb
import pandas as pd
import os
import sys
from datetime import datetime
import logging
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import *

class UnifiedParquetGenerator:
    def __init__(self):
        self.setup_logging()
        self.setup_paths()
        self.conn = None
        
    def setup_logging(self):
        """Setup logging configuration"""
        # Create logs directory if it doesn't exist
        log_dir = Path("logs")
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Create log file path
        log_file_path = log_dir / "unified_parquet_generation.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file_path),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        self.log_file_path = log_file_path
        
    def setup_paths(self):
        """Setup file paths for Sprint 24 unified parquet architecture"""
        # Get the directory where this script is located (sprint_24/scripts/core/)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # Go up two levels to sprint_24 directory
        self.sprint_dir = os.path.dirname(os.path.dirname(script_dir))
        self.data_source = os.path.join(self.sprint_dir, "data", "processed", "clean_awarded_contracts_complete_fixed.parquet")
        self.parquet_dir = os.path.join(self.sprint_dir, "data", "parquet")
        self.yearly_dir = os.path.join(self.parquet_dir, "yearly")
        self.quarterly_dir = os.path.join(self.parquet_dir, "quarterly")
        
    def get_connection(self):
        """Get or create DuckDB connection"""
        if self.conn is None:
            self.conn = duckdb.connect()
        return self.conn
        
    def create_directories(self):
        """Create necessary directories"""
        os.makedirs(self.parquet_dir, exist_ok=True)
        os.makedirs(self.yearly_dir, exist_ok=True)
        os.makedirs(self.quarterly_dir, exist_ok=True)
        self.logger.info("[OK] Created parquet directories")
        
    def load_source_data(self):
        """Load the source parquet data"""
        try:
            conn = self.get_connection()
            
            # Load the main data source
            conn.execute(f"""
                CREATE VIEW source_data AS 
                SELECT * FROM read_parquet('{self.data_source}')
            """)
            
            # Get basic stats
            result = conn.execute("SELECT COUNT(*) as count FROM source_data").fetchone()
            self.logger.info(f"[OK] Loaded {result[0]:,} records from source data")
            
            return True
            
        except Exception as e:
            self.logger.error(f"[ERROR] Error loading source data: {e}")
            return False
            
    def generate_all_time_aggregations(self):
        """Generate all-time aggregated parquet files"""
        self.logger.info("[PROCESSING] Generating all-time aggregations...")
        
        try:
            conn = self.get_connection()
            
            # Generate business category aggregations
            self.logger.info("  [DATA] Generating business category aggregations...")
            conn.execute("""
                CREATE OR REPLACE TABLE agg_business_category AS
            SELECT 
                    business_category as entity,
                COUNT(*) as contract_count,
                    COUNT(DISTINCT awardee_name) as contractor_count,
                    SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
                    AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
                    MIN(CAST(award_date AS DATE)) as first_contract_date,
                    MAX(CAST(award_date AS DATE)) as last_contract_date,
                    COUNT(DISTINCT organization_name) as organization_count,
                    COUNT(DISTINCT area_of_delivery) as area_count
                FROM source_data 
                WHERE business_category IS NOT NULL 
                AND contract_amount IS NOT NULL
                AND contract_amount != 'NULL'
                AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
                AND TRY_CAST(contract_amount AS DOUBLE) > 0
                GROUP BY business_category
                ORDER BY total_contract_value DESC
            """)
            
            # Export to parquet
            conn.execute(f"""
                COPY agg_business_category TO '{os.path.join(self.parquet_dir, "agg_business_category.parquet")}' (FORMAT PARQUET)
            """)
            
            # Generate contractor aggregations
            self.logger.info("  [CONTRACTOR] Generating contractor aggregations...")
            conn.execute("""
                CREATE OR REPLACE TABLE agg_contractor AS
            SELECT 
                awardee_name as entity,
                COUNT(*) as contract_count,
                    COUNT(DISTINCT business_category) as category_count,
                    SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
                    AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
                    MIN(CAST(award_date AS DATE)) as first_contract_date,
                    MAX(CAST(award_date AS DATE)) as last_contract_date,
                    COUNT(DISTINCT organization_name) as organization_count,
                    COUNT(DISTINCT area_of_delivery) as area_count
                FROM source_data 
                WHERE awardee_name IS NOT NULL 
                AND contract_amount IS NOT NULL
                AND contract_amount != 'NULL'
                AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
                AND TRY_CAST(contract_amount AS DOUBLE) > 0
            GROUP BY awardee_name
                ORDER BY total_contract_value DESC
            """)
            
            # Export to parquet
            conn.execute(f"""
                COPY agg_contractor TO '{os.path.join(self.parquet_dir, "agg_contractor.parquet")}' (FORMAT PARQUET)
            """)
            
            # Generate organization aggregations
            self.logger.info("  [ORG] Generating organization aggregations...")
            conn.execute("""
                CREATE OR REPLACE TABLE agg_organization AS
            SELECT 
                    organization_name as entity,
                COUNT(*) as contract_count,
                    COUNT(DISTINCT business_category) as category_count,
                    COUNT(DISTINCT awardee_name) as contractor_count,
                    SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
                    AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
                    MIN(CAST(award_date AS DATE)) as first_contract_date,
                    MAX(CAST(award_date AS DATE)) as last_contract_date,
                    COUNT(DISTINCT area_of_delivery) as area_count
                FROM source_data 
                WHERE organization_name IS NOT NULL 
                AND contract_amount IS NOT NULL
                AND contract_amount != 'NULL'
                AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
                AND TRY_CAST(contract_amount AS DOUBLE) > 0
                GROUP BY organization_name
                ORDER BY total_contract_value DESC
            """)
            
            # Export to parquet
            conn.execute(f"""
                COPY agg_organization TO '{os.path.join(self.parquet_dir, "agg_organization.parquet")}' (FORMAT PARQUET)
            """)
            
            # Generate area aggregations
            self.logger.info("  [AREA] Generating area aggregations...")
            conn.execute("""
                CREATE OR REPLACE TABLE agg_area AS
            SELECT 
                area_of_delivery as entity,
                COUNT(*) as contract_count,
                    COUNT(DISTINCT business_category) as category_count,
                    COUNT(DISTINCT awardee_name) as contractor_count,
                    COUNT(DISTINCT organization_name) as organization_count,
                    SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
                    AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
                    MIN(CAST(award_date AS DATE)) as first_contract_date,
                    MAX(CAST(award_date AS DATE)) as last_contract_date
                FROM source_data 
                WHERE area_of_delivery IS NOT NULL 
                AND contract_amount IS NOT NULL
                AND contract_amount != 'NULL'
                AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
                AND TRY_CAST(contract_amount AS DOUBLE) > 0
            GROUP BY area_of_delivery
                ORDER BY total_contract_value DESC
            """)
            
            # Export to parquet
            conn.execute(f"""
                COPY agg_area TO '{os.path.join(self.parquet_dir, "agg_area.parquet")}' (FORMAT PARQUET)
            """)
            
            # Generate facts table
            self.logger.info("  [FACTS] Generating facts table...")
            conn.execute("""
                CREATE OR REPLACE TABLE facts_awards_all_time AS
            SELECT 
                    award_date,
                    awardee_name,
                    business_category,
                    organization_name,
                    area_of_delivery,
                    contract_amount,
                    award_title,
                    notice_title,
                    contract_number
                FROM source_data 
                WHERE contract_amount IS NOT NULL
                AND contract_amount != 'NULL'
                AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
                AND TRY_CAST(contract_amount AS DOUBLE) > 0
            """)
            
            # Export to parquet
            conn.execute(f"""
                COPY facts_awards_all_time TO '{os.path.join(self.parquet_dir, "facts_awards_all_time.parquet")}' (FORMAT PARQUET)
            """)
            
            self.logger.info("[OK] All-time aggregations generated successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"[ERROR] Error generating all-time aggregations: {e}")
            return False
            
    def generate_yearly_aggregations(self):
        """Generate yearly aggregated parquet files"""
        self.logger.info("[PROCESSING] Generating yearly aggregations...")
        
        try:
            conn = self.get_connection()
            
            for year in DEFAULT_YEARS:
                self.logger.info(f"  [DATE] Processing year {year}...")
                
                # Create year directory
                year_dir = os.path.join(self.yearly_dir, f"year_{year}")
                os.makedirs(year_dir, exist_ok=True)
                
                # Generate yearly aggregations for each entity type
                entity_types = ['business_category', 'contractor', 'organization', 'area']
                
                for entity_type in entity_types:
                    if entity_type == 'business_category':
                        entity_col = 'business_category'
                    elif entity_type == 'contractor':
                        entity_col = 'awardee_name'
                    elif entity_type == 'organization':
                        entity_col = 'organization_name'
                    else:  # area
                        entity_col = 'area_of_delivery'
                    
                    # Generate aggregation query
                    query = f"""
                        CREATE OR REPLACE TABLE agg_{entity_type}_year_{year} AS
                            SELECT 
                                {entity_col} as entity,
                                COUNT(*) as contract_count,
                            SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
                            AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
                            MIN(CAST(award_date AS DATE)) as first_contract_date,
                            MAX(CAST(award_date AS DATE)) as last_contract_date
                        FROM source_data 
                        WHERE EXTRACT(YEAR FROM CAST(award_date AS DATE)) = {year}
                        AND {entity_col} IS NOT NULL 
                        AND contract_amount IS NOT NULL
                        AND contract_amount != 'NULL'
                        AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
                        AND TRY_CAST(contract_amount AS DOUBLE) > 0
                            GROUP BY {entity_col}
                        ORDER BY total_contract_value DESC
                    """
                    
                    conn.execute(query)
                    
                    # Export to parquet
                    conn.execute(f"""
                        COPY agg_{entity_type}_year_{year} TO '{os.path.join(year_dir, f"agg_{entity_type}.parquet")}' (FORMAT PARQUET)
                    """)
                
                # Generate yearly facts
                conn.execute(f"""
                    CREATE OR REPLACE TABLE facts_awards_year_{year} AS
                    SELECT 
                        award_date,
                        awardee_name,
                        business_category,
                        organization_name,
                        area_of_delivery,
                        contract_amount,
                        award_title,
                        notice_title,
                        contract_number
                    FROM source_data 
                    WHERE EXTRACT(YEAR FROM CAST(award_date AS DATE)) = {year}
                    AND contract_amount IS NOT NULL
                    AND contract_amount != 'NULL'
                    AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
                    AND TRY_CAST(contract_amount AS DOUBLE) > 0
                """)
                
                # Export to parquet
                conn.execute(f"""
                    COPY facts_awards_year_{year} TO '{os.path.join(year_dir, f"facts_awards_year_{year}.parquet")}' (FORMAT PARQUET)
                """)
            
            self.logger.info("[OK] Yearly aggregations generated successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"[ERROR] Error generating yearly aggregations: {e}")
            return False
            
    def generate_quarterly_aggregations(self):
        """Generate quarterly aggregated parquet files"""
        self.logger.info("[PROCESSING] Generating quarterly aggregations...")
        
        try:
            conn = self.get_connection()
            
            for year in QUARTERLY_YEARS:
                for quarter in DEFAULT_QUARTERS:
                    self.logger.info(f"  [DATE] Processing {year} Q{quarter}...")
                    
                    # Create quarter directory
                    quarter_dir = os.path.join(self.quarterly_dir, f"year_{year}_q{quarter}")
                    os.makedirs(quarter_dir, exist_ok=True)
                    
                    # Generate quarterly aggregations for each entity type
                    entity_types = ['business_category', 'contractor', 'organization', 'area']
                    
                    for entity_type in entity_types:
                        if entity_type == 'business_category':
                            entity_col = 'business_category'
                        elif entity_type == 'contractor':
                            entity_col = 'awardee_name'
                        elif entity_type == 'organization':
                            entity_col = 'organization_name'
                        else:  # area
                            entity_col = 'area_of_delivery'
                        
                        # Generate aggregation query
                        query = f"""
                            CREATE OR REPLACE TABLE agg_{entity_type}_year_{year}_q{quarter} AS
                            SELECT 
                                {entity_col} as entity,
                                COUNT(*) as contract_count,
                                SUM(CAST(contract_amount AS DOUBLE)) as total_contract_value,
                                AVG(CAST(contract_amount AS DOUBLE)) as average_contract_value,
                                MIN(CAST(award_date AS DATE)) as first_contract_date,
                                MAX(CAST(award_date AS DATE)) as last_contract_date
                            FROM source_data 
                            WHERE EXTRACT(YEAR FROM CAST(award_date AS DATE)) = {year}
                            AND EXTRACT(QUARTER FROM CAST(award_date AS DATE)) = {quarter}
                            AND {entity_col} IS NOT NULL 
                            AND contract_amount IS NOT NULL
                            AND contract_amount != 'NULL'
                            AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
                            AND TRY_CAST(contract_amount AS DOUBLE) > 0
                            GROUP BY {entity_col}
                            ORDER BY total_contract_value DESC
                        """
                        
                        conn.execute(query)
                        
                        # Export to parquet
                        conn.execute(f"""
                            COPY agg_{entity_type}_year_{year}_q{quarter} TO '{os.path.join(quarter_dir, f"agg_{entity_type}.parquet")}' (FORMAT PARQUET)
                        """)
                    
                    # Generate quarterly facts
                    conn.execute(f"""
                        CREATE OR REPLACE TABLE facts_awards_year_{year}_q{quarter} AS
                        SELECT 
                            award_date,
                            awardee_name,
                            business_category,
                            organization_name,
                            area_of_delivery,
                            contract_amount,
                            award_title,
                            notice_title,
                            contract_number
                        FROM source_data 
                        WHERE EXTRACT(YEAR FROM CAST(award_date AS DATE)) = {year}
                        AND EXTRACT(QUARTER FROM CAST(award_date AS DATE)) = {quarter}
                        AND contract_amount IS NOT NULL
                        AND contract_amount != 'NULL'
                        AND TRY_CAST(contract_amount AS DOUBLE) IS NOT NULL
                        AND TRY_CAST(contract_amount AS DOUBLE) > 0
                    """)
                    
                    # Export to parquet
                    conn.execute(f"""
                        COPY facts_awards_year_{year}_q{quarter} TO '{os.path.join(quarter_dir, f"facts_awards_year_{year}_q{quarter}.parquet")}' (FORMAT PARQUET)
                    """)
            
            self.logger.info("[OK] Quarterly aggregations generated successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"[ERROR] Error generating quarterly aggregations: {e}")
            return False
            
    def generate_all(self):
        """Generate all parquet files"""
        self.logger.info("[START] Starting unified parquet data generation...")
        
        # Create directories
        self.create_directories()
        
        # Load source data
        if not self.load_source_data():
            return False
            
        # Generate all-time aggregations
        if not self.generate_all_time_aggregations():
            return False
            
        # Generate yearly aggregations
        if not self.generate_yearly_aggregations():
            return False
            
        # Generate quarterly aggregations
        if not self.generate_quarterly_aggregations():
            return False
            
        self.logger.info("[SUCCESS] Unified parquet data generation completed successfully!")
        return True

def main():
    """Main function"""
    print("[START] Sprint 24: Unified Parquet Data Generator")
    print("=" * 50)
    
    generator = UnifiedParquetGenerator()
    
    if generator.generate_all():
        print("[OK] All parquet files generated successfully!")
        print(f"[OUTPUT] Output directory: {generator.parquet_dir}")
    else:
        print("[ERROR] Parquet generation failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()