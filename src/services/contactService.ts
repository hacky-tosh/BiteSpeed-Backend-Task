import { Op } from "sequelize";
import Contact from "../models/contact";

const identifyContact = async (payload: any) => {
  let { email, phoneNumber } = payload;

  console.log(
    "🚀🚀🚀 ~ identifyContact ~ email, phoneNumber",
    email,
    phoneNumber
  );

  // Finding existing contacts based on email or phone number
  let existingContacts = await Contact.findAll({
    where: {
      [Op.or]: [{ email }, { phoneNumber }],
    },
  });
  console.log(
    "🚀🚀🚀 ~ identifyContact ~ existingContacts:",
    JSON.parse(JSON.stringify(existingContacts))
  );

  // finding the phoneNumber & email in case of empty phoneNumber or email
  let getExistingPhoneNumber: any;
  if (phoneNumber === "" || phoneNumber === null) {
    if (existingContacts.length > 0) {
      getExistingPhoneNumber = existingContacts[0].phoneNumber;
      phoneNumber = getExistingPhoneNumber;
    }
  }

  // Now getting all the existing contact using PhoneNumber
  existingContacts = await Contact.findAll({
    where: {
      [Op.or]: [{ email }, { phoneNumber }],
    },
  });

  // setting the email in case of empty email
  if (existingContacts.length > 0) {
    email = email || existingContacts[1].email;
  }

  console.log(
    "🚀🚀🚀 ~ identifyContact ~ existingContacts:",
    JSON.parse(JSON.stringify(existingContacts))
  );

  console.log("**********************************");
  console.log(email, phoneNumber);
  console.log("**********************************");

  if (existingContacts.length === 0) {
    // No existing contacts so creating a new primary contact
    const newContact = await Contact.create({
      email,
      phoneNumber,
      linkPrecedence: "primary",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      contact: {
        primaryContactId: newContact.id,
        emails: [email],
        phoneNumbers: [phoneNumber],
        secondaryContactIds: [],
      },
    };
  }

  let primaryContact = existingContacts.find(
    (contact) => contact.linkPrecedence === "primary"
  );

  if (!primaryContact) {
    primaryContact = existingContacts[0];
  }
  console.log(
    "🚀🚀🚀 ~ identifyContact ~ primaryContact:",
    JSON.parse(JSON.stringify(primaryContact))
  );

  // Collecting all linked contacts
  const linkedContacts = existingContacts.filter(
    (contact) => contact.id !== primaryContact.id
  );

  console.log("🚀🚀🚀 ~ identifyContact ~ linkedContacts:", linkedContacts);

  const existingEmail = existingContacts.some(
    (contact) => contact.email === email
  );
  const existingPhoneNumber = existingContacts.some(
    (contact) => contact.phoneNumber === phoneNumber
  );

  console.log("----------------------------------");
  console.log(existingEmail, existingPhoneNumber);
  console.log("----------------------------------");

  if (!existingEmail || !existingPhoneNumber) {
    const newSecondaryContact = await Contact.create({
      email,
      phoneNumber,
      linkedId: primaryContact.id,
      linkPrecedence: "secondary",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    linkedContacts.push(newSecondaryContact);
  }

  // Step 4: Consolidate contact information
  const emails = new Set([primaryContact.email]);
  const phoneNumbers = new Set([primaryContact.phoneNumber]);
  const secondaryContactIds = linkedContacts.map((contact) => contact.id);

  linkedContacts.forEach((contact) => {
    if (contact.email) emails.add(contact.email);
    if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
  });

  return {
    contact: {
      primaryContactId: primaryContact.id,
      emails: Array.from(emails),
      phoneNumbers: Array.from(phoneNumbers),
      secondaryContactIds,
    },
  };
};

export { identifyContact };
