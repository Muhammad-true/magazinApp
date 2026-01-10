// Простой скрипт для конвертации icon.png в нужные размеры
// Требует: npm install sharp

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertIcon() {
  const inputPath = path.join(__dirname, 'public', 'icon.png');
  const output192 = path.join(__dirname, 'public', 'icon-192.png');
  const output512 = path.join(__dirname, 'public', 'icon-512.png');

  try {
    // Проверяем наличие исходного файла
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Файл public/icon.png не найден!');
      process.exit(1);
    }

    console.log('🔄 Конвертация иконок...');

    // Создаем иконку 192x192
    await sharp(inputPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 26, g: 28, b: 41, alpha: 1 } // Темно-синий фон как в оригинале
      })
      .png()
      .toFile(output192);

    console.log('✅ Создан icon-192.png');

    // Создаем иконку 512x512
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 26, g: 28, b: 41, alpha: 1 }
      })
      .png()
      .toFile(output512);

    console.log('✅ Создан icon-512.png');
    console.log('🎉 Готово! Иконки созданы в папке public/');
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.log('\n💡 Попробуйте использовать create-pwa-icons.html в браузере');
  }
}

convertIcon();
