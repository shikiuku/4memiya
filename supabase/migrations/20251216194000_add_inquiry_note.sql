-- Insert default value for inquiry note
insert into site_settings (key, value, description)
values (
    'inquiry_note', 
    '※ 通常24時間以内にご返信いたします。' || chr(10) || '※ 買取査定に関するお問い合わせは「買取査定」ページからも可能です。', 
    'お問い合わせページ下部の注釈テキスト'
)
on conflict (key) do nothing;
