-- Sample data for MyABAJobs Blog

-- Ensure you have run `CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;` first.

-- 1. Insert Sample Categories
INSERT INTO public.blog_categories (name, slug) VALUES
('ABA Fundamentals', 'aba-fundamentals'),
('Career Advice', 'career-advice')
ON CONFLICT (slug) DO NOTHING; -- Avoid errors if they already exist

-- 2. Insert Sample Tags
INSERT INTO public.blog_tags (name, slug) VALUES
('BCBA', 'bcba'),
('RBT', 'rbt'),
('Job Search', 'job-search'),
('Ethics', 'ethics')
ON CONFLICT (slug) DO NOTHING; -- Avoid errors if they already exist

-- 3. Insert Sample Blog Post
-- NOTE: You might need to adjust author_profile_id and featured_image_url below.
--       - author_profile_id: Replace NULL with a valid UUID from your public.profiles table if desired.
--       - featured_image_url: Replace 'public/sample-image.jpg' with a real path to an image
--                             you have uploaded to the 'blog_images' storage bucket, or set to NULL.

DO $$
DECLARE
  category_uuid uuid;
  tag1_uuid uuid;
  tag2_uuid uuid;
  post_uuid uuid;
  author_uuid uuid := NULL; -- Set to NULL initially, replace if needed: 'YOUR_USER_ID_UUID'::uuid;
  image_path text := NULL; -- Set to NULL initially, replace if needed: 'public/your-uploaded-image.jpg';
BEGIN
  -- Get IDs (adjust names if you used different ones)
  SELECT id INTO category_uuid FROM public.blog_categories WHERE slug = 'career-advice';
  SELECT id INTO tag1_uuid FROM public.blog_tags WHERE slug = 'job-search';
  SELECT id INTO tag2_uuid FROM public.blog_tags WHERE slug = 'bcba';

  -- Insert the post only if category was found
  IF category_uuid IS NOT NULL THEN
      INSERT INTO public.blog_posts
        (title, slug, content, excerpt, featured_image_url, author_profile_id, category_id, status, published_at)
      VALUES
        ('5 Tips for Your BCBA Job Search',
         '5-tips-bcba-job-search',
         '<p>Finding the right BCBA position requires careful planning. Here are five tips:</p><ol><li>Update your resume.</li><li>Network effectively.</li><li>Prepare for interviews.</li><li>Research potential employers.</li><li>Negotiate your offer.</li></ol><p>Good luck!</p>',
         'Looking for a BCBA role? Check out these 5 essential tips to help you land your ideal job in the ABA field.',
         image_path, -- Use variable
         author_uuid, -- Use variable
         category_uuid,
         'published',
         now() - interval '1 day' -- Publish date yesterday
        )
      ON CONFLICT (slug) DO NOTHING -- Avoid error if post already exists
      RETURNING id INTO post_uuid; -- Get the ID of the newly inserted post

      -- Link tags to the post (only if post and tags were found)
      IF post_uuid IS NOT NULL THEN
          IF tag1_uuid IS NOT NULL THEN
            INSERT INTO public.blog_post_tags (post_id, tag_id) VALUES (post_uuid, tag1_uuid) ON CONFLICT DO NOTHING;
          END IF;
          IF tag2_uuid IS NOT NULL THEN
            INSERT INTO public.blog_post_tags (post_id, tag_id) VALUES (post_uuid, tag2_uuid) ON CONFLICT DO NOTHING;
          END IF;
      END IF;
  ELSE
      RAISE NOTICE 'Category "career-advice" not found, skipping post insertion.';
  END IF;

END $$;

-- 4. (Optional) Insert a second post (draft)
DO $$
DECLARE
  category_uuid uuid;
BEGIN
  SELECT id INTO category_uuid FROM public.blog_categories WHERE slug = 'aba-fundamentals';

  IF category_uuid IS NOT NULL THEN
      INSERT INTO public.blog_posts
        (title, slug, content, excerpt, category_id, status)
      VALUES
        ('Understanding Ethics in ABA',
         'understanding-ethics-aba',
         '<p>Ethical considerations are paramount in ABA practice...</p>',
         'A brief overview of key ethical guidelines for ABA professionals.',
         category_uuid, -- Link to category
         'draft' -- Keep as draft
        )
      ON CONFLICT (slug) DO NOTHING;
  ELSE
      RAISE NOTICE 'Category "aba-fundamentals" not found, skipping draft post insertion.';
  END IF;
END $$;