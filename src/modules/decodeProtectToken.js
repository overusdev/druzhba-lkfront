import { symbolsTemplate } from './symbolsTemplate';

export function decodeProtectToken({ apiToken }) {
    let result = [];
    const splitedToken = apiToken.split("");
    splitedToken.forEach((num1) => {;
        const num2 = symbolsTemplate.find(item => item[num1]);
        result.push(Object.values(num2));
    });

    return result.map(item => item).join('');
}