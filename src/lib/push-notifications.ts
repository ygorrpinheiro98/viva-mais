import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';

webpush.setVapidDetails(
  'mailto:contato@viva-mais.com.br',
  vapidPublicKey,
  vapidPrivateKey
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );
    return { success: true };
  } catch (error: unknown) {
    console.error('Push notification error:', error);
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const pushError = error as { statusCode: number; message?: string };
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);
        return { success: false, removed: true };
      }
    }
    
    return { success: false, error };
  }
}

export async function sendToUser(
  userId: string,
  payload: PushPayload
) {
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('enabled', true);

  if (!subscriptions || subscriptions.length === 0) {
    return { success: false, reason: 'no_subscriptions' };
  }

  const results = await Promise.all(
    subscriptions.map((sub) =>
      sendPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload
      )
    )
  );

  const successful = results.filter((r) => r.success).length;
  return { success: true, sent: successful, total: subscriptions.length };
}

export async function broadcastToAll(payload: PushPayload) {
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('enabled', true);

  if (!subscriptions || subscriptions.length === 0) {
    return { success: false, reason: 'no_subscriptions' };
  }

  const results = await Promise.all(
    subscriptions.map((sub) =>
      sendPushNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload
      )
    )
  );

  const successful = results.filter((r) => r.success).length;
  return { success: true, sent: successful, total: subscriptions.length };
}
