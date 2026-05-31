const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'assets/images/tabIcons');
const destDir = path.join(root, 'android/app/src/main/res/drawable');

const mapping = [
  ['home.png', 'tab_ic_home.png'],
  ['chat.png', 'tab_ic_chat.png'],
  ['user.png', 'tab_ic_user.png'],
];

fs.mkdirSync(destDir, { recursive: true });

for (const [from, to] of mapping) {
  fs.copyFileSync(path.join(srcDir, from), path.join(destDir, to));
}

console.log('Synced tab icons to android/app/src/main/res/drawable/');
