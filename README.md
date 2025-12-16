# Modern Personal Portfolio Website

> Personalized for **Suganth Anaadhi** (owner email: **suganthanaadhi@gmail.com**). Update domain + social links before production deployment.

A stunning, fully responsive personal portfolio website built with **Next.js 14**, **Tailwind CSS**, and **Framer Motion**. Features dark theme with neon accent colors, smooth animations, and modern design patterns.

## 🌟 Features

- **TypeScript**: Fully typed for better development experience
- **SEO Friendly**: Optimized meta tags and semantic HTML structure

## 🚀 Sections

### 1. Hero Section
- Fullscreen layout with animated typing effect
- Gradient background with floating particles
- Smooth scroll navigation to other sections

### 2. About Me
- Two-column responsive layout
- Animated skill tags with hover effects
- Glassmorphism CV download button

### 3. Skills
- Interactive skill cards with progress bars
- Hover animations and visual feedback

### 4. Projects
- Responsive project grid
- Project cards with tech stack badges
- GitHub and live demo links
- Hover overlays with details

### 5. Experience & Education
- Animated vertical timeline
- Scroll-triggered animations
- Professional history with descriptions

### 6. Contact
- Functional contact form (EmailJS ready)
- Social media links with hover effects
- Responsive design with form validation
- **Framework**: Next.js 14
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Typography**: Google Fonts (Poppins & Inter)
- **Language**: TypeScript
- **Email Service**: EmailJS (setup required)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎨 Customization

### Personal Information
1. Update personal details in each component:
   - `src/components/Hero.tsx` - Name and titles
   - `src/components/About.tsx` - Bio and skills
   - `src/components/Experience.tsx` - Work history
   - `src/components/Contact.tsx` - Contact information
   - `src/data/contact.ts` - Centralized email/socials (currently using: `suganthanaadhi@gmail.com`)

### Styling
- Colors can be customized in `tailwind.config.ts`
- Fonts can be changed in `src/app/globals.css`
- Animations can be modified in individual component files

### Projects
- Add your projects in `src/components/Projects.tsx`
- Replace placeholder images with actual project screenshots
- Update GitHub and live demo links

## 📧 EmailJS Setup

To enable the contact form:

