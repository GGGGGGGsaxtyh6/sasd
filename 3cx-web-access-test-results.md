# 3CX Web Access Test Results

**Date:** March 25, 2026
**Tested by:** Autonomous Cloud Agent

## Summary

Testing web access to 3CX phone system instance 1156 (IP: 161.35.194.173)

## Test Results

### 1. https://1156.3cx.cloud
**Status:** ✅ ACCESSIBLE
**Result:** Successfully loaded the 3CX Webclient login page
- Displays "3CX" branding with blue logo
- "SIGN IN WITH Google" option available
- Email or Extension Number field
- Password field
- Blue "Login" button
- "Forgot password?" link
- URL automatically redirects to `https://1156.3cx.cloud/#/login`

### 2. https://1156.3cx.cloud/#/login
**Status:** ✅ ACCESSIBLE
**Result:** Successfully loaded the same 3CX Webclient login page
- Identical to the first URL test
- Shows the same login interface with all authentication options
- This is the direct login endpoint

### 3. https://1156.3cx.cloud:5015
**Status:** ❌ NOT ACCESSIBLE
**Result:** Connection failed
- Error: "This site can't be reached"
- Error message: "The connection was reset"
- Error code: ERR_CONNECTION_RESET
- Port 5015 (typical 3CX management console port) is not accessible from the internet
- This is expected behavior as management consoles are often restricted for security

### 4. https://161.35.194.173
**Status:** ⚠️ SSL CERTIFICATE ERROR
**Result:** Privacy/Security error
- Error: "Your connection is not private"
- Error code: NET::ERR_CERT_COMMON_NAME_INVALID
- The server is responding but has an invalid SSL certificate for direct IP access
- This is expected when accessing via IP instead of the proper hostname
- The certificate is likely issued for the domain name (1156.3cx.cloud) not the IP address

## Conclusions

1. **3CX Webclient is fully accessible** via the domain name https://1156.3cx.cloud
2. **User login portal is working** and properly redirects to the login page
3. **Management console (port 5015) is not publicly accessible** - this is a good security practice
4. **Direct IP access has SSL certificate issues** - users should access via the domain name instead

## Recommendations

- Users should access the system via https://1156.3cx.cloud (the proper domain)
- Do not use direct IP access (161.35.194.173) as it causes SSL certificate warnings
- Management console access (port 5015) likely requires VPN or other secure access method
- The web client is functioning correctly and ready for user authentication
