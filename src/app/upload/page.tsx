// src/app/upload/page.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
'use client'

import React, { useState, useRef } from 'react'
import { Shield, Upload, X, Check, AlertCircle, Camera, FileImage, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface UploadedFile {
    file: File
    preview: string
    id: string
}

export default function UploadPage() {
    const [uploadStep, setUploadStep] = useState<'upload' | 'info' | 'success'>('upload')
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [email, setEmail] = useState('')
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [ticketId, setTicketId] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const droppedFiles = Array.from(e.dataTransfer.files)
        processFiles(droppedFiles)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            processFiles(selectedFiles)
        }
    }

    const processFiles = (newFiles: File[]) => {
        const imageFiles = newFiles.filter(file => file.type.startsWith('image/'))

        if (imageFiles.length === 0) {
            alert('Пожалуйста, выберите файлы изображений')
            return
        }

        if (files.length + imageFiles.length > 10) {
            alert('Максимум 10 файлов')
            return
        }

        imageFiles.forEach(file => {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert(`Файл ${file.name} слишком большой. Максимум 5MB.`)
                return
            }

            const reader = new FileReader()
            reader.onload = (e) => {
                setFiles(prev => [...prev, {
                    file,
                    preview: e.target?.result as string,
                    id: Math.random().toString(36).substr(2, 9)
                }])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeFile = (id: string) => {
        setFiles(files.filter(file => file.id !== id))
    }

    const handleContinue = () => {
        if (files.length === 0) {
            alert('Пожалуйста, загрузите минимум одну фотографию')
            return
        }
        setUploadStep('info')
    }

    const handleSubmit = async () => {
        if (files.length === 0 || !email) return

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('email', email)

            // Добавляем все файлы в FormData
            files.forEach((fileObj, index) => {
                formData.append(`file_${index}`, fileObj.file)
            })

            console.log('🚀 Sending request to API...')

            const response = await fetch('/api/tickets', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create ticket')
            }

            console.log('✅ Ticket created:', result.ticket)

            setTicketId(result.ticket.id)
            setUploadStep('success')

        } catch (error) {
            console.error('❌ Upload failed:', error)
            alert('Произошла ошибка при загрузке. Попробуйте еще раз.')
        } finally {
            setIsUploading(false)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    if (uploadStep === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                {/* Header */}
                <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="flex items-center space-x-2">
                                <Shield className="h-8 w-8 text-blue-600" />
                                <span className="text-xl font-bold text-slate-900 dark:text-white">BagCheck</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Success Content */}
                <div className="max-w-2xl mx-auto px-4 py-20">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>

                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                            Заявка успешно создана!
                        </h1>

                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                            Ваши фотографии отправлены на экспертизу. Результат будет готов в течение 24-48 часов.
                        </p>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg mb-8">
                            <div className="text-sm text-slate-500 mb-2">Номер заявки</div>
                            <div className="text-2xl font-bold text-blue-600 mb-4">{ticketId}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-300">
                                Ссылка для отслеживания отправлена на {email}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {/* ИСПРАВЛЕНИЕ: Меняем ссылку с /status/ на /verify/ */}
                            <Link
                                href={`/verify/${ticketId}`}
                                className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                            >
                                Отследить статус
                            </Link>
                            <Link
                                href="/"
                                className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-colors"
                            >
                                На главную
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (uploadStep === 'info') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
                {/* Header */}
                <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="flex items-center space-x-2">
                                <Shield className="h-8 w-8 text-blue-600" />
                                <span className="text-xl font-bold text-slate-900 dark:text-white">BagCheck</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Info Form */}
                <div className="max-w-2xl mx-auto px-4 py-20">
                    <div>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                Контактные данные
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300">
                                Укажите email для получения результатов экспертизы
                            </p>
                        </div>

                        <div className="max-w-md mx-auto">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
                                <div className="mb-6">
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Email адрес *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        required
                                    />
                                </div>

                                <div className="flex items-start space-x-3 mb-6">
                                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                        На этот email будет отправлен результат экспертизы и ссылка для отслеживания статуса заявки.
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setUploadStep('upload')}
                                        className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
                                    >
                                        Назад
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!email || isUploading}
                                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center justify-center space-x-2"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Загрузка...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4" />
                                                <span>Отправить</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center space-x-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-slate-900 dark:text-white">BagCheck</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Upload Content */}
            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Загрузите фото сумки
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300">
                        Наши эксперты проверят подлинность и выдадут заключение
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
                    {/* Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                            isDragging
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <Camera className="h-8 w-8 text-blue-600" />
                            </div>

                            <div>
                                <p className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                                    Перетащите фото сюда
                                </p>
                                <p className="text-slate-600 dark:text-slate-300 mb-4">
                                    или нажмите для выбора файлов
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center space-x-2"
                                >
                                    <FileImage className="h-4 w-4" />
                                    <span>Выбрать файлы</span>
                                </button>
                            </div>

                            <p className="text-sm text-slate-500">
                                Поддерживаются: JPG, PNG, WebP. Максимум 10 файлов, до 5MB каждый.
                            </p>
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* File Preview */}
                    {files.length > 0 && (
                        <div className="mt-8">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Выбранные файлы ({files.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {files.map((file) => (
                                    <div key={file.id} className="relative group">
                                        <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                                            <img
                                                src={file.preview}
                                                alt={file.file.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeFile(file.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="mt-2">
                                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                                {file.file.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatFileSize(file.file.size)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Continue Button */}
                    {files.length > 0 && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleContinue}
                                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center space-x-2"
                            >
                                <span>Продолжить</span>
                                <span className="text-sm opacity-80">({files.length} файл{files.length > 1 ? (files.length > 4 ? 'ов' : 'а') : ''})</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        💡 Советы для лучшего результата
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <div>• Сфотографируйте логотип крупным планом</div>
                        <div>• Покажите серийный номер и бирки</div>
                        <div>• Сделайте фото швов и фурнитуры</div>
                        <div>• Используйте хорошее освещение</div>
                    </div>
                </div>
            </div>
        </div>
    )
}