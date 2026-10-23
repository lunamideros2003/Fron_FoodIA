export type MoodKey =
  | "tired"
  | "happy"
  | "stressed"
  | "sad"
  | "no_energy"
  | "in_a_hurry";

export type HealthCondition =
  | "diabetes"
  | "hypertension"
  | "celiac"
  | "lactose_intolerance"
  | "high_cholesterol";

export interface HealthProfile {
  diabetes: boolean;
  hypertension: boolean;
  celiac: boolean;
  lactoseIntolerance: boolean;
  highCholesterol: boolean;
  answeredAt: string | null;
}

export interface Nutrition {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  sugarGrams: number;
  fiberGrams: number;
  sodiumMg: number;
}

export type InteractionAction =
  | "impression"
  | "view"
  | "like"
  | "save"
  | "cook"
  | "eat"
  | "rate"
  | "dislike";

export type Diet = "omnivore" | "vegetarian" | "vegan" | "pescatarian";

export interface Mood {
  id: number;
  key: MoodKey;
  label: string;
  emoji: string;
  description: string;
  accent: string;
  sortOrder: number;
}

export interface DishIngredient {
  ingredientId: number;
  name: string;
  label: string;
  quantity: string;
  optional: boolean;
}

export interface DishAxes {
  comfort: number;
  energy: number;
  speed: number;
  lightness: number;
  richness: number;
  spice: number;
  sweetness: number;
  freshness: number;
  protein: number;
  indulgence: number;
  warmth: number;
  complexity: number;
  value: number;
}

export interface Dish {
  id: number;
  name: string;
  nameEs: string;
  slug: string;
  category: string;
  description: string;
  prepMinutes: number;
  difficulty: "facil" | "media" | "avanzada";
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  priceLevel: 1 | 2 | 3;
  imageUrl: string;
  tags: string[];
  axes: DishAxes;
  ingredients: DishIngredient[];
  isVegetarian: boolean;
  isVegan: boolean;
  containsGluten: boolean;
  servings: number;
  steps: string[];
  chefTip: string | null;
  nutrition: Nutrition;
}

export interface UserPreferences {
  diet: Diet;
  maxPrepMinutes: number | null;
  maxSpiceLevel: number;
  maxPriceLevel: number;
  allergies: string[];
  dislikedIngredients: string[];
  health: HealthProfile;
  dailyCalorieGoal: number;
}

export interface User {
  id: number;
  email: string;
  displayName: string;
  createdAt: string;
  preferences: UserPreferences;
}

export type AxisName = keyof DishAxes;

/* ------------------------------------------------------------------ *
 * The "Mi ánimo" wizard
 * ------------------------------------------------------------------ */

export type MoodOptionKey =
  | "energized"
  | "low"
  | "stressed_tired"
  | "bored"
  | "calm"
  | "celebrating";

export type MoodOptionIcon =
  | "energy"
  | "comfort"
  | "calm"
  | "spark"
  | "leaf"
  | "toast";

export interface QuestionnaireMood {
  key: MoodOptionKey;
  label: string;
  description: string;
  icon: MoodOptionIcon;
}

export type TimeBudgetKey = "under_10" | "between_10_30" | "plenty";

export interface TimeBudgetOption {
  key: TimeBudgetKey;
  label: string;
  description: string;
  maxMinutes: number | null;
}

export type CravingKey = "sweet" | "savory" | "light" | "comfort" | "surprise";

export interface CravingOption {
  key: CravingKey;
  label: string;
  description: string;
}

export interface LabelledOption<T extends string> {
  value: T;
  label: string;
}

export interface QuestionnaireVocabulary {
  moods: QuestionnaireMood[];
  timeBudgets: TimeBudgetOption[];
  cravings: CravingOption[];
  diets: LabelledOption<Diet>[];
  difficulties: LabelledOption<Dish["difficulty"]>[];
}

export interface QuestionnairePayload {
  moodOption: MoodOptionKey;
  note?: string;
  timeBudget: TimeBudgetKey;
  craving: CravingKey;
  availableIngredients?: string[];
  excludedIngredients?: string[];
  allergies?: string[];
  diet?: Diet;
  difficulty?: Dish["difficulty"];
  servings?: number;
  userId?: number;
  limit?: number;
}

export interface QuestionnaireMeta {
  moodOption: MoodOptionKey;
  moodLabel: string;
  timeBudget: TimeBudgetKey;
  craving: CravingKey;
  maxPrepMinutes: number | null;
  matchedMood: MoodKey;
}

export interface StructuredRecommendation {
  recipeId: number;
  reason: string;
  timeMatch: boolean;
  preferencesSatisfied: string[];
  warnings: string[];
}

export interface ScoreBreakdown {
  moodAffinity: number;
  tasteMatch: number;
  collaborative: number;
  preferenceFit: number;
  novelty: number;
  popularity: number;
  healthFit: number;
  cravingFit: number;
  timeFit: number;
  total: number;
  topReasons: { axis: AxisName; contribution: number; weight: number }[];
  healthNotes: string[];
}

