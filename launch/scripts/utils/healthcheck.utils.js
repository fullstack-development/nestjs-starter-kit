const fetch = require("node-fetch").default;
const net = require("net");

async function ping() {
  try {
    const host = process.argv[3];
    const port = parseInt(process.argv[4]);
    const timeout = parseInt(process.argv[5]) || 2000;
    const sock = new net.Socket();
    sock.setTimeout(timeout);
    sock
      .on("connect", function () {
        sock.destroy();
        process.exit(0);
      })
      .on("error", function (e) {
        console.error(e);
        process.exit(1);
      })
      .on("timeout", function (e) {
        console.error("Timeout");
        process.exit(2);
      })
      .connect(port, host);
  } catch (e) {
    console.error(e);
    process.exit(3);
  }
}

async function http() {
  try {
    const method = process.argv[3];
    const host = process.argv[4];
    const port = parseInt(process.argv[5]);
    const path = process.argv[6] || "";
    const options = {
      host,
      port: `${port}`,
      path,
      method,
    };
    const response = await fetch(`http://${host}:${port}/${path}`, {
      method,
    });
    console.log(response.status);
    if (response.status === 200) {
      process.exit(0);
    } else {
      console.error(JSON.stringify(response.body).toString());
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(2);
  }
}

async function run() {
  const kind = process.argv[2];
  switch (kind) {
    case "ping":
      await ping();
      break;
    case "http":
      await http();
      break;
    default:
      console.error("Unknown health check");
      process.exit(999);
  }
}
run();
