# Academia Aura — Plataforma Integrada de Treino, Dieta & Evolução Física (SPA)

Plataforma completa e responsiva desenvolvida em **React 18 + TypeScript + Vite + Tailwind CSS + Firebase (Authentication & Firestore)** para acompanhamento físico e nutricional integrado com personalização visual de temas por usuário.

---

## 🌟 Principais Recursos

### 1. Perfil & Autenticação
- **Autenticação Individual**: Cadastro e login por E-mail e Senha via Firebase Auth, redefinição de senha com tratamento de erros em português.
- **Acesso Demonstração Instantâneo**: Botão de 1 clique para explorar a plataforma imediatamente com perfil completo.
- **Metas Corporais e Energéticas**: Metas de peso (kg), calorias diárias (kcal), peso inicial/atual, altura e nível de atividade física.
- **Histórico de Peso Interativo**: Registro de pesagens com validação estrita (sem datas futuras, valores estritamente positivos) e gráfico de evolução temporal com linha de meta (Recharts).
- **Personalização de Tema por Usuário**: 5 temas visuais persistidos no Firestore e no navegador:
  - 🌙 *Escuro Minimalista*
  - ☀️ *Claro Clean*
  - 🌿 *Verde Aura (Florestal)*
  - ⚡ *Cyberpunk Neon*
  - 🌅 *Sunset Amber*

### 2. Módulo Treino & Sobrecarga
- **Biblioteca de Exercícios**: Cadastro e filtragem por grupos musculares (Peito, Costas, Pernas, Ombros, Braços, Abdômen, Cardio) e equipamentos (Barra, Halteres, Polia, Máquina, Peso Corporal, Aparelhos Cardio).
- **Registro Detalhado de Sessões**: Registro de séries individuais com carga (kg), repetições, status de conclusão e blocos de cardio com intensidade e distância.
- **Cálculo Automático de Volume (Tonelagem)**: Soma da tonelagem total levantada $\sum(\text{carga} \times \text{reps})$.
- **Diagnóstico Automático de Progressão**: Comparação automática com a sessão anterior:
  - 🟢 **Evoluindo**: Ganho $\ge +2\%$ na tonelagem/volume (sobrecarga progressiva consolidada).
  - 🟡 **Estagnado**: Variação dentro de $\pm 2\%$ (manutenção de estabilidade de carga).
  - 🔴 **Regredindo**: Queda $\le -2\%$ de volume (sinal para avaliação de fadiga/recuperação).
- **Gasto Calórico Estimado do Treino**: Calculado dinamicamente com base em METs de musculação e intensidades de cardio ajustadas pelo peso corporal do usuário.
- **Gráficos de Desempenho**: Histórico de tonelagem e calorias gastas por treino.

### 3. Módulo Dieta & Balanço Calórico
- **Biblioteca de Alimentos**: Cadastro de alimentos com porção de referência (g, ml ou unidade) e macronutrientes detalhados (Calorias, Proteínas, Carboidratos, Gorduras, Fibras).
- **Diário de Refeições**: Registro categorizado por tipo de refeição (*Café da Manhã, Almoço, Lanche da Tarde, Jantar, Ceia*).
- **Balanço Calórico Dinâmico**:
  $$\text{Balanço Líquido} = \text{Calorias Ingeridas} - (\text{TDEE Basal/Rotina} + \text{Gasto dos Treinos do Dia})$$
- **Distribuição de Macronutrientes**: Gráfico em pizza (Donut) interativo detalhando calorias e gramas de proteínas, carboidratos e lipídios.

### 4. Painel de Insights Integrado
- **Cruzamento Dinâmico Multidimensional**: Correlaciona em um gráfico sincronizado de múltiplos eixos o volume total de treino (kg), ingestão calórica diária (kcal) e flutuações na balança (kg).
- **Diagnóstico Algorítmico do Ciclo**:
  - *Definição com Preservação de Massa Magra* (Déficit calórico + volume mantido/em alta + perda de peso).
  - *Hipertrofia Ativa* (Superávit calórico controlado + ganho de volume + ganho de peso).
  - *Recomposição Corporal* (Oscilação mínima na balança com alto volume de sobrecarga em déficit).
  - *Atenção ao Balanço sem Treino* (Superávit calórico sem estímulo físico registrado).
- **Diretrizes Estratégicas Personalizadas**: Recomendações práticas ajustadas dinamicamente ao ciclo.

### 5. Regras de UX & SPA
- **Zero Recarregamentos de Página**: Navegação 100% fluida em SPA.
- **Validações Estritas**: Bloqueio de datas futuras (`max={hoje}`), exigência de números estritamente positivos para pesos, calorias e repetições.
- **Responsividade Total**: Layout adaptável para celular (com barra de navegação inferior tátil) e desktop (com menu superior e gráficos amplos).

---

## 🔒 Regras de Segurança do Firebase (`firestore.rules`)

As regras do Firestore foram desenhadas pelo subagente especialista `firestore-rules-author` seguindo rigorosamente os padrões de produção:
1. **Default Deny**: Nenhuma coleção é pública. Todo acesso exige autenticação (`isAuthenticated()`).
2. **Isolamento Total por Usuário**: Cada usuário só pode ler, criar, atualizar ou deletar documentos sob `/users/{userId}` onde `request.auth.uid == userId`.
3. **Validator Function Pattern**: Validação completa de campos, limites de tamanho de string, enums estritos e números positivos tanto no `create` quanto no `update`.
4. **Campos Imutáveis**: `uid` e `createdAt` são estritamente imutáveis após a criação.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

### 2. Configurar e Vincular com seu Projeto Firebase (`academia-aura`)
Para vincular com o seu projeto existente `academia-aura`:

1. No seu terminal, faça login no Firebase:
   ```bash
   npx firebase-tools login
   ```
2. Execute o assistente automatizado do projeto:
   ```bash
   npm run setup:firebase
   ```
   *Este script irá:*
   - Registrar automaticamente o Web App `academia-aura-web` no seu projeto `academia-aura`.
   - Obter as chaves do SDK e criar o arquivo `.env.local`.
   - Publicar a configuração de Autenticação e as regras de segurança do Firestore (`firestore.rules`).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Ícones**: Lucide React
- **Gráficos**: Recharts (ComposedChart, LineChart, BarChart, PieChart)
- **Backend & Serviços**: Firebase Authentication (Email/Password), Cloud Firestore (Banco NoSQL em tempo real), Firebase Hosting
- **Arquitetura**: Context API (`AuthContext`, `ThemeContext`), Modular Firebase SDK v11
