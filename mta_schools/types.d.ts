interface I_SchoolStaff {
  user_id: number;
  name: string;
}

interface I_School {
  name: string;
  district: string;
  school_staff: Array<I_SchoolStaff>;
  contact_email: string;
}