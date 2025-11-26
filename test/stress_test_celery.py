#!/usr/bin/env python3
"""
Celery Stress Test Script
Tests the queueing system with multiple concurrent tasks
"""

import requests
import time
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:3200"
NUM_TASKS = 20  # Number of tasks to submit
CONCURRENT_REQUESTS = 5  # How many to submit at once
TASK_TYPE = "search"  # Options: "export", "aggregates", "search", "analytics"

# Color codes for terminal output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'


def print_header(text):
    """Print formatted header"""
    print(f"\n{CYAN}{'='*80}")
    print(f"{text:^80}")
    print(f"{'='*80}{RESET}\n")


def print_success(text):
    """Print success message"""
    print(f"{GREEN}✓ {text}{RESET}")


def print_warning(text):
    """Print warning message"""
    print(f"{YELLOW}⚠ {text}{RESET}")


def print_error(text):
    """Print error message"""
    print(f"{RED}✗ {text}{RESET}")


def print_info(text):
    """Print info message"""
    print(f"{BLUE}ℹ {text}{RESET}")


def submit_export_task():
    """Submit an export task"""
    url = f"{API_BASE_URL}/api/v1/data-processing/tasks/export/"
    
    # Sample search criteria
    payload = {
        "contractors": ["ABC Corporation"],
        "areas": [],
        "organizations": [],
        "business_categories": [],
        "keywords": [],
        "time_ranges": []
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code in [200, 201, 202]:
            data = response.json()
            return {
                'success': True,
                'task_id': data.get('task_id'),
                'status': data.get('status'),
                'timestamp': datetime.now()
            }
        else:
            return {
                'success': False,
                'error': f"HTTP {response.status_code}: {response.text[:100]}",
                'timestamp': datetime.now()
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.now()
        }


def submit_aggregates_task():
    """Submit an aggregates computation task"""
    url = f"{API_BASE_URL}/api/v1/data-processing/tasks/aggregates/"
    
    payload = {
        "filters": {
            "contractors": [],
            "areas": [],
            "organizations": [],
            "business_categories": [],
            "keywords": [],
            "time_ranges": []
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code in [200, 201, 202]:
            data = response.json()
            return {
                'success': True,
                'task_id': data.get('task_id'),
                'status': data.get('status'),
                'timestamp': datetime.now()
            }
        else:
            return {
                'success': False,
                'error': f"HTTP {response.status_code}: {response.text[:100]}",
                'timestamp': datetime.now()
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.now()
        }


def submit_search_task():
    """Submit an advanced search task"""
    url = f"{API_BASE_URL}/api/v1/data-processing/tasks/search/"
    
    payload = {
        "filters": {
            "contractors": [],
            "areas": [],
            "organizations": [],
            "business_categories": [],
            "keywords": [],
            "time_ranges": [],
            "page": 1,
            "page_size": 20
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code in [200, 201, 202]:
            data = response.json()
            return {
                'success': True,
                'task_id': data.get('task_id'),
                'status': data.get('status'),
                'timestamp': datetime.now()
            }
        else:
            return {
                'success': False,
                'error': f"HTTP {response.status_code}: {response.text[:100]}",
                'timestamp': datetime.now()
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.now()
        }


def submit_analytics_task():
    """Submit an analytics computation task"""
    url = f"{API_BASE_URL}/api/v1/data-processing/tasks/analytics/"
    
    payload = {
        "filters": {
            "contractors": [],
            "areas": [],
            "organizations": [],
            "business_categories": [],
            "keywords": [],
            "time_ranges": []
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code in [200, 201, 202]:
            data = response.json()
            return {
                'success': True,
                'task_id': data.get('task_id'),
                'status': data.get('status'),
                'timestamp': datetime.now()
            }
        else:
            return {
                'success': False,
                'error': f"HTTP {response.status_code}: {response.text[:100]}",
                'timestamp': datetime.now()
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'timestamp': datetime.now()
        }


def check_task_status(task_id):
    """Check status of a task"""
    url = f"{API_BASE_URL}/api/v1/data-processing/tasks/status/"
    
    try:
        response = requests.get(url, params={'task_id': task_id}, timeout=5)
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except:
        return None


def get_active_tasks():
    """Get all active tasks"""
    url = f"{API_BASE_URL}/api/v1/data-processing/tasks/active/"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            return data.get('tasks', [])
        else:
            return []
    except:
        return []


def run_stress_test():
    """Run the stress test"""
    print_header("CELERY STRESS TEST")
    
    print_info(f"Configuration:")
    print(f"  API Base URL: {API_BASE_URL}")
    print(f"  Number of tasks: {NUM_TASKS}")
    print(f"  Concurrent requests: {CONCURRENT_REQUESTS}")
    print(f"  Task type: {TASK_TYPE}")
    print()
    
    # Check API connectivity
    print_info("Checking API connectivity...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/v1/", timeout=5)
        if response.status_code == 200:
            print_success("API is reachable")
        else:
            print_error(f"API returned status {response.status_code}")
            sys.exit(1)
    except Exception as e:
        print_error(f"Cannot connect to API: {e}")
        sys.exit(1)
    
    # Select task submission function
    task_functions = {
        'export': submit_export_task,
        'aggregates': submit_aggregates_task,
        'search': submit_search_task,
        'analytics': submit_analytics_task
    }
    submit_func = task_functions.get(TASK_TYPE, submit_search_task)
    
    # Submit tasks concurrently
    print_header("SUBMITTING TASKS")
    submitted_tasks = []
    failed_submissions = []
    
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=CONCURRENT_REQUESTS) as executor:
        futures = [executor.submit(submit_func) for _ in range(NUM_TASKS)]
        
        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()
            if result['success']:
                submitted_tasks.append(result)
                print_success(f"Task {i}/{NUM_TASKS} submitted: {result['task_id']}")
            else:
                failed_submissions.append(result)
                print_error(f"Task {i}/{NUM_TASKS} failed: {result['error']}")
    
    submission_time = time.time() - start_time
    
    # Summary of submissions
    print_header("SUBMISSION SUMMARY")
    print(f"  Total tasks: {NUM_TASKS}")
    print_success(f"  Successful: {len(submitted_tasks)}")
    if failed_submissions:
        print_error(f"  Failed: {len(failed_submissions)}")
    print_info(f"  Submission time: {submission_time:.2f}s")
    print_info(f"  Throughput: {NUM_TASKS/submission_time:.2f} tasks/sec")
    
    if not submitted_tasks:
        print_error("No tasks were submitted successfully!")
        return
    
    # Monitor task execution
    print_header("MONITORING TASK EXECUTION")
    print_info("Checking active tasks...")
    
    active_tasks = get_active_tasks()
    print_info(f"Active tasks in queue: {len(active_tasks)}")
    
    # Wait a bit and check statuses
    print_info("\nWaiting 5 seconds...")
    time.sleep(5)
    
    print_info("Checking task statuses...")
    completed = 0
    pending = 0
    failed = 0
    
    for task_info in submitted_tasks[:10]:  # Check first 10
        task_id = task_info['task_id']
        status_data = check_task_status(task_id)
        
        if status_data:
            status = status_data.get('status', 'unknown')
            if status in ['SUCCESS', 'completed']:
                completed += 1
                print_success(f"  {task_id}: {status}")
            elif status in ['FAILURE', 'failed']:
                failed += 1
                print_error(f"  {task_id}: {status}")
            else:
                pending += 1
                progress = status_data.get('progress', 0)
                print_info(f"  {task_id}: {status} ({progress}%)")
        else:
            print_warning(f"  {task_id}: Unable to check status")
    
    if len(submitted_tasks) > 10:
        print_info(f"  ... and {len(submitted_tasks) - 10} more tasks")
    
    print()
    print_info(f"Status breakdown (first 10 tasks):")
    print(f"  Completed: {completed}")
    print(f"  Pending: {pending}")
    print(f"  Failed: {failed}")
    
    # Final summary
    print_header("TEST COMPLETE")
    print_info("Check these tools for more details:")
    print(f"  • Flower: http://localhost:5555 (if enabled)")
    print(f"  • RabbitMQ Management: http://localhost:15672")
    print(f"  • Frontend TaskManager: http://localhost:3000")
    print(f"  • Backend logs: docker logs philgeps-celeryworker")
    print()


if __name__ == "__main__":
    try:
        run_stress_test()
    except KeyboardInterrupt:
        print_warning("\n\nTest interrupted by user")
        sys.exit(0)
    except Exception as e:
        print_error(f"\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)





