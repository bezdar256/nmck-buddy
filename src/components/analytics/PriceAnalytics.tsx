import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ========== MOCK DATA FOR DEMO ==========
// Set to false when real data is available
const USE_MOCK_DATA = true;

const MOCK_AGG = {
  min_price: 12000,
  max_price: 18900,
  avg_price: 14800,
  median_price: 14750,
  p10_price: 12500,
  p90_price: 17500,
  recommended_nmck: 14800,
  max_over_min_abs: 6900,
  max_over_min_pct: 57.5,
  avg_over_min_abs: 2800,
  avg_over_min_pct: 23.3,
  prices_used_count: 12,
  prices_total_count: 15
};

const MOCK_PRICES = [
  { source_name: "Маркетплейс A", price: 13500 },
  { source_name: "Маркетплейс A", price: 14200 },
  { source_name: "Маркетплейс B", price: 15000 },
  { source_name: "Маркетплейс B", price: 14800 },
  { source_name: "Маркетплейс C", price: 12500 },
  { source_name: "Маркетплейс C", price: 16200 },
];
// ========== END MOCK DATA ==========

interface AggregatedResult {
  min_price: number;
  max_price: number;
  avg_price: number;
  median_price: number;
  p10_price: number;
  p90_price: number;
  recommended_nmck: number;
  max_over_min_abs: number;
  max_over_min_pct: number;
  avg_over_min_abs: number;
  avg_over_min_pct: number;
  prices_used_count: number;
  prices_total_count: number;
}

interface Price {
  source_name: string;
  price: number;
}

interface PriceAnalyticsProps {
  aggregatedResult: AggregatedResult;
  prices: Price[];
}

export const PriceAnalytics = ({ aggregatedResult, prices }: PriceAnalyticsProps) => {
  // Use mock data if enabled and no real data
  const agg = USE_MOCK_DATA && (!aggregatedResult || !prices?.length) ? MOCK_AGG : aggregatedResult;
  const pricesData = USE_MOCK_DATA && (!prices?.length) ? MOCK_PRICES : prices;

  if (!agg || !pricesData || pricesData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Недостаточно данных для визуализации</p>
      </div>
    );
  }

  // Группировка цен по источникам
  const pricesBySource = pricesData.reduce((acc, price) => {
    if (!acc[price.source_name]) {
      acc[price.source_name] = [];
    }
    acc[price.source_name].push(price.price);
    return acc;
  }, {} as Record<string, number[]>);

  // Подготовка данных для графика
  const chartData = Object.entries(pricesBySource).map(([source, sourcePrices]) => ({
    source_name: source,
    min_price: Math.min(...sourcePrices),
    avg_price: sourcePrices.reduce((sum, p) => sum + p, 0) / sourcePrices.length,
  }));

  // Диапазон для визуализации
  const priceRange = agg.max_price - agg.min_price;
  const p10Position = ((agg.p10_price - agg.min_price) / priceRange) * 100;
  const medianPosition = ((agg.median_price - agg.min_price) / priceRange) * 100;
  const p90Position = ((agg.p90_price - agg.min_price) / priceRange) * 100;

  return (
    <div className="space-y-6">
      {/* Карточка с НМЦК */}
      <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
        <h3 className="text-lg font-medium text-muted-foreground mb-2">Рекомендованная НМЦК</h3>
        <div className="text-4xl font-bold text-primary mb-2">
          {agg.recommended_nmck.toLocaleString("ru-RU")} ₽
        </div>
        <p className="text-sm text-muted-foreground">
          На основе {agg.prices_used_count} цен из {agg.prices_total_count}, без значений за пределами P10–P90
        </p>
      </div>

      {/* Ключевые метрики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Минимальная цена</div>
            <div className="text-2xl font-bold">{agg.min_price.toLocaleString("ru-RU")} ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Максимальная цена</div>
            <div className="text-2xl font-bold">{agg.max_price.toLocaleString("ru-RU")} ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Средняя цена</div>
            <div className="text-2xl font-bold">{agg.avg_price.toLocaleString("ru-RU")} ₽</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Медиана</div>
            <div className="text-2xl font-bold">{agg.median_price.toLocaleString("ru-RU")} ₽</div>
          </CardContent>
        </Card>
      </div>

      {/* График по источникам */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Цены по источникам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source_name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `${value.toLocaleString("ru-RU")} ₽`}
                />
                <Legend />
                <Bar dataKey="min_price" fill="hsl(var(--primary))" name="Мин. цена по источнику" />
                <Bar dataKey="avg_price" fill="hsl(var(--secondary))" name="Средняя цена по источнику" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Диапазон цен */}
      <Card>
        <CardHeader>
          <CardTitle>Диапазон цен</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative h-16 bg-muted rounded">
              {/* Основная полоса диапазона */}
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-primary/20 -translate-y-1/2" />
              
              {/* Маркеры */}
              <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${p10Position}%` }}>
                <div className="w-1 h-8 bg-primary" />
                <div className="text-xs text-center -ml-6 mt-1 w-12">P10</div>
              </div>
              
              <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${medianPosition}%` }}>
                <div className="w-1 h-12 bg-primary" />
                <div className="text-xs text-center -ml-8 mt-1 w-16 font-medium">Медиана</div>
              </div>
              
              <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${p90Position}%` }}>
                <div className="w-1 h-8 bg-primary" />
                <div className="text-xs text-center -ml-6 mt-1 w-12">P90</div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Мин: {agg.min_price.toLocaleString("ru-RU")} ₽</span>
              <span>Макс: {agg.max_price.toLocaleString("ru-RU")} ₽</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">P10</div>
                <div>{agg.p10_price.toLocaleString("ru-RU")} ₽</div>
              </div>
              <div>
                <div className="font-medium">Медиана</div>
                <div>{agg.median_price.toLocaleString("ru-RU")} ₽</div>
              </div>
              <div>
                <div className="font-medium">P90</div>
                <div>{agg.p90_price.toLocaleString("ru-RU")} ₽</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Текстовые выводы */}
      <Card>
        <CardHeader>
          <CardTitle>Выводы по ценам</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Диапазон цен по всем источникам: от {agg.min_price.toLocaleString("ru-RU")} ₽ до {agg.max_price.toLocaleString("ru-RU")} ₽.
          </p>
          <p>
            80% цен (P10–P90) лежат в диапазоне {agg.p10_price.toLocaleString("ru-RU")}–{agg.p90_price.toLocaleString("ru-RU")} ₽.
          </p>
          <p>
            Максимальная цена превышает минимальную на {agg.max_over_min_abs.toLocaleString("ru-RU")} ₽ ({agg.max_over_min_pct.toFixed(1)}%).
          </p>
          <p>
            Средняя цена выше минимальной на {agg.avg_over_min_abs.toLocaleString("ru-RU")} ₽ ({agg.avg_over_min_pct.toFixed(1)}%).
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
