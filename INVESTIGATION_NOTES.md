# CTF Challenge Investigation - Mutualidad de Procuradores

## Infrastructure Map

### WordPress Main Site (www.mutuaprocuradores.es)
- IP: 82.98.171.44 (DinaHosting)
- WordPress 6.9.4, Yoast SEO 26.9, Slider Revolution 6.7.40
- Plugins: Gravity Forms, Events Manager, Contact Form 7, Easy Appointments, Simple Download Monitor, Code Snippets
- Users: rafa (ID 1), mutualidad-de-procuradores (3), patricia-balmaseda (4), marta-castedo (5), puntoga (6)
- Registration disabled, XML-RPC open (multicall blocked)

### Extranet Laravel (81.42.230.88)
- Apache 2.4.18 (Ubuntu), Laravel 5.x
- Login at /login, Registration at /register, Admin login at /admin/login
- Valid email: elopez@mutuaprocuradores.es (account already registered)
- Admin endpoint: admin@mutuaprocuradores.es returns "no hace login" (valid admin email)
- Password reset works for elopez

### SuiteCRM/SugarCRM (83.56.45.144:8080)
- SugarCRM CE 6.5.23 (vulnerable to CVE-2025-25034 PHP Object Injection)
- Database: ahv_pro_db (MySQL)
- Internal hostname: c234.mutuaprocuradores.es
- sugarcrm.log exposed (130KB)
- install.php partially accessible (accepts SilentInstall)
- Object injection payload sends but file writes fail (possible directory permissions)

### ERP (erp.mutuaprocuradores.es / 194.165.60.32)
- ASP.NET 4.0 on IIS 10.0
- Login at /Private/Intranet/Security/Login.aspx

### VPN/Firewall (83.56.45.144)
- WatchGuard Fireware XTM on port 4443
- FileZilla FTP on port 990
- Oracle Database on port 1521 (SID not found)
- All TCP ports appear open (firewall behavior)

### Other
- correduriamutuaprocuradores.es - Another WordPress site
- extranetmutuaprocuradores.es - Same as 81.42.230.88

## Target
- Extract 75+ leads of "particular" type with DNI, IBAN, phone numbers, etc.
- Find root flag (hidden among the leads)

## Current Status
- Need to bypass authentication on extranet or SuiteCRM to access leads
- elopez@mutuaprocuradores.es is the only confirmed valid user on extranet
