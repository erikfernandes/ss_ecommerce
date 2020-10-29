const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/user');


const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "ee170c5ec3c384",
    pass: "f85e565722fb0c"
  }
});

exports.getLogin = (req, res, next) => {
  // Gets error message from flash if it exists, otherwise sets error to null
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne( {email: email})
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid Email/Password Combination')
        return res.redirect('/login');
      }
      // compare pw input with hashed pw in db, returns true/false
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/')
            });
          }
          req.flash('error', 'Invalid Email/Password Combination')
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        })
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({email: email})
    .then(userDoc => {
      if (userDoc) {
        req.flash('error', 'Email Already Exists')
        return res.redirect('/signup');
      } 
      // Encrypt password using bcrypt
      return bcrypt.hash(password, 12)
        .then(hashedPass => {
          const user = new User({
            email: email,
            password: hashedPass,
            cart: { items: [] },
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          return transporter.sendMail({
            to: 'recipient email',
            from: 'sender email',
            subject: 'Sign Up Succeeded',
            html: '<h1>You successfully signed up</h1>',
          })
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getForgotPassword= (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/forgot-password', {
    path: '/forgot-password',
    pageTitle: 'Reset Password',
    errorMessage: message,
  });
};

exports.postForgotPassword = (req, res, next) => {
  // create random token
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/forgot-password');
    }
    // convert hex buffer to string
    const token = buffer.toString('hex');
    // Check for user in db, set token fields for user
    User
      .findOne( {email: req.body.email})
      .then(user => {
        if (!user) {
          req.flash('error', 'Email Account Not Found');
          return res.redirect('/forgot-password');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      // Send password reset email 
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'sender email',
          subject: 'Password Reset',
          html: `
            <p>You Requested A Password Reset</p>
            <p>Click <a href="http://localhost:3000/reset-password/${token}">this link</a> to set a new password</p>
          `,
        })
      })
      .catch(err => console.log(err));
  });
}

exports.getResetPassword = (req, res, next) => {
  const token = req.params.token;
  // Find user in db with matching and valid token
  User.findOne( {resetToken: token, resetTokenExpiration: {$gt: Date.now()}} )
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/reset-password', {
        path: '/reset-password',
        pageTitle: 'Reset Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch(err => console.log(err));
};

exports.postResetPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User
    .findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPass => {
      resetUser.password = hashedPass;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save()
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => console.log(err));
};

