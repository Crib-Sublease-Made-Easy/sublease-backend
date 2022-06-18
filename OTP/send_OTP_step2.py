# Download the helper library from https://github.com/twilio/authy-python
from authy.api import AuthyApiClient

# Your API key from twilio.com/console/authy/applications
# DANGER! This is insecure. See http://twil.io/secure
authy_api = AuthyApiClient('VBLvLnTJXGPBOOIaOgyqEh294tAl26Vp')

sms = authy_api.users.request_sms(140142053)

if sms.ok():
    print(sms.content)