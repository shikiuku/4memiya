'use server';

import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Setup VAPID keys
// Note: These should be in process.env
const vapidDetails = {
    subject: 'mailto:admin@4memiya.com',
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

try {
    if (vapidDetails.publicKey && vapidDetails.privateKey) {
        webpush.setVapidDetails(
            vapidDetails.subject,
            vapidDetails.publicKey,
            vapidDetails.privateKey
        );
    }
} catch (error) {
    console.error('Failed to set VAPID details:', error);
}

export async function subscribeToPush(subscription: any) {
    if (!subscription || !subscription.endpoint) {
        return { error: 'Invalid subscription' };
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('push_subscriptions').upsert({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'endpoint'
    });

    if (error) {
        console.error('Subscription error:', error);
        return { error: error.message };
    }

    return { success: true };
}

export async function sendPushNotification(payload: { title: string; body: string; url?: string }) {
    if (!process.env.VAPID_PRIVATE_KEY) {
        console.warn('VAPID keys not configured, skipping notification');
        return { success: false, error: 'VAPID keys missing' };
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all subscriptions
    const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*');

    if (error || !subscriptions) {
        console.error('Fetch subscriptions error:', error);
        return { success: false };
    }

    console.log(`Sending notifications to ${subscriptions.length} subscribers...`);

    const notifications = subscriptions.map(async (sub) => {
        try {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        } catch (error: any) {
            if (error.statusCode === 410 || error.statusCode === 404) {
                // Subscription is no longer valid, delete it
                console.log(`Deleting invalid subscription: ${sub.id}`);
                await supabase.from('push_subscriptions').delete().eq('id', sub.id);
            } else {
                console.error('Push error:', error);
            }
        }
    });

    await Promise.allSettled(notifications);

    // Save to history (App Notifications)
    try {
        const { error: historyError } = await supabase.from('app_notifications').insert({
            title: payload.title,
            body: payload.body,
            url: payload.url
        });
        if (historyError) {
            console.error('Failed to save notification history:', historyError);
        }
    } catch (e) {
        console.error('Error saving notification history:', e);
    }

    return { success: true };
}

export async function getRecentNotifications(limit = 10) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
        .from('app_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data;
}
