# 申請管理アプリ

This is a code bundle for 申請管理アプリ. The original project is available at https://www.figma.com/design/59Mb3RJBrlGKo9uSlXkku7/%E7%94%B3%E8%AB%8B%E7%AE%A1%E7%90%86%E3%82%A2%E3%83%97%E3%83%AA.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

# 環境構築
## [github ssh接続](https://qiita.com/shizuma/items/2b2f873a0034839e47ce)
## [supabaseのローカルサーバ立ち上げ](https://zenn.dev/manase/articles/36c41271bbffa2)
## [denoダウンロード](https://yoshixmk.github.io/deno-manual-ja/getting_started/installation.html)

Deno起動コード例
```
deno run -A --env-file=.env.local supabase/functions/server/index.tsx
```
