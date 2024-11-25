# cloudflare-workers-lb
基于 Cloudflare Workers 的负载均衡代码

使用 KV 或 Durable Objects 缓存健康状态
因为频繁进行健康检查性能较低，利用 Cloudflare KV 或 Durable Objects 来存储健康后端的状态。健康检查的更新操作可以使用一个计划任务（Scheduled Events）来实现，而请求处理时只读取缓存。
