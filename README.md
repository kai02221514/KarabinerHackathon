## 環境構築

### [github ssh接続](https://qiita.com/shizuma/items/2b2f873a0034839e47ce)

### [Dockerダウンロード](https://www.docker.com/ja-jp/get-started/)

### [supabaseのローカルサーバ立ち上げ](https://zenn.dev/manase/articles/36c41271bbffa2)

### [denoダウンロード](https://yoshixmk.github.io/deno-manual-ja/getting_started/installation.html)

Deno起動コード例

```
deno run -A --env-file=.env.local supabase/functions/server/index.tsx
```

サーバの起動チェック

```
curl -i http://localhost:8000/make-server-f1e05698/health
```
