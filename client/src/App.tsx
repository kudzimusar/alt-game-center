import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import GameList from "@/pages/game-list";
import ThreeHintQuiz from "@/pages/three-hint-quiz";
import WordHunt from "@/pages/word-hunt";
import Jeopardy from "@/pages/jeopardy";
import QuizShow from "@/pages/quiz-show";
import SmallTalk from "@/pages/small-talk";
import ClassQuiz from "@/pages/class-quiz";
import GamePlaceholder from "@/pages/game-placeholder";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games" component={GameList} />
      <Route path="/game/3-hint" component={ThreeHintQuiz} />
      <Route path="/game/word-hunt" component={WordHunt} />
      <Route path="/game/jeopardy" component={Jeopardy} />
      <Route path="/game/quiz-show" component={QuizShow} />
      <Route path="/game/small-talk" component={SmallTalk} />
      <Route path="/game/class-quiz" component={ClassQuiz} />
      <Route path="/game/:gameId" component={GamePlaceholder} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
