export const getCookie = (name: string, cookies: any[string]) => {
    for (const cookie of cookies) {
        if (!cookie.includes(name)) {
            continue;
        }

        return cookie.split(';')[0].split('=')[1];
    }
};

