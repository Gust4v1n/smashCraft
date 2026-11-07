# SmashCraft 🍔 — Notificações Locais

Aplicativo mobile desenvolvido em **React**, **Vite** e **Capacitor** para envio e agendamento de notificações locais para a hamburgueria **SmashCraft**.

---

## 🎬 Demonstração da Aplicação (Showcase)

Veja abaixo a demonstração em vídeo do aplicativo em funcionamento:

https://github.com/user-attachments/assets/61bf8830-0eec-4f1c-b01e-73fb133ddd7d

> 💡 **Nota:** Se o player acima não carregar no seu visualizador markdown, você também pode [abrir o arquivo de vídeo local (showcaseG.mp4)](./showcaseG.mp4) diretamente no repositório.

---

## 🚀 Funcionalidades

- **🛡️ Gerenciamento de Permissões (Android 13+)**:
  - Verificação de status em tempo real (`granted`, `denied`, `prompt`).
  - Solicitação explícita da permissão `POST_NOTIFICATIONS` necessária nas versões recentes do Android.
- **⚡ Disparos Imediatos**:
  - **Pedido Pronto** (`ID #120`): Notifica o cliente para retirar o combo Smash + Refil no balcão.
  - **Happy Hour 18h** (`ID #180`): Alerta promocional de 30% OFF nos combos.
- **⏰ Agendamento Inteligente (Desafio Extra)**:
  - Presets rápidos: `5s`, `10s`, `30s`, `60s`.
  - Seletor numérico de segundos personalizável (1 a 3600 segundos).
  - Geração de **ID único de 32 bits** para cada notificação agendada.
  - Histórico em tela com ID e horário previsto de disparo.
- **📋 Fila de Notificações**:
  - Consulta de agendamentos pendentes no sistema operacional (`LocalNotifications.getPending()`).
  - Cancelamento em lote de notificações agendadas (`LocalNotifications.cancel()`).
- **🎨 Interface Moderna**:
  - Tema escuro com design responsivo e toques em laranja vibrante no estilo hamburgueria artesanal.
  - Notificações de feedback (toasts) e indicadores de status.

---

## 🛠️ Tecnologias Utilizadas

- [**React 18**](https://react.dev/) — Interface declarativa e componentes reativos
- [**Vite**](https://vitejs.dev/) — Bundler e ambiente de desenvolvimento ultrarrápido
- [**Capacitor 8**](https://capacitorjs.com/) — Runtime multiplataforma para execução nativa
- [**@capacitor/local-notifications**](https://capacitorjs.com/docs/apis/local-notifications) — Plugin nativo para gerenciar e disparar notificações locais
- [**Android SDK & Gradle**](https://developer.android.com/) — Compilação e empacotamento nativo Android

---

## 📁 Estrutura do Projeto

```text
smashCraft/
├── .github/
│   └── workflows/
│       └── build-apk.yml        # CI/CD para compilação automatizada do APK
├── android/                     # Projeto nativo Android configurado com Capacitor
├── public/                      # Assets públicos
├── src/
│   ├── assets/                  # Imagens e ícones
│   ├── App.jsx                  # Componente principal com a lógica das notificações
│   ├── main.jsx                 # Ponto de entrada React
│   └── style.css                # Estilização visual da aplicação
├── capacitor.config.json        # Configuração do Capacitor (appId, appName, plugins)
├── showcaseG.mp4                # Vídeo demonstrativo do app
├── package.json                 # Dependências e scripts
└── vite.config.js               # Configuração do Vite
```

---

## 💻 Como Executar o Projeto

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior recomendada)
- [npm](https://www.npmjs.com/)
- [Android Studio](https://developer.android.com/studio) (opcional, necessário para emular ou compilar localmente para Android)

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Gust4v1n/smashCraft.git
   cd smashCraft
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento web:**
   ```bash
   npm run dev
   ```

4. **Sincronize com o ambiente Android:**
   ```bash
   npm run sync
   ```

5. **Abra o projeto no Android Studio para rodar em dispositivo físico ou emulador:**
   ```bash
   npm run android
   ```

---

## 🤖 CI/CD Automatizado (GitHub Actions)

O repositório conta com um fluxo de CI configurado em [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml) que:
- Executa a cada push para os branches `master` e `main`.
- Prepara o ambiente com Node.js 22 e JDK 21.
- Executa o build dos assets via Vite e sincroniza o Capacitor.
- Compila o **APK de Debug** (`./gradlew assembleDebug`).
- Disponibiliza o APK gerado como artefato para download na aba **Actions** do GitHub.

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de demonstração.
