import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
  FlatList,
  useColorScheme,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Moon,
  Sun,
  CheckCircle2,
  Footprints,
  Dumbbell,
  Flame,
  Snowflake,
  Salad,
  Coffee,
  BookOpen,
  Briefcase,
  BrainCircuit,
  Music,
  Pill,
  BedDouble,
  Star,
  Heart,
  DollarSign,
  Gamepad2,
  Plane,
  Car,
  ShoppingCart,
  Smartphone,
  Wifi,
  Zap,
  Droplets,
  Home,
  Users,
  Dog,
  Bike,
  PenTool,
  Camera,
  Headphones,
  Gift,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Smile,
  Frown,
  Umbrella,
  Anchor,
  Battery,
  Bell,
  Bluetooth,
  Bookmark,
  Calculator,
  Cloud,
  Code,
  Cpu,
  Database,
  Eye,
  FileText,
  Film,
  Flag,
  Globe,
  Key,
  Lock,
  Mail,
  MessageCircle,
  Mic,
  Monitor,
  MousePointer,
  Package,
  Printer,
  Radio,
  Save,
  Scissors,
  Search,
  Server,
  Settings,
  Share,
  Shield,
  Speaker,
  Tag,
  Target,
  Thermometer,
  ThumbsUp,
  Trash,
  Truck,
  Tv,
  Unlock,
  Upload,
  User,
  Video,
  Volume2,
  Watch,
  Wrench,
  X,
  ChevronRight,
  ChevronDown,
} from 'lucide-react-native';

// --- CONFIGURAÇÃO DE NOTIFICAÇÕES ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// --- TAREFA EM BACKGROUND ---
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {
  try {
    console.log('Background task executada');

    // Carrega as tarefas do AsyncStorage
    const tasksJson = await AsyncStorage.getItem('tasks');
    if (!tasksJson) return BackgroundFetch.BackgroundFetchResult.NoData;

    const tasks = JSON.parse(tasksJson);

    // Reagenda todas as notificações
    await scheduleAllNotifications(tasks);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Erro na tarefa de background:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Função auxiliar para agendar todas as notificações
async function scheduleAllNotifications(tasks) {
  // Cancela todas as notificações anteriores
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const task of tasks) {
    if (task.completed) continue;

    const [hour, minute] = task.time.split(':').map(Number);

    // Para tarefas sem recorrência
    if (task.recurrence === 'none' && task.dateISO) {
      const taskDate = new Date(task.dateISO);
      taskDate.setHours(hour, minute, 0, 0);

      // Só agenda se for no futuro
      if (taskDate.getTime() > now.getTime()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "⏰ Lembrete de Tarefa",
            body: `${task.time} - ${task.title}`,
            data: { taskId: task.id },
            sound: true,
          },
          trigger: taskDate,
        });
        console.log(`Notificação agendada: ${task.title} em ${taskDate}`);
      }
    }

    // Para tarefas com recorrência
    else if (task.recurrence !== 'none') {
      // Agenda para os próximos 7 dias
      for (let i = 0; i < 7; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        futureDate.setHours(hour, minute, 0, 0);

        // Verifica se deve mostrar neste dia
        const dayOfWeek = futureDate.getDay();
        let shouldSchedule = false;

        if (task.recurrence === 'daily') {
          shouldSchedule = true;
        } else if (task.recurrence === 'weekdays') {
          shouldSchedule = dayOfWeek >= 1 && dayOfWeek <= 5;
        } else if (task.recurrence === 'weekends') {
          shouldSchedule = dayOfWeek === 0 || dayOfWeek === 6;
        }

        // Só agenda se for no futuro e se deve aparecer neste dia
        if (shouldSchedule && futureDate.getTime() > now.getTime()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "⏰ Lembrete de Tarefa",
              body: `${task.time} - ${task.title}`,
              data: { taskId: task.id },
              sound: true,
            },
            trigger: futureDate,
          });
          console.log(`Notificação recorrente agendada: ${task.title} em ${futureDate}`);
        }
      }
    }
  }
}

// Registra a tarefa de background
async function registerBackgroundFetchAsync() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
      minimumInterval: 15 * 60, // 15 minutos (mínimo permitido pelo iOS)
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background fetch registrado com sucesso');
  } catch (err) {
    console.error('Erro ao registrar background fetch:', err);
  }
}

