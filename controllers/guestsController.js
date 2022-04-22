const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
let handlebars = require("handlebars");
let fs = require("fs");
let path = require("path");
var AWS = require("aws-sdk"),
  region = "us-east-1",
  secretName = "wedding/emailCreds",
  secret,
  decodedBinarySecret;

const Guest = require("../models/guest");

router.get("/", (req, res) => {
  Guest.find()
    .then((guests) => {
      res.json(guests);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/", (req, res) => {
  Guest.create(req.body)
    .then((newGuest) => {
      sendEmail(newGuest.Email, "Faris & Dahlia's Wedding", {
        FirstName: newGuest.FirstName,
        isAttending: newGuest.isAttending,
        Qty: newGuest.Qty,
        rooms: newGuest.rooms,
      });
      res.redirect("http://localhost:3000/guests");
    })
    .catch((err) => {
      res.json(err);
    });
});

router.put("/:id", (req, res) => {
  Guest.findById(req.params.id)
    .then((updatedGuest) => {
      updatedGuest.set(req.body);
      updatedGuest.save();
      res.json(updatedGuest);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.delete("/:id", (req, res) => {
  Guest.findByIdAndDelete(req.params.id)
    .then(() => {
      Guest.find().then((guests) => {
        res.json(guests);
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

async function sendEmail(email, subject, replacements) {
  let filePath = 0;
  switch (replacements.isAttending) {
    case "Attending": {
      filePath = path.join(__dirname, "../views/attending.html");
      break;
    }
    case "Not Attending": {
      filePath = path.join(__dirname, "../views/notAttending.html");
      break;
    }
    case "Maybe": {
      filePath = path.join(__dirname, "../views/maybe.html");
      break;
    }
  }

  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const htmlToSend = template(replacements);

  var client = new AWS.SecretsManager({
    region: region,
  });

  client.getSecretValue({ SecretId: secretName }, function (err, data) {
    if (err) {
      if (err.code === "DecryptionFailureException")
        // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err;
      else if (err.code === "InternalServiceErrorException")
        // An error occurred on the server side.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err;
      else if (err.code === "InvalidParameterException")
        // You provided an invalid value for a parameter.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err;
      else if (err.code === "InvalidRequestException")
        // You provided a parameter value that is not valid for the current state of the resource.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err;
      else if (err.code === "ResourceNotFoundException")
        // We can't find the resource that you asked for.
        // Deal with the exception here, and/or rethrow at your discretion.
        throw err;
    } else {
      // Decrypts secret using the associated KMS key.
      // Depending on whether the secret is a string or binary, one of these fields will be populated.
      if ("SecretString" in data) {
        secret = data.SecretString;
      } else {
        let buff = new Buffer(data.SecretBinary, "base64");
        decodedBinarySecret = buff.toString("ascii");
      }
    }
    const secretJSON = JSON.parse(secret);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: secretJSON.user,
        pass: secretJSON.pass,
      },
    });

    const mailOptions = {
      from: "farisanddahlia@gmail.com",
      to: email,
      subject: subject,
      text: "text",
      html: htmlToSend,
    };
    const info = transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", "https://mailtrap.io/inboxes/test/messages/");
  });
}

module.exports = router;
