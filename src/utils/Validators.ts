const emailTest: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

export const isEmailValid = (email: string) => {
  return !isEmpty(email) && emailTest.test(email)
}


// const passwordStrenghtTest = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
const passwordStrenghtTest = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})');

export const isPasswordStrenght = (password: string) => {
  return !isEmpty(password) && passwordStrenghtTest.test(password)
}


export const isEmpty = (value: any): boolean => {
  return value === '' || value === null || value === undefined;
}

export const isNullOrUndefined = <T> (obj: T | null | undefined): obj is null | undefined => {
  return typeof obj === 'undefined' || obj === null;
};
