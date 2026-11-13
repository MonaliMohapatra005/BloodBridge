# Sharing Swagger UI via Port Forwarding & Tunnels

This guide explains how to share your local **BloodBridge Swagger UI** (`http://localhost:5000/api-docs`) with other developers, testers, or clients **without deploying your backend to cloud hosting**.

---

## ⚡ Prerequisites
Make sure your backend server is running in a terminal:
```bash
cd server
npm run dev
```
Verify it is running locally at: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## Method 1: VS Code Built-in Port Forwarding (Recommended — Zero Install)
If you are working in **VS Code** or **Cursor**, port forwarding is built right in:

1. Look at the bottom panel in VS Code (where the **Terminal** is).
2. Click on the **Ports** tab (next to *Terminal*, *Output*, *Problems*).
3. Click **"Forward a Port"** (or the `+` icon) and type `5000`.
4. Right-click on the newly added port `5000` $\rightarrow$ **Port Visibility** $\rightarrow$ change from **Private** to **Public**.
5. Right-click the forwarded row and select **Copy Forwarded Address**.
   *(It will look like: `https://xxxx-5000.inc1.devtunnels.ms`)*
6. Append `/api-docs` and send the link:
   ```text
   https://xxxx-5000.inc1.devtunnels.ms/api-docs
   ```

---

## Method 2: `localtunnel` (Instant One-Command CLI — No Account Needed)
You can generate an instant public HTTPS tunnel directly using `npx`:

1. Keep your backend running on port 5000.
2. Open a **second terminal window** and run:
   ```bash
   npx localtunnel --port 5000
   ```
3. It will generate a public address:
   ```text
   your url is: https://brave-tiger-84.loca.lt
   ```
4. Append `/api-docs` and share it:
   ```text
   https://brave-tiger-84.loca.lt/api-docs
   ```
> **Note on First Visit:** `localtunnel` shows a friendly anti-phishing reminder asking for the host's public IP. The user can get yours by visiting [loca.lt/mytunnelpassword](https://loca.lt/mytunnelpassword) or you can send them your IP once.

---

## Method 3: `ngrok` (Most Stable & Standard)
`ngrok` is the industry standard for secure local tunneling:

1. Install ngrok (if not already installed):
   ```bash
   npm install -g ngrok
   ```
2. Start the tunnel on port 5000:
   ```bash
   ngrok http 5000
   ```
3. Copy the **Forwarding** address (e.g. `https://a1b2-c3d4.ngrok-free.app`).
4. Append `/api-docs` and share:
   ```text
   https://a1b2-c3d4.ngrok-free.app/api-docs
   ```

---

## Method 4: Cloudflare Quick Tunnels (Zero Sign-up & No Warning Screens)
Cloudflare provides free, high-speed temporary tunnels without account registration:

```bash
npx untun tunnel http://localhost:5000
```
It immediately generates a clean `https://*.trycloudflare.com` URL. Share it with `/api-docs`:
```text
https://<random-id>.trycloudflare.com/api-docs
```

---

## 🛠️ Why "Try it Out" Works Out of the Box
In `src/swagger/swagger.yml`, the server is configured with relative root routing:
```yaml
servers:
  - url: /
    description: Current Host (Works dynamically with Port Forwarding, Tunnels & Localhost)
```
Whenever someone clicks **"Try it out"** $\rightarrow$ **"Execute"** on your forwarded Swagger link, all API requests automatically route through the tunnel to your backend without breaking.

---

## 🔒 Security Best Practice
When you are done sharing your local API:
* In VS Code: Right-click the port and select **Stop Forwarding Port**.
* In Terminal (`localtunnel` / `ngrok` / `untun`): Press `Ctrl + C` to close the tunnel.