const { width } = Dimensions.get('window');
const CALENDAR_COL_WIDTH = (width - 40) / 7;
const ITEM_HEIGHT = 50;

const MONTH_HEADER_HEIGHT = 65;
const DAY_ROW_HEIGHT = CALENDAR_COL_WIDTH + 4;
const ESTIMATED_MONTH_HEIGHT = MONTH_HEADER_HEIGHT + DAY_ROW_HEIGHT * 5.2;

// --- ÍCONES ---
const ICON_LIBRARY = [
  { id: 'moon', component: Moon, tags: 'lua noite dormir sono escuro' },
  { id: 'sun', component: Sun, tags: 'sol dia manhã acordar claro brilho' },
  { id: 'check', component: CheckCircle2, tags: 'check feito ok concluído sucesso' },
  { id: 'walk', component: Footprints, tags: 'caminhar andar passos pegadas' },
  { id: 'gym', component: Dumbbell, tags: 'academia treino peso força musculo' },
  { id: 'fire', component: Flame, tags: 'fogo calor queimar intenso energia' },
  { id: 'snow', component: Snowflake, tags: 'neve frio gelo inverno ar condicionado' },
  { id: 'food', component: Salad, tags: 'comida dieta salada saudavel almoço jantar' },
  { id: 'coffee', component: Coffee, tags: 'cafe energia bebida quente manha pausa' },
  { id: 'book', component: BookOpen, tags: 'livro ler estudo leitura educação' },
  { id: 'work', component: Briefcase, tags: 'trabalho escritorio emprego mala negocio' },
  { id: 'meditate', component: BrainCircuit, tags: 'meditar cerebro mente foco pensar' },
  { id: 'music', component: Music, tags: 'musica som ouvir canção artista' },
  { id: 'pill', component: Pill, tags: 'remedio pilula saude medico vitamina' },
  { id: 'bed', component: BedDouble, tags: 'cama dormir quarto descanso soneca' },
  { id: 'star', component: Star, tags: 'estrela destaque favorito importante' },
  { id: 'heart', component: Heart, tags: 'coração amor saude vida gostar' },
  { id: 'money', component: DollarSign, tags: 'dinheiro finanças economia pagamento' },
  { id: 'game', component: Gamepad2, tags: 'jogo videogame diversão controle' },
  { id: 'travel', component: Plane, tags: 'viagem avião voar ferias turismo' },
  { id: 'car', component: Car, tags: 'carro dirigir transito veiculo' },
  { id: 'shop', component: ShoppingCart, tags: 'compras mercado loja carrinho' },
  { id: 'phone', component: Smartphone, tags: 'celular telefone mensagem app' },
  { id: 'water', component: Droplets, tags: 'agua beber hidratação gotas chuva' },
  { id: 'wifi', component: Wifi, tags: 'internet conexão rede online' },
  { id: 'energy', component: Zap, tags: 'energia eletricidade rapido flash' },
  { id: 'home', component: Home, tags: 'casa lar moradia familia' },
  { id: 'users', component: Users, tags: 'pessoas grupo amigos equipe social' },
  { id: 'pet', component: Dog, tags: 'cachorro gato animal pet estimação' },
  { id: 'bike', component: Bike, tags: 'bicicleta pedalar ciclismo transporte' },
  { id: 'art', component: PenTool, tags: 'arte desenho design caneta criativo' },
  { id: 'camera', component: Camera, tags: 'foto camera imagem video' },
  { id: 'headphone', component: Headphones, tags: 'fone ouvir podcast audio' },
  { id: 'gift', component: Gift, tags: 'presente aniversario surpresa caixa' },
  { id: 'calendar', component: CalendarIcon, tags: 'calendario data agenda prazo' },
  { id: 'clock', component: Clock, tags: 'relogio tempo hora prazo' },
  { id: 'map', component: MapPin, tags: 'mapa local gps endereço' },
  { id: 'smile', component: Smile, tags: 'sorriso feliz alegria bom' },
  { id: 'sad', component: Frown, tags: 'triste ruim desanimo' },
  { id: 'rain', component: Umbrella, tags: 'chuva guarda-chuva tempo' },
  { id: 'anchor', component: Anchor, tags: 'ancora mar praia navio' },
  { id: 'battery', component: Battery, tags: 'bateria carga energia' },
  { id: 'bell', component: Bell, tags: 'sino notificação alerta' },
  { id: 'bluetooth', component: Bluetooth, tags: 'bluetooth conexão sem fio' },
  { id: 'calculator', component: Calculator, tags: 'calculadora contas matematica' },
  { id: 'cloud', component: Cloud, tags: 'nuvem tempo clima dados' },
  { id: 'code', component: Code, tags: 'codigo programação dev tecnologia' },
  { id: 'cpu', component: Cpu, tags: 'chip processador computador tech' },
  { id: 'database', component: Database, tags: 'banco dados servidor storage' },
  { id: 'eye', component: Eye, tags: 'olho ver visão assistir' },
  { id: 'file', component: FileText, tags: 'arquivo documento texto papel' },
  { id: 'film', component: Film, tags: 'filme cinema video movie' },
  { id: 'flag', component: Flag, tags: 'bandeira meta objetivo pais' },
  { id: 'globe', component: Globe, tags: 'globo mundo terra internacional' },
  { id: 'key', component: Key, tags: 'chave senha segurança acesso' },
  { id: 'lock', component: Lock, tags: 'cadeado fechado segurança privado' },
  { id: 'mail', component: Mail, tags: 'email carta correio mensagem' },
  { id: 'msg', component: MessageCircle, tags: 'mensagem chat conversa balão' },
  { id: 'mic', component: Mic, tags: 'microfone audio falar gravar' },
  { id: 'monitor', component: Monitor, tags: 'monitor tela pc desktop' },
  { id: 'mouse', component: MousePointer, tags: 'mouse cursor clique' },
  { id: 'package', component: Package, tags: 'pacote caixa entrega delivery' },
  { id: 'printer', component: Printer, tags: 'impressora papel imprimir' },
  { id: 'radio', component: Radio, tags: 'radio som frequencia' },
  { id: 'save', component: Save, tags: 'salvar disquete guardar' },
  { id: 'scissors', component: Scissors, tags: 'tesoura cortar recortar' },
  { id: 'search', component: Search, tags: 'busca lupa procurar pesquisar' },
  { id: 'server', component: Server, tags: 'servidor rack dados' },
  { id: 'settings', component: Settings, tags: 'configurar engrenagem ajustes' },
  { id: 'share', component: Share, tags: 'compartilhar enviar rede' },
  { id: 'shield', component: Shield, tags: 'escudo proteção defesa' },
  { id: 'speaker', component: Speaker, tags: 'som alto-falante volume' },
  { id: 'target', component: Target, tags: 'alvo meta objetivo foco' },
  { id: 'thermometer', component: Thermometer, tags: 'temperatura termometro febre' },
  { id: 'like', component: ThumbsUp, tags: 'curtir joinha like bom' },
  { id: 'trash', component: Trash, tags: 'lixo excluir deletar remover' },
  { id: 'truck', component: Truck, tags: 'caminhão transporte frete' },
  { id: 'tv', component: Tv, tags: 'tv televisão assistir sala' },
  { id: 'unlock', component: Unlock, tags: 'aberto desbloqueado acesso' },
  { id: 'upload', component: Upload, tags: 'upload subir enviar nuvem' },
  { id: 'user', component: User, tags: 'usuario perfil pessoa conta' },
  { id: 'video', component: Video, tags: 'video camera gravação' },
  { id: 'volume', component: Volume2, tags: 'volume som audio' },
  { id: 'watch', component: Watch, tags: 'relogio pulso tempo' },
  { id: 'wrench', component: Wrench, tags: 'ferramenta conserto manutenção' },
  { id: 'x', component: X, tags: 'x fechar cancelar erro' },
];

