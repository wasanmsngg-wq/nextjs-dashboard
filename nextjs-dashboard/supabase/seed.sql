-- Synthetic local-development data only. Never add real customer or administrator data.
insert into public.customers (id, name, email, image_url)
values
  ('10000000-0000-4000-8000-000000000001', 'Ari Sample', 'ari@example.test', ''),
  ('10000000-0000-4000-8000-000000000002', 'Mali Example', 'mali@example.test', '')
on conflict (id) do update
set name = excluded.name,
    email = excluded.email,
    image_url = excluded.image_url;

insert into public.revenue (month, revenue)
values ('Jan', 1200), ('Feb', 1450)
on conflict (month) do update set revenue = excluded.revenue;
