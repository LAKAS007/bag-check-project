# 🎒 Проект аутентификации сумок

## 📋 Описание проекта

Веб-приложение для проверки подлинности дизайнерских сумок. Пользователь загружает фото сумки, эксперт проверяет подлинность и выдает цифровой сертификат.

**Цель:** Создать сервис, который внушает доверие и выглядит профессионально (уровень LegitCheck/LegitApp).

## 🎯 Основной функционал

### Для клиентов:
- Загрузка фотографий сумки
- Получение статуса проверки
- Получение PDF сертификата на email
- Верификация сертификата по QR-коду

### Для экспертов:
- Просмотр тикетов на проверку
- Принятие решения: подлинная/подделка
- Запрос дополнительных фотографий
- Добавление комментариев к решению

### Система:
- Автоматическая генерация PDF сертификатов
- Email уведомления
- QR-коды для верификации
- Отслеживание истории проверок

## 🛠️ Технический стек

### Frontend & Backend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Framer Motion** (анимации)
- **Lucide React** (иконки)

### База данных
- **PostgreSQL** (Neon - облачная БД)
- **Prisma ORM**

### Файловое хранилище
- **Cloudinary** (изображения)
- Автоматическая оптимизация
- CDN для быстрой загрузки

### Email & PDF
- **Nodemailer** (отправка email)
- **PDFKit** (генерация PDF)
- **QR Code** генерация

### Деплой
- **Vercel** (фронтенд + API)
- **Neon** (PostgreSQL)
- **Cloudinary** (файлы)

## 📊 Схема базы данных

```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  role     Role   @default(CLIENT)
  tickets  Ticket[]
}

model Ticket {
  id          String   @id @default(cuid())
  status      Status   @default(PENDING)
  result      Result?
  comment     String?
  clientEmail String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  images      Image[]
  requests    PhotoRequest[]
  certificate Certificate?
}

model Image {
  id        String    @id @default(cuid())
  ticketId  String
  url       String
  type      ImageType @default(INITIAL)
  uploadedAt DateTime @default(now())
  
  ticket    Ticket    @relation(fields: [ticketId], references: [id])
}

model PhotoRequest {
  id          String        @id @default(cuid())
  ticketId    String
  description String
  status      RequestStatus @default(PENDING)
  createdAt   DateTime      @default(now())
  
  ticket      Ticket        @relation(fields: [ticketId], references: [id])
}

model Certificate {
  id        String   @id @default(cuid())
  ticketId  String   @unique
  pdfUrl    String
  qrCode    String
  createdAt DateTime @default(now())
  
  ticket    Ticket   @relation(fields: [ticketId], references: [id])
}

enum Status {
  PENDING
  NEEDS_MORE_PHOTOS
  IN_REVIEW
  COMPLETED
}

enum Result {
  AUTHENTIC
  FAKE
}

enum ImageType {
  INITIAL
  ADDITIONAL
}

enum RequestStatus {
  PENDING
  FULFILLED
}

enum Role {
  CLIENT
  MANAGER
}
```

## 🏗️ Архитектура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── upload/page.tsx    # Загрузка фото
│   ├── dashboard/page.tsx # Панель эксперта
│   ├── verify/[id]/page.tsx # Верификация сертификата
│   └── api/               # API endpoints
│       ├── tickets/route.ts
│       ├── upload/route.ts
│       ├── certificates/route.ts
│       └── auth/route.ts
├── components/            # React компоненты
│   ├── ui/               # shadcn/ui базовые компоненты
│   ├── upload/           # Компоненты загрузки
│   ├── dashboard/        # Дашборд эксперта
│   └── common/           # Общие компоненты (Header, Footer)
├── lib/                  # Утилиты и сервисы
│   ├── prisma.ts         # Prisma client
│   ├── cloudinary.ts     # Cloudinary setup
│   ├── email.ts          # Email сервис
│   ├── pdf.ts            # PDF генерация
│   └── utils.ts          # Общие утилиты
├── types/                # TypeScript типы
│   └── index.ts
└── prisma/               # Prisma схема
    ├── schema.prisma
    └── migrations/
```

## 🔄 Пользовательские сценарии

### 1. Стандартная проверка
1. Клиент загружает фото сумки
2. Эксперт проверяет фотографии
3. Эксперт выносит решение
4. Генерируется PDF сертификат
5. Сертификат отправляется на email

### 2. Запрос дополнительных фото
1. Клиент загружает фото сумки
2. Эксперт запрашивает дополнительные фото
3. Клиент получает email с запросом
4. Клиент загружает дополнительные фото
5. Эксперт выносит решение
6. Генерируется сертификат

## 🎨 UI/UX концепция

### Принципы дизайна:
- **Минимализм** и чистота
- **Профессиональный** внешний вид
- **Доверие** через качество исполнения
- **Скорость** и отзывчивость
- **Мобильная** адаптация

### Цветовая схема:
- **Основной:** Slate (серо-синий)
- **Акцент:** Blue
- **Успех:** Green
- **Ошибка:** Red

### Ключевые страницы:
1. **Landing** - представление сервиса, trust indicators
2. **Upload** - drag&drop интерфейс загрузки
3. **Dashboard** - интерфейс эксперта
4. **Certificate** - просмотр и верификация сертификата

## 🚀 Конкурентные преимущества

### vs LegitCheck/LegitApp:
- **Быстрая разработка** (месяц vs полгода)
- **Современный стек** (Next.js 14, TypeScript)
- **Кастомный дизайн** (не шаблон)
- **Российская юрисдикция**
- **Персональный подход**

### Технические преимущества:
- **Full-stack TypeScript** (единый язык)
- **Serverless деплой** (масштабируется автоматически)
- **CDN оптимизация** (быстрая загрузка изображений)
- **Мобильный first** (адаптация с самого начала)

**Исходный код:** Частный репозиторий
**Документация:** Этот README + комментарии в коде
**Хостинг:** Vercel + Neon + Cloudinary
