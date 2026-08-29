import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-[#18181b] border border-[#27272a] rounded-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-[#fafafa]">
                HUD Calibration Error
              </h2>
              <p className="text-xs text-[#71717a] leading-relaxed">
                An unexpected interface issue was caught. Your local state remains secure.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Reload Interface
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

