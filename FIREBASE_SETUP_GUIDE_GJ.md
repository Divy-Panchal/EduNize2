# Firebase Console Setup Guide (Gujarati)

## 🔥 Firebase Console માં Authentication Enable કરવાની સ્ટેપ્સ

### પહેલું: Email/Password Authentication Enable કરો

1. **Firebase Console ખોલો**
   - Browser માં જાઓ: https://console.firebase.google.com
   - તમારા Google account થી login કરો

2. **તમારો Project Select કરો**
   - EduNize project પર click કરો

3. **Authentication Section માં જાઓ**
   - Left sidebar માં **Authentication** પર click કરો
   - ઉપર **Sign-in method** tab પર click કરો

4. **Email/Password Enable કરો**
   - **Email/Password** પર click કરો
   - **Enable** toggle switch ચાલુ કરો
   - **Save** button પર click કરો

### બીજું: Google Sign-In Enable કરો (Optional)

1. **Same Sign-in method tab માં**
   - **Google** provider પર click કરો
   - **Enable** toggle switch ચાલુ કરો
   - Support email select કરો
   - **Save** button પર click કરો

### ત્રીજું: Localhost Authorize કરો

1. **Settings Tab માં જાઓ**
   - Authentication માં **Settings** tab click કરો
   - નીચે scroll કરીને **Authorized domains** શોધો

2. **Localhost Add કરો**
   - જો `localhost` list માં નથી, તો **Add domain** click કરો
   - Type કરો: `localhost`
   - **Add** click કરો

### ચોથું: Environment Variables Verify કરો

1. **Project Settings ખોલો**
   - Top-left corner માં gear icon (⚙️) click કરો
   - **Project settings** select કરો

2. **Firebase Config Copy કરો**
   - નીચે scroll કરીને **Your apps** section શોધો
   - Web app icon (`</>`) પર click કરો
   - Config values copy કરો:
     - `apiKey`
     - `authDomain`
     - `projectId`
     - `storageBucket`
     - `messagingSenderId`
     - `appId`

3. **`.env` File Update કરો**
   - VS Code માં `.env` file ખોલો
   - Firebase Console માંથી copy કરેલા values paste કરો
   - File save કરો

4. **Dev Server Restart કરો**
   - Terminal માં `Ctrl+C` press કરો
   - ફરીથી run કરો: `npm run dev`

## ✅ Verification

Authentication કામ કરે છે કે નહીં તે check કરવા:

1. Browser માં જાઓ: http://localhost:5173/
2. Sign up કરવાનો પ્રયાસ કરો
3. જો error આવે તો browser console (F12) check કરો

## 🐛 Common Errors અને Solutions

| Error Message | Solution |
|--------------|----------|
| "Email/Password authentication is not enabled" | Firebase Console માં Email/Password enable કરો |
| "This domain is not authorized" | Authorized domains માં `localhost` add કરો |
| "Invalid API key" | `.env` file માં correct API key check કરો |
| App crash થાય છે | Browser console (F12) માં errors check કરો |

## 📞 Help Needed?

જો કોઈ પણ સ્ટેપ સમજાતું ન હોય, તો મને જણાવો!
