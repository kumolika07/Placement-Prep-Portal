/**
 * Auto-start the local MongoDB when it is not running.
 *
 * The bundled MongoDB 8.3 service is broken on this PC (0xC0000139),
 * so the project uses a portable MongoDB 7.0 install at
 * C:\Users\LENOVO\MongoDB-Portable
 *
 * This module is called from config/db.js before connecting, so that
 * `npm start` and `npm run seed` work every time, even after a reboot,
 * without the user having to start mongod manually.
 *
 * Override locations via env: MONGO_BIN, MONGO_DATA_DIR
 */
const net = require("net");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PORT = 27017;
const MONGO_BIN = process.env.MONGO_BIN || "C:\\Users\\LENOVO\\MongoDB-Portable\\bin\\mongod.exe";
const DATA_DIR = process.env.MONGO_DATA_DIR || "C:\\Users\\LENOVO\\MongoDB-Portable\\data";
const LOG_PATH = path.join(DATA_DIR, "mongod.log");

const isPortOpen = (port, host = "127.0.0.1", timeout = 1000) =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeout);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });

/**
 * Wait up to 15 minutes for mongod to open its port.
 * First start can be very slow while antivirus scans the binary.
 */
const waitForPort = async () => {
  const deadline = Date.now() + 15 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 3000));
    if (await isPortOpen(PORT)) return true;
  }
  return false;
};

/**
 * Start mongod (detached, no console window) and wait until it listens.
 */
const ensureMongoDb = async () => {
  if (await isPortOpen(PORT)) return;

  if (!fs.existsSync(MONGO_BIN)) {
    console.log(`[mongodb] mongod.exe not found at ${MONGO_BIN}`);
    console.log("[mongodb] Please start MongoDB manually or set MONGO_BIN / MONGO_DATA_DIR.");
    return;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`[mongodb] Starting mongod on port ${PORT} (first start can take several minutes)...`);
  console.log(`[mongodb] Binary: ${MONGO_BIN}`);

  const child = spawn(
    MONGO_BIN,
    ["--dbpath", DATA_DIR, "--port", String(PORT), "--bind_ip", "127.0.0.1", "--logpath", LOG_PATH],
    { detached: true, stdio: "ignore", windowsHide: true }
  );
  // Detach so mongod keeps running even if this terminal closes.
  child.unref();

  if (await waitForPort()) {
    console.log(`[mongodb] Ready (port ${PORT})`);
  } else {
    console.log("[mongodb] WARNING: mongod did not open the port in time. Check antivirus and the log:");
    console.log(`[mongodb] Log: ${LOG_PATH}`);
  }
};

module.exports = ensureMongoDb;