import type { SuperviseeFormValues, SupervisorFormValues } from './schema'

export const supervisorDefaultValues: Partial<SupervisorFormValues> = {
  license: '',
  contactNumber: '',
  yearOfExperience: '',
  npiNumber: '',
  expiration: '',
  certification: '',
  patientPopulation: '',
  cityStateZipcode: '',
}

export const superviseeDefaultValues: SuperviseeFormValues = {
  typeOfSupervisor: '',
  supervisorDescription: '',
  cityStateZipcode: '',
  howSoon: '',
}
