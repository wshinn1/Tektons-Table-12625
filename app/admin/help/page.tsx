import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function AdminHelpPage() {
  const supabase = await createClient();
  
  const { data: articles } = await supabase
    .from('help_articles')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: categories } = await supabase
    .from('help_categories')
    .select('*')
    .order('order_index');

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Help Center Management</h1>
          <p className="text-muted-foreground">Manage articles and categories</p>
        </div>
        <Button asChild>
          <Link href="/admin/help/new">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{articles?.length || 0}</CardTitle>
            <CardDescription>Total Articles</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{articles?.filter(a => a.is_published).length || 0}</CardTitle>
            <CardDescription>Published</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{categories?.length || 0}</CardTitle>
            <CardDescription>Categories</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles?.map(article => (
              <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{article.title.en}</h3>
                  <p className="text-sm text-muted-foreground">
                    {article.category} • {article.view_count} views • 
                    {article.is_published ? ' Published' : ' Draft'}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/help/${article.id}/edit`}>Edit</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
