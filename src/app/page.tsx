import React from 'react';
import { Shield, CheckCircle, Upload, Star, ArrowRight, Mail, Phone, Clock, Award } from 'lucide-react';

export default function BagCheckLanding() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-slate-900 dark:text-white">BagCheck</span>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#services" className="text-slate-600 hover:text-blue-600 transition-colors">Услуги</a>
                <a href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors">Как это работает</a>
                <a href="#about" className="text-slate-600 hover:text-blue-600 transition-colors">О нас</a>
                <a href="#contact" className="text-slate-600 hover:text-blue-600 transition-colors">Контакты</a>
              </nav>
              <div className="flex items-center space-x-4">
                <button className="text-slate-600 hover:text-blue-600 transition-colors">Войти</button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Начать проверку
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium mb-6">
                  <CheckCircle className="h-4 w-4" />
                  <span>Профессиональная аутентификация</span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                  Проверка подлинности{' '}
                  <span className="text-blue-600">дизайнерских сумок</span>
                </h1>

                <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                  Получите официальный сертификат подлинности от экспертов.
                  Быстро, надежно и с гарантией качества.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <Upload className="h-5 w-5" />
                    <span className="font-semibold">Загрузить фото</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all duration-200">
                    Узнать больше
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center space-x-6 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <div className="flex -space-x-1">
                      {[1,2,3,4,5].map(i => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span>5.0 рейтинг</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>1000+ проверок</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>24-48 часов</span>
                  </div>
                </div>
              </div>

              {/* Hero Image/Visual */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                        <Upload className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Загрузите фото</h3>
                        <p className="text-sm text-slate-500">Сделайте качественные снимки</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Экспертная оценка</h3>
                        <p className="text-sm text-slate-500">Профессиональная проверка</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Получите сертификат</h3>
                        <p className="text-sm text-slate-500">Официальный документ</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Подлинная</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="services" className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Почему выбирают BagCheck?
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Мы предоставляем самый надежный сервис аутентификации
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Экспертная проверка",
                  description: "Наши специалисты имеют многолетний опыт работы с дизайнерскими брендами"
                },
                {
                  icon: Award,
                  title: "Официальный сертификат",
                  description: "PDF документ с QR-кодом для верификации подлинности"
                },
                {
                  icon: Clock,
                  title: "Быстрый результат",
                  description: "Получите результат проверки в течение 24-48 часов"
                }
              ].map((feature, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-6">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Как это работает
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Простой процесс в три шага
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Загрузите фотографии",
                  description: "Сделайте качественные снимки сумки с разных ракурсов"
                },
                {
                  step: "02",
                  title: "Экспертная оценка",
                  description: "Наш эксперт проанализирует все детали и материалы"
                },
                {
                  step: "03",
                  title: "Получите сертификат",
                  description: "Официальный документ придет на указанный email"
                }
              ].map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-600 text-white rounded-full text-xl font-bold mb-6">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { number: "1000+", label: "Проверенных сумок" },
                { number: "98%", label: "Точность экспертизы" },
                { number: "24ч", label: "Среднее время проверки" },
                { number: "5.0", label: "Рейтинг клиентов" }
              ].map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                    <div className="text-slate-600 dark:text-slate-300">{stat.label}</div>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Готовы проверить подлинность вашей сумки?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Присоединяйтесь к тысячам довольных клиентов
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-200 font-semibold flex items-center space-x-2 mx-auto">
              <Upload className="h-5 w-5" />
              <span>Начать проверку сейчас</span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-6 w-6 text-blue-400" />
                  <span className="text-lg font-bold">BagCheck</span>
                </div>
                <p className="text-slate-400">
                  Профессиональная аутентификация дизайнерских сумок
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Услуги</h3>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">Проверка подлинности</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Сертификация</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Консультации</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Компания</h3>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Команда</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Карьера</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Контакты</h3>
                <div className="space-y-2 text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>info@bagcheck.ru</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>+7 (999) 123-45-67</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
              <p>&copy; 2024 BagCheck. Все права защищены.</p>
            </div>
          </div>
        </footer>
      </div>
  );
}