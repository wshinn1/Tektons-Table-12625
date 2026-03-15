import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.POSTGRES_URL });
await client.connect();

const result = await client.query(`
  SELECT id, title, slug, is_published, is_homepage, editor_type, created_at 
  FROM pages 
  ORDER BY created_at DESC 
  LIMIT 20
`);

console.log("Platform pages:", JSON.stringify(result.rows, null, 2));

const menuResult = await client.query(`
  SELECT id, label, url, display_order, is_visible 
  FROM menu_items 
  WHERE url LIKE '/p/%'
  ORDER BY display_order
`);

console.log("Menu items linking to custom pages:", JSON.stringify(menuResult.rows, null, 2));

await client.end();
