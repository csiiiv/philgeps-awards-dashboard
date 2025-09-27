#!/usr/bin/env python3
"""
Sprint 24: Create Global Totals for Unified Parquet Architecture
Creates a simple global totals JSON file for percentage calculations
"""

import sys
import os
import pandas as pd
import json
import logging
from datetime import datetime
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class GlobalTotalsGenerator:
    def __init__(self):
        self.setup_logging()
        self.setup_paths()
        
    def setup_logging(self):
        """Setup logging configuration"""
        # Create logs directory if it doesn't exist
        log_dir = Path("logs")
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Create log file path
        log_file_path = log_dir / "global_totals_generation.log"
        
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
        self.parquet_dir = os.path.join(self.sprint_dir, "data", "parquet")
        self.generated_dir = os.path.join(self.sprint_dir, "data", "generated")
        
    def load_all_time_data(self):
        """Load all-time parquet data"""
        try:
            # Load categories from unified parquet files
            categories_file = os.path.join(self.parquet_dir, "agg_business_category.parquet")
            if not os.path.exists(categories_file):
                self.logger.error(f"Categories file not found: {categories_file}")
                return False, None, None, None
                
            self.categories_df = pd.read_parquet(categories_file)
            self.logger.info(f"Loaded {len(self.categories_df)} business categories for all_time")
            
            # Load contractors
            contractors_file = os.path.join(self.parquet_dir, "agg_contractor.parquet")
            if not os.path.exists(contractors_file):
                self.logger.error(f"Contractors file not found: {contractors_file}")
                return False, None, None, None
                
            self.contractors_df = pd.read_parquet(contractors_file)
            self.logger.info(f"Loaded {len(self.contractors_df)} contractors for all_time")
            
            # Load facts data (detailed contracts)
            facts_file = os.path.join(self.parquet_dir, "facts_awards_all_time.parquet")
            if not os.path.exists(facts_file):
                self.logger.error(f"Facts file not found: {facts_file}")
                return False, None, None, None
                
            self.contracts_df = pd.read_parquet(facts_file)
            self.logger.info(f"Loaded {len(self.contracts_df)} contract facts for all_time")
            
            return True, self.categories_df, self.contractors_df, self.contracts_df
            
        except Exception as e:
            self.logger.error(f"Error loading all_time data: {e}")
            return False, None, None, None
    
    def calculate_all_time_totals(self, categories_df, contractors_df, contracts_df):
        """Calculate totals for all-time data"""
        try:
            # Calculate basic totals
            total_contracts = categories_df['contract_count'].sum()
            total_contract_value = categories_df['total_contract_value'].sum()
            total_categories = len(categories_df)
            total_contractors = len(contractors_df)
            total_detailed_contracts = len(contracts_df)
            average_contract_value = total_contract_value / total_contracts if total_contracts > 0 else 0
            
            # Calculate value distribution
            top_10_value = categories_df.head(10)['total_contract_value'].sum()
            top_10_percentage = (top_10_value / total_contract_value) * 100 if total_contract_value > 0 else 0
            
            return {
                'time_range': 'all_time',
                'totals': {
                    'global_total_contracts': int(total_contracts),
                    'global_total_contract_value': float(total_contract_value),
                    'global_total_categories': int(total_categories),
                    'global_total_contractors': int(total_contractors),
                    'total_detailed_contracts': int(total_detailed_contracts),
                    'average_contract_value': float(average_contract_value)
                },
                'distribution': {
                    'top_10_categories_value': float(top_10_value),
                    'top_10_categories_percentage': float(top_10_percentage),
                    'remaining_categories_percentage': float(100 - top_10_percentage)
                },
                'statistics': {
                    'total_contract_value_formatted': f"₱{total_contract_value:,.2f}",
                    'average_contract_value_formatted': f"₱{average_contract_value:,.2f}",
                    'top_10_value_formatted': f"₱{top_10_value:,.2f}"
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating all_time totals: {e}")
            return None
    
    def save_global_totals(self, global_totals):
        """Save global totals to JSON file"""
        try:
            # Ensure generated directory exists
            os.makedirs(self.generated_dir, exist_ok=True)
            output_file = os.path.join(self.generated_dir, "global_totals.json")
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(global_totals, f, indent=2, ensure_ascii=False)
            
            file_size = os.path.getsize(output_file) / 1024  # KB
            self.logger.info(f"Saved global totals to {output_file} ({file_size:.2f} KB)")
            
            return output_file
            
        except Exception as e:
            self.logger.error(f"Error saving global totals: {e}")
            return None
    
    def generate_global_totals(self):
        """Generate global totals file"""
        try:
            self.logger.info("🌍 Generating global totals from unified parquet data...")
            
            # Load all-time data
            success, categories_df, contractors_df, contracts_df = self.load_all_time_data()
            if not success:
                return False
            
            # Calculate all-time totals
            all_time_totals = self.calculate_all_time_totals(categories_df, contractors_df, contracts_df)
            if not all_time_totals:
                return False
            
            # Create global totals structure
            global_totals = {
                "generated_at": datetime.now().isoformat(),
                "data_source": "PHILGEPS Clean Awarded Contracts (Unified Parquet Architecture)",
                "description": "Global totals calculated from unified parquet files for accurate percentage calculations. Only includes awarded contracts.",
                "all_time": all_time_totals,
                "yearly": {},
                "quarterly": {}
            }
            
            # Save global totals
            output_file = self.save_global_totals(global_totals)
            if not output_file:
                return False
            
            self.logger.info("✅ Global totals generated successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Error generating global totals: {e}")
            return False

def main():
    """Generate global totals file"""
    print("🌍 Generating global totals from unified parquet data...")
    
    generator = GlobalTotalsGenerator()
    
    if generator.generate_global_totals():
        print("✅ Successfully generated global totals file")
        print(f"📁 Output file: {os.path.join(generator.generated_dir, 'global_totals.json')}")
    else:
        print("❌ Failed to generate global totals file")
        sys.exit(1)

if __name__ == "__main__":
    main()