1. Create an account at [EmailJS](https://www.emailjs.com/)
2. Create an email service and template
3. Get your public key, service ID, and template ID
4. Update the contact form in `src/components/Contact.tsx`

```typescript
// Replace with your EmailJS configuration
const templateParams = {
  from_name: formData.name,
  from_email: formData.email,
  message: formData.message,
}

emailjs.send(
  'YOUR_SERVICE_ID',
  'YOUR_TEMPLATE_ID',
  templateParams,
  'YOUR_PUBLIC_KEY'
)
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy with one click

### Other Platforms
```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/
│   ├── About.tsx            # About section
│   ├── Contact.tsx          # Contact form
│   ├── Experience.tsx       # Timeline
│   ├── Hero.tsx             # Hero section
│   ├── Navigation.tsx       # Header navigation
│   ├── Projects.tsx         # Projects grid
│   └── Skills.tsx           # Skills cards
└── ...
```

## 🎯 Performance Features

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components load as needed
- **Optimized Animations**: Framer Motion with reduced motion support
- **SEO Optimized**: Meta tags and semantic HTML

## 📱 Mobile Features

- Touch-friendly navigation
- Optimized animations for mobile devices
- Responsive images and typography
- Smooth scrolling on all devices

## 🛡️ Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help customizing the portfolio, feel free to reach out at **suganthanaadhi@gmail.com**.

---

Built with ❤️ using Next.js, Tailwind CSS, and Framer Motion

---

## 📬 Contact Form Email (EmailJS)

This project now supports sending messages directly to the owner email (`suganthanaadhi@gmail.com`) using **EmailJS**.

### 1. Create EmailJS Account
1. Go to https://www.emailjs.com and sign up.
2. Add an Email Service (e.g. Gmail, Outlook, or custom SMTP).
3. Create an Email Template with variables: `from_name`, `from_email`, `message`, `to_email`.

### 2. Add Environment Variables
Copy `.env.local.example` to `.env.local` and fill values:

```
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxx
NEXT_PUBLIC_EMAILJS_SERVICE_ID=xxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=xxxxx
```

Restart the dev server after adding the file.

### 3. Template Example (EmailJS)
Subject: `New portfolio message from {{from_name}}`
Body:
```
You received a new message from your portfolio site:

Name: {{from_name}}
Email: {{from_email}}
Message:
{{message}}
```

### 4. Test Locally
Fill the form and submit. Check EmailJS dashboard (Activity) if email not received.

### 5. Production Deployment
- Add same env vars in Vercel Project Settings > Environment Variables.
- Redeploy the project.

### 6. Hardening & Anti-Spam (Optional)
- Add a hidden honeypot field.
- Add simple rate-limiting via a serverless function.
- Switch to a server route + Nodemailer/Resend for higher reliability.

---
## 📤 Server-Side Email (SMTP Fallback)

If EmailJS is unavailable, the form now attempts a secure server route first: `POST /api/contact`.

### Environment Variables Needed
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_account@gmail.com
SMTP_PASS=your_app_password_or_smtp_password
CONTACT_TO_EMAIL=suganthanaadhi@gmail.com
CONTACT_FROM_EMAIL=noreply@yourdomain.com
```

Gmail users: create an App Password (2FA required) – do NOT use your normal password.

### How It Works
1. Frontend submits JSON to `/api/contact`.
2. Basic validation + rate limit (5/min/IP) + honeypot spam trap.
3. Sends email via Nodemailer.
4. If it fails OR not configured, falls back to EmailJS (if keys present) -> else simulated success spinner.

### Testing Locally
1. Copy `.env.local.example` → `.env.local` and fill SMTP values.
2. Restart dev server.
3. Submit form with a real email.
4. Check inbox + console (server logs on failure).

### Debug Tips
- If you see `SMTP not configured`, ensure all SMTP_* vars exist.
- If Gmail rejects login: verify App Password and that less secure access isn’t assumed (App Password avoids that).
- Add `console.log(process.env.SMTP_HOST)` inside the API route temporarily to confirm env loading.

### Hardening Ideas
- Persist rate limiting using Redis / Upstash.
- Add CAPTCHA.
- Add HTML body + structured logging.
- Queue emails (e.g., with a job worker) for resilience.

---
## 🔄 Unified Email Delivery & Fallback Chain (Current Implementation)

The contact form now attempts delivery using this order:

1. Server: SMTP (if all SMTP_* vars configured)
2. Server: Resend (if `RESEND_API_KEY` configured and SMTP missing or failed)
3. Client: EmailJS (if public keys exist and server path failed / not configured)
4. Simulation: If none configured, user sees a warning (NO_PROVIDER) and no real email is sent

Endpoint `GET /api/contact/providers` returns a JSON snapshot of which providers are detected:
```json
{
   "ok": true,
   "providers": { "smtp": true, "resend": false, "emailjs": true },
   "any": true
}
```

### Recommended Minimal Setup (Fastest)
Use **Resend** – Only one key required.

```
RESEND_API_KEY=your_resend_key
CONTACT_TO_EMAIL=suganthanaadhi@gmail.com
```

Restart dev server. Done. (SMTP optional; EmailJS optional.)

### Full Example `.env.local`
```
# Primary server transports
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_account@gmail.com
SMTP_PASS=your_app_password
CONTACT_TO_EMAIL=suganthanaadhi@gmail.com
CONTACT_FROM_EMAIL=portfolio@yourdomain.com

# Resend fallback
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Client EmailJS (tertiary fallback)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxx
NEXT_PUBLIC_EMAILJS_SERVICE_ID=xxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=xxxx

# Extra
CONTACT_DEBUG=true
```

### Inbox Subject Format
Now includes sender email for easier scanning:
```
Portfolio Contact: Jane Doe <jane@example.com>
```

### Failure Scenarios & Responses
| Scenario | API Response Code | JSON `code` | UI Behavior |
|----------|------------------|-------------|-------------|
| Validation error | 400 | (none) | Field errors shown, no fallback |
| No providers configured | 500 | NO_PROVIDER | Yellow guidance panel |
| SMTP failure, Resend success | 200 | (provider: resend) | Success (fallback noted internally) |
| SMTP & Resend fail, EmailJS present | 200 (client) | emailjs | Success via client |
| All fail | 502 | SMTP_ERROR / DELIVERY_FAIL | Error banner |

### Production Notes
- Prefer a dedicated domain + DKIM/SPF for highest deliverability (Resend or custom SMTP domain).
- Monitor bounce / complaint metrics via provider dashboard.
- Consider logging message IDs (not currently persisted) for audit.

### Security Considerations
- Public EmailJS keys are exposed client-side (acceptable for that service design).
- Server route strips & validates inputs, rate-limits, and escapes HTML.
- For stronger protection add: CAPTCHA, persistent rate limit store, message queue.

---