'use client'

import { useState } from 'react'

export default function HomePage() {
  const [isDragOver, setIsDragOver] = useState(false)

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Header */}
        <header className="relative bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Bag Check
                  </h1>
                  <p className="text-xs text-slate-500">Certified Authentication</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Как это работает</a>
                <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Цены</a>
                <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Контакты</a>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                  Войти
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
            {/* Trust Indicators */}
            <div className="flex justify-center items-center space-x-6 mb-12 opacity-60">
              <span className="text-sm text-slate-500">Доверяют нам:</span>
              <div className="flex items-center space-x-4 text-slate-400">
                <span className="font-semibold">GUCCI</span>
                <span className="font-semibold">LOUIS VUITTON</span>
                <span className="font-semibold">CHANEL</span>
                <span className="font-semibold">HERMÈS</span>
              </div>
            </div>

            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
                Проверка подлинности
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                люксовых сумок
              </span>
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                Получите профессиональный сертификат подлинности с QR-кодом верификации.
                Наши эксперты имеют многолетний опыт работы с люксовыми брендами.
              </p>

              {/* Stats */}
              <div className="flex justify-center items-center space-x-8 mb-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">50,000+</div>
                  <div className="text-sm text-slate-500">Проверенных сумок</div>
                </div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">99.8%</div>
                  <div className="text-sm text-slate-500">Точность</div>
                </div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">24ч</div>
                  <div className="text-sm text-slate-500">Результат</div>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="max-w-2xl mx-auto">
              <div
                  className={`relative bg-white/70 backdrop-blur-sm rounded-2xl p-8 border-2 border-dashed transition-all duration-300 ${
                      isDragOver
                          ? 'border-blue-400 bg-blue-50/50 scale-105'
                          : 'border-slate-300 hover:border-slate-400'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragOver(true)
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragOver(false)
                  }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Загрузите фотографии
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Перетащите файлы сюда или нажмите для выбора<br/>
                    <span className="text-sm text-slate-500">Минимум 3 фото: общий вид, логотип, серийный номер</span>
                  </p>
                  <button className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Выбрать фотографии
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-center mt-6">
                <p className="text-slate-600">
                  Стоимость проверки: <span className="font-bold text-slate-900">1,990 ₽</span>
                  <span className="text-slate-500 text-sm ml-2">Гарантия возврата при ошибке</span>
                </p>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <section className="py-20 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold text-slate-900 mb-4">Почему выбирают нас</h3>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Мы используем передовые технологии и экспертные знания для максимально точной проверки
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "⚡",
                    title: "Быстрый результат",
                    description: "Получите сертификат в течение 24 часов с момента загрузки фотографий"
                  },
                  {
                    icon: "🔒",
                    title: "Защищенный сертификат",
                    description: "QR-код с блокчейн верификацией для подтверждения подлинности документа"
                  },
                  {
                    icon: "👨‍💼",
                    title: "Сертифицированные эксперты",
                    description: "Команда профессионалов с опытом работы в крупнейших аукционных домах"
                  }
                ].map((feature, index) => (
                    <div key={index} className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/50 group">
                      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h4>
                      <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Начните проверку прямо сейчас
              </h3>
              <p className="text-xl text-slate-300 mb-8">
                Присоединяйтесь к тысячам довольных клиентов, которые доверяют нам проверку своих люксовых покупок
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-colors">
                  Загрузить фотографии
                </button>
                <button className="border border-slate-400 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors">
                  Посмотреть примеры
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
  );
}