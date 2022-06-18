# Download the helper library from https://github.com/twilio/authy-python
from authy.api import AuthyApiClient

# Your API key from twilio.com/console/authy/applications
# DANGER! This is insecure. See http://twil.io/secure
authy_api = AuthyApiClient('VBLvLnTJXGPBOOIaOgyqEh294tAl26Vp')

user = authy_api.users.create(
    email='vinesh.jana@hotmail.com',
    phone='262-442-8111',
    country_code=1)

if user.ok():
    print(user.id)
    # user.id is the `authy_id` needed for future requests
else:
	print(user.errors())