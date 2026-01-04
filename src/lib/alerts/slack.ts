
'use server';

import 'server-only';

export async function sendSlackAlert(
  webhookUrl: string,
  message: string
): Promise<void> {
  if (!webhookUrl) {
    console.warn('Slack alert attempted but no webhook URL was provided.');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      console.error(`Failed to send Slack alert. Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
}

    