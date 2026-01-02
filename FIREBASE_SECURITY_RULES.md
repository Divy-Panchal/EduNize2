# Firebase Security Rules

## 🔥 Firestore Database Rules

Apply these rules in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User profile data - only owner can read/write
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // User-specific data (grades, tasks, subjects, etc.)
    match /userData/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
    
    // User grades
    match /grades/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // User tasks
    match /tasks/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
    
    // User subjects
    match /subjects/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
    
    // User timetable
    match /timetable/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
    
    // User pomodoro data
    match /pomodoro/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
    
    // User daily stats
    match /dailyStats/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
    
    // Deny all other access by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click **Publish**

---

## 📦 Firebase Storage Rules

Apply these rules in the Firebase Console:

1. Navigate to **Storage** → **Rules** tab
2. Replace the existing rules with the following:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the file
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function to validate image file
    function isValidImage() {
      return request.resource.size < 5 * 1024 * 1024  // Max 5MB
          && request.resource.contentType.matches('image/.*');
    }
    
    // User profile images - only owner can upload/delete, anyone authenticated can read
    match /users/{userId}/profile/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) && isValidImage();
      allow delete: if isOwner(userId);
    }
    
    // User uploaded files (assignments, notes, etc.)
    match /users/{userId}/files/{allPaths=**} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) 
                   && request.resource.size < 10 * 1024 * 1024;  // Max 10MB
      allow delete: if isOwner(userId);
    }
    
    // Deny all other access by default
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

---

## 🔐 Firebase Authentication Settings

### Email/Password Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Configure the following settings:

#### Email Enumeration Protection
- Navigate to **Settings** → **Advanced**
- Enable **Email enumeration protection** to prevent attackers from discovering valid email addresses

#### Password Policy
- Set minimum password length: **8 characters**
- Consider enabling password policy enforcement in Firebase Console

### Additional Security Settings

1. **Authorized Domains**
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Remove any unnecessary domains
   - Only keep your production domain and localhost (for development)

2. **API Key Restrictions** (Important!)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** → **Credentials**
   - Find your Firebase API key
   - Click **Edit**
   - Under **Application restrictions**, select **HTTP referrers**
   - Add your production domain(s):
     - `https://yourdomain.com/*`
     - `http://localhost:*` (for development only)
   - Under **API restrictions**, select **Restrict key**
   - Enable only the following APIs:
     - Firebase Authentication API
     - Cloud Firestore API
     - Firebase Storage API
   - Click **Save**

---

## ⚙️ Additional Firebase Configuration

### 1. Enable App Check (Recommended)

App Check helps protect your backend resources from abuse.

1. Go to **App Check** in Firebase Console
2. Click **Get started**
3. Register your web app
4. Choose reCAPTCHA v3 as the provider
5. Add your site key to `.env`:
   ```env
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```

### 2. Set Up Firebase Security Monitoring

1. Go to **Authentication** → **Settings** → **Monitoring**
2. Enable **Suspicious activity detection**
3. Configure email alerts for:
   - Unusual sign-in activity
   - Multiple failed login attempts
   - Account deletion requests

---

## 🧪 Testing Your Security Rules

### Test Firestore Rules

```javascript
// In Firebase Console → Firestore → Rules → Rules Playground

// Test 1: Authenticated user can read their own data
// Set auth.uid to a test user ID
// Try to read: /users/{testUserId}
// Expected: ALLOW

// Test 2: Authenticated user cannot read other user's data
// Set auth.uid to a test user ID
// Try to read: /users/{differentUserId}
// Expected: DENY

// Test 3: Unauthenticated user cannot read any data
// Clear auth
// Try to read: /users/{anyUserId}
// Expected: DENY
```

### Test Storage Rules

```javascript
// In Firebase Console → Storage → Rules → Rules Playground

// Test 1: User can upload their own profile image
// Set auth.uid to a test user ID
// Try to write: /users/{testUserId}/profile/avatar.jpg
// With contentType: image/jpeg, size: 1MB
// Expected: ALLOW

// Test 2: User cannot upload files over 5MB
// Set auth.uid to a test user ID
// Try to write: /users/{testUserId}/profile/avatar.jpg
// With contentType: image/jpeg, size: 6MB
// Expected: DENY
```

---

## 📝 Security Rules Checklist

- [ ] Applied Firestore security rules
- [ ] Applied Storage security rules
- [ ] Enabled email enumeration protection
- [ ] Configured authorized domains
- [ ] Restricted Firebase API key
- [ ] Tested security rules in Firebase Console
- [ ] Enabled App Check (optional but recommended)
- [ ] Set up security monitoring and alerts

---

## 🚨 Important Notes

> [!WARNING]
> **Never use these rules in development:**
> ```javascript
> allow read, write: if true;  // ❌ DANGEROUS - Allows anyone to access data
> ```

> [!IMPORTANT]
> After applying these rules, test your application thoroughly to ensure:
> - Users can only access their own data
> - Authentication is working correctly
> - File uploads respect size and type restrictions

> [!TIP]
> Monitor your Firebase Console regularly for:
> - Unusual authentication patterns
> - Failed security rule evaluations
> - Storage usage spikes
> - Database read/write patterns

---

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules Guide](https://firebase.google.com/docs/storage/security)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
