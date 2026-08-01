import RenderPage, { renderPageMetadata } from './render-page';

// Content is served from cache and refreshed on a short interval; admin saves
// call revalidatePath() for an immediate update.
export const revalidate = 60;

export const generateMetadata = () => renderPageMetadata('home');

export default function HomePage() {
  return <RenderPage slug="home" />;
}
