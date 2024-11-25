const backends = [
  "https://site1.example.com",
  "https://site2.example.com",
  "https://site3.example.com",
  "https://site4.example.com"
];

// 处理请求时检查健康后端
async function checkHealth() {
  const healthyBackends = [];
  for (let backend of backends) {
    try {
      const response = await fetch(`${backend}/health-check`, { method: "HEAD" });
      if (response.ok) {
        healthyBackends.push(backend);
      }
    } catch (err) {
      console.log(`Health check failed for ${backend}: ${err}`);
    }
  }
  return healthyBackends.length ? healthyBackends : [...backends];
}

async function handleRequest(request) {
  const healthyBackends = await checkHealth(); // 健康检查放到请求处理中
  for (let backend of healthyBackends) {
    try {
      const url = new URL(request.url);
      url.hostname = new URL(backend).hostname;
      const response = await fetch(url, request);
      if (response.ok) {
        return response;
      }
    } catch (err) {
      console.log(`Backend ${backend} failed: ${err}`);
    }
  }
  return new Response("All backends are unavailable", { status: 503 });
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});
