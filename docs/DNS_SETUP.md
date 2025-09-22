# 🌐 TGPS Payroll System - DNS Configuration Guide

## GoDaddy DNS Configuration

### 1. Login to GoDaddy
1. Visit https://www.godaddy.com
2. Click "Sign In"
3. Enter your credentials

### 2. Access DNS Settings
1. Click "My Products"
2. Find your domain (tgps.com)
3. Click "DNS" or "Manage DNS"

### 3. Add DNS Records

#### Add A Record
```
Type: A
Name: payroll
Value: YOUR_VULTR_IP
TTL: 600 seconds
```

#### Add CNAME Record (Optional Backup)
```
Type: CNAME
Name: payroll-backup
Value: payroll.tgps.com
TTL: 1 hour
```

### 4. Verify DNS Settings
1. Wait 5-10 minutes for propagation
2. Open terminal/command prompt
3. Run: `nslookup payroll.tgps.com`
4. Verify IP matches Vultr server

## Domain Verification Process

### 1. Initial Check
```bash
# Check DNS propagation
dig payroll.tgps.com

# Check A record
dig payroll.tgps.com A

# Check HTTPS
curl -vI https://payroll.tgps.com
```

### 2. SSL Verification
1. Visit https://payroll.tgps.com
2. Click padlock icon in browser
3. Verify certificate details:
   - Issued to: payroll.tgps.com
   - Issued by: Let's Encrypt
   - Valid dates

### 3. Testing Steps

#### Basic Connectivity
1. Visit http://payroll.tgps.com
   - Should redirect to HTTPS
   - Should load login page

2. Visit https://payroll.tgps.com
   - Should load securely
   - Should show valid certificate

#### Employee Portal
1. Visit https://payroll.tgps.com/employee
   - Should load mobile portal
   - Should be responsive

#### Admin Access
1. Visit https://payroll.tgps.com/login
   - Should load admin login
   - Should accept credentials

## Troubleshooting Guide

### DNS Issues

#### Cannot Resolve Domain
```bash
# Check DNS propagation
dig payroll.tgps.com

# Verify local DNS
nslookup payroll.tgps.com 8.8.8.8
```

#### SSL Certificate Issues
```bash
# Manual SSL verification
openssl s_client -connect payroll.tgps.com:443
```

#### Common Problems

1. **DNS Not Propagated**
   - Wait 5-10 minutes
   - Clear DNS cache
   - Try different DNS server

2. **SSL Not Working**
   - Verify A record
   - Check certificate
   - Renew if needed

3. **Cannot Access Site**
   - Check firewall
   - Verify Nginx
   - Check application logs

## Quick Reference

### DNS Records
```
A Record:
payroll.tgps.com → YOUR_VULTR_IP

CNAME Record (Optional):
payroll-backup.tgps.com → payroll.tgps.com
```

### Important Commands
```bash
# Check DNS
dig payroll.tgps.com

# Verify SSL
curl -vI https://payroll.tgps.com

# Check server
ping payroll.tgps.com
```

### Support Contacts
```
Technical Support:
Email: support@tgps.com
Phone: +63 xxx xxx xxxx

GoDaddy Support:
Login to GoDaddy account
Click Help/Support
```

## Final Checklist

### DNS Setup
- [ ] Login to GoDaddy
- [ ] Add A record
- [ ] Add CNAME (optional)
- [ ] Verify propagation

### SSL Verification
- [ ] Check HTTPS
- [ ] Verify certificate
- [ ] Test redirection

### Application Access
- [ ] Test admin portal
- [ ] Test employee portal
- [ ] Verify mobile access

### Security
- [ ] HTTPS only
- [ ] Valid certificate
- [ ] Proper redirection
- [ ] Secure headers

Once all items are checked, your domain is properly configured for the TGPS Payroll System!
