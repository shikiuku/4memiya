-- Insert default value for terms content
insert into site_settings (key, value, description)
values (
    'terms_content', 
    '第1条（目的）' || chr(10) || '本規約は、当サービス「4memiya」の利用条件を定めるものです。' || chr(10) || chr(10) || '第2条（適用）' || chr(10) || '本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。', 
    '利用規約の本文'
)
on conflict (key) do nothing;
