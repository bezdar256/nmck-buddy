import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Methodology = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Методика расчёта НМЦК</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Что делает сервис</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                NMCK.AI — это автоматизированная система для обоснования начальной максимальной цены контракта (НМЦК) 
                в государственных и муниципальных закупках. Сервис использует искусственный интеллект для:
              </p>
              <ul>
                <li>Анализа технического задания и выделения ключевых характеристик</li>
                <li>Подбора товарных аналогов на основе требований заказчика</li>
                <li>Сбора актуальных цен из различных источников</li>
                <li>Статистической обработки данных и расчёта обоснованной НМЦК</li>
                <li>Формирования сравнительной таблицы для документирования</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Подбор аналогов с помощью AI</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Для подбора товарных аналогов используется модель YandexGPT, которая:
              </p>
              <ul>
                <li>Анализирует текст технического задания</li>
                <li>Извлекает ключевые характеристики товаров</li>
                <li>Нормализует параметры для корректного сравнения</li>
                <li>Подбирает аналоги с учётом заданного режима (строгий/расширенный)</li>
              </ul>
              <p>
                <strong>Строгий режим</strong> требует точного соответствия всем указанным характеристикам.
                <strong> Расширенный режим</strong> допускает близкие по параметрам товары, что расширяет выборку.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Расчёт статистических метрик</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                После сбора цен система рассчитывает следующие показатели:
              </p>
              
              <h3 className="text-lg font-semibold mt-4">Базовые метрики</h3>
              <ul>
                <li><strong>min_price</strong> — минимальная цена среди всех найденных предложений</li>
                <li><strong>max_price</strong> — максимальная цена</li>
                <li><strong>avg_price</strong> — среднее арифметическое всех цен</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">Медиана</h3>
              <p>
                Медиана — это значение, которое делит упорядоченный ряд пополам. 
                Для нечётного количества значений это средний элемент, для чётного — среднее двух центральных.
              </p>

              <h3 className="text-lg font-semibold mt-4">Перцентили P10 и P90</h3>
              <p>
                <strong>P10</strong> — это значение, ниже которого находится 10% всех цен.
                <strong> P90</strong> — значение, ниже которого 90% цен.
                Эти метрики помогают отсечь экстремальные выбросы.
              </p>

              <h3 className="text-lg font-semibold mt-4">Фильтрация выбросов</h3>
              <p>
                Для получения более точного результата система исключает из расчёта цены ниже P10 и выше P90. 
                Это позволяет убрать нерепрезентативные предложения (слишком дешёвые или завышенные).
              </p>

              <h3 className="text-lg font-semibold mt-4">Рекомендованная НМЦК</h3>
              <p>
                Итоговая рекомендованная НМЦК рассчитывается как среднее арифметическое цен после фильтрации выбросов. 
                Формула:
              </p>
              <code className="block bg-muted p-2 rounded my-2">
                recommended_nmck = round(mean(цены между P10 и P90))
              </code>

              <h3 className="text-lg font-semibold mt-4">Показатели разброса</h3>
              <ul>
                <li><strong>max_over_min_abs</strong> = max_price - min_price</li>
                <li><strong>max_over_min_pct</strong> = (max_price / min_price - 1) × 100%</li>
                <li><strong>avg_over_min_abs</strong> = avg_price - min_price</li>
                <li><strong>avg_over_min_pct</strong> = (avg_price / min_price - 1) × 100%</li>
              </ul>
              <p>
                Эти метрики показывают, насколько сильно различаются цены на рынке.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ограничения и рекомендации</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li>Для корректного расчёта необходимо минимум 3-5 аналогов с актуальными ценами</li>
                <li>Рекомендуется использовать несколько источников для объективности</li>
                <li>При большом разбросе цен (более 50%) следует пересмотреть критерии подбора аналогов</li>
                <li>Итоговая НМЦК является рекомендательной и может корректироваться специалистом</li>
                <li>Необходимо учитывать актуальность цен и условия поставки</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Источники цен</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Сервис собирает данные из следующих типов источников:
              </p>
              <ul>
                <li><strong>Маркетплейсы</strong> — крупные торговые площадки (Wildberries, Ozon и др.)</li>
                <li><strong>Внутренние базы</strong> — данные о предыдущих закупках</li>
                <li><strong>Специализированные каталоги</strong> — отраслевые прайс-листы</li>
              </ul>
              <p>
                Все цены фиксируются с указанием источника и даты сбора для последующей верификации.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Methodology;
