export function getUrlHost(url: string) {
    return url.match(/^(.*?:\/{2,3})?(.+?)(\/|$)/)[2];
}

/**
 * Determines whether URL has a match in URL template list.
 * @param url Site URL.
 * @paramlist List to search into.
 */
export function isUrlInList(url: string, list: string[]) {
    for (let i = 0; i < list.length; i++) {
        if (isUrlMatched(url, list[i])) {
            console.log(`URL ${url} is in list`);
            return true;
        }
    }
    return false;
}

/**
 * Determines whether URL matches the template.
 * @param url URL.
 * @param urlTemplate URL template ("google.*", "youtube.com" etc).
 */
export function isUrlMatched(url: string, urlTemplate: string): boolean {
    const regex = createUrlRegex(urlTemplate);
    return Boolean(url.match(regex));
}

function createUrlRegex(urlTemplate: string): RegExp {
    urlTemplate = urlTemplate.trim();
    const exactBeginning = (urlTemplate[0] === '^');
    const exactEnding = (urlTemplate[urlTemplate.length - 1] === '$');

    urlTemplate = (urlTemplate
        .replace(/^\^/, '') // Remove ^ at start
        .replace(/\$$/, '') // Remove $ at end
        .replace(/^.*?\/{2,3}/, '') // Remove scheme
        .replace(/\?.*$/, '') // Remove query
        .replace(/\/$/, '') // Remove last slash
    );

    let slashIndex: number;
    let beforeSlash: string;
    let afterSlash: string;
    if ((slashIndex = urlTemplate.indexOf('/')) >= 0) {
        beforeSlash = urlTemplate.substring(0, slashIndex); // google.*
        afterSlash = urlTemplate.replace('$', '').substring(slashIndex); // /login/abc
    } else {
        beforeSlash = urlTemplate.replace('$', '');
    }

    //
    // SCHEME and SUBDOMAINS

    let result = (exactBeginning ?
        '^(.*?\\:\\/{2,3})?' // Scheme
        : '^(.*?\\:\\/{2,3})?([^\/]*?\\.)?' // Scheme and subdomains
    );

    //
    // HOST and PORT

    const hostParts = beforeSlash.split('.');
    result += '(';
    for (let i = 0; i < hostParts.length; i++) {
        if (hostParts[i] === '*') {
            hostParts[i] = '[^\\.\\/]+?';
        }
    }
    result += hostParts.join('\\.');
    result += ')';

    //
    // PATH and QUERY

    if (afterSlash) {
        result += '(';
        result += afterSlash.replace('/', '\\/');
        result += ')';
    }

    result += (exactEnding ?
        '(\\/?(\\?[^\/]*?)?)$' // All following queries
        : '(\\/?.*?)$' // All following paths and queries
    );

    //
    // Result

    return new RegExp(result, 'i');
}