const recurrenceOptions = [
  { label: 'Não repetir', value: 'none' },
  { label: 'Diariamente', value: 'daily' },
  { label: 'Dias da Semana', value: 'weekdays' },
  { label: 'Finais de Semana', value: 'weekends' },
];

// --- COMPONENTES AUXILIARES ---
const WheelPicker = ({ items, selectedValue, onValueChange, theme }) => {
  const flatListRef = useRef(null);

  useEffect(() => {
    const index = items.findIndex((i) => i.value === selectedValue);
    if (index !== -1 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index, animated: false });
      }, 100);
    }
  }, []);

  const onMomentumScrollEnd = (e) => {
    const contentOffset = e.nativeEvent.contentOffset.y;
    const index = Math.round(contentOffset / ITEM_HEIGHT);
    if (items[index]) {
      onValueChange(items[index].value);
    }
  };

  return (
    <View style={{ height: ITEM_HEIGHT * 3, overflow: 'hidden' }}>
      <View
        style={[
          styles.wheelSelection,
          { borderColor: theme.border, backgroundColor: theme.headerBg },
        ]}
        pointerEvents="none"
      />
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item) => String(item.value)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        renderItem={({ item }) => {
          const isSelected = item.value === selectedValue;
          return (
            <View
              style={{
                height: ITEM_HEIGHT,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={[
                  styles.wheelText,
                  { color: isSelected ? theme.text : theme.textSecondary },
                  isSelected && { fontSize: 26, fontWeight: '700' },
                ]}>
                {item.label}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

export default function App() {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('auto');
  const [currentView, setCurrentView] = useState('timeline');
  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [iconSearch, setIconSearch] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    icon: 'check',
    time: new Date(),
    recurrence: 'none',
    completed: false,
  });

  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());

  const calendarMonths = useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = -12; i <= 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push(d);
    }
    return months;
  }, []);

  const isDark =
    themeMode === 'dark' || (themeMode === 'auto' && systemScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  const hours = Array.from({ length: 24 }, (_, i) => ({
    label: String(i).padStart(2, '0'),
    value: i,
  }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({
    label: String(i).padStart(2, '0'),
    value: i,
  }));

  const dateOptions = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        date: d,
        day: d.getDate(),
        weekday: d
          .toLocaleDateString('pt-BR', { weekday: 'short' })
          .toUpperCase()
          .slice(0, 3),
        fullDate: d.toISOString().split('T')[0],
      };
    });
  }, []);

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ICON_LIBRARY;
    const search = iconSearch.toLowerCase();
    return ICON_LIBRARY.filter(
      (icon) => icon.tags.includes(search) || icon.id.includes(search)
    );
  }, [iconSearch]);

  useEffect(() => {
    loadData();
    requestPermissions();
    registerBackgroundFetchAsync();

    // Listener para quando uma notificação for recebida enquanto o app está em foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
    });

    // Listener para quando o usuário tocar na notificação
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Usuário tocou na notificação:', response);
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    saveData();
    scheduleAllNotifications(tasks);
  }, [tasks]);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Para receber lembretes, ative as notificações nas configurações do app.'
      );
    }
  };

  const loadData = async () => {
    try {
      const [t, h, tm] = await Promise.all([
        AsyncStorage.getItem('tasks'),
        AsyncStorage.getItem('history'),
        AsyncStorage.getItem('theme'),
      ]);
      if (t) setTasks(JSON.parse(t));
      if (h) setHistory(JSON.parse(h));
      if (tm) setThemeMode(tm);
    } catch (e) {
      console.error(e);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('tasks', JSON.stringify(tasks)),
        AsyncStorage.setItem('history', JSON.stringify(history)),
        AsyncStorage.setItem('theme', themeMode),
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const updateTaskTime = (type, value) => {
    const newDate = new Date(newTask.time);
    if (type === 'hour') newDate.setHours(value);
    if (type === 'minute') newDate.setMinutes(value);
    if (type === 'date') {
      newDate.setFullYear(value.getFullYear());
      newDate.setMonth(value.getMonth());
      newDate.setDate(value.getDate());
    }
    setNewTask((prev) => ({ ...prev, time: newDate }));
  };

  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const shouldShowTask = (task, date) => {
    if (task.recurrence === 'none') {
      if (task.dateISO) {
        return isSameDay(new Date(task.dateISO), date);
      }
      return false;
    }
    const day = date.getDay();
    if (task.recurrence === 'daily') return true;
    if (task.recurrence === 'weekdays') return day >= 1 && day <= 5;
    if (task.recurrence === 'weekends') return day === 0 || day === 6;
    return true;
  };

  const getTasksForDate = (date) => {
    return tasks.filter((t) => shouldShowTask(t, date)).sort(sortByTime);
  };

  const sortByTime = (a, b) => {
    const [aH, aM] = a.time.split(':').map(Number);
    const [bH, bM] = b.time.split(':').map(Number);
    return aH * 60 + aM - (bH * 60 + bM);
  };

  const addOrUpdateTask = () => {
    const timeStr = `${String(newTask.time.getHours()).padStart(
      2,
      '0'
    )}:${String(newTask.time.getMinutes()).padStart(2, '0')}`;
    const task = {
      id: editingTask?.id || Date.now().toString(),
      time: timeStr,
      icon: newTask.icon,
      title: newTask.title,
      recurrence: newTask.recurrence,
      completed: editingTask?.completed || false,
      dateISO: newTask.time.toISOString(),
    };

    setTasks((prev) => {
      const list = editingTask
        ? prev.map((t) => (t.id === task.id ? task : t))
        : [...prev, task];
      return list.sort(sortByTime);
    });
    resetModal();
  };

  const resetModal = () => {
    setNewTask({
      title: '',
      icon: 'check',
      time: new Date(),
      recurrence: 'none',
      completed: false,
    });
    setEditingTask(null);
    setIconSearch('');
    setModalVisible(false);
  };

  const editTask = (task) => {
    const [h, m] = task.time.split(':').map(Number);
    const d = task.dateISO ? new Date(task.dateISO) : new Date();
    d.setHours(h, m);
    setNewTask({ ...task, time: d });
    setEditingTask(task);
    setModalVisible(true);
  };

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const toggleTaskCompletion = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, completed: !t.completed };
          if (updated.completed) {
            setHistory((h) =>
              [
                { ...updated, completedAt: new Date().toISOString() },
                ...h,
              ].slice(0, 50)
            );
          }
          return updated;
        }
        return t;
      })
    );
  };

  const renderIcon = (id, size, color) => {
    const Icon = (ICON_LIBRARY.find((i) => i.id === id) || ICON_LIBRARY[0])
      .component;
    return <Icon size={size} color={color} />;
  };

  // --- VIEWS ---
  const renderTimeline = () => {
    const today = new Date();
    const todayTasks = getTasksForDate(today);

    return (
      <ScrollView style={styles.scrollView}>
        {todayTasks.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80, opacity: 0.4 }}>
            <CheckCircle2 size={64} color={theme.textSecondary} />
            <Text
              style={{
                marginTop: 16,
                color: theme.textSecondary,
                fontSize: 16,
              }}>
              Tudo limpo por hoje
            </Text>
          </View>
        ) : (
          todayTasks.map((task, idx) => (
            <View key={task.id} style={styles.taskContainer}>
              <View style={styles.timelineLeft}>
                <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                  {task.time}
                </Text>
                <View
                  style={[
                    styles.timelineIconWrapper,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}>
                  {renderIcon(task.icon, 20, theme.text)}
                </View>
                {idx < todayTasks.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: theme.border },
                    ]}
                  />
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.taskCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => editTask(task)}
                onLongPress={() =>
                  Alert.alert('Excluir', `Apagar "${task.title}"?`, [
                    { text: 'Não', style: 'cancel' },
                    {
                      text: 'Sim',
                      onPress: () => deleteTask(task.id),
                      style: 'destructive',
                    },
                  ])
                }>
                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={[
                      styles.taskTitle,
                      { color: theme.text },
                      task.completed && styles.taskCompleted,
                    ]}>
                    {task.title}
                  </Text>
                  {task.recurrence !== 'none' && (
                    <Text
                      style={[
                        styles.recurrenceLabel,
                        { color: theme.textSecondary },
                      ]}>
                      {
                        recurrenceOptions.find(
                          (r) => r.value === task.recurrence
                        )?.label
                      }
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    task.completed && styles.checkButtonCompleted,
                  ]}
                  onPress={() => toggleTaskCompletion(task.id)}>
                  {task.completed && <CheckCircle2 size={16} color="#fff" />}
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const renderMonthItem = ({ item: monthDate }) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const grid = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      grid.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push(new Date(year, month, i));
    }

    return (
      <View style={{ marginBottom: 30 }}>
        <Text style={[styles.monthTitle, { color: theme.text }]}>
          {monthDate.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <View style={styles.monthGrid}>
          {grid.map((date, idx) => {
            if (!date)
              return (
                <View
                  key={`empty-${idx}`}
                  style={[styles.calendarDay, { borderWidth: 0 }]}
                />
              );

            const isSelected = isSameDay(date, selectedCalendarDate);
            const isToday = isSameDay(date, new Date());
            const hasTask = getTasksForDate(date).length > 0;

            return (
              <TouchableOpacity
                key={date.toString()}
                style={[
                  styles.calendarDay,
                  isToday && !isSelected && { backgroundColor: theme.headerBg },
                  isSelected && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => setSelectedCalendarDate(date)}>
                <Text
                  style={[
                    styles.calendarDayNumber,
                    { color: theme.text },
                    isSelected && {
                      color: theme.background,
                      fontWeight: 'bold',
                    },
                  ]}>
                  {date.getDate()}
                </Text>
                {hasTask && (
                  <View
                    style={[
                      styles.taskDot,
                      isSelected && { backgroundColor: theme.background },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCalendar = () => {
    const selectedDateTasks = getTasksForDate(selectedCalendarDate);

    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: '55%',
            borderBottomWidth: 1,
            borderColor: theme.border,
          }}>
          <View
            style={[styles.weekHeader, { backgroundColor: theme.background }]}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <Text
                key={i}
                style={[styles.weekDayText, { color: theme.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>

          <FlatList
            data={calendarMonths}
            keyExtractor={(item) => item.toISOString()}
            renderItem={renderMonthItem}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
            initialScrollIndex={12}
            getItemLayout={(data, index) => ({
              length: ESTIMATED_MONTH_HEIGHT,
              offset: ESTIMATED_MONTH_HEIGHT * index,
              index,
            })}
            initialNumToRender={5}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={{ flex: 1, backgroundColor: theme.background }}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: 80 }}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, marginTop: 10, fontSize: 18 },
              ]}>
              {selectedCalendarDate.getDate()} de{' '}
              {selectedCalendarDate.toLocaleString('default', {
                month: 'long',
              })}
            </Text>

            {selectedDateTasks.length === 0 ? (
              <Text
                style={{
                  color: theme.textSecondary,
                  fontStyle: 'italic',
                  marginBottom: 20,
                }}>
                Nenhuma tarefa agendada.
              </Text>
            ) : (
              selectedDateTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => editTask(task)}
                  style={[
                    styles.historyCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}>
                  <View style={styles.historyHeader}>
                    {renderIcon(task.icon, 16, theme.textSecondary)}
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.historyTitle,
                        { color: theme.text, marginLeft: 8 },
                      ]}>
                      {task.title}
                    </Text>
                    <Text
                      style={{
                        marginLeft: 'auto',
                        fontSize: 12,
                        color: theme.textSecondary,
                        fontWeight: '700',
                      }}>
                      {task.time}
                    </Text>
                  </View>
                  {task.completed ? (
                    <Text style={[styles.historyTime, { color: '#10b981' }]}>
                      Concluída
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.historyTime,
                        { color: theme.textSecondary },
                      ]}>
                      Pendente
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}

            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, marginTop: 20, fontSize: 18 },
              ]}>
              Histórico Geral
            </Text>
            {history.slice(0, 10).map((entry, idx) => (
              <View
                key={idx}
                style={[
                  styles.historyCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}>
                <View style={styles.historyHeader}>
                  {renderIcon(entry.icon, 16, theme.textSecondary)}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.historyTitle,
                      { color: theme.text, marginLeft: 8 },
                    ]}>
                    {entry.title}
                  </Text>
                </View>
                <Text
                  style={[styles.historyTime, { color: theme.textSecondary }]}>
                  Concluído em{' '}
                  {new Date(entry.completedAt).toLocaleString('pt-BR')}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderSettings = () => (
    <ScrollView style={styles.scrollView}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Preferências
      </Text>
      <View
        style={[
          styles.settingCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>
          Aparência
        </Text>
        <View style={styles.themeButtons}>
          {['auto', 'light', 'dark'].map((mode) => {
            const isSelected = themeMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeButton,
                  { borderColor: theme.border },
                  isSelected && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                ]}
                onPress={() => setThemeMode(mode)}>
                <Text
                  style={[
                    styles.themeButtonText,
                    { color: theme.text },
                    isSelected && { color: theme.background },
                  ]}>
                  {mode === 'auto'
                    ? 'Auto'
                    : mode === 'light'
                      ? 'Claro'
                      : 'Escuro'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.settingCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={async () => {
          const scheduled = await Notifications.getAllScheduledNotificationsAsync();
          Alert.alert(
            'Notificações Agendadas',
            `Total: ${scheduled.length} notificações\n\n${scheduled.slice(0, 5).map(n =>
              `${n.content.title}\n${new Date(n.trigger.value).toLocaleString('pt-BR')}`
            ).join('\n\n')}${scheduled.length > 5 ? '\n\n...' : ''}`,
            [{ text: 'OK' }]
          );
        }}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>
          Ver Notificações Agendadas
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
          Toque para ver todas as notificações
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.settingCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={() => setHistory([])}>
        <Text style={[styles.settingLabel, { color: '#ef4444' }]}>
          Limpar Histórico
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBg, borderBottomColor: theme.border },
        ]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {currentView === 'timeline'
            ? 'Hoje'
            : currentView === 'calendar'
              ? 'Agenda'
              : 'Ajustes'}
        </Text>
        {currentView === 'timeline' && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}>
            <Text style={[styles.addButtonText, { color: theme.background }]}>
              +
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {currentView === 'timeline' && renderTimeline()}
      {currentView === 'calendar' && renderCalendar()}
      {currentView === 'settings' && renderSettings()}

      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.headerBg, borderTopColor: theme.border },
        ]}>
        {['timeline', 'calendar', 'settings'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setCurrentView(tab)}>
            {tab === 'timeline' && (
              <BookOpen
                size={24}
                color={
                  currentView === tab ? theme.primary : theme.textSecondary
                }
              />
            )}
            {tab === 'calendar' && (
              <CalendarIcon
                size={24}
                color={
                  currentView === tab ? theme.primary : theme.textSecondary
                }
              />
            )}
            {tab === 'settings' && (
              <Settings
                size={24}
                color={
                  currentView === tab ? theme.primary : theme.textSecondary
                }
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
                TAREFA
              </Text>
              <TextInput
                style={[
                  styles.minimalInput,
                  { color: theme.text, borderBottomColor: theme.border },
                ]}
                placeholder="Ex: Treinar, Ler, Meditar..."
                placeholderTextColor={theme.textSecondary}
                value={newTask.title}
                onChangeText={(t) => setNewTask((p) => ({ ...p, title: t }))}
                autoFocus={!editingTask}
              />
            </View>

            <View
              style={{ flexDirection: 'row', height: 200, marginBottom: 20 }}>
              <View
                style={{
                  flex: 1,
                  borderRightWidth: 1,
                  borderColor: theme.border,
                }}>
                <Text
                  style={[
                    styles.modalLabel,
                    { color: theme.textSecondary, marginBottom: 10 },
                  ]}>
                  DATA
                </Text>
                <FlatList
                  data={dateOptions}
                  keyExtractor={(item) => item.fullDate}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const isSelected = isSameDay(item.date, newTask.time);
                    return (
                      <TouchableOpacity
                        style={[
                          styles.dateItem,
                          isSelected && {
                            backgroundColor: theme.primary,
                            borderRadius: 8,
                          },
                        ]}
                        onPress={() => updateTaskTime('date', item.date)}>
                        <Text
                          style={[
                            styles.dateItemDay,
                            {
                              color: isSelected ? theme.background : theme.text,
                            },
                          ]}>
                          {item.day}
                        </Text>
                        <Text
                          style={[
                            styles.dateItemWeekday,
                            {
                              color: isSelected
                                ? theme.background
                                : theme.textSecondary,
                            },
                          ]}>
                          {item.weekday}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              <View style={{ flex: 1.5, paddingLeft: 20 }}>
                <Text
                  style={[
                    styles.modalLabel,
                    { color: theme.textSecondary, marginBottom: 0 },
                  ]}>
                  HORÁRIO
                </Text>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    <WheelPicker
                      items={hours}
                      selectedValue={newTask.time.getHours()}
                      onValueChange={(v) => updateTaskTime('hour', v)}
                      theme={theme}
                    />
                  </View>
                  <Text
                    style={{
                      alignSelf: 'center',
                      fontSize: 24,
                      color: theme.text,
                      marginBottom: 8,
                    }}>
                    :
                  </Text>
                  <View style={{ flex: 1 }}>
                    <WheelPicker
                      items={minutes}
                      selectedValue={newTask.time.getMinutes()}
                      onValueChange={(v) => updateTaskTime('minute', v)}
                      theme={theme}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
                RECORRÊNCIA
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 8 }}>
                {recurrenceOptions.map((opt) => {
                  const isSelected = newTask.recurrence === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.pillButton,
                        { borderColor: theme.border },
                        isSelected && {
                          backgroundColor: theme.primary,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() =>
                        setNewTask((p) => ({ ...p, recurrence: opt.value }))
                      }>
                      <Text
                        style={[
                          styles.pillText,
                          { color: isSelected ? theme.background : theme.text },
                        ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.searchContainer}>
                <Search size={16} color={theme.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Buscar ícone..."
                  placeholderTextColor={theme.textSecondary}
                  value={iconSearch}
                  onChangeText={setIconSearch}
                />
              </View>
              <FlatList
                data={filteredIcons}
                keyExtractor={(i) => i.id}
                numColumns={5}
                renderItem={({ item }) => {
                  const isSelected = newTask.icon === item.id;
                  const Icon = item.component;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.iconItem,
                        isSelected && { backgroundColor: theme.primary },
                      ]}
                      onPress={() =>
                        setNewTask((p) => ({ ...p, icon: item.id }))
                      }>
                      <Icon
                        size={20}
                        color={isSelected ? theme.background : theme.text}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={resetModal} style={{ padding: 16 }}>
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={addOrUpdateTask}
                disabled={!newTask.title.trim()}>
                <Text style={{ color: theme.background, fontWeight: 'bold' }}>
                  {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const darkTheme = {
  background: '#000000',
  headerBg: '#121212',
  card: '#1c1c1e',
  border: '#2c2c2e',
  text: '#ffffff',
  textSecondary: '#8e8e93',
  primary: '#ffffff',
};

const lightTheme = {
  background: '#f2f2f7',
  headerBg: '#ffffff',
  card: '#ffffff',
  border: '#e5e5ea',
  text: '#000000',
  textSecondary: '#8e8e93',
  primary: '#000000',
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { fontSize: 24, fontWeight: '300', marginTop: -2 },
  scrollView: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  taskContainer: { flexDirection: 'row', marginBottom: 24 },
  timelineLeft: { alignItems: 'center', marginRight: 16, width: 50 },
  timeText: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  timelineIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    zIndex: 2,
  },
  timelineLine: { width: 2, flex: 1, marginTop: -10, minHeight: 40, zIndex: 1 },
  taskCard: {
    flex: 1,
    padding: 16,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: { fontSize: 16, fontWeight: '600', width: '80%' },
  taskCompleted: { textDecorationLine: 'line-through', opacity: 0.5 },
  recurrenceLabel: {
    fontSize: 10,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8e8e93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonCompleted: { backgroundColor: '#34c759', borderColor: '#34c759' },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  weekDayText: {
    width: CALENDAR_COL_WIDTH,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    paddingLeft: 8,
    textTransform: 'capitalize',
  },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDay: {
    width: CALENDAR_COL_WIDTH,
    height: CALENDAR_COL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CALENDAR_COL_WIDTH / 2,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  calendarDayNumber: { fontSize: 14, fontWeight: '500' },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#06b6d4',
    marginTop: 4,
  },
  settingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  themeButtons: { flexDirection: 'row', gap: 8 },
  themeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeButtonText: { fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  minimalInput: {
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dateItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  dateItemDay: { fontSize: 24, fontWeight: '700' },
  dateItemWeekday: { fontSize: 14, fontWeight: '500' },
  wheelText: { fontSize: 20, color: '#8e8e93' },
  wheelSelection: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    height: ITEM_HEIGHT,
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    opacity: 0.5,
  },
  pillButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: { fontSize: 13, fontWeight: '600' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    opacity: 0.7,
  },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 14 },
  iconItem: {
    width: '20%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30 },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderTopWidth: 1,
    height: 100,
  },
  tab: { flex: 1, alignItems: 'center' },
  historyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyHeader: { flexDirection: 'row', alignItems: 'center' },
  historyTitle: { fontSize: 16, fontWeight: '600' },
  historyTime: { fontSize: 12, marginTop: 4 },
});
