import Contact from "../models/contact";
import { Op } from "sequelize";

interface ContactPayload {
  email?: string;
  phoneNumber?: string;
}

export const identifyContact = async (payload: ContactPayload) => {
  console.log("🚀🚀🚀 ~ identifyContact ~ payload:", payload);

  let { email, phoneNumber } = payload;
  phoneNumber = phoneNumber || "";
  email = email || "";

  // finding existing contacts with email or phone number
  const existingContacts = await Contact.findAll({
    where: {
      [Op.or]: [{ email }, { phoneNumber }],
    },
  });

  // If there is no existing contact then creating new contact and return
  if (existingContacts.length === 0) {
    console.log("🚀 ~ Line 20 ~  :  ");
    const newContact = await Contact.create({
      email,
      phoneNumber,
      linkPrecedence: "primary",
    });

    return {
      primaryContactId: newContact.id,
      emails: [newContact.email],
      phoneNumbers: [newContact.phoneNumber],
      secondaryContactIds: [],
    };
  }

  // If there is existing contact then finding primary contact
  let primaryContact =
    existingContacts.find((contact) => contact.linkPrecedence === "primary") ||
    existingContacts[0];
  primaryContact = primaryContact.toJSON();

  // finding all linked contacts spacially in case where phoneNumber is null and findign via secondry email
  const fetchAllLinkedContacts = async (primaryContact: any) => {
    let allContacts = [primaryContact];
    let contactsToProcess = [primaryContact];

    while (contactsToProcess.length > 0) {
      const currentContact = contactsToProcess.pop();

      const linkedContacts = await Contact.findAll({
        where: {
          [Op.or]: [
            { linkedId: currentContact.id },
            { id: currentContact.linkedId },
          ],
        },
      });

      for (const linkedContact of linkedContacts) {
        if (!allContacts.find((c) => c.id === linkedContact.id)) {
          allContacts.push(linkedContact);
          contactsToProcess.push(linkedContact);
        }
      }
    }

    return allContacts;
  };

  const allContacts = await fetchAllLinkedContacts(primaryContact);

  // creating set of emails, phoneNumbers and secondaryContactIds
  const emails = new Set();
  const phoneNumbers = new Set();
  const secondaryContactIds = [];

  for (const contact of allContacts) {
    if (contact.email) emails.add(contact.email);
    if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
    if (contact.id !== primaryContact.id) secondaryContactIds.push(contact.id);
  }

  return {
    contact: {
      primaryContactId: primaryContact.id,
      emails: Array.from(emails),
      phoneNumbers: Array.from(phoneNumbers),
      secondaryContactIds,
    },
  };
};
