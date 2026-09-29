import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import GameList from "@/pages/game-list";
import ThreeHintQuiz from "@/pages/three-hint-quiz";
import WordHunt from "@/pages/word-hunt";
import Jeopardy from "@/pages/jeopardy";
import QuizShow from "@/pages/quiz-show";
import SmallTalk from "@/pages/small-talk";
import ClassQuiz from "@/pages/class-quiz";
import InterviewBingo from "@/pages/interview-bingo";
import InterviewBingoHost from "@/pages/interview-bingo-host";
import InterviewBingoStudent from "@/pages/interview-bingo-student";
import BongoBingo from "@/pages/bongo-bingo";
import GamePlaceholder from "@/pages/game-placeholder";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import Pricing from "@/pages/pricing";
import OnboardingSuccess from "@/pages/onboarding-success";
import Dashboard from "@/pages/dashboard";
import ClassBattleLobby from "@/pages/class-battle-lobby";
import ClassBattleHost from "@/pages/class-battle-host";
import ClassBattleJoin from "@/pages/class-battle-join";
import ClassBattlePlay from "@/pages/class-battle-play";
import ClassBattleScoreboard from "@/pages/class-battle-scoreboard";
import FlashCardRace from "@/pages/flash-card-race";
import FlashCardRaceHost from "@/pages/flash-card-race-host";
import FlashCardRaceJoin from "@/pages/flash-card-race-join";
import FlashCardRacePlay from "@/pages/flash-card-race-play";
import Karuta from "@/pages/karuta";
import KarutaHost from "@/pages/karuta-host";
import KarutaJoin from "@/pages/karuta-join";
import KarutaPlay from "@/pages/karuta-play";
import Shiritori from "@/pages/shiritori";
import ShiritoriHost from "@/pages/shiritori-host";
import ShiritoriJoin from "@/pages/shiritori-join";
import ShiritoriPlay from "@/pages/shiritori-play";
import MysteryBox from "@/pages/mystery-box";
import MysteryBoxHost from "@/pages/mystery-box-host";
import MysteryBoxJoin from "@/pages/mystery-box-join";
import MysteryBoxPlay from "@/pages/mystery-box-play";
import SentenceBuilder from "@/pages/sentence-builder";
import SentenceBuilderHost from "@/pages/sentence-builder-host";
import SentenceBuilderJoin from "@/pages/sentence-builder-join";
import SentenceBuilderPlay from "@/pages/sentence-builder-play";
import GrammarGolf from "@/pages/grammar-golf";
import GrammarGolfHost from "@/pages/grammar-golf-host";
import GrammarGolfJoin from "@/pages/grammar-golf-join";
import GrammarGolfPlay from "@/pages/grammar-golf-play";
import SpellingBee from "@/pages/spelling-bee";
import SpellingBeeHost from "@/pages/spelling-bee-host";
import SpellingBeeJoin from "@/pages/spelling-bee-join";
import SpellingBeePlay from "@/pages/spelling-bee-play";
import RolePlay from "@/pages/role-play";
import RolePlayHost from "@/pages/role-play-host";
import RolePlayJoin from "@/pages/role-play-join";
import RolePlayPlay from "@/pages/role-play-play";
import ListeningBingo from "@/pages/listening-bingo";
import ListeningBingoHost from "@/pages/listening-bingo-host";
import ListeningBingoJoin from "@/pages/listening-bingo-join";
import ListeningBingoPlay from "@/pages/listening-bingo-play";
import TranslationDash from "@/pages/translation-dash";
import TranslationDashHost from "@/pages/translation-dash-host";
import TranslationDashJoin from "@/pages/translation-dash-join";
import TranslationDashPlay from "@/pages/translation-dash-play";
import AdminDashboard from "@/pages/admin";
import AdminUsers from "@/pages/admin-users";
import AdminSetup from "@/pages/admin-setup";
import AdminAnalytics from "@/pages/admin-analytics";
import AdminNewsletter from "@/pages/admin-newsletter";
import Unsubscribe from "@/pages/unsubscribe";
import { usePageAnalytics } from "@/hooks/useAnalytics";

function PageTracker() {
  usePageAnalytics();
  return null;
}

