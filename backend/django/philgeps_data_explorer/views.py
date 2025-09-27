from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
import os
import json

def serve_react_app(request):
    """Serve the React application for all non-API routes"""
    # Build the path to the React app's index.html
    frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '..', 'frontend', 'dist', 'index.html')
    
    # Debug: Log the request path
    print(f"DEBUG: Serving React app for path: {request.path}")
    
    try:
        with open(frontend_path, 'r') as f:
            content = f.read()
        
        # Fix asset paths to use Django's static files.
        # Be careful not to create '/static/static/...'
        if '/static/assets/' not in content:
            content = content.replace('src="/assets/', 'src="/static/assets/')
            content = content.replace('href="/assets/', 'href="/static/assets/')
        # Replace vite icon if present and not already pointing at /static
        content = content.replace('href="/vite.svg', 'href="/static/vite.svg')
        content = content.replace('src="/vite.svg', 'src="/static/vite.svg')
        
        # Debug: Add a comment to identify the served content
        debug_comment = f"<!-- Served for path: {request.path} -->"
        content = content.replace('<head>', f'<head>\n    {debug_comment}')
        
        return HttpResponse(content)
    except FileNotFoundError:
        return HttpResponse(f"""
        <html>
            <head><title>PHILGEPS Data Explorer</title></head>
            <body>
                <h1>PHILGEPS Data Explorer</h1>
                <p>Frontend not built yet. Please run:</p>
                <pre>cd frontend && npm run build</pre>
                <p>Or access the API directly at <a href="/api/v1/">/api/v1/</a></p>
                <p>Debug: Looking for frontend at: {frontend_path}</p>
            </body>
        </html>
        """)

@require_http_methods(["GET"])
def serve_parquet_file(request, path):
    """Serve Parquet files for DuckDB-WASM"""
    parquet_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'frontend', 'parquet', path)
    
    try:
        with open(parquet_path, 'rb') as f:
            content = f.read()
        return HttpResponse(content, content_type='application/octet-stream')
    except FileNotFoundError:
        return HttpResponse('Parquet file not found', status=404)

@require_http_methods(["GET"])
def serve_worker_file(request, filename):
    """Serve DuckDB worker files"""
    worker_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'frontend', 'workers', filename)
    
    try:
        with open(worker_path, 'rb') as f:
            content = f.read()
        
        # Set appropriate content type based on file extension
        if filename.endswith('.js'):
            content_type = 'application/javascript'
        elif filename.endswith('.wasm'):
            content_type = 'application/wasm'
        else:
            content_type = 'application/octet-stream'
            
        return HttpResponse(content, content_type=content_type)
    except FileNotFoundError:
        return HttpResponse('Worker file not found', status=404)
