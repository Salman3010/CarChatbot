const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();
const app = express();
const port = 5000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;
  console.log('📨 הודעה מהמשתמש:', userMessage);

  const lowerMessage = userMessage.toLowerCase();

  const predefinedReplies = [
    {
      keywords: ['גלגל', 'פנצ\'ר', 'צמיג', 'רזרבי', 'החלפת'],
      reply: `
<h3>🛞 איך מחליפים גלגל ברכב</h3>
<strong>שלב 1: הכנות</strong><br/>
עצור במקום בטוח, הפעל בלם יד והכן את הכלים.<br/>
📺 <a href="https://www.youtube.com/watch?v=GiqEO0FC83k" target="_blank">הכנות להחלפת גלגל</a><br/><br/>

<strong>שלב 2: הרמת הרכב</strong><br/>
מקם את הג'ק והרם את הרכב.<br/>
📺 <a href="https://www.youtube.com/watch?v=wKYcaIaQ0Ro" target="_blank">איך להשתמש בג'ק</a><br/><br/>

<strong>שלב 3: פירוק הגלגל</strong><br/>
שחרר את הברגים והסר את הגלגל.<br/>
📺 <a href="https://www.youtube.com/watch?v=GBOev0Iz8oU" target="_blank">פירוק גלגל</a><br/><br/>

<strong>שלב 4: התקנת החדש</strong><br/>
מקם את הגלגל החדש והדק את הברגים.<br/>
📺 <a href="https://www.youtube.com/watch?v=3eEdXAnflro" target="_blank">התקנת גלגל חדש</a><br/><br/>

<strong>שלב 5: סיום ובדיקה</strong><br/>
הורד את הרכב ובדוק יציבות.<br/>
📺 <a href="https://www.youtube.com/watch?v=ODJpz-AT_P8" target="_blank">בדיקה וסיום</a><br/><br/>

🎥 <em>בונוס:</em> <a href="https://www.youtube.com/watch?v=IEKoPROlvEU" target="_blank">ניסיון ראשון בהחלפת גלגל</a>
      `
    },
    {
      keywords: ['שמן', 'מנוע'],
      reply: `
<h3>🛢️ איך לבדוק ולהוסיף שמן מנוע</h3>
<strong>שלב 1: כיבוי הרכב</strong><br/>
וודא שהרכב כבוי וקר.<br/><br/>

<strong>שלב 2: פתיחת מכסה מנוע</strong><br/>
מצא את מד השמן.<br/><br/>

<strong>שלב 3: בדיקה</strong><br/>
שלוף את המד, נגב, החזר ושלוף שוב לבדיקה.<br/><br/>

<strong>שלב 4: הוספה</strong><br/>
אם חסר שמן — פתח את מכסה השמן והוסף לפי הצורך.<br/><br/>

📺 <a href="https://www.youtube.com/watch?v=Sd8FM_tEI6I" target="_blank">איך לבדוק ולהוסיף שמן מנוע</a><br/>
📺 <a href="https://www.youtube.com/watch?v=wqq4MK3HtpM" target="_blank">בדיקת שמן והוספה נכונה</a><br/>
📺 <a href="https://www.youtube.com/watch?v=gJXX1SA9Prc" target="_blank">מדריך קצר ממוסך</a>
      `
    },
    {
      keywords: ['רדיאטור', 'מים', 'קירור'],
      reply: `
<h3>💧 איך לבדוק ולהוסיף מים לרדיאטור</h3>
<strong>שלב 1: כיבוי הרכב</strong><br/>
וודא שהרכב כבוי וקר לגמרי.<br/><br/>

<strong>שלב 2: פתיחת מכסה רדיאטור</strong><br/>
פתח בזהירות ובדוק את גובה המים.<br/><br/>

<strong>שלב 3: הוספה</strong><br/>
אם חסר — הוסף מים או נוזל קירור מתאים.<br/><br/>

📺 <a href="https://www.youtube.com/watch?v=8i-kmkMLJq8" target="_blank">איך לבדוק ולהוסיף נוזל קירור</a><br/>
📺 <a href="https://www.youtube.com/watch?v=07ZASlZugI4" target="_blank">הדרכה מקצועית</a><br/>
📺 <a href="https://www.youtube.com/watch?v=FTHUB5SiNos" target="_blank">החלפה מלאה ושטיפה</a>
      `
    }
  ];

  for (const item of predefinedReplies) {
    if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return res.json({ reply: item.reply });
    }
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'אתה מומחה רכב. תענה בעברית מסודרת, עם כותרות שלבים, נקודות, והסברים מקצועיים. כל תשובה חייבת להיות ברורה ומובנית.',
        },
        { role: 'user', content: userMessage },
      ],
    });

    const reply = chatCompletion.choices?.[0]?.message?.content || '🙈 לא התקבלה תשובה תקינה';
    res.json({ reply });
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
    res.status(500).json({ reply: 'שגיאה בשרת. לא התקבלה תשובה.' });
  }
});

app.post('/api/image', upload.single('image'), async (req, res) => {
  const buffer = req.file?.buffer;
  if (!buffer) return res.status(400).json({ reply: 'לא התקבלה תמונה.' });

  const base64 = buffer.toString('base64');
  const imageUrl = `data:image/jpeg;base64,${base64}`;

  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            {
              type: 'text',
              text: 'נתח את התמונה של הרכב. כתוב תשובה בעברית עם שלבים מקצועיים.',
            },
          ],
        },
      ],
    });

    const reply = result.choices?.[0]?.message?.content || '🙈 הבוט לא הגיב לתמונה';
    res.json({ reply });
  } catch (error) {
    console.error('❌ שגיאה בתמונה:', error.message);
    res.status(500).json({ reply: 'שגיאה בניתוח תמונה.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 השרת רץ על http://localhost:${port}`);
});