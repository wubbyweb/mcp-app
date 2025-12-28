const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use('/ui', express.static(path.join(__dirname, '../ui')));

// Mock MCP Server
// Tools
const tools = [
  {
    name: 'collect_user_info',
    description: 'Collect user information via UI',
    inputSchema: {
      type: 'object',
      properties: {
        initial: { type: 'string' }
      }
    },
    _meta: {
      'ui/resourceUri': 'ui://myform.html'
    }
  },
  {
    name: 'echo',
    description: 'Echo the input message',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  }
];



// Endpoints
app.get('/tools', (req, res) => {
  res.json({ tools });
});

app.post('/tools/:name', (req, res) => {
  const { name } = req.params;
  const args = req.body;

  if (name === 'collect_user_info') {
    const result = {
      message: 'User info collected',
      name: args.name,
      email: args.email,
      fallback: `Name: ${args.name}, Email: ${args.email}`
    };
    res.json(result);
  } else if (name === 'echo') {
    const result = {
      echoed: args.message,
      fallback: args.message
    };
    res.json(result);
  } else {
    res.status(404).json({ error: 'Tool not found' });
  }
});



app.listen(port, () => {
  console.log(`MCP Server running on http://localhost:${port}`);
});