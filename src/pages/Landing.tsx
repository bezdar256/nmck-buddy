import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, Brain, BarChart3 } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            ИИ-помощник для обоснования НМЦК
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Вставьте текст ТЗ — сервис выделит характеристики, подберёт аналоги, 
            соберёт цены и рассчитает НМЦК без ручного подбора
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/requests/new">Создать расчёт</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/requests/444c2eae-ee50-47c6-a053-b85b957a3388">Посмотреть пример</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Link to="/requests/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Шаг 1: Ввод ТЗ</h3>
                  <p className="text-muted-foreground">
                    Введите описание закупки и основные характеристики из технического задания
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/requests/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Шаг 2: ИИ-подбор</h3>
                  <p className="text-muted-foreground">
                    ИИ анализирует характеристики, подбирает аналоги и нормализует параметры
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/requests/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Шаг 3: Расчёт НМЦК</h3>
                  <p className="text-muted-foreground">
                    Сбор цен из источников, фильтрация выбросов и формирование отчёта
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Preview Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Превью интерфейса</h2>
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/20 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <BarChart3 className="h-24 w-24 text-primary mx-auto opacity-50" />
                  <p className="text-lg text-muted-foreground">
                    Интерактивные графики и таблицы для анализа цен
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;
