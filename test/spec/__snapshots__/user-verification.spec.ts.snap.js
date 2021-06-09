exports[`User Verification : Sign up : should set verification fields 1`] = {
  "_id": "${_id}",
  "emailVerified": false,
  "emailVerification": {
    "token": "${emailVerification.token}",
    "expires": "${emailVerification.expires}"
  }
};
exports[`User Verification : Sign up : should send verification email with token 1`] = [
  {
    "to": "${to[0]}",
    "from": "no-reply@lc.cadenzasoft.dev",
    "subject": "Welcome to LS - User account activation",
    "html": "<!DOCTYPE html>\n<html lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\">\n\n<head>\n</head>\n\n<body dir=\"LTR\">\n\t<p>Your user account with the e-mail address ${<REPLACED>[0]} has been created.</p>\n\t<p>Please follow the link below to verify your email address.\n\tClick <a href=\"http://api-backend.herokuapp.com/verify-email?token=${<REPLACED>[0]}\">here</a>\n\t<br/>\n\t<p>This email was sent to you because someone entered your email in LS app.\n\t</p>\n</body>\n\n</html>\n"
  }
];
exports[`User Verification : Resend verification email : not verified user : should set verification fields 1`] = {
  "_id": "${_id}",
  "emailVerified": false,
  "emailVerification": {
    "token": "${emailVerification.token}",
    "expires": "${emailVerification.expires}"
  }
};
exports[`User Verification : Resend verification email : not verified user : should send verification email with token 1`] = [
  {
    "to": "${to[0]}",
    "from": "no-reply@lc.cadenzasoft.dev",
    "subject": "Welcome to LS - User account activation",
    "html": "<!DOCTYPE html>\n<html lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\">\n\n<head>\n</head>\n\n<body dir=\"LTR\">\n\t<p>Your user account with the e-mail address ${<REPLACED>[0]} has been created.</p>\n\t<p>Please follow the link below to verify your email address.\n\tClick <a href=\"http://api-backend.herokuapp.com/verify-email?token=${<REPLACED>[0]}\">here</a>\n\t<br/>\n\t<p>This email was sent to you because someone entered your email in LS app.\n\t</p>\n</body>\n\n</html>\n"
  }
];
exports[`User Verification : Resend verification email : verified user : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "This user already verified email address",
  "details": {
    "rule": "AlreadyVerified"
  }
};
exports[`User Verification : Verify email : with expired token : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "The token is wrong",
  "details": {
    "rule": "WrongToken"
  }
};
exports[`User Verification : Verify email : with wrong token : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "The token is wrong",
  "details": {
    "rule": "WrongToken"
  }
};
