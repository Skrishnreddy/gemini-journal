import { getSecret } from './secretManager.js';

/**
 * Dispatches a proactive wellness & burnout alert to Slack
 */
export async function sendSlackBurnoutAlert({ userId, userEmail, userName, fatigueScore, triggerReason, recentMoods }) {
  const webhookUrl = await getSecret('SLACK_WEBHOOK_URL');

  const alertPayload = {
    text: `🚨 *Gemini Journal Wellness Ping* for ${userName || userEmail || 'Journaler'}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🌿 Gemini Journal: Proactive Wellness Check",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*User:*\n${userName || userEmail || 'Anonymous Journaler'}`
          },
          {
            type: "mrkdwn",
            text: `*Cognitive Fatigue Index:*\n${fatigueScore}/100 (${fatigueScore > 75 ? '⚠️ High Burnout Risk' : '⚡ Moderate Strain'})`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Trigger Analysis:*\n${triggerReason || 'Elevated stress keywords and fatigue markers detected over recent entries.'}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*Recent Emotional Velocity:* ${recentMoods?.join(' ➔ ') || 'Stressed ➔ Exhausted'}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "💡 *AI Recommendation:* Consider taking a 15-minute screen-free walk, practicing a 4-7-8 breathing sequence, or blocking focus time on your calendar."
        }
      }
    ]
  };

  if (!webhookUrl || webhookUrl.length < 10) {
    console.log('[SlackService] No active Slack webhook configured. Alert logged to console.');
    return {
      success: true,
      delivered: false,
      mode: 'simulated',
      payload: alertPayload,
      message: 'Slack alert simulated successfully (configure SLACK_WEBHOOK_URL in Secret Manager or .env to deliver live).'
    };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertPayload)
    });

    if (!res.ok) {
      throw new Error(`Slack API returned status ${res.status}`);
    }

    return {
      success: true,
      delivered: true,
      mode: 'live',
      message: 'Slack alert dispatched successfully.'
    };
  } catch (err) {
    console.error('[SlackService] Error sending webhook:', err);
    return {
      success: false,
      delivered: false,
      error: err.message
    };
  }
}
