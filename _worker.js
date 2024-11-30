const CARS = [
  "site1.example.com",
  "site2.example.com",
  "site3.example.com"
];

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
      const host = selectHost("random"); // 选择策略
      console.log(`Request routed to: ${host}`);

      let url = new URL(request.url);

      if (url.pathname.startsWith('/')) {
        url.hostname = host;

        let new_request = new Request(url, request);
        return fetch(new_request);
      }

      return env.ASSETS.fetch(request);
    } catch (err) {
      return new Response("Error occurred: " + err.message, { status: 500 });
    }
  }
};
