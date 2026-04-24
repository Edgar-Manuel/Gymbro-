const STORAGE_KEY = 'gymbro_notifications';

interface NotificationSettings {
  enabled: boolean;
  reminderHour: number; // 0-23
  reminderMinute: number;
}

function getSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { enabled: false, reminderHour: 18, reminderMinute: 0 };
}

function saveSettings(s: NotificationSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export const notificationManager = {
  getSettings,

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  isSupported(): boolean {
    return 'Notification' in window;
  },

  getPermission(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  },

  async enable(hour = 18, minute = 0): Promise<boolean> {
    const granted = await notificationManager.requestPermission();
    if (!granted) return false;
    saveSettings({ enabled: true, reminderHour: hour, reminderMinute: minute });
    notificationManager.scheduleNext(hour, minute);
    return true;
  },

  disable() {
    const s = getSettings();
    saveSettings({ ...s, enabled: false });
  },

  updateTime(hour: number, minute: number) {
    const s = getSettings();
    saveSettings({ ...s, reminderHour: hour, reminderMinute: minute });
    if (s.enabled) notificationManager.scheduleNext(hour, minute);
  },

  scheduleNext(hour: number, minute: number) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target.getTime() - now.getTime();

    // Store next fire time so we can recover it on reload
    localStorage.setItem('gymbro_next_notif', String(target.getTime()));

    setTimeout(() => {
      notificationManager.fireIfNeeded();
    }, Math.min(delay, 2147483647)); // clamp to max int32
  },

  async fireIfNeeded() {
    const s = getSettings();
    if (!s.enabled || Notification.permission !== 'granted') return;

    // Check last trained date
    const lastTrained = localStorage.getItem('gymbro_last_trained');
    const today = new Date().toDateString();
    if (lastTrained === today) {
      // Already trained today, schedule next reminder for tomorrow
      notificationManager.scheduleNext(s.reminderHour, s.reminderMinute);
      return;
    }

    const messages = [
      '¡Es hora de entrenar! 💪 Tu rutina te espera.',
      '¿Vamos al gym? 🏋️ Hoy es un buen día para romper marcas.',
      '¡No rompas la racha! 🔥 Unos minutos de esfuerzo hacen la diferencia.',
      '¡Tu cuerpo te lo agradecerá! 🎯 El gym no se va a ir a ningún sitio.',
    ];
    const msg = messages[new Date().getDay() % messages.length];

    new Notification('GymBro', {
      body: msg,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'gymbro-daily',
    });

    notificationManager.scheduleNext(s.reminderHour, s.reminderMinute);
  },

  markTrained() {
    localStorage.setItem('gymbro_last_trained', new Date().toDateString());
  },

  // Call on app start to resume any pending schedule
  init() {
    const s = getSettings();
    if (!s.enabled || Notification.permission !== 'granted') return;

    const nextFire = Number(localStorage.getItem('gymbro_next_notif') || '0');
    const now = Date.now();

    if (nextFire && nextFire > now) {
      const delay = nextFire - now;
      setTimeout(() => notificationManager.fireIfNeeded(), Math.min(delay, 2147483647));
    } else {
      // Overdue — check and reschedule
      notificationManager.fireIfNeeded();
    }
  },
};
