// app/recipes/page.js
import RecipeBook from './RecipeBook';

export const metadata = {
  title: 'AI Agent Recipe Book | Armstrong AI',
  description: 'Ready-to-use code recipes for testing AI Copilot agents on Armstrong AI platform'
};

export default function RecipesPage() {
  return <RecipeBook />;
}