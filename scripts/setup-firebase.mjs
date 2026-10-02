import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'academia-aura';
const APP_NAME = 'academia-aura-web';

console.log(`\n======================================================`);
console.log(`🔥 ACADEMIA AURA - CONFIGURAÇÃO AUTOMATIZADA FIREBASE`);
console.log(`======================================================\n`);

function run(cmd, capture = true) {
  try {
    return execSync(cmd, {
      encoding: 'utf-8',
      stdio: capture ? ['pipe', 'pipe', 'pipe'] : 'inherit',
    });
  } catch (err) {
    if (capture && err.stderr) {
      return {
        error: err.stderr.toString(),
        stdout: err.stdout?.toString() || '',
      };
    }
    throw err;
  }
}

try {
  // 1. Check CLI login
  console.log(`1️⃣  Verificando autenticação no Firebase CLI...`);
  const userCheck = run('npx -y firebase-tools@latest login:list');
  if (typeof userCheck === 'object' && userCheck.error) {
    console.error(`❌ Você precisa estar autenticado no Firebase CLI.`);
    console.error(`Execute no seu terminal: npx firebase-tools login`);
    process.exit(1);
  }
  console.log(`✅ Autenticado com sucesso!`);

  // 2. Select project
  console.log(`2️⃣  Selecionando projeto ${PROJECT_ID}...`);
  run(`npx -y firebase-tools@latest use ${PROJECT_ID}`);
  console.log(`✅ Projeto ativo: ${PROJECT_ID}`);

  // 3. Check or Create Web App
  console.log(`3️⃣  Verificando aplicativos Web no projeto...`);
  const appsListRaw = run(`npx -y firebase-tools@latest apps:list WEB --project ${PROJECT_ID} --json`);
  let appId = null;

  try {
    const parsed = JSON.parse(appsListRaw);
    const existing = parsed.result?.find((a) => a.displayName === APP_NAME || a.displayName === 'academia-aura');
    if (existing) {
      appId = existing.appId;
      console.log(`✅ Aplicativo Web existente encontrado: ${existing.displayName} (${appId})`);
    }
  } catch (e) {
    // ignore parse error and proceed to create
  }

  if (!appId) {
    console.log(`Criando novo Web App '${APP_NAME}' no projeto ${PROJECT_ID}...`);
    const createRaw = run(`npx -y firebase-tools@latest apps:create WEB ${APP_NAME} --project ${PROJECT_ID} --json`);
    try {
      const parsedCreate = JSON.parse(createRaw);
      appId = parsedCreate.result?.appId;
      console.log(`✅ Web App registrado com sucesso! App ID: ${appId}`);
    } catch (e) {
      console.log(`Output:`, createRaw);
    }
  }

  // 4. Fetch SDK config
  if (appId) {
    console.log(`4️⃣  Buscando credenciais do SDK para App ID ${appId}...`);
    const sdkResult = run(`npx -y firebase-tools@latest apps:sdkconfig WEB ${appId} --project ${PROJECT_ID}`);
    const sdkRaw = typeof sdkResult === 'string' ? sdkResult : sdkResult.stdout;
    let sdkConfig;
    try {
      sdkConfig = JSON.parse(sdkRaw);
    } catch {
      throw new Error(typeof sdkResult === 'string'
        ? 'O Firebase CLI retornou uma configuração do SDK inválida.'
        : sdkResult.error || 'O Firebase CLI não retornou a configuração do SDK.');
    }

    if (sdkConfig.apiKey) {
      const envContent = `# Gerado automaticamente por setup-firebase.mjs
VITE_FIREBASE_API_KEY=${sdkConfig.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${sdkConfig.authDomain || `${PROJECT_ID}.firebaseapp.com`}
VITE_FIREBASE_PROJECT_ID=${sdkConfig.projectId || PROJECT_ID}
VITE_FIREBASE_STORAGE_BUCKET=${sdkConfig.storageBucket || `${PROJECT_ID}.firebasestorage.app`}
VITE_FIREBASE_MESSAGING_SENDER_ID=${sdkConfig.messagingSenderId || ''}
VITE_FIREBASE_APP_ID=${sdkConfig.appId || appId}
`;
      fs.writeFileSync(path.resolve(process.cwd(), '.env.local'), envContent);
      console.log(`✅ Arquivo .env.local criado e configurado com as chaves reais do Firebase!`);
    } else {
      throw new Error('A configuração retornada pelo Firebase não contém uma API key.');
    }
  }

  // 5. Deploy Auth configuration & Firestore Rules
  console.log(`5️⃣  Publicando configuração de Autenticação e Regras do Firestore...`);
  const deployAuth = run(`npx -y firebase-tools@latest deploy --only auth,firestore:rules --project ${PROJECT_ID}`);
  if (typeof deployAuth !== 'string') {
    throw new Error(deployAuth.error || 'O Firebase CLI falhou durante o deploy.');
  }
  console.log(deployAuth);
  console.log(`✅ Autenticação por Email/Senha e Regras de Segurança publicadas!`);

  console.log(`\n🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!`);
  console.log(`Inicie o servidor de desenvolvimento com: npm run dev\n`);
} catch (globalErr) {
  console.error(`Erro durante o setup:`, globalErr.message || globalErr);
  process.exitCode = 1;
}
