import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { prompt, question, options, answer, explanation, history = [] } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // Build the system and conversation context
    const bengaliLetters = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    let formattedQuestionContext = '';
    if (question) {
      formattedQuestionContext = `[MCQ প্রশ্ন]: ${question}\n[অপশনসমূহ]:\n${(options || [])
        .map((opt, i) => `(${bengaliLetters[i] || i + 1}) ${opt}`)
        .join('\n')}\n${answer !== undefined ? `[সঠিক উত্তর সূচক]: (${bengaliLetters[answer] || answer + 1}) ${options?.[answer] || ''}\n` : ''}${explanation ? `[ডাটাবেজ নোট]: ${explanation}\n` : ''}`;
    }

    const systemInstruction = `তুমি "TopMCQBD AI শিক্ষক" — বাংলাদেশ সিভিল সার্ভিস (BCS), প্রাইমারি শিক্ষক নিয়োগ, ব্যাংক ও সরকারি চাকরির নিয়োগ পরীক্ষার অভিজ্ঞ ও দক্ষ একজন শিক্ষাবিদ।
তোমার দায়িত্ব শিক্ষার্থীদের প্রশ্নের উত্তর সহজ, আকর্ষণীয়, সাবলীল এবং তথ্যবহুল বাংলায় বুঝিয়ে দেওয়া।

ব্যাখ্যার নিয়মাবলি:
1. শুরুতেই স্পষ্টভাবে সঠিক উত্তরটি উল্লেখ করবে। যেমন: 🎯 **সঠিক উত্তর: (খ) [উত্তরের নাম]**
2. **কেন এটি সঠিক?** — সহজ ভাষায় মূল কারণ ও প্রাসঙ্গিক প্রেক্ষাপট বা নিয়ম তুলে ধরবে।
3. **অন্যান্য অপশন বিশ্লেষণ** — অন্যান্য ভুল অপশনগুলো কেন ভুল বা সেগুলোর সঠিক তথ্য কী তা সংক্ষেপে জানাবে।
4. **💡 মনে রাখার সহজ টেকনিক বা শর্টকাট** — শিক্ষার্থীদের দ্রুত মুখস্থ/মনে রাখার উপায় বা রিলেটেড অতিরিক্ত গুরুত্বপূর্ণ তথ্য পয়েন্ট আকারে দেবে।
5. সবসময় মার্জিত, উৎসাহব্যঞ্জক ও বন্ধুত্বপূর্ণ ভাষায় উত্তর দেবে।`;

    if (geminiApiKey) {
      // Call Gemini API
      try {
        const contents = [];

        // Add history
        history.slice(-6).forEach((item) => {
          contents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          });
        });

        // Add current prompt
        const userPrompt = formattedQuestionContext
          ? `${formattedQuestionContext}\n\n[শিক্ষার্থীর অনুরোধ]: ${prompt || 'দয়া করে এই MCQ টির সঠিক উত্তর নির্ণয় করে প্রতিটি অপশন বিশ্লেষণসহ বিস্তারিত সহজ বাংলায় বুঝিয়ে দিন।'}`
          : prompt;

        contents.push({
          role: 'user',
          parts: [{ text: userPrompt }]
        });

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1200
              }
            })
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return NextResponse.json({ success: true, reply: candidateText });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using smart educational fallback:', geminiErr);
      }
    }

    // Smart Educational Fallback when API key is not configured or fails
    let fallbackReply = '';
    if (question) {
      const correctLetter = bengaliLetters[answer] || 'সঠিক';
      const correctText = options?.[answer] || '';

      fallbackReply = `🎯 **সঠিক উত্তর: (${correctLetter}) ${correctText}**\n\n` +
        `📝 **বিস্তারিত বিশ্লেষণ:**\n` +
        `${explanation ? `• ${explanation}\n` : `• এই প্রশ্নটি বিভিন্ন সরকারি ও প্রতিযোগিতামূলক পরীক্ষার জন্য অত্যন্ত গুরুত্বপূর্ণ। প্রশ্নে উল্লেখিত তথ্যের আলোকে **(${correctLetter}) ${correctText}** হলো শতভাগ নির্ভুল উত্তর।\n`}\n` +
        `🔍 **অপশন পর্যালোচনা:**\n` +
        (options || [])
          .map((opt, i) => {
            const letter = bengaliLetters[i] || i + 1;
            if (i === answer) {
              return `✅ **(${letter}) ${opt}:** এটিই সঠিক উত্তর।`;
            } else {
              return `❌ **(${letter}) ${opt}:** এটি সঠিক নয়।`;
            }
          })
          .join('\n') +
        `\n\n💡 **গুরুত্বপূর্ণ টিপস:**\n` +
        `বিসিএস ও নিয়োগ পরীক্ষায় এই জাতীয় প্রশ্ন বারবার আসে। এই বিষয়ের সাথে সম্পর্কিত অন্যান্য তথ্যাবলি রিভিশন দিয়ে রাখলে পরীক্ষার হলে দ্রুত ও নির্ভুলভাবে উত্তর করা সম্ভব হবে।`;
    } else {
      fallbackReply = `ধন্যবাদ আপনার প্রশ্নের জন্য! এই প্রশ্নটি সম্পর্কিত আরো কোনো বিশেষ ব্যাখ্যা বা শর্টকাট নিয়ম জানতে চাইলে নিচে লিখে পাঠান। আমি আপনাকে সর্বোচ্চ সহায়তা করব।`;
    }

    return NextResponse.json({ success: true, reply: fallbackReply });
  } catch (error) {
    console.error('Ask AI Error:', error);
    return NextResponse.json(
      { success: false, error: 'AI উত্তর তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}