function Router() {
  return (
    <>
      <PageTracker />
      <Switch>
      <Route path="/" component={Home} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/onboarding/success" component={OnboardingSuccess} />
      <Route path="/games" component={GameList} />
      <Route path="/game/3-hint" component={ThreeHintQuiz} />
      <Route path="/game/word-hunt" component={WordHunt} />
      <Route path="/game/jeopardy" component={Jeopardy} />
      <Route path="/game/quiz-show" component={QuizShow} />
      <Route path="/game/small-talk" component={SmallTalk} />
      <Route path="/game/class-quiz" component={ClassQuiz} />
      <Route path="/game/interview-bingo" component={InterviewBingo} />
      <Route path="/game/interview-bingo/host" component={InterviewBingoHost} />
      <Route path="/game/interview-bingo/join" component={InterviewBingoStudent} />
      <Route path="/game/bongo-bingo" component={BongoBingo} />
      <Route path="/class-battle" component={ClassBattleLobby} />
      <Route path="/class-battle/host" component={ClassBattleHost} />
      <Route path="/class-battle/join" component={ClassBattleJoin} />
      <Route path="/class-battle/play" component={ClassBattlePlay} />
      <Route path="/class-battle/scoreboard" component={ClassBattleScoreboard} />
      <Route path="/game/flash-cards" component={FlashCardRace} />
      <Route path="/game/flash-cards/host" component={FlashCardRaceHost} />
      <Route path="/game/flash-cards/join" component={FlashCardRaceJoin} />
      <Route path="/game/flash-cards/play" component={FlashCardRacePlay} />
      <Route path="/game/karuta" component={Karuta} />
      <Route path="/game/karuta/host" component={KarutaHost} />
      <Route path="/game/karuta/join" component={KarutaJoin} />
      <Route path="/game/karuta/play" component={KarutaPlay} />
      <Route path="/game/shiritori" component={Shiritori} />
      <Route path="/game/shiritori/host" component={ShiritoriHost} />
      <Route path="/game/shiritori/join" component={ShiritoriJoin} />
      <Route path="/game/shiritori/play" component={ShiritoriPlay} />
      <Route path="/game/mystery-box" component={MysteryBox} />
      <Route path="/game/mystery-box/host" component={MysteryBoxHost} />
      <Route path="/game/mystery-box/join" component={MysteryBoxJoin} />
      <Route path="/game/mystery-box/play" component={MysteryBoxPlay} />
      <Route path="/game/sentence-builder" component={SentenceBuilder} />
      <Route path="/game/sentence-builder/host" component={SentenceBuilderHost} />
      <Route path="/game/sentence-builder/join" component={SentenceBuilderJoin} />
      <Route path="/game/sentence-builder/play" component={SentenceBuilderPlay} />
      <Route path="/game/grammar-golf" component={GrammarGolf} />
      <Route path="/game/grammar-golf/host" component={GrammarGolfHost} />
      <Route path="/game/grammar-golf/join" component={GrammarGolfJoin} />
      <Route path="/game/grammar-golf/play" component={GrammarGolfPlay} />
      <Route path="/game/spelling-bee" component={SpellingBee} />
      <Route path="/game/spelling-bee/host" component={SpellingBeeHost} />
      <Route path="/game/spelling-bee/join" component={SpellingBeeJoin} />
      <Route path="/game/spelling-bee/play" component={SpellingBeePlay} />
      <Route path="/game/role-play" component={RolePlay} />
      <Route path="/game/role-play/host" component={RolePlayHost} />
      <Route path="/game/role-play/join" component={RolePlayJoin} />
      <Route path="/game/role-play/play" component={RolePlayPlay} />
      <Route path="/game/listening-bingo" component={ListeningBingo} />
      <Route path="/game/listening-bingo/host" component={ListeningBingoHost} />
      <Route path="/game/listening-bingo/join" component={ListeningBingoJoin} />
      <Route path="/game/listening-bingo/play" component={ListeningBingoPlay} />
      <Route path="/game/translation-dash" component={TranslationDash} />
      <Route path="/game/translation-dash/host" component={TranslationDashHost} />
      <Route path="/game/translation-dash/join" component={TranslationDashJoin} />
      <Route path="/game/translation-dash/play" component={TranslationDashPlay} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/setup" component={AdminSetup} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/newsletter" component={AdminNewsletter} />
      <Route path="/unsubscribe" component={Unsubscribe} />
      <Route path="/game/:gameId" component={GamePlaceholder} />
      <Route component={NotFound} />
    </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
