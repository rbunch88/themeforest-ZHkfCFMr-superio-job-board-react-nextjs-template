# Blog Functionality Implementation Plan

**Objective:** Implement blog functionality for the MyABAJobs website using Supabase as the backend, replacing the static data structure provided by the Superio template. This involves defining the database schema, setting up backend resources (as external tasks), and refactoring frontend components for dynamic data fetching and display.

## Phase 1: Schema Definition &amp; Backend Setup (External Task)

1.  **Define Supabase Tables:**
    *   **`blog_categories`:**
        *   `id` (uuid, pk)
        *   `name` (text, unique)
        *   `slug` (text, unique) - URL-friendly name
        *   `created_at` (timestamptz, default now())
    *   **`blog_tags`:**
        *   `id` (uuid, pk)
        *   `name` (text, unique)
        *   `slug` (text, unique)
        *   `created_at` (timestamptz, default now())
    *   **`blog_posts`:**
        *   `id` (uuid, pk, default gen_random_uuid())
        *   `title` (text, not null)
        *   `slug` (text, unique, not null) - URL-friendly title
        *   `content` (text, not null) - Main blog content (consider using Markdown or rich text format)
        *   `excerpt` (text, nullable) - Short summary
        *   `featured_image_url` (text, nullable) - Path in Supabase Storage
        *   `author_profile_id` (uuid, nullable, references `public.profiles(id)` ON DELETE SET NULL)
        *   `category_id` (uuid, nullable, references `public.blog_categories(id)` ON DELETE SET NULL)
        *   `status` (text, not null, default 'draft', CHECK(status IN ('draft', 'published', 'archived')))
        *   `published_at` (timestamptz, nullable)
        *   `created_at` (timestamptz, default now())
        *   `updated_at` (timestamptz, default now()) - Use `moddatetime` trigger
    *   **`blog_post_tags`:** (Join Table)
        *   `post_id` (uuid, not null, references `public.blog_posts(id)` ON DELETE CASCADE)
        *   `tag_id` (uuid, not null, references `public.blog_tags(id)` ON DELETE CASCADE)
        *   `created_at` (timestamptz, default now())
        *   PRIMARY KEY (`post_id`, `tag_id`)

2.  **Define Storage Bucket:**
    *   Create a public Supabase Storage bucket named `blog_images`.

3.  **Add SQL to `Cline_docs/externalInstructions.md`:**
    *   Include `CREATE TABLE` statements for the tables defined above.
    *   Include RLS policies:
        *   Public read access for `published` posts, categories, and tags.
        *   Policies for admin roles (to be defined/used later) to manage posts, categories, tags.
    *   Include `CREATE BUCKET` instruction for `blog_images` with public read access and restricted write policies (e.g., only authenticated users or specific roles).
    *   Include trigger setup for `updated_at` on `blog_posts` using the `moddatetime` function.

## Phase 2: Blog List Page Implementation (`/blog-list-v1`)

1.  **Refactor Page Component (`superio/app/(blog)/blog-list-v1/page.jsx`):**
    *   Remove `ssr: false`. Convert to an `async` component for server-side data fetching (SSR or ISR).
    *   Read the `page` query parameter (defaulting to 1). Calculate `start` and `end` range based on page number and desired items per page (e.g., 6).
    *   Fetch published blog posts from Supabase using the calculated range (`supabase.from('blog_posts').select('*, author:profiles(first_name, last_name), category:blog_categories(name, slug)').eq('status', 'published').order('published_at', { ascending: false }).range(start, end)`).
    *   Fetch the total count of published posts (`supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('status', 'published')`).
    *   Calculate `totalPages`.
    *   Pass fetched `posts`, `currentPage`, and `totalPages` as props to the `BlogList` component.

2.  **Refactor Layout Wrapper (`superio/components/blog-meu-pages/blog-list-v1/index.jsx`):**
    *   Accept `posts`, `currentPage`, `totalPages` as props.
    *   Pass `posts` down to the `Blog6` component (or its replacement).
    *   Pass `currentPage` and `totalPages` down to `BlogPagination`.

3.  **Refactor Post Grid Component (`superio/components/blog/Blog6.jsx`):**
    *   Accept `posts` array as a prop.
    *   Remove the import and usage of static `blogContent`.
    *   Map over the `posts` prop.
    *   Update rendering to use dynamic data from each `post` object:
        *   Image source: Use `supabase.storage.from('blog_images').getPublicUrl(post.featured_image_url).data.publicUrl` (handle null images).
        *   Date: Format `post.published_at`.
        *   Title: `post.title`.
        *   Excerpt: `post.excerpt`.
        *   Link: `/blog-details/${post.slug}`.
        *   Category: `post.category.name` (handle null category).
        *   Remove hardcoded comment count.

