# Chat App (GitHub + Render)

**概要**
React + Vite フロントエンド、Node/Express + Socket.IO バックエンド、Postgres を使ったチャットアプリ。
ユーザーは `username + password` で登録（メール認証なし）。ルームは任意でパスワード保護。

**セットアップ（ローカル）**
1. Postgres を用意して `server/.env` を作成（`DATABASE_URL` を設定）。
2. サーバー:
   cd server
   npm install
   npm run start
3. フロント:
   cd frontend
   npm install
   npm run dev

**デプロイ（Render）**
- GitHub にこのリポジトリを push
- Render で Web Service を 2 つ作成（server と frontend）
- Render Postgres を作成し、`DATABASE_URL` を server の環境変数に設定
- server の環境変数に `JWT_SECRET` を設定
- `render.yaml` を使えば自動設定可能

**注意**
- パスワードは bcrypt でハッシュ化
- ルームパスワードもハッシュ保存
