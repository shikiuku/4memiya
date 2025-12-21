import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: '在庫一覧',
        short_name: '在庫一覧',
        description: 'ゲームアカウント売買プラットフォーム',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/amamiya_icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    };
}
