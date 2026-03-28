export interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactSubmission extends ContactForm {
  id: string;
  submittedAt: string;
}
