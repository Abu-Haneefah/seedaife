import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="view is-active" data-view="not-found">
      <section className="placeholder-view">
        <div className="placeholder-card">
          <svg className="placeholder-mark" viewBox="0 0 200 200" aria-hidden="true">
            <use href="#seedai-mark" />
          </svg>
          <p className="eyebrow">404</p>
          <h1>Page not found</h1>
          <p>The page you are looking for does not exist or has been moved.</p>
          <div className="placeholder-actions">
            <Link className="btn btn-lime btn-lg" href="/">
              Back to the landing page
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
