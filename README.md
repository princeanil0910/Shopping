# ShopNow

## Requirements
- Node.js 18 or newer
- npm 9 or newer
- Optional: MongoDB with a reachable `MONGO_URI` if you want server-side persistence

## One-time Setup
- Ensure Node.js and npm are installed
- Clone or copy the project folder to your machine

## Install Dependencies Using requirement.txt
- The file `requirement.txt` lists project directories to install
- Use one of the following commands:

Windows PowerShell:
```
Get-Content .\requirement.txt | ForEach-Object {
  if ($_ -and -not $_.StartsWith('#')) { npm install -C $_ }
}
```

Windows CMD:
```
for /f %d in (requirement.txt) do npm install -C %d
```

macOS/Linux bash:
```
while read -r d; do
  [ -z "$d" ] && continue
  case "$d" in \#*) continue;; esac
  npm install -C "$d"
done < requirement.txt
```

## Environment Variables (Server)
- Create `server/.env` with:
```
MONGO_URI=<your_mongo_connection_string_optional>
JWT_SECRET=<your_secret_string_optional>
```
- If `MONGO_URI` is not set, server will still run, but some features will use local fallback

## Run the Project
- Start backend:
```
cd server
npm start
```
- Start frontend (in a second terminal):
```
cd client
npm start
```
- Open `http://localhost:3000/` in your browser

## Notes
- Admin access is available from the top navbar link when not logged in
- Orders and tracking work with MongoDB; without it, local storage is used for basic tracking

