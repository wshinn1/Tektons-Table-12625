import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const article_id = formData.get('article_id') as string;
  const was_helpful = formData.get('was_helpful') === 'true';
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Insert feedback
  await supabase
    .from('help_article_feedback')
    .insert({
      article_id,
      user_id: user.id,
      was_helpful,
    });

  // Update article counts
  const field = was_helpful ? 'helpful_count' : 'not_helpful_count';
  const { data: article } = await supabase
    .from('help_articles')
    .select(field)
    .eq('id', article_id)
    .single();

  if (article) {
    await supabase
      .from('help_articles')
      .update({ [field]: article[field] + 1 })
      .eq('id', article_id);
  }

  return NextResponse.redirect(new URL(request.url).origin + '/help');
}
