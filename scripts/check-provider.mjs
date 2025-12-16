import http from 'node:http'

const data = JSON.stringify({ messages: [{ role: 'user', content: 'provider?' }] })

const req = http.request(
  {
    hostname: '127.0.0.1',
  port: 3004,
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  },
  (res) => {
    let body = ''
    res.setEncoding('utf8')
    res.on('data', (chunk) => (body += chunk))
    res.on('end', () => {
      console.log('Status:', res.statusCode)
      console.log('Headers:', JSON.stringify(res.headers, null, 2))
      if (!body) {
        console.error('Empty body')
        return
      }
      try {
        const json = JSON.parse(body)
        console.log('Body:', JSON.stringify(json, null, 2))
      } catch (e) {
        console.error('Non-JSON response:', body)
      }
    })
  }
)

req.on('error', (err) => {
  console.error('Request error:', err && (err.code + ' ' + err.message || String(err)))
})

req.write(data)
req.end()
