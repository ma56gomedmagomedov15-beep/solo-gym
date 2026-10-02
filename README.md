# Solo Leveling — приложение 🏋️

## Вариант 1: Electron (приложение для ПК — Windows/Mac/Linux)

Нужен установленный [Node.js](https://nodejs.org) (LTS версия).

```bash
cd solo_leveling_app
npm install
npm start
```

Чтобы собрать установщик (.exe / .dmg):
```bash
npm install --save-dev electron-builder
npx electron-builder
```
Готовый установщик появится в папке `dist/`.

## Вариант 2: PWA (установка на телефон без магазинов)

1. Залей папку на любой бесплатный хостинг (Netlify, GitHub Pages, Vercel)
2. Открой сайт в браузере телефона
3. **Android (Chrome):** меню ⋮ → «Установить приложение»
4. **iPhone (Safari):** кнопка «Поделиться» → «На экран "Домой"»

Приложение появится на рабочем столе как обычное, работает офлайн!

## Вариант 3: Быстрый EXE через electron-packager

```bash
npm install -g electron-packager
electron-packager . SoloGym --platform=win32 --arch=x64
```
