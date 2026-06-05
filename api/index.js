const API_URL = process.env.API_URL || 'https://api.proxyapi.ru/openai/v1/chat/completions';
const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {
    // Разрешаем CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { model, messages, productUrl, manualInfo, mode } = req.body;

        // Если это запрос к чату
        if (!mode) {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({ model: model || 'gpt-3.5-turbo', messages })
            });
            const data = await response.json();
            return res.status(response.status).json(data);
        }

        // Если это оценка товара
        if (mode === 'by_link' || mode === 'by_manual') {
            const systemPrompt = [
                'Ты эксперт по техническому анализу товаров. Твоя база знаний содержит данные о миллионах устройств.',
                'Тебе прислали ССЫЛКУ на товар. Твоя задача — по тексту ссылки понять, что это за товар, и использовать свои знания о нем.',
                'КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать "уточняется" или "не указано". Если ты узнал модель — пиши всё, что о ней знаешь.',
                'ВАЖНО: Начни свой ответ строго со строки в формате: [NAME: Краткое название товара]',
                'Затем предоставь подробный отчет:',
                '1. ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ: Опиши всё (процессор, материалы, экран, сенсоры и т.д.).',
                '2. СРАВНЕНИЕ: Сравни с 2 конкретными конкурентами (назови их модели).',
                '3. ПЛЮСЫ И МИНУСЫ: На основе технических данных.',
                '4. ВЕРДИКТ: Стоит ли брать.',
                'Ответ дай на русском языке, максимально подробно.'
            ].join('\n');

            const userPrompt = `Проанализируй товар. Ссылка: ${productUrl}. Подсказка по названию: ${manualInfo || 'не указана'}`;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ]
                })
            });

            const data = await response.json();
            const report = data.choices?.[0]?.message?.content || 'Ошибка анализа';
            
            return res.status(200).json({
                ok: true,
                report,
                extracted: { name: manualInfo || 'Товар' }
            });
        }

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
