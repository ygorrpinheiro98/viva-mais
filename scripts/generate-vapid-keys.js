#!/usr/bin/env node
const webpush = require('web-push');

const vapidKeys = webpush.generateVaporKeys();

console.log('VAPID Keys gerados com sucesso!\n');
console.log('Adicione estas chaves ao seu arquivo .env.local:\n');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:seu-email@exemplo.com');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