export interface RecommendedDish {
  dish: Dish;
  score: number;
  breakdown: ScoreBreakdown;
  explanation: string;
  aiSource: "local-model" | "llm" | "llm-fallback";
  modelVersion: string;
}

export interface RecommendationResponse {
  mood: Mood;
  generatedAt: string;
  modelVersion: string;
  strategy: string;
  narrative: string;
  items: RecommendedDish[];
  alternatives: { dish: Dish; score: number; reason: string }[];
  needsHealthInfo: boolean;
  healthQuestion: string | null;
  summary: string;
  supportHint: string | null;
  structured: StructuredRecommendation[];
  questionnaire?: QuestionnaireMeta;
}

export interface ConsumedDish {
  dishId: number;
  nameEs: string;
  servings: number;
  calories: number;
  sugarGrams: number;
  eatenAt: string;
}

export interface BalanceResponse {
  consumed: ConsumedDish[];
  totals: {
    calories: number;
    sugarGrams: number;
    proteinGrams: number;
    fiberGrams: number;
    goalCalories: number;
  };
  calorieProgress: number;
  severity: "ok" | "watch" | "high" | "over";
  headline: string;
  message: string;
  suggestions: RecommendedDish[];
  comfortOption: RecommendedDish | null;
}

export interface HealthReport {
  conditions: HealthCondition[];
  answered: boolean;
  dailyCalorieGoal: number;
  availableDishes: number;
  blocked: { dishId: number; nameEs: string; reason: string }[];
  warned: { dishId: number; nameEs: string; warnings: string[] }[];
}

export interface SimilarDish {
  dish: Dish;
  similarity: number;
  supportedBy: number;
  strategy: "collaborative" | "content";
}

export interface Interaction {
  id: number;
  userId: number;
  dishId: number;
  moodKey: MoodKey | null;
  action: InteractionAction;
  rating: number | null;
  createdAt: string;
}

export interface TasteSummary {
  totalInteractions: number;
  topCategories: { category: string; count: number }[];
  favouriteDishes: {
    dishId: number;
    nameEs: string;
    category: string;
    times: number;
  }[];
  moodDistribution: { moodKey: string; count: number }[];
}

export interface AiStats {
  version: string;
  trainedAt: string | null;
  trainingMs: number;
  dishes: number;
  vocabulary: number;
  observations: number;
  collaborativeUsers: number;
  collaborativeItems: number;
  moodModel: {
    observations: number;
    perMood: Record<
      string,
      { confidence: number; target: DishAxes; importance: DishAxes }
    >;
  };
}

export interface RecommendationRequest {
  moodKey: MoodKey;
  userId?: number;
  limit?: number;
  freeText?: string;
  excludeDishIds?: number[];
  maxPrepMinutes?: number;
  diet?: Diet;
  conditions?: HealthCondition[];
}

export interface BalanceRequest {
  userId: number;
  moodKey?: MoodKey;
  justChosenDishId?: number | null;
  servingsEaten?: number;
  conditions?: HealthCondition[];
}

export interface HealthProfileInput {
  diabetes: boolean;
  hypertension: boolean;
  celiac: boolean;
  lactoseIntolerance: boolean;
  highCholesterol: boolean;
  answered: boolean;
}

/* ------------------------------------------------------------------ *
 * Allergens, safety and the cooking assistant
 * ------------------------------------------------------------------ */

export interface AllergenInfo {
  key: string;
  label: string;
}

export interface RecipeAllergens {
  slug: string;
  nameEs: string;
  allergens: string[];
  containsGluten: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
}

export interface SafetyNote {
  id: string;
  text: string;
  stepIndex?: number;
}

export interface RecipeSafety {
  slug: string;
  nameEs: string;
  notes: SafetyNote[];
  general: string;
  allergens: string[];
}

export interface VerifiedSubstitution {
  original: string;
  replacement: string;
  quantity: string;
  note: string;
}

export interface SubstitutionOption extends VerifiedSubstitution {
  safe: boolean;
}

export interface SubstitutionResponse {
  ingredient: string;
  options: SubstitutionOption[];
  allergens: string[];
  note: string;
}

export interface ScaledIngredient extends DishIngredient {
  originalQuantity: string;
  approximate: boolean;
}

export interface AdaptationRequest {
  servings?: number;
  diet?: Diet;
  excludeIngredients?: string[];
}

export interface AdaptationResponse {
  slug: string;
  nameEs: string;
  servings: number;
  ingredients: ScaledIngredient[];
  steps: string[];
  substitutions: VerifiedSubstitution[];
  notes: string[];
  warnings: string[];
}

export interface AssistantTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantAnswer {
  answer: string;
  source: "local-model" | "llm" | "llm-fallback";
  safetyNotes: string[];
  stepContext: {
    index: number;
    title: string;
    instruction: string;
  } | null;
  uncertain: boolean;
}

