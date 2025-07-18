const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

async function testGroq() {
  console.log('🧪 Testing Groq API connection...\n');
  
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in .env.local');
    console.log('Please add: GROQ_API_KEY=your_key_here to .env.local');
    process.exit(1);
  }
  
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  try {
    // Test 1: Simple completion
    console.log('Test 1: Basic completion');
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a retail analytics expert.'
        },
        {
          role: 'user',
          content: 'What are the top 3 KPIs for a sari-sari store?'
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.5,
      max_tokens: 200
    });

    console.log('Response:', completion.choices[0].message.content);
    console.log('\n✅ Basic completion test passed!\n');

    // Test 2: SQL generation
    console.log('Test 2: SQL generation');
    const sqlCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a SQL expert. Generate only SQL queries, no explanations.'
        },
        {
          role: 'user',
          content: 'Show me total sales by store for last 7 days. Table: transactions (store_id, amount, timestamp)'
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.1,
      max_tokens: 150
    });

    console.log('Generated SQL:', sqlCompletion.choices[0].message.content);
    console.log('\n✅ SQL generation test passed!\n');

    // Test 3: JSON response
    console.log('Test 3: JSON structured response');
    const jsonCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Analyze this data and return JSON: Sales: 1000, Customers: 50, Products: 20. Format: {"insights": [...], "recommendations": [...]}'
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const jsonResponse = JSON.parse(jsonCompletion.choices[0].message.content);
    console.log('JSON Response:', JSON.stringify(jsonResponse, null, 2));
    console.log('\n✅ JSON response test passed!\n');

    console.log('🎉 All Groq API tests passed successfully!');
    console.log('\nYour RetailBot is ready to use with:');
    console.log('- Model: mixtral-8x7b-32768');
    console.log('- Natural language queries ✓');
    console.log('- SQL generation ✓');
    console.log('- Structured responses ✓');

  } catch (error) {
    console.error('❌ Groq API test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testGroq();