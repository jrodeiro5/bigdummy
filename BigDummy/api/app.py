from flask import Flask, request, jsonify
from flask_cors import CORS
from google.oauth2.credentials import Credentials
from google.cloud import bigquery
from google.cloud.bigquery.job import QueryJobConfig
import google.auth.transport.requests
import google_auth_oauthlib.flow
import os
import json

app = Flask(__name__)
CORS(app)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# OAuth 2.0 configuration
CLIENT_SECRETS_FILE = "client_secrets.json"
SCOPES = ['https://www.googleapis.com/auth/bigquery.readonly']
GA4_DATASET_ID = os.getenv('GA4_DATASET_ID', 'analytics_XXXXXX')
BIGQUERY_PROJECT_ID = os.getenv('BIGQUERY_PROJECT_ID', 'your-project-id')

@app.route('/auth/google')
def google_auth():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES)
    flow.redirect_uri = 'http://localhost:5000/oauth2callback'
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true')
    return jsonify({'auth_url': authorization_url})

@app.route('/oauth2callback')
def oauth2callback():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES)
    flow.redirect_uri = 'http://localhost:5000/oauth2callback'
    
    authorization_response = request.url
    flow.fetch_token(authorization_response=authorization_response)
    credentials = flow.credentials
    
    return jsonify({
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
    })

@app.route('/api/schema', methods=['GET'])
def get_schema():
    credentials = get_credentials_from_request()
    client = bigquery.Client(project=BIGQUERY_PROJECT_ID, credentials=credentials)
    
    try:
        dataset_ref = client.dataset(GA4_DATASET_ID)  # User's GA4 dataset
        tables = list(client.list_tables(dataset_ref))
        
        schema = {}
        for table in tables:
            table_ref = client.get_table(table.reference)
            schema[table.table_id] = [
                {'name': field.name, 'type': field.field_type}
                for field in table_ref.schema
            ]
        
        return jsonify(schema)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/estimate', methods=['POST'])
def estimate_query():
    credentials = get_credentials_from_request()
    client = bigquery.Client(project=BIGQUERY_PROJECT_ID, credentials=credentials)
    
    query = request.json.get('query')
    job_config = QueryJobConfig(dry_run=True, use_query_cache=False)
    
    try:
        query_job = client.query(query, job_config=job_config)
        bytes_processed = query_job.total_bytes_processed
        estimated_cost = (bytes_processed / 1024 ** 4) * 5  # $5 per TB
        
        return jsonify({
            'bytes_processed': bytes_processed,
            'estimated_cost': estimated_cost
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/query', methods=['POST'])
def execute_query():
    credentials = get_credentials_from_request()
    client = bigquery.Client(project=BIGQUERY_PROJECT_ID, credentials=credentials)
    
    query = request.json.get('query')
    try:
        query_job = client.query(query)
        results = query_job.result()
        
        # Convert results to list of dicts and mask PII
        rows = []
        # Define PII fields that should be masked
        pii_fields = ['user_id', 'user_email', 'client_id', 'user_pseudo_id', 
                     'device_id', 'first_name', 'last_name', 'phone_number', 'ip_address']
        
        for row in results:
            row_dict = dict(row.items())
            # Mask all PII fields
            for field in pii_fields:
                if field in row_dict and row_dict[field]:
                    row_dict[field] = '****'
            rows.append(row_dict)
        
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_credentials_from_request():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        raise Exception('No authorization header')
    
    token = auth_header.split(' ')[1]
    return Credentials(
        token=token,
        scopes=SCOPES,
        token_uri='https://oauth2.googleapis.com/token',
        client_id=os.getenv('GOOGLE_CLIENT_ID'),
        client_secret=os.getenv('GOOGLE_CLIENT_SECRET')
    )

@app.route('/api/nlp-to-sql', methods=['POST'])
def nlp_to_sql():
    # Get the natural language query from the request
    nl_query = request.json.get('query')
    if not nl_query:
        return jsonify({'error': 'No query provided'}), 400
        
    # For now, we'll mock the NLP-to-SQL conversion
    # In a real implementation, we would call the Gemini API here
    
    # Simple logic to generate mock SQL based on the query
    sql_query = mock_nlp_to_sql(nl_query)
    
    return jsonify({
        'natural_language_query': nl_query,
        'sql_query': sql_query,
        'is_mock': True  # Flag to indicate this is a mock response
    })

def mock_nlp_to_sql(query):
    """Generate mock SQL based on natural language query for development."""
    query = query.lower()
    
    if 'revenue' in query and 'country' in query:
        return f"""SELECT 
  country, 
  SUM(event_value_in_usd) as revenue 
FROM 
  `{BIGQUERY_PROJECT_ID}.{GA4_DATASET_ID}.events_*` 
WHERE 
  event_name = 'purchase' 
  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) 
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE()) 
GROUP BY 
  country 
ORDER BY 
  revenue DESC"""
    
    elif 'users' in query and 'device' in query:
        return f"""SELECT 
  device.category as device_type, 
  COUNT(DISTINCT user_pseudo_id) as users 
FROM 
  `{BIGQUERY_PROJECT_ID}.{GA4_DATASET_ID}.events_*` 
WHERE 
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) 
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE()) 
GROUP BY 
  device_type 
ORDER BY 
  users DESC"""
    
    elif 'pageviews' in query:
        return f"""SELECT 
  page_title, 
  COUNT(*) as pageviews 
FROM 
  `{BIGQUERY_PROJECT_ID}.{GA4_DATASET_ID}.events_*` 
WHERE 
  event_name = 'page_view' 
  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) 
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE()) 
GROUP BY 
  page_title 
ORDER BY 
  pageviews DESC 
LIMIT 10"""
    
    else:
        # Default query
        return f"""SELECT 
  event_name, 
  COUNT(*) as event_count 
FROM 
  `{BIGQUERY_PROJECT_ID}.{GA4_DATASET_ID}.events_*` 
WHERE 
  _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) 
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE()) 
GROUP BY 
  event_name 
ORDER BY 
  event_count DESC 
LIMIT 10"""

if __name__ == '__main__':
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # For development only
    app.run(port=5000)