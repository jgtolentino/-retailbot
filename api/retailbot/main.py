from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from datetime import datetime
from groq import Groq
import asyncpg
import json

app = FastAPI(title="Scout RetailBot API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://cxzllzyxwpyptfretryc.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

# Models
class QueryRequest(BaseModel):
    text: str
    filters: Optional[Dict[str, Any]] = None
    context: Optional[str] = "general"
    
class InsightResponse(BaseModel):
    query: str
    answer: str
    data: List[Dict[str, Any]]
    visualization: Optional[Dict[str, Any]] = None
    confidence: float
    sources: List[str]
    follow_up: List[str]
    timestamp: str

# Database connection
async def get_db():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()

# Retail analytics functions
async def generate_sql_query(query_text: str, filters: Dict = None) -> str:
    """Use Groq to convert natural language to SQL"""
    
    prompt = f"""
    Convert this retail analytics query to PostgreSQL:
    Query: "{query_text}"
    
    Available tables and columns:
    - transactions: id, timestamp, store_id, store_name, location, product_name, 
                   product_category, brand, amount, quantity, payment_method
    - iot_telemetry: device_id, timestamp, temperature, humidity, battery_level
    - gold_store_performance: store_id, period_start, total_revenue, transaction_count
    
    Filters: {json.dumps(filters) if filters else "None"}
    
    Return ONLY the SQL query, no explanations.
    """
    
    response = await groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a SQL expert for retail analytics."},
            {"role": "user", "content": prompt}
        ],
        model="mixtral-8x7b-32768",
        temperature=0.1,
        max_tokens=500
    )
    
    return response.choices[0].message.content.strip()

async def execute_query(conn: asyncpg.Connection, sql: str) -> List[Dict]:
    """Execute SQL and return results"""
    try:
        # Basic SQL injection prevention
        sql = sql.replace(";", "").strip()
        
        # Execute query
        rows = await conn.fetch(sql)
        
        # Convert to list of dicts
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Query execution error: {e}")
        return []

async def generate_insights(query: str, data: List[Dict]) -> Dict:
    """Use Groq to generate insights from data"""
    
    prompt = f"""
    Analyze this retail data and provide actionable insights:
    
    Question: "{query}"
    Data (first 20 rows): {json.dumps(data[:20], default=str)}
    Total rows: {len(data)}
    
    Provide a JSON response with:
    {{
        "answer": "Clear, actionable answer",
        "key_findings": ["finding1", "finding2"],
        "visualization": {{
            "type": "line|bar|pie",
            "title": "Chart title",
            "x_axis": "column_name",
            "y_axis": "column_name"
        }},
        "confidence": 0.0-1.0,
        "recommendations": ["action1", "action2"],
        "follow_up": ["question1", "question2"]
    }}
    """
    
    response = await groq_client.chat.completions.create(
        messages=[
            {
                "role": "system", 
                "content": "You are Scout RetailBot, providing insights for sari-sari store owners."
            },
            {"role": "user", "content": prompt}
        ],
        model="mixtral-8x7b-32768",
        temperature=0.3,
        max_tokens=1000,
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Scout RetailBot",
        "version": "1.0.0",
        "endpoints": ["/query", "/health", "/examples"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/query", response_model=InsightResponse)
async def query_retail_data(
    request: QueryRequest,
    conn: asyncpg.Connection = Depends(get_db)
):
    """Main endpoint for retail analytics queries"""
    try:
        # Generate SQL from natural language
        sql_query = await generate_sql_query(request.text, request.filters)
        
        # Execute query
        data = await execute_query(conn, sql_query)
        
        if not data:
            raise HTTPException(status_code=404, detail="No data found for query")
        
        # Generate insights
        insights = await generate_insights(request.text, data)
        
        # Build response
        return InsightResponse(
            query=request.text,
            answer=insights.get("answer", ""),
            data=data[:100],  # Limit response size
            visualization=insights.get("visualization"),
            confidence=insights.get("confidence", 0.7),
            sources=["transactions", "iot_telemetry"],
            follow_up=insights.get("follow_up", []),
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/examples")
async def get_example_queries():
    """Return example queries for the UI"""
    return {
        "examples": [
            {
                "category": "Sales Analysis",
                "queries": [
                    "What are my top selling products this week?",
                    "Show me sales trends for the last month",
                    "Which payment methods are most popular?"
                ]
            },
            {
                "category": "Store Performance",
                "queries": [
                    "Which stores have the highest revenue?",
                    "Compare store performance by location",
                    "What are peak shopping hours?"
                ]
            },
            {
                "category": "Predictive Analytics",
                "queries": [
                    "Predict sales for next week",
                    "What products should I stock more of?",
                    "When should I run promotions?"
                ]
            },
            {
                "category": "IoT Insights",
                "queries": [
                    "How does temperature affect sales?",
                    "Show me device health status",
                    "Alert me about sensor anomalies"
                ]
            }
        ]
    }

# Specialized endpoints
@app.post("/predict")
async def predict_sales(
    store_id: str,
    days: int = 7,
    conn: asyncpg.Connection = Depends(get_db)
):
    """Predict future sales using ML"""
    request = QueryRequest(
        text=f"Predict sales for store {store_id} for next {days} days",
        context="predictive"
    )
    return await query_retail_data(request, conn)

@app.post("/recommend")
async def get_recommendations(
    store_id: str,
    type: str = "inventory",
    conn: asyncpg.Connection = Depends(get_db)
):
    """Get AI-powered recommendations"""
    queries = {
        "inventory": f"What products should store {store_id} stock based on demand?",
        "pricing": f"Suggest optimal pricing for store {store_id}",
        "promotion": f"When should store {store_id} run promotions?"
    }
    
    request = QueryRequest(
        text=queries.get(type, queries["inventory"]),
        context=type
    )
    return await query_retail_data(request, conn)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)