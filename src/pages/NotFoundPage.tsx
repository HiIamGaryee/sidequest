import * as React from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
          <Compass className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
            // 404 - SIDE QUEST NOT FOUND
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            You wandered off the map
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            This route doesn't exist. Don't let a missing URL become your next procrastination rabbit
            hole.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5"
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              Return to Main Quest
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs gap-1.5"
          >
            <Link to="/projects">
              <ArrowLeft className="w-4 h-4" />
              View Projects
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
