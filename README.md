```markdown
# TimeLine ⏰

Um aplicativo minimalista de gerenciamento de tarefas e hábitos diários, desenvolvido em React Native com Expo.

## 📋 Sobre o Projeto

**TimeLine** é um aplicativo de produtividade que ajuda você a organizar suas tarefas diárias em uma linha do tempo visual intuitiva. Com suporte a notificações inteligentes, recorrência de tarefas e um calendário completo, o app foi projetado para ser simples, elegante e eficiente.

### 🎯 Propósito

O objetivo principal do TimeLine é oferecer uma experiência de gerenciamento de tarefas que seja:
- **Visual**: Timeline clara mostrando suas tarefas do dia
- **Flexível**: Suporte a tarefas únicas ou recorrentes
- **Não-intrusivo**: Lembretes inteligentes sem sobrecarregar
- **Bonito**: Interface minimalista com tema claro/escuro automático

## ✨ Funcionalidades

### Atualmente Implementadas

- ✅ **Timeline de Tarefas**: Visualização cronológica das tarefas do dia
- ✅ **Biblioteca de Ícones**: Mais de 80 ícones para personalizar suas tarefas
- ✅ **Busca de Ícones**: Busca inteligente em português com tags
- ✅ **Notificações Programadas**: Lembretes automáticos no horário agendado
- ✅ **Tarefas em Background**: Notificações funcionam mesmo com app fechado
- ✅ **Recorrência de Tarefas**: 
  - Não repetir (tarefa única)
  - Diariamente
  - Dias da semana (Seg-Sex)
  - Finais de semana (Sáb-Dom)
- ✅ **Calendário Completo**: Navegação por meses com visualização de tarefas
- ✅ **Histórico de Conclusões**: Registro de todas as tarefas concluídas
- ✅ **Temas**: Modo claro, escuro e automático (baseado no sistema)
- ✅ **Persistência de Dados**: AsyncStorage para salvar localmente
- ✅ **Wheel Pickers**: Seleção intuitiva de hora e minuto
- ✅ **Gestão de Tarefas**: Editar, excluir e marcar como concluída

### 🔄 Sistema de Notificações

O app possui um robusto sistema de notificações que:
- Agenda automaticamente notificações para cada tarefa
- Reagenda notificações recorrentes para os próximos 7 dias
- Executa tarefas em background a cada 15 minutos (mínimo iOS)
- Cancela e reagenda notificações ao editar/excluir tarefas
- Suporta notificações mesmo com o app fechado

## 🚀 Como Usar

### Pré-requisitos

```bash
node >= 18
npm ou yarn
expo-cli
```

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/timeline.git

# Entre na pasta do projeto
cd timeline

# Instale as dependências
npm install
# ou
yarn install
```

### Executando

```bash
# Desenvolvimento
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

### Build de Produção

```bash
# Build Android APK
eas build --platform android --profile preview

# Build iOS
eas build --platform ios --profile production
```

## 🛠️ Tecnologias Utilizadas

- **React Native 0.81.5** - Framework mobile
- **Expo ~54.0** - Plataforma de desenvolvimento
- **expo-notifications** - Sistema de notificações locais
- **expo-background-fetch** - Execução de tarefas em background
- **expo-task-manager** - Gerenciamento de tarefas assíncronas
- **AsyncStorage** - Persistência de dados local
- **lucide-react-native** - Biblioteca de ícones
- **React Native Paper** - Componentes UI (dependência)

## 📱 Estrutura do App

```
├── App.js              # Componente principal
├── app.json            # Configuração do Expo
├── eas.json            # Configuração de builds
├── package.json        # Dependências
└── assets/            # Ícones e imagens
```

## 🎨 Temas

O app suporta três modos de aparência:
- **Auto**: Segue o tema do sistema
- **Claro**: Tema minimalista branco
- **Escuro**: Tema OLED-friendly preto puro

### Paleta de Cores

**Tema Escuro:**
- Background: `#000000`
- Cards: `#1c1c1e`
- Primary: `#ffffff`

**Tema Claro:**
- Background: `#f2f2f7`
- Cards: `#ffffff`
- Primary: `#000000`

## 🔮 Melhorias Futuras

### Alta Prioridade
- [ ] **Widgets iOS/Android**: Visualização rápida na tela inicial
- [ ] **Categorias de Tarefas**: Organizar por trabalho, pessoal, saúde, etc.
- [ ] **Estatísticas**: Gráficos de produtividade e conclusão
- [ ] **Backup na Nuvem**: Sincronização entre dispositivos
- [ ] **Compartilhamento**: Compartilhar tarefas ou listas

### Média Prioridade
- [ ] **Subtarefas**: Quebrar tarefas grandes em partes menores
- [ ] **Prioridade de Tarefas**: Sistema de priorização (alta, média, baixa)
- [ ] **Notas**: Adicionar descrições e anotações às tarefas
- [ ] **Tags Personalizadas**: Sistema de etiquetas customizável
- [ ] **Anexos**: Adicionar fotos ou arquivos às tarefas
- [ ] **Pomodoro Timer**: Temporizador integrado para foco
- [ ] **Streaks**: Contador de dias consecutivos completando tarefas

### Baixa Prioridade
- [ ] **Modo Compacto**: Visualização mais densa
- [ ] **Arrastar e Soltar**: Reordenar tarefas manualmente
- [ ] **Temas Customizados**: Cores personalizáveis
- [ ] **Sons Personalizados**: Escolher som de notificação
- [ ] **Integração com Calendário**: Importar eventos do Google Calendar
- [ ] **Modo Offline Aprimorado**: Melhor feedback sem conexão
- [ ] **Localização**: Suporte a múltiplos idiomas

## 🐛 Problemas Conhecidos

- Em alguns dispositivos Android, notificações em background podem ser agressivamente gerenciadas pelo sistema
- A rolagem do calendário pode ser otimizada para dispositivos mais antigos
- WheelPicker pode ter comportamento inconsistente em algumas versões do Android

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença 0BSD (Zero-Clause BSD) - veja o arquivo LICENSE para detalhes.
