export const getCookie = (name: string, headers: any[string]) => {
    for (const cookie of headers['set-cookie']) {
        if (!cookie.includes(name)) {
            continue;
        }

        return cookie.split(';')[0].split('=')[1];
    }
};

