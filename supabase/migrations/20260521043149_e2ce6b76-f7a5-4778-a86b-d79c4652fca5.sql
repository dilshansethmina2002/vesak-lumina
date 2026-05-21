
-- Posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id TEXT NOT NULL,
  caption TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX idx_posts_like_count ON public.posts (like_count DESC);
CREATE INDEX idx_posts_guest_id ON public.posts (guest_id);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_all" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "posts_update_like_count" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);

-- Likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  guest_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, guest_id)
);
CREATE INDEX idx_likes_post_id ON public.likes (post_id);
CREATE INDEX idx_likes_guest_id ON public.likes (guest_id);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_all" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_all" ON public.likes FOR INSERT WITH CHECK (true);
CREATE POLICY "likes_delete_all" ON public.likes FOR DELETE USING (true);

-- Triggers to maintain like_count
CREATE OR REPLACE FUNCTION public.increment_like_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_like_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_likes_inc AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.increment_like_count();
CREATE TRIGGER trg_likes_dec AFTER DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.decrement_like_count();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('vesak-photos', 'vesak-photos', true);

CREATE POLICY "vesak_photos_select" ON storage.objects FOR SELECT USING (bucket_id = 'vesak-photos');
CREATE POLICY "vesak_photos_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vesak-photos');
