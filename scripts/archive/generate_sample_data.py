#!/usr/bin/env python3
"""
Sample Data Generator for PHILGEPS Data Explorer
Creates interesting demo data for community demonstration
"""

import os
import sys
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# Add Django to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root / "backend" / "django"))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'philgeps_data_explorer.settings')

import django
django.setup()

from contracts.models import Contract, Organization, Contractor, BusinessCategory, AreaOfDelivery

def generate_sample_data():
    """Generate interesting sample data for demonstration"""
    
    print("🎯 Generating sample data for PHILGEPS Data Explorer demo...")
    
    # Sample organizations
    organizations = [
        "Department of Public Works and Highways",
        "Department of Education",
        "Department of Health",
        "Department of Transportation",
        "Department of Agriculture",
        "Department of Energy",
        "Department of Environment and Natural Resources",
        "Department of Social Welfare and Development",
        "Department of Trade and Industry",
        "Department of Science and Technology"
    ]
    
    # Sample contractors
    contractors = [
        "ABC Construction Corp.",
        "XYZ Engineering Services",
        "Metro Builders Inc.",
        "Pacific Infrastructure Ltd.",
        "Green Solutions Co.",
        "Tech Innovations Inc.",
        "Urban Development Corp.",
        "Coastal Engineering Group",
        "Mountain View Construction",
        "Valley Builders Association"
    ]
    
    # Sample business categories
    categories = [
        "Construction and Infrastructure",
        "Information Technology",
        "Healthcare Services",
        "Educational Services",
        "Transportation and Logistics",
        "Environmental Services",
        "Energy and Utilities",
        "Food and Agriculture",
        "Manufacturing",
        "Consulting Services"
    ]
    
    # Sample areas of delivery
    areas = [
        "Metro Manila",
        "Cebu",
        "Davao",
        "Iloilo",
        "Baguio",
        "Cagayan de Oro",
        "Zamboanga",
        "Bacolod",
        "Iligan",
        "General Santos"
    ]
    
    # Create organizations
    print("📋 Creating organizations...")
    org_objects = []
    for name in organizations:
        org, created = Organization.objects.get_or_create(
            name=name
        )
        org_objects.append(org)
    
    # Create contractors
    print("🏢 Creating contractors...")
    contractor_objects = []
    for name in contractors:
        contractor, created = Contractor.objects.get_or_create(
            name=name
        )
        contractor_objects.append(contractor)
    
    # Create business categories
    print("📂 Creating business categories...")
    category_objects = []
    for name in categories:
        category, created = BusinessCategory.objects.get_or_create(
            name=name
        )
        category_objects.append(category)
    
    # Create areas of delivery
    print("📍 Creating areas of delivery...")
    area_objects = []
    for name in areas:
        area, created = AreaOfDelivery.objects.get_or_create(
            name=name
        )
        area_objects.append(area)
    
    # Create sample contracts
    print("📄 Creating sample contracts...")
    
    contract_titles = [
        "Road Construction and Maintenance",
        "School Building Construction",
        "Hospital Equipment Supply",
        "IT Infrastructure Development",
        "Water System Improvement",
        "Bridge Construction",
        "Educational Materials Supply",
        "Healthcare Services",
        "Transportation Services",
        "Environmental Assessment"
    ]
    
    for i in range(50):  # Create 50 sample contracts
        # Random dates within last 3 years
        start_date = datetime.now() - timedelta(days=random.randint(30, 1095))
        award_date = start_date + timedelta(days=random.randint(1, 30))
        
        contract = Contract.objects.create(
            notice_title=f"{random.choice(contract_titles)} - Project {i+1}",
            award_title=f"Awarded: {random.choice(contract_titles)} - Project {i+1}",
            reference_id=f"REF-{i+1:04d}",
            contract_no=f"CONTRACT-{i+1:04d}",
            organization=random.choice(org_objects),
            contractor=random.choice(contractor_objects),
            business_category=random.choice(category_objects),
            area_of_delivery=random.choice(area_objects),
            total_contract_amount=random.uniform(100000, 5000000),  # 100K to 5M pesos
            award_date=award_date,
            contract_effectivity_date=start_date,
            contract_end_date=start_date + timedelta(days=random.randint(30, 365)),
            award_status=random.choice(['awarded', 'completed', 'ongoing']),
            reason_for_award=f"Sample contract for {random.choice(contract_titles).lower()} in {random.choice(areas)}"
        )
    
    print("✅ Sample data generation complete!")
    print(f"📊 Created:")
    print(f"  • {len(org_objects)} organizations")
    print(f"  • {len(contractor_objects)} contractors")
    print(f"  • {len(category_objects)} business categories")
    print(f"  • {len(area_objects)} areas of delivery")
    print(f"  • 50 sample contracts")
    print("")
    print("🎉 Demo data is ready! Run the demo to see it in action.")

if __name__ == "__main__":
    generate_sample_data()
