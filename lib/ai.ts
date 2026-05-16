const FALLBACK: Record<string, string> = {
  workout:
    "Great question! For balanced fitness, combine 3 days of strength training with 2 days of cardio. Aim for progressive overload — increase weight or reps each week. Rest days are just as important as training days for muscle recovery.",
  run:
    "Running is excellent for cardiovascular health. Start with a 5-minute warm-up walk, then alternate running and walking intervals. Build up gradually — adding no more than 10% distance per week helps prevent injury.",
  food:
    "Focus on whole foods: lean proteins (chicken, fish, legumes), complex carbs (oats, sweet potato, brown rice), and healthy fats (avocado, nuts, olive oil). Aim for 0.8–1 g of protein per pound of body weight if building muscle.",
  nutrition: "A balanced plate should be roughly 40% carbohydrates, 30% protein, and 30% healthy fats. Meal prepping on Sundays can make weekday eating much easier and more consistent.",
  sleep:
    "Sleep is your ultimate recovery tool. 7–9 hours of quality sleep boosts muscle repair, regulates hunger hormones, and improves workout performance. Try keeping a consistent sleep schedule even on weekends.",
  weight:
    "Sustainable weight change is 0.5–1 lb per week. For loss, a 300–500 calorie deficit through diet and exercise works well. For gain, a modest surplus with high protein intake and progressive resistance training is the proven path.",
  stress:
    "Chronic stress elevates cortisol, which can increase fat storage and slow recovery. Incorporate stress management daily — even 10 minutes of mindfulness, deep breathing, or a walk in nature makes a measurable difference.",
  water:
    "Staying hydrated improves performance, reduces fatigue, and aids digestion. A good baseline is 8 cups (2 litres) per day, adding ~500 ml for every 30 minutes of exercise. Clear or light yellow urine is a reliable indicator of good hydration.",
  cardio:
    "Cardiovascular exercise strengthens your heart, improves endurance, and accelerates calorie burn. A healthy target is 150 minutes of moderate-intensity cardio per week. Mix steady-state cardio with interval sessions for the best results.",
  default:
    "I'm your FitLife AI coach! I can give personalized advice on workouts, nutrition, recovery, sleep, and hydration. What aspect of your fitness journey would you like to work on today?",
};

function fallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, response] of Object.entries(FALLBACK)) {
    if (key !== 'default' && lower.includes(key)) return response;
  }
  return FALLBACK.default;
}

export async function getCoachReply(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    return fallbackResponse(userMessage);
  }

  try {
    const { default: Groq } = await import('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are FitLife Coach, an encouraging and knowledgeable AI fitness and nutrition coach. Give concise, practical, science-backed advice. Keep replies under 120 words.',
      },
      ...history.slice(-6),
      { role: 'user' as const, content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() ?? fallbackResponse(userMessage);
  } catch {
    return fallbackResponse(userMessage);
  }
}
