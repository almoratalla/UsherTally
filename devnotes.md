npx create-next-app@latest ushertally
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install prettier -D
npm install husky@latest -D
npx husky
echo “npm run format” > .husky/pre-commit
npm install @commitlint/{cli,config-conventional} --save-dev
echo "  
module.exports = {  
 extends: ['@commitlint/config-conventional'],
};  
" >> commitlint.config.js
echo "exec < /dev/tty && git cz --hook || true" > .husky/pre-commit-msg
echo "npx --no-install commitlint --edit" > .husky/commit-msg
echo "$(cat .husky/commit-msg) \"\$1\"" >> .husky/commit-msg
npm install commitizen --save-dev
commitizen init cz-conventional-changelog --save-dev --save-exact

https://cloud.google.com/firestore/docs/security/rules-query
https://www.jamesshopland.com/blog/nextjs-firebase-admin-sdk
https://firebase.google.com/docs/admin/setup#linux-or-macos
https://youtube.com/watch?v=30ydBNgDsow
