const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
let handlebars = require("handlebars");
let fs = require("fs");
let path = require("path");

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
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: client.user,
      pass: client.pass,
    },
  });
  const mailOptions = {
    from: "farisanddahlia@gmail.com",
    to: email,
    subject: subject,
    text: "text",
    html: htmlToSend,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", "https://mailtrap.io/inboxes/test/messages/");
}

module.exports = router;
