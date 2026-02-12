# Panduan Konfigurasi Email Anti-Spam
# Email Configuration Guide to Avoid Spam Folder

## Konfigurasi DNS (DNS Configuration)

Untuk memastikan email Anda masuk ke inbox dan bukan folder spam, Anda HARUS mengkonfigurasi record DNS berikut:

### 1. SPF (Sender Policy Framework)

SPF menentukan server mana yang diizinkan mengirim email atas nama domain Anda.

**Contoh SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com include:sendgrid.net include:mailgun.org ~all
```

**Penjelasan:**
- `v=spf1`: Versi SPF
- `include:_spf.google.com`: Izinkan Gmail mengirim email
- `include:sendgrid.net`: Izinkan SendGrid mengirim email
- `include:mailgun.org`: Izinkan Mailgun mengirim email
- `~all`: Soft fail untuk email dari server lain

**Custom SPF untuk IP sendiri:**
```
v=spf1 ip4:192.168.1.1 ip6:2001:db8::1 ~all
```

### 2. DKIM (DomainKeys Identified Mail)

DKIM menambahkan signature digital ke email Anda untuk verifikasi autentikasi.

**Langkah-langkah:**

1. Generate DKIM key dari email provider Anda:
   - **SendGrid**: Settings → Sender Authentication → Authenticate Your Domain
   - **Mailgun**: Sending → Domains → Select Domain → Domain Verification
   - **AWS SES**: Identity Management → Domains → Generate DKIM

2. Tambahkan DKIM record ke DNS:
```
Type: TXT
Name: default._domainkey (atau yang diberikan provider)
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (public key dari provider)
```

### 3. DMARC (Domain-based Message Authentication)

DMARC memberitahu server penerima apa yang harus dilakukan jika SPF atau DKIM gagal.

**Contoh DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yourdomain.com; ruf=mailto:dmarc-forensics@yourdomain.com; pct=100
```

**Penjelasan:**
- `p=quarantine`: Karantina email yang gagal verifikasi (gunakan `p=reject` untuk lebih ketat)
- `rua`: Email untuk aggregate reports
- `ruf`: Email untuk forensic reports
- `pct=100`: Terapkan policy ke 100% email

**DMARC untuk production:**
```
v=DMARC1; p=reject; rua=mailto:dmarc@yourdomain.com; adkim=s; aspf=s; pct=100
```

### 4. rDNS (Reverse DNS / PTR Record)

Untuk SMTP server sendiri, pastikan IP address memiliki PTR record yang mengarah ke domain Anda.

**Contoh:**
```
IP: 192.168.1.1
PTR: mail.yourdomain.com
```

## Checklist Konfigurasi DNS

- [ ] SPF record dikonfigurasi dan terverifikasi
- [ ] DKIM keys di-generate dan record ditambahkan
- [ ] DMARC policy dikonfigurasi
- [ ] rDNS/PTR record dikonfigurasi (jika menggunakan SMTP sendiri)
- [ ] Verifikasi semua record menggunakan tools:
  - https://mxtoolbox.com/SuperTool.aspx
  - https://dmarcian.com/dmarc-inspector/
  - https://www.mail-tester.com/

## Best Practices Tambahan

### 1. Domain Reputation
- Gunakan dedicated domain untuk transactional emails
- Jangan gunakan free email providers (gmail.com, yahoo.com) sebagai sender
- Warm-up domain baru secara bertahap (mulai dari volume kecil)

### 2. Email Content
- Selalu sertakan versi plain text
- Hindari kata-kata spam: "FREE", "WIN", "GUARANTEED", dll.
- Jaga rasio text-to-image balanced (60:40)
- Hindari attachment yang mencurigakan
- Gunakan proper HTML structure

### 3. List Management
- Implementasi double opt-in
- Sediakan easy unsubscribe mechanism
- Bersihkan email list secara regular
- Jangan kirim ke purchased/scraped lists

### 4. Email Headers
- Set proper Reply-To header
- Tambahkan List-Unsubscribe header
- Gunakan consistent From name dan email
- Set proper Message-ID

### 5. Sending Patterns
- Hindari sending spikes yang tiba-tiba
- Implementasi rate limiting
- Batasi retry attempts
- Monitor bounce rates dan complaint rates

## Verifikasi Konfigurasi

### Test dengan Mail-Tester
```bash
# Kirim test email ke alamat yang diberikan mail-tester.com
# Cek score (target: 10/10)
```

### Monitor Blacklists
Regularly check jika domain/IP ada di blacklist:
- https://mxtoolbox.com/blacklists.aspx
- https://multirbl.valli.org/

### Track Metrics
Monitor metrics berikut:
- **Delivery Rate**: Target > 95%
- **Open Rate**: Benchmark ~20-25%
- **Bounce Rate**: Keep < 5%
- **Spam Complaint Rate**: Keep < 0.1%
- **Unsubscribe Rate**: Keep < 0.5%

## Tools untuk Testing

1. **Mail-Tester**: https://www.mail-tester.com/
2. **MXToolbox**: https://mxtoolbox.com/
3. **Google Postmaster Tools**: https://postmaster.google.com/
4. **Microsoft SNDS**: https://sendersupport.olc.protection.outlook.com/snds/

## Troubleshooting

### Email masuk spam?
1. Cek SPF/DKIM/DMARC configuration
2. Test dengan mail-tester.com
3. Periksa content untuk spam triggers
4. Cek reputation di Google Postmaster Tools
5. Verify domain tidak di blacklist

### Bounce rate tinggi?
1. Validate email addresses sebelum kirim
2. Implementasi double opt-in
3. Clean list secara regular
4. Monitor hard bounces vs soft bounces

### Low open rates?
1. Improve subject lines
2. Optimize send time
3. Segment audience
4. A/B testing
5. Clean inactive subscribers
