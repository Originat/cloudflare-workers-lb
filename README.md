---
# Cloudflare Workers：负载均衡脚本

此脚本为 Cloudflare Workers 应用，通过将请求路由到多个后端服务器（`CARS`）实现简单的负载均衡。脚本支持多种后端选择策略（随机或每日轮换），适用于需要跨多个服务器分发流量的场景。

---

### **功能特性**

1. **后端选择策略**：
   - `random`：从服务器列表中随机选择一个后端。
   - `daily`：根据当前日期选择后端，每天轮换一个服务器。
   - 默认：使用服务器列表中的第一个后端。

2. **动态主机名替换**：
   - 将传入请求的主机名替换为选定的后端服务器主机名。

3. **错误处理**：
   - 若路由发生错误，返回 `500` 状态码，并提供错误信息。

4. **静态资源回退**：
   - 如果请求不符合路由条件，将通过 `env.ASSETS` 提供静态资源。

---

### **使用方法**

1. **定义后端服务器**：
   在 `CARS` 数组中填入您的后端服务器主机名：
   ```javascript
   const CARS = [
     "后端1.example.com",
     "后端2.example.com",
     "后端3.example.com"
   ];
   ```

2. **部署脚本**：
   - 使用 Cloudflare Workers 仪表板或 Wrangler CLI 部署该脚本。

3. **测试脚本**：
   - 验证脚本是否正确将请求转发到后端服务器，可以通过检查后端日志或调试 Workers 日志实现。

---

### **代码详解**

```javascript
const CARS = [
  "site1.example.com",
  "site2.example.com",
  "site3.example.com"
];

// 后端选择策略
function selectHost(strategy = "random") {
  if (strategy === "random") {
    return CARS[Math.trunc(Math.random() * CARS.length)];
  } else if (strategy === "daily") {
    return CARS[new Date().getDate() % CARS.length];
  }
  return CARS[0]; // 默认策略
}

export default {
  async fetch(request, env) {
    try {
      // 按策略选择后端
      const host = selectHost("random");
      console.log(`请求被路由到：${host}`);

      let url = new URL(request.url);

      // 替换符合条件的请求路径的主机名
      if (url.pathname.startsWith('/')) {
        url.hostname = host;

        // 转发请求到选定的后端
        let new_request = new Request(url, request);
        return fetch(new_request);
      }

      // 如果请求不匹配，提供静态资源
      return env.ASSETS.fetch(request);
    } catch (err) {
      // 处理错误
      return new Response("发生错误：" + err.message, { status: 500 });
    }
  }
};
```

---

### **工作原理**

1. **后端选择**：
   使用 `selectHost` 函数根据指定策略选择后端服务器。

2. **请求转发**：
   - 替换传入请求的主机名为选定的后端服务器主机名。
   - 创建新请求并转发到选定后端。

3. **错误处理**：
   - 捕获并记录错误信息。
   - 返回 `500` 错误响应。

4. **静态资源回退**：
   - 如果请求不匹配路由规则，使用 `env.ASSETS` 提供静态资源。

---

### **配置说明**

- 在 `CARS` 数组中添加后端服务器。
- 根据需求调整 `selectHost` 的策略（例如 `"random"` 或 `"daily"`）。

---

### **日志记录**

- 使用 `console.log` 记录选择的后端，方便调试：
  ```javascript
  console.log(`请求被路由到：${host}`);
  ```

---

### **错误处理**

- 如果发生错误，会返回包含错误消息的响应，并打印日志便于排查问题。
- 若需要实现多后端切换，可在出错时迭代尝试其他后端。

---

### **开源协议**

此脚本基于 MIT 协议发布，您可以自由使用、修改和分发。
