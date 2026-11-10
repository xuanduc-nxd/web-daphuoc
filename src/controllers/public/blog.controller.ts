import { InputError, RateLimitError, StorageError } from '../../core/config.ts';
import { type Form, value } from '../../core/http.ts';
import { type PublicPageModel, type RouteResult } from '../../models/types.ts';
import { posts } from '../../models/post.model.ts';
import { blogFormToken, submitPublicBlog } from '../../services/public-blog.ts';

export async function handleBlogSubmission(
  form: Form,
  remoteAddress: string,
  data: PublicPageModel,
): Promise<{ redirectResult?: RouteResult; formStatus: number }> {
  data.blogValues = {
    author: value(form, 'author'),
    category: value(form, 'category'),
    title: value(form, 'title'),
    content: value(form, 'content'),
  };

  try {
    await submitPublicBlog(form, remoteAddress);
    return { redirectResult: { location: 'Blog.php?submitted=1#chia-se' }, formStatus: 200 };
  } catch (error) {
    if (!(error instanceof InputError || error instanceof StorageError)) throw error;
    data.blogError = error.message;
    const formStatus = error instanceof RateLimitError ? 429 : error instanceof StorageError ? 503 : 400;
    return { formStatus };
  }
}

export async function loadBlogPageData(url: URL, data: PublicPageModel): Promise<void> {
  data.blogSubmitted = url.searchParams.get('submitted') === '1';
  data.blogForm = blogFormToken();
  data.rows = await posts('blog', true);
}
