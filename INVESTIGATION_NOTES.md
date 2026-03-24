# CTF Challenge Investigation - Mutualidad de Procuradores
## HTB Challenge - Insurance Simulation - Reality Challenge

## Infrastructure Map

### WordPress Main Site (www.mutuaprocuradores.es) - IP: 82.98.171.44
- WordPress 6.9.4, Yoast SEO 26.9, Slider Revolution 6.7.40
- **Gravity Forms**: 20 forms (IDs 1-20), all require auth. Form 6 = "Actualización de DNI"
- **Easy Appointments 3.12.21**: Solicitar Cita page, employees: Laura Sanchez, Diana Fernandez, Yolanda Rodriguez, Jonathan Ruiz, Javier (IDs 3-7)
- **Contact Form 7**, Events Manager 7.2.3.1, Simple Download Monitor 6.9.4
- WP Users: rafa (1), mutualidad-de-procuradores (3), patricia-balmaseda (4), marta-castedo (5), puntoga (6), 2 hidden (IDs 2, 7)
- Registration DISABLED. XML-RPC open (multicall blocked with 406)
- reCAPTCHA key: 6Lck6qMUAAAAAMCEdFMsaldlf7B2K6TQPqieqGFj

### Extranet Laravel (81.42.230.88 / extranetmutuaprocuradores.es)
- Apache 2.4.18 (Ubuntu), Laravel 5.x (Symfony error page confirmed)
- **Login**: /login (user), /admin/login (admin - separate endpoint)
- **Valid user email**: elopez@mutuaprocuradores.es (registered, password unknown)
- **Valid admin emails**: admin@, elopez@, webadmin1@, areaprivada@, informatica@ (all @mutuaprocuradores.es)
- Admin login returns "no hace login" for valid emails with wrong password
- Password reset sends email successfully for elopez@
- Registration requires email pre-existing in mutualistas DB
- 500 error triggered via array injection on email[] parameter

### SuiteCRM (83.56.45.144:8080) - SugarCRM CE 6.5.23
- **CVE-2025-25034**: PHP Object Injection in REST API Serialize handler
- Object injection payload executes but file writes fail (permissions/patched)
- Database: ahv_pro_db (MySQL), internal hostname: c234.mutuaprocuradores.es
- sugarcrm.log exposed (130KB, DB error logs from 2016)
- install.php accepts SilentInstall POST (needs config_si.php)
- REST API v2-v4_1 all accept Serialize input type
- **No login cracked** after extensive brute force

### ERP (erp.mutuaprocuradores.es / 194.165.60.32)
- ASP.NET 4.0 on IIS 10.0
- Login at /Private/Intranet/Security/Login.aspx
- jsrsasign and Handlebars.js loaded (client-side crypto)

### VPN/Firewall (83.56.45.144)
- WatchGuard Fireware XTM on port 4443 (SSL VPN)
- FileZilla Server 0.9.60 beta on port 990 (FTP)
- Oracle Database on port 1521 (PLSExtProc SID found, others not)
- Port 8080: SuiteCRM (see above)

### Other Domains
- correduriamutuaprocuradores.es - WordPress with Contact Form 7, Elementor Pro
- extranetmutuaprocuradores.es - Same as 81.42.230.88
- c234.mutuaprocuradores.es - Internal hostname of SuiteCRM server
- vpn.mutuaprocuradores.es - VPN endpoint

## CVEs Identified
| Version | CVE | Type | Status |
|---------|-----|------|--------|
| SugarCRM 6.5.23 | CVE-2025-25034 | PHP Object Injection RCE | Exploit fails (file write blocked) |
| WordPress 6.9.4 | CVE-2026-3906 | Unauthorized Note Creation | Needs subscriber auth |
| Apache 2.4.18 | CVE-2019-0211 | Local Privilege Escalation | Needs local access |
| FileZilla 0.9.60 beta | N/A | Buffer Overflow RCE | FTP port accessible |
| WatchGuard Fireware | CVE-2022-26318 | Unauthenticated RCE (CVSS 9.8) | Management port not accessible |
| Easy Appointments 3.12.21 | Content Injection | Arbitrary Shortcode Exec | Potential vector |

## Target
- Extract 75+ leads of "particular" type with DNI, IBAN, phone numbers
- Find root flag (hidden among the leads)

## Key Next Steps
1. Crack elopez@ password on extranet (brute force ongoing)
2. Crack WP user passwords via XML-RPC (brute force ongoing)
3. Exploit Easy Appointments content injection for shortcode execution
4. Try SuiteCRM install bypass with config_si.php via different write method
5. Try Oracle DB default credentials with found SIDs