4.  **Refactor Pagination (`superio/components/blog-meu-pages/blog-sidebar/BlogPagination.jsx`):**
    *   Accept `currentPage` and `totalPages` as props.
    *   Generate pagination links dynamically. Links should point to `/blog-list-v1?page=N`.
    *   Highlight the current page link.

5.  **Refactor Sidebar (`superio/components/blog-meu-pages/blog-sidebar/index.jsx` and its children):**
    *   **Search:** Implement client-side filtering based on post titles/excerpts initially, or add server-side search later.
    *   **Categories:** Fetch all categories from `blog_categories` (`supabase.from('blog_categories').select('name, slug')`). Display as links pointing to `/blog-list-v1?category=slug`. The list page component will need to read the `category` query parameter and filter the Supabase query accordingly.
    *   **Recent Posts:** Fetch the latest 3-5 published posts (`supabase.from('blog_posts').select('title, slug').eq('status', 'published').order('published_at', { ascending: false }).limit(5)`). Display titles linking to `/blog-details/${post.slug}`.
    *   **Tags:** Fetch tags from `blog_tags` (`supabase.from('blog_tags').select('name, slug')`). Display as links pointing to `/blog-list-v1?tag=slug`. The list page component will need to read the `tag` query parameter and filter the Supabase query (requires joining `blog_post_tags`).

## Phase 3: Blog Details Page Implementation (`/blog-details/[slug]`)

1.  **Create Dynamic Route (`superio/app/(blog)/blog-details/[slug]/page.jsx`):**
    *   Ensure this route exists and is an `async` component.
2.  **Implement `generateMetadata`:**
    *   Fetch the post data by `slug` (`supabase.from('blog_posts').select('title, excerpt').eq('slug', params.slug).single()`).
    *   Return dynamic `title` (post title) and `description` (post excerpt).
3.  **Implement Data Fetching in Page Component:**
    *   Get the `slug` from `params`.
    *   Fetch the full blog post data: `supabase.from('blog_posts').select('*, author:profiles(first_name, last_name, avatar_url), category:blog_categories(name, slug), tags:blog_tags(name, slug)').eq('slug', slug).eq('status', 'published').single()`. Handle potential errors (e.g., post not found).
4.  **Create/Refactor Detail Components (within `superio/components/blog-meu-pages/blog-details/` or similar):**
    *   Pass the fetched `post` data down to relevant components.
    *   Display:
        *   Post Title (`post.title`).
        *   Featured Image (using `getPublicUrl`).
        *   Author Name (`post.author.first_name` `post.author.last_name`), Publication Date (format `post.published_at`), Category (`post.category.name`).
        *   Full Post Content (`post.content`). Use `react-markdown` or similar library if content is Markdown. If HTML, use `dangerouslySetInnerHTML` with caution.
        *   Tags (`post.tags.map(...)`).
        *   (Optional) Author Bio section (using `post.author` data).
        *   (Optional) Comments section (requires further schema/implementation).
        *   (Optional) Social Share buttons.

## Mermaid Diagram

```mermaid
graph TD
    subgraph External Setup
        A[User executes SQL in Supabase Dashboard] --> B(Creates blog_posts, blog_categories, blog_tags, blog_post_tags tables);
        A --> C(Creates RLS Policies);
        A --> D(Creates blog_images Storage Bucket);
        A --> E(Adds moddatetime trigger);
    end

    subgraph Blog List Page (`/blog-list-v1`)
        F[page.jsx (SSR/ISR)] -- Fetches Posts & Count --> G[Supabase Query (blog_posts)];
        G -- Returns Data --> F;
        F -- Passes Props --> H(BlogList Layout Component);
        H -- Passes Posts --> I(Blog6 Post Grid);
        H -- Passes Pagination Props --> J(BlogPagination);
        H --> K(BlogSidebar);
        I -- Renders Posts --> L[Post Preview UI];
        L -- Links to --> M[Blog Details Page];
        J -- Renders Links --> N[Pagination UI];
        K -- Fetches Data --> O[Supabase Query (categories, recent posts, tags)];
        O -- Returns Data --> K;
        K --> P[Sidebar Widgets UI];
    end

    subgraph Blog Details Page (`/blog-details/[slug]`)
        Q[page.jsx (SSR/ISR)] -- Fetches Post by Slug --> R[Supabase Query (blog_posts JOIN related tables)];
        R -- Returns Single Post Data --> Q;
        Q -- Generates Metadata --> S[HTML Head];
        Q -- Renders --> T(Blog Detail Components);
        T --> U[Full Post Content UI];
        T --> V[Author, Date, Category, Tags UI];
    end

    subgraph Data Flow
        G --> I;
        O --> K;
        R --> T;
    end

    style G fill:#ccf,stroke:#333,stroke-width:2px
    style O fill:#ccf,stroke:#333,stroke-width:2px
    style R fill:#ccf,stroke:#333,stroke-width:2px