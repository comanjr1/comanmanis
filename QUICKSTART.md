# Quick Start Guide / Panduan Cepat

## English Version

### 1. Prerequisites
- Node.js >= 14.0.0 installed
- An email service provider account (choose one):
  - SendGrid (recommended for beginners)
  - Mailgun
  - AWS SES
  - Or use your own SMTP server

### 2. Installation

```bash
# Clone the repository (if not already done)
git clone https://github.com/comanjr1/comanmanis.git
cd comanmanis

# Install dependencies
npm install

# Install your chosen email provider (choose one)
npm install @sendgrid/mail        # For SendGrid
npm install mailgun.js form-data  # For Mailgun
npm install @aws-sdk/client-ses   # For AWS SES
npm install nodemailer            # For SMTP
```

### 3. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

Configure your chosen provider in `.env`:

**For SendGrid:**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Company Name
```

**For Mailgun:**
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=key-your_api_key_here
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_EMAIL=noreply@yourdomain.com
MAILGUN_FROM_NAME=Your Company Name
```

### 4. DNS Configuration (CRITICAL!)

To ensure emails land in inbox, NOT spam:

1. **SPF Record** - Add to your DNS:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:sendgrid.net ~all
   ```

2. **DKIM** - Get from your email provider and add to DNS

3. **DMARC** - Add to your DNS:
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   ```

See [docs/ANTI_SPAM_CONFIGURATION.md](docs/ANTI_SPAM_CONFIGURATION.md) for detailed instructions.

### 5. Verify Configuration

```bash
npm run verify
```

### 6. Send Test Email

Edit `examples/send-single-email.js` and update the recipient email, then:

```bash
node examples/send-single-email.js
```

### 7. Test Email Quality

1. Send a test email to: https://www.mail-tester.com/
2. Check your spam score (target: 10/10)
3. Fix any issues identified

---

## Versi Bahasa Indonesia

### 1. Prasyarat
- Node.js >= 14.0.0 terinstall
- Akun email service provider (pilih salah satu):
  - SendGrid (direkomendasikan untuk pemula)
  - Mailgun
  - AWS SES
  - Atau gunakan SMTP server sendiri

### 2. Instalasi

```bash
# Clone repository (jika belum)
git clone https://github.com/comanjr1/comanmanis.git
cd comanmanis

# Install dependencies
npm install

# Install provider email pilihan Anda (pilih salah satu)
npm install @sendgrid/mail        # Untuk SendGrid
npm install mailgun.js form-data  # Untuk Mailgun
npm install @aws-sdk/client-ses   # Untuk AWS SES
npm install nodemailer            # Untuk SMTP
```

### 3. Konfigurasi

```bash
# Copy template environment
cp .env.example .env

# Edit .env dengan kredensial Anda
nano .env  # atau gunakan editor favorit Anda
```

Konfigurasi provider pilihan Anda di `.env`:

**Untuk SendGrid:**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.api_key_anda_disini
SENDGRID_FROM_EMAIL=noreply@domain-anda.com
SENDGRID_FROM_NAME=Nama Perusahaan Anda
```

**Untuk Mailgun:**
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=key-api_key_anda_disini
MAILGUN_DOMAIN=mg.domain-anda.com
MAILGUN_FROM_EMAIL=noreply@domain-anda.com
MAILGUN_FROM_NAME=Nama Perusahaan Anda
```

### 4. Konfigurasi DNS (PENTING!)

Untuk memastikan email masuk inbox, BUKAN spam:

1. **SPF Record** - Tambahkan ke DNS Anda:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:sendgrid.net ~all
   ```

2. **DKIM** - Dapatkan dari email provider Anda dan tambahkan ke DNS

3. **DMARC** - Tambahkan ke DNS Anda:
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@domain-anda.com
   ```

Lihat [docs/ANTI_SPAM_CONFIGURATION.md](docs/ANTI_SPAM_CONFIGURATION.md) untuk instruksi lengkap.

### 5. Verifikasi Konfigurasi

```bash
npm run verify
```

### 6. Kirim Email Test

Edit `examples/send-single-email.js` dan update email penerima, kemudian:

```bash
node examples/send-single-email.js
```

### 7. Test Kualitas Email

1. Kirim test email ke: https://www.mail-tester.com/
2. Cek spam score Anda (target: 10/10)
3. Perbaiki masalah yang teridentifikasi

---

## Common Issues / Masalah Umum

### Email masuk spam / Emails going to spam
- ❌ DNS records (SPF, DKIM, DMARC) tidak dikonfigurasi
- ✅ Solusi: Konfigurasi DNS records sesuai panduan

### Cannot send emails / Tidak bisa kirim email
- ❌ API key atau credentials salah
- ✅ Solusi: Periksa kembali credentials di .env

### Module not found error
- ❌ Package provider belum diinstall
- ✅ Solusi: Install package provider: `npm install @sendgrid/mail`

---

## Next Steps / Langkah Selanjutnya

1. Read full documentation: [README.md](README.md)
2. Understand anti-spam configuration: [docs/ANTI_SPAM_CONFIGURATION.md](docs/ANTI_SPAM_CONFIGURATION.md)
3. Review examples: [examples/](examples/)
4. Use email templates: [templates/](templates/)
5. Test bulk sending: `node examples/send-bulk-emails.js`

## Support

- 📖 Documentation: [README.md](README.md)
- 🛡️ Anti-Spam Guide: [docs/ANTI_SPAM_CONFIGURATION.md](docs/ANTI_SPAM_CONFIGURATION.md)
- 💡 Examples: [examples/](examples/)
