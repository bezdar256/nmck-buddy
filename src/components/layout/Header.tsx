import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold text-foreground">NMCK.AI</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/requests/new" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Новый расчёт
            </Link>
            <Link to="/requests" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              История
            </Link>
            <Link to="/methodology" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Методика
            </Link>
          </nav>

          <Button asChild className="hidden md:inline-flex">
            <Link to="/requests/new">Создать расчёт</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
