# BigDummy 🐘  
**Smart, Privacy-First GA4 Data Exploration for Everyone**  

![BigDummy Demo](https://via.placeholder.com/800x400/009688/FFFFFF?text=BigDummy+Demo:+Natural+Language+to+GA4+Analytics)  

### **Overview**  
BigDummy is an AI-augmented web app that lets **non-technical users** query GA4 data in BigQuery using plain English, drag-and-drop, or guided SQL. Built with GDPR compliance by design, it acts as a "dummy-proof" layer between users and BigQuery, minimizing costs and maximizing clarity.  

---

## Quick Start

### Prerequisites
- Python 3.8+ and pip
- Node.js 18+ and npm
- Google Cloud Project with GA4 + BigQuery access
- Gemini API Key (for NLP-to-SQL, not required for development)

### Initial Setup

1. **Clone & install dependencies**
   ```bash
   git clone https://github.com/your-org/bigdummy
   cd bigdummy
   pip install -r requirements.txt
   npm install
   ```

2. **Configure .env file**
   ```bash
   # Copy the example .env file and edit it
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run the development environment**
   
   **Option 1**: Using the start scripts:
   - Windows: Double-click on `start-dev.bat`
   - macOS/Linux: Run `./start-dev.sh` (make it executable first with `chmod +x start-dev.sh`)
   
   **Option 2**: Using npm:
   ```bash
   npm run start-dev
   ```
   
   **Option 3**: Run each service separately:
   ```bash
   # Terminal 1 - Backend
   python api/app.py
   
   # Terminal 2 - Frontend
   npm run dev
   ```

4. **Open the application**
   - The frontend will be available at http://localhost:5173
   - The backend API will be available at http://localhost:5000

## Features

| **For Users**                          | **For Admins**                          |  
|----------------------------------------|------------------------------------------|  
| 🔍 **Ask in English**: "Revenue by country last month?" → Auto-SQL + Chart | 🔒 **GDPR Tools**: Auto-mask PII, audit logs |  
| 🖱️ **Drag-and-Drop**: Build queries visually with GA4 dimensions/metrics | 💸 **Cost Controls**: Query size limits, budget alerts |  
| 📊 **Smart Explanations**: "This metric = sum(purchase_revenue)" | 🛠️ **Schema Sync**: Auto-detect GA4 tables/columns |  
| 🚦 **Cost Warnings**: "This query will cost ~$0.25" before running | 📁 **Team Workspaces**: Share queries securely |  

## Privacy by Design
* 🎭 **Auto-PII Masking**: Columns like `user_id` → `****`
* 🌍 **EU Data Residency**: Process data in Frankfurt/Paris via BigQuery
* 🗑️ **No Storage**: Queries/results never stored (unless explicitly saved)

## Development

### Project Structure
- `api/` - Flask backend
- `src/` - React/TypeScript frontend
- `src/components/` - UI components
- `src/store/` - State management
- `src/utils/` - Utility functions

### Adding Google Authentication
1. Create OAuth 2.0 credentials in Google Cloud Console
2. Add the credentials to `client_secrets.json`
3. Update the .env file with client ID and secret

### Adding NLP-to-SQL with Gemini
1. Get a Gemini API key from Google AI Studio
2. Add the key to your .env file
3. Implement the actual API call in the `/api/nlp-to-sql` endpoint

## Roadmap
* **v1.0**: MVP with NLP + drag-and-drop (June 2024)
* **v1.5**: Pre-built templates (Funnels, Retention) + Teams (Q3 2024)
* **v2.0**: Multi-dataset support (Shopify, Ads) + Voice queries (2025)

## Tech Stack
* **AI**: Gemini API, Claude (fallback)
* **Backend**: Python/Flask, BigQuery API
* **Frontend**: React, TypeScript, TailwindCSS
* **Privacy**: Google Cloud IAM, GDPR-compliant logging

## License
MIT License - Free for non-commercial use.
