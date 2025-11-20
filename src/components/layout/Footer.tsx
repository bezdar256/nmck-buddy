import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            MVP для автоматизации обоснования НМЦК (GorkyCode 2025)
          </div>
          <div className="flex gap-6">
            <Link to="/methodology" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Методика
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
