export function camelCase (str: string, firstCapital: boolean = false): string {
  return str.replace(/^([A-Z])|[\s-_](\w)/g, (match, p1, p2, offset) => {
    if (firstCapital === true && offset === 0) { return p1; }
    if (p2) { return p2.toUpperCase(); }
    return p1.toLowerCase();
  });
}

export function snakeCase (str: string) {
  return str.replace(/(?:([a-z])([A-Z]))|(?:((?!^)[A-Z])([a-z]))/g, '$1_$3$2$4').toLowerCase();
}

export function titleCase (str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}


export function abbreviate (str: string, abbrLettersCount: number = 1): string {
  const words = str.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2').split(' ');
  return words.reduce((res, word) => {
    res += word.substr(0, abbrLettersCount);
    return res;
  }, '');
}
