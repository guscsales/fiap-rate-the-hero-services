export default function normalizeString(
  value: string,
  whiteSpaceReplace = '-',
) {
  const alphabetSpecialChars = 'àáäâãèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
  const alphabetCommonChars = 'aaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';

  const normalizedValue = value
    .trim()
    .toLowerCase()
    .trim()
    .replace(/ /g, whiteSpaceReplace)
    .replace(/--/g, '-')
    .replace(/[&/\\#,+()$~%.'":*?<>{}\[\]]/g, '')
    .replace(new RegExp(alphabetSpecialChars.split('').join('|'), 'g'), (c) =>
      alphabetCommonChars.charAt(alphabetSpecialChars.indexOf(c)),
    );

  return normalizedValue;
}
