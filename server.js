const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;
const WINDOW_SIZE = 10;
let numberWindow = [];  

 const credentials = {
  email: "sravanjangam88@gmail.com",
  name: "sravan",
  rollNo: "22q61a6718",
  accessCode: "dJFufE",
  clientID: "b9950273-8e23-4505-953a-5828e1a187d9",
  clientSecret: "qfvhNWsvFgeCbYSw",
};
 
let ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MjQwMTUwLCJpYXQiOjE3NDgyMzk4NTAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImI5OTUwMjczLThlMjMtNDUwNS05NTNhLTU4MjhlMWExODdkOSIsInN1YiI6InNyYXZhbmphbmdhbTg4QGdtYWlsLmNvbSJ9LCJlbWFpbCI6InNyYXZhbmphbmdhbTg4QGdtYWlsLmNvbSIsIm5hbWUiOiJzcmF2YW4iLCJyb2xsTm8iOiIyMnE2MWE2NzE4IiwiYWNjZXNzQ29kZSI6ImRKRnVmRSIsImNsaWVudElEIjoiYjk5NTAyNzMtOGUyMy00NTA1LTk1M2EtNTgyOGUxYTE4N2Q5IiwiY2xpZW50U2VjcmV0IjoicWZ2aE5Xc3ZGZ2VDYllTdyJ9.UdBrbRu_PnfYa_va8nKzq5vwbu2xZOGeqP8w6n9fP60";

 
const numberTypeToUrl = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand',
};

 
async function refreshToken() {
  try {
    const response = await axios.post('http://20.244.56.144/evaluation-service/auth', credentials, {
      timeout: 400,
      headers: { 'Content-Type': 'application/json' },
    });
    ACCESS_TOKEN = response.data.access_token;
    console.log('Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    return false;
  }
}
 
async function fetchNumbers(numberType) {
  try {
    const response = await axios.get(numberTypeToUrl[numberType], {
      timeout: 400,  
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    return response.data.numbers || [];
  } catch (error) {
    if (error.response && error.response.status === 401) {
 
      const refreshed = await refreshToken();
      if (refreshed) { 
        try {
          const retryResponse = await axios.get(numberTypeToUrl[numberType], {
            timeout: 400,
            headers: {
              Authorization: `Bearer ${ACCESS_TOKEN}`,
            },
          });
          return retryResponse.data.numbers || [];
        } catch (retryError) {
          console.error(`Retry failed for ${numberType}:`, retryError.message);
          return [];
        }
      }
    }
    console.error(`Error fetching numbers for ${numberType}:`, error.message);
    return [];
  }
}

 
app.get('/numbers/:numberid', async (req, res) => {
  const startTime = Date.now();
  const { numberid } = req.params;

   
  if (!['p', 'f', 'e', 'r'].includes(numberid)) {
    return res.status(400).json({ error: 'Invalid number ID. Use p, f, e, or r.' });
  }
 
  const newNumbers = await fetchNumbers(numberid);
 
  const windowPrev = [...numberWindow];

   
  const uniqueNewNumbers = [...new Set(newNumbers)]; 
  for (let num of uniqueNewNumbers) {
    if (numberWindow.length < WINDOW_SIZE) {
      numberWindow.push(num);
    } else {
      numberWindow.shift();  
      numberWindow.push(num);
    }
  }

  
  const windowCurr = [...numberWindow];
  const avg = windowCurr.length > 0
    ? Number((windowCurr.reduce((sum, num) => sum + num, 0) / windowCurr.length).toFixed(2))
    : 0;

 
  const elapsedTime = Date.now() - startTime;
  if (elapsedTime > 500) {
    return res.status(504).json({ error: 'Response took too long' });
  }

   
  res.json({
    windowPrev,
    windowCurr,
    numbers: newNumbers,
    avg,
  });
});

 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});