
'use server';

import 'server-only';

export type SlackMessageBlock = {
    type: string;
    text?: {
        type: string;
        text: string;
    };
    elements?: any[];
};

export type SlackMessage = {
    text: string; // Fallback text for notifications
    blocks?: SlackMessageBlock[];
};

export async function sendSlackAlert(
  webhookUrl: string,
  message: string | SlackMessage
): Promise<void> {
  if (!webhookUrl) {
    console.warn('Slack alert attempted but no webhook URL was provided.');
    return;
  }

  const payload = typeof message === 'string' ? { text: message } : message;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Failed to send Slack alert. Status: ${response.status} ${response.statusText}`, errorBody);
    }
  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
}

    