const backends = [
  "https://site1.example.com",
  "https://site2.example.com",
  "https://site3.example.com",
  "https://site4.example.com"
];

let cachedHealthyBackends = [...backends]; // 用于缓存的健康后端列表

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // 使用缓存的健康后端列表
  for (let backend of cachedHealthyBackends) {
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

// 定期更新健康后端列表（通过计划任务触发）
addEventListener("scheduled", async event => {
  cachedHealthyBackends = await updateHealthyBackends();
});

// 健康检查逻辑
async function updateHealthyBackends() {
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
