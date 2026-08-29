import * as React from "react";
import { AlertTriangle, RefreshCw, Home, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storageService } from "@/services/storage";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    // In production we log quietly without spamming
    console.error("SIDEQUEST runtime boundary caught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReturnHome = () => {
    window.location.href = "/";
  };

  handleExportEmergencyBackup = () => {
    try {
      const { state } = storageService.loadAppState();
      const json = storageService.exportAppState(state);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sidequest-emergency-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not export backup automatically.");
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-zinc-900/90 border border-red-500/30 p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold tracking-widest text-red-400 uppercase">
                  // CRITICAL RUNTIME ERROR
                </span>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                  SIDEQUEST Hit a Wall
                </h1>
              </div>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed">
              An unexpected render error occurred in this view. Your local data remains intact in
              browser storage.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-red-300 break-all max-h-32 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                onClick={this.handleReload}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={this.handleReturnHome}
                className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                Dashboard
              </Button>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex justify-center">
              <button
                type="button"
                onClick={this.handleExportEmergencyBackup}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Emergency Backup JSON
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
