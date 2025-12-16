// Quick smoke test for /api/chat
(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Say hello in one short sentence.' }] })
    });
    const text = await res.text();
    console.log(text);
  } catch (e) {
    console.error('Smoke test failed:', e?.message || e);
    process.exit(1);
  }
})();